const Geo = (() => {
  // Marching squares on a grayscale grid (values 0..1), iso 0.5. Returns closed loops in grid coords.
  function contours(v, W, H) {
    const pts = new Map(), adj = new Map();
    const add = (id, x, y) => { if (!pts.has(id)) pts.set(id, [x, y]); };
    const push = (a, b) => { let l = adj.get(a); if (!l) { l = []; adj.set(a, l); } l.push(b); };
    const seg = (a, b) => { push(a, b); push(b, a); };
    const t = (p, q) => (0.5 - p) / (q - p);
    for (let y = 0; y < H - 1; y++) {
      for (let x = 0; x < W - 1; x++) {
        const a = v[y * W + x], b = v[y * W + x + 1], c = v[(y + 1) * W + x + 1], d = v[(y + 1) * W + x];
        const cs = (a >= .5 ? 8 : 0) | (b >= .5 ? 4 : 0) | (c >= .5 ? 2 : 0) | (d >= .5 ? 1 : 0);
        if (cs === 0 || cs === 15) continue;
        const T = 2 * (y * W + x), B = 2 * ((y + 1) * W + x), L = 2 * (y * W + x) + 1, R = 2 * (y * W + x + 1) + 1;
        const eT = () => add(T, x + t(a, b), y), eB = () => add(B, x + t(d, c), y + 1);
        const eL = () => add(L, x, y + t(a, d)), eR = () => add(R, x + 1, y + t(b, c));
        switch (cs) {
          case 1: case 14: eL(); eB(); seg(L, B); break;
          case 2: case 13: eB(); eR(); seg(B, R); break;
          case 3: case 12: eL(); eR(); seg(L, R); break;
          case 4: case 11: eT(); eR(); seg(T, R); break;
          case 6: case 9: eT(); eB(); seg(T, B); break;
          case 7: case 8: eT(); eL(); seg(T, L); break;
          case 5: { eT(); eB(); eL(); eR(); const m = (a + b + c + d) / 4; if (m >= .5) { seg(T, L); seg(R, B); } else { seg(T, R); seg(B, L); } break; }
          case 10: { eT(); eB(); eL(); eR(); const m = (a + b + c + d) / 4; if (m >= .5) { seg(T, R); seg(L, B); } else { seg(T, L); seg(R, B); } break; }
        }
      }
    }
    const seen = new Set(), loops = [];
    for (const start of adj.keys()) {
      if (seen.has(start)) continue;
      const loop = []; let prev = -1, cur = start, guard = 0;
      while (true) {
        seen.add(cur); loop.push(pts.get(cur));
        const nb = adj.get(cur);
        const nx = nb[0] !== prev ? nb[0] : nb[1];
        prev = cur; cur = nx;
        if (cur === undefined || cur === start || seen.has(cur) || ++guard > 5e6) break;
      }
      if (loop.length >= 3) loops.push(loop);
    }
    return loops;
  }

  function rdp(pts, eps) {
    const n = pts.length; if (n < 3) return pts.slice();
    const keep = new Uint8Array(n); keep[0] = keep[n - 1] = 1;
    const st = [[0, n - 1]];
    while (st.length) {
      const [i, j] = st.pop();
      const ax = pts[i][0], ay = pts[i][1], dx = pts[j][0] - ax, dy = pts[j][1] - ay;
      const len = Math.hypot(dx, dy);
      let md = 0, mi = -1;
      for (let k = i + 1; k < j; k++) {
        const d = len > 1e-9 ? Math.abs((pts[k][0] - ax) * dy - (pts[k][1] - ay) * dx) / len : Math.hypot(pts[k][0] - ax, pts[k][1] - ay);
        if (d > md) { md = d; mi = k; }
      }
      if (md > eps) { keep[mi] = 1; st.push([i, mi], [mi, j]); }
    }
    return pts.filter((_, k) => keep[k]);
  }
  function simplifyClosed(loop, eps) {
    let fi = 0, fd = -1; const [x0, y0] = loop[0];
    for (let k = 1; k < loop.length; k++) { const d = (loop[k][0] - x0) ** 2 + (loop[k][1] - y0) ** 2; if (d > fd) { fd = d; fi = k; } }
    const a = rdp(loop.slice(0, fi + 1), eps), b = rdp(loop.slice(fi).concat([loop[0]]), eps);
    return a.slice(0, -1).concat(b.slice(0, -1));
  }
  function area(p) { let s = 0; for (let i = 0, n = p.length; i < n; i++) { const q = p[(i + 1) % n]; s += p[i][0] * q[1] - q[0] * p[i][1]; } return s / 2; }
  function pip(pt, poly) {
    const [x, y] = pt; let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function bbox(p) { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const [x, y] of p) { if (x < a) a = x; if (y < b) b = y; if (x > c) c = x; if (y > d) d = y; } return [a, b, c, d]; }

  // Nest loops into {outer, holes}; outers CCW, holes CW.
  function groupLoops(loops) {
    const L = loops.map(p => ({ p, a: Math.abs(area(p)), bb: bbox(p) })).sort((x, y) => y.a - x.a);
    const depth = new Array(L.length).fill(0), parent = new Array(L.length).fill(-1);
    for (let i = 0; i < L.length; i++) {
      let best = -1;
      for (let j = 0; j < i; j++) {
        const A = L[j].bb, B = L[i].bb;
        if (A[0] > B[0] || A[1] > B[1] || A[2] < B[2] || A[3] < B[3]) continue;
        if (pip(L[i].p[0], L[j].p)) { if (best < 0 || L[j].a < L[best].a) best = j; }
      }
      if (best >= 0) { parent[i] = best; depth[i] = depth[best] + 1; }
    }
    const groups = new Map();
    for (let i = 0; i < L.length; i++) {
      let p = L[i].p;
      if (depth[i] % 2 === 0) { if (area(p) < 0) p = p.slice().reverse(); groups.set(i, { outer: p, holes: [] }); }
    }
    for (let i = 0; i < L.length; i++) {
      if (depth[i] % 2 === 1) { let p = L[i].p; if (area(p) > 0) p = p.slice().reverse(); const g = groups.get(parent[i]); if (g) g.holes.push(p); }
    }
    return [...groups.values()];
  }

  const tri = (o, a, b, c) => { o.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); };
  function caps(rings, zBottom, zTop, out) {
    const flat = [], holes = [];
    rings.forEach((r, i) => { if (i) holes.push(flat.length / 2); for (const [x, y] of r) flat.push(x, y); });
    const idx = earcut(flat, holes, 2);
    for (let k = 0; k < idx.length; k += 3) {
      let p = idx[k], q = idx[k + 1], r = idx[k + 2];
      const cr = (flat[2 * q] - flat[2 * p]) * (flat[2 * r + 1] - flat[2 * p + 1]) - (flat[2 * q + 1] - flat[2 * p + 1]) * (flat[2 * r] - flat[2 * p]);
      if (cr < 0) { const s = q; q = r; r = s; }
      const P = (i, z) => [flat[2 * i], flat[2 * i + 1], z];
      if (zTop !== null) tri(out, P(p, zTop), P(q, zTop), P(r, zTop));
      if (zBottom !== null) tri(out, P(p, zBottom), P(r, zBottom), P(q, zBottom));
    }
  }
  function walls(ring, z0, z1, out) {
    for (let i = 0, n = ring.length; i < n; i++) {
      const a = ring[i], b = ring[(i + 1) % n];
      tri(out, [a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1]);
      tri(out, [a[0], a[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]);
    }
  }
  function prism(groups, z0, z1, out) {
    for (const g of groups) {
      walls(g.outer, z0, z1, out); for (const h of g.holes) walls(h, z0, z1, out);
      caps([g.outer, ...g.holes], z0, z1, out);
    }
  }
  // rings: [{poly (CCW, equal vertex counts), z}] bottom to top
  function loft(rings, out) {
    for (let k = 0; k + 1 < rings.length; k++) {
      const A = rings[k].poly, B = rings[k + 1].poly, za = rings[k].z, zb = rings[k + 1].z, n = A.length;
      // Rings at the same height (a ledge) can share points; skip the zero-size triangles that makes.
      const same = (p, q) => Math.abs(p[0] - q[0]) < 1e-6 && Math.abs(p[1] - q[1]) < 1e-6 && Math.abs(p[2] - q[2]) < 1e-6;
      const T = (p, q, r) => { if (!same(p, q) && !same(q, r) && !same(p, r)) tri(out, p, q, r); };
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        T([A[i][0], A[i][1], za], [A[j][0], A[j][1], za], [B[j][0], B[j][1], zb]);
        T([A[i][0], A[i][1], za], [B[j][0], B[j][1], zb], [B[i][0], B[i][1], zb]);
      }
    }
    caps([rings[0].poly], rings[0].z, null, out);
    caps([rings[rings.length - 1].poly], null, rings[rings.length - 1].z, out);
  }
  function circlePoly(r, n = 160) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; p.push([r * Math.cos(a), r * Math.sin(a)]); } return p; }
  function roundRectPoly(w, h, r, seg = 10) {
    r = Math.max(0, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3));
    const cx = w / 2 - r, cy = h / 2 - r, p = [];
    const corners = [[cx, cy, 0], [-cx, cy, 1], [-cx, -cy, 2], [cx, -cy, 3]];
    for (const [x, y, q] of corners) {
      if (r < 0.01) { p.push([x, y]); continue; }
      for (let i = 0; i <= seg; i++) { const a = (q + i / seg) * Math.PI / 2; p.push([x + r * Math.cos(a), y + r * Math.sin(a)]); }
    }
    return p;
  }
  function stl(tris, title) {
    const n = tris.length / 9, buf = new ArrayBuffer(84 + 50 * n), dv = new DataView(buf);
    const head = (title || 'stamp').slice(0, 79);
    for (let i = 0; i < head.length; i++) dv.setUint8(i, head.charCodeAt(i) & 0x7f);
    dv.setUint32(80, n, true);
    let o = 84;
    for (let k = 0; k < tris.length; k += 9) {
      const ux = tris[k + 3] - tris[k], uy = tris[k + 4] - tris[k + 1], uz = tris[k + 5] - tris[k + 2];
      const vx = tris[k + 6] - tris[k], vy = tris[k + 7] - tris[k + 1], vz = tris[k + 8] - tris[k + 2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1;
      dv.setFloat32(o, nx / l, true); dv.setFloat32(o + 4, ny / l, true); dv.setFloat32(o + 8, nz / l, true); o += 12;
      for (let i = 0; i < 9; i++) { dv.setFloat32(o, tris[k + i], true); o += 4; }
      dv.setUint16(o, 0, true); o += 2;
    }
    return new Uint8Array(buf);
  }
  return { contours, simplifyClosed, area, groupLoops, prism, loft, circlePoly, roundRectPoly, stl };
})();
