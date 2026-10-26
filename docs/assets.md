# 视觉素材记录

两幅画作使用内置 imagegen 生成，随后转码为 WebP，未依赖外链图片。它们是艺术演绎，不是史料照片。工程中的最终文件：

- `public/assets/hero.webp`：1536×1024，山川长卷。
- `public/assets/relics.webp`：1536×1024，草鞋、灯笼与笔记的行军静物。

## 山川长卷提示词

Use case: historical-scene. Asset type: premium Chinese Long March interactive digital museum website panoramic hero background, landscape 3:2. Create a breathtaking cinematic Chinese ink landscape painted on textured warm antique parchment. Monumental serrated mountain ridges of western China, snow peaks layered far in the background, deep atmospheric valleys, dark weathered rock foreground lower right. Restrained palette of warm golden ochre, pale rice-paper cream, charcoal sepia, a few subtle cinnabar accents. Mountains occupy right 60% and lower half, left upper 45% is quiet mist and golden paper negative space for large HTML Chinese typography. A very tiny distant winding column of 1930s Chinese Red Army walkers visible on a lower mountain path with one small muted red flag, insignificant in the scale of nature. Fine engraved hatching mixed with ink washes, exquisite museum print grain, real geological formations, painterly yet sophisticated realistic detail. Natural warm dawn lighting with volumetric mist between ridges. Wide visual sweep, not fantasy, not a poster layout. No lettering, no labels, no typography, no watermark, no UI, no borders. This is an explicitly artistic historical interpretation, not archival photo.

## 行军物件提示词

Use case: historical-scene. Asset type: editorial museum website story cover illustration, landscape 3:2. Beautiful sophisticated archival still-life on deeply textured warm ochre rice paper: a pair of worn handmade straw sandals in foreground, small dark metal oil lantern on the right, folded coarse grey cotton cloth with a discreet faded red fabric scrap, a creased handwritten 1930s notebook with indistinct unreadable marks, short old leather belt. Gentle side light casts natural soft shadows, no modern objects. Chinese dry-brush ink wash and detailed graphite engraving combined, subtle muted cinnabar and sepia, abundant breathing room, tactile and moving, premium art book quality. Focus on humble objects and human memory, not propaganda poster. No legible text, no watermark, no symbols imposed, no UI. Artistic historical interpretation, not a museum artifact photo.

## 字体与图标

- 标题字体：Noto Serif SC 900，Google Fonts 官方服务下载的少量字形子集，自托管于 `public/assets/display.woff2`。许可全文 `public/assets/OFL-NotoSerifSC.txt`。
- 其余中文宋体使用设备字体栈，正文为系统黑体，无远程字体请求。
- 图标：@phosphor-icons/react，使用依赖自带许可。
- Remotion：实际使用的版本见package-lock.json；商业使用资格须按 https://www.remotion.dev/license 判断。当前交付未购买组织许可证，也未代用户接受额外商业合同。

## 2026-10-23 本地完整版新增素材

使用内置 image_gen 逐件制作了 20 件故事物件图片及 1 张内陆地形艺术底图，最终存入 `public/assets/`，无需外链加载。文件、完整提示词与源图对应见 `generated-assets-v2.json`；修订提示词另见 `image-revisions-v2.json`。

美术检查修正了七根火柴的数量和“铁流后卫”的最后一个字。底图移除了海岸线，改为连续内陆地势；地形画仅承载氛围，路线和交互由 SVG 叠加，图内没有伪造的精确测绘标签。所有物件图均为艺术再现，不冒充馆藏实物照片。格式转换使用本地 WebP 编码，无外部图片服务。
