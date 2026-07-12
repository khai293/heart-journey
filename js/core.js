'use strict';
/* ============================================================
   The Heart Journey — core: film loop, UI, overlay FX
   ============================================================ */

const wrap = document.getElementById('wrap');
const cvs = document.getElementById('px');
const fxc = document.getElementById('fx');
g = cvs.getContext('2d');
const fg = fxc.getContext('2d');
g.imageSmoothingEnabled = false;

/* scene timing */
const STARTS = []; let TOTAL = 0;
for (const s of SCENES) { STARTS.push(TOTAL); TOTAL += s.dur; }
const TITLES = ['Mở màn', 'Bữa ăn đầu tiên', 'Thư viện', 'Những dòng tin nhắn', 'Bình minh bên biển', 'Bữa tối', 'Rạp phim', 'Chuyến đi', 'Cầu hôn', 'Vĩ thanh'];

/* state */
let state = 'menu';            // menu | play | end
let filmT = 0, prevFt = 0, playing = false;
let lastNow = 0, menuT = 0;
let uiTimer = 0;

/* ---------- scaling ---------- */
let vScale = 1;
function resize() {
  const vw = innerWidth, vh = innerHeight;
  vScale = Math.min(vw / W, vh / H);
  const cw = Math.round(W * vScale), ch = Math.round(H * vScale);
  if (cvs.width !== W * PXS) { cvs.width = W * PXS; cvs.height = H * PXS; }
  cvs.style.width = cw + 'px'; cvs.style.height = ch + 'px';
  const dpr = Math.min(devicePixelRatio || 1, 2);
  fxc.width = Math.round(cw * dpr); fxc.height = Math.round(ch * dpr);
  fxc.style.width = cw + 'px'; fxc.style.height = ch + 'px';
  makeVignette();
}
let vigCache = null;
function makeVignette() {
  vigCache = document.createElement('canvas');
  vigCache.width = fxc.width; vigCache.height = fxc.height;
  const c = vigCache.getContext('2d');
  const grd = c.createRadialGradient(
    vigCache.width / 2, vigCache.height / 2, vigCache.height * 0.42,
    vigCache.width / 2, vigCache.height / 2, vigCache.height * 0.85);
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  grd.addColorStop(1, 'rgba(4,2,10,0.42)');
  c.fillStyle = grd; c.fillRect(0, 0, vigCache.width, vigCache.height);
}
/* grain tiles */
const grainTiles = [];
for (let k = 0; k < 3; k++) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const cc = c.getContext('2d'), im = cc.createImageData(128, 128);
  for (let i = 0; i < im.data.length; i += 4) {
    const v = 118 + Math.random() * 137 | 0;
    im.data[i] = v; im.data[i + 1] = v; im.data[i + 2] = v;
    im.data[i + 3] = Math.random() * 26;
  }
  cc.putImageData(im, 0, 0);
  grainTiles.push(c);
}
let frameNo = 0;
function drawOverlay() {
  fg.clearRect(0, 0, fxc.width, fxc.height);
  // dual-pass bloom — a tight halo plus a wide breath of light
  try {
    fg.save();
    fg.globalCompositeOperation = 'lighter';
    fg.imageSmoothingEnabled = true;
    fg.globalAlpha = 0.10;
    fg.filter = 'blur(' + Math.max(1.5, fxc.width / 480) + 'px)';
    fg.drawImage(cvs, 0, 0, fxc.width, fxc.height);
    fg.globalAlpha = 0.10;
    fg.filter = 'blur(' + Math.max(4, fxc.width / 150) + 'px)';
    fg.drawImage(cvs, 0, 0, fxc.width, fxc.height);
    fg.restore();
    fg.filter = 'none';
  } catch (e) {}
  if (vigCache) fg.drawImage(vigCache, 0, 0);
  const tile = grainTiles[frameNo % 3];
  fg.save();
  fg.globalAlpha = 0.35;
  const pat = fg.createPattern(tile, 'repeat');
  fg.translate((frameNo * 37) % 128, (frameNo * 53) % 128);
  fg.fillStyle = pat;
  fg.fillRect(-128, -128, fxc.width + 256, fxc.height + 256);
  fg.restore();
}

/* ---------- film rendering ---------- */
function sceneAt(ft) {
  for (let i = SCENES.length - 1; i >= 0; i--)
    if (ft >= STARTS[i]) return i;
  return 0;
}
function render(ft) {
  g.fillStyle = '#05040a'; g.fillRect(0, 0, W, H);
  const i = sceneAt(ft), sc = SCENES[i], lt = ft - STARTS[i];
  sc.draw(lt);
  // auto fades
  const fi = sc.fi === undefined ? 1.2 : sc.fi;
  const fo = sc.fo === undefined ? 1.4 : sc.fo;
  const aIn = 1 - seg(lt, 0, fi);
  if (aIn > 0.005) flash(sc.fic || '#05040a', aIn);
  const aOut = seg(lt, sc.dur - fo, sc.dur);
  if (aOut > 0.005) flash(sc.foc || '#05040a', aOut);
  drawHUD(ft);
  updateDots(i);
}
function drawHUD(ft) {
  for (let h = 0; h < 5; h++) {
    if (ft >= HEART_ARRIVE[h] && ft < HEART_DEPART[h]) {
      const cell = 1.35 + 0.1 * Math.sin(ft * 3 + h * 1.4);
      heartSpr(hudX(h), HUD_Y, cell, 0.22);
    }
  }
}

/* music cue + one-shot sfx dispatch */
let songVol = 0.85;
function musicFrame(ft) {
  const i = sceneAt(ft), sc = SCENES[i], lt = ft - STARTS[i];
  if (sc.cues && sc.cues.length) {
    let cfg = sc.cues[0][1];
    for (const cu of sc.cues) if (lt >= cu[0]) cfg = cu[1];
    Music.setCfg(cfg);
  }
  if (playing && ft > prevFt && ft - prevFt < 0.5 && sc.sfx) {
    const pl = prevFt - STARTS[i];
    for (const fx2 of sc.sfx) if (fx2[0] > pl && fx2[0] <= lt) Music.sfx(fx2[1]);
  }
  Music.tick(playing);
  // soundtrack volume: hush for the final heartbeat, fade out with the curtains
  let target = 0.85;
  const oT = ft - STARTS[SCENES.length - 1];
  if (oT >= 0) {
    if (oT > 14 && oT < 28.5) target = 0.10;
    else if (oT >= 28.5) target = 0.45 * (1 - lin(oT, 33, 41));
  }
  songVol += (target - songVol) * 0.05;
  Music.syncSongs(ft, playing, songVol);
}

/* ---------- menu / end poster ---------- */
function drawPoster(mt, isEnd) {
  vgrad(0, 0, W, H, [[0, '#12091e'], [0.55, '#241030'], [1, '#0c0714']]);
  stars(70, mt, 160, 0.7);
  glow(192, 96, 120, '#ff4d64', 0.13 + 0.04 * Math.sin(mt * 1.6));
  const beat = 1 + 0.07 * Math.pow(Math.sin(mt * 2.4), 8) + 0.05 * Math.pow(Math.sin(mt * 2.4 + 0.3), 8);
  heartSpr(192, 88, 5.4 * beat, 0.8);
  for (let i = 0; i < 8; i++) {
    const a = mt * 0.5 + i * TAU / 8;
    sparkle(192 + Math.cos(a) * 58, 88 + Math.sin(a) * 34, 1.5, i % 2 ? '#ffe9a0' : '#ffd7de',
      0.35 + 0.4 * Math.sin(mt * 2 + i * 2));
  }
  // the two of them, small, facing one another
  person(160, 196, { who: 'boy', pose: 'stand', f: 1, shade: 0.25 });
  person(224, 196, { who: 'girl', pose: 'stand', f: -1, shade: 0.25 });
  shadow(160, 196, 12); shadow(224, 196, 12);
  petals(mt, 10, { x0: 30, x1: 354, y0: 10, y1: 200 }, 0.45);
  // play / replay triangle
  const pa = 0.55 + 0.35 * Math.sin(mt * 2.2);
  const ty = 140;
  for (let r2 = 0; r2 < 9; r2++) {
    const half = 4.5 - Math.abs(r2 - 4);
    px(188, ty - 4 + r2, 1 + half * 1.6, 1, rgba('#fff6e2', pa));
  }
  glow(192, ty, 18, '#fff6e2', 0.2 * pa);
  dim(0.05);
}

/* ---------- main loop ---------- */
function frame(now) {
  const dt = Math.min((now - lastNow) / 1000, 0.05);
  lastNow = now;
  frameNo++;
  g.setTransform(PXS, 0, 0, PXS, 0, 0);   // draw in logical pixels, render supersampled
  if (state === 'menu' || state === 'end') {
    menuT += dt;
    drawPoster(menuT, state === 'end');
  } else {
    if (playing) { prevFt = filmT; filmT += dt; }
    if (filmT >= TOTAL) {
      filmT = TOTAL - 0.01; playing = false; state = 'end'; menuT = 0;
      wrap.classList.add('menu'); wrap.classList.remove('hidecur');
      Music.setCfg({ bpm: 60, root: 0, prog: [0], layers: {}, amb: {} });
      Music.stopSongs();
    } else {
      render(filmT);
      musicFrame(filmT);
      if (playing) prevFt = filmT;
    }
  }
  drawOverlay();
  requestAnimationFrame(frame);
}

/* ---------- controls ---------- */
function startFilm() {
  Music.init();
  Music.initSongs(['audio/song1.mp3', 'audio/song2.mp3']);
  Music.resume();
  state = 'play'; filmT = 0; prevFt = 0; playing = true;
  songVol = 0.85;
  wrap.classList.remove('menu');
  bumpUI();
}
function setPlaying(p) {
  if (state !== 'play') return;
  playing = p;
  if (p) Music.resume(); else Music.suspend();
  btnPause.innerHTML = p ? ICONS.pause : ICONS.play;
  if (!p) wrap.classList.add('ui');
  bumpUI();
}
function seekTo(ft) {
  if (state === 'end') { state = 'play'; wrap.classList.remove('menu'); }
  filmT = clamp(ft, 0, TOTAL - 0.05); prevFt = filmT;
  if (state === 'play' && !playing) render(filmT);
  bumpUI();
}
window.__seek = s => { if (state !== 'play') startFilm(); seekTo(s); };

function bumpUI() {
  if (state !== 'play') return;
  wrap.classList.add('ui'); wrap.classList.remove('hidecur');
  clearTimeout(uiTimer);
  if (playing) uiTimer = setTimeout(() => {
    wrap.classList.remove('ui');
    if (state === 'play') wrap.classList.add('hidecur');
  }, 2600);
}

/* icons */
const ICONS = {
  play: '<svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 1l10 6-10 6z" fill="#fff"/></svg>',
  pause: '<svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="1" width="4" height="12" fill="#fff"/><rect x="8" y="1" width="4" height="12" fill="#fff"/></svg>',
  vol: '<svg width="15" height="15" viewBox="0 0 15 15"><path d="M1 5h3l4-4v13l-4-4H1z" fill="#fff"/><path d="M10 4c2 1.8 2 5.2 0 7" stroke="#fff" fill="none" stroke-width="1.4"/></svg>',
  volOff: '<svg width="15" height="15" viewBox="0 0 15 15"><path d="M1 5h3l4-4v13l-4-4H1z" fill="#fff"/><path d="M10 5l4 5M14 5l-4 5" stroke="#fff" stroke-width="1.4"/></svg>',
  full: '<svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" stroke="#fff" fill="none" stroke-width="1.6"/></svg>'
};
const btnPause = document.getElementById('bPause');
const btnMute = document.getElementById('bMute');
const btnFull = document.getElementById('bFull');
btnPause.innerHTML = ICONS.pause;
btnMute.innerHTML = ICONS.vol;
btnFull.innerHTML = ICONS.full;

const dotsBox = document.getElementById('dots');
const dots = SCENES.map((s, i) => {
  const d = document.createElement('button');
  d.className = 'dot'; d.title = TITLES[i] || s.name;
  d.addEventListener('click', e => { e.stopPropagation(); seekTo(STARTS[i]); if (state === 'play' && !playing) setPlaying(true); });
  dotsBox.appendChild(d);
  return d;
});
let curDot = -1;
function updateDots(i) {
  if (i === curDot) return;
  curDot = i;
  dots.forEach((d, k) => {
    d.classList.toggle('on', k === i);
    d.classList.toggle('done', k < i);
  });
}

btnPause.addEventListener('click', e => { e.stopPropagation(); setPlaying(!playing); });
btnMute.addEventListener('click', e => {
  e.stopPropagation();
  Music.setMute(!Music.muted);
  btnMute.innerHTML = Music.muted ? ICONS.volOff : ICONS.vol;
});
btnFull.addEventListener('click', e => {
  e.stopPropagation();
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen().catch(() => {});
});
document.getElementById('ui').addEventListener('click', e => e.stopPropagation());

wrap.addEventListener('click', () => {
  if (state === 'menu' || state === 'end') { startFilm(); return; }
  setPlaying(!playing);
});
window.addEventListener('mousemove', bumpUI);
window.addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); state === 'play' ? setPlaying(!playing) : startFilm(); }
  else if (e.key === 'm') btnMute.click();
  else if (e.key === 'f') btnFull.click();
  else if (e.key === 'ArrowRight' && state === 'play') { const i = sceneAt(filmT); seekTo(STARTS[Math.min(i + 1, SCENES.length - 1)]); }
  else if (e.key === 'ArrowLeft' && state === 'play') {
    const i = sceneAt(filmT);
    seekTo(filmT - STARTS[i] > 3 ? STARTS[i] : STARTS[Math.max(i - 1, 0)]);
  }
});
document.addEventListener('visibilitychange', () => { if (document.hidden && playing) setPlaying(false); });
window.addEventListener('resize', resize);

/* favicon: a tiny pixel heart */
(() => {
  const c = document.createElement('canvas'); c.width = 16; c.height = 16;
  const cc = c.getContext('2d');
  cc.fillStyle = '#ff4d64';
  const m = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'];
  for (let r = 0; r < 6; r++) for (let q = 0; q < 7; q++)
    if (m[r][q] === '1') cc.fillRect(1 + q * 2, 2 + r * 2, 2, 2);
  const l = document.createElement('link');
  l.rel = 'icon'; l.href = c.toDataURL();
  document.head.appendChild(l);
})();

resize();
requestAnimationFrame(n => { lastNow = n; requestAnimationFrame(frame); });
