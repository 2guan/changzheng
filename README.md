# 重走长征路 · 山河为证，初心如炬

一个包含8个独立模块的沉浸式历史学习网站。以React + TypeScript + Vite实现，使用Motion界面动效和Remotion叙事播放器。

## 本地运行

需要Node.js 22.18+（测试使用Node内置TypeScript类型剥离）。

```sh
npm install
npm run dev
```

打开终端给出的本地地址。当前开发预览为 http://localhost:5173/ 。

```sh
npm test
npm run build
npm run preview
```

`dist/`为可直接部署到静态托管的产物。hash路由不需要服务器端重写。

## 已实现

- 八个模块：启程首页、历史序幕、万里征途、四路红军、篝火夜话、长征回响、诗意长征、学习中心。
- 22个历史节点、4支队伍路线与时间对照、20篇故事、5组诗词、15道测验。
- 地图缩放、路线切换、阶段筛选、站点详情、收藏和阅读完成标记。
- 四渡赤水24秒Remotion动画：暂停、拖动时间轴、四章节跳转。
- 负重模拟、通道决策、夜渡组织、泸定桥协作4项互动任务。
- 答题解析、错题回看、进度恢复、1600×1100 PNG学习纪念证书。
- 全站搜索、手机导航、原生dialog焦点约束与Escape关闭、减少动态支持。
- 两幅本地原创AI画作，自托管标题字体，无第三方图片热链。

## 源码地图

- `src/data.ts`：历史内容、故事、诗词、题库和地理示意坐标。
- `src/App.tsx`：全站框架、首页、搜索、史料说明。
- `src/components/Journey.tsx`、`RouteMap.tsx`、`Reader.tsx`：路线、队伍与阅读。
- `src/components/Editorial.tsx`：序幕、故事、回响、诗词。
- `src/components/Learning.tsx`：任务、测验、证书与行囊。
- `src/components/StoryFilm.tsx`：Remotion逐帧叙事。
- `src/storage.ts`、`state.tsx`：本地状态校验、共享进度、路由。
- `src/styles.css`：完整响应式视觉系统。
- `tests/content.test.ts`：内容关联与核心逻辑测试。

## 内容与使用说明

历史材料经过编辑整理，并明确区分历史概要、文学故事和纪念叙事。地图与互动数值为教学示意，AI画作不冒充历史照片。来源入口位于阅读器和页脚。正式商业发行前仍需专门的史料、内容权利及Remotion商业许可审查。

学习记录只保存在当前浏览器，没有账号、上传或跨设备同步。浏览器朗读依赖系统语音；PNG证书既可点击保存，也可长按预览保存。内置浏览器下载事件未完成落盘验收，标准浏览器可使用保存链接。

产品规划见 [docs/plan.md](docs/plan.md)，素材及完整提示词见 [docs/assets.md](docs/assets.md)，实际验收记录见 [docs/verification.md](docs/verification.md)。
