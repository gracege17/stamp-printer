# 用法：python3 tests/qa_ui.py   （需要 playwright + chromium；先运行 python3 build.py）
import os
import asyncio, json, zipfile, io
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=["--use-gl=swiftshader"])
        ctx=await b.new_context(viewport={'width':1280,'height':1000},accept_downloads=True, locale='zh-CN'); pg=await ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:150]))
        await pg.goto('file://'+os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'index.html')); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(3000)
        tabs=lambda: pg.eval_on_selector_all('[data-tab]','e=>e.filter(x=>!x.hidden).map(x=>x.textContent)')
        # U1 handle tab -> switch to cutter while on handle tab
        await pg.click('[data-tab=handle]'); await pg.click('[data-k=product] [data-v=cutter]'); await pg.wait_for_timeout(3000)
        sel=await pg.get_attribute('[data-tab][aria-selected=true]','data-tab'); print('U1 on handle → cutter: selected tab', sel, await tabs())
        # U2 cutter kind clay → values
        await pg.click('[data-tab=face]'); await pg.click('[data-k=cutterKind] [data-v=clay]'); await pg.wait_for_timeout(2500)
        print('U2 clay values', [await pg.input_value(f'#{k}') for k in ['cutterW','cutterHeight','bladeT','flangeW']])
        # U3 imprint toggle shows inset field
        await pg.check('#cutterImprint'); await pg.wait_for_timeout(2500); print('U3 imprint inset visible', await pg.is_visible('#imprintGap'))
        # U4 language switch on cutter
        await pg.click('#langBtn'); await pg.wait_for_timeout(2500)
        print('U4 EN tabs', await tabs(), '| cap', await pg.inner_text('.imp figcaption'), '| kpi', (await pg.inner_text('.kpis')).replace('\n',' ')[:60])
        await pg.click('#langBtn'); await pg.wait_for_timeout(2000)
        # U5 switch to roller and back to stamp: settings kept
        await pg.click('[data-k=product] [data-v=roller]'); await pg.wait_for_timeout(3000); print('U5 roller tabs', await tabs(), '| face tab label', await pg.inner_text('#tab-face'))
        await pg.click('[data-k=product] [data-v=stamp]'); await pg.wait_for_timeout(3000); print('U5 stamp tabs', await tabs(), '| face tab label', await pg.inner_text('#tab-face'), '| templates visible', await pg.is_visible('.subs'))
        # U6 export settings from roller then import into fresh page
        await pg.click('[data-k=product] [data-v=roller]'); await pg.wait_for_timeout(3000)
        await pg.fill('#rollerD','60'); await pg.press('#rollerD','Enter'); await pg.wait_for_timeout(3000)
        async with pg.expect_download() as d: await pg.click('#dl')
        z=zipfile.ZipFile(io.BytesIO(open(await (await d.value).path(),'rb').read())); js=[n for n in z.namelist() if n.endswith('.json')][0]; open('set.json','wb').write(z.read(js))
        await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(3000)
        await pg.set_input_files('#impFile','set.json'); await pg.wait_for_timeout(4000)
        print('U6 import → product', await pg.get_attribute('[data-k=product] [aria-pressed=true]','data-v'), '| D', await pg.input_value('#rollerD'), '| status', await pg.inner_text('#status'))
        # U7 mobile layout roller
        await pg.set_viewport_size({'width':390,'height':844}); await pg.wait_for_timeout(1500)
        print('U7 mobile scrollWidth', await pg.evaluate('document.documentElement.scrollWidth'))
        await pg.screenshot(path='mobile_roller.png', full_page=True)
        print('errs', errs); await b.close()
asyncio.run(main())
