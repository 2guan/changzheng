import http from "node:http";
import { stat } from "node:fs/promises";
import { createGzip } from "node:zlib";
import { createReadStream, existsSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { once } from "node:events";
import { audioChunks, ttsRequest } from "./tts.mjs";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const root = resolve(process.env.STATIC_ROOT || "dist");
const port = Number(process.env.API_PORT || 4061);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".ico": "image/x-icon",
};
let active = 0;
const clients = new Map();
function withinRate(address) {
  const now = Date.now();
  for (const [ip, entry] of clients)
    if (now - entry.since > 60000) clients.delete(ip);
  if (!clients.has(address)) {
    if (clients.size >= 2000) return false;
    clients.set(address, { since: now, count: 0 });
  }
  return ++clients.get(address).count <= 30;
}
const json = (res, status, data) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
};
http
  .createServer(async (req, res) => {
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname === "/healthz") {
      res.end("ok");
      return;
    }
    if (pathname === "/api/tts" && req.method === "POST") {
      if (
        req.headers.origin &&
        ![
          "http://" + req.headers.host,
          "https://" + req.headers.host,
          process.env.DEV_ORIGIN,
        ].includes(req.headers.origin)
      )
        return json(res, 403, { error: "请求来源不匹配。" });
      if (!process.env.MIMO_API_KEY)
        return json(res, 503, {
          error: "尚未配置讲解服务，请在服务器设置 MIMO_API_KEY。",
        });
      if (!withinRate(req.socket.remoteAddress))
        return json(res, 429, { error: "讲解请求较频繁，请稍等一分钟再试。" });
      if (active >= 4)
        return json(res, 429, { error: "讲解服务正忙，请稍后再试。" });
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);
      res.on("close", () => controller.abort());
      let counted = false;
      try {
        let raw = "";
        for await (const chunk of req) {
          raw += chunk;
          if (Buffer.byteLength(raw) > 16000) {
            json(res, 413, { error: "文字过长，请分段朗读。" });
            return;
          }
        }
        const { text } = JSON.parse(raw);
        if (typeof text !== "string" || !text.trim() || text.length > 2200)
          return json(res, 400, { error: "请提供不超过 2200 字的讲解文字。" });
        active++;
        counted = true;
        const upstream = await fetch(
          "https://token-plan-cn.xiaomimimo.com/v1/chat/completions",
          {
            method: "POST",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.MIMO_API_KEY}`,
            },
            body: JSON.stringify(ttsRequest(text)),
          },
        );
        if (!upstream.ok) {
          console.error("MiMo response status:", upstream.status);
          return json(res, 502, {
            error:
              upstream.status === 401
                ? "讲解服务认证失败，请检查服务器密钥。"
                : "讲解服务暂时不可用，请稍后重试。",
          });
        }
        res.writeHead(200, {
          "Content-Type": "application/octet-stream",
          "Cache-Control": "no-store",
          "X-Audio-Sample-Rate": "24000",
          "X-Accel-Buffering": "no",
        });
        res.flushHeaders();
        let total = 0;
        for await (const bytes of audioChunks(upstream.body)) {
          total += bytes.length;
          if (!res.write(bytes))
            await once(res, "drain", { signal: controller.signal });
        }
        if (!total) throw new Error("No audio");
        res.end();
      } catch (error) {
        if (!res.headersSent)
          json(res, 502, { error: "讲解连接中断，请重试。" });
        else res.destroy();
      } finally {
        clearTimeout(timeout);
        if (counted) active--;
      }
      return;
    }
    if (pathname.startsWith("/api/"))
      return json(res, 404, { error: "接口不存在" });
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405);
      res.end();
      return;
    }
    try {
      let file = resolve(root, "." + decodeURIComponent(pathname));
      if (file !== root && !file.startsWith(root + sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      let info = await stat(file).catch(() => null);
      if (!info?.isFile()) {
        if (extname(pathname)) {
          res.writeHead(404);
          res.end();
          return;
        }
        file = resolve(root, "index.html");
        info = await stat(file);
      }
      const headers = {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": pathname.startsWith("/assets/")
          ? "public, max-age=0, must-revalidate"
          : "no-cache",
        "Accept-Ranges": "bytes",
        ETag: `"${info.size.toString(16)}-${Math.trunc(info.mtimeMs).toString(16)}"`,
        "Last-Modified": info.mtime.toUTCString(),
      };
      if (req.headers["if-none-match"] === headers.ETag) {
        res.writeHead(304, headers);
        res.end();
        return;
      }
      const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      let start = 0,
        end = info.size - 1;
      if (range) {
        start = Number(range[1]);
        end = range[2] ? Math.min(Number(range[2]), end) : end;
      }
      if (start > end || start >= info.size) {
        res.writeHead(416, { "Content-Range": `bytes */${info.size}` });
        res.end();
        return;
      }
      const compress =
        !range &&
        /gzip/.test(req.headers["accept-encoding"] || "") &&
        [".html", ".js", ".css", ".json", ".svg"].includes(extname(file));
      if (compress) {
        headers["Content-Encoding"] = "gzip";
        headers["Vary"] = "Accept-Encoding";
      } else headers["Content-Length"] = end - start + 1;
      if (range)
        headers["Content-Range"] = `bytes ${start}-${end}/${info.size}`;
      res.writeHead(range ? 206 : 200, headers);
      if (req.method === "HEAD") res.end();
      else {
        const stream = createReadStream(file, { start, end });
        if (compress) stream.pipe(createGzip()).pipe(res);
        else stream.pipe(res);
        res.on("close", () => stream.destroy());
        stream.on("error", () => res.destroy());
      }
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  })
  .listen(port, process.env.API_HOST || "127.0.0.1", () =>
    console.log(`长征服务已启动，端口 ${port}`),
  );
