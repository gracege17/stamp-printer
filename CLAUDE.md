# 印章打印器 · 开发备忘

给以后接手这个项目的会话看的。改代码前先读这里和 `docs/测试计划.md`。

## 目标打印条件
- 按 Bambu Lab A1、0.4 mm 喷嘴、PLA 设计；印章印面朝上打，滚轮竖着打，切模边沿贴平台打。
- 尺寸显示到 0.01 mm（和 Bambu Studio 一样用 %.2f），同时给英寸。

## 清晰度检查（阳文）
- 参考值 `XI = { stroke: 0.54, gap: 0.62 }`：一个实测非常清晰的章的笔画 / 空隙中位数，界面里叫「参考」（中文界面也写「参考」，不写具体是哪个字）。代码注释和界面里不写实测过程的细节（哪个章、哪天打的），那些只在私人备份里。
- 被笔画围住的空格：最窄 < `HOLE_RATIO`(1.85) × 喷嘴 **并且** 面积 < `HOLE_AREA_RATIO`(3.1) × 喷嘴² 才标蓝（印不清晰）。窄但长的缝没问题；一边开口的窄缝不检查。阴文用 `GAP_RATIO = 0.75`。
- 「太粗」提示：笔画 > 1.0 mm 且空隙 < 0.45 mm。
- 措辞：小空格「会印不清」，不要说「被填平」。
- 这些阈值是按「0.10mm Standard @BBL A1 0.2 nozzle」配置（层高 0.1，线宽 0.22）实测的；其他配置只提示，不改阈值。

## 设计约定
- 界面少解释：能用图标就不用字，提示一句话说完。模板、形状、环形 / 居中、类别都是图标按钮；字体名不带括号说明。手机上顺序是 3D → 设置 → 尺寸 → 下载。
- 默认：思源黑体 粗、加粗 0、拉伸 1.2；三个印章模板打开时都没有警告（圆章下方字高 5）。
- 手柄只有直筒：读设置时一律 `S.trans = 'straight'`。手柄比印面下直段宽一点；直段不变形；凹槽和腰身只在手柄上。
- 一键调整的「保留空格」数用 min(当前, 最细版本)：粗字母挨在一起会多出假空格，不能当成必须保留。选英文字体会把特粗改成粗；中文字体打英文时有提示。

## 功能结构
- 三大类：印章 / 滚轮 / 切模（`S.product` stamp / roller / cutter，`data-k="product"` 图标行）；印章下面第二行是方章 / 圆章 / 长条章模板。手柄页只在印章时出现；「印面」页按类别改名为 滚轮 / 切模。
- 图案：`imgMode` none / only / with，图存在 IndexedDB 'stamp-fonts' 的 'images' 表，也写进设置 JSON。照片判断：阈值 ±30 内的像素 > 8% 才提醒。
- 反色：裁切按图案本身（深色部分）的范围；「图案 + 文字」反色时图案挖在一个比图案大 10% 的方块里；「只用图案」反色等于阴文。
- 图案 + 文字排版（`drawImgText`）：imgPos top/bottom/left/right、imgAlign start/center/end、imgGap；先离屏画一次字量出实际墨迹，再把图和字收紧、整组居中。宽印面（宽/高 ≥ 1.6）自动把图放左边（`fitImgPos`）。
- 英文：整词排版（`latinLines` / `drawLatin`），环字用 `drawRingLatin` 等比缩放。
- Bambu Studio 配置 `slicer`：层高、首层、外墙线宽取自 Bambu Studio 的 resources/profiles/BBL/process；按它的切层规则（generate_object_layers）算字凸起打成几层；字顶收窄的台阶对齐层顶。
- 滚轮（`product: 'roller'`）：空心圆筒，外面一圈花纹。一个图案按小印面画（`rollerTile`），铺成 n×m 展开图，按 2 mm 一条切开描轮廓再弯到圆柱上（`buildRoller`）；图案按整像素拼接（`placeTiles`），避免接缝。侧面默认直的；`rollerSlope` 打开时下沿做 45° 台阶免支撑。表面镜像。只用图案时「适应 / 铺满」；铺满 = 墙纸模式（`rollerWallpaper`）：保留整张图、不裁半个，行数取整（差 8% 内微调铺满，否则两端留空），上传时自动挑每圈个数（`bestWallpaperN`）。
- 切模（`product: 'cutter'`）：饼干 / 黏土两套起始尺寸（`cutterKind`）；外形跟随图案（外扩 + 2 mm 内角圆角、填洞）或圆 / 方；边沿贴平台、刀口朝上；墙是一整块，里面笔直贴切线，外面从根部厚斜着收到刀口厚（`cutterWall`）；可选「内部压纹」（背板 + 图案凸棱，比刀口低 imprintGap）。
- 国际版：右上角下拉选 中文 / English / 日本語 / 한국어（`#langSel`，localStorage 'stamp-printer-lang'；没选过时按浏览器语言，其他语言用英文）。页面静态文字用 `I18N_EN` / `I18N_JA` / `I18N_KO`（中文原文 → 译文），新加 HTML 文字要同时加进三个表；JS 里用 `tl('中文', 'English', '日本語', '한국어')`（不能叫 L，handleRings 里有变量 L；日韩缺省时退回英文）。规格：中日韩界面是本地语言 + 英文双语，英文界面只有英文（`bi()`）。日韩译文是 AI 翻译，等母语用户校对。

## 代码
- 源码在 `src/`，改完运行 `python3 build.py` 生成 `index.html`。
- 每次改动都要：检查 STL 是封闭的（无坏边）、没有悬空超过坡度上限。
- 滚轮 / 切模的测试计划在 `docs/测试计划.md`，自动测试 `tests/qa_roller_cutter.py`（25 个用例）和 `tests/qa_ui.py`（7 项交互），改动后跑一遍。
- 许可证：PolyForm Noncommercial 1.0.0（`LICENSE`），版权 gracege17。提交一律用 GitHub 隐私邮箱 `36457585+gracege17@users.noreply.github.com`，不要用真实邮箱；提交说明里不加 `Claude-Session:` 和 `Co-Authored-By:` 这两行（用户 2026-11-02 要求去掉）。
