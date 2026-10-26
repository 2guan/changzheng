# 详情弹窗旧信纸素材

- 生成方式：内置 image_gen，透明背景。
- 项目素材：`public/assets/letter-paper-aged.webp`（1122 × 1402，196076 bytes，保留 alpha）。
- 原始 PNG：`/Users/guan/.codex/generated_images/01a16879-c435-70b3-bc45-2d201b8b24d6/exec-56c0b596-1c6a-479e-8a09-bd9fcf9895d9.png`。
- 转换：cwebp -q 88 -alpha_q 100，仅转换网页格式，不改图像内容。
- 使用：共用 `.dialog::before` 整图缩放（避免分片接缝）；正文 `.dialog-content` 独立滚动，纸边、顶栏固定。
- 为键盘保留焦点轮廓，为强制色彩模式提供系统底色。

## 最终生成提示词

Use case: photorealistic-natural. Asset type: production web UI background, a single blank old Chinese letter-paper sheet with genuinely transparent surroundings. Create a very high quality top-down flat scan of ONE portrait sheet, approximately 4:5 ratio, centered, nearly fills image with a narrow 2 percent transparent margin all around. Color: pale warm yellow-white / ivory, cream #f5efdc, NOT orange or dark brown. Handmade mulberry paper with fine subtle fibers, restrained age patina mainly near edges, soft slightly uneven natural deckled/torn edges on ALL FOUR SIDES, a few small irregular missing nicks, gently softened corners, faint old folding marks. The silhouette must visibly be irregular rather than a perfect rectangle, yet the damage is delicate and not theatrical. Large blank center 85% is very light, clean and uniform enough for long Chinese reading text. Soft flat diffuse lighting, perfectly front-facing, no perspective, no curled page casting strong shadows. Actual alpha transparency outside torn paper, opaque interior. No desk, no other objects, no lettering, no text, no ruled lines, no symbols, no watermark, no black burned edges, no grunge in center. This will be used as a nine-slice scalable background for a historical reading modal.
