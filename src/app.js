(() => {
const $ = s => document.querySelector(s);
const STORE = 'stamp-printer-v1', LANG_KEY = 'stamp-printer-lang';
// Interface language: what the visitor picked before, else the browser language (Chinese, Japanese, Korean), else English.
const LANGS = ['zh', 'en', 'ja', 'ko'];
let LANG = (() => { try { const v = localStorage.getItem(LANG_KEY); if (LANGS.includes(v)) return v; } catch (e) {} const m = /^(zh|ja|ko)/i.exec(navigator.language || ''); return m ? m[1].toLowerCase() : 'en'; })();
// tl(Chinese, English, Japanese, Korean): Japanese / Korean fall back to English when missing.
const tl = (zh, en, ja, ko) => LANG === 'zh' ? zh : LANG === 'ja' && ja != null ? ja : LANG === 'ko' && ko != null ? ko : en;
const pl = (n, one, many) => n === 1 ? one : many;

const EN0 = LANG === 'en';   // first-visit sample text and font follow the interface language
const SAMPLE = { zh: ['陈氏/之印', 'v', '山间手作工作室', '印', '欢迎光临', 'Noto Sans SC'], en: ['Thank/You', 'h', 'HANDMADE WITH LOVE', 'A', 'EST. 2026', 'Roboto Slab'],
  ja: ['山田', 'v', 'てづくりの店', '印', 'ようこそ', 'Noto Sans JP'], ko: ['김하나', 'v', '손으로 만든 공방', '★', '어서 오세요', 'Noto Sans KR'] }[LANG];
const DEF = {
  shape: 'square', w: 20, h: 12, corner: 1, border: 1.2, mode: 'yang', layout: 'ring',
  text: SAMPLE[0], dir: SAMPLE[1], gap: 0.4, pad: 0.6,
  ringText: SAMPLE[2], ringH: 6, ringSpan: 220, center: 'star', centerSize: 11, centerText: SAMPLE[3], bottomText: SAMPLE[4], bottomH: 5, bottomY: 9,
  font: SAMPLE[5], weight: 700, stretch: 1.2, thicken: 0,
  reliefH: 1.5, baseT: 2.5, margin: 1, mirror: true, ppm: 10,
  handle: 'grip', handleH: 30, gripD: 16, gripShape: 'round', trans: 'straight', maxAngle: 35, bulge: 0, chamfer: 0.6, groove: 'long', grooveD: 2, grooveW: 100, grooveShape: 'arc', neckH: 3, handlePad: 0.5, nozzle: 0.4, topInset: 0.15, imgMode: 'none', imgThreshold: 128, imgInvert: false, imgSize: 0.45, imgPos: 'top', imgGap: 1, imgFit: 'fit', imgScale: 1, imgAlign: 'center', slicer: 'a1-0.2-010', product: 'stamp', rollerD: 45, rollerL: 100, rollerHole: 30, rollerN: 2, rollerM: 2, rollerGap: 4, rollerEnd: 3, rollerSlope: false,
  cutterKind: 'cookie', cutterShape: 'follow', cutterW: 60, cutterH: 60, cutterOffset: 3, cutterHeight: 12, bladeT: 0.8, wallT: 1.6, flangeW: 4, flangeT: 2, cutterImprint: false, imprintGap: 2, _v: 2
};
const PRESETS = {
  name: { product: 'stamp', shape: 'square', w: 20, corner: 1, border: 1.2, mode: 'yang', dir: 'v', gap: 0.4, pad: 0.6, stretch: 1.2 },
  round: { product: 'stamp', shape: 'circle', w: 40, border: 1.2, mode: 'yang', layout: 'ring', ringH: 6, ringSpan: 220, centerSize: 11, bottomH: 5, bottomY: 9, pad: 0.8, stretch: 1.2 },
  long: { product: 'stamp', shape: 'rect', w: 50, h: 15, corner: 1.5, border: 1, mode: 'yang', dir: 'h', gap: 1.2, pad: 1, stretch: 1.2 },
  roller: { product: 'roller', mode: 'yang', dir: 'h' }
};
const FONTS = [
  { id: 'Noto Serif SC', name: '思源宋体', en: 'Source Han Serif SC', ja: '源ノ明朝 SC', ko: '본명조 SC', weights: [400, 700, 900], lang: 'zh' },
  { id: 'Noto Sans SC', name: '思源黑体', en: 'Source Han Sans SC', ja: '源ノ角ゴシック SC', ko: '본고딕 SC', weights: [400, 700, 900], lang: 'zh' },
  { id: 'ZCOOL QingKe HuangYou', name: '庆科黄油体（方块感）', en: 'ZCOOL QingKe HuangYou (blocky)', lang: 'zh' },
  { id: 'Ma Shan Zheng', name: '马善政楷书', en: 'Ma Shan Zheng (brush)', lang: 'zh' },
  { id: 'ZCOOL XiaoWei', name: '站酷小薇', en: 'ZCOOL XiaoWei', lang: 'zh' },
  { id: 'Zhi Mang Xing', name: '志莽行书', en: 'Zhi Mang Xing (cursive)', lang: 'zh' },
  { id: 'Long Cang', name: '龙藏体', en: 'Long Cang (handwriting)', lang: 'zh' },
  { id: 'Liu Jian Mao Cao', name: '刘建毛草', en: 'Liu Jian Mao Cao (grass script)', lang: 'zh' },
  { id: 'Cinzel', name: 'Cinzel（古典大写，适合印章）', en: 'Cinzel (classic caps)', weights: [400, 700, 900], lang: 'en' },
  { id: 'Playfair Display', name: 'Playfair Display（衬线）', en: 'Playfair Display (serif)', weights: [400, 700, 900], lang: 'en' },
  { id: 'Roboto Slab', name: 'Roboto Slab（粗衬线，好打）', en: 'Roboto Slab (slab serif, prints well)', weights: [400, 700, 900], lang: 'en' },
  { id: 'Oswald', name: 'Oswald（窄黑体）', en: 'Oswald (condensed sans)', weights: [400, 700], lang: 'en' },
  { id: 'Bebas Neue', name: 'Bebas Neue（窄大写）', en: 'Bebas Neue (condensed caps)', lang: 'en' },
  { id: 'Pacifico', name: 'Pacifico（手写）', en: 'Pacifico (script)', lang: 'en' },
  { id: 'Noto Serif TC', name: '思源宋体 繁体', en: 'Source Han Serif TC', ja: '源ノ明朝 TC', ko: '본명조 TC', weights: [400, 700, 900], lang: 'tc' },
  { id: 'Noto Sans TC', name: '思源黑体 繁体', en: 'Source Han Sans TC', ja: '源ノ角ゴシック TC', ko: '본고딕 TC', weights: [400, 700, 900], lang: 'tc' },
  { id: 'LXGW WenKai TC', name: '霞鹜文楷 繁体', en: 'LXGW WenKai TC', weights: [400, 700], lang: 'tc' },
  { id: 'Noto Serif JP', name: '思源明朝 日文', en: 'Source Han Serif JP', ja: '源ノ明朝', ko: '본명조 JP', weights: [400, 700, 900], lang: 'ja' },
  { id: 'Noto Sans JP', name: '思源黑体 日文', en: 'Source Han Sans JP', ja: '源ノ角ゴシック', ko: '본고딕 JP', weights: [400, 700, 900], lang: 'ja' },
  { id: 'Yuji Syuku', name: '佑字 毛笔（日文）', en: 'Yuji Syuku (brush, JP)', ja: '佑字 肅（毛筆）', lang: 'ja' },
  { id: 'Noto Serif KR', name: '思源明朝 韩文', en: 'Source Han Serif KR', ja: '源ノ明朝 KR', ko: '본명조', weights: [400, 700, 900], lang: 'ko' },
  { id: 'Noto Sans KR', name: '思源黑体 韩文', en: 'Source Han Sans KR', ja: '源ノ角ゴシック KR', ko: '본고딕', weights: [400, 700, 900], lang: 'ko' },
  { id: 'Song Myung', name: '宋明体（韩文）', en: 'Song Myung (KR)', ko: '송명', lang: 'ko' },
  { id: 'Gowun Batang', name: 'Gowun 明朝（韩文）', en: 'Gowun Batang (KR)', ko: '고운바탕', weights: [400, 700], lang: 'ko' }
];
const LANG_NAMES = { zh: { zh: '中文', tc: '中文繁体', en: '英文', ja: '日文', ko: '韩文' }, en: { zh: 'Chinese', tc: 'Traditional Chinese', en: 'English', ja: 'Japanese', ko: 'Korean' },
  ja: { zh: '中国語', tc: '中国語（繁体）', en: '英語', ja: '日本語', ko: '韓国語' }, ko: { zh: '중국어', tc: '중국어 번체', en: '영어', ja: '일본어', ko: '한국어' } };
const langName = l => LANG_NAMES[LANG][l];
const fontLabel = f => (LANG === 'zh' ? f.name : f[LANG] || f.en || f.name).replace(/（[^）]*）|\s*\([^)]*\)/g, '');
let glyphLog = null;
let customFonts = []; // {id, family, name}

let S = { ...DEF };
try {
  const raw = localStorage.getItem(STORE);
  if (raw) {
    const st = JSON.parse(raw); S = { ...DEF, ...st };
    // Saves before v2 could carry the old -1 mm 腰身 default, which made 直筒 waisted. Reset it once.
    if (!(st._v >= 2)) S.bulge = 0;
  }
} catch (e) {}
// 凹槽 used to be stored as x (左右) / y (前后); it is now 长边 / 短边 so a long stamp gets grooves on its long sides.
const migrate = st => { if (st.groove === 'x') st.groove = 'long'; else if (st.groove === 'y') st.groove = 'short'; return st; };
migrate(S);
if (S.handle === 'neck') S.handle = 'grip';
S.trans = 'straight'; // only the straight handle is offered; the slim-handle styles were removed from the page
if (S.maxAngle === undefined || !isFinite(S.maxAngle)) { S.maxAngle = 35; S.trans = 'straight'; }
const persist = () => { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} };

const eff = s => ({ ...s, layout: (s.product || 'stamp') === 'stamp' && s.shape === 'circle' ? s.layout : 'grid' });
const LIMIT_EN = { w: 'Size', h: 'Height', corner: 'Corner radius', border: 'Border', pad: 'Padding', gap: 'Spacing', ringH: 'Ring text height', ringSpan: 'Ring angle', centerSize: 'Center size', bottomH: 'Bottom text height', bottomY: 'Move down',
  stretch: 'Stretch', thicken: 'Bold +', reliefH: 'Relief height', topInset: 'Top inset', imgThreshold: 'Threshold', imgSize: 'Picture size', imgGap: 'Gap', imgScale: 'Picture size', baseT: 'Base thickness', margin: 'Margin',
  handleH: 'Handle height', gripD: 'Grip width', maxAngle: 'Max slope', bulge: 'Waist', chamfer: 'Bottom chamfer', grooveD: 'Groove depth', grooveW: 'Groove width', neckH: 'Collar', handlePad: 'Handle offset', nozzle: 'Nozzle',
  rollerD: 'Roller diameter', rollerL: 'Roller length', rollerHole: 'Hole diameter', rollerN: 'Repeats around', rollerM: 'Repeats along', rollerGap: 'Pattern gap', rollerEnd: 'End margin',
  cutterW: 'Design width', cutterH: 'Design height', cutterOffset: 'Outline offset', cutterHeight: 'Cutter height', bladeT: 'Blade', wallT: 'Wall base', flangeW: 'Rim width', flangeT: 'Rim thickness', imprintGap: 'Imprint inset' };
const LIMIT_JA = {"w": "サイズ", "h": "高さ", "corner": "角の丸み", "border": "枠の太さ", "pad": "余白", "gap": "字間", "ringH": "リング文字の高さ", "ringSpan": "リングの角度", "centerSize": "中央のサイズ", "bottomH": "下の文字の高さ", "bottomY": "下へ移動", "stretch": "縦長", "thicken": "太らせる", "reliefH": "凸の高さ", "topInset": "先端を細く", "imgThreshold": "しきい値", "imgSize": "画像サイズ", "imgGap": "間隔", "imgScale": "画像サイズ", "baseT": "台座の厚さ", "margin": "外側の余白", "handleH": "持ち手の高さ", "gripD": "持ち手の幅", "maxAngle": "最大傾斜", "bulge": "くびれ", "chamfer": "底の面取り", "grooveD": "溝の深さ", "grooveW": "溝の幅", "neckH": "ストレート部", "handlePad": "持ち手の張り出し", "nozzle": "ノズル径", "rollerD": "ローラーの直径", "rollerL": "ローラーの長さ", "rollerHole": "穴の直径", "rollerN": "1 周の繰り返し", "rollerM": "長さ方向の繰り返し", "rollerGap": "模様の間隔", "rollerEnd": "両端の余白", "cutterW": "図柄の幅", "cutterH": "図柄の高さ", "cutterOffset": "外形の広げ幅", "cutterHeight": "抜き型の高さ", "bladeT": "刃先", "wallT": "根元", "flangeW": "ツバの幅", "flangeT": "ツバの厚さ", "imprintGap": "型押しの深さ"}, LIMIT_KO = {"w": "크기", "h": "높이", "corner": "모서리 둥글기", "border": "테두리", "pad": "여백", "gap": "자간", "ringH": "둥근 글자 높이", "ringSpan": "둥근 글자 각도", "centerSize": "가운데 크기", "bottomH": "아래 글자 높이", "bottomY": "아래로 이동", "stretch": "늘이기", "thicken": "굵게 +", "reliefH": "돌출 높이", "topInset": "윗면 좁히기", "imgThreshold": "임계값", "imgSize": "이미지 크기", "imgGap": "간격", "imgScale": "이미지 크기", "baseT": "받침판 두께", "margin": "바깥 여백", "handleH": "손잡이 높이", "gripD": "손잡이 폭", "maxAngle": "최대 경사", "bulge": "허리", "chamfer": "아래 모따기", "grooveD": "홈 깊이", "grooveW": "홈 너비", "neckH": "직선부", "handlePad": "손잡이 확장", "nozzle": "노즐", "rollerD": "롤러 지름", "rollerL": "롤러 길이", "rollerHole": "구멍 지름", "rollerN": "둘레 반복", "rollerM": "길이 반복", "rollerGap": "무늬 간격", "rollerEnd": "양끝 여백", "cutterW": "디자인 너비", "cutterH": "디자인 높이", "cutterOffset": "외형 확장", "cutterHeight": "커터 높이", "bladeT": "칼날", "wallT": "밑동", "flangeW": "받침 폭", "flangeT": "받침 두께", "imprintGap": "압인 간격"};
const limName = k => tl(LIMITS[k][2], LIMIT_EN[k], LIMIT_JA[k], LIMIT_KO[k]);
// Safe ranges for every number. Typed values outside them are generated at the nearest limit, with a note.
const LIMITS = {
  w: [5, 150, '尺寸'], h: [5, 150, '高'], corner: [0, 30, '圆角'], border: [0, 10, '边框粗'], pad: [0, 20, '内边距'], gap: [0, 10, '字间距'],
  ringH: [1, 30, '环字高'], ringSpan: [30, 350, '环绕角度'], centerSize: [1, 60, '中心大小'], bottomH: [1, 30, '下方字高'], bottomY: [-40, 40, '下移'],
  stretch: [1, 2.5, '拉伸'], thicken: [0, 0.8, '加粗'], reliefH: [0.4, 10, '字凸起'], topInset: [0, 0.4, '字顶收窄'], imgThreshold: [10, 245, '深浅阈值'], imgSize: [0.15, 0.85, '图案占比'], imgGap: [0, 15, '图文间距'], imgScale: [0.2, 1, '图案大小'], baseT: [0.6, 20, '底板厚'], margin: [0, 20, '外留边'],
  handleH: [2, 150, '手柄高度'], gripD: [4, 150, '细柄粗细'], maxAngle: [10, 45, '最大坡度'], bulge: [-8, 8, '腰身'], chamfer: [0, 10, '底端倒角'],
  grooveD: [0, 15, '凹槽深度'], grooveW: [30, 100, '凹槽宽度'], neckH: [0, 50, '直段'], handlePad: [0, 10, '手柄外扩'], nozzle: [0.1, 1.2, '喷嘴直径'],
  rollerD: [15, 150, '滚轮直径'], rollerL: [20, 240, '滚轮长度'], rollerHole: [0, 140, '内孔直径'], rollerN: [1, 12, '每圈重复'], rollerM: [1, 8, '沿长重复'], rollerGap: [0, 20, '图案间距'], rollerEnd: [0, 30, '两端留边'],
  cutterW: [8, 200, '图案宽'], cutterH: [8, 200, '图案高'], cutterOffset: [0.5, 15, '外扩'], cutterHeight: [4, 40, '切模高度'], bladeT: [0.4, 3, '刀口厚'], wallT: [0.8, 5, '根部厚'], flangeW: [0, 15, '边沿宽'], flangeT: [1, 6, '边沿厚'], imprintGap: [0.5, 10, '压纹离刀口']
};
const clampTo = (k, v) => { const L = LIMITS[k]; return L ? Math.min(L[1], Math.max(L[0], v)) : v; };
const isRect = s => s.shape === 'rect' && Math.abs(s.w - s.h) > 0.01;
function grooveAxis(s) {
  const g = s.groove; if (g === 'none' || g === 'xy') return g;
  const { fw, fh } = faceDims(s), horiz = fw > fh + 0.01;           // a wide stamp's long sides face front/back (y)
  return g === 'long' ? (horiz ? 'y' : 'x') : (horiz ? 'x' : 'y');
}
const grooveLabel = s => ({ long: isRect(s) ? tl('长边', 'long sides', '長辺', '긴 변') : tl('左右', 'left & right', '左右', '좌우'), short: isRect(s) ? tl('短边', 'short sides', '短辺', '짧은 변') : tl('前后', 'front & back', '前後', '앞뒤'), xy: tl('四面', 'all four sides', '四面', '네 면') })[s.groove];
function sane(s0) {
  const s = { ...s0 }, W = new Map();
  const warns = { push: (m, k = m) => W.set(k, m) };
  // With a handle the 直段 is what the text stands on, so there is no separate 底板; it only exists for a face-only stamp.
  const grip = s.handle === 'grip';
  for (const k of Object.keys(LIMITS)) {
    if (grip && k === 'baseT') continue;
    const v = +s[k]; if (!isFinite(v)) { s[k] = DEF[k]; continue; }
    const c = clampTo(k, v); if (c !== v) { s[k] = c; warns.push(tl(`「${limName(k)}」超出范围，已按 ${c} 生成`, `${limName(k)} is out of range; used ${c}`, `「${limName(k)}」が範囲外のため ${c} にしました`, `‘${limName(k)}’ 값이 범위를 벗어나 ${c}(으)로 만들었습니다`), k); }
  }
  s.ppm = [6, 10, 16].includes(+s.ppm) ? +s.ppm : 10;
  if (grip) {
    s.baseT = 0;
    if (s.neckH < 0.6) { s.neckH = 0.6; warns.push(tl('「直段」最少 0.6 mm，已按 0.6 生成', 'Collar must be at least 0.6 mm; used 0.6', 'ストレート部は 0.6 mm 以上必要なので 0.6 にしました', '직선부는 0.6 mm 이상이어야 해서 0.6으로 만들었습니다'), 'neckH'); }
  }
  const { fw, fh } = faceDims(eff(s)), min = Math.min(fw, fh);
  if (s.border > min * 0.25) { s.border = +(min * 0.25).toFixed(1); warns.push(tl(`边框太粗，已按 ${s.border} mm 生成`, `Border too thick; used ${s.border} mm`, `枠が太すぎるため ${s.border} mm にしました`, `테두리가 너무 두꺼워 ${s.border} mm로 만들었습니다`), 'border'); }
  if (s.shape !== 'circle' && s.corner > min / 2) s.corner = min / 2;
  if (2 * (s.border + s.pad) > min * 0.85) { s.pad = Math.max(0, +(min * 0.425 - s.border).toFixed(1)); warns.push(tl(`内边距太大，已按 ${s.pad} mm 生成`, `Padding too large; used ${s.pad} mm`, `余白が大きすぎるため ${s.pad} mm にしました`, `여백이 너무 커서 ${s.pad} mm로 만들었습니다`), 'pad'); }
  const gMax = +((min + 2 * s.margin) * 0.25).toFixed(1);
  if (s.product === 'cutter' && s.bladeT > s.wallT) { s.bladeT = s.wallT; warns.push(tl(`刀口不能比根部厚，已按 ${s.bladeT} mm 生成`, `The blade can’t be thicker than the wall base; used ${s.bladeT} mm`, `刃先は根元より厚くできないため ${s.bladeT} mm にしました`, `칼날은 밑동보다 두꺼울 수 없어 ${s.bladeT} mm로 만들었습니다`), 'bladeT'); }
  if (s.product === 'roller' && s.rollerHole > s.rollerD - 4) { s.rollerHole = Math.max(0, +(s.rollerD - 4).toFixed(1)); warns.push(tl(`内孔太大，壁至少 2 mm，已按 Ø${s.rollerHole} 生成`, `Hole too big (wall must be at least 2 mm); used Ø${s.rollerHole}`, `穴が大きすぎます（壁は 2 mm 以上必要）。Ø${s.rollerHole} にしました`, `구멍이 너무 큽니다(벽은 2 mm 이상 필요). Ø${s.rollerHole}(으)로 만들었습니다`), 'rollerHole'); }
  if (s.handle === 'grip' && s.groove !== 'none' && s.grooveD > gMax) { s.grooveD = gMax; warns.push(tl(`凹槽最深是印面宽的 1/4，已按 ${gMax} mm 生成`, `Groove depth is at most 1/4 of the face; used ${gMax} mm`, `溝の深さは印面の幅の 1/4 までなので ${gMax} mm にしました`, `홈 깊이는 인면 폭의 1/4까지라서 ${gMax} mm로 만들었습니다`), 'grooveD'); }
  s.grooveAxis = grooveAxis(s);
  return { s, warns: [...W.values()] };
}
const fontInfo = id => FONTS.find(f => f.id === id) || customFonts.find(f => f.id === id) || FONTS[0];
const fontStr = s => { const f = fontInfo(s.font); const fam = f.family || f.id; const wt = f.weights ? s.weight : 400; return `${wt} 100px "${fam}", "Noto Serif SC", serif`; };
const mainKey = s => eff(s).layout === 'ring' ? 'ringText' : 'text';
const allText = s => [s.text, s.ringText, s.centerText, s.bottomText].join('');
// Only the characters this stamp actually prints (a square stamp ignores the round stamp's ring / bottom text).
const drawnText = s => eff(s).layout === 'ring' ? [s.ringText, s.center === 'text' ? s.centerText : '', s.bottomText].join('') : (s.text || '');

/* ---------- 图案：上传的图片转成黑白，深色凸起 ---------- */
let imgSrc = null, imgName = '', imgCache = { key: '' };
// Soft threshold (a ±12 grey-level ramp) keeps edges smooth instead of stair-stepped; transparent pixels count as white.
function imgMask(s) {
  if (!imgSrc) return null;
  const whole = rollerWallpaper(s), key = s.imgThreshold + '|' + s.imgInvert + '|' + imgSrc.width + '|' + whole;
  if (imgCache.key === key) return imgCache;
  const W = imgSrc.width, H = imgSrc.height, d = imgSrc.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, W, H).data;
  const out = canvas(W, H), oc = out.getContext('2d'), od = oc.createImageData(W, H);
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let i = 0, n = W * H; i < n; i++) {
    const al = d[i * 4 + 3] / 255, lum = al * (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) + (1 - al) * 255;
    const v = Math.min(1, Math.max(0, (s.imgThreshold - lum) / 24 + 0.5));
    od.data[i * 4 + 3] = Math.round((s.imgInvert ? 1 - v : v) * 255);
    if (v > 0.5) { const x = i % W, y = (i - x) / W; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  oc.putImageData(od, 0, 0);
  if (x1 < 0) { imgCache = { key, mask: null, aspect: 1 }; return null; }
  // a repeating pattern keeps the whole picture, margins included, so the repeats line up exactly
  if (whole) { x0 = 0; y0 = 0; x1 = W - 1; y1 = H - 1; }
  // Trim to the design itself (the dark part), not the photo's empty margin. Inverted, the design is cut out of a block
  // that is a little bigger than the design, so its edges stay closed instead of running off the block.
  const m = s.imgInvert && !whole ? Math.round(0.1 * Math.max(x1 - x0, y1 - y0)) : 0, cw = x1 - x0 + 1 + 2 * m, ch = y1 - y0 + 1 + 2 * m, crop = canvas(cw, ch), cc = crop.getContext('2d');
  if (m) { cc.fillStyle = '#000'; cc.fillRect(0, 0, cw, ch); cc.clearRect(m, m, cw - 2 * m, ch - 2 * m); }
  cc.drawImage(out, x0, y0, cw - 2 * m, ch - 2 * m, m, m, cw - 2 * m, ch - 2 * m);
  imgCache = { key, mask: crop, aspect: cw / ch }; return imgCache;
}
// 铺满: cover the whole box (cropping the picture), for patterns that should run edge to edge
function drawImageCover(ctx, im, x, y, w, h) {
  if (!im || !im.mask || w <= 0 || h <= 0) return;
  const iw = im.mask.width, ih = im.mask.height, k = Math.max(w / iw, h / ih), sw = w / k, sh = h / k;
  ctx.save(); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im.mask, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h); ctx.restore();
  if (glyphLog) glyphLog.push({ ch: tl('图案', 'Picture', '画像', '이미지'), w, h });
}
function drawImageFit(ctx, im, x, y, w, h) {
  if (!im || !im.mask || w <= 0 || h <= 0) return;
  let dw = w, dh = w / im.aspect; if (dh > h) { dh = h; dw = h * im.aspect; }
  ctx.save(); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im.mask, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh); ctx.restore();
  if (glyphLog) glyphLog.push({ ch: tl('图案', 'Picture', '画像', '이미지'), w: dw, h: dh });
}
// Load a picture (PNG / JPG / WebP / SVG) into a source canvas at most 1600 px on its long side.
function loadImageURL(url) {
  return new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => {
      let w = im.naturalWidth || 1024, h = im.naturalHeight || 1024; const k = Math.min(1, 1600 / Math.max(w, h)) || 1;
      if (Math.max(w, h) < 600) { const up = 600 / Math.max(w, h); w *= up; h *= up; } else { w *= k; h *= k; }
      const c = canvas(Math.round(w), Math.round(h)), x = c.getContext('2d', { willReadFrequently: true });
      x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height); res(c);
    };
    im.onerror = () => rej(new Error(tl('读不了这张图片', 'Could not read this picture', 'この画像を読み込めませんでした', '이 이미지를 읽을 수 없습니다')));
    im.src = url;
  });
}
function setImage(c, name) { imgSrc = c; imgName = name || tl('图案', 'picture', '画像', '이미지'); imgCache = { key: '' }; }
const imgDataURL = () => imgSrc ? imgSrc.toDataURL('image/png') : null;

/* ---------- drawing the stamp face (unmirrored, as the impression) ---------- */
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function faceDims(s) { return s.shape === 'rect' ? { fw: s.w, fh: s.h } : { fw: s.w, fh: s.w }; }
function facePath(ctx, s, fw, fh, inset) {
  ctx.beginPath();
  if (s.shape === 'circle') { ctx.arc(fw / 2, fh / 2, Math.max(0.01, fw / 2 - inset), 0, Math.PI * 2); return; }
  const x = inset, y = inset, w = fw - 2 * inset, h = fh - 2 * inset;
  const r = Math.max(0, Math.min(s.corner - inset, w / 2, h / 2));
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function star(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.382 : r; ctx.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a)); }
  ctx.closePath(); ctx.fill();
}
function drawGlyph(ctx, ch, x, y, w, h, s) {
  if (w <= 0 || h <= 0) return;
  if (ch === '★' || ch === '☆') { const r = Math.min(w, h) / 2; star(ctx, x + w / 2, y + h / 2, r); if (glyphLog) glyphLog.push({ ch: '★', w: 1.902 * r, h: 1.809 * r }); return; }
  ctx.font = fontStr(s); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const m = ctx.measureText(ch);
  const L = m.actualBoundingBoxLeft, R = m.actualBoundingBoxRight, A = m.actualBoundingBoxAscent, D = m.actualBoundingBoxDescent;
  const gw = L + R, gh = A + D; if (!(gw > 0.5 && gh > 0.5)) return;
  let sx = w / gw, sy = h / gh; const m0 = Math.min(sx, sy), k = Math.max(1, s.stretch);
  sx = Math.min(sx, m0 * k); sy = Math.min(sy, m0 * k);
  if (glyphLog) glyphLog.push({ ch, w: gw * sx, h: gh * sy });
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(sx, sy); ctx.fillText(ch, -(R - L) / 2, (A - D) / 2); ctx.restore();
}
function drawLine(ctx, text, cx, cy, h, maxW, s) {
  if (isLatin(text)) { const z = inkSize(ctx, text, s), cap = inkSize(ctx, 'HXg', s), sc = Math.min(h / (cap.a + cap.d), maxW / z.w); if (!(sc > 0)) return;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.font = fontStr(s); ctx.textBaseline = 'alphabetic'; ctx.fillText(text, -(z.R - z.L) / 2, (cap.a - cap.d) / 2); ctx.restore();
    if (glyphLog) glyphLog.push({ ch: text, w: z.w * sc, h: (z.a + z.d) * sc }); return; }
  const chars = Array.from(text.replace(/\s+/g, '')); const n = chars.length; if (!n || maxW <= 0) return;
  const cw = Math.min(h, maxW / n), tot = cw * n;
  chars.forEach((c, i) => drawGlyph(ctx, c, cx - tot / 2 + i * cw + cw * 0.04, cy - h / 2, cw * 0.92, h, s));
}
function groupsFor(text, dir, bw, bh) {
  const raw = (text || '').replace(/\s+/g, '');
  if (/[\/|｜]/.test(raw)) return raw.split(/[\/|｜]/).map(t => Array.from(t)).filter(a => a.length);
  const chars = Array.from(raw), n = chars.length; if (!n) return [];
  let best = null;
  for (let k = 1; k <= n; k++) {
    const per = Math.ceil(n / k); if (Math.ceil(n / per) !== k) continue;
    const cw = dir === 'v' ? bw / k : bw / per, ch = dir === 'v' ? bh / per : bh / k;
    const score = Math.abs(Math.log(cw / ch)) + (k * per - n) * 0.35;
    if (!best || score < best.score) best = { score, per };
  }
  const out = []; for (let i = 0; i < n; i += best.per) out.push(chars.slice(i, i + best.per)); return out;
}
// The area inside the border and padding where text or a picture goes (a round face uses its inscribed square).
function innerBox(s, fw, fh) {
  const inset = s.border + s.pad;
  if (s.shape === 'circle') { const side = Math.max(0, fw / 2 - inset) * Math.SQRT2; return { x: fw / 2 - side / 2, y: fh / 2 - side / 2, w: side, h: side }; }
  return { x: inset, y: inset, w: fw - 2 * inset, h: fh - 2 * inset };
}
/* 图案 + 文字：图按占比先放，字用剩下的地方；然后按图和字实际占的大小收紧，
   整组在印面里居中，另一方向按「对齐」靠左 / 居中 / 靠右（图在左右时是靠上 / 居中 / 靠下）。 */
function inkBox(c, ppm, P) {
  const W = c.width, H = c.height, d = c.getContext('2d').getImageData(0, 0, W, H).data; let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] >= 128) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return x1 < 0 ? null : { x: (x0 - P) / ppm, y: (y0 - P) / ppm, w: (x1 - x0 + 1) / ppm, h: (y1 - y0 + 1) / ppm };
}
function drawImgText(tt, s, fw, fh, im, W, H, ppm, P) {
  const b = innerBox(s, fw, fh), g = +s.imgGap, pos = s.imgPos, horiz = pos === 'left' || pos === 'right', imgFirst = pos === 'top' || pos === 'left';
  const main = horiz ? b.w : b.h, cross = horiz ? b.h : b.w, m0 = horiz ? b.x : b.y, c0 = horiz ? b.y : b.x;
  if (!im || !im.mask) { drawGrid(tt, s, fw, fh); return; }
  // picture: fits inside its share, keeping its shape
  // 图案大小 scales the picture itself: 85% is the biggest it can be (still leaving 15% of the length for the text).
  // Before, it only set a share of the length, so when the other side was the limit the slider did nothing.
  const sw = horiz ? main * 0.85 : cross, sh = horiz ? cross : main * 0.85, k = Math.min(1, s.imgSize / 0.85);
  const dh = Math.min(sh, sw / im.aspect) * k, dw = dh * im.aspect, iMain = horiz ? dw : dh, iCross = horiz ? dh : dw;
  // text: everything after the picture and the gap; draw it once off-screen to see how much room it really takes
  const tMain = main - iMain - g, tBox = horiz ? { x: 0, y: 0, w: tMain, h: cross } : { x: 0, y: 0, w: cross, h: tMain };
  tBox.align = horiz ? 'center' : s.imgAlign; tBox.compact = true;
  let ink = null;
  if (tMain > 0.5 && (s.text || '').trim()) {
    const T2 = canvas(W, H), t2 = T2.getContext('2d', { willReadFrequently: true }), keep = glyphLog; glyphLog = null;
    t2.setTransform(ppm, 0, 0, ppm, P, P); t2.fillStyle = '#000'; drawGrid(t2, s, fw, fh, tBox); glyphLog = keep;
    ink = inkBox(T2, ppm, P);
  }
  const tm = ink ? (horiz ? ink.w : ink.h) : 0, tc = ink ? (horiz ? ink.h : ink.w) : 0;
  const L = iMain + (ink ? g + tm : 0), start = m0 + (main - L) / 2;
  const at = size => s.imgAlign === 'start' ? c0 : s.imgAlign === 'end' ? c0 + cross - size : c0 + (cross - size) / 2;
  const iM = imgFirst || !ink ? start : start + tm + g, iC = at(iCross);
  drawImageFit(tt, im, horiz ? iM : iC, horiz ? iC : iM, dw, dh);
  if (ink) {
    const tM = imgFirst ? start + iMain + g : start, tC = at(tc), tx = horiz ? tM : tC, ty = horiz ? tC : tM;
    drawGrid(tt, s, fw, fh, { ...tBox, x: tBox.x + tx - ink.x, y: tBox.y + ty - ink.y });
  }
}
/* 英文：按单词、按行排，不再一个字母一个格子。 */
const CJK_RE = /[\u2E80-\u9FFF\u3040-\u30FF\u3400-\u4DBF\uAC00-\uD7AF\uF900-\uFAFF\uFF00-\uFFEF]/;
const isLatin = t => !!(t && t.trim()) && !CJK_RE.test(t);
// Width and height (ink box) of a string at 100 px in the stamp font.
function inkSize(ctx, t, s) { ctx.font = fontStr(s); const m = ctx.measureText(t); return { w: m.actualBoundingBoxLeft + m.actualBoundingBoxRight, a: m.actualBoundingBoxAscent, d: m.actualBoundingBoxDescent, L: m.actualBoundingBoxLeft, R: m.actualBoundingBoxRight, adv: m.width }; }
// Lines: '/' splits lines by hand; otherwise words are grouped into the number of lines that gives the biggest letters.
function latinLines(ctx, text, s, bw, bh) {
  if (/[\/|｜]/.test(text)) return text.split(/[\/|｜]/).map(t => t.trim()).filter(Boolean);
  const words = text.trim().split(/\s+/); let best = [words.join(' ')], bestSize = 0;
  for (let k = 1; k <= Math.min(words.length, 4); k++) {
    // split the words into k lines of similar width (greedy on a target width)
    const total = inkSize(ctx, words.join(' '), s).w, target = total / k, lines = []; let cur = [];
    for (const w of words) { const t = [...cur, w].join(' '); if (cur.length && inkSize(ctx, t, s).w > target * 1.15 && lines.length < k - 1) { lines.push(cur.join(' ')); cur = [w]; } else cur.push(w); }
    lines.push(cur.join(' '));
    const capH = inkSize(ctx, 'HXg', s), lineH = capH.a + capH.d, maxW = Math.max(...lines.map(l => inkSize(ctx, l, s).w));
    const size = Math.min(bh / (lines.length * lineH * 1.15), bw / maxW);
    if (size > bestSize * 1.02) { bestSize = size; best = lines; }
  }
  return best;
}
function drawLatin(ctx, text, s, bx, by, bw, bh, align) {
  const lines = latinLines(ctx, text, s, bw, bh), n = lines.length, g = s.gap;
  const cap = inkSize(ctx, 'HXg', s), unitH = cap.a + cap.d;
  const rowMax = (bh - g * (n - 1)) / n, sizes = lines.map(l => inkSize(ctx, l, s));
  // one letter size for every line, so a short line doesn't come out bigger than a long one
  let sc = Math.min(rowMax / unitH, ...sizes.map(z => bw / z.w));
  // when the width is what limits the size, keep the lines together and centre the block instead of spreading them out
  const rowH = unitH * sc, lead = g + (n > 1 ? Math.min(rowH * 0.12, rowMax - rowH) : 0), top = by + (bh - n * rowH - lead * (n - 1)) / 2;
  lines.forEach((l, i) => {
    const z = sizes[i], sx = Math.min(sc * s.stretch, bw / z.w), sy = sc;   // 拉伸填满 may widen a line up to the box width
    const lw = z.w * sx, cy = top + i * (rowH + lead) + rowH / 2, cx = align === 'start' ? bx + lw / 2 : align === 'end' ? bx + bw - lw / 2 : bx + bw / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sx, sy); ctx.font = fontStr(s); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    ctx.fillText(l, -(z.R - z.L) / 2, (cap.a - cap.d) / 2); ctx.restore();
    if (glyphLog) glyphLog.push({ ch: l, w: z.w * sx, h: (z.a + z.d) * sy });
  });
}
function drawGrid(ctx, s, fw, fh, box) {
  const b = box || innerBox(s, fw, fh), bx = b.x, by = b.y, bw = b.w, bh = b.h;
  if (isLatin(s.text)) { drawLatin(ctx, s.text, s, bx, by, bw, bh, b.align); return; }
  const groups = groupsFor(s.text, s.dir, bw, bh), G = groups.length, g = s.gap; if (!G) return;
  // b.compact (图案 + 文字): cells no wider / taller than 拉伸填满 allows, so the characters stay together instead of spreading over the space
  const k = Math.max(1, s.stretch);
  if (s.dir === 'v') {
    let cw = bw / G; const maxN = Math.max(...groups.map(c => c.length));
    if (b.compact) cw = Math.min(cw, (bh / maxN - g) * k + g);
    const x0 = bx + (bw - cw * G) / 2;
    groups.forEach((col, i) => { const x = x0 + (G - 1 - i) * cw; let ch = bh / col.length; if (b.compact) ch = Math.min(ch, (cw - g) * k + g); const y0 = by + (bh - ch * col.length) / 2;
      col.forEach((c, j) => drawGlyph(ctx, c, x + g / 2, y0 + j * ch + g / 2, cw - g, ch - g, s)); });
  } else {
    let rh = bh / G; const maxN = Math.max(...groups.map(r => r.length));
    if (b.compact) rh = Math.min(rh, (bw / maxN - g) * k + g);
    const y0 = by + (bh - rh * G) / 2;
    groups.forEach((row, i) => { const y = y0 + i * rh; let cw = bw / row.length; if (b.compact) cw = Math.min(cw, (rh - g) * k + g); const x0 = bx + (bw - cw * row.length) / 2;
      row.forEach((c, j) => drawGlyph(ctx, c, x0 + j * cw + g / 2, y + g / 2, cw - g, rh - g, s)); });
  }
}
// English around the ring: letters keep their own widths (an i is narrower than a W) and spaces stay as spaces.
function drawRingLatin(ctx, s, cx, cy, rin) {
  const text = s.ringText.trim(), hc = s.ringH, rc = rin - hc / 2, cap = inkSize(ctx, 'HX', s), sc = hc / cap.a;
  const chars = Array.from(text), adv = chars.map(c => inkSize(ctx, c, s).adv * sc), track = hc * 0.08;
  const total = adv.reduce((p, q) => p + q, 0) + track * (chars.length - 1), span = Math.min(s.ringSpan * Math.PI / 180, total / rc);
  const k = span / (total / rc);   // squeeze letters slightly when the text is longer than the arc
  let pos = -span / 2;
  chars.forEach((c, i) => {
    const a = adv[i] * k / rc, th = pos + a / 2; pos += a + track * k / rc;
    if (c === ' ') return;
    ctx.save(); ctx.translate(cx + rc * Math.sin(th), cy - rc * Math.cos(th)); ctx.rotate(th); ctx.scale(sc * k, sc * k); // shrink evenly, never squash
    ctx.font = fontStr(s); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center'; ctx.fillText(c, 0, cap.a / 2); ctx.restore();
  });
  if (glyphLog) glyphLog.push({ ch: text, w: total * k, h: hc * k });
}
function drawRing(ctx, s, fw, im) {
  const R = fw / 2, cx = R, cy = R, rin = R - s.border - s.pad;
  if (isLatin(s.ringText) && rin - s.ringH / 2 > 0) drawRingLatin(ctx, s, cx, cy, rin);
  const chars = isLatin(s.ringText) ? [] : Array.from((s.ringText || '').replace(/\s+/g, '')), n = chars.length, hc = s.ringH, rc = rin - hc / 2;
  if (n && rc > 0) {
    const span = s.ringSpan * Math.PI / 180, step = n > 1 ? span / (n - 1) : 0;
    const wc = Math.min((n > 1 ? rc * step : hc) * 0.92, hc * 1.15);
    chars.forEach((c, i) => {
      const th = n > 1 ? -span / 2 + i * step : 0;
      ctx.save(); ctx.translate(cx + rc * Math.sin(th), cy - rc * Math.cos(th)); ctx.rotate(th);
      drawGlyph(ctx, c, -wc / 2, -hc / 2, wc, hc, s); ctx.restore();
    });
  }
  if (im && s.imgMode === 'with') drawImageFit(ctx, im, cx - s.centerSize / 2, cy - s.centerSize / 2, s.centerSize, s.centerSize);
  else if (s.center === 'star') star(ctx, cx, cy, s.centerSize / 2);
  else if (s.center === 'text' && s.centerText) drawLine(ctx, s.centerText, cx, cy, s.centerSize, rin * 1.4, s);
  if (s.bottomText) {
    const yb = s.bottomY, far = Math.abs(yb) + s.bottomH / 2, chord = far < rin ? 2 * Math.sqrt(rin * rin - far * far) : 0;
    drawLine(ctx, s.bottomText, cx, cy + yb, s.bottomH, chord * 0.85, s);
  }
}
function makeMask(s0) {
  const s = eff(s0), { fw, fh } = faceDims(s), ppm = +s.ppm, P = 3;
  const W = Math.ceil(fw * ppm) + 2 * P, H = Math.ceil(fh * ppm) + 2 * P;
  const M = canvas(W, H), T = canvas(W, H), mt = M.getContext('2d', { willReadFrequently: true }), tt = T.getContext('2d');
  tt.setTransform(ppm, 0, 0, ppm, P, P); tt.fillStyle = '#000';
  glyphLog = [];
  // 只用图案 + 反色: the whole face is raised and the design is cut into it (the same as 阴文), so there is no thin
  // gap between a block and the border.
  const invOnly = !!(imgSrc && s.imgMode === 'only' && s.imgInvert), yin = (s.mode === 'yin') !== invOnly;
  const im = s.imgMode !== 'none' ? imgMask(invOnly ? { ...s, imgInvert: false } : s) : null;
  if (im && s.imgMode === 'only') {
    const b = innerBox(s, fw, fh);
    if (s.product === 'roller' && s.imgFit === 'fill') { tt.save(); tt.imageSmoothingQuality = 'high'; tt.drawImage(im.mask, b.x, b.y, b.w, b.h); tt.restore(); if (glyphLog) glyphLog.push({ ch: tl('图案', 'Picture', '画像', '이미지'), w: b.w, h: b.h }); }
    else { const k = Math.min(1, Math.max(0.2, +s.imgScale || 1)), w = b.w * k, h = b.h * k; drawImageFit(tt, im, b.x + (b.w - w) / 2, b.y + (b.h - h) / 2, w, h); }
  }
  else if (s.layout === 'ring') drawRing(tt, s, fw, im);
  else if (im && s.imgMode === 'with') drawImgText(tt, s, fw, fh, im, W, H, ppm, P);
  else drawGrid(tt, s, fw, fh);
  const glyphs = glyphLog.map(g => ({ ...g, w: g.w + s.thicken, h: g.h + s.thicken })); glyphLog = null;
  let D = T; const rp = s.thicken / 2 * ppm;
  if (rp > 0.05) {
    D = canvas(W, H); const dt = D.getContext('2d'); dt.drawImage(T, 0, 0);
    for (const r of (rp > 1.5 ? [rp, rp / 2] : [rp])) { const k = Math.max(8, Math.ceil(r * 6)); for (let i = 0; i < k; i++) { const a = i / k * Math.PI * 2; dt.drawImage(T, r * Math.cos(a), r * Math.sin(a)); } }
  }
  mt.setTransform(ppm, 0, 0, ppm, P, P); mt.fillStyle = mt.strokeStyle = '#000';
  if (yin) {
    facePath(mt, s, fw, fh, 0); mt.fill();
    mt.setTransform(1, 0, 0, 1, 0, 0); mt.globalCompositeOperation = 'destination-out'; mt.drawImage(D, 0, 0);
  } else {
    if (s.border > 0) { facePath(mt, s, fw, fh, s.border / 2); mt.lineWidth = s.border; mt.stroke(); }
    mt.setTransform(1, 0, 0, 1, 0, 0); mt.drawImage(D, 0, 0);
  }
  mt.globalCompositeOperation = 'destination-in'; mt.setTransform(ppm, 0, 0, ppm, P, P); facePath(mt, s, fw, fh, 0); mt.fill();
  mt.globalCompositeOperation = 'source-over'; mt.setTransform(1, 0, 0, 1, 0, 0);
  // Ink bounding box of the text alone (border excluded), in mm.
  // Measured on the traced outline (sub-pixel), the same outline that becomes the STL, so it matches Bambu Studio to ~0.01 mm.
  const td = D.getContext('2d').getImageData(0, 0, W, H).data, av = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) av[i] = td[i * 4 + 3] / 255;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const l of Geo.contours(av, W, H)) for (const [x, y] of l) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const textBox = x1 > x0 ? { w: (x1 - x0) / ppm, h: (y1 - y0) / ppm } : null;
  return { M, D, W, H, P, fw, fh, ppm, glyphs, textBox, yin };
}

/* ---------- mesh ---------- */
function buildMesh(s0, mk) {
  const s = eff(s0), { M, W, H, P, fw, fh, ppm } = mk;
  const data = M.getContext('2d').getImageData(0, 0, W, H).data, v = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) v[i] = data[i * 4 + 3] / 255;
  const minA = 0.01 * ppm * ppm, mir = s.mirror ? -1 : 1;
  const loops = Geo.contours(v, W, H).map(l => Geo.simplifyClosed(l, 0.22)).filter(l => l.length >= 3 && Math.abs(Geo.area(l)) > minA)
    .map(l => l.map(([x, y]) => [mir * ((x + 0.5 - P) / ppm - fw / 2), fh / 2 - (y + 0.5 - P) / ppm]));
  const groups = Geo.groupLoops(loops);
  const m = Math.max(0, s.margin), fbw = fw + 2 * m, fbh = fh + 2 * m;
  // 直筒 + 凹槽: widen the body by the groove depth so the narrowest point still clears the stamp face
  // by the margin. The grooves then run straight through the whole body, plate included.
  // 手柄比直段宽: a straight handle can be wider than the 直段 by handlePad on every side (even at the groove).
  const straightGrip = s.handle === 'grip' && s.trans === 'straight', sides = s.grooveAxis || 'none';
  const pad = straightGrip ? Math.max(0, Math.min(+s.handlePad || 0, 20)) : 0;
  const gw = straightGrip && sides !== 'none' ? Math.max(0, Math.min(+s.grooveD || 0, 15)) : 0;
  const wrap = straightGrip && (pad > 0 || gw > 0);
  const ex = pad + (/x/.test(sides) ? gw : 0), ey = pad + (/y/.test(sides) ? gw : 0);
  const bw = fbw + 2 * ex, bh = fbh + 2 * ey;
  const basePoly = s.shape === 'circle' ? Geo.circlePoly(fbw / 2, 180).map(([x, y]) => [x * bw / fbw, y * bh / fbh])
    : Geo.roundRectPoly(bw, bh, (s.corner > 0 ? s.corner : 0) + m + pad, 10);
  const collarPoly = s.shape === 'circle' ? Geo.circlePoly(fbw / 2, 180) : Geo.roundRectPoly(fbw, fbh, (s.corner > 0 ? s.corner : 0) + m, 10);
  const out = [], HR = handleRings(s, basePoly, bw, bh, gw, collarPoly, wrap);
  Geo.loft(HR.rings, out);
  const zTop = HR.zb + s.reliefH, steps = topSteps(mk, s);
  if (!steps.length) Geo.prism(groups, HR.zb - 0.1, zTop, out);
  else {
    // Step edges sit exactly on Bambu Studio layer tops, so each narrower step is whole layers (k layers per step).
    const sl = slicerOf(s), tops = sliceLayers(zTop, sl), N = tops.length;
    const k = Math.max(1, Math.floor(Math.min(0.4, s.reliefH * 0.4) / (2 * sl.lh) + 1e-6));
    const b1 = tops[N - 1 - 2 * k], b2 = tops[N - 1 - k];
    if (b1 === undefined || b1 <= HR.zb + 0.05) Geo.prism(groups, HR.zb - 0.1, zTop, out);
    else {
      Geo.prism(groups, HR.zb - 0.1, b1, out);
      // each narrower step starts a hair below the one under it, so the slicer reads one solid piece
      Geo.prism(steps[0], b1 - 0.02, b2, out); Geo.prism(steps[1], b2 - 0.02, zTop, out);
    }
  }
  const profile = HR.rings.map(r => { let x0 = Infinity, x1 = -Infinity; for (const [x] of r.poly) { if (x < x0) x0 = x; if (x > x1) x1 = x; } return { z: r.z, x0, x1 }; });
  // Report the real footprint (grooves pull the rounded corners in a little).
  let mx = 0, my = 0; for (const r of HR.rings) for (const [px, py] of r.poly) { mx = Math.max(mx, Math.abs(px)); my = Math.max(my, Math.abs(py)); }
  return { tris: new Float32Array(out), size: [2 * mx, 2 * my, HR.zb + s.reliefH], minWidth: wrap ? [fbw, fbh] : null, neck: HR.neck || 0, section: HR.section, collar: HR.collar, loops: loops.length, notes: HR.notes, flareH: HR.flareH, heights: [HR.handleLen, s.baseT, s.reliefH],
    profile, zb: HR.zb, face: [fw, fh] };
}

/* 字顶收窄：最上面两层把每一笔往里收一点，顶面不再有 FDM 外墙那一圈凸边，压上去更平更实。
   用带符号的距离场往里收；比 2×收窄量 + 喷嘴还细的笔画保持原宽，免得顶上被收没了。 */
function topSteps(mk, s) {
  const e = +s.topInset || 0; if (e <= 0.001) return [];
  const { W, H, P, fw, fh, ppm } = mk, a = mk.M.getContext('2d').getImageData(0, 0, W, H).data, n = W * H;
  const ink = new Uint8Array(n), bg = new Uint8Array(n), alpha = new Float32Array(n);
  for (let i = 0; i < n; i++) { alpha[i] = a[i * 4 + 3] / 255; ink[i] = alpha[i] >= 0.5 ? 1 : 0; bg[i] = 1 - ink[i]; }
  const dIn = edt(bg, W, H), dOut = edt(ink, W, H), sd = new Float32Array(n);
  for (let i = 0; i < n; i++) sd[i] = ink[i] ? Math.sqrt(dIn[i]) - 0.5 : 0.5 - Math.sqrt(dOut[i]);
  // How much each spot may narrow depends on how wide its stroke is: the top must stay at least one nozzle wide.
  // Local stroke half-width ≈ the largest inside-distance nearby (a square max filter), so the narrowing changes smoothly along a stroke.
  const r = Math.max(1, Math.round((e + s.nozzle) * ppm)), half = new Float32Array(n), tmp = new Float32Array(n);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let m = 0; for (let k = Math.max(0, x - r); k <= Math.min(W - 1, x + r); k++) { const v = dIn[y * W + k]; if (v > m) m = v; } tmp[y * W + x] = m; }
  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) { let m = 0; for (let k = Math.max(0, y - r); k <= Math.min(H - 1, y + r); k++) { const v = tmp[k * W + x]; if (v > m) m = v; } half[y * W + x] = Math.sqrt(m); }
  const minHalf = s.nozzle / 2 * ppm + 0.5;
  const mir = s.mirror ? -1 : 1, minA = 0.01 * ppm * ppm, out = [];
  for (const frac of [0.5, 1]) {
    const ep = e * frac * ppm, v = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      if (!ink[i] && sd[i] < -1) { v[i] = 0; continue; }
      const allow = Math.min(ep, Math.max(0, (half[i] - minHalf) * frac));
      v[i] = Math.min(1, Math.max(0, 0.5 + sd[i] - allow + 0.0137)); // tiny offset: the outline never lands exactly on a pixel corner, where two outlines could touch
    }
    const loops = Geo.contours(v, W, H).map(l => Geo.simplifyClosed(l, 0.22)).filter(l => l.length >= 3 && Math.abs(Geo.area(l)) > minA)
      .map(l => l.map(([x, y]) => [mir * ((x + 0.5 - P) / ppm - fw / 2), fh / 2 - (y + 0.5 - P) / ppm]));
    out.push(Geo.groupLoops(loops));
  }
  return out;
}

/* Handle: every ring is sampled at the same angles so they loft cleanly from grip to stamp plate. */
function radialAngles(poly, N = 160) {
  const set = []; for (let i = 0; i < N; i++) set.push(i / N * 2 * Math.PI);
  for (const [x, y] of poly) { let a = Math.atan2(y, x); if (a < 0) a += 2 * Math.PI; set.push(a); }
  set.sort((a, b) => a - b); const out = [];
  for (const a of set) if (!out.length || a - out[out.length - 1] > 1e-6) out.push(a);
  if (2 * Math.PI - out[out.length - 1] < 1e-6) out.pop();
  return out;
}
function rayR(poly, a) {
  const dx = Math.cos(a), dy = Math.sin(a); let best = Infinity;
  for (let i = 0, n = poly.length; i < n; i++) {
    const p = poly[i], q = poly[(i + 1) % n], ex = q[0] - p[0], ey = q[1] - p[1], den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-12) continue;
    const t = (p[0] * ey - p[1] * ex) / den, u = (p[0] * dy - p[1] * dx) / den;
    if (u >= -1e-9 && u <= 1 + 1e-9 && t > 0 && t < best) best = t;
  }
  return best;
}
function handleRings(s, basePoly, bw, bh, wrapD = 0, collarPoly = null, wrap = false) {
  const ang = radialAngles(basePoly, s.handle === 'grip' && s.groove !== 'none' ? 320 : 160), rB = ang.map(a => rayR(basePoly, a)), notes = [];
  // rC: the plain outline (stamp face + margin) used for the straight 直段 and the stamp plate.
  const rC = wrap && collarPoly ? ang.map(a => rayR(collarPoly, a)) : rB;
  const ring = (r, z) => ({ poly: ang.map((a, i) => [r[i] * Math.cos(a), r[i] * Math.sin(a)]), z, r });
  if (s.handle !== 'grip') return { rings: [ring(rB, 0), ring(rB, s.baseT)], zb: s.baseT, notes, flareH: 0, handleLen: 0 };
  const minDim = Math.min(bw, bh), gd = Math.max(4, s.gripD);
  const deg = Math.max(10, Math.min(45, +s.maxAngle || 35)), tanA = Math.tan(deg * Math.PI / 180);
  const rG = s.trans === 'straight' ? rB.slice() : s.gripShape === 'same' ? rB.map(r => r * gd / minDim) : ang.map(() => gd / 2);
  // 握柄长度 = everything below the stamp plate: bottom chamfer + grip + transition.
  const rGmin = Math.min(...rG), Lin = Math.max(1, s.handleH);
  const c = Math.max(0, Math.min(+s.chamfer || 0, rGmin - 1.5)), hc = c > 0 ? c / tanA : 0;
  const D = Math.max(...rB.map((r, i) => Math.abs(r - rG[i])));
  const hf = D < 0.01 ? 0 : s.trans === 'arc' ? 2 * D / tanA : s.trans === 'line' ? D / tanA : 0;
  const neck = Math.max(0, +s.neckH || 0);
  let L = Lin - hc - hf - neck;
  if (L < 1) { L = 1; notes.push(tl(`手柄最短要 ${Math.ceil(hc + hf + neck + 1)} mm，已按这个长度生成`, `Handle must be at least ${Math.ceil(hc + hf + neck + 1)} mm; used that`, `持ち手は ${Math.ceil(hc + hf + neck + 1)} mm 以上必要なので、その長さにしました`, `손잡이는 ${Math.ceil(hc + hf + neck + 1)} mm 이상이어야 해서 그 길이로 만들었습니다`)); }
  let b = +s.bulge || 0; const bMax = L * tanA / Math.PI;
  if (Math.abs(b) > bMax) { b = Math.sign(b) * bMax; notes.push(tl(`腰身已限制到 ${Math.abs(b).toFixed(1)} mm（再大会超过 ${deg}° 悬空）`, `Waist limited to ${Math.abs(b).toFixed(1)} mm (more would overhang past ${deg}°)`, `くびれを ${Math.abs(b).toFixed(1)} mm までにしました（それ以上は ${deg}° を超えるオーバーハング）`, `허리를 ${Math.abs(b).toFixed(1)} mm까지로 했습니다(더 하면 ${deg}°를 넘는 오버행)`)); }
  if (rGmin + b < 2) { b = 2 - rGmin; notes.push(tl('腰身收得太细，已自动减小', 'Waist was too thin; reduced', 'くびれが細すぎたので弱めました', '허리가 너무 가늘어 줄였습니다')); }
  // 两侧凹槽：手指捏的位置往里凹一道弧，到印面前按坡度上限收平。
  const sides = s.grooveAxis || 'none', ext = Math.min(...rG) * 2;
  // Groove arc seen from above: 凹槽宽度 = share of the side it spans; 圆弧 = crisp ends, 柔和 = ends blend into the side.
  const span = Math.max(0.2, Math.min(1, (+s.grooveW || 100) / 100)), soft = s.grooveShape === 'soft';
  const gProf = t => { const u = Math.abs(t) / span; return u >= 1 ? 0 : soft ? Math.cos(Math.PI * u / 2) ** 2 : 1 - u * u; };
  let gd2 = sides === 'none' ? 0 : Math.max(0, +s.grooveD || 0);
  if (wrap) gd2 = wrapD; // widened straight handle: full-depth grooves top to bottom, no fade
  else {
    if (gd2 > ext * 0.3) { gd2 = ext * 0.3; notes.push(tl(`凹槽深度已限制到 ${gd2.toFixed(1)} mm（再深手柄太薄）`, `Groove depth limited to ${gd2.toFixed(1)} mm (handle would get too thin)`, `溝の深さを ${gd2.toFixed(1)} mm までにしました（それ以上は持ち手が薄くなりすぎます）`, `홈 깊이를 ${gd2.toFixed(1)} mm까지로 했습니다(더 깊으면 손잡이가 너무 얇아짐)`)); }
    if (gd2 / tanA > L * 0.8) { gd2 = L * 0.8 * tanA; notes.push(tl(`手柄太短，凹槽深度已限制到 ${gd2.toFixed(1)} mm`, `Handle is short; groove depth limited to ${gd2.toFixed(1)} mm`, `持ち手が短いため、溝の深さを ${gd2.toFixed(1)} mm までにしました`, `손잡이가 짧아 홈 깊이를 ${gd2.toFixed(1)} mm까지로 했습니다`)); }
  }
  const zg = hc + L, ft = gd2 / tanA;
  const grooveAt = zz => gd2 <= 0 ? 0 : wrap ? gd2 : gd2 * Math.min(1, Math.max(0, (zg - zz) / ft));
  const groove = (rg, dep) => {
    if (dep <= 1e-4) return rg;
    let hx = 0, hy = 0; for (const [px, py] of rg.poly) { hx = Math.max(hx, Math.abs(px)); hy = Math.max(hy, Math.abs(py)); }
    rg.poly = rg.poly.map(([px, py]) => [
      sides === 'x' || sides === 'xy' ? px - dep * gProf(py / hy) * px / hx : px,
      sides === 'y' || sides === 'xy' ? py - dep * gProf(px / hx) * py / hy : py]);
    return rg;
  };
  const rings = []; let z = 0;
  if (c > 0) { rings.push(groove(ring(rG.map(r => r - c), 0), grooveAt(0))); z = hc; }
  const zs = []; for (let k = 0; k <= 40; k++) zs.push(z + k / 40 * L);
  if (gd2 > 0 && !wrap) for (let k = 0; k <= 12; k++) zs.push(Math.max(z, zg - ft) + k / 12 * Math.min(ft, L));
  zs.sort((p1, p2) => p1 - p2);
  let last = -1;
  for (const zz of zs) { if (zz - last < 0.02) continue; last = zz; const v = (zz - z) / L; rings.push(groove(ring(rG.map(r => r + b * Math.sin(Math.PI * v)), zz), grooveAt(zz))); }
  z += L;
  if (hf > 0.01) {
    const NF = s.trans === 'arc' ? 18 : 1;
    for (let k = 1; k <= NF; k++) { const u = k / NF, e = s.trans === 'arc' ? u * u : u; rings.push(ring(rG.map((r, i) => r + (rB[i] - r) * e), z + u * hf)); }
  } else if (D >= 0.01) rings.push(ring(rB, z));
  z += Math.max(0, hf);
  // 直段: straight, undeformed section between the shaped handle and the stamp face.
  // A widened grooved handle steps in to it with an upward-facing ledge, which needs no support.
  if (wrap) rings.push(ring(rC, z));
  z += neck;
  rings.push(ring(rC, z + s.baseT));
  if (s.trans === 'step' && D > 0.3) notes.push(tl('直角过渡需要加支撑', 'Stepped transition needs supports', '段差のある形はサポートが必要です', '계단형 연결부는 서포트가 필요합니다'));
  const mid = rings[Math.floor(rings.length * 0.3)];
  return { rings, zb: z + s.baseT, notes, flareH: hf, handleLen: z, neck, section: mid ? mid.poly : null, collar: ang.map((a2, i) => [rC[i] * Math.cos(a2), rC[i] * Math.sin(a2)]) };
}

/* ---------- 3D preview ---------- */
let R3 = null;
function init3D() {
  if (!window.THREE) return;
  const el = $('#view3d'), renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); el.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(32, 4 / 3, 0.1, 5000);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x554433, 0.75));
  const d1 = new THREE.DirectionalLight(0xffffff, 0.75); d1.position.set(-1, 1.6, 2); scene.add(d1);
  const d2 = new THREE.DirectionalLight(0xffffff, 0.3); d2.position.set(2, -1, 1); scene.add(d2);
  const pivot = new THREE.Group(); scene.add(pivot);
  const holder = new THREE.Group(); holder.rotation.x = -Math.PI / 2; pivot.add(holder);
  R3 = { el, renderer, scene, camera, pivot, holder, mesh: null, rx: 0.42, ry: -0.5, dist: 80, radius: 30, zoom: 1 };
  const resize = () => { const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); draw3D(); };
  new ResizeObserver(resize).observe(el); resize();
  let drag = null;
  el.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', e => { if (!drag) return; R3.ry += (e.clientX - drag.x) * 0.01; R3.rx = Math.max(-0.2, Math.min(1.5, R3.rx + (e.clientY - drag.y) * 0.01)); drag = { x: e.clientX, y: e.clientY }; draw3D(); });
  el.addEventListener('pointerup', () => drag = null); el.addEventListener('pointercancel', () => drag = null);
  el.addEventListener('wheel', e => { e.preventDefault(); R3.zoom = Math.max(0.4, Math.min(3, R3.zoom * (e.deltaY > 0 ? 1.1 : 0.9))); draw3D(); }, { passive: false });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => setMesh3D(lastTris, lastSize));
}
function draw3D() {
  if (!R3) return;
  const { camera, pivot, renderer, scene } = R3;
  pivot.rotation.set(R3.rx, R3.ry, 0, 'XYZ');
  const d = R3.radius * 4.3 * R3.zoom; camera.position.set(0, 0, d); camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}
let lastTris = null, lastSize = null;
function setMesh3D(tris, size) {
  lastTris = tris; lastSize = size; if (!R3 || !tris) return;
  if (R3.mesh) { R3.holder.remove(R3.mesh); R3.mesh.geometry.dispose(); R3.mesh.material.dispose(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(tris, 3)); g.computeVertexNormals();
  const col = getComputedStyle(document.documentElement).getPropertyValue('--pla').trim() || '#c9463b';
  const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: new THREE.Color(col), roughness: 0.62, metalness: 0.02 }));
  mesh.position.set(0, 0, -size[2] / 2);
  R3.holder.add(mesh); R3.mesh = mesh; R3.radius = Math.hypot(size[0], size[1], size[2]) / 2; draw3D();
}

/* ---------- impression preview ---------- */
// What the stamp leaves on paper. With 镜像 off the print comes out reversed, so the preview flips too.
function inkCanvas(mk, s, color, thin) {
  const tint = canvas(mk.W, mk.H), tc = tint.getContext('2d');
  if (!s.mirror) { tc.translate(mk.W, 0); tc.scale(-1, 1); }
  tc.drawImage(mk.M, 0, 0); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = color; tc.fillRect(0, 0, mk.W, mk.H);
  if (thin) { tc.globalCompositeOperation = 'source-over'; tc.drawImage(thin, 0, 0, mk.W, mk.H); }
  return tint;
}
function drawImpression(mk, s, thin) {
  // The canvas takes the stamp's own shape, so a long stamp is not lost in a square of empty paper.
  const c = $('#imp'), PAD = 16, W = 640, H = Math.round(Math.min(W, Math.max(W * 0.22, (W - 2 * PAD) * mk.H / mk.W + 2 * PAD)));
  if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
  const ctx = c.getContext('2d'); ctx.clearRect(0, 0, W, H);
  const tint = inkCanvas(mk, s, '#c2362b', thin);
  const sc = Math.min((W - 2 * PAD) / mk.W, (H - 2 * PAD) / mk.H);
  ctx.globalAlpha = 0.92; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(tint, (W - mk.W * sc) / 2, (H - mk.H * sc) / 2, mk.W * sc, mk.H * sc); ctx.globalAlpha = 1;
}

/* 细笔画检查：比喷嘴还细的笔画打不出来。用两次距离变换做形态学开运算，开运算去掉的、成片的部分就是细笔画。 */
function edt(feature, W, H) {
  const INF = 1e20, out = new Float64Array(W * H), f = new Float64Array(Math.max(W, H)), d = new Float64Array(Math.max(W, H));
  const v = new Int32Array(Math.max(W, H)), z = new Float64Array(Math.max(W, H) + 1);
  const pass = (n) => {
    let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < n; q++) {
      let sv = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (sv <= z[k]) { k--; sv = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = sv; z[k + 1] = INF;
    }
    k = 0; for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
  };
  for (let x = 0; x < W; x++) { for (let y = 0; y < H; y++) f[y] = feature[y * W + x] ? 0 : INF; pass(H); for (let y = 0; y < H; y++) out[y * W + x] = d[y]; }
  for (let y = 0; y < H; y++) { for (let x = 0; x < W; x++) f[x] = out[y * W + x]; pass(W); for (let x = 0; x < W; x++) out[y * W + x] = d[x]; }
  return out; // squared pixel distance to the nearest feature pixel
}
// Parts of a mask narrower than 2r: the mask minus its morphological opening, keeping only sizeable pieces
// (every sharp corner leaves a tiny sliver, which is not a real problem).
function narrowParts(m, W, H, r, minPx) {
  const n = W * H, inv = new Uint8Array(n); for (let i = 0; i < n; i++) inv[i] = 1 - m[i];
  const r2 = r * r, dIn = edt(inv, W, H), core = new Uint8Array(n);
  for (let i = 0; i < n; i++) core[i] = m[i] && dIn[i] >= r2 ? 1 : 0;
  const dCore = edt(core, W, H), nar = new Uint8Array(n);
  for (let i = 0; i < n; i++) nar[i] = m[i] && dCore[i] > r2 ? 1 : 0;
  const seen = new Uint8Array(n), keep = [], st = [];
  for (let i = 0; i < n; i++) {
    if (!nar[i] || seen[i]) continue;
    const comp = []; st.push(i); seen[i] = 1;
    while (st.length) {
      const j = st.pop(), x = j % W, y = (j - x) / W; comp.push(j);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy, k = yy * W + xx;
        if (xx >= 0 && yy >= 0 && xx < W && yy < H && nar[k] && !seen[k]) { seen[k] = 1; st.push(k); }
      }
    }
    if (comp.length >= minPx) keep.push(comp);
  }
  return keep;
}
// Enclosed spaces (the inside of 口, 日, 田 …): background regions that don't reach the edge of the image.
function countHoles(ink, W, H, minPx) {
  const n = W * H, seen = new Uint8Array(n), st = []; let holes = 0;
  for (let i = 0; i < n; i++) {
    if (ink[i] || seen[i]) continue;
    let size = 0, edge = false; st.push(i); seen[i] = 1;
    while (st.length) {
      const j = st.pop(), x = j % W, y = (j - x) / W; size++;
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) edge = true;
      for (const k of [j - 1, j + 1, j - W, j + W]) if (k >= 0 && k < n && !ink[k] && !seen[k] && Math.abs((k % W) - x) <= 1) { seen[k] = 1; st.push(k); }
    }
    if (!edge && size >= minPx) holes++;
  }
  return holes;
}
// Typical (median) stroke width and gap width in mm, from the ridge of each distance field, inside the text's bounding box.
function typicalWidths(ink, W, H, ppm) {
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (ink[y * W + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return { strokeMed: 0, gapMed: 0 };
  const n = W * H, inv = new Uint8Array(n); for (let i = 0; i < n; i++) inv[i] = 1 - ink[i];
  const dIn = edt(inv, W, H), dOut = edt(ink, W, H);
  const ridge = (d, want) => { const v = [];
    for (let y = Math.max(1, y0); y <= Math.min(H - 2, y1); y++) for (let x = Math.max(1, x0); x <= Math.min(W - 2, x1); x++) {
      const i = y * W + x; if (ink[i] !== want || d[i] <= 0) continue; let top = true;
      for (let dy = -1; dy <= 1 && top; dy++) for (let dx = -1; dx <= 1; dx++) if (d[i + dy * W + dx] > d[i]) { top = false; break; }
      if (top) v.push(2 * Math.sqrt(d[i]) / ppm);
    }
    v.sort((p, q) => p - q); return v.length ? v[v.length >> 1] : 0; };
  return { strokeMed: ridge(dIn, 1), gapMed: ridge(dOut, 0) };
}
// Reference: typical stroke and gap of a stamp that printed very clearly (shown as 「参考」 in the clarity table).
const XI = { stroke: 0.54, gap: 0.62 };
// GAP_RATIO (阴文): a cut-out stroke narrower than this × nozzle tends to print unclear.
const GAP_RATIO = 0.75;
// 阳文 enclosed spaces (inside 口 / 田 / 日) print unclear when they are both narrow AND small in area (calibrated on test prints,
// 0.4 nozzle): a narrow but long slit prints fine, a narrow small cell does not. Open slits (not enclosed on all sides) are not flagged.
/* Bambu Studio 工艺配置（A1）。数值取自 Bambu Studio 自带配置 resources/profiles/BBL/process：
   层高、首层高度、外墙线宽。只取排层和清晰度需要的这几项。 */
const SLICERS = {
  'a1-0.2-010': { name: '0.10mm Standard @BBL A1 0.2 nozzle', lh: 0.10, first: 0.10, lw: 0.22 },
  'a1-008': { name: '0.08mm Extra Fine @BBL A1', lh: 0.08, first: 0.2, lw: 0.42 },
  'a1-012': { name: '0.12mm Fine @BBL A1', lh: 0.12, first: 0.2, lw: 0.42 },
  'a1-016': { name: '0.16mm Optimal @BBL A1', lh: 0.16, first: 0.2, lw: 0.42 },
  'a1-020': { name: '0.20mm Standard @BBL A1', lh: 0.20, first: 0.2, lw: 0.42 }
};
const BENCH_SLICER = 'a1-0.2-010';   // the clarity thresholds were calibrated with this profile
const slicerOf = s => SLICERS[s.slicer] || SLICERS[BENCH_SLICER];
// Layer tops the way Bambu Studio cuts them (generate_object_layers): a fixed first layer, then one more layer
// while the middle of that layer is still inside the object. Each layer prints the cross-section at its middle.
function sliceLayers(H, sl) {
  const tops = [Math.min(sl.first, H)]; let z = tops[0];
  while (z + sl.lh / 2 < H - 1e-6) { z += sl.lh; tops.push(+z.toFixed(4)); }
  return tops;
}
// How the relief comes out: the layers whose middle is above the base top.
function reliefLayers(H, r, sl) {
  const tops = sliceLayers(H, sl), zb = H - r; let n = 0, below = 0;
  tops.forEach((t, i) => { const h = i ? t - tops[i - 1] : t; if (t - h / 2 > zb + 1e-6) n++; else below = t; });
  return { n, printed: tops[tops.length - 1] - below, total: tops[tops.length - 1], layers: tops.length };
}
const HOLE_RATIO = 1.85;        // narrowest width under this × nozzle (0.74 mm) …
const HOLE_AREA_RATIO = 3.1;    // … and area under this × nozzle² (0.5 mm²)
// Enclosed spaces narrower than minW mm and smaller than minArea mm²: the whole space is returned as one piece.
function smallHoles(ink, W, H, ppm, minW, minArea) {
  const n = W * H, seen = new Uint8Array(n), st = [], out = [], inv = new Uint8Array(n);
  for (let i = 0; i < n; i++) inv[i] = 1 - ink[i];
  const dIn = edt(ink, W, H); // squared distance from each background pixel to the nearest raised pixel
  for (let i = 0; i < n; i++) {
    if (ink[i] || seen[i]) continue;
    const comp = []; let edge = false, maxD = 0; st.push(i); seen[i] = 1;
    while (st.length) {
      const j = st.pop(), x = j % W, y = (j - x) / W; comp.push(j); if (dIn[j] > maxD) maxD = dIn[j];
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) edge = true;
      for (const k of [j - 1, j + 1, j - W, j + W]) if (k >= 0 && k < n && !ink[k] && !seen[k] && Math.abs((k % W) - x) <= 1) { seen[k] = 1; st.push(k); }
    }
    if (!edge && comp.length >= 4 && 2 * Math.sqrt(maxD) / ppm < minW && comp.length / (ppm * ppm) < minArea) out.push(comp);
  }
  return out;
}
function thinCheck(mk, nozzle) {
  // Check at up to twice the mask resolution (~0.05 mm per pixel) so a stroke as wide as the nozzle is not mistaken for a thinner one.
  const f = Math.max(1, Math.min(2, 1600 / Math.max(mk.W, mk.H))), W = Math.round(mk.W * f), H = Math.round(mk.H * f), ppm = mk.ppm * f;
  const hi = canvas(W, H), hc = hi.getContext('2d', { willReadFrequently: true }); hc.imageSmoothingQuality = 'high'; hc.drawImage(mk.M, 0, 0, W, H);
  const a = hc.getImageData(0, 0, W, H).data, n = W * H, ink = new Uint8Array(n), gapM = new Uint8Array(n);
  for (let i = 0; i < n; i++) { ink[i] = a[i * 4 + 3] >= 128 ? 1 : 0; gapM[i] = 1 - ink[i]; }
  const minPx = Math.max(4, 0.75 * (nozzle * ppm) ** 2);
  const tc = canvas(W, H), tx = tc.getContext('2d', { willReadFrequently: true }); tx.drawImage(mk.D, 0, 0, W, H);
  const ta = tx.getImageData(0, 0, W, H).data, txt = new Uint8Array(n); for (let i = 0; i < n; i++) txt[i] = ta[i * 4 + 3] >= 128 ? 1 : 0;
  const med = typicalWidths(txt, W, H, ppm), holes = countHoles(ink, W, H, minPx);
  const thin = narrowParts(ink, W, H, nozzle / 2 * ppm, minPx);                 // raised parts thinner than the nozzle
  const gaps = mk.yin ? narrowParts(gapM, W, H, GAP_RATIO * nozzle / 2 * ppm, minPx)   // 阴文: cut-out strokes that may print unclear
                     : smallHoles(ink, W, H, ppm, HOLE_RATIO * nozzle, HOLE_AREA_RATIO * nozzle * nozzle); // 阳文: enclosed spaces too small to stay open
  if (!thin.length && !gaps.length) return { count: 0, gaps: 0, holes, overlay: null, ...med };
  const ov = canvas(W, H), oc = ov.getContext('2d'), img = oc.createImageData(W, H);
  const paint = (list, r, g, b) => { for (const comp of list) for (const j of comp) { img.data[j * 4] = r; img.data[j * 4 + 1] = g; img.data[j * 4 + 2] = b; img.data[j * 4 + 3] = 255; } };
  paint(thin, 242, 180, 0); paint(gaps, 47, 125, 225);
  oc.putImageData(img, 0, 0);
  return { count: thin.length, gaps: gaps.length, holes, overlay: ov, ...med };
}

/* ---------- fonts ---------- */
// Resolves true only when the chosen font really loaded; otherwise the browser would quietly draw a system font.
async function ensureFont(s) {
  const f = fontInfo(s.font), fam = f.family || f.id, t = allText(s).replace(/\s+/g, '') || '印';
  if (customFonts.some(c => c.id === f.id)) return true;
  try {
    const faces = await Promise.race([document.fonts.load(fontStr(s), t), new Promise(r => setTimeout(() => r(null), 8000))]);
    if (!faces) return false;
    const declared = [...document.fonts].some(x => x.family.replace(/["']/g, '') === fam);
    return declared && faces.length > 0 && document.fonts.check(fontStr(s), t);
  } catch (e) { return false; }
}
function idb() {
  return new Promise((res, rej) => { const r = indexedDB.open('stamp-fonts', 2); r.onupgradeneeded = () => { const db = r.result; if (!db.objectStoreNames.contains('fonts')) db.createObjectStore('fonts', { keyPath: 'id' }); if (!db.objectStoreNames.contains('images')) db.createObjectStore('images', { keyPath: 'id' }); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
}
async function imgSave() { try { const db = await idb(); await new Promise(res => { const t = db.transaction('images', 'readwrite'); const st = t.objectStore('images'); if (imgSrc) st.put({ id: 'current', name: imgName, url: imgDataURL() }); else st.delete('current'); t.oncomplete = res; t.onerror = res; }); } catch (e) {} }
async function imgLoadSaved() { try { const db = await idb(); const rec = await new Promise(res => { const q = db.transaction('images').objectStore('images').get('current'); q.onsuccess = () => res(q.result); q.onerror = () => res(null); }); if (rec && rec.url) setImage(await loadImageURL(rec.url), rec.name); } catch (e) {}
}
async function idbAll() { try { const db = await idb(); return await new Promise((res, rej) => { const q = db.transaction('fonts').objectStore('fonts').getAll(); q.onsuccess = () => res(q.result || []); q.onerror = () => rej(q.error); }); } catch (e) { return []; } }
async function idbPut(rec) { try { const db = await idb(); await new Promise((res, rej) => { const t = db.transaction('fonts', 'readwrite'); t.objectStore('fonts').put(rec); t.oncomplete = res; t.onerror = () => rej(t.error); }); return true; } catch (e) { return false; } }
async function idbDel(id) { try { const db = await idb(); await new Promise(res => { const t = db.transaction('fonts', 'readwrite'); t.objectStore('fonts').delete(id); t.oncomplete = res; t.onerror = res; }); } catch (e) {} }
async function registerFont(rec) {
  const family = 'UF_' + rec.id;
  const ff = new FontFace(family, rec.data.slice(0)); await ff.load(); document.fonts.add(ff);
  const f = { id: rec.id, family, name: rec.name + '（上传）', en: rec.name + ' (uploaded)' };
  customFonts = customFonts.filter(x => x.id !== rec.id).concat(f); return f;
}
function fillFontSelect() {
  const sel = $('#font');
  const opt = f => `<option value="${f.id}">${fontLabel(f).replace(/[<&]/g, '')}</option>`;
  sel.innerHTML = ['zh', 'tc', 'en', 'ja', 'ko'].map(l => `<optgroup label="${langName(l)}">${FONTS.filter(f => f.lang === l).map(opt).join('')}</optgroup>`).join('')
    + (customFonts.length ? `<optgroup label="${tl('我上传的', 'Uploaded', 'アップロード', '업로드')}">${customFonts.map(opt).join('')}</optgroup>` : '');
  if (![...FONTS, ...customFonts].some(f => f.id === S.font)) S.font = FONTS[0].id;
  sel.value = S.font; fillWeights();
}
const weightName = w => w === 900 ? tl('特粗', 'Black', '極太', '아주 굵게') : w === 700 ? tl('粗', 'Bold', '太字', '굵게') : tl('常规', 'Regular', '標準', '보통');
function fillWeights() {
  const f = fontInfo(S.font), sel = $('#weight');
  if (f.weights) { sel.innerHTML = f.weights.map(w => `<option value="${w}">${weightName(w)}</option>`).join(''); if (!f.weights.includes(+S.weight)) S.weight = f.weights[f.weights.length - 1]; sel.value = S.weight; }
}

/* ---------- UI binding ---------- */
function syncUI() {
  document.querySelectorAll('[data-k]').forEach(el => {
    const k = el.dataset.k, v = S[k];
    if (el.classList.contains('seg')) el.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === String(v))));
    else if (el.type === 'checkbox') el.checked = !!v;
    else if (document.activeElement !== el) el.value = v;
  });
  const IX = 'M9 5h22q-5 12 0 24H9q5-12 0-24z', IY = 'M9 5q11 5 22 0v24q-11-5-22 0z', ax = grooveAxis({ ...S, groove: 'long' });
  const gl = $('[data-k=groove] [data-v=long]'), gs = $('[data-k=groove] [data-v=short]');
  gl.querySelector('span').textContent = isRect(S) ? tl('长边', 'Long', '長辺', '긴 변') : tl('左右', 'Sides', '左右', '좌우'); gs.querySelector('span').textContent = isRect(S) ? tl('短边', 'Short', '短辺', '짧은 변') : tl('前后', 'Ends', '前後', '앞뒤');
  gl.querySelector('path').setAttribute('d', ax === 'x' ? IX : IY); gs.querySelector('path').setAttribute('d', ax === 'x' ? IY : IX);
  // Highlight the template that matches the current shape (方形 → 姓名方章, 圆形 → 圆形店章, 长方形 → 长条章).
  const cap = document.querySelector('.imp figcaption'); if (cap) cap.textContent = S.product === 'roller' ? tl('滚出来的效果', 'As rolled', '転がした跡', '굴린 모양') : S.product === 'cutter' ? tl('切出来的效果', 'As cut', '抜いた形', '자른 모양') : tl('盖出来的效果', 'As stamped', '押した跡', '찍힌 모양');
  const tf = $('#tab-face'); if (tf) tf.textContent = S.product === 'roller' ? tl('滚轮', 'Roller', 'ローラー', '롤러') : S.product === 'cutter' ? tl('切模', 'Cutter', '抜き型', '커터') : tl('印面', 'Face', '印面', '인면');
  const presetOf = S.product !== 'stamp' ? '' : { square: 'name', circle: 'round', rect: 'long' }[S.shape];
  document.querySelectorAll('[data-preset]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.preset === presetOf)));
  $('#imgThV').textContent = S.imgThreshold; $('#imgScaleV').textContent = Math.round((+S.imgScale || 1) * 100) + '%'; $('#imgSizeV').textContent = Math.round(S.imgSize * 100) + '%';
  $('#imgNameV').textContent = imgName;
  $('#thickenV').textContent = (+S.thicken).toFixed(2) + ' mm';
  $('#grooveWV').textContent = (+S.grooveW >= 100 ? tl('占满整边', 'full side', '辺いっぱい', '변 전체') : Math.round(+S.grooveW) + '%');
  const bv = +S.bulge; $('#bulgeV').textContent = Math.abs(bv) < 0.01 ? tl('笔直', 'straight', 'まっすぐ', '일자') : (bv < 0 ? tl('中间细 ', 'narrower ', '中央を細く ', '가운데 가늘게 ') : tl('中间粗 ', 'wider ', '中央を太く ', '가운데 굵게 ')) + Math.abs(bv).toFixed(1) + ' mm';
  $('#maxAngleV').textContent = S.maxAngle + tl('°（离竖直）', '° from vertical', '°（垂直から）', '°(수직 기준)');
  $('#stretchV').textContent = (+S.stretch) <= 1.001 ? tl('等比', 'none', 'なし', '없음') : '×' + (+S.stretch).toFixed(1);
  $('#wLabel').textContent = S.shape === 'circle' ? tl('直径', 'Diameter', '直径', '지름') : S.shape === 'rect' ? tl('宽', 'Width', '幅', '너비') : tl('边长', 'Side', '辺の長さ', '변 길이');
  $('#mirrorTag').textContent = S.mirror ? tl('印面已镜像', 'Face mirrored', '印面は反転済み', '인면 좌우 반전됨') : tl('未镜像（盖出来是反字）', 'Not mirrored (prints backwards)', '反転なし（押すと文字が逆向き）', '반전 안 함(찍으면 글자가 뒤집힘)');
  const E = eff(S), ctx = { ...E, layoutE: E.layout, hasImg: imgSrc ? '1' : '0', hasWeights: fontInfo(S.font).weights ? '1' : '0', latinText: isLatin(S.text) ? '1' : '0', wallpaper: S.product === 'roller' && rollerWallpaper(S) ? '1' : '0', fitScale: S.product === 'roller' && S.imgFit === 'fill' ? '0' : '1', noCjk: CJK_RE.test(drawnText(S)) ? '0' : '1', latinNeedsEn: (E.layout === 'grid' ? isLatin(S.text) : isLatin(S.ringText)) && fontInfo(S.font).lang !== 'en' && !customFonts.some(f => f.id === S.font) ? '1' : '0', customFont: customFonts.some(f => f.id === S.font) ? '1' : '0' };
  document.querySelectorAll('[data-show]').forEach(el => {
    el.hidden = !el.dataset.show.split('&').every(c => { const [k, vs] = c.split('='); return vs.split('|').includes(String(ctx[k])); });
  });
}
function setVal(k, raw, el) {
  let v = raw;
  if (el && el.type === 'checkbox') v = el.checked;
  else if (typeof DEF[k] === 'number') { v = parseFloat(raw); if (!isFinite(v)) return; }
  S[k] = v;
  // English fonts: 特粗 closes up the small holes in a / e / B on a small stamp, so start them at 粗
  if (k === 'font') { const f = fontInfo(v); if (f.lang === 'en' && f.weights && f.weights.includes(700) && +S.weight > 700) S.weight = 700; fillWeights(); }
  // A long stamp turns with its text: vertical text gets a tall stamp, horizontal a wide one.
  // 直筒 means a truly straight handle: picking it clears any waist/bulge.
  if (k === 'trans' && v === 'straight') S.bulge = 0;
  if (k === 'product' && v !== 'stamp' && localStorageTab() === 'handle') showTab('face');
  // 饼干 / 黏土: a starting set of sizes for each kind of cutter
  if (k === 'cutterKind') Object.assign(S, v === 'clay' ? { cutterW: 25, cutterH: 25, cutterOffset: 1.5, cutterHeight: 8, bladeT: 0.5, wallT: 1.2, flangeW: 2.5, flangeT: 1.6, imprintGap: 1.5 }
    : { cutterW: 60, cutterH: 60, cutterOffset: 3, cutterHeight: 12, bladeT: 0.8, wallT: 1.6, flangeW: 4, flangeT: 2, imprintGap: 2 });
  if (k === 'dir' && S.shape === 'rect' && ((v === 'v' && S.w > S.h) || (v === 'h' && S.h > S.w))) { const t = S.w; S.w = S.h; S.h = t; }
  persist(); syncUI(); schedule();
}
document.querySelectorAll('input[type=number][data-k]').forEach(el => el.addEventListener('change', () => {
  const k = el.dataset.k, v = parseFloat(el.value);
  S[k] = isFinite(v) ? clampTo(k, v) : DEF[k]; el.value = S[k]; persist(); syncUI(); schedule();
}));
document.querySelectorAll('[data-k]').forEach(el => {
  if (el.classList.contains('seg')) el.addEventListener('click', e => { const b = e.target.closest('button'); if (b) setVal(el.dataset.k, b.dataset.v); });
  else el.addEventListener(el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input', () => setVal(el.dataset.k, el.value, el));
});
// A wide face puts the picture beside the text, a tall one above it; otherwise both end up tiny.
function fitImgPos() {
  if (S.imgMode !== 'with' || eff(S).layout !== 'grid') return;
  const { fw, fh } = faceDims(S);
  if (fw / fh >= 1.6 && /top|bottom/.test(S.imgPos)) S.imgPos = 'left';
  else if (fh / fw >= 1.6 && /left|right/.test(S.imgPos)) S.imgPos = 'top';
}
document.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => {
  // Presets change only the stamp's form. The typed text (and font) stay, carried into the new layout's main field.
  const from = mainKey(S), typed = S[from] || '';
  S = { ...S, ...PRESETS[b.dataset.preset] };
  const to = mainKey(S);
  const bare = t => (t || '').replace(/[\/|｜\s]+/g, '');
  // Coming back from a round stamp with the same characters keeps the earlier "/" column breaks.
  if (to !== from && typed.trim() && bare(S[to]) !== bare(typed)) S[to] = to === 'ringText' ? (isLatin(typed) ? typed.replace(/[\/|｜\s]+/g, ' ').trim() : bare(typed)) : typed;
  fitImgPos(); if (S.product === 'roller' && localStorageTab() === 'handle') showTab('face');
  fillFontSelect(); persist(); syncUI(); schedule();
}));
$('#upFontBtn').addEventListener('click', () => $('#upFont').click());
$('#upFont').addEventListener('change', async e => {
  const file = e.target.files[0]; e.target.value = ''; if (!file) return;
  status(tl('正在载入字体…', 'Loading font…', 'フォントを読み込み中…', '글꼴 불러오는 중…'));
  try {
    const data = await file.arrayBuffer();
    const rec = { id: 'u' + Date.now().toString(36), name: file.name.replace(/\.(ttf|otf|woff2?)$/i, ''), data };
    const f = await registerFont(rec); const saved = await idbPut(rec);
    S.font = f.id; fillFontSelect(); persist(); syncUI(); schedule();
    status(saved ? tl(`已添加字体「${rec.name}」，下次打开还在。`, `Added font “${rec.name}”. It will be here next time.`, `フォント「${rec.name}」を追加しました。次回も使えます。`, `글꼴 ‘${rec.name}’을(를) 추가했습니다. 다음에도 쓸 수 있습니다.`) : tl(`已添加字体「${rec.name}」（刷新后需重新上传）。`, `Added font “${rec.name}” (upload it again after a reload).`, `フォント「${rec.name}」を追加しました（再読み込み後はもう一度アップロードしてください）。`, `글꼴 ‘${rec.name}’을(를) 추가했습니다(새로고침하면 다시 업로드하세요).`));
  } catch (err) { status(tl('这个字体文件读不了，换一个 .ttf 或 .otf 试试。', 'Could not read this font. Try a .ttf or .otf file.', 'このフォントを読み込めませんでした。.ttf か .otf を試してください。', '이 글꼴을 읽을 수 없습니다. .ttf 또는 .otf 파일을 써 보세요.'), true); }
});
$('#rmFontBtn').addEventListener('click', async () => {
  const id = S.font; customFonts = customFonts.filter(f => f.id !== id); await idbDel(id);
  S.font = FONTS[0].id; fillFontSelect(); persist(); syncUI(); schedule(); status(tl('已移除上传的字体。', 'Removed the uploaded font.', 'アップロードしたフォントを削除しました。', '업로드한 글꼴을 삭제했습니다.'));
});

function status(msg, err) { const el = $('#status'); el.textContent = msg; el.classList.toggle('err', !!err); }

/* 字体缺字检查：网上字体按字符范围分成很多小文件，每个文件都写明自己包含哪些字（unicode-range）。
   一个字不在这个字体任何一个文件的范围里，浏览器就会改用电脑自带的字体画它。上传的字体不分文件，没法这样判断，所以不检查。 */
function parseRanges(ur) {
  return (ur || 'U+0-10FFFF').split(',').map(t => t.trim().replace(/^U\+/i, '')).map(t => {
    if (t.includes('?')) return [parseInt(t.replace(/\?/g, '0'), 16), parseInt(t.replace(/\?/g, 'F'), 16)];
    const [lo, hi] = t.split('-'); return [parseInt(lo, 16), parseInt(hi || lo, 16)];
  }).filter(r => isFinite(r[0]) && isFinite(r[1]));
}
const rangeCache = new Map(), glyphCache = new Map();
// Draws a character with the font, once backed by 思源宋体 and once by 思源黑体. If the font has the character, both look the same;
// if it doesn't, the browser falls through to the two different backups and the drawings differ. This catches sparse calligraphy fonts.
function lacksGlyph(fam, wt, ch) {
  const key = fam + '|' + wt + '|' + ch; if (glyphCache.has(key)) return glyphCache.get(key);
  const c = canvas(56, 56), x = c.getContext('2d', { willReadFrequently: true });
  const draw = fb => { x.clearRect(0, 0, 56, 56); x.font = `${wt} 44px "${fam}", "${fb}"`; x.textBaseline = 'middle'; x.fillText(ch, 4, 28); return x.getImageData(0, 0, 56, 56).data; };
  const A = draw('Noto Serif SC'), B = draw('Noto Sans SC');
  let diff = 0; for (let i = 3; i < A.length; i += 4) if (Math.abs(A[i] - B[i]) > 60) diff++;
  const miss = diff > 12; glyphCache.set(key, miss); return miss;
}
async function missingChars(s) {
  const f = fontInfo(s.font), fam = f.family || f.id, wt = f.weights ? s.weight : 400;
  const chars = [...new Set(Array.from(drawnText(s).replace(/[\s\/|｜★☆]/g, '')))]; if (!chars.length) return [];
  const t = chars.join('');
  try { await Promise.race([Promise.all([document.fonts.load(`400 44px "Noto Serif SC"`, t), document.fonts.load(`400 44px "Noto Sans SC"`, t)]), new Promise(r => setTimeout(r, 5000))]); } catch (e) {}
  if (!rangeCache.has(fam)) rangeCache.set(fam, [...document.fonts].filter(x => x.family.replace(/["']/g, '') === fam).flatMap(x => parseRanges(x.unicodeRange)));
  const ranges = rangeCache.get(fam), uploaded = customFonts.some(c => c.id === f.id), backup = fam === 'Noto Serif SC' || fam === 'Noto Sans SC';
  return chars.filter(ch => {
    const cp = ch.codePointAt(0);
    if (!uploaded && ranges.length && !ranges.some(([lo, hi]) => cp >= lo && cp <= hi)) return true;
    return !backup && lacksGlyph(fam, wt, ch);
  });
}
function scriptOf(chars) {
  const t = chars.join('');
  if (/[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/.test(t)) return 'ko';
  if (/[\u3040-\u30ff]/.test(t)) return 'ja';
  return 'zh';
}

/* ---------- text measurements ---------- */
function showTextSize(mk) {
  const el = $('#textSize'), f = n => n.toFixed(2), words = eff(S).layout === 'grid' && isLatin(S.text);
  if (!mk.textBox) { el.innerHTML = ''; return; }
  const rows = mk.glyphs.map(g => `<tr><th scope="row">${g.ch.replace(/[<&]/g, '')}</th><td>${f(g.w)}</td><td>${f(g.h)}</td></tr>`).join('');
  el.innerHTML = `<table class="kv${mk.glyphs.length > 6 ? ' many' : ''}"><caption>${words ? tl('每个词（mm）', 'Each word (mm)', '単語ごと（mm）', '단어별 (mm)') : tl('每个字（mm）', 'Each character (mm)', '1 文字ごと（mm）', '글자별 (mm)')}</caption><thead><tr><th scope="col">${words ? tl('词', 'Word', '単語', '단어') : tl('字', 'Char', '文字', '글자')}</th><th scope="col">${tl('宽', 'W', '幅', '폭')}</th><th scope="col">${tl('高', 'H', '高さ', '높이')}</th></tr></thead><tbody>${rows}</tbody></table>`;
}

/* ---------- 简繁转换 ---------- */
let occ = null;
function loadOpenCC() {
  if (occ) return occ;
  occ = new Promise((res, rej) => {
    if (window.OpenCC) return res(window.OpenCC);
    const sc = document.createElement('script');
    sc.src = 'https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.js';
    sc.onload = () => window.OpenCC ? res(window.OpenCC) : rej(new Error('no OpenCC'));
    sc.onerror = () => { occ = null; rej(new Error('load failed')); };
    document.head.appendChild(sc);
  });
  return occ;
}
async function convertAll(toTrad) {
  const btns = [$('#toT'), $('#toS')]; btns.forEach(b => b.disabled = true);
  status(tl('正在载入简繁字库…', 'Loading the converter…', '変換ツールを読み込み中…', '변환기 불러오는 중…'));
  try {
    const O = await loadOpenCC();
    const conv = toTrad ? O.Converter({ from: 'cn', to: 'tw' }) : O.Converter({ from: 'tw', to: 'cn' });
    let changed = 0;
    for (const k of ['text', 'ringText', 'centerText', 'bottomText']) {
      const v = S[k] || '', n = conv(v); if (n !== v) { S[k] = n; changed++; }
    }
    persist(); syncUI(); schedule();
    if (!changed) status(toTrad ? tl('没有需要转成繁体的字。', 'Nothing to convert.', '繁体字に変換する文字がありません。', '번체로 바꿀 글자가 없습니다.') : tl('没有需要转成简体的字。', 'Nothing to convert.', '簡体字に変換する文字がありません。', '간체로 바꿀 글자가 없습니다.'));
    else status(toTrad ? tl('已转成繁体。一简对多繁的字请看一眼，比如 发→發/髮、后→後/后。', 'Converted to Traditional. Check characters with more than one form, e.g. 发→發/髮.', '繁体字に変換しました。发→發/髮 のように対応する字が複数あるものは確認してください。', '번체로 바꿨습니다. 发→發/髮처럼 대응하는 글자가 여럿인 경우는 확인하세요.') : tl('已转回简体。', 'Converted to Simplified.', '簡体字に変換しました。', '간체로 바꿨습니다.'));
  } catch (e) { status(tl('简繁字库没载入成功，检查网络再试。', 'Could not load the converter. Check your connection and try again.', '変換ツールを読み込めませんでした。接続を確認してもう一度お試しください。', '변환기를 불러오지 못했습니다. 연결을 확인하고 다시 시도하세요.'), true); }
  btns.forEach(b => b.disabled = false);
}
$('#toT').addEventListener('click', () => convertAll(true));
$('#toS').addEventListener('click', () => convertAll(false));

/* 俯视小图：手柄截面（实线）和印面外框（虚线） */
function drawSection(mesh, s) {
  const el = $('#sectionView'); if (!el) return;
  if (!mesh.section || s.handle !== 'grip' || s.groove === 'none') { el.innerHTML = ''; return; }
  const pts = mesh.section, col = mesh.collar || [], all = pts.concat(col);
  const R = Math.max(...all.map(([x, y]) => Math.max(Math.abs(x), Math.abs(y)))) * 1.08, sz = 120, k = sz / 2 / R;
  const path = q => q.map(([x, y], i) => `${i ? 'L' : 'M'}${(sz / 2 + x * k).toFixed(1)},${(sz / 2 - y * k).toFixed(1)}`).join('') + 'Z';
  const [fw, fh] = mesh.face;
  el.innerHTML = `<svg viewBox="0 0 ${sz} ${sz}" role="img" aria-label="${tl('手柄俯视截面', 'Handle seen from above', '上から見た持ち手', '위에서 본 손잡이')}"><path class="sec-body" d="${path(pts)}"/>`
    + (col.length ? `<path class="sec-collar" d="${path(col)}"/>` : '')
    + (s.shape === 'circle' ? `<circle class="sec-face" cx="${sz / 2}" cy="${sz / 2}" r="${(fw / 2 * k).toFixed(1)}"/></svg>`
      : `<rect class="sec-face" x="${(sz / 2 - fw / 2 * k).toFixed(1)}" y="${(sz / 2 - fh / 2 * k).toFixed(1)}" width="${(fw * k).toFixed(1)}" height="${(fh * k).toFixed(1)}"/></svg>`)
    + `<span>${tl('俯视：实线是手柄，虚线是直段，红框是印面', 'Top view: solid = handle, dashed = collar, red = face', '上面図：実線 = 持ち手、破線 = ストレート部、赤 = 印面', '위에서 본 모습: 실선 = 손잡이, 점선 = 직선부, 빨강 = 인면')}</span>`;
}

function showClarity(t, s) {
  const el = $('#clarity'); if (!t.strokeMed) { el.hidden = true; return; } el.hidden = false;
  const f2 = x => x.toFixed(2), heavy = t.strokeMed > 1.0 && t.gapMed < 0.45; // calibrated on test prints: about 0.9 / 0.5 still prints well, 1.2+ / 0.3 is too bold
  el.innerHTML = `<table class="kv"><caption>${tl('清晰度（mm）', 'Clarity (mm)', 'くっきり度（mm）', '선명도 (mm)')}</caption><thead><tr><th scope="col"></th><th scope="col">${tl('这个章', 'This stamp', 'このスタンプ', '이 스탬프')}</th><th scope="col" title="${tl('一个实测印得很清楚的章', 'A stamp that printed very clearly', '実際にとてもくっきり押せたスタンプ', '실제로 아주 선명하게 찍힌 스탬프')}">${tl('参考', 'Reference', '基準', '기준')}</th></tr></thead><tbody>`
    + `<tr><th scope="row">${tl('笔画', 'Stroke', '線', '획')}</th><td class="me">${f2(t.strokeMed)}</td><td>${XI.stroke.toFixed(2)}</td></tr>`
    + `<tr><th scope="row">${tl('空隙', 'Gap', 'すき間', '간격')}</th><td class="me">${f2(t.gapMed)}</td><td>${XI.gap.toFixed(2)}</td></tr></tbody></table>`
    + (heavy ? `<p class="tip">${tl('比参考粗很多、空隙更挤，容易糊：调小「加粗」或字重降一档。', 'Much bolder than the reference with tight gaps, so it may blur: lower Bold + or use a lighter weight.', '基準よりかなり太く、すき間も狭いのでつぶれやすいです：「太らせる」を下げるか、ウェイトを一段細くしてください。', '기준보다 훨씬 굵고 간격이 좁아 뭉개지기 쉽습니다: ‘굵게 +’를 줄이거나 두께를 한 단계 낮추세요.')}</p>` : '');
  el.classList.toggle('heavy', heavy);
}
function showWarns(list) {
  const el = $('#warn'); el.innerHTML = ''; el.hidden = !list.length;
  for (const w of list) {
    const li = document.createElement('li'), text = typeof w === 'string' ? w : w.text;
    li.appendChild(document.createTextNode(text));
    if (w.action === 'fixThin' && !el.querySelector('.fix')) {
      const b = document.createElement('button'); b.className = 'btn fix'; b.type = 'button'; b.textContent = tl('一键调整', 'Auto-fix', '自動調整', '자동 조정');
      b.addEventListener('click', () => fixThin(b)); li.appendChild(b);
    }
    el.appendChild(li);
  }
}

/* 一键调整细笔画：只动字（字重、笔画加粗、字间距、边框），不动印面大小。每试一档就重新检查，黄色没了就停。 */
async function checkOf(s0) {
  const { s } = sane(s0); await ensureFont(s);
  return thinCheck(makeMask(s.product === 'roller' ? rollerTile(s) : s.product === 'cutter' ? cutterTile(s) : s), s.nozzle);
}
/* 一键调整：笔画太细就往粗调，空隙太窄就往细调；两种都有时两边都试。
   挑问题最少的，同样少的时候选改动最小的；不允许把字里本来空着的格子（口、日、田）填死。印面大小不动。 */
async function fixThin(btn) {
  btn.disabled = true; btn.textContent = tl('调整中…', 'Fixing…', '調整中…', '조정 중…');
  const f = fontInfo(S.font), base = { ...S }, yin = S.mode === 'yin';
  const r2 = x => Math.round(x * 100) / 100;
  const b0 = await checkOf(base), before = b0.count + b0.gaps;
  // the enclosed spaces this text should have: count them on the lightest version, where nothing has closed up yet.
  // A heavy version can have extra ones (two letters touching make a closed pocket), so never ask for more than the lightest has.
  const ws = f.weights && f.weights.length ? f.weights : [base.weight];
  const light = await checkOf({ ...base, thicken: 0, weight: ws[0] }), wantHoles = Math.min(b0.holes, light.holes);
  // which way to go: for 阳文 thin strokes want thicker and tight gaps want thinner; 阴文 is the other way round
  const needThicker = yin ? b0.gaps > 0 : b0.count > 0, needThinner = yin ? b0.count > 0 : b0.gaps > 0;
  const bw = ws.includes(base.weight) ? base.weight : ws[0];
  const okW = w => (needThicker && w >= bw) || (needThinner && w <= bw);
  const okT = t => (needThicker && t >= base.thicken) || (needThinner && t <= base.thicken);
  const thick = []; for (let t = 0; t <= 0.5001; t = r2(t + 0.05)) if (okT(t)) thick.push(t);
  const gaps = yin && needThinner ? [0, 0.2, 0.4, 0.6, 0.8, 1].map(g => r2(base.gap + g)) : [base.gap];
  const stretches = !yin && needThinner && base.stretch > 1 ? [base.stretch, 1] : [base.stretch];
  const border = !yin && base.border > 0 && base.border < base.nozzle + 0.1 ? r2(base.nozzle + 0.2) : base.border;
  const wi = w => ws.indexOf(w);
  const cost = c => Math.abs(c.thicken - base.thicken) / 0.05 + Math.abs(wi(c.weight) - wi(bw)) * 2 + Math.abs(c.gap - base.gap) / 0.2 + Math.abs(c.stretch - base.stretch) * 2;
  const cands = [];
  for (const w of ws.filter(okW)) for (const t of thick) for (const g of gaps) for (const st of stretches) cands.push({ weight: w, thicken: t, gap: g, stretch: st, border });
  cands.sort((p, q) => cost(p) - cost(q));
  let best = null, done = 0;
  for (const c of cands) {
    const r = await checkOf({ ...base, ...c });
    if (r.holes >= wantHoles) { const n = r.count + r.gaps; if (!best || n < best.n) best = { n, c }; if (n === 0) break; }
    if (++done % 6 === 0) { btn.textContent = `${tl('调整中…', 'Fixing…', '調整中…', '조정 중…')} ${Math.round(100 * done / cands.length)}%`; await new Promise(res => setTimeout(res, 0)); }
  }
  btn.disabled = false; btn.textContent = tl('一键调整', 'Auto-fix', '自動調整', '자동 조정');
  const NAME = { weight: tl('字重', 'Weight', 'ウェイト', '두께'), thicken: tl('加粗', 'Bold +', '太らせる', '굵게 +'), gap: tl('字间距', 'Spacing', '字間', '자간'), border: tl('边框粗', 'Border', '枠の太さ', '테두리'), stretch: tl('拉伸', 'Stretch', '縦長', '늘이기') };
  const fmt = (k, v) => k === 'weight' ? weightName(v) : k === 'stretch' ? (v <= 1.001 ? tl('等比', 'none', 'なし', '없음') : '×' + v) : `${v} mm`;
  const changed = best ? Object.entries(best.c).filter(([k, v]) => base[k] !== v && !(k === 'weight' && !f.weights)) : [];
  if (!best || best.n >= before || !changed.length) { status(isLatin(S.text) ? tl('调不好了。字母太小，可以放大印面、调小图案，或换 Oswald、Bebas Neue。', 'Could not fix it. The letters are too small: make the face bigger, the picture smaller, or try Oswald or Bebas Neue.', '調整しきれません。文字が小さすぎます：印面を大きくするか、画像を小さくするか、Oswald や Bebas Neue にしてください。', '조정할 수 없습니다. 글자가 너무 작습니다: 인면을 키우거나 이미지를 줄이거나 Oswald, Bebas Neue로 바꾸세요.') : tl('调不好了。字笔画太密，只能放大印面，或换笔画少、粗细均匀的字体（比如思源黑体）。', 'Could not fix it. The characters are too dense: make the face bigger or use a plainer font (e.g. Source Han Sans).', '調整しきれません。画数が多すぎます：印面を大きくするか、線の太さが均一なフォント（源ノ角ゴシックなど）にしてください。', '조정할 수 없습니다. 획이 너무 촘촘합니다: 인면을 키우거나 획 굵기가 고른 글꼴(본고딕 등)로 바꾸세요.')); return; }
  Object.assign(S, best.c); fillWeights(); persist(); syncUI(); schedule();
  const what = changed.map(([k, v]) => `${NAME[k]} ${fmt(k, base[k])} → ${fmt(k, v)}`).join(tl('，', ', ', '、', ', '));
  status(best.n === 0 ? tl(`已调整：${what}。现在没有问题了。`, `Fixed: ${what}. All clear now.`, `調整しました：${what}。問題はなくなりました。`, `조정했습니다: ${what}. 이제 문제가 없습니다.`) : tl(`已调整：${what}。从 ${before} 处减到 ${best.n} 处；剩下的要放大印面或换字体。`, `Changed: ${what}. ${before} → ${best.n} problems; for the rest, enlarge the face or change font.`, `調整しました：${what}。問題が ${before} か所から ${best.n} か所に減りました。残りは印面を大きくするかフォントを変えてください。`, `조정했습니다: ${what}. 문제가 ${before}곳에서 ${best.n}곳으로 줄었습니다. 나머지는 인면을 키우거나 글꼴을 바꾸세요.`));
}
// Export refuses to run on a stand-in font or an empty face, since the STL would not be what the preview promised.
function hasContent(s) {
  if (imgSrc && s.imgMode !== 'none' && imgMask(s)) return true;
  const t = x => (x || '').replace(/[\s\/|｜]+/g, '');
  return eff(s).layout === 'ring' ? !!(t(s.ringText) || t(s.bottomText) || s.center === 'star' || (s.center === 'text' && t(s.centerText))) : !!t(s.text);
}
function exportBlocked() {
  if (!current) return tl('还在生成，稍等一下再点。', 'Still generating, try again in a moment.', 'まだ生成中です。少し待ってからもう一度押してください。', '아직 생성 중입니다. 잠시 후 다시 눌러 주세요.');
  if (!hasContent(current.s)) return tl('印面上还没有字，先输入文字。', 'The face is empty. Type some text first.', '印面が空です。先に文字を入力してください。', '인면이 비어 있습니다. 먼저 글자를 입력하세요.');
  if (!current.fontOk) return tl('字体还没载入，联网后刷新再导出。', 'The font has not loaded yet. Reload with a connection, then export.', 'フォントがまだ読み込まれていません。ネットに接続して再読み込みしてから書き出してください。', '글꼴이 아직 로드되지 않았습니다. 인터넷에 연결해 새로고침한 뒤 내보내세요.');
  if (!current.mesh.loops) return tl('印面是空的，先输入文字。', 'The face is empty. Type some text first.', '印面が空です。先に文字を入力してください。', '인면이 비어 있습니다. 먼저 글자를 입력하세요.');
  return '';
}

/* ---------- regenerate ---------- */
let timer = 0, gen = 0, current = null;
function schedule() { clearTimeout(timer); timer = setTimeout(regenerate, 180); }
async function regenerate() {
  const my = ++gen, { s, warns } = sane(S);
  const fontOk = await ensureFont(s); if (my !== gen) return;
  const isRoller = s.product === 'roller', isCutter = s.product === 'cutter';
  const mk = makeMask(isRoller ? rollerTile(s) : isCutter ? cutterTile(s) : s);
  // a plain cutter only uses the outline, so stroke checks only matter when the design is pressed in
  const thin = isCutter && !s.cutterImprint ? { count: 0, gaps: 0, overlay: null, strokeMed: 0 } : thinCheck(mk, s.nozzle);
  const mesh = isRoller ? buildRoller(s, mk) : isCutter ? buildCutter(s, mk) : buildMesh(s, mk); if (my !== gen) return;
  if (isRoller) drawRollerImpression(mk, s, thin.overlay); else if (isCutter) drawCutterImpression(mesh, s, thin.overlay, mk); else drawImpression(mk, s, thin.overlay);
  showTextSize(mk);
  const miss = fontOk ? await missingChars(s) : [];
  if (my !== gen) return;
  if (miss.length) {
    const lang = scriptOf(miss), shown = miss.slice(0, 6).map(c => tl(`「${c}」`, ` ${c}`, `「${c}」`, ` ‘${c}’`)).join('') + (miss.length > 6 ? tl(` 等 ${miss.length} 个字`, ` (${miss.length} in all)`, ` など ${miss.length} 字`, ` 등 ${miss.length}자`) : '');
    const isZh = lang === 'zh' || lang === 'tc', fix = isZh ? tl('换思源宋体 / 黑体或「中文繁体」组', 'Source Han Serif / Sans or a Traditional Chinese', '源ノ明朝 / 源ノ角ゴシックか「中国語（繁体）」グループの', '본명조 / 본고딕 또는 ‘중국어 번체’ 그룹의') : tl(`换「${langName(lang)}」组`, `a ${langName(lang)}`, `「${langName(lang)}」グループの`, `‘${langName(lang)}’ 그룹의`);
    warns.unshift(tl(`这个字体没有${shown}，现在用别的字体代替。可以${fix}的字体。`, `This font has no${shown}; another font fills in. Try ${fix} font.`, `このフォントには${shown}がないため、別のフォントで代わりに表示しています。${fix}フォントを試してください。`, `이 글꼴에는${shown}이(가) 없어 다른 글꼴로 대신 표시합니다. ${fix} 글꼴을 써 보세요.`));
  }
  if (!fontOk) warns.unshift(tl(`字体「${fontInfo(s.font).name}」还没载入，预览不准。联网后刷新再导出。`, `Font “${fontLabel(fontInfo(s.font))}” has not loaded; the preview is not exact. Reload with a connection before exporting.`, `フォント「${fontLabel(fontInfo(s.font))}」がまだ読み込まれていないため、プレビューは正確ではありません。ネットに接続して再読み込みしてから書き出してください。`, `글꼴 ‘${fontLabel(fontInfo(s.font))}’이(가) 아직 로드되지 않아 미리보기가 정확하지 않습니다. 인터넷에 연결해 새로고침한 뒤 내보내세요.`));
  if (thin.gaps) warns.push({ action: 'fixThin', text: mk.yin
    ? tl(`${thin.gaps} 处凹下去的笔画太细（蓝色），会印不清。`, `${thin.gaps} engraved ${pl(thin.gaps, 'stroke is', 'strokes are')} too thin (blue); may not print clearly.`, `凹んだ線が細すぎる所が ${thin.gaps} か所あります（青）。くっきり押せないかもしれません。`, `파인 획이 너무 가는 곳이 ${thin.gaps}곳 있습니다(파랑). 선명하게 찍히지 않을 수 있습니다.`)
    : tl(`${thin.gaps} 个小空格太小（蓝色），会印不清。`, `${thin.gaps} enclosed ${pl(thin.gaps, 'space is', 'spaces are')} too small (blue); may not print clearly.`, `囲まれたすき間が小さすぎる所が ${thin.gaps} か所あります（青）。くっきり押せないかもしれません。`, `둘러싸인 빈 곳이 너무 작은 곳이 ${thin.gaps}곳 있습니다(파랑). 선명하게 찍히지 않을 수 있습니다.`) });
  if (thin.count) warns.push({ action: 'fixThin', text: mk.yin
    ? tl(`${thin.count} 处两笔靠太近（黄色），会连在一起。`, `${thin.count} ${pl(thin.count, 'spot where strokes are', 'spots where strokes are')} too close (yellow); they may join.`, `線と線が近すぎる所が ${thin.count} か所あります（黄）。くっついてしまうかもしれません。`, `획끼리 너무 가까운 곳이 ${thin.count}곳 있습니다(노랑). 붙어 버릴 수 있습니다.`)
    : tl(`${thin.count} 处笔画比喷嘴细（黄色），可能断笔。`, `${thin.count} ${pl(thin.count, 'stroke is', 'strokes are')} thinner than the nozzle (yellow); ${pl(thin.count, 'it', 'they')} may break.`, `ノズルより細い線が ${thin.count} か所あります（黄）。途切れるかもしれません。`, `노즐보다 가는 획이 ${thin.count}곳 있습니다(노랑). 끊어질 수 있습니다.`) });
  showWarns(warns);
  current = { s, mesh, mk, fontOk, thin: thin.count };
  setMesh3D(mesh.tris, mesh.size);
  const ntri = mesh.tris.length / 9, mb = (84 + 50 * ntri) / 1048576;
  const [hh, hb, hr] = mesh.heights, f1 = x => x.toFixed(2), inch = x => (x / 25.4).toFixed(2), [fw, fh] = mesh.face, round = s.shape === 'circle';
  const rg = mesh.roller, cu = mesh.cutter && !mesh.cutter.empty ? mesh.cutter : null, cutEmpty = !!(mesh.cutter && mesh.cutter.empty);
  $('#kpiFaceL').textContent = rg ? tl('滚轮', 'Roller', 'ローラー', '롤러') : cu ? tl('切出来', 'Cut size', '抜いた大きさ', '잘린 크기') : tl('印面', 'Face', '印面', '인면');
  $('#kpiHL').textContent = rg ? tl('滚一圈', 'One turn', '1 回転分', '한 바퀴') : tl('总高', 'Height', '全高', '전체 높이');
  if (cutEmpty) { $('#kpiFaceL').textContent = tl('切出来', 'Cut size', '抜いた大きさ', '잘린 크기'); ['#kpiFace', '#kpiH'].forEach(q => $(q).textContent = '—'); ['#kpiFaceIn', '#kpiHIn'].forEach(q => $(q).textContent = ''); }
  else if (cu) {
    $('#kpiFace').innerHTML = `${f1(cu.cut[0])} × ${f1(cu.cut[1])}<small>mm</small>`;
    $('#kpiFaceIn').textContent = `${inch(cu.cut[0])} × ${inch(cu.cut[1])} in`;
    $('#kpiH').innerHTML = `${f1(cu.H)}<small>mm</small>`; $('#kpiHIn').textContent = `${inch(cu.H)} in`;
  } else if (rg) {
    $('#kpiFace').innerHTML = `Ø ${f1(mesh.size[0])} × ${f1(rg.L)}<small>mm</small>`;
    $('#kpiFaceIn').textContent = `Ø ${inch(mesh.size[0])} × ${inch(rg.L)} in`;
    $('#kpiH').innerHTML = `${f1(rg.C)}<small>mm</small>`;
    $('#kpiHIn').textContent = `${inch(rg.C)} in`;
  } else {
    $('#kpiFace').innerHTML = (round ? `Ø ${f1(fw)}` : `${f1(fw)} × ${f1(fh)}`) + '<small>mm</small>';
    $('#kpiFaceIn').textContent = round ? `Ø ${inch(fw)} in` : `${inch(fw)} × ${inch(fh)} in`;
    $('#kpiH').innerHTML = `${f1(mesh.size[2])}<small>mm</small>`;
    $('#kpiHIn').textContent = `${inch(mesh.size[2])} in`;
  }
  const tb = mk.textBox;
  $('#kpiTextL').textContent = imgSrc && s.imgMode === 'with' ? tl('图文区域', 'Design area', '図柄エリア', '디자인 영역') : imgSrc && s.imgMode === 'only' ? tl('图案区域', 'Picture area', '画像エリア', '이미지 영역') : tl('文字区域', 'Text area', '文字エリア', '글자 영역');
  $('#kpiText').innerHTML = tb ? `${f1(tb.w)} × ${f1(tb.h)}<small>mm</small>` : '—';
  $('#kpiTextIn').textContent = tb ? `${inch(tb.w)} × ${inch(tb.h)} in` : '';
  if (cutEmpty) $('#stats').textContent = '';
  else if (cu) $('#stats').textContent = tl(`切模外形 ${f1(cu.whole[0])} × ${f1(cu.whole[1])} mm · 刀口 ${f1(+s.bladeT)} → 根部 ${f1(+s.wallT)} mm · 边沿 ${f1(+s.flangeW)} mm${cu.imp ? ` · 压纹比刀口低 ${f1(+s.imprintGap)} mm` : ''}`, `footprint ${f1(cu.whole[0])} × ${f1(cu.whole[1])} mm · blade ${f1(+s.bladeT)} → base ${f1(+s.wallT)} mm · rim ${f1(+s.flangeW)} mm${cu.imp ? ` · imprint ${f1(+s.imprintGap)} mm above the edge` : ''}`, `外形 ${f1(cu.whole[0])} × ${f1(cu.whole[1])} mm · 刃先 ${f1(+s.bladeT)} → 根元 ${f1(+s.wallT)} mm · ツバ ${f1(+s.flangeW)} mm${cu.imp ? ` · 型押しは刃先より ${f1(+s.imprintGap)} mm 低い` : ''}`, `외형 ${f1(cu.whole[0])} × ${f1(cu.whole[1])} mm · 칼날 ${f1(+s.bladeT)} → 밑동 ${f1(+s.wallT)} mm · 받침 ${f1(+s.flangeW)} mm${cu.imp ? ` · 압인은 칼날보다 ${f1(+s.imprintGap)} mm 낮음` : ''}`);
  else if (rg) $('#stats').textContent = tl(`外径 Ø${f1(mesh.size[0])} · 内孔 Ø${f1(rg.hole)} · 壁厚 ${f1((rg.D - rg.hole) / 2)} · 花纹深 ${f1(hr)} mm · ${rg.n} × ${rg.m} 个图案${rg.end > rg.clip + 0.05 ? ` · 两端各空 ${f1(rg.end)} mm` : ''}`, `OD Ø${f1(mesh.size[0])} · hole Ø${f1(rg.hole)} · wall ${f1((rg.D - rg.hole) / 2)} · pattern depth ${f1(hr)} mm · ${rg.n} × ${rg.m} tiles${rg.end > rg.clip + 0.05 ? ` · ${f1(rg.end)} mm blank at each end` : ''}`, `外径 Ø${f1(mesh.size[0])} · 穴 Ø${f1(rg.hole)} · 壁厚 ${f1((rg.D - rg.hole) / 2)} · 模様の深さ ${f1(hr)} mm · ${rg.n} × ${rg.m} 個${rg.end > rg.clip + 0.05 ? ` · 両端に ${f1(rg.end)} mm 余白` : ''}`, `외경 Ø${f1(mesh.size[0])} · 구멍 Ø${f1(rg.hole)} · 벽 두께 ${f1((rg.D - rg.hole) / 2)} · 무늬 깊이 ${f1(hr)} mm · ${rg.n} × ${rg.m}개${rg.end > rg.clip + 0.05 ? ` · 양끝 각 ${f1(rg.end)} mm 여백` : ''}`);
  else $('#stats').textContent = [hh > 0 ? tl(`手柄 ${f1(hh)}${mesh.neck > 0 ? `（含直段 ${f1(mesh.neck)}）` : ''}`, `handle ${f1(hh)}${mesh.neck > 0 ? ` (incl. collar ${f1(mesh.neck)})` : ''}`, `持ち手 ${f1(hh)}${mesh.neck > 0 ? `（ストレート部 ${f1(mesh.neck)} を含む）` : ''}`, `손잡이 ${f1(hh)}${mesh.neck > 0 ? `(직선부 ${f1(mesh.neck)} 포함)` : ''}`) : '', hb > 0 ? tl(`底板 ${f1(hb)}`, `base ${f1(hb)}`, `台座 ${f1(hb)}`, `받침판 ${f1(hb)}`) : '', tl(`字凸起 ${f1(hr)} mm`, `relief ${f1(hr)} mm`, `凸 ${f1(hr)} mm`, `돌출 ${f1(hr)} mm`)].filter(Boolean).join(' + ')
    + tl(` · 外形最大 ${f1(mesh.size[0])} × ${f1(mesh.size[1])} mm`, ` · footprint ${f1(mesh.size[0])} × ${f1(mesh.size[1])} mm`, ` · 外形 ${f1(mesh.size[0])} × ${f1(mesh.size[1])} mm`, ` · 외형 ${f1(mesh.size[0])} × ${f1(mesh.size[1])} mm`);
  if (cu) $('#slicerNote').innerHTML = tl('边沿贴平台、刀口朝上打，不用支撑。', 'Print rim down, blade up. No supports.', 'ツバを下、刃先を上にして印刷。サポート不要。', '받침을 아래, 칼날을 위로 해서 출력. 서포트 필요 없음.');
  else if (rg) $('#slicerNote').innerHTML = s.rollerSlope ? tl('滚轮竖着打（轴朝上）。花纹下沿做了 45° 台阶，不用支撑。', 'Print the roller standing up. The pattern’s lower edges are stepped at 45°, so no supports.', 'ローラーは立てて印刷（軸が上）。模様の下側は 45° の段になっているのでサポート不要。', '롤러는 세워서 출력(축이 위). 무늬 아래쪽은 45° 계단이라 서포트 필요 없음.') : tl(`滚轮竖着打（轴朝上）。花纹侧面是直的，下沿悬空 ${(+s.reliefH).toFixed(1)} mm；打不好就在「滚轮」页打开「下沿斜边」。`, `Print the roller standing up. Pattern sides are straight, so lower edges overhang ${(+s.reliefH).toFixed(1)} mm; if they sag, turn on “Sloped lower edges” on the Roller tab.`, `ローラーは立てて印刷（軸が上）。模様の側面はまっすぐなので、下側が ${(+s.reliefH).toFixed(1)} mm 浮きます。うまくいかないときは「ローラー」タブで「下側を斜めに」をオンに。`, `롤러는 세워서 출력(축이 위). 무늬 옆면이 수직이라 아래쪽이 ${(+s.reliefH).toFixed(1)} mm 떠 있습니다. 잘 안 나오면 ‘롤러’ 탭에서 ‘아래쪽 경사’를 켜세요.`);
  else { const sl = slicerOf(s), rl = reliefLayers(mesh.size[2], hr, sl), bench = s.slicer === BENCH_SLICER || !SLICERS[s.slicer];
    const off = Math.abs(rl.printed - hr) > 0.005;
    const pr = off ? `<b>${rl.printed.toFixed(2)}</b>` : rl.printed.toFixed(2);
    $('#slicerNote').innerHTML = tl(`共 ${rl.layers} 层，字凸起 ${rl.n} 层 = ${pr} mm${off ? `（设的 ${hr.toFixed(2)}）` : ''}`, `${rl.layers} layers; relief ${rl.n} layers = ${pr} mm${off ? ` (set ${hr.toFixed(2)})` : ''}`, `全 ${rl.layers} 層、凸部 ${rl.n} 層 = ${pr} mm${off ? `（設定 ${hr.toFixed(2)}）` : ''}`, `전체 ${rl.layers}층, 돌출 ${rl.n}층 = ${pr} mm${off ? `(설정 ${hr.toFixed(2)})` : ''}`)
      + (bench ? '' : tl(`<br>清晰度是按 0.10 配置测的，这个配置线宽 ${sl.lw}，细节可能差一些。`, `<br>Clarity checks were calibrated on the 0.10 profile; this one uses ${sl.lw} mm lines, so fine detail may be softer.`, `<br>くっきり度の判定は 0.10 のプロファイルで測ったものです。このプロファイルは線幅 ${sl.lw} mm なので、細部は少し甘くなるかもしれません。`, `<br>선명도 판정은 0.10 프로파일 기준입니다. 이 프로파일은 선폭이 ${sl.lw} mm라 세부가 조금 흐릴 수 있습니다.`));
  }
  showClarity(thin, s); drawImgPrev();
  $('#meshInfo').textContent = tl(`面数 ${ntri.toLocaleString()} · STL ${mb.toFixed(1)} MB`, `${ntri.toLocaleString()} triangles · STL ${mb.toFixed(1)} MB`, `ポリゴン ${ntri.toLocaleString()} · STL ${mb.toFixed(1)} MB`, `삼각형 ${ntri.toLocaleString()}개 · STL ${mb.toFixed(1)} MB`);
  if (!rg && !cu) drawSection(mesh, s);
  const hn = $('#handleNote');
  hn.textContent = mesh.notes.length ? mesh.notes.join(tl('；', '; ', '。', '; ')) + tl('。', '.', '。', '.') : ''; hn.hidden = !mesh.notes.length;
  hn.classList.toggle('err', mesh.notes.length > 0);
  const empty = !mesh.loops || !hasContent(s);
  $('#dl').disabled = $('#dlStl').disabled = empty;
  if (empty) status(tl('印面上还没有字，先输入文字。', 'The face is empty. Type some text first.', '印面が空です。先に文字を入力してください。', '인면이 비어 있습니다. 먼저 글자를 입력하세요.'), true);
  else if ($('#status').classList.contains('err')) status('');
}

/* ---------- 滚轮压花 ----------
   One design tile is drawn like a small stamp face, repeated n × m times on the unrolled surface (circumference × length),
   then the relief is bent onto a hollow cylinder. The roller prints standing up; each raised part gets a 45° staircase
   on its lower side (0.4 mm steps) so nothing overhangs. Rolling leaves a mirror image, so the surface is mirrored like a stamp. */
function rollerGeo(s) {
  const D = +s.rollerD, L = +s.rollerL, n = Math.max(1, Math.round(+s.rollerN)), m = Math.max(1, Math.round(+s.rollerM));
  const C = Math.PI * D, tileW = C / n; let end = Math.min(+s.rollerEnd, L / 2 - 2), mm_ = m, tileH = (L - 2 * end) / m;
  // 只用图案 + 铺满: the picture repeats like wallpaper at its own proportions (每圈重复 sets its size), as many rows as fit,
  // so a seamless pattern runs all the way round without seams
  const clip = end;
  if (rollerWallpaper(s)) { const im = imgMask(s); if (im && im.mask) { tileH = tileW / im.aspect; const av = L - 2 * end, r = Math.max(1, Math.round(av / tileH));
    // whole rows only: if a whole number of rows is within 8% of filling the length, stretch the rows that little bit to fill it;
    // otherwise keep the shape and leave the ends blank
    if (Math.abs(av / (r * tileH) - 1) <= 0.08) { mm_ = r; tileH = av / r; } else { mm_ = Math.max(1, Math.floor(av / tileH + 1e-6)); end = (L - mm_ * tileH) / 2; } } }
  return { D, L, n, m: mm_, C, end, clip, tileW, tileH, hole: Math.min(+s.rollerHole, D - 4) };
}
// For a repeating pattern pick how many go round so that whole rows fill the length best (pattern at least 20 mm wide).
function bestWallpaperN(s) {
  const im = imgMask(s); if (!im || !im.mask) return s.rollerN;
  const D = +s.rollerD, L = +s.rollerL, C = Math.PI * D, av = L - 2 * Math.min(+s.rollerEnd, L / 2 - 2);
  let best = s.rollerN, score = Infinity;
  for (let n = 1; n <= 12; n++) {
    const w = C / n; if (w < 20 && n > 1) break;
    const h = w / im.aspect, r = Math.max(1, Math.round(av / h)), f = Math.abs(av / (r * h) - 1);
    const sc = (f <= 0.08 ? f : 1 + (av - Math.floor(av / h) * h) / av) + Math.abs(n - 3) * 0.01;
    if (sc < score) { score = sc; best = n; }
  }
  return best;
}
const rollerWallpaper = s => !!(imgSrc && s.product === 'roller' && s.imgMode === 'only' && s.imgFit === 'fill');
function rollerTile(s) {
  const g = rollerGeo(s);
  return { ...s, shape: 'rect', w: g.tileW, h: g.tileH, border: 0, corner: 0, margin: 0, pad: rollerWallpaper(s) ? 0 : Math.max(0, +s.rollerGap) / 2, handle: 'none', layout: 'grid' };
}
function buildRoller(s, mk) {
  const g = rollerGeo(s), R0 = g.D / 2, rIn = g.hole / 2, h = +s.reliefH, ppm = mk.ppm, P = mk.P, out = [];
  // hollow core
  const N = Math.min(720, Math.max(180, Math.ceil(g.C / 0.4))), L = g.L, pt = (r, a, z) => [r * Math.cos(a), r * Math.sin(a), z];
  const tri = (a, b, c) => out.push(...a, ...b, ...c);
  for (let k = 0; k < N; k++) {
    const a0 = k / N * 2 * Math.PI, a1 = (k + 1) / N * 2 * Math.PI;
    const o00 = pt(R0, a0, 0), o10 = pt(R0, a1, 0), o01 = pt(R0, a0, L), o11 = pt(R0, a1, L);
    tri(o00, o10, o11); tri(o00, o11, o01);
    if (rIn > 0.5) {
      const i00 = pt(rIn, a0, 0), i10 = pt(rIn, a1, 0), i01 = pt(rIn, a0, L), i11 = pt(rIn, a1, L);
      tri(i00, i11, i10); tri(i00, i01, i11);
      tri(o01, o11, i11); tri(o01, i11, i01);   // top ring
      tri(o00, i10, o10); tri(o00, i00, i10);   // bottom ring
    } else {
      tri([0, 0, L], o01, o11); tri([0, 0, 0], o10, o00);
    }
  }
  // unrolled design: n × m tiles
  const W = Math.max(8, Math.round(g.C * ppm)), H = Math.max(8, Math.round(L * ppm)), strip = canvas(W, H), sc = strip.getContext('2d', { willReadFrequently: true });
  placeTiles(sc, mk.M, g, ppm, P);
  // the last rows of a wallpaper pattern are cut off at the end margins
  sc.clearRect(0, 0, W, g.clip * ppm); sc.clearRect(0, (L - g.clip) * ppm, W, g.clip * ppm + 2);
  const d = sc.getImageData(0, 0, W, H).data, A = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) A[i] = d[i * 4 + 3] / 255;
  const K = s.rollerSlope ? Math.max(1, Math.ceil(h / 0.4)) : 1, SW = Math.max(6, Math.round(2 * ppm)), minA = 0.01 * ppm * ppm, mir = s.mirror;
  let loopsN = 0;
  for (let st = 0; st < K; st++) {
    // the lower edge of every raised part steps back as it rises (45°), so the roller prints standing up without supports
    const dpx = Math.round(st * h / K * ppm), v = dpx ? new Float32Array(W * H) : A;
    if (dpx) for (let y = 0; y < H; y++) { const y2 = Math.min(H - 1, y + dpx); for (let x = 0; x < W; x++) v[y * W + x] = Math.min(A[y * W + x], A[y2 * W + x]); }
    const z0 = st === 0 ? -0.3 : st * h / K - 0.02, z1 = (st + 1) * h / K;
    for (let x0 = 0; x0 < W; x0 += SW) {
      // each 2 mm slice is traced on its own (overlapping its neighbours by a pixel), so the flat faces follow the curve
      const x1 = Math.min(W, x0 + SW), cw = x1 - x0 + 2 + 2, ch = H + 2, sub = new Float32Array(cw * ch);
      let any = false;
      for (let c = 1; c < cw - 1; c++) { const gx = ((x0 - 2 + c) % W + W) % W; for (let y = 0; y < H; y++) { const val = v[y * W + gx]; sub[(y + 1) * cw + c] = val; if (val > 0.5) any = true; } }
      if (!any) continue;
      const loops = Geo.contours(sub, cw, ch).map(l => Geo.simplifyClosed(l, 0.22)).filter(l => l.length >= 3 && Math.abs(Geo.area(l)) > minA)
        .map(l => l.map(([x, y]) => { const xm = (x + x0 - 2 + 0.5) / ppm; return [mir ? g.C - xm : xm, L - (y - 1 + 0.5) / ppm]; }));
      if (!loops.length) continue; loopsN += loops.length;
      const flat = []; Geo.prism(Geo.groupLoops(loops), z0, z1, flat);
      for (let k = 0; k < flat.length; k += 3) { const a = flat[k] / R0, r = R0 + flat[k + 2]; out.push(r * Math.cos(a), r * Math.sin(a), flat[k + 1]); }
    }
  }
  const OD = g.D + 2 * h;
  return { tris: new Float32Array(out), size: [OD, OD, L], loops: loopsN, notes: [], heights: [0, 0, h], face: [g.C, L], roller: g, neck: 0, flareH: 0 };
}
// Tiles go on whole pixels, so where two tiles meet there is no half-covered seam (it used to show as a thin line,
// and in an inverted pattern it could even leave a hairline groove).
function placeTiles(ctx, img, g, ppm, P) {
  for (let i = 0; i < g.n; i++) for (let j = 0; j < g.m; j++) ctx.drawImage(img, Math.round(i * g.tileW * ppm) - P, Math.round((g.end + j * g.tileH) * ppm) - P);
}
function drawRollerImpression(mk, s, thin) {
  const g = rollerGeo(s), c = $('#imp'), PAD = 16, W = 640, H = Math.round(Math.min(W, Math.max(W * 0.22, (W - 2 * PAD) * g.L / g.C + 2 * PAD)));
  if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
  const ctx = c.getContext('2d'); ctx.clearRect(0, 0, W, H);
  const k = Math.min((W - 2 * PAD) / g.C, (H - 2 * PAD) / g.L), ox = (W - g.C * k) / 2, oy = (H - g.L * k) / 2, tint = inkCanvas(mk, s, '#c2362b', thin);
  ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.setLineDash([4, 4]); ctx.strokeRect(ox, oy, g.C * k, g.L * k); ctx.setLineDash([]);
  ctx.save(); ctx.beginPath(); ctx.rect(ox, oy + g.clip * k, g.C * k, (g.L - 2 * g.clip) * k); ctx.clip();
  // build the whole unrolled surface first, then draw it once (drawing tiles one by one with transparency showed the seams)
  const strip = canvas(Math.round(g.C * mk.ppm), Math.round(g.L * mk.ppm)); placeTiles(strip.getContext('2d'), tint, g, mk.ppm, mk.P);
  ctx.globalAlpha = 0.92; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(strip, ox, oy, g.C * k, g.L * k);
  ctx.globalAlpha = 1; ctx.restore();
}

/* ---------- 切模（饼干 / 黏土） ----------
   The design is drawn like a stamp face; its outline is grown by 外扩 and smoothed (inner corners rounded, holes filled),
   and that outline is the cut shape. Printed rim-down: a rim (边沿) on the bed, then a wall that thins from 根部厚 to
   刀口厚 towards the cutting edge. With 内部压纹 the inside gets a back plate and the design stands on it as ridges that
   stop 压纹离刀口 short of the edge, so one press cuts and imprints. Everything steps inward going up: no overhangs. */
function cutterTile(s) { return { ...s, shape: 'rect', w: +s.cutterW, h: +s.cutterH, border: 0, corner: 0, margin: 0, pad: 0, handle: 'none', layout: 'grid' }; }
function cutterField(s, mk) {
  const ppm = mk.ppm, tf = +s.wallT + +s.flangeW, MG = +s.cutterOffset + 1.5 + tf + 2 + (s.cutterShape === 'follow' ? 0 : Math.max(mk.fw, mk.fh) / 2);
  const W = Math.round((mk.fw + 2 * MG) * ppm) + 2, H = Math.round((mk.fh + 2 * MG) * ppm) + 2, n = W * H;
  const c = canvas(W, H), cx = c.getContext('2d', { willReadFrequently: true }), ox = Math.round(MG * ppm) - mk.P;
  cx.drawImage(mk.M, ox, ox);
  const d = cx.getImageData(0, 0, W, H).data, ink = new Uint8Array(n), design = new Float32Array(n);
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let i = 0; i < n; i++) { design[i] = d[i * 4 + 3] / 255; if (design[i] >= 0.5) { ink[i] = 1; const x = i % W, y = (i - x) / W; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
  const region = new Float32Array(n), o = +s.cutterOffset * ppm;
  if (x1 < 0) return null;
  if (s.cutterShape === 'follow') {
    // grow by 外扩 + r, shrink back by r: letters merge into one shape and inside corners get an r radius
    const r = 2 * ppm, dOut = edt(ink, W, H), grown = new Uint8Array(n);
    for (let i = 0; i < n; i++) grown[i] = Math.sqrt(dOut[i]) <= o + r ? 1 : 0;
    // fill holes: whatever the outside can't reach is inside
    const seen = new Uint8Array(n), st = [];
    for (let x = 0; x < W; x++) { st.push(x, (H - 1) * W + x); } for (let y = 0; y < H; y++) { st.push(y * W, y * W + W - 1); }
    while (st.length) { const i = st.pop(); if (seen[i] || grown[i]) continue; seen[i] = 1; const x = i % W; if (x > 0) st.push(i - 1); if (x < W - 1) st.push(i + 1); if (i >= W) st.push(i - W); if (i < n - W) st.push(i + W); }
    const outside = new Uint8Array(n); for (let i = 0; i < n; i++) outside[i] = seen[i] && !grown[i] ? 1 : 0;
    const dIn = edt(outside, W, H);
    for (let i = 0; i < n; i++) region[i] = Math.min(1, Math.max(0, 0.5 + Math.sqrt(dIn[i]) - r));
  } else {
    const cxm = (x0 + x1 + 1) / 2, cym = (y0 + y1 + 1) / 2, bw = x1 - x0 + 1 + 2 * o, bh = y1 - y0 + 1 + 2 * o;
    const g = canvas(W, H), gx = g.getContext('2d', { willReadFrequently: true }); gx.fillStyle = '#000'; gx.beginPath();
    if (s.cutterShape === 'circle') gx.arc(cxm, cym, Math.max(bw, bh) / 2, 0, Math.PI * 2);
    else { const side = Math.max(bw, bh), rr = Math.min(side / 2, 3 * ppm); gx.roundRect ? gx.roundRect(cxm - side / 2, cym - side / 2, side, side, rr) : gx.rect(cxm - side / 2, cym - side / 2, side, side); }
    gx.fill(); const gd = gx.getImageData(0, 0, W, H).data; for (let i = 0; i < n; i++) region[i] = gd[i * 4 + 3] / 255;
  }
  const inside = new Uint8Array(n); for (let i = 0; i < n; i++) inside[i] = region[i] >= 0.5 ? 1 : 0;
  const dReg = edt(inside, W, H), dist = new Float32Array(n); for (let i = 0; i < n; i++) dist[i] = Math.sqrt(dReg[i]);
  return { W, H, n, ppm, design, region, dist, Wmm: W / ppm, Hmm: H / ppm };
}
// band of thickness t (mm) just outside the cut line; full = true also fills the inside (a back plate)
function cutterBand(F, t, full) {
  const v = new Float32Array(F.n), tp = t * F.ppm;
  for (let i = 0; i < F.n; i++) { const out = Math.min(1, Math.max(0, 0.5 + tp - F.dist[i])); v[i] = full ? Math.max(out, F.region[i]) : Math.min(out, 1 - F.region[i]); }
  return v;
}
function fieldPrism(F, v, z0, z1, out, mir) {
  const W = F.W, H = F.H, minA = 0.01 * F.ppm * F.ppm;
  const loops = Geo.contours(v, W, H).map(l => Geo.simplifyClosed(l, 0.22)).filter(l => l.length >= 3 && Math.abs(Geo.area(l)) > minA)
    .map(l => l.map(([x, y]) => [mir * ((x + 0.5) / F.ppm - F.Wmm / 2), F.Hmm / 2 - (y + 0.5) / F.ppm]));
  if (loops.length) Geo.prism(Geo.groupLoops(loops), z0, z1, out);
  return loops.length;
}
// The wall as one smooth piece: the inside face stands straight on the cut line, the outside face leans in from
// 根部厚 at the rim to 刀口厚 at the edge (a straight taper, not steps).
function cutterWall(F, z0, z1, tb, tt, out, mir) {
  const minA = 1 * F.ppm * F.ppm;
  const loops = Geo.contours(F.region, F.W, F.H).map(l => Geo.simplifyClosed(l, 0.3)).filter(l => l.length >= 3 && Math.abs(Geo.area(l)) > minA)
    .map(l => l.map(([x, y]) => [mir * ((x + 0.5) / F.ppm - F.Wmm / 2), F.Hmm / 2 - (y + 0.5) / F.ppm]));
  let n = 0;
  for (let P of loops) {
    if (Geo.area(P) < 0) P = P.slice().reverse();             // counter-clockwise: the outside is to the right of each edge
    const m = P.length, N = P.map((p, i) => {
      const a = P[(i + m - 1) % m], b = P[(i + 1) % m];
      let e1x = p[0] - a[0], e1y = p[1] - a[1], e2x = b[0] - p[0], e2y = b[1] - p[1];
      const l1 = Math.hypot(e1x, e1y) || 1, l2 = Math.hypot(e2x, e2y) || 1;
      const n1 = [e1y / l1, -e1x / l1], n2 = [e2y / l2, -e2x / l2]; let nx = n1[0] + n2[0], ny = n1[1] + n2[1];
      const ln = Math.hypot(nx, ny) || 1; nx /= ln; ny /= ln;
      const k = Math.min(2, 1 / Math.max(0.5, nx * n1[0] + ny * n1[1]));   // miter, capped at sharp corners
      return [nx * k, ny * k];
    });
    const ring = (t, z) => P.map((p, i) => [p[0] + N[i][0] * t, p[1] + N[i][1] * t, z]);
    const I0 = ring(0, z0), I1 = ring(0, z1), O0 = ring(tb, z0), O1 = ring(tt, z1);
    const tri = (a, b, c) => out.push(...a, ...b, ...c);
    for (let i = 0; i < m; i++) {
      const j = (i + 1) % m;
      tri(O0[i], O0[j], O1[j]); tri(O0[i], O1[j], O1[i]);     // outside, leaning in
      tri(I0[i], I1[j], I0[j]); tri(I0[i], I1[i], I1[j]);     // inside, straight up
      tri(I1[i], O1[j], I1[j]); tri(I1[i], O1[i], O1[j]);     // the cutting edge
      tri(I0[i], I0[j], O0[j]); tri(I0[i], O0[j], O0[i]);     // bottom, inside the rim
    }
    n++;
  }
  return n;
}
function buildCutter(s, mk) {
  const F = cutterField(s, mk), out = [];
  if (!F) return { tris: new Float32Array(0), size: [0, 0, 0], loops: 0, notes: [], heights: [0, 0, 0], face: [0, 0], cutter: { empty: true }, neck: 0, flareH: 0 };
  const mir = s.mirror ? -1 : 1, Hc = +s.cutterHeight, ft = Math.min(+s.flangeT, Hc - 1), t1 = +s.bladeT, t2 = Math.max(t1, +s.wallT), imp = !!s.cutterImprint;
  let loops = fieldPrism(F, cutterBand(F, t2 + +s.flangeW, imp), 0, ft, out, mir);
  loops += cutterWall(F, ft - 0.02, Hc, t2, t1, out, mir);
  if (imp) {
    const v = new Float32Array(F.n); for (let i = 0; i < F.n; i++) v[i] = Math.min(F.design[i], F.region[i]);
    loops += fieldPrism(F, v, ft - 0.02, Math.max(ft + 0.4, Hc - +s.imprintGap), out, mir);
  }
  // sizes: the cut shape, and the whole cutter with its rim
  let a = Infinity, b = -Infinity, c = Infinity, d = -Infinity, A2 = Infinity, B2 = -Infinity, C2 = Infinity, D2 = -Infinity; const tf = (t2 + +s.flangeW) * F.ppm;
  for (let y = 0; y < F.H; y++) for (let x = 0; x < F.W; x++) { const i = y * F.W + x;
    if (F.region[i] >= 0.5) { if (x < a) a = x; if (x > b) b = x; if (y < c) c = y; if (y > d) d = y; }
    if (F.dist[i] <= tf) { if (x < A2) A2 = x; if (x > B2) B2 = x; if (y < C2) C2 = y; if (y > D2) D2 = y; } }
  const cut = [(b - a + 1) / F.ppm, (d - c + 1) / F.ppm], whole = [(B2 - A2 + 1) / F.ppm, (D2 - C2 + 1) / F.ppm];
  return { tris: new Float32Array(out), size: [whole[0], whole[1], Hc], loops, notes: [], heights: [0, 0, Hc], face: cut, cutter: { cut, whole, H: Hc, imp, F }, neck: 0, flareH: 0 };
}
// Preview: the cut shape as the cookie / clay piece, with the imprint if there is one (as it comes out, not mirrored)
function drawCutterImpression(mesh, s, thin, mk) {
  const c = $('#imp'), PAD = 16, W = 640, cu = mesh.cutter;
  if (!cu || cu.empty) { c.width = W; c.height = 160; c.getContext('2d').clearRect(0, 0, W, 160); return; }
  const F = cu.F; let x0 = F.W, y0 = F.H, x1 = 0, y1 = 0;
  for (let y = 0; y < F.H; y++) for (let x = 0; x < F.W; x++) if (F.region[y * F.W + x] >= 0.5) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const m = 8; x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(F.W - 1, x1 + m); y1 = Math.min(F.H - 1, y1 + m);
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1, H = Math.round(Math.min(W, Math.max(W * 0.3, (W - 2 * PAD) * ch / cw + 2 * PAD)));
  if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
  const ctx = c.getContext('2d'); ctx.clearRect(0, 0, W, H);
  const img = canvas(F.W, F.H), ic = img.getContext('2d'), id = ic.createImageData(F.W, F.H);
  for (let i = 0; i < F.n; i++) {
    // a baked-cookie colour inside the cut line, the pressed design clearly darker, and the cut line itself in red
    const r = F.region[i], dz = cu.imp ? Math.min(F.design[i], r) : 0;
    const line = r < 0.5 ? Math.max(0, Math.min(1, 4 - F.dist[i] * 0.8)) : 0;
    const C0 = [214, 158, 88], C1 = [128, 78, 34], RED = [194, 54, 43];
    const col = r >= 0.5 || line === 0 ? C0.map((c, q) => c + (C1[q] - c) * dz) : RED;
    id.data[i * 4] = col[0]; id.data[i * 4 + 1] = col[1]; id.data[i * 4 + 2] = col[2];
    id.data[i * 4 + 3] = Math.round(255 * Math.max(r, line));
  }
  ic.putImageData(id, 0, 0);
  const k = Math.min((W - 2 * PAD) / cw, (H - 2 * PAD) / ch);
  ctx.save(); ctx.translate(W / 2, H / 2); if (!s.mirror) ctx.scale(-1, 1); ctx.drawImage(img, x0, y0, cw, ch, -cw * k / 2, -ch * k / 2, cw * k, ch * k); ctx.restore();
}
function cutterSpec(s0, mesh, mk) {
  const s = eff(s0), cu = mesh.cutter, f = fontInfo(s.font);
  const fontName = fontLabel(f);
  return { cutter: true, s, text: stampText(s), cut: cu.cut, whole: cu.whole, Hc: cu.H, imp: cu.imp, fontName, grams: meshVolume(mesh.tris) / 1000 * PLA_DENSITY };
}
function cutterLines(p) {
  const E = LANG === 'en', L = [];
  L.push(`${bi('图案', 'Design', '図柄', '디자인')}: ${p.text}`);
  L.push(`${bi('切出来的大小', 'Cut size', '抜いた大きさ', '잘린 크기')}: ${mm(p.cut[0])} × ${mm(p.cut[1])} mm (${inch(p.cut[0])} × ${inch(p.cut[1])} in)`);
  L.push(`${bi('切模外形', 'Cutter footprint', '抜き型の外形', '커터 외형')}: ${mm(p.whole[0])} × ${mm(p.whole[1])} mm (${inch(p.whole[0])} × ${inch(p.whole[1])} in)`);
  L.push(`${bi('高度', 'Height', '高さ', '높이')}: ${mm(p.Hc)} mm (${inch(p.Hc)} in)`);
  L.push(`${bi('刀口 / 根部', 'Blade / wall base', '刃先 / 根元', '칼날 / 밑동')}: ${mm(+p.s.bladeT)} / ${mm(+p.s.wallT)} mm`);
  L.push(`${bi('内部压纹', 'Imprint', '型押し', '압인')}: ${p.imp ? tl(`有，比刀口低 ${mm(+p.s.imprintGap)} mm`, `yes, ${mm(+p.s.imprintGap)} mm above the blade edge`, `あり、刃先より ${mm(+p.s.imprintGap)} mm 低い`, `있음, 칼날보다 ${mm(+p.s.imprintGap)} mm 낮음`) : bi('无', 'none', 'なし', '없음')}`);
  L.push(`${bi('重量', 'Weight', '重さ', '무게')}: ${tl(`约 ${Math.round(p.grams)} g`, `approx. ${Math.round(p.grams)} g`, `約 ${Math.round(p.grams)} g`, `약 ${Math.round(p.grams)} g`)} ≈ ${(p.grams / 28.35).toFixed(2)} oz`);
  L.push(`${bi('材料', 'Material', '素材', '재료')}: ${tl('PLA 3D 打印 / 3D printed PLA', '3D printed PLA', 'PLA 3D プリント / 3D printed PLA', 'PLA 3D 프린팅 / 3D printed PLA')}`);
  return L;
}
async function cutterCard(p) {
  const N = 1600, c = canvas(N, 1200), x = c.getContext('2d'), INK = '#1f1d1a', MUTED = '#6d6a62';
  const SANS = '"Noto Sans SC","Noto Sans JP","Noto Sans KR","PingFang SC","Microsoft YaHei",sans-serif';
  x.fillStyle = '#fff'; x.fillRect(0, 0, N, 1200); x.fillStyle = INK; x.font = `700 50px ${SANS}`; x.fillText(tl('切模规格  Cutter specs', 'Cutter specs', '抜き型の仕様  Cutter specs', '커터 사양  Cutter specs'), 80, 120);
  x.font = `400 32px ${SANS}`; x.fillStyle = MUTED; x.fillText(p.text.slice(0, 60), 80, 172);
  const imp = $('#imp'), k = Math.min((N - 160) / imp.width, 620 / imp.height); x.drawImage(imp, 80, 220, imp.width * k, imp.height * k);
  const rows = [[bi('切出来的大小', 'Cut size', '抜いた大きさ', '잘린 크기'), `${mm(p.cut[0])} × ${mm(p.cut[1])} mm   ${inch(p.cut[0])} × ${inch(p.cut[1])} in`], [bi('切模外形', 'Footprint', '外形', '외형'), `${mm(p.whole[0])} × ${mm(p.whole[1])} mm`],
    [bi('高度', 'Height', '高さ', '높이'), `${mm(p.Hc)} mm   ${inch(p.Hc)} in`], [bi('重量', 'Weight', '重さ', '무게'), tl(`约 ${Math.round(p.grams)} g`, `approx. ${Math.round(p.grams)} g`, `約 ${Math.round(p.grams)} g`, `약 ${Math.round(p.grams)} g`)]];
  const y0 = 240 + imp.height * k + 60;
  rows.forEach(([a, b], i) => { const y = y0 + i * 62; x.strokeStyle = '#e4e0d6'; x.lineWidth = 2; x.beginPath(); x.moveTo(80, y - 42); x.lineTo(N - 80, y - 42); x.stroke();
    x.fillStyle = MUTED; x.font = `400 26px ${SANS}`; x.fillText(a, 80, y); x.fillStyle = INK; x.font = `700 28px ${SANS}`; x.fillText(b, 440, y); });
  return new Promise(r => c.toBlob(r, 'image/png'));
}

/* ---------- export ---------- */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
async function deflate(u8) {
  if (typeof CompressionStream === 'undefined') return null;
  try { const st = new Blob([u8]).stream().pipeThrough(new CompressionStream('deflate-raw')); return new Uint8Array(await new Response(st).arrayBuffer()); } catch (e) { return null; }
}
async function makeZip(files) {
  const enc = new TextEncoder(), parts = [], central = []; let off = 0;
  for (const f of files) {
    const name = enc.encode(f.name), crc = crc32(f.data), comp = await deflate(f.data);
    const useC = comp && comp.length < f.data.length, body = useC ? comp : f.data, method = useC ? 8 : 0;
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, method, true);
    lh.setUint16(10, 0, true); lh.setUint16(12, 0x21, true); lh.setUint32(14, crc, true); lh.setUint32(18, body.length, true);
    lh.setUint32(22, f.data.length, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
    parts.push(new Uint8Array(lh.buffer), name, body);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, method, true);
    ch.setUint16(12, 0, true); ch.setUint16(14, 0x21, true); ch.setUint32(16, crc, true); ch.setUint32(20, body.length, true); ch.setUint32(24, f.data.length, true);
    ch.setUint16(28, name.length, true); ch.setUint32(42, off, true);
    central.push(new Uint8Array(ch.buffer), name);
    off += 30 + name.length + body.length;
  }
  const cdSize = central.reduce((a, b) => a + b.length, 0), end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, cdSize, true); end.setUint32(16, off, true);
  return new Blob([...parts, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
}
const dlCap = (window.claude && typeof window.claude.use === 'function') ? window.claude.use('downloads').catch(() => null) : Promise.resolve(null);
async function saveFile(filename, blob) {
  const dl = await Promise.race([dlCap, new Promise(r => setTimeout(() => r(null), 3000))]);
  if (dl) {
    try { await dl.save({ filename, data: blob }); status(tl(`已保存 ${filename}。`, `Saved ${filename}.`, `${filename} を保存しました。`, `${filename} 파일을 저장했습니다.`)); }
    catch (e) { status(e && e.code === 'declined' ? tl('已取消下载。', 'Download cancelled.', 'ダウンロードをキャンセルしました。', '다운로드를 취소했습니다.') : tl('下载没成功：', 'Download failed: ', 'ダウンロードできませんでした：', '다운로드 실패: ') + ((e && e.message) || tl('未知原因', 'unknown reason', '原因不明', '알 수 없는 이유')), e && e.code !== 'declined'); }
    return;
  }
  const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 8000);
  status(tl(`已生成 ${filename}。`, `Created ${filename}.`, `${filename} を作成しました。`, `${filename} 파일을 만들었습니다.`));
}
const safeName = t => (t || tl('印章', 'stamp', 'スタンプ', '스탬프')).replace(/[\\/:*?"<>|｜\s]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || tl('印章', 'stamp', 'スタンプ', '스탬프');
function nameFor(s) { if (imgSrc && s.imgMode === 'only') return safeName(imgName.replace(/\.[a-z0-9]+$/i, '') || tl('图案', 'picture', '画像', '이미지')); const e = eff(s); return safeName(e.layout === 'ring' ? (s.ringText || s.bottomText) : s.text); }
/* ---------- 规格（Etsy 上架用） ---------- */
const MM2IN = 1 / 25.4, PLA_DENSITY = 1.24; // g/cm³
const SHAPE_NAME = { square: ['方形', 'Square', '正方形', '정사각형'], rect: ['长方形', 'Rectangle', '長方形', '직사각형'], circle: ['圆形', 'Round', '円形', '원형'] };
const TRANS_NAME = { straight: ['直筒', 'straight', 'ストレート', '일자형'], arc: ['细柄·弧形', 'slim, curved flare', '細身・曲線', '가는 곡선형'], line: ['细柄·斜面', 'slim, angled flare', '細身・斜面', '가는 경사형'], step: ['细柄·直角', 'slim, stepped', '細身・段差', '가는 계단형'] };
function meshVolume(t) { let v = 0; for (let k = 0; k < t.length; k += 9) v += (t[k] * (t[k + 4] * t[k + 8] - t[k + 5] * t[k + 7]) - t[k + 1] * (t[k + 3] * t[k + 8] - t[k + 5] * t[k + 6]) + t[k + 2] * (t[k + 3] * t[k + 7] - t[k + 4] * t[k + 6])) / 6; return Math.abs(v); }
function stampText(s) { const pic = imgSrc && s.imgMode !== 'none'; if (pic && s.imgMode === 'only') return tl('图案', 'Picture', '画像', '이미지'); return (pic ? tl('图案 + ', 'Picture + ', '画像 + ', '이미지 + ') : '') + stampText0(s); }
function stampText0(s) { const e = eff(s); return e.layout === 'ring' ? [s.ringText, s.center === 'text' ? s.centerText : '', s.bottomText].filter(Boolean).join(' / ') : (isLatin(s.text) ? s.text.replace(/\s*[\/|｜]\s*/g, ' ') : (s.text || '').replace(/[\/|｜]/g, '')); }
function specOf(s0, mesh, mk) {
  if (mesh.roller) return rollerSpec(s0, mesh, mk);
  if (mesh.cutter) return cutterSpec(s0, mesh, mk);
  const s = eff(s0), [fw, fh] = mesh.face, [W, H, Z] = mesh.size, [hh, hb, hr] = mesh.heights, f = fontInfo(s.font);
  const fontName = fontLabel(f) + (f.weights && s.weight >= 700 ? ' ' + weightName(s.weight >= 900 ? 900 : 700) : '');
  return { s, text: stampText(s), shape: SHAPE_NAME[s.shape], round: s.shape === 'circle', fw, fh, W, H, Z, hh, hb, hr,
    textBox: mk.textBox, withImg: !!(imgSrc && s.imgMode === 'with'), glyphs: mk.glyphs, yin: s.mode === 'yin', handle: s.handle === 'grip' ? TRANS_NAME[s.trans] || TRANS_NAME.straight : null,
    fontName, neck: s.handle === 'grip' ? mesh.neck : 0, grams: meshVolume(mesh.tris) / 1000 * PLA_DENSITY, mirror: s.mirror };
}
const mm = x => x.toFixed(2), inch = x => (x * MM2IN).toFixed(2);
const dim2 = (a, b, round) => round ? `Ø ${mm(a)} mm (Ø ${inch(a)} in)` : `${mm(a)} × ${mm(b)} mm (${inch(a)} × ${inch(b)} in)`;
// Spec text: bilingual (local + English, the English half is for Etsy), English only in the English interface.
const bi = (zh, en, ja, ko) => LANG === 'en' ? en : `${tl(zh, en, ja, ko)} ${en}`;
function specLines(p) {
  if (p.roller) return rollerLines(p);
  if (p.cutter) return cutterLines(p);
  const L = [], E = LANG === 'en';
  L.push(`${bi('印章文字', 'Text', '文字', '글자')}: ${p.text}`);
  L.push(`${bi('印面形状', 'Shape', '印面の形', '인면 모양')}: ${E ? p.shape[1] : p.shape[{ zh: 0, ja: 2, ko: 3 }[LANG]] + ' ' + p.shape[1]}${tl('，', ', ', '、', ', ')}${p.yin ? bi('阴文（字凹下）', 'Engraved', '陰刻（文字が凹む）', '음각(글자가 파임)') : bi('阳文（字凸起）', 'Raised', '陽刻（文字が凸）', '양각(글자가 볼록)')}`);
  L.push(`${bi('印面大小（盖出来）', 'Stamp face', '印面の大きさ（押した跡）', '인면 크기(찍힌 모양)')}: ${dim2(p.fw, p.fh, p.round)}`);
  if (p.textBox) L.push(`${p.withImg ? bi('图文区域', 'Design area', '図柄エリア', '디자인 영역') : bi('文字区域', 'Text area', '文字エリア', '글자 영역')}: ${mm(p.textBox.w)} × ${mm(p.textBox.h)} mm (${inch(p.textBox.w)} × ${inch(p.textBox.h)} in)`);
  L.push(`${bi('外形最大', 'Overall footprint', '外形の最大', '최대 외형')}: ${p.round && Math.abs(p.W - p.H) < 0.05 ? dim2(p.W, p.H, true) : dim2(p.W, p.H, false)}`);
  L.push(`${bi('总高', 'Total height', '全高', '전체 높이')}: ${mm(p.Z)} mm (${inch(p.Z)} in)`);
  L.push(`  ${p.hh > 0 ? `${bi('手柄', 'handle', '持ち手', '손잡이')} ${mm(p.hh)}${p.neck > 0 ? tl(`（含直段 incl. straight collar ${mm(p.neck)}）`, ` (incl. straight collar ${mm(p.neck)})`, `（ストレート部 ${mm(p.neck)} を含む incl. straight collar）`, `(직선부 ${mm(p.neck)} 포함 incl. straight collar)`) : ''} + ` : ''}${p.hb > 0 ? `${bi('底板', 'base', '台座', '받침판')} ${mm(p.hb)} + ` : ''}${bi('字凸起', 'relief', '凸', '돌출')} ${mm(p.hr)} mm`);
  const gv = grooveLabel(p.s);
  if (+p.s.topInset > 0) { const sl = slicerOf(p.s), k = Math.max(1, Math.floor(Math.min(0.4, p.hr * 0.4) / (2 * sl.lh) + 1e-6)); L.push(`${bi('字顶收窄', 'Top inset', '先端を細く', '윗면 좁히기')}: ${mm(+p.s.topInset)} mm${tl(`（最上面 ${2 * k} 层，层高 ${sl.lh}）`, ` (top ${2 * k} layers at ${sl.lh} mm)`, `（上の ${2 * k} 層、層高 ${sl.lh}）`, `(위쪽 ${2 * k}층, 층 높이 ${sl.lh})`)}`); }
  L.push(`${bi('手柄', 'Handle', '持ち手', '손잡이')}: ${p.handle ? `${E ? p.handle[1] : p.handle[{ zh: 0, ja: 2, ko: 3 }[LANG]] + ' ' + p.handle[1]}${gv && p.s.grooveD > 0 ? tl(`，${gv}凹槽 ${mm(+p.s.grooveD)} mm（finger grips）`, `, finger grips on ${gv}, ${mm(+p.s.grooveD)} mm deep`, `、${gv}に指の溝 ${mm(+p.s.grooveD)} mm（finger grips）`, `, ${gv} 손가락 홈 ${mm(+p.s.grooveD)} mm(finger grips)`) : ''}` : bi('无', 'none', 'なし', '없음')}`);
  L.push(`${bi('字体', 'Font', 'フォント', '글꼴')}: ${p.fontName}`);
  L.push(`${bi('重量', 'Weight', '重さ', '무게')}: ${tl(`约 ${Math.round(p.grams)} g（实心，100% 填充 / solid）`, `approx. ${Math.round(p.grams)} g (solid, 100% infill)`, `約 ${Math.round(p.grams)} g（充填率 100% / solid）`, `약 ${Math.round(p.grams)} g(채움 100% / solid)`)} ≈ ${(p.grams / 28.35).toFixed(2)} oz`);
  L.push(`${bi('材料', 'Material', '素材', '재료')}: ${tl('PLA 3D 打印 / 3D printed PLA', '3D printed PLA', 'PLA 3D プリント / 3D printed PLA', 'PLA 3D 프린팅 / 3D printed PLA')}`);
  L.push(`${bi('切片', 'Slicer', 'スライサー', '슬라이서')}: Bambu Studio ${tl(`「${slicerOf(p.s).name}」`, `“${slicerOf(p.s).name}”`, `「${slicerOf(p.s).name}」`, `“${slicerOf(p.s).name}”`)}`);
  return L;
}
function rollerSpec(s0, mesh, mk) {
  const s = eff(s0), g = mesh.roller, f = fontInfo(s.font);
  const fontName = fontLabel(f) + (f.weights && s.weight >= 700 ? ' ' + weightName(s.weight >= 900 ? 900 : 700) : '');
  return { roller: true, s, text: stampText(s), OD: mesh.size[0], L: g.L, C: g.C, D: g.D, hole: g.hole, n: g.n, m: g.m, tileW: g.tileW, tileH: g.tileH, hr: +s.reliefH,
    textBox: mk.textBox, withImg: !!(imgSrc && s.imgMode === 'with'), glyphs: mk.glyphs, fontName, grams: meshVolume(mesh.tris) / 1000 * PLA_DENSITY, etsy: true };
}
function rollerLines(p) {
  const E = LANG === 'en', L = [];
  L.push(`${bi('图案', 'Design', '図柄', '디자인')}: ${p.text}`);
  L.push(`${bi('滚轮', 'Roller', 'ローラー', '롤러')}: Ø ${mm(p.OD)} × ${mm(p.L)} mm (Ø ${inch(p.OD)} × ${inch(p.L)} in)`);
  L.push(`${bi('内孔', 'Hole', '穴', '구멍')}: Ø ${mm(p.hole)} mm (${inch(p.hole)} in)`);
  L.push(`${bi('滚一圈', 'One turn', '1 回転分', '한 바퀴')}: ${mm(p.C)} × ${mm(p.L)} mm (${inch(p.C)} × ${inch(p.L)} in)`);
  L.push(`${bi('花纹深', 'Pattern depth', '模様の深さ', '무늬 깊이')}: ${mm(p.hr)} mm`);
  L.push(`${bi('图案排列', 'Tiles', '模様の並び', '무늬 배열')}: ${p.n} × ${p.m}${tl(`（每个 ${mm(p.tileW)} × ${mm(p.tileH)} mm）`, ` (each ${mm(p.tileW)} × ${mm(p.tileH)} mm)`, `（1 個 ${mm(p.tileW)} × ${mm(p.tileH)} mm）`, `(각 ${mm(p.tileW)} × ${mm(p.tileH)} mm)`)}`);
  if (p.textBox) L.push(`${bi('单个图案', 'Each design', '模様 1 個', '무늬 1개')}: ${mm(p.textBox.w)} × ${mm(p.textBox.h)} mm (${inch(p.textBox.w)} × ${inch(p.textBox.h)} in)`);
  L.push(`${bi('字体', 'Font', 'フォント', '글꼴')}: ${p.fontName}`);
  L.push(`${bi('重量', 'Weight', '重さ', '무게')}: ${tl(`约 ${Math.round(p.grams)} g（实心 / solid）`, `approx. ${Math.round(p.grams)} g (solid)`, `約 ${Math.round(p.grams)} g（中実 / solid）`, `약 ${Math.round(p.grams)} g(꽉 채움 / solid)`)} ≈ ${(p.grams / 28.35).toFixed(2)} oz`);
  L.push(`${bi('材料', 'Material', '素材', '재료')}: ${tl('PLA 3D 打印 / 3D printed PLA', '3D printed PLA', 'PLA 3D プリント / 3D printed PLA', 'PLA 3D 프린팅 / 3D printed PLA')}`);
  return L;
}
async function rollerCard(p) {
  const N = 1600, c = canvas(N, 1200), x = c.getContext('2d'), INK = '#1f1d1a', MUTED = '#6d6a62';
  const SANS = '"Noto Sans SC","Noto Sans JP","Noto Sans KR","PingFang SC","Microsoft YaHei",sans-serif';
  x.fillStyle = '#fff'; x.fillRect(0, 0, N, 1200); x.fillStyle = INK; x.font = `700 50px ${SANS}`; x.fillText(tl('滚轮规格  Roller specs', 'Roller specs', 'ローラーの仕様  Roller specs', '롤러 사양  Roller specs'), 80, 120);
  x.font = `400 32px ${SANS}`; x.fillStyle = MUTED; x.fillText(p.text.slice(0, 60), 80, 172);
  x.font = `400 26px ${SANS}`; x.fillText(tl('滚一圈压出来的样子 One turn, as rolled', 'One full turn, as rolled', '1 回転で付く模様 One turn, as rolled', '한 바퀴 굴린 모양 One turn, as rolled'), 80, 250);
  const imp = $('#imp'), k = Math.min((N - 160) / imp.width, 560 / imp.height); x.drawImage(imp, 80, 280, imp.width * k, imp.height * k);
  const rows = [[bi('滚轮', 'Roller', 'ローラー', '롤러'), `Ø ${mm(p.OD)} × ${mm(p.L)} mm   Ø ${inch(p.OD)} × ${inch(p.L)} in`], [bi('滚一圈', 'One turn', '1 回転分', '한 바퀴'), `${mm(p.C)} mm   ${inch(p.C)} in`],
    [bi('花纹深', 'Pattern depth', '模様の深さ', '무늬 깊이'), `${mm(p.hr)} mm`], [bi('重量', 'Weight', '重さ', '무게'), tl(`约 ${Math.round(p.grams)} g`, `approx. ${Math.round(p.grams)} g (${(p.grams / 28.35).toFixed(2)} oz)`, `約 ${Math.round(p.grams)} g`, `약 ${Math.round(p.grams)} g`)]];
  const y0 = 300 + imp.height * k + 60;
  rows.forEach(([a, b], i) => { const y = y0 + i * 62; x.strokeStyle = '#e4e0d6'; x.lineWidth = 2; x.beginPath(); x.moveTo(80, y - 42); x.lineTo(N - 80, y - 42); x.stroke();
    x.fillStyle = MUTED; x.font = `400 26px ${SANS}`; x.fillText(a, 80, y); x.fillStyle = INK; x.font = `700 28px ${SANS}`; x.fillText(b, 440, y); });
  return new Promise(r => c.toBlob(r, 'image/png'));
}
function specTxt(p) {
  if (p.cutter) return [tl('切模规格 / Cutter specs', 'Cutter specs', '抜き型の仕様 / Cutter specs', '커터 사양 / Cutter specs'), '='.repeat(30), ...specLines(p), '',
    tl('—— Etsy 描述可直接复制 / Paste into Etsy listing ——', '—— Paste into your Etsy listing ——', '—— Etsy の商品説明にそのまま使えます / Paste into Etsy listing ——', '—— Etsy 상품 설명에 바로 붙여 넣기 / Paste into Etsy listing ——'),
    `Cuts a ${mm(p.cut[0])} × ${mm(p.cut[1])} mm (${inch(p.cut[0])} × ${inch(p.cut[1])} in) shape`, `Cutter height: ${mm(p.Hc)} mm (${inch(p.Hc)} in)`, p.imp ? 'Cuts and imprints the design in one press' : '', `Material: 3D printed PLA`, '',
    tl(`生成时间 ${new Date().toLocaleString('zh-CN')} · 印章打印器`, `Made ${new Date().toLocaleString('en-US')} · Stamp Maker`, `作成日時 ${new Date().toLocaleString('ja-JP')} · スタンプメーカー`, `생성 시각 ${new Date().toLocaleString('ko-KR')} · 스탬프 메이커`)].filter(x => x !== '').join('\n');
  if (p.roller) return [tl('滚轮规格 / Roller specs', 'Roller specs', 'ローラーの仕様 / Roller specs', '롤러 사양 / Roller specs'), '='.repeat(30), ...specLines(p), '',
    tl('—— Etsy 描述可直接复制 / Paste into Etsy listing ——', '—— Paste into your Etsy listing ——', '—— Etsy の商品説明にそのまま使えます / Paste into Etsy listing ——', '—— Etsy 상품 설명에 바로 붙여 넣기 / Paste into Etsy listing ——'),
    `Roller: ${mm(p.OD)} mm (${inch(p.OD)} in) diameter × ${mm(p.L)} mm (${inch(p.L)} in) long`, `Pattern repeats every ${mm(p.C)} mm (${inch(p.C)} in)`, `Pattern depth: ${mm(p.hr)} mm`, `Material: 3D printed PLA`, '',
    tl(`生成时间 ${new Date().toLocaleString('zh-CN')} · 印章打印器`, `Made ${new Date().toLocaleString('en-US')} · Stamp Maker`, `作成日時 ${new Date().toLocaleString('ja-JP')} · スタンプメーカー`, `생성 시각 ${new Date().toLocaleString('ko-KR')} · 스탬프 메이커`)].join('\n');
  const etsy = [
    `Stamp face: ${p.round ? `${mm(p.fw)} mm (${inch(p.fw)} in) diameter` : `${mm(p.fw)} × ${mm(p.fh)} mm (${inch(p.fw)} × ${inch(p.fh)} in)`}`,
    `Overall height: ${mm(p.Z)} mm (${inch(p.Z)} in)`,
    p.textBox ? `${p.withImg ? 'Design area' : 'Text area'}: ${mm(p.textBox.w)} × ${mm(p.textBox.h)} mm (${inch(p.textBox.w)} × ${inch(p.textBox.h)} in)` : '',
    `Weight: approx. ${Math.round(p.grams)} g (${(p.grams / 28.35).toFixed(2)} oz)`,
    `Material: 3D printed PLA`
  ].filter(Boolean);
  const glyphs = (p.glyphs || []).map(g => `${g.ch} ${mm(g.w)}×${mm(g.h)}`).join('  ');
  return [tl('印章规格 / Stamp specs', 'Stamp specs', 'スタンプの仕様 / Stamp specs', '스탬프 사양 / Stamp specs'), '='.repeat(30), ...specLines(p), '',
    tl('单字尺寸 宽×高 mm / Each character W×H mm', 'Each character W×H mm', '1 文字のサイズ 幅×高さ mm / Each character W×H mm', '글자별 크기 폭×높이 mm / Each character W×H mm'), glyphs, '',
    tl('—— Etsy 描述可直接复制 / Paste into Etsy listing ——', '—— Paste into your Etsy listing ——', '—— Etsy の商品説明にそのまま使えます / Paste into Etsy listing ——', '—— Etsy 상품 설명에 바로 붙여 넣기 / Paste into Etsy listing ——'), ...etsy, '',
    tl(`生成时间 ${new Date().toLocaleString('zh-CN')} · 印章打印器`, `Made ${new Date().toLocaleString('en-US')} · Stamp Maker`, `作成日時 ${new Date().toLocaleString('ja-JP')} · スタンプメーカー`, `생성 시각 ${new Date().toLocaleString('ko-KR')} · 스탬프 메이커`)].join('\n');
}

/* 规格卡：印面和侧面用同一个比例绘制，附 10 mm 比例尺 */
async function specCard(p, mesh, mk) {
  if (p.roller) return rollerCard(p);
  if (p.cutter) return cutterCard(p);
  const N = 1600, c = canvas(N, N), x = c.getContext('2d');
  const INK = '#1f1d1a', MUTED = '#6d6a62', LINE = '#b9b4a8', RED = '#c2362b', BODY = '#e3a49c', BODY_D = '#c2362b';
  const SANS = '"Noto Sans SC","Noto Sans JP","Noto Sans KR","PingFang SC","Microsoft YaHei",sans-serif';
  try { await Promise.race([Promise.all([document.fonts.load(`700 40px "Noto Sans SC"`, p.text + '印章规格'), document.fonts.load(`400 32px "Noto Sans KR"`, p.text), document.fonts.load(`400 32px "Noto Sans JP"`, p.text), document.fonts.load(`400 26px "Noto Sans SC"`, '印面大小总高文字区域')]), new Promise(r => setTimeout(r, 4000))]); } catch (e) {}
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, N, N);
  x.fillStyle = INK; x.textBaseline = 'alphabetic';
  x.font = `700 50px ${SANS}`; x.fillText(tl('印章规格  Stamp specs', 'Stamp specs', 'スタンプの仕様  Stamp specs', '스탬프 사양  Stamp specs'), 80, 120);
  x.font = `400 32px ${SANS}`; x.fillStyle = MUTED;
  let tt = p.text; while (x.measureText(tt).width > N - 160 && tt.length > 1) tt = tt.slice(0, -2) + '…';
  x.fillText(tt, 80, 172);
  // shared scale
  // Left: face view (80–640). Middle: side view (740–1180). Right: height labels (to ~1540).
  const faceW = 560, sideW = 440, areaH = 720, [fw, fh] = mesh.face;
  const sc = Math.min(faceW / Math.max(fw, mesh.size[0]), faceW / fh, sideW / mesh.size[0], areaH / mesh.size[2], 40);
  const top = 300, areaW = faceW, leftCx = 80 + faceW / 2, rightCx = 740 + sideW / 2;
  const dimH = (x0, x1, y, label, sub) => {
    x.strokeStyle = MUTED; x.lineWidth = 2; x.beginPath(); x.moveTo(x0, y); x.lineTo(x1, y);
    x.moveTo(x0, y - 12); x.lineTo(x0, y + 12); x.moveTo(x1, y - 12); x.lineTo(x1, y + 12); x.stroke();
    x.fillStyle = INK; x.textAlign = 'center'; x.font = `700 30px ${SANS}`; x.fillText(label, (x0 + x1) / 2, y + 46);
    if (sub) { x.fillStyle = MUTED; x.font = `400 24px ${SANS}`; x.fillText(sub, (x0 + x1) / 2, y + 78); }
    x.textAlign = 'left';
  };
  const dimV = (xx, y0, y1, label, sub, side = 1, color = MUTED) => {
    x.strokeStyle = color; x.lineWidth = 2; x.beginPath(); x.moveTo(xx, y0); x.lineTo(xx, y1);
    x.moveTo(xx - 10, y0); x.lineTo(xx + 10, y0); x.moveTo(xx - 10, y1); x.lineTo(xx + 10, y1); x.stroke();
    x.textAlign = side > 0 ? 'left' : 'right'; const tx = xx + side * 18, my = (y0 + y1) / 2;
    x.fillStyle = INK; let fs = 28; x.font = `700 ${fs}px ${SANS}`;
    while (side > 0 && fs > 16 && tx + x.measureText(label).width > N - 16) { fs -= 2; x.font = `700 ${fs}px ${SANS}`; } // keep a long label on the card
    x.fillText(label, tx, sub ? my - 2 : my + 10);
    if (sub) { x.fillStyle = MUTED; x.font = `400 22px ${SANS}`; x.fillText(sub, tx, my + 26); }
    x.textAlign = 'left';
  };
  // section labels
  x.fillStyle = MUTED; x.font = `400 26px ${SANS}`;
  x.fillText(tl('印面（盖出来的效果） Stamp face', 'Stamp face (as printed on paper)', '印面（押した跡） Stamp face', '인면(찍힌 모양) Stamp face'), 80, top - 40); x.fillText(tl('侧面 Side view', 'Side view', '側面 Side view', '측면 Side view'), 740, top - 40);
  // face view
  const pw = fw * sc, ph = fh * sc, fx = leftCx - pw / 2, fy = top + (areaW - ph) / 2;
  const tint = inkCanvas(mk, p.s, RED, null);
  const k = sc / mk.ppm; x.imageSmoothingQuality = 'high';
  x.drawImage(tint, fx - mk.P * k, fy - mk.P * k, mk.W * k, mk.H * k);
  if (p.round) dimH(fx, fx + pw, fy + ph + 40, `Ø ${mm(fw)} mm`, `Ø ${inch(fw)} in`);
  else { dimH(fx, fx + pw, fy + ph + 40, `${mm(fw)} mm`, `${inch(fw)} in`); dimV(fx - 34, fy, fy + ph, `${mm(fh)}`, `${inch(fh)} in`, -1); }
  // side view
  const prof = mesh.profile, base = top + areaH + 20, yOf = z => base - z * sc;
  const zTop = mesh.size[2];
  x.fillStyle = BODY; x.beginPath();
  prof.forEach((r, i) => { const X = rightCx + r.x1 * sc, Y = yOf(r.z); i ? x.lineTo(X, Y) : x.moveTo(X, Y); });
  for (let i = prof.length - 1; i >= 0; i--) x.lineTo(rightCx + prof[i].x0 * sc, yOf(prof[i].z));
  x.closePath(); x.fill();
  x.fillStyle = BODY_D; x.fillRect(rightCx - fw / 2 * sc, yOf(zTop), fw * sc, p.hr * sc);
  x.strokeStyle = 'rgba(31,29,26,.35)'; x.lineWidth = 1.5; x.stroke();
  const sx0 = rightCx + Math.max(...prof.map(r => r.x1)) * sc;
  dimV(sx0 + 190, yOf(zTop), yOf(0), tl(`总高 ${mm(zTop)} mm`, `Height ${mm(zTop)} mm`, `全高 ${mm(zTop)} mm`, `전체 높이 ${mm(zTop)} mm`), `${inch(zTop)} in`, 1, INK);
  let zz = 0; const parts = [];
  const RELIEF = tl('字凸起', 'Relief', '凸', '돌출'); if (p.hh > 0) { parts.push([tl('手柄', 'Handle', '持ち手', '손잡이'), p.hh - (p.neck || 0)]); if (p.neck > 0) parts.push([tl('直段', 'Collar', 'ストレート部', '직선부'), p.neck]); } if (p.hb > 0) parts.push([tl('底板', 'Base', '台座', '받침판'), p.hb]); parts.push([RELIEF, p.hr]);
  x.font = `400 22px ${SANS}`;
  parts.forEach(([n, h], i) => {
    const y0 = yOf(zz + h), y1 = yOf(zz); zz += h;
    x.strokeStyle = LINE; x.lineWidth = 2; x.beginPath(); x.moveTo(sx0 + 20, y0); x.lineTo(sx0 + 20, y1); x.moveTo(sx0 + 12, y0); x.lineTo(sx0 + 28, y0); x.moveTo(sx0 + 12, y1); x.lineTo(sx0 + 28, y1); x.stroke();
    x.fillStyle = INK; x.textAlign = 'left';
    const ly = Math.min(y1 - 4, Math.max(y0 + 22, (y0 + y1) / 2 + 8)) - (h * sc < 26 ? i * 0 : 0);
    x.fillText(`${n} ${mm(h)}`, sx0 + 38, h * sc < 26 ? (n === RELIEF ? y0 - 6 : y1 - 4) : ly);
  });
  // 10 mm scale bar
  const sbY = 1140, sbX = 80;
  x.fillStyle = INK; x.fillRect(sbX, sbY, 10 * sc, 10); x.fillStyle = '#fff'; x.fillRect(sbX + 5 * sc, sbY + 2, 5 * sc - 2, 6);
  x.fillStyle = MUTED; x.font = `400 22px ${SANS}`; x.fillText(tl(`10 mm 比例尺（两图同比例） scale`, `10 mm scale (both views)`, `10 mm スケール（2 つの図は同じ縮尺） scale`, `10 mm 축척(두 그림 같은 비율) scale`), sbX + 10 * sc + 20, sbY + 12);
  // spec table
  const rows = [
    [bi('印面大小', 'Stamp face', '印面の大きさ', '인면 크기'), p.round ? `Ø ${mm(p.fw)} mm   Ø ${inch(p.fw)} in` : `${mm(p.fw)} × ${mm(p.fh)} mm   ${inch(p.fw)} × ${inch(p.fh)} in`],
    [bi('总高', 'Total height', '全高', '전체 높이'), `${mm(p.Z)} mm   ${inch(p.Z)} in`],
    [p.withImg ? bi('图文区域', 'Design area', '図柄エリア', '디자인 영역') : bi('文字区域', 'Text area', '文字エリア', '글자 영역'), p.textBox ? `${mm(p.textBox.w)} × ${mm(p.textBox.h)} mm   ${inch(p.textBox.w)} × ${inch(p.textBox.h)} in` : '—'],
    [bi('重量', 'Weight', '重さ', '무게'), tl(`约 ${Math.round(p.grams)} g（实心） approx. ${(p.grams / 28.35).toFixed(2)} oz`, `approx. ${Math.round(p.grams)} g (${(p.grams / 28.35).toFixed(2)} oz), solid`, `約 ${Math.round(p.grams)} g（中まで充填） approx. ${(p.grams / 28.35).toFixed(2)} oz`, `약 ${Math.round(p.grams)} g(꽉 채움) approx. ${(p.grams / 28.35).toFixed(2)} oz`)],
    [bi('样式', 'Style', 'スタイル', '스타일'), tl(`${p.shape[0]} · ${p.yin ? '阴文' : '阳文'} · ${p.handle ? p.handle[0] + '手柄' : '无手柄'} · ${p.fontName}`, `${p.shape[1]} · ${p.yin ? 'engraved' : 'raised'} · ${p.handle ? p.handle[1] + ' handle' : 'no handle'} · ${p.fontName}`, `${p.shape[2]} · ${p.yin ? '陰刻' : '陽刻'} · ${p.handle ? p.handle[2] + 'の持ち手' : '持ち手なし'} · ${p.fontName}`, `${p.shape[3]} · ${p.yin ? '음각' : '양각'} · ${p.handle ? p.handle[3] + ' 손잡이' : '손잡이 없음'} · ${p.fontName}`)]
  ];
  x.strokeStyle = '#e4e0d6'; x.lineWidth = 2;
  rows.forEach(([k2, v], i) => {
    const y = 1210 + i * 66; x.beginPath(); x.moveTo(80, y - 44); x.lineTo(N - 80, y - 44); x.stroke();
    x.fillStyle = MUTED; x.font = `400 26px ${SANS}`; x.fillText(k2, 80, y);
    x.fillStyle = INK; x.font = `700 28px ${SANS}`; x.fillText(v, 440, y);
  });
  return await new Promise(r => c.toBlob(b => r(b), 'image/png'));
}
const u8 = async b => new Uint8Array(await b.arrayBuffer());
const enc8 = t => new TextEncoder().encode(t);
function settingsJson(s) {
  const { batch, ...rest } = s, f = customFonts.find(x => x.id === s.font);
  const pic = imgSrc && s.imgMode !== 'none' ? { name: imgName, data: imgDataURL() } : undefined;
  return JSON.stringify({ app: 'stamp-printer', version: 1, saved: new Date().toISOString(), uploadedFontName: f ? f.name : undefined, image: pic, settings: rest }, null, 2);
}
function baseName(p, n) { if (p.cutter) return `${n}_${tl('切模', 'cutter', '抜き型', '커터')}_${mm(p.cut[0])}x${mm(p.cut[1])}mm`; if (p.roller) return `${n}_${tl('滚轮', 'roller', 'ローラー', '롤러')}_D${mm(p.OD)}x${mm(p.L)}mm`; return `${n}_${p.round ? 'D' + mm(p.fw) : mm(p.fw) + 'x' + mm(p.fh)}mm`; }
async function packOne(s, mesh, mk, n, dir = '') {
  const p = specOf(s, mesh, mk), b = baseName(p, n);
  return { p, b, files: [
    { name: dir + b + '.stl', data: Geo.stl(mesh.tris, 'stamp') },
    { name: dir + b + tl('_规格卡.png', '_spec-card.png', '_仕様カード.png', '_사양카드.png'), data: await u8(await specCard(p, mesh, mk)) },
    { name: dir + b + tl('_规格.txt', '_specs.txt', '_仕様.txt', '_사양.txt'), data: enc8(specTxt(p)) }
  ] };
}
const useZipOnly = () => Promise.race([dlCap, new Promise(r => setTimeout(() => r(null), 3000))]);
$('#dl').addEventListener('click', async () => {
  const b = $('#dl'); b.disabled = true; status(tl('正在生成 STL、规格卡和规格说明…', 'Making the STL, spec card and specs…', 'STL・仕様カード・仕様書を作成中…', 'STL, 사양 카드, 사양서 만드는 중…'));
  try {
    clearTimeout(timer); await regenerate();
    const why = exportBlocked(); if (why) { status(why, true); b.disabled = false; return; }
    const { s, mesh, mk } = current, pk = await packOne(s, mesh, mk, nameFor(s));
    pk.files.push({ name: pk.b + tl('_设置.json', '_settings.json', '_設定.json', '_설정.json'), data: enc8(settingsJson(s)) });
    await saveFile(pk.b + '.zip', await makeZip(pk.files));
  } catch (e) { status(tl('导出失败：', 'Export failed: ', '書き出しに失敗しました：', '내보내기 실패: ') + e.message, true); }
  b.disabled = false;
});
$('#dlStl').addEventListener('click', async () => {
  try {
    clearTimeout(timer); await regenerate();
    const why = exportBlocked(); if (why) { status(why, true); return; }
    const { s, mesh, mk } = current, n = baseName(specOf(s, mesh, mk), nameFor(s)), stl = Geo.stl(mesh.tris, 'stamp');
    if (await useZipOnly()) await saveFile(n + '.zip', await makeZip([{ name: n + '.stl', data: stl }]));
    else await saveFile(n + '.stl', new Blob([stl], { type: 'model/stl' }));
  } catch (e) { status(tl('导出失败：', 'Export failed: ', '書き出しに失敗しました：', '내보내기 실패: ') + e.message, true); }
});

/* 导入设置：还原以前导出的印章 */
$('#impBtn').addEventListener('click', () => $('#impFile').click());
$('#impFile').addEventListener('change', async e => {
  const file = e.target.files[0]; e.target.value = ''; if (!file) return;
  try {
    const j = JSON.parse(await file.text()), st = j && j.settings;
    if (!st || typeof st !== 'object') throw new Error('bad');
    const clean = {}; for (const k of Object.keys(DEF)) if (k in st && typeof st[k] === typeof DEF[k]) clean[k] = st[k];
    S = migrate({ ...S, ...clean }); S.trans = 'straight';
    let note = tl('已还原设置。', 'Settings restored.', '設定を復元しました。', '설정을 복원했습니다.');
    if (j.image && j.image.data) { try { setImage(await loadImageURL(j.image.data), j.image.name); await imgSave(); } catch (e2) { note = tl('已还原设置，但图案读不出来，请重新上传。', 'Settings restored, but the picture could not be read. Upload it again.', '設定を復元しましたが、画像を読み込めませんでした。もう一度アップロードしてください。', '설정을 복원했지만 이미지를 읽지 못했습니다. 다시 업로드하세요.'); } }
    else if (S.imgMode !== 'none' && !imgSrc) { note = tl('已还原设置。文件里没有图案，请在「图案」页重新上传。', 'Settings restored. The file has no picture; upload it on the Picture tab.', '設定を復元しました。ファイルに画像が入っていないので、「画像」タブでアップロードし直してください。', '설정을 복원했습니다. 파일에 이미지가 없으니 ‘이미지’ 탭에서 다시 업로드하세요.'); }
    if (![...FONTS, ...customFonts].some(f => f.id === S.font)) { note = tl(`已还原设置，但没有字体「${j.uploadedFontName || '上传的字体'}」，先用${fontLabel(FONTS[0])}代替。重新上传后再选它。`, `Settings restored, but the font “${j.uploadedFontName || 'uploaded font'}” is not on this computer; using ${fontLabel(FONTS[0])} for now. Upload it again and pick it.`, `設定を復元しましたが、フォント「${j.uploadedFontName || 'アップロードしたフォント'}」がないため、いったん${fontLabel(FONTS[0])}を使っています。アップロードし直してから選んでください。`, `설정을 복원했지만 글꼴 ‘${j.uploadedFontName || '업로드한 글꼴'}’이(가) 없어 우선 ${fontLabel(FONTS[0])}을(를) 씁니다. 다시 업로드한 뒤 선택하세요.`); S.font = FONTS[0].id; }
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    fillFontSelect(); persist(); syncUI(); schedule(); status(note);
  } catch (err) { status(tl('这个文件不是印章打印器导出的设置文件。', 'This is not a settings file from Stamp Maker.', 'このファイルはスタンプメーカーの設定ファイルではありません。', '스탬프 메이커에서 내보낸 설정 파일이 아닙니다.'), true); }
});

/* ---------- 图案 page ---------- */
function drawImgPrev() {
  const c = $('#imgPrev'); if (!c) return; const x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height);
  const im = imgSrc ? imgMask(S) : null; if (!im || !im.mask) return;
  const k = Math.min((c.width - 16) / im.mask.width, (c.height - 16) / im.mask.height), w = im.mask.width * k, h = im.mask.height * k;
  const t = canvas(im.mask.width, im.mask.height), tc = t.getContext('2d'); tc.drawImage(im.mask, 0, 0); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = '#c2362b'; tc.fillRect(0, 0, t.width, t.height);
  x.drawImage(t, (c.width - w) / 2, (c.height - h) / 2, w, h);
}
$('#imgBtn').addEventListener('click', () => $('#imgFile').click());
$('#imgFile').addEventListener('change', async e => {
  const file = e.target.files[0]; e.target.value = ''; if (!file) return;
  const url = URL.createObjectURL(file);
  try {
    setImage(await loadImageURL(url), file.name);
    if (S.imgMode === 'none') {
      // a roller is usually a pattern: picture only, running edge to edge
      if (S.product === 'roller') { S.imgMode = 'only'; S.imgFit = 'fill'; S.rollerN = bestWallpaperN(S); }
      else S.imgMode = eff(S).layout === 'grid' && (S.text || '').replace(/[\s\/|｜]+/g, '') ? 'with' : eff(S).layout === 'ring' ? 'with' : 'only';
      fitImgPos();
    }
    await imgSave(); persist(); syncUI(); schedule();
    // a picture with lots of mid-greys (a photo, a gradient) turns into a blob, so say so right away
    const d = imgSrc.getContext('2d').getImageData(0, 0, imgSrc.width, imgSrc.height).data; let mid = 0, all = 0;
    // a logo has its pixels far from the light/dark cutoff (only its anti-aliased edges are near it); a photo or gradient has lots of them near it
    for (let i = 0; i < d.length; i += 16) { const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; all++; if (Math.abs(l - S.imgThreshold) < 30) mid++; }
    const photo = mid / all > 0.08;
    status(!imgMask(S) ? tl('这张图片几乎全是浅色，转出来是空的。把「深浅阈值」往右拖，或勾「反色」。', 'This picture is almost all light, so nothing came out. Drag Threshold right or tick Invert.', 'この画像はほとんど明るい色なので、何も残りませんでした。「しきい値」を右に動かすか、「反転」にチェックしてください。', '이 이미지는 거의 밝은색이라 아무것도 남지 않았습니다. ‘임계값’을 오른쪽으로 옮기거나 ‘반전’을 체크하세요.')
      : photo ? tl(`已载入「${file.name}」，但灰色层次很多（像照片），印出来会糊。最好用黑白分明的 logo 或剪影。`, `Loaded “${file.name}”, but it has many greys (like a photo) and will print as a blob. Clean black-and-white logos work best.`, `「${file.name}」を読み込みましたが、グレーが多く（写真のよう）、押すとつぶれます。白黒がはっきりしたロゴやシルエットが向いています。`, `‘${file.name}’을(를) 불러왔지만 회색이 많아(사진처럼) 찍으면 뭉개집니다. 흑백이 뚜렷한 로고나 실루엣이 좋습니다.`)
      : tl(`已载入「${file.name}」。`, `Loaded “${file.name}”.`, `「${file.name}」を読み込みました。`, `‘${file.name}’을(를) 불러왔습니다.`));
  } catch (err) { status(tl('这个文件读不了，换一张 PNG、JPG 或 SVG 试试。', 'Could not read this file. Try a PNG, JPG or SVG.', 'このファイルは読み込めません。PNG・JPG・SVG を試してください。', '이 파일을 읽을 수 없습니다. PNG, JPG, SVG를 써 보세요.'), true); }
  finally { setTimeout(() => URL.revokeObjectURL(url), 5000); }
});
$('#imgRm').addEventListener('click', async () => { imgSrc = null; imgName = ''; imgCache = { key: '' }; S.imgMode = 'none'; await imgSave(); persist(); syncUI(); schedule(); status(tl('已移除图片。', 'Picture removed.', '画像を削除しました。', '이미지를 삭제했습니다.')); });

/* ---------- tabs ---------- */
const TAB_KEY = 'stamp-printer-tab';
function localStorageTab() { const b = document.querySelector('[data-tab][aria-selected="true"]'); return b ? b.dataset.tab : ''; }
function showTab(name) {
  document.querySelectorAll('[data-tab]').forEach(b => { const on = b.dataset.tab === name; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
  document.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== name; });
  try { localStorage.setItem(TAB_KEY, name); } catch (e) {}
}
const tabBtns = [...document.querySelectorAll('[data-tab]')];
tabBtns.forEach((b, i) => {
  b.addEventListener('click', () => showTab(b.dataset.tab));
  b.addEventListener('keydown', e => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
    const n = tabBtns[(i + d + tabBtns.length) % tabBtns.length]; showTab(n.dataset.tab); n.focus(); e.preventDefault();
  });
});
let startTab = 'text'; try { const t = localStorage.getItem(TAB_KEY); if (tabBtns.some(b => b.dataset.tab === t)) startTab = t; } catch (e) {}
showTab(startTab);

/* ---------- interface language ---------- */
// The page is written in Chinese; in English mode every Chinese text node and title / aria-label is swapped for its entry here.
const I18N_EN = {
"印章打印器": "Stamp Maker",
"导入设置…": "Import settings…",
"预览与导出": "Preview and export",
"3D 模型预览，可拖动旋转": "3D preview, drag to rotate",
"拖动旋转 · 滚轮缩放": "Drag to rotate · scroll to zoom",
"印面已镜像": "Face mirrored",
"盖出来的效果": "As stamped",
"印面": "Face",
"总高": "Height",
"文字区域": "Text area",
"下载 STL + 规格": "Download STL + specs",
"模型信息": "Model info",
"模板": "Templates",
"设置": "Settings",
"文字": "Text",
"图案": "Picture",
"手柄": "Handle",
"打印": "Print",
"印章文字": "Stamp text",
"排列": "Direction",
"竖排·右起": "Vertical (right to left)",
"横排": "Horizontal",
"字间距": "Spacing",
"环形文字": "Ring text",
"环字高": "Ring text size",
"环绕角度": "Ring angle",
"距边框": "From border",
"中心": "Center",
"五角星": "Star",
"无": "None",
"中心文字": "Center text",
"中心大小": "Center size",
"下方文字": "Bottom text",
"字高": "Text size",
"下移": "Offset down",
"简 → 繁": "To Traditional",
"繁 → 简": "To Simplified",
"字体": "Font",
"字重": "Weight",
"英文建议换「英文」组的字体，如 Roboto Slab、Bebas Neue。": "For English text, pick a font from the English group, e.g. Roboto Slab or Bebas Neue.",
"上传 .ttf / .otf，会记在这个浏览器里": "Upload a .ttf / .otf; this browser remembers it",
"上传字体…": "Upload font…",
"移除此字体": "Remove font",
"上传图片…": "Upload picture…",
"移除图片": "Remove picture",
"PNG / JPG / SVG。黑白分明的 logo、剪影最好，照片不适合。": "PNG / JPG / SVG. Clean black-and-white logos and silhouettes work best; photos don't.",
"图案转成黑白后的样子": "The picture in black and white",
"红色部分会凸起。": "Red parts are raised.",
"用法": "Use",
"图案 + 文字": "Picture + text",
"深浅阈值": "Threshold",
"← 只要最深的": "← darker",
"浅一点的也算 →": "lighter →",
"排版": "Layout",
"位置": "Position",
"图在上": "Picture on top",
"图在下": "Picture below",
"图在左": "Picture left",
"图在右": "Picture right",
"对齐": "Align",
"靠左": "Left",
"水平居中": "Center",
"靠右": "Right",
"靠上": "Top",
"垂直居中": "Middle",
"靠下": "Bottom",
"间距": "Gap",
"图案大小": "Picture size",
"圆章的图案放在中间。": "On a round stamp the picture goes in the middle.",
"形状": "Shape",
"方形": "Square",
"长方形": "Rectangle",
"圆形": "Round",
"环形排字": "Text around the ring",
"居中排字": "Text in the center",
"边长": "Side",
"高": "Height",
"圆角": "Corner radius",
"边框粗": "Border",
"内边距": "Padding",
"字": "Lettering",
"字凸起": "Relief",
"顶上几层每一笔往里收一点，盖出来更实。0 = 不收": "Narrows the top few layers slightly for a crisper print. 0 = off",
"字顶收窄": "Top inset",
"底板厚": "Base thickness",
"不要手柄": "None",
"带手柄": "Handle",
"手指凹槽": "Finger grips",
"不要": "None",
"左右": "Sides",
"前后": "Ends",
"四面": "All four",
"凹槽深度": "Groove depth",
"凹槽宽度": "Groove width",
"← 窄而集中": "← narrow",
"宽而平缓 →": "wide →",
"弧线形状": "Profile",
"圆弧": "Arc",
"边缘清楚": "Crisp edges",
"柔和": "Soft",
"边缘圆滑": "Rounded edges",
"腰身": "Waist",
"← 中间变细": "← narrower",
"笔直": "straight",
"中间变粗 →": "wider →",
"更多设置": "More",
"最大坡度": "Max overhang",
"← 更平缓、更好打": "← gentler",
"更陡、更紧凑 →": "steeper →",
"喷嘴直径": "Nozzle",
"轮廓细度": "Resolution",
"快速 0.17mm": "Fast 0.17mm",
"标准 0.1mm": "Standard 0.1mm",
"精细 0.06mm": "Fine 0.06mm",
"Bambu Studio 配置": "Bambu Studio profile",
"0.10mm Standard @BBL A1 0.2 nozzle（参考配置）": "0.10mm Standard @BBL A1 0.2 nozzle (reference)",
"印面朝上、手柄贴平台，不用支撑。": "Face up, handle on the bed. No supports.",
"图文区域": "Design area",
"输入文字，下载 STL，直接切片。": "Type, download the STL, slice.",
"仅 STL": "STL only",
"STL、规格卡、规格说明和设置文件": "STL, spec card, specs and settings file",
"加粗": "Bold +",
"拉伸": "Stretch",
"关": "Off",
"仅图案": "Picture only",
"反色": "Invert",
"中心图案大小": "Center picture size",
"外留边": "Margin",
"阳文": "Raised",
"阴文": "Engraved",
"手柄高度": "Handle height",
"直段": "Collar",
"手柄外扩": "Handle offset",
"底部倒角": "Chamfer",
"镜像印面": "Mirror face",
"简繁": "Simplified ↔ Traditional",
"换行，如 陈氏/之印": "new line, e.g. Thank/You",
"方章": "Square",
"圆章": "Round",
"姓名方章": "Square name stamp",
"圆形店章": "Round shop stamp",
"长条章": "Long",
"滚轮": "Roller",
"滚轮压花": "Embossing roller",
"直径": "Diameter",
"长度": "Length",
"内孔": "Hole",
"花纹深": "Pattern depth",
"每圈重复": "Repeats around",
"沿长重复": "Repeats along",
"图案间距": "Pattern gap",
"两端留边": "End margin",
"印章": "Stamp",
"切模": "Cutter",
"饼干": "Cookie",
"黏土": "Clay",
"外形": "Outline",
"跟随图案": "Follow design",
"圆形外形": "Circle",
"方形外形": "Square",
"图案宽": "Design width",
"图案高": "Design height",
"外扩": "Offset",
"切模高度": "Height",
"高度": "Height",
"刀口厚": "Blade",
"根部厚": "Wall base",
"边沿宽": "Rim width",
"边沿厚": "Rim",
"内部压纹（一压同时切形和压花）": "Imprint inside (cut and emboss in one press)",
"压纹离刀口": "Imprint inset",
"类别": "Category",
"切模类型": "Type",
"下沿斜边（45°，免支撑）": "Sloped lower edges (45°, no supports)",
"适应": "Fit",
"铺满": "Fill",
"填充": "Fit"
};
const I18N_JA = {
"印章打印器": "スタンプメーカー",
"导入设置…": "設定を読み込む…",
"预览与导出": "プレビューと書き出し",
"3D 模型预览，可拖动旋转": "3D プレビュー（ドラッグで回転）",
"拖动旋转 · 滚轮缩放": "ドラッグで回転 · ホイールで拡大縮小",
"印面已镜像": "印面は反転済み",
"盖出来的效果": "押した跡",
"印面": "印面",
"总高": "全高",
"文字区域": "文字エリア",
"下载 STL + 规格": "STL + 仕様をダウンロード",
"模型信息": "モデル情報",
"模板": "テンプレート",
"设置": "設定",
"文字": "文字",
"图案": "画像",
"手柄": "持ち手",
"打印": "印刷",
"印章文字": "スタンプの文字",
"排列": "向き",
"竖排·右起": "縦書き（右から）",
"横排": "横書き",
"字间距": "字間",
"环形文字": "リング文字",
"环字高": "リング文字の高さ",
"环绕角度": "リングの角度",
"距边框": "枠からの距離",
"中心": "中央",
"五角星": "星",
"无": "なし",
"中心文字": "中央の文字",
"中心大小": "中央のサイズ",
"下方文字": "下の文字",
"字高": "文字の高さ",
"下移": "下へ移動",
"简 → 繁": "簡 → 繁",
"繁 → 简": "繁 → 簡",
"字体": "フォント",
"字重": "ウェイト",
"英文建议换「英文」组的字体，如 Roboto Slab、Bebas Neue。": "英字には「英語」グループのフォント（Roboto Slab、Bebas Neue など）がおすすめです。",
"上传 .ttf / .otf，会记在这个浏览器里": ".ttf / .otf をアップロード（このブラウザに保存されます）",
"上传字体…": "フォントをアップロード…",
"移除此字体": "このフォントを削除",
"上传图片…": "画像をアップロード…",
"移除图片": "画像を削除",
"PNG / JPG / SVG。黑白分明的 logo、剪影最好，照片不适合。": "PNG / JPG / SVG。白黒がはっきりしたロゴやシルエットが最適。写真は向きません。",
"图案转成黑白后的样子": "白黒にした画像",
"红色部分会凸起。": "赤い部分が凸になります。",
"用法": "使い方",
"图案 + 文字": "画像 + 文字",
"深浅阈值": "しきい値",
"← 只要最深的": "← 濃い所だけ",
"浅一点的也算 →": "薄い所も →",
"排版": "レイアウト",
"位置": "位置",
"图在上": "画像を上に",
"图在下": "画像を下に",
"图在左": "画像を左に",
"图在右": "画像を右に",
"对齐": "揃え",
"靠左": "左揃え",
"水平居中": "左右中央",
"靠右": "右揃え",
"靠上": "上揃え",
"垂直居中": "上下中央",
"靠下": "下揃え",
"间距": "間隔",
"图案大小": "画像サイズ",
"圆章的图案放在中间。": "丸型では画像は中央に入ります。",
"形状": "形",
"方形": "正方形",
"长方形": "長方形",
"圆形": "円形",
"环形排字": "文字をリング状に",
"居中排字": "文字を中央に",
"边长": "辺の長さ",
"高": "高さ",
"圆角": "角の丸み",
"边框粗": "枠の太さ",
"内边距": "余白",
"字": "文字",
"字凸起": "凸の高さ",
"顶上几层每一笔往里收一点，盖出来更实。0 = 不收": "上の数層で線を少し細くし、くっきり押せるようにします。0 = オフ",
"字顶收窄": "先端を細く",
"底板厚": "台座の厚さ",
"不要手柄": "なし",
"带手柄": "持ち手",
"手指凹槽": "指の溝",
"不要": "なし",
"左右": "左右",
"前后": "前後",
"四面": "四面",
"凹槽深度": "溝の深さ",
"凹槽宽度": "溝の幅",
"← 窄而集中": "← 狭く",
"宽而平缓 →": "広く →",
"弧线形状": "断面",
"圆弧": "円弧",
"边缘清楚": "縁がくっきり",
"柔和": "なめらか",
"边缘圆滑": "縁がなめらか",
"腰身": "くびれ",
"← 中间变细": "← 中央を細く",
"笔直": "まっすぐ",
"中间变粗 →": "中央を太く →",
"更多设置": "詳細設定",
"最大坡度": "最大傾斜",
"← 更平缓、更好打": "← ゆるやか",
"更陡、更紧凑 →": "急 →",
"喷嘴直径": "ノズル径",
"轮廓细度": "輪郭の精度",
"快速 0.17mm": "速い 0.17mm",
"标准 0.1mm": "標準 0.1mm",
"精细 0.06mm": "精細 0.06mm",
"Bambu Studio 配置": "Bambu Studio プロファイル",
"0.10mm Standard @BBL A1 0.2 nozzle（参考配置）": "0.10mm Standard @BBL A1 0.2 nozzle（基準）",
"印面朝上、手柄贴平台，不用支撑。": "印面を上、持ち手をベッドに。サポート不要。",
"图文区域": "図柄エリア",
"输入文字，下载 STL，直接切片。": "文字を入れて STL をダウンロード、そのままスライス。",
"仅 STL": "STL のみ",
"STL、规格卡、规格说明和设置文件": "STL、仕様カード、仕様書、設定ファイル",
"加粗": "太らせる",
"拉伸": "縦長",
"关": "オフ",
"仅图案": "画像のみ",
"反色": "反転",
"中心图案大小": "中央の画像サイズ",
"外留边": "外側の余白",
"阳文": "陽刻",
"阴文": "陰刻",
"手柄高度": "持ち手の高さ",
"直段": "ストレート部",
"手柄外扩": "持ち手の張り出し",
"底部倒角": "底の面取り",
"镜像印面": "印面を反転",
"简繁": "簡体 ↔ 繁体",
"换行，如 陈氏/之印": "で改行（例：山田/商店）",
"方章": "正方形",
"圆章": "丸型",
"姓名方章": "正方形の名前印",
"圆形店章": "丸型のショップ印",
"长条章": "長方形",
"滚轮": "ローラー",
"滚轮压花": "エンボスローラー",
"直径": "直径",
"长度": "長さ",
"内孔": "穴",
"花纹深": "模様の深さ",
"每圈重复": "1 周の繰り返し",
"沿长重复": "長さ方向の繰り返し",
"图案间距": "模様の間隔",
"两端留边": "両端の余白",
"印章": "スタンプ",
"切模": "抜き型",
"饼干": "クッキー",
"黏土": "粘土",
"外形": "外形",
"跟随图案": "図柄に沿う",
"圆形外形": "円",
"方形外形": "四角",
"图案宽": "図柄の幅",
"图案高": "図柄の高さ",
"外扩": "広げ幅",
"切模高度": "高さ",
"高度": "高さ",
"刀口厚": "刃先",
"根部厚": "根元",
"边沿宽": "ツバの幅",
"边沿厚": "ツバの厚さ",
"内部压纹（一压同时切形和压花）": "内側に型押し（抜くと同時に模様も付く）",
"压纹离刀口": "型押しの深さ",
"类别": "種類",
"切模类型": "タイプ",
"下沿斜边（45°，免支撑）": "下側を斜めに（45°、サポート不要）",
"适应": "収める",
"铺满": "敷き詰め",
"填充": "配置"
};
const I18N_KO = {
"印章打印器": "스탬프 메이커",
"导入设置…": "설정 불러오기…",
"预览与导出": "미리보기와 내보내기",
"3D 模型预览，可拖动旋转": "3D 미리보기(드래그해 회전)",
"拖动旋转 · 滚轮缩放": "드래그로 회전 · 휠로 확대/축소",
"印面已镜像": "인면 좌우 반전됨",
"盖出来的效果": "찍힌 모양",
"印面": "인면",
"总高": "전체 높이",
"文字区域": "글자 영역",
"下载 STL + 规格": "STL + 사양 다운로드",
"模型信息": "모델 정보",
"模板": "템플릿",
"设置": "설정",
"文字": "글자",
"图案": "이미지",
"手柄": "손잡이",
"打印": "출력",
"印章文字": "스탬프 글자",
"排列": "방향",
"竖排·右起": "세로쓰기(오른쪽부터)",
"横排": "가로쓰기",
"字间距": "자간",
"环形文字": "둥근 글자",
"环字高": "둥근 글자 높이",
"环绕角度": "둥근 글자 각도",
"距边框": "테두리와 거리",
"中心": "가운데",
"五角星": "별",
"无": "없음",
"中心文字": "가운데 글자",
"中心大小": "가운데 크기",
"下方文字": "아래 글자",
"字高": "글자 높이",
"下移": "아래로 이동",
"简 → 繁": "간 → 번",
"繁 → 简": "번 → 간",
"字体": "글꼴",
"字重": "두께",
"英文建议换「英文」组的字体，如 Roboto Slab、Bebas Neue。": "영문에는 ‘영어’ 그룹 글꼴(Roboto Slab, Bebas Neue 등)을 추천합니다.",
"上传 .ttf / .otf，会记在这个浏览器里": ".ttf / .otf 업로드(이 브라우저에 저장됨)",
"上传字体…": "글꼴 업로드…",
"移除此字体": "이 글꼴 삭제",
"上传图片…": "이미지 업로드…",
"移除图片": "이미지 삭제",
"PNG / JPG / SVG。黑白分明的 logo、剪影最好，照片不适合。": "PNG / JPG / SVG. 흑백이 뚜렷한 로고나 실루엣이 가장 좋고, 사진은 맞지 않습니다.",
"图案转成黑白后的样子": "흑백으로 바꾼 이미지",
"红色部分会凸起。": "빨간 부분이 볼록하게 나옵니다.",
"用法": "사용",
"图案 + 文字": "이미지 + 글자",
"深浅阈值": "임계값",
"← 只要最深的": "← 진한 곳만",
"浅一点的也算 →": "연한 곳도 →",
"排版": "레이아웃",
"位置": "위치",
"图在上": "이미지 위",
"图在下": "이미지 아래",
"图在左": "이미지 왼쪽",
"图在右": "이미지 오른쪽",
"对齐": "정렬",
"靠左": "왼쪽",
"水平居中": "가운데",
"靠右": "오른쪽",
"靠上": "위",
"垂直居中": "가운데",
"靠下": "아래",
"间距": "간격",
"图案大小": "이미지 크기",
"圆章的图案放在中间。": "원형 스탬프는 이미지가 가운데에 들어갑니다.",
"形状": "모양",
"方形": "정사각형",
"长方形": "직사각형",
"圆形": "원형",
"环形排字": "글자를 둥글게",
"居中排字": "글자를 가운데에",
"边长": "변 길이",
"高": "높이",
"圆角": "모서리 둥글기",
"边框粗": "테두리",
"内边距": "여백",
"字": "글자",
"字凸起": "돌출 높이",
"顶上几层每一笔往里收一点，盖出来更实。0 = 不收": "위쪽 몇 층의 획을 살짝 좁혀 더 선명하게 찍히게 합니다. 0 = 끔",
"字顶收窄": "윗면 좁히기",
"底板厚": "받침판 두께",
"不要手柄": "없음",
"带手柄": "손잡이",
"手指凹槽": "손가락 홈",
"不要": "없음",
"左右": "좌우",
"前后": "앞뒤",
"四面": "네 면",
"凹槽深度": "홈 깊이",
"凹槽宽度": "홈 너비",
"← 窄而集中": "← 좁게",
"宽而平缓 →": "넓게 →",
"弧线形状": "단면",
"圆弧": "원호",
"边缘清楚": "가장자리 또렷",
"柔和": "부드럽게",
"边缘圆滑": "가장자리 둥글게",
"腰身": "허리",
"← 中间变细": "← 가운데 가늘게",
"笔直": "일자",
"中间变粗 →": "가운데 굵게 →",
"更多设置": "추가 설정",
"最大坡度": "최대 경사",
"← 更平缓、更好打": "← 완만하게",
"更陡、更紧凑 →": "가파르게 →",
"喷嘴直径": "노즐",
"轮廓细度": "윤곽 정밀도",
"快速 0.17mm": "빠름 0.17mm",
"标准 0.1mm": "표준 0.1mm",
"精细 0.06mm": "정밀 0.06mm",
"Bambu Studio 配置": "Bambu Studio 프로파일",
"0.10mm Standard @BBL A1 0.2 nozzle（参考配置）": "0.10mm Standard @BBL A1 0.2 nozzle (기준)",
"印面朝上、手柄贴平台，不用支撑。": "인면은 위, 손잡이는 베드에. 서포트 필요 없음.",
"图文区域": "디자인 영역",
"输入文字，下载 STL，直接切片。": "글자를 넣고 STL을 받아 바로 슬라이스.",
"仅 STL": "STL만",
"STL、规格卡、规格说明和设置文件": "STL, 사양 카드, 사양서, 설정 파일",
"加粗": "굵게 +",
"拉伸": "늘이기",
"关": "끔",
"仅图案": "이미지만",
"反色": "반전",
"中心图案大小": "가운데 이미지 크기",
"外留边": "바깥 여백",
"阳文": "양각",
"阴文": "음각",
"手柄高度": "손잡이 높이",
"直段": "직선부",
"手柄外扩": "손잡이 확장",
"底部倒角": "아래 모따기",
"镜像印面": "인면 좌우 반전",
"简繁": "간체 ↔ 번체",
"换行，如 陈氏/之印": "로 줄바꿈 (예: 감사/합니다)",
"方章": "정사각형",
"圆章": "원형",
"姓名方章": "정사각형 이름 도장",
"圆形店章": "원형 가게 스탬프",
"长条章": "직사각형",
"滚轮": "롤러",
"滚轮压花": "엠보싱 롤러",
"直径": "지름",
"长度": "길이",
"内孔": "구멍",
"花纹深": "무늬 깊이",
"每圈重复": "둘레 반복",
"沿长重复": "길이 반복",
"图案间距": "무늬 간격",
"两端留边": "양끝 여백",
"印章": "스탬프",
"切模": "커터",
"饼干": "쿠키",
"黏土": "점토",
"外形": "외형",
"跟随图案": "디자인 따라",
"圆形外形": "원",
"方形外形": "사각",
"图案宽": "디자인 너비",
"图案高": "디자인 높이",
"外扩": "확장",
"切模高度": "높이",
"高度": "높이",
"刀口厚": "칼날",
"根部厚": "밑동",
"边沿宽": "받침 폭",
"边沿厚": "받침 두께",
"内部压纹（一压同时切形和压花）": "안쪽 압인(한 번에 자르고 무늬도 찍기)",
"压纹离刀口": "압인 간격",
"类别": "종류",
"切模类型": "유형",
"下沿斜边（45°，免支撑）": "아래쪽 경사(45°, 서포트 없이)",
"适应": "맞춤",
"铺满": "채우기",
"填充": "배치"
};
const I18N = { en: I18N_EN, ja: I18N_JA, ko: I18N_KO };
const zhText = new WeakMap(), zhAttr = new WeakMap(), HAS_ZH = /[\u3400-\u9fff]/;
function applyLang() {
  document.documentElement.lang = { zh: 'zh-CN', en: 'en', ja: 'ja', ko: 'ko' }[LANG];
  document.title = tl('印章打印器', 'Stamp Maker', 'スタンプメーカー', '스탬프 메이커');
  const D = I18N[LANG] || {}, tr = zh => D[zh] || (LANG !== 'zh' && I18N_EN[zh]) || null;
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = walk.nextNode());) {
    const pe = n.parentElement; if (!pe || pe.closest('script,style,#font,#weight,#status,#warn,.kv,.mark,#langSel')) continue;
    if (!zhText.has(n)) { if (!HAS_ZH.test(n.nodeValue)) continue; zhText.set(n, n.nodeValue); }
    const zh = zhText.get(n), key = zh.trim(), t = tr(key);
    n.nodeValue = t ? zh.replace(key, t) : zh;
  }
  document.querySelectorAll('[title],[aria-label],[placeholder]').forEach(el => {
    let m = zhAttr.get(el); if (!m) { m = {}; zhAttr.set(el, m); }
    for (const a of ['title', 'aria-label', 'placeholder']) {
      const v = el.getAttribute(a); if (v == null) continue;
      if (!(a in m)) { if (!HAS_ZH.test(v)) continue; m[a] = v; }
      el.setAttribute(a, tr(m[a]) || m[a]);
    }
  });
  $('#langSel').value = LANG;
}
$('#langSel').addEventListener('change', e => {
  LANG = LANGS.includes(e.target.value) ? e.target.value : 'en'; try { localStorage.setItem(LANG_KEY, LANG); } catch (er) {}
  applyLang(); fillFontSelect(); syncUI(); status(''); regenerate();
});

/* ---------- boot ---------- */
(async () => {
  applyLang(); init3D();
  const recs = await idbAll();
  for (const r of recs) { try { await registerFont(r); } catch (e) {} }
  await imgLoadSaved();
  fillFontSelect(); syncUI(); regenerate();
})();
})();
