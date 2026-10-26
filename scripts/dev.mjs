import { spawn } from "node:child_process";
const children = [
  spawn(process.execPath, ["server/index.mjs"], {
    stdio: "inherit",
    env: {
      ...process.env,
      API_PORT: "4062",
      DEV_ORIGIN: "http://127.0.0.1:5173",
    },
  }),
  spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      "--host",
      "127.0.0.1",
      ...process.argv.slice(2),
    ],
    { stdio: "inherit" },
  ),
];
let closing = false;
function close(code = 0) {
  if (closing) return;
  closing = true;
  children.forEach((p) => p.kill("SIGTERM"));
  process.exitCode = code;
}
children.forEach((p) => {
  p.on("error", () => close(1));
  p.on("exit", (code) => close(code || 0));
});
process.on("SIGINT", () => close());
process.on("SIGTERM", () => close());
