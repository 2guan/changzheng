# 重走长征路 · Docker 部署

目标服务器：Linux x86_64（Docker 平台名称 `linux/amd64`）。默认访问端口为 **4061**，镜像名称为 `changzheng:2026.10.26.4`。所有网页、图片、字体和互动资源均包含在镜像内；运行不依赖在线构建服务、数据库或外部素材服务。白桦流式讲解通过本地 Node 服务调用小米 TTS，需要服务器联网。

## 使用已打包镜像（推荐）

将 `release/` 下的以下文件上传到服务器同一目录：

- `changzheng-2026.10.26.4-linux-amd64.tar.gz`
- `compose.yaml`
- `SHA256SUMS`
- `.env.local.example`

将 `.env.local.example` 复制为 `.env.local`，填入你的密钥，然后执行 `chmod 600 .env.local`。密钥不包含在镜像和发布包中。未配置时网页和本地音乐正常使用，讲解会提示尚未配置。

进入该目录，执行：

```sh
sha256sum -c SHA256SUMS
docker load -i changzheng-2026.10.26.4-linux-amd64.tar.gz
docker compose up -d --no-build --pull never
docker compose ps
curl -fsS http://127.0.0.1:4061/healthz
```

浏览器打开 `http://服务器IP:4061/`。如果服务器有安全组或防火墙，需允许 TCP 4061 入站。

`compose.yaml` 默认将宿主机 4061 映射到容器 4061，需要 Docker Compose 2.24 或更新版本（支持可选 env_file）。设置自动重启、日志轮转、非 root 用户和只读根文件系统。站点不需要数据卷。

## 发言人与演绎提示词

在 `.env.local` 中配置：

```dotenv
MIMO_API_KEY=你的小米MiMo密钥
MIMO_TTS_VOICE=白桦
MIMO_TTS_PROMPT=
```

`MIMO_TTS_VOICE` 未设置或留空时使用白桦；其他发言人填写小米支持的 Voice ID，例如苏打、冰糖或茉莉。`MIMO_TTS_PROMPT` 未设置或留空时不发送风格指令。需要自定义时可写成 `MIMO_TTS_PROMPT="语速稍慢，句间自然停顿。"`。所有页面讲解和详情朗读共用此配置。

修改后执行以下命令重新创建容器（仅 restart 不会重新读取 Compose 的 env_file）：

```sh
docker compose up -d --no-build --pull never --force-recreate
```

本地开发修改 `.env.local` 后，重新启动 `npm run dev`。浏览器中正在播放的内容请停止后重新点击讲解。

## 不使用 Docker Compose

导入镜像后执行：

```sh
docker run -d --name changzheng \
  --platform linux/amd64 \
  --restart unless-stopped \
  -p 4061:4061 \
  --env-file .env.local \
  --read-only --tmpfs /tmp:rw,size=64m,mode=1777 \
  --cap-drop ALL --security-opt no-new-privileges:true \
  --log-opt max-size=10m --log-opt max-file=3 \
  changzheng:2026.10.26.4
```

两种启动方式选择一种，避免重复占用同一端口。

## 修改端口

容器内固定监听 4061。通过 Compose 修改服务器访问端口，例如使用 8080：

```sh
PORT=8080 docker compose up -d --no-build --pull never
```

长期使用时可在 `compose.yaml` 同目录创建 `.env`，写入 `PORT=8080`。使用 `docker run` 时将 `-p 4061:4061` 改为 `-p 8080:4061`。

## 从源码重新构建

在项目根目录运行（首次构建需要访问镜像仓库和 npm）：

```sh
docker buildx build --platform linux/amd64 --load -t changzheng:2026.10.26.4 .
docker compose up -d --no-build --pull never
```

构建阶段使用 Node.js 22 生成静态文件；运行阶段使用非 root 的 Node.js 22，同时提供静态文件、音频 Range 请求和同源流式 TTS 代理。即使在 Apple 芯片 Mac 上构建，以上命令输出的运行镜像也是 Linux x86_64。

如需再次导出：

```sh
mkdir -p release
docker save changzheng:2026.10.26.4 | gzip > release/changzheng-2026.10.26.4-linux-amd64.tar.gz
```

## 日常维护

```sh
docker compose ps
docker compose logs --tail=100
docker compose restart
docker compose down
```

更新镜像后执行 `docker compose up -d --no-build --pull never --force-recreate`。

收藏、阅读进度和笔记保存在访问者浏览器中。更换服务器地址、域名或端口会改变浏览器存储来源；迁移前可通过学习中心导出记录，再在新地址导入。历史资料出处外链仅在主动点击时打开，讲解由小米 TTS 提供；当前浏览器只会向本站提交待朗读正文，不会收到 API 密钥。
