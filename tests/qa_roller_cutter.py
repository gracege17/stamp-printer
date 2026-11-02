# 用法：python3 tests/qa_roller_cutter.py   （需要 playwright + chromium；先运行 python3 build.py）
import asyncio, json, zipfile, io, struct, collections, math, time, sys
from playwright.async_api import async_playwright
import os
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
IMG={k:os.path.join(HERE,'images',f) for k,f in {'scales':'art_deco_scales.png','fan':'art_deco_fan.png','flower':'flower.png','bee':'bee.png','photo':'gradient_photo.jpg'}.items()}
def check(b):
    n=struct.unpack('<I',b[80:84])[0]; E=collections.Counter(); vol=0; zs=[]; xs=[]; ys=[]; nan=0
    for i in range(n):
        v=struct.unpack('<12f',b[84+i*50:84+i*50+48])[3:]
        if any(math.isnan(c) for c in v): nan+=1; continue
        P=[tuple(round(c,4) for c in v[j*3:j*3+3]) for j in range(3)]
        for a,c in ((0,1),(1,2),(2,0)): E[(P[a],P[c])]+=1
        a,b_,c=P; vol+=(a[0]*(b_[1]*c[2]-b_[2]*c[1])-a[1]*(b_[0]*c[2]-b_[2]*c[0])+a[2]*(b_[0]*c[1]-b_[1]*c[0]))/6
        zs+=[a[2],b_[2],c[2]]; xs+=[a[0],b_[0],c[0]]; ys+=[a[1],b_[1],c[1]]
    bad=sum(1 for (a,c),k in E.items() if E.get((c,a),0)!=k)
    return dict(tris=n,bad=bad,nan=nan,vol=round(vol),zmin=round(min(zs),2) if zs else None,bbox=(round(max(xs)-min(xs),1),round(max(ys)-min(ys),1),round(max(zs)-min(zs),1)) if zs else None)
CASES=[
 # roller
 ('R1 roller default zh', 'zh-CN', {"product":"roller"}, None, None),
 ('R2 roller EN text', 'en-US', {"product":"roller","text":"Thank/You","font":"Roboto Slab","weight":700,"dir":"h"}, None, None),
 ('R3 roller wallpaper scales', 'zh-CN', {"product":"roller","text":""}, 'scales', None),
 ('R4 roller fan fit 60%', 'zh-CN', {"product":"roller","text":"","imgFit":"fit","imgScale":0.6}, 'fan', 'only'),
 ('R5 roller pic+text', 'zh-CN', {"product":"roller","text":"花店","dir":"h"}, 'flower', 'with'),
 ('R6 roller yin text', 'zh-CN', {"product":"roller","text":"福","mode":"yin","rollerGap":0}, None, None),
 ('R7 roller invert pattern', 'zh-CN', {"product":"roller","text":"","imgInvert":True}, 'scales', None),
 ('R8 roller slope on', 'zh-CN', {"product":"roller","text":"平安","rollerSlope":True}, None, None),
 ('R9 roller small D, hole too big', 'zh-CN', {"product":"roller","rollerD":20,"rollerHole":30,"rollerL":40,"text":"A","rollerN":1,"rollerM":1}, None, None),
 ('R10 roller solid (hole 0) big', 'zh-CN', {"product":"roller","rollerD":80,"rollerHole":0,"rollerL":200,"text":"花","rollerN":6,"rollerM":4}, None, None),
 ('R11 roller photo', 'zh-CN', {"product":"roller","text":""}, 'photo', None),
 ('R12 roller empty text no img', 'zh-CN', {"product":"roller","text":""}, None, None),
 # cutter
 ('C1 cutter default zh', 'zh-CN', {"product":"cutter"}, None, None),
 ('C2 cutter EN follow', 'en-US', {"product":"cutter","text":"Hi","font":"Roboto Slab","weight":700,"dir":"h"}, None, None),
 ('C3 cutter clay flower imprint', 'zh-CN', {"product":"cutter","cutterKind":"clay","cutterW":25,"cutterH":25,"cutterOffset":1.5,"cutterHeight":8,"bladeT":0.5,"wallT":1.2,"flangeW":2.5,"flangeT":1.6,"imprintGap":1.5,"cutterImprint":True,"text":""}, 'flower', 'only'),
 ('C4 cutter circle EN imprint', 'en-US', {"product":"cutter","text":"Love","font":"Pacifico","cutterShape":"circle","cutterImprint":True,"dir":"h"}, None, None),
 ('C5 cutter square bee', 'zh-CN', {"product":"cutter","text":"","cutterShape":"square"}, 'bee', 'only'),
 ('C6 cutter follow bee (separate parts)', 'zh-CN', {"product":"cutter","text":"","cutterShape":"follow"}, 'bee', 'only'),
 ('C7 cutter pic+text imprint', 'zh-CN', {"product":"cutter","text":"花店","dir":"h","cutterImprint":True}, 'flower', 'with'),
 ('C8 cutter blade>wall', 'zh-CN', {"product":"cutter","bladeT":2.5,"wallT":1.0}, None, None),
 ('C9 cutter big 150', 'zh-CN', {"product":"cutter","cutterW":150,"cutterH":150,"text":"福"}, None, None),
 ('C10 cutter tiny 8mm', 'zh-CN', {"product":"cutter","cutterW":8,"cutterH":8,"text":"心","cutterOffset":0.5}, None, None),
 ('C11 cutter yin text imprint', 'zh-CN', {"product":"cutter","text":"福","mode":"yin","cutterImprint":True}, None, None),
 ('C12 cutter invert flower imprint', 'zh-CN', {"product":"cutter","text":"","imgInvert":True,"cutterImprint":True}, 'flower', 'only'),
 ('C13 cutter empty', 'zh-CN', {"product":"cutter","text":""}, None, None),
]
SEL=sys.argv[1:] 
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=["--use-gl=swiftshader","--enable-webgl","--ignore-gpu-blocklist"])
        for name,loc,st,img,mode in CASES:
            if SEL and not any(name.startswith(x) for x in SEL): continue
            ctx=await b.new_context(viewport={'width':1280,'height':1000},accept_downloads=True, locale=loc); pg=await ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:150]))
            await pg.goto('file://'+os.path.join(ROOT,'index.html'))
            base={"_v":2}; base.update(st)
            await pg.evaluate(f"localStorage.clear(); localStorage.setItem('stamp-printer-v1', {json.dumps(json.dumps(base))}); localStorage.setItem('stamp-printer-lang', '{'en' if loc=='en-US' else 'zh'}')"); await pg.reload(); await pg.wait_for_timeout(4000)
            if img:
                await pg.click('[data-tab=image]'); await pg.set_input_files('#imgFile', IMG[img]); await pg.wait_for_timeout(1500)
                if mode: await pg.click(f'[data-k=imgMode] [data-v={mode}]')
            t0=time.time(); await pg.wait_for_timeout(5000)
            warn=(await pg.inner_text('#warn')).replace('\n',' | ') if await pg.is_visible('#warn') else '-'
            stats=await pg.inner_text('#stats'); kpi=(await pg.inner_text('.kpis')).replace('\n',' ')
            status=await pg.inner_text('#status'); dis=await pg.is_disabled('#dl')
            out=f'## {name}\n  kpi: {kpi}\n  stats: {stats}\n  warn: {warn}\n  status: {status} | dl disabled={dis}'
            el=await pg.query_selector('.imp'); await el.screenshot(path=f'{name.split()[0]}_imp.png')
            el=await pg.query_selector('.stage'); await el.screenshot(path=f'{name.split()[0]}_3d.png')
            if not dis:
                try:
                    async with pg.expect_download(timeout=60000) as d: await pg.click('#dl')
                    dl=await d.value; z=zipfile.ZipFile(io.BytesIO(open(await dl.path(),'rb').read()))
                    out+=f'\n  zip: {z.namelist()}'
                    for nm in z.namelist():
                        if nm.endswith('.stl'): out+=f'\n  STL: {check(z.read(nm))}'
                        if nm.endswith('.png'): open(f'{name.split()[0]}_card.png','wb').write(z.read(nm))
                        if nm.endswith('.json'): js=json.loads(z.read(nm)); out+=f"\n  json product={js.get('settings',js).get('product') if isinstance(js,dict) else '?'}"
                except Exception as e: out+=f'\n  DOWNLOAD FAIL {e}'
            out+=f'\n  errs: {errs}'
            print(out, flush=True); await ctx.close()
        await b.close()
asyncio.run(main())
