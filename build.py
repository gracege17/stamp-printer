"""把 src/ 里的四个文件拼成一个可以直接打开的 index.html。改完 src/ 后运行：python3 build.py"""
from pathlib import Path
src = Path(__file__).parent / 'src'
r = lambda n: (src / n).read_text(encoding='utf-8')
html = ('<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}img{max-width:100%}</style>\n'
        + r('head.html') + '</head>\n<body>\n' + r('body.html') +
        '\n<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n'
        '<script src="https://cdn.jsdelivr.net/npm/earcut@2.2.4/dist/earcut.min.js"></script>\n<script>\n'
        + r('geo.js') + '\n' + r('app.js') + '\n</script>\n</body>\n</html>\n')
(Path(__file__).parent / 'index.html').write_text(html, encoding='utf-8')
print('index.html 已生成')
