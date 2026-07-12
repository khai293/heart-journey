'use strict';
/* ============================================================
   The Heart Journey — pixel toolkit
   Everything draws onto `g` (384x216 pixel canvas context).
   All animation is a pure function of time t  →  seekable.
   ============================================================ */

const W = 384, H = 216;
const PXS = 2;                      // supersample: logical pixels render at 2x for silky light
let g = null;                       // pixel context — assigned by core.js
const TAU = Math.PI * 2;

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp  = (a, b, t) => a + (b - a) * t;
const ss    = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
const seg   = (t, a, b) => ss((t - a) / (b - a));          // eased 0→1 across [a,b]
const lin   = (t, a, b) => clamp((t - a) / (b - a), 0, 1); // linear 0→1
const pulse = (t, a, b, c, d) => seg(t, a, b) * (1 - seg(t, c, d)); // window in/out
const R     = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/* ---------- color ---------- */
const _pc = {};
function C(h) {
  let c = _pc[h];
  if (!c) {
    if (h[0] === '#') c = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    else { const m = h.match(/([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)/); c = m ? [+m[1], +m[2], +m[3]] : [255, 0, 255]; }
    _pc[h] = c;
  }
  return c;
}
function mix(a, b, t) {
  const x = C(a), y = C(b); t = clamp(t, 0, 1);
  return `rgb(${x[0] + (y[0] - x[0]) * t | 0},${x[1] + (y[1] - x[1]) * t | 0},${x[2] + (y[2] - x[2]) * t | 0})`;
}
function rgba(h, a) { const c = C(h); return `rgba(${c[0]},${c[1]},${c[2]},${clamp(a, 0, 1)})`; }

/* ---------- primitives ---------- */
function px(x, y, w, h, c) {
  g.fillStyle = c;
  g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}
function vgrad(x, y, w, h, stops) { // smooth vertical gradient  stops = [[pos,hex],...]
  const n = Math.max(1, Math.round(h));
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1);
    let c = stops[stops.length - 1][1];
    for (let s = 0; s < stops.length - 1; s++) {
      const p0 = stops[s][0], c0 = stops[s][1], p1 = stops[s + 1][0], c1 = stops[s + 1][1];
      if (t <= p1 || s === stops.length - 2) { c = mix(c0, c1, lin(t, p0, p1)); break; }
    }
    px(x, y + i * (h / n), w, h / n + 1, c);
  }
}
function disc(cx, cy, r, c) {
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy)));
    px(cx - w, cy + dy, w * 2 + 1, 1, c);
  }
}
function glow(x, y, r, hex, a) {
  if (r < 1 || a <= 0) return;
  const c = C(hex);
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${clamp(a, 0, 1)})`);
  gr.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  g.restore();
}
function dim(a)      { if (a > 0) { g.fillStyle = `rgba(5,4,10,${clamp(a, 0, 1)})`; g.fillRect(0, 0, W, H); } }
function flash(h, a) { if (a > 0) { g.fillStyle = rgba(h, a); g.fillRect(0, 0, W, H); } }
function shadow(x, y, w, a) {
  g.fillStyle = `rgba(8,6,18,${a === undefined ? 0.22 : a})`;
  g.fillRect(Math.round(x - w / 2), Math.round(y), Math.round(w), 2);
}

/* ---------- sprites ---------- */
const HEART_MAP = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'];
function heartSpr(cx, cy, cell, glowA) {
  if (cell <= 0) return;
  const w = 7 * cell, h = 6 * cell, x0 = cx - w / 2, y0 = cy - h / 2;
  const ga = glowA === undefined ? 0.5 : glowA;
  if (ga > 0) glow(cx, cy, Math.max(7, w * 1.5), '#ff4d64', ga * 0.55);
  for (let r = 0; r < 6; r++) for (let q = 0; q < 7; q++) {
    if (HEART_MAP[r][q] === '1') {
      let c = '#ff4d64';
      if (r >= 3) c = '#d92e48';
      if ((r === 0 && q === 1) || (r === 1 && (q === 1 || q === 2))) c = '#ff9dab';
      px(x0 + q * cell, y0 + r * cell, cell, cell, c);
    }
  }
}
function sparkle(x, y, r, hex, a) {
  if (a <= 0 || r < 0.5) return;
  const c = rgba(hex, Math.min(1, a));
  px(x - r, y, r * 2 + 1, 1, c);
  px(x, y - r, 1, r * 2 + 1, c);
  glow(x, y, r * 2.4, hex, a * 0.4);
}
function note(x, y, hex, a) {
  const c = rgba(hex, clamp(a, 0, 1));
  px(x, y, 2, 2, c); px(x + 2, y - 4, 1, 6, c); px(x + 3, y - 4, 2, 1, c);
}
function stars(n, t, yMax, a) {
  const al = a === undefined ? 1 : a;
  if (al <= 0) return;
  for (let i = 0; i < n; i++) {
    const x = R(i) * W, y = R(i + 50) * yMax;
    const tw = 0.5 + 0.5 * Math.sin(t * (0.8 + R(i + 99) * 1.5) + i * 2.3);
    px(x, y, 1, 1, rgba('#ffe9c8', al * (0.2 + 0.55 * tw)));
    if (i % 9 === 0 && tw > 0.75) {                    // the bright ones twinkle a cross
      const ca = al * (tw - 0.75) * 2.2;
      px(x - 1, y, 1, 1, rgba('#ffe9c8', ca * 0.5)); px(x + 1, y, 1, 1, rgba('#ffe9c8', ca * 0.5));
      px(x, y - 1, 1, 1, rgba('#ffe9c8', ca * 0.5)); px(x, y + 1, 1, 1, rgba('#ffe9c8', ca * 0.5));
    }
  }
}
/* sprinkle of deterministic surface noise — plaster, dust, tooth */
function texNoise(x, y, w, h, seed, a) {
  const n = Math.floor(w * h / 85);
  for (let i = 0; i < n; i++) {
    const xx = x + R(seed + i * 2) * w, yy = y + R(seed + i * 3 + 1) * h;
    px(xx, yy, 1, 1, rgba(i % 2 ? '#ffffff' : '#000000', a));
  }
}
/* a little pigeon, pecking about */
function pigeon(x, y, t, i) {
  const peck = Math.sin(t * 2.6 + i * 2.1) > 0.55 ? 1 : 0;
  px(x, y - 4 + peck, 4, 3, '#8a8ca0');
  px(x - 1, y - 3, 3, 2, '#7a7c90');
  px(x + 3, y - 5 + peck * 2, 2, 2, '#6a6c80');
  px(x + 5, y - 4 + peck * 2, 1, 1, '#c8963f');
  px(x + 1, y - 1, 1, 1, '#c05f4a'); px(x + 3, y - 1, 1, 1, '#c05f4a');
}
/* a steaming cup of something warm */
function teacup(x, y, t, seed) {
  px(x, y - 3, 5, 3, '#ece4d0'); px(x + 5, y - 2, 1, 1, '#ece4d0');
  px(x + 1, y - 3, 3, 1, '#8a5c3a');
  steam(x + 2, y - 5, t, seed, 3, 3, '#fff3dc');
}
/* a parked bicycle in profile; bg = pavement colour showing through the wheels */
function bikeSpr(x, y, c, bg) {
  disc(x - 5, y - 4, 4, '#2c2c38'); disc(x + 5, y - 4, 4, '#2c2c38');
  disc(x - 5, y - 4, 2, bg); disc(x + 5, y - 4, 2, bg);
  px(x - 4, y - 8, 9, 2, c);
  px(x - 2, y - 11, 2, 4, c); px(x + 3, y - 12, 2, 5, c);
  px(x - 4, y - 12, 4, 1, '#2c2c38');                    // saddle
  px(x + 2, y - 13, 4, 1, '#2c2c38');                    // handlebars
}
function moon(x, y, r, a) {
  const al = a === undefined ? 1 : a;
  glow(x, y, r * 3.2, '#fff3d0', 0.35 * al);
  disc(x, y, r, rgba('#f7ecd0', al));
  px(x - r * 0.3, y - r * 0.2, 2, 2, rgba('#ded2b4', al));
  px(x + r * 0.25, y + r * 0.3, 2, 1, rgba('#ded2b4', al));
}

/* petals falling — deterministic; region = {x0,x1,y0,y1} */
function petals(t, n, region, a) {
  const al = a === undefined ? 1 : a;
  if (al <= 0) return;
  const rw = region.x1 - region.x0, rh = region.y1 - region.y0;
  for (let i = 0; i < n; i++) {
    const sp = 9 + R(i + 3) * 8;
    const yy = region.y0 + ((R(i) * rh + t * sp) % rh);
    const xx = region.x0 + R(i + 40) * rw + Math.sin(t * (1 + R(i + 7)) + i) * 7;
    const c = i % 3 === 0 ? '#ffb3c4' : (i % 3 === 1 ? '#ff8aa5' : '#ffd9e2');
    const flip = Math.sin(t * 3 + i * 1.7) > 0;
    px(xx, yy, flip ? 3 : 2, flip ? 1 : 2, rgba(c, al * 0.9));
  }
}

/* rising steam — deterministic */
function steam(x, y, t, seed, n, spread, hex) {
  const col = hex || '#ffffff';
  for (let i = 0; i < n; i++) {
    const life = 2.2 + R(seed + i) * 1.4;
    const ph = ((t * (0.9 + R(seed + i + 9) * 0.5)) / life + R(seed + i + 3)) % 1;
    const yy = y - ph * 34;
    const xx = x + (R(seed + i + 5) - 0.5) * spread + Math.sin(t * 1.4 + i * 2.1) * (2 + ph * 4);
    const al = (1 - ph) * 0.35 * Math.min(1, ph * 6);
    const s = ph > 0.5 ? 2 : 1;
    px(xx, yy, s, s, rgba(col, al));
  }
}

/* heart flying along an arc from -> mid -> HUD slot, p = 0..1 */
function flyHeart(p, fx, fy, mx, my, tx, ty) {
  if (p <= 0 || p >= 1) return;
  const u = ss(p);
  const x = (1 - u) * (1 - u) * fx + 2 * (1 - u) * u * mx + u * u * tx;
  const y = (1 - u) * (1 - u) * fy + 2 * (1 - u) * u * my + u * u * ty;
  const cell = lerp(2.4, 1.5, u);
  // sparkle trail
  for (let i = 1; i <= 4; i++) {
    const q = clamp(u - i * 0.045, 0, 1);
    const sx = (1 - q) * (1 - q) * fx + 2 * (1 - q) * q * mx + q * q * tx;
    const sy = (1 - q) * (1 - q) * fy + 2 * (1 - q) * q * my + q * q * ty;
    px(sx, sy, 1, 1, rgba('#ffb3c4', 0.5 - i * 0.1));
  }
  heartSpr(x, y, cell, 0.7);
}

/* ============================================================
   CHARACTERS — procedural little people (~25px tall)
   person(x, y, o)
     x     : feet center      y : ground line
     o.who : 'boy' | 'girl'
     o.pose: 'stand' 'walk' 'sit' 'ride' 'kneel'
     o.f   : 1 face right | -1 face left
     o.frame  : walk frame
     o.seat   : seat height for sit/ride (default 9)
     o.arm    : 'down' 'lap' 'up' 'hold' 'face'
     o.headDx / o.headDy : head offset (lean)
     o.blush  : 0..1
     o.sil    : silhouette color (overrides palette)
     o.shade  : 0..1 darken toward night
     o.rim    : rim-light hex on the facing edge
     o.bob    : extra y offset (laughing etc.)
   ============================================================ */
const PAL = {
  skin: '#f2bd92', skinG: '#f7cda6', cheek: '#ff8798',
  bHair: '#2e3050', bHairL: '#565a8c', bShirt: '#e9edf4', bShirtD: '#c7d0de', bPants: '#41537a', bShoe: '#262840',
  gHair: '#24242e', gHairD: '#15151c', gDress: '#2e3c60', gDressD: '#222c48', gShoe: '#2c2c38',
  glass: '#3e4250', glassIn: '#cfe4ea'
};

function person(x, y, o) {
  o = o || {};
  const boy = o.who !== 'girl';
  const f = o.f === undefined ? 1 : o.f;
  const sil = o.sil || null;
  const sh = o.shade || 0;
  const col = h => sil ? sil : (sh > 0 ? mix(h, '#171330', sh) : h);
  const skin = col(boy ? PAL.skin : PAL.skinG);
  const hair = col(boy ? PAL.bHair : PAL.gHair);
  const hairD = col(boy ? PAL.bHair : PAL.gHairD);
  const top  = col(boy ? PAL.bShirt : PAL.gDress);
  const topD = col(boy ? PAL.bShirtD : PAL.gDressD);
  const legC = col(boy ? PAL.bPants : PAL.skinG);
  const shoe = col(boy ? PAL.bShoe : PAL.gShoe);
  const eyeC = sil ? sil : '#1c1c28';

  let Y = y - (o.bob || 0);
  // r(dx, top, w, h, c): rect whose top edge sits `top` px above ground, mirrored by f
  const r = (dx, tp, w, hh, c) => {
    const X = f < 0 ? x - dx - w : x + dx;
    px(X, Y - tp, w, hh, c);
  };

  const hd = (o.headDx || 0) * (f < 0 ? 1 : 1); // headDx already in facing-space via r()
  const hv = o.headDy || 0;

  // head: bottom of face at height `base`; face is 7 wide (dx -3..+3)
  function head(base) {
    const b = base + hv, dx = hd;
    r(-3 + dx, b + 7, 7, 7, skin);                       // face block
    if (boy) {
      r(-3 + dx, b + 8, 7, 3, hair);                     // swept-up top
      r(-4 + dx, b + 7, 2, 6, hair);                     // back of head
      r(1 + dx, b + 8, 3, 2, hair);                      // fringe sweeping forward
      r(-1 + dx, b + 8, 3, 1, sil ? sil : col(PAL.bHairL)); // shine
      r(-2 + dx, b + 6, 3, 1, hairD);
    } else {
      r(-3 + dx, b + 7, 7, 2, hair);                     // top
      r(-5 + dx, b + 7, 2, 11, hair);                    // long hair behind
      r(-4 + dx, b + 7, 1, 8, hairD);
      r(2 + dx, b + 6, 2, 3, hair);                      // side strand front
      r(-1 + dx, b + 7, 3, 1, hairD);                    // bang shade
    }
    if (!boy && !sil) {                                  // her glasses
      r(0 + dx, b + 5, 4, 1, col(PAL.glass));
      r(0 + dx, b + 3, 4, 1, col(PAL.glass));
      r(0 + dx, b + 4, 1, 1, col(PAL.glass)); r(3 + dx, b + 4, 1, 1, col(PAL.glass));
      r(-2 + dx, b + 5, 2, 1, col(PAL.glass));           // temple arm
      r(1 + dx, b + 4, 2, 1, col(PAL.glassIn));
    }
    r(1 + dx, b + 4, 1, 1, eyeC);                        // eye (facing side)
    if (!sil && boy) r(2 + dx, b + 2, 2, 1, col('#c07a5a'));   // his easy smile
    if (!sil && o.blush) r(2 + dx, boy ? b + 3 : b + 2, 2, 1, rgba(PAL.cheek, clamp(o.blush, 0, 1)));
    if (!sil && o.rim) { r(3 + dx, b + 7, 1, 7, o.rim); }
    return b;
  }

  const pose = o.pose || 'stand';
  const armMode = o.arm || (pose === 'sit' ? 'lap' : 'down');

  if (pose === 'stand' || pose === 'walk') {
    let fdx = 0, bdx = -3;                               // front/back foot offsets
    if (pose === 'walk') {
      const ph = (o.frame | 0) % 4;
      if (ph === 0) { fdx = 2; bdx = -5; }
      else if (ph === 2) { fdx = -4; bdx = 1; }
      else { fdx = 0; bdx = -3; Y -= 1; }
    }
    if (boy) {
      r(bdx, 8, 2, 6, legC); r(fdx + 1, 8, 2, 6, legC);
      r(bdx - 1, 2, 3, 2, shoe); r(fdx + 1, 2, 3, 2, shoe);
      r(-3, 17, 6, 9, top); r(-3, 17, 1, 9, topD);
      r(-1, 17, 2, 1, topD);                             // collar
      // arm
      if (armMode === 'up')        { r(2, 21, 2, 6, topD); r(2, 23, 2, 2, skin); }
      else if (armMode === 'hold') { r(1, 13, 6, 2, topD); r(6, 13, 2, 2, skin); }
      else if (armMode === 'face') { r(2, 17, 2, 4, topD); r(2, 18, 2, 2, skin); }
      else                         { r(1, 16, 2, 7, topD); r(1, 10, 2, 2, skin); }
      head(18);
    } else {                                             // petite — her head reaches his neck
      r(bdx, 5, 2, 3, legC); r(fdx + 1, 5, 2, 3, legC);
      r(bdx - 1, 2, 3, 2, shoe); r(fdx + 1, 2, 3, 2, shoe);
      r(-3, 11, 6, 3, top);                              // navy top
      r(-4, 8, 8, 3, top);                               // skirt flare
      r(-4, 8, 1, 3, topD); r(-3, 11, 1, 3, topD);
      if (armMode === 'up')        { r(2, 14, 2, 4, topD); r(2, 16, 2, 2, skin); }
      else if (armMode === 'hold') { r(1, 8, 4, 2, topD); r(4, 8, 2, 2, skin); }
      else if (armMode === 'face') { r(2, 11, 2, 2, topD); r(2, 12, 2, 2, skin); }
      else                         { r(1, 10, 2, 4, topD); r(1, 6, 2, 2, skin); }
      head(11);
    }
  }

  else if (pose === 'sit' || pose === 'ride') {
    const s = o.seat === undefined ? 9 : o.seat;
    const foot = o.footH === undefined ? 0 : o.footH;
    // thigh forward + shin down
    r(0, s + 1, 6, 2, legC);
    r(4, s - 1, 2, Math.max(2, s - 1 - foot), legC);
    r(4, foot + 2, 3, 2, shoe);
    const lean = pose === 'ride' ? 1 : 0;
    if (boy) {
      r(-3 + lean, s + 10, 6, 9, top);
      r(-3 + lean, s + 10, 1, 9, topD);
      if (armMode === 'up')        { r(2 + lean, s + 14, 2, 6, topD); r(2 + lean, s + 16, 2, 2, skin); }
      else if (armMode === 'hold') { r(1 + lean, s + 7, 6, 2, topD); r(6 + lean, s + 7, 2, 2, skin); }
      else if (armMode === 'face') { r(2 + lean, s + 10, 2, 4, topD); r(2 + lean, s + 11, 2, 2, skin); }
      else if (armMode === 'hugF') { r(1 + lean, s + 8, 7, 2, topD); r(7 + lean, s + 8, 2, 2, skin); }
      else                         { r(1 + lean, s + 6, 4, 2, topD); r(4 + lean, s + 6, 2, 2, skin); }
      head(s + 11);
    } else {
      r(-2, s + 3, 8, 3, top); r(-2, s + 3, 1, 3, topD); // skirt over lap
      r(-3 + lean, s + 6, 6, 5, top);
      r(-3 + lean, s + 6, 1, 5, topD);
      if (armMode === 'up')        { r(2 + lean, s + 9, 2, 4, topD); r(2 + lean, s + 11, 2, 2, skin); }
      else if (armMode === 'hold') { r(1 + lean, s + 5, 4, 2, topD); r(4 + lean, s + 5, 2, 2, skin); }
      else if (armMode === 'face') { r(2 + lean, s + 7, 2, 2, topD); r(2 + lean, s + 8, 2, 2, skin); }
      else if (armMode === 'hugF') { r(1 + lean, s + 6, 5, 2, topD); r(5 + lean, s + 6, 2, 2, skin); }
      else                         { r(1 + lean, s + 4, 3, 2, topD); r(3 + lean, s + 4, 2, 2, skin); }
      head(s + 6);
    }
  }

  else if (pose === 'kneel') {
    // low proposal kneel: back knee + shin flat on the ground, front foot planted
    r(-7, 2, 6, 2, legC);                                // back shin along the ground
    r(-3, 7, 3, 6, legC);                                // back thigh, vertical
    r(2, 7, 2, 6, legC);                                 // front shin
    r(-1, 8, 4, 2, legC);                                // front thigh
    r(2, 2, 4, 2, shoe); r(-8, 3, 3, 2, shoe);
    if (!boy) r(-4, 9, 8, 3, top);
    r(-4, 14, 6, 7, top); r(-4, 14, 1, 7, topD);
    if (armMode === 'hold') { r(0, 12, 8, 2, topD); r(7, 12, 2, 2, skin); }
    else                    { r(0, 12, 2, 5, topD); }
    head(14);
  }
  return Y;
}

/* one looping background pedestrian, flat-toned so the leads stay bright */
const CROWD_DAY  = ['#8a8ca0', '#9a8a7e', '#7e8a9a', '#8f7f8f', '#7a8a80', '#96908a'];
const CROWD_NITE = ['#4a3c50', '#3c4456', '#54424a', '#443c4e'];
function crowdWalker(i, t, y, day) {
  const dir = R(i + 200) > 0.5 ? 1 : -1;
  const sp = 11 + R(i + 90) * 9;
  const period = W + 70;
  let x = ((t * sp + R(i + 31) * period) % period) - 35;
  if (dir < 0) x = W - x;
  const tones = day ? CROWD_DAY : CROWD_NITE;
  person(x, y, {
    who: R(i + 3) > 0.5 ? 'girl' : 'boy', pose: 'walk', f: dir,
    frame: Math.floor(t * 6 + i * 2), sil: tones[Math.floor(R(i + 7) * tones.length)]
  });
}

/* two people embracing — bespoke sprite, boy left facing right, girl right */
function hugPair(x, y, o) {
  o = o || {};
  const sh = o.shade || 0;
  const col = h => sh > 0 ? mix(h, '#171330', sh) : h;
  // boy body
  px(x - 8, y - 14, 3, 12, col(PAL.bPants)); px(x - 9, y - 2, 4, 2, col(PAL.bShoe));
  px(x - 9, y - 23, 7, 9, col(PAL.bShirt));
  // girl body leaning in — tiny against his chest
  px(x + 3, y - 9, 3, 7, col(PAL.skinG)); px(x + 3, y - 2, 4, 2, col(PAL.gShoe));
  px(x + 1, y - 16, 7, 7, col(PAL.gDress));
  px(x + 0, y - 11, 9, 3, col(PAL.gDress));
  // heads together, hers against his neck
  px(x - 8, y - 30, 7, 7, col(PAL.skin));
  px(x - 8, y - 30, 7, 2, col(PAL.bHair)); px(x - 9, y - 30, 2, 5, col(PAL.bHair));
  px(x + 1, y - 23, 7, 7, col(PAL.skinG));
  px(x + 1, y - 23, 7, 2, col(PAL.gHair)); px(x + 7, y - 23, 2, 9, col(PAL.gHair));
  px(x + 1, y - 19, 2, 1, col(PAL.glass));               // a glint of her glasses
  // arms wrapped across
  px(x - 7, y - 15, 12, 2, col(PAL.gDressD));   // girl's arm across boy
  px(x - 4, y - 13, 11, 2, col(PAL.bShirtD));   // boy's arm across girl
  px(x + 6, y - 16, 2, 2, col(PAL.skinG));
  px(x - 6, y - 12, 2, 2, col(PAL.skin));
}

/* scooter, side view facing right; x = center, y = ground */
function scooter(x, y, o) {
  o = o || {};
  const body = o.body || '#c9455f', bodyD = mix(body, '#000000', 0.3), dark = '#20222f', tire = '#161824';
  disc(x - 12, y - 4, 4, tire); disc(x + 12, y - 4, 4, tire);
  disc(x - 12, y - 4, 1, '#565b78'); disc(x + 12, y - 4, 1, '#565b78');
  px(x - 15, y - 9, 10, 3, body);                       // rear cowl
  px(x - 15, y - 9, 10, 1, bodyD);
  px(x - 7, y - 8, 12, 2, dark);                        // floorboard
  px(x + 5, y - 15, 2, 8, body);                        // front column
  px(x + 6, y - 13, 3, 5, bodyD);                       // front shield
  px(x + 3, y - 16, 6, 2, dark);                        // handlebar
  px(x - 14, y - 11, 9, 2, '#2c2f45');                  // seat
  px(x + 8, y - 13, 2, 2, '#ffd57a');                   // headlight
  if (o.light) {
    glow(x + 10, y - 12, 16, '#ffd57a', 0.5);
    g.save(); g.globalCompositeOperation = 'lighter';
    g.fillStyle = 'rgba(255,213,122,0.10)';
    g.beginPath(); g.moveTo(x + 9, y - 13); g.lineTo(x + 58, y - 20); g.lineTo(x + 58, y + 2); g.lineTo(x + 9, y - 10);
    g.closePath(); g.fill(); g.restore();
  }
}
