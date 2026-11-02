# 印章打印器 · Stamp Maker

**English:** type text (or upload a logo) and get a 3D-printable stamp STL with exact mm / inch specs. The interface switches between 中文 and English (top right); English is the default for non-Chinese browsers.

输入文字（或上传图案），直接生成可以 3D 打印的印章 STL。印面已经镜像好，下载后拖进切片软件就能打（PLA 测试过）。

**在线使用：** 打开仓库的 GitHub Pages 地址即可（Settings → Pages 里能看到链接）。也可以把 `index.html` 下载到电脑上，用浏览器直接打开。

## 功能

- **三种印面**：方形姓名章（竖排右起，用 `/` 手动分列，如 `陈氏/之印`）、圆形环字章（中心五角星或文字，下方可加一行字）、长条章（横排或竖排，竖排时印面自动转成竖长条）
- **阳文 / 阴文**，边框、圆角、内边距、字间距都能调
- **三大类**：印章、滚轮、切模，在最上面切换
- **切模**：饼干或黏土（耳环）切模，外形跟随图案或圆 / 方，可调高度、刀口和边沿；可加内部压纹，一压同时切形和压花
- **滚轮压花**：空心圆筒滚轮，文字或图案按每圈 / 沿长重复铺满一圈，可调直径、长度、内孔和花纹深；竖着打，花纹下沿自动做 45° 台阶，不用支撑
- **英文**：整词排版，自动分成 1–4 行让字母尽量大，也可以用 `/` 手动换行；圆章环字按字母宽度排开
- **图案**：上传 PNG / JPG / WebP / SVG，可以「只用图案」或「图案 + 文字」（图在上 / 下 / 左 / 右，对齐靠左 / 居中 / 靠右，可调图文间距和占比，整组自动收紧居中；圆章放在中心）；可调深浅阈值、反色；照片类灰阶多的图会提醒；图案会存在浏览器里，也会写进设置文件
- **字体**：中文、中文繁体、英文、日文、韩文五组（英文有 Cinzel、Playfair Display、Roboto Slab、Oswald、Bebas Neue、Pacifico）（思源宋体 / 黑体、繁体思源宋体 / 黑体 / 霞鹜文楷、日文明朝 / 黑体 / 毛笔、韩文明朝 / 黑体 / 宋明体等）；选的字体缺字时会提示；可以上传自己的 `.ttf` / `.otf`（比如篆书），浏览器会记住
- **简繁转换**：一键简 → 繁 / 繁 → 简（台湾常用写法）
- **一体手柄**：直筒，可调手柄高度、比直段宽多少、腰身、底端倒角和最大坡度；可加手指凹槽（方章选左右 / 前后，长条章选长边 / 短边，或四面）（可调深度、宽度和弧线形状，附俯视小图）；印面下方有一段不变形的直段（默认 3 mm），凹槽和腰身只作用在下面的手柄上；直筒加凹槽时手柄自动加宽，凹进去最窄处也不比印面窄；默认免支撑
- **尺寸读数**：外形、总高（握柄 + 底板 + 字凸起）、文字整体和每个字的宽 × 高，都到 0.01 mm（和 Bambu Studio 一致）
- **Bambu Studio 层高**：选 A1 的工艺配置，会显示切出来共几层、字凸起几层、实际凸起多高；字顶收窄按层对齐
- **上架规格**：「下载 STL + 规格」会打包 STL、规格卡图片（印面和侧面同比例，mm / 英寸，附 10 mm 比例尺）、中英文规格说明（含可直接贴到 Etsy 的英文段落和实心重量）、设置文件
- **导入设置**：以后导入 `_设置.json`，能还原出一模一样的印章

- **打印前检查**：笔画细于喷嘴的地方会在预览里标黄并提醒；数字超出安全范围会按最近的上下限生成并说明；字体没下载好时不让导出

## 打印建议

- 摆放：印面朝上，手柄底端贴平台
- 字凸起 1.5 mm、底板 2.5 mm 是比较稳的起点；字很细时把「笔画加粗」调高一点
- 不用加支撑
- 小章用英文时，Cinzel / Playfair 的细衬线容易细过喷嘴，Roboto Slab 或 Bebas Neue 更稳

## 修改代码

源码在 `src/`：

| 文件 | 内容 |
| --- | --- |
| `src/head.html` | 页面样式 |
| `src/body.html` | 页面结构和控件 |
| `src/app.js` | 排字、预览、手柄、导出等逻辑 |
| `src/geo.js` | 轮廓提取和 STL 网格生成 |

改完后运行 `python3 build.py`，会重新生成根目录的 `index.html`。

外部依赖都从 CDN 加载：three.js（3D 预览）、earcut（三角化）、opencc-js（简繁转换，点按钮时才加载）、Google Fonts（字体）。

## 许可证 / License

本项目使用 [PolyForm Noncommercial 1.0.0](LICENSE)：**个人和非商业用途免费**，可以使用、修改、分享。**商业用途需要另行授权**，比如用它做印章、滚轮、切模来卖，或者放进收费的产品或服务里。商用授权请通过 GitHub 联系 [gracege17](https://github.com/gracege17)。

This project is licensed under [PolyForm Noncommercial 1.0.0](LICENSE): **free for personal and other noncommercial use**, including changing and sharing it. **Commercial use requires a separate license**, for example selling stamps, rollers or cutters made with it, or using it in a paid product or service. For a commercial license, contact [gracege17](https://github.com/gracege17) on GitHub.

Copyright (c) 2026 gracege17

第三方组件 / Third-party: three.js (MIT), earcut (ISC), opencc-js (Apache-2.0)，由 CDN 加载；字体来自 Google Fonts（SIL Open Font License）。
