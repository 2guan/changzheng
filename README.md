# 重走长征路 · 本地完整版

8 个独立模块的沉浸式历史学习网站。React + TypeScript + Vite、Motion 与 Remotion；所有正文、字体、图片和互动代码均位于项目内，无在线地图、外部图片 CDN 。白桦讲解通过本地 Node 服务安全调用小米 TTS。

## 启动

Linux x86_64 服务器可通过 Docker 运行，默认端口 **4061**。镜像导入、启动与更新方法见 [Docker 部署说明](docs/docker-deployment.md)。

当前本地地址：**http://127.0.0.1:5173/**。

macOS 可双击项目根目录的 `启动网站.command`。已有本项目服务时直接打开；否则启动开发服务器。保留终端窗口即可持续访问，按 Ctrl+C 停止。

首次从 GitHub 获取并启动：

```sh
git clone https://github.com/2guan/changzheng.git
cd changzheng
npm ci
cp .env.example .env.local
# 编辑 .env.local，填写自己的 MIMO_API_KEY；不配置时网页和背景音乐仍可使用。
npm run dev
```

运行需要 Node.js 22.18+。依赖安装完成后，除小米语音合成需要联网外，网页和背景音乐均由本机提供。服务仅监听本机 `127.0.0.1`，固定端口 5173；端口占用时会明确报错。

`.env.local` 中的 `MIMO_TTS_VOICE` 配置发言人（默认白桦），`MIMO_TTS_PROMPT` 配置演绎提示词（留空不发送风格指令）。修改后重启开发服务；Docker 部署需重新创建容器。密钥文件不会提交到仓库。

从源码构建 Linux x86_64 Docker 镜像并启动：

```sh
docker buildx build --platform linux/amd64 --load -t changzheng:2026.10.26.2 .
docker compose up -d --no-build --pull never
```

默认访问 `http://服务器IP:4061/`。仓库包含 Docker 构建配置，不包含预打包镜像。

```sh
npm test
npm run build
npm run preview
```

生产构建位于 `dist/`。`npm run preview` 仅预览静态页面，不提供 TTS 接口；完整语音功能请使用开发服务或 Docker。历史资料外链仅在主动点击时打开；朗读默认使用白桦流式语音，可通过环境变量更换发言人。页面讲解播放过后不再自动播放，仍可手动重听；参见 [声音与勋章说明](docs/audio-and-badges.md)。

## 本次完整补充

- 原方案第 2—7 卷内容按模块接入：序幕两章、22 站历史全景与人物细节、四军完整对照表、20 篇完整故事、历史意义两章、5 组诗词解读（三首小令合并）与战地歌谣节选。
- 15 道情境题按照方案补回，附解析、错题复习与 PNG 学习纪念证书。题库升级会清空旧版答案，保留旧收藏和足迹，避免错配。
- 20 件物件独立生成图片，包括生锈鱼钩、七根火柴、半截皮带、铜军号、担架、扁担银行、无线电设备等。支持图录浏览与放大查看。
- 生成的内陆地形艺术底图、本地可切换简明路线层、10 处地理天险探索、22 站海拔剖面点击跳转、兵力参考记录。
- 保留 4 项原有任务，新增 5 项体验：夜渡时间调度、铁索协作（可关闭倒计时）、草地探路、电报译读、湘江献花。另有 22 站情境思考、诗词遮句背诵和填句核对。
- 长文分章阅读与字号调整、个人手记保存、学习记录 JSON 导出与合并导入。所有记录仅保存在当前浏览器。
- 四渡赤水 Remotion 复盘继续支持播放、暂停、章节跳转与拖动进度。

## 主要文件

- `src/content.json`：经整理与校订的完整内容库。
- `src/data.ts`、`src/quiz-content.ts`：模块、路线、简述与题库。
- `src/components/ReadingContent.tsx`：安全文本渲染、长文阅读、物件放大。
- `src/components/Experiences.tsx`：新增互动、22 站思考、手记与记录备份。
- `src/components/TerrainExplore.tsx`、`RouteMap.tsx`：地形探索、海拔剖面与地图图层。
- `src/components/PoetryPractice.tsx`：诗词记忆与填句练习。
- `public/assets/object-01.webp` 至 `object-20.webp`、`terrain.webp`：新制作的 21 张本地素材。
- `docs/content-coverage.md`：原方案内容逐项对照。
- `docs/generated-assets-v2.json`：每张图的完整提示词、生成方式和文件路径。
- `docs/verification-v2.md`：本次实际验收记录。

## 编辑与维护

全站正文使用用户提供的霞鹜臻楷，标题和地图节点文字使用南西油墨宋。原 TTF 保存在 `fonts/source/`，网页加载本地 WOFF2 完整字库；地图节点、弹窗、诗词及学习纪念证书使用同一套字体。见 [字体说明](fonts/README.md)。

来源底稿为用户提供的《长征网站规划方案.md》。正文保留完整的故事与知识线索，同时明确区分文学重述、纪念叙事与历史资料。修改了明确的同人异名、时间与减员口径混淆，避免把历史生活经验写成现代医疗建议。具体校订与参考链接见内容对照记录。

`src/content.json` 是阅读内容的维护入口。`scripts/import-content.py` 仅用于从原始方案提取初稿，运行会覆盖后续人工校订，日常维护不要重新导入。题库编辑时同步维护 `src/quiz-content.ts`。

AI 物件图是艺术再现，不是文物实拍；地图底图没有精确测绘含义，不用于导航。互动的时间、负重与电码是教学模型。正式商业发行前的史料、文学使用权及 Remotion 许可审查仍属单独的发行工作。

## 六幕互动体验（可选，保留旧进度）

六幕互动体验现位于 `/#/journey?mode=interactive`，从学习中心的可选入口进入；旧存档保留。默认入口已升级为八章地图；22站全景与六幕互动均可继续进入。

- 三种观察身份；五选三行囊；物件影响后续叙述。出发后封存行囊，保留经历的一致性。
- 夜渡空间线索、手机河岸横向环顾、手动渡河；四渡赤水动态路线；拨雪寻找同伴与分担；草地逐行探查；会师留书。
- 行程导航、随身行囊、个人手记、手记 TXT 导出；刷新续行。
- 专注模式进入后收起全站导航，可按右上角按钮或 Escape 退出；环境声默认关闭，由本地 Web Audio 合成，页面隐藏时暂停。
- 三张全新本地场景图：`public/assets/scene-night.webp`、`scene-snow.webp`、`scene-marsh.webp`。生成提示词记录在 `docs/immersive-assets.json`。
- 新状态单独保存在 `changzheng-expedition-v1`，不修改原阅读/收藏/答题记录。该状态不包含在旧版学习 JSON 备份中；个人文字可单独导出。
- 开发入口：`src/components/Expedition.tsx`、`src/expedition.ts`、`src/expedition.css`。方案见 `docs/immersive-plan.md`。


## 二十二站全景漫游

打开 `http://127.0.0.1:5173/#/journey` 选择路线站点，`#/journey?mode=panorama` 自动续行，`#/journey?station=1` 从于都开始。22个站点均有独立本地画面，新增19张约2.4:1宽幅场景，沿用此前于都、雪山、草地3张。画面是艺术全景，不是360°实地摄影或精确历史复原。

- 鼠标/触摸拖动、原生滑块环顾；专注模式、隐藏文字看景。
- 每站三段短叙事和两处可选观察点；完整史料保持可读。
- 前后导航、22站目录、进度轨道都可自由跳转，不设答题或任务门槛。
- 可选自动漫游每16秒推进一段，三段后前往下一站；隐藏浏览器页面或打开目录/史料时暂停计时。
- 轻量浏览记录另存于 `changzheng-panoramas-v1`，不会自动计为全文已读。学习中心显示已浏览站数。
- 资料地图用 `#/journey?mode=archive&station=1`；`read=1` 的旧全文深链接继续可用。
- 新素材：`public/assets/panorama-02.webp` 等19图；完整文件与生成提示词见 `docs/panorama-assets.json`。
- 代码：`src/components/Panorama.tsx`、`src/panoramas.ts`、`src/panorama.css`。计划见 `docs/panorama-plan.md`，验收见 `docs/verification-panoramas.md`。


## 六主题地图首页（当前默认入口）

首页 `/#/home` 为六主题总图，学习中心与背包合并为右上角入口。各专题与学习中心使用统一的全景路线视图。站点数分别为 6、4、22、4、20、4、5、6。

- 首页主标题为“重走长征路”，全站移除英文装饰小标题。鼠标悬停或键盘聚焦节点时更新下方介绍；点击节点或按回车直接进入内容，取消二次“进入”按钮，返回路线恢复原站。悬停不修改 URL 或浏览历史。
- 移除单独的“启程首页”，原首页深链接也回到地图。六个主题节点直接展开各自路线；首页背景使用原开篇的 `hero.webp`，配色为墨褐、旧金、朱砂，节点标题不设底框。
- 各模块的完整文章、22站全景、军团详情、20篇故事、诗词和学习功能保留。原有深链接保持有效。
- 序幕与回响节点直接定位完整章节或相关区域；学习地图可直接开启测验、定位笔记和备份等区域。
- 所有地图支持静观模式；首页电脑端六节点横向一整行，手机端两列三行。手机地图随页面纵向滚动，4节点模块每行2个，其他模块每行最多3个，按蛇形路线向下排列。前后预览按钮可定位相邻节点。键盘方向键预览相邻站点，回车打开内容；尊重减少动效设置。
- 地图为叙事路线示意，不代表地理位置；万里征途另设地理资料地图入口。
- 四幅新全景全部本地存储：`public/assets/atlas-world.webp`、`atlas-camp.webp`、`atlas-poetry.webp`、`atlas-study.webp`。每幅1942×809，合计约1.43MiB。
- 路线定义：`src/atlas.ts`；共用界面：`src/components/Atlas.tsx`、`src/atlas.css`。
- 方案：`docs/atlas-plan.md`；内置imagegen完整提示词与资产路径：`docs/atlas-assets.json`；验收：`docs/verification-atlas.md`。


## 统一详情弹窗（2026-10-24）

- 序幕、军团、故事、回响、诗词和学习中心的节点，直接在当前地图上打开与“完整史料”一致的原生阅读弹窗，仅渲染所选内容。
- 关闭按钮、Esc 与浏览器后退可回到地图，关闭后恢复节点焦点；背景地图在阅读期间保留。
- 二十二站全景保留；搜索和收藏的 `station=N&read=1` 深链接在对应全景上直接打开史料。地理资料地图也改为弹窗。
- 原有 `view=reading`、`army`、`story`、`poem` 链接继续可用，统一解析为对应节点内容。测验、收藏、笔记、备份与情境任务保留本地保存逻辑。
- 路由解析：`src/details.ts`；弹窗分发：`src/components/TopicDialog.tsx`；内容沿用原章节与本地素材。
