# 项目字体

用户于 2026-10-24 提供的原始字体保存在 `source/`，文件内容和字体元数据保持原样。

## 当前使用

- `source/lxgw-zhenkai.ttf`：霞鹜臻楷，用于正文、按钮、表单、诗句、说明及数字。
- `source/nanxi-ink-song.ttf`：南西油墨宋，当前用于各级标题、品牌名称、地图节点文字和弹窗标题。

网页使用 `public/assets/fonts/` 下的完整字库 WOFF2，由上述原文件转换，保留字符和笔画轮廓。CSS 定义位于 `src/fonts.css`，语义变量为 `--font-body` 和 `--font-title`。字体直接由本站提供，不请求外部字体服务。

## 保留备查

- `source/alimama-dongfang-dakai.ttf`：先前提供的 TTF 版本，浏览器中存在“路”字空白问题，当前网页不使用。
- `source/alimama-dongfang-dakai.otf`：曾使用的东方大楷 OTF，字形显示正常；其 WOFF2 保存在 `archive/`，当前不再由网页加载。

## 重新生成

在独立 Python 环境安装 `fonttools[woff]`，然后运行 `python scripts/build-fonts.py`。正常前端构建和 Docker 构建直接使用已经生成的 WOFF2，不需要 Python。

原始文件及 WOFF2 保留字体作者、名称和许可元数据。霞鹜臻楷字体元数据声明使用 SIL Open Font License 1.1；其他字体按用户提供的原文件保留。
