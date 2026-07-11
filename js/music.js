'use strict';
/* ============================================================
   The Heart Journey — procedural score (Web Audio)
   Layers: piano / pluck (guitar) / pad / strings / bass / melody
   The love theme (THEME) returns through chapters and blooms
   at the proposal.  Config is driven per-scene via cues.
   ============================================================ */

const Music = (() => {
  let ctx = null, master = null, comp = null;
  const buses = {};
  let muted = false;

  // soundtrack: two songs play back-to-back, synced to film time;
  // while they play, the procedural instrument layers stay silent
  // (ambience + one-shot SFX remain). Falls back to the procedural
  // score if the files fail to load.
  let songs = null, songMode = false;

  // ambience chain gains
  let humG, wavesG, sizzG;

  // scheduler state
  let cfg = null, cfgKey = '';
  let nextT = 0, step = 0;

  const SCALE = [0, 2, 4, 5, 7, 9, 11];
  const degM = (d, oct, root) =>
    48 + (root || 0) + 12 * (oct || 0) + SCALE[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);
  const F = m => 440 * Math.pow(2, (m - 69) / 12);

  /* love theme — [step]: [scaleDegree, lengthInSteps], loops each 32 8th-steps */
  const THEME = { 0: [4, 3], 3: [2, 1], 4: [1, 2], 6: [0, 2], 8: [1, 3], 11: [2, 1], 12: [4, 4], 16: [7, 3], 19: [5, 1], 20: [4, 2], 22: [5, 2], 24: [1, 6] };
  const THEME_LEN = 32;

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.knee.value = 18; comp.ratio.value = 5;
    comp.attack.value = 0.006; comp.release.value = 0.3;
    master = ctx.createGain(); master.gain.value = 0.55;
    master.connect(comp); comp.connect(ctx.destination);
    for (const n of ['piano', 'pluck', 'pad', 'str', 'bass', 'mel', 'fx', 'amb']) {
      const b = ctx.createGain(); b.gain.value = 0; b.connect(master); buses[n] = b;
    }
    buses.fx.gain.value = 0.85;
    buses.amb.gain.value = 1;
    makeAmbience();
    nextT = ctx.currentTime + 0.1;
  }

  function makeAmbience() {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;

    // projector hum
    const lp1 = ctx.createBiquadFilter(); lp1.type = 'lowpass'; lp1.frequency.value = 110;
    humG = ctx.createGain(); humG.gain.value = 0;
    src.connect(lp1); lp1.connect(humG); humG.connect(buses.amb);

    // ocean waves (slow swelling filtered noise)
    const lp2 = ctx.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 480;
    const inner = ctx.createGain(); inner.gain.value = 0.5;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.4;
    lfo.connect(lfoG); lfoG.connect(inner.gain); lfo.start();
    wavesG = ctx.createGain(); wavesG.gain.value = 0;
    src.connect(lp2); lp2.connect(inner); inner.connect(wavesG); wavesG.connect(buses.amb);

    // hotpot simmer
    const hp = ctx.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 5200; hp.Q.value = 0.6;
    sizzG = ctx.createGain(); sizzG.gain.value = 0;
    src.connect(hp); hp.connect(sizzG); sizzG.connect(buses.amb);

    src.start();
  }

  /* ---------- voices ---------- */
  function osc(type, fq, t0, t1, det) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = fq;
    if (det) o.detune.value = det;
    o.start(t0); o.stop(t1 + 0.05); return o;
  }
  function env(t0, a, d, p, bus) {
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(0, t0);
    gn.gain.linearRampToValueAtTime(Math.max(p, 0.001), t0 + a);
    gn.gain.exponentialRampToValueAtTime(0.0008, t0 + a + d);
    gn.connect(bus); return gn;
  }
  function piano(t0, m, v, bus) {
    const d = 2.4, e = env(t0, 0.006, d, 0.30 * (v || 1), bus || buses.piano);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(3400, t0);
    lp.frequency.exponentialRampToValueAtTime(650, t0 + d);
    lp.connect(e);
    osc('triangle', F(m), t0, t0 + d).connect(lp);
    const g2 = ctx.createGain(); g2.gain.value = 0.22;
    osc('sine', F(m + 12), t0, t0 + d).connect(g2); g2.connect(lp);
    const g3 = ctx.createGain(); g3.gain.value = 0.5;
    osc('sine', F(m), t0, t0 + d, -5).connect(g3); g3.connect(lp);
  }
  function pluck(t0, m, v) {
    const d = 0.7, e = env(t0, 0.003, d, 0.26 * (v || 1), buses.pluck);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
    bp.frequency.value = F(m) * 1.9; bp.Q.value = 1.1; bp.connect(e);
    osc('triangle', F(m), t0, t0 + d).connect(bp);
  }
  function bass(t0, m, v) {
    const d = 1.3, e = env(t0, 0.012, d, 0.34 * (v || 1), buses.bass);
    osc('sine', F(m), t0, t0 + d).connect(e);
  }
  function padChord(t0, dur, ms) {
    for (const m of ms) {
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(0, t0);
      gn.gain.linearRampToValueAtTime(0.045, t0 + Math.min(1.3, dur * 0.4));
      gn.gain.setValueAtTime(0.045, t0 + dur - 0.9);
      gn.gain.linearRampToValueAtTime(0, t0 + dur);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 640;
      lp.connect(gn); gn.connect(buses.pad);
      osc('sawtooth', F(m), t0, t0 + dur, -6).connect(lp);
      osc('sawtooth', F(m), t0, t0 + dur, 7).connect(lp);
    }
  }
  function strN(t0, dur, m, v) {
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(0, t0);
    gn.gain.linearRampToValueAtTime(0.10 * (v || 1), t0 + 0.35);
    gn.gain.setValueAtTime(0.10 * (v || 1), t0 + Math.max(0.4, dur - 0.5));
    gn.gain.linearRampToValueAtTime(0, t0 + dur + 0.4);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200;
    lp.connect(gn); gn.connect(buses.str);
    const o = osc('sawtooth', F(m), t0, t0 + dur + 0.5);
    const o2 = osc('sawtooth', F(m), t0, t0 + dur + 0.5, 8);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 5.1;
    const lg = ctx.createGain(); lg.gain.setValueAtTime(0, t0);
    lg.gain.linearRampToValueAtTime(F(m) * 0.006, t0 + 0.6);
    lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
    lfo.start(t0); lfo.stop(t0 + dur + 0.6);
    o.connect(lp); o2.connect(lp);
  }
  function bell(t0, m, v) {
    const e = env(t0, 0.004, 1.4, 0.16 * (v || 1), buses.fx);
    osc('sine', F(m), t0, t0 + 1.5).connect(e);
    const e2 = env(t0, 0.004, 0.5, 0.05 * (v || 1), buses.fx);
    osc('sine', F(m) * 2.98, t0, t0 + 0.6).connect(e2);
  }
  function thump(t0, v) {
    const e = env(t0, 0.012, 0.30, 0.9 * (v || 1), buses.fx);
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(58, t0);
    o.frequency.exponentialRampToValueAtTime(36, t0 + 0.25);
    o.start(t0); o.stop(t0 + 0.4); o.connect(e);
  }

  /* ---------- SFX (one-shot, triggered by scene cues) ---------- */
  function sfx(name) {
    if (!ctx) return;
    const t = ctx.currentTime + 0.02;
    const rt = (cfg && cfg.root) || 0;
    switch (name) {
      case 'heart':
        bell(t, degM(0, 2, rt), 0.9); bell(t + 0.09, degM(2, 2, rt), 0.8); bell(t + 0.18, degM(4, 2, rt), 1);
        break;
      case 'kiss':
        bell(t, degM(4, 2, rt), 0.7); bell(t + 0.12, degM(7, 2, rt), 0.9);
        break;
      case 'msg':
        bell(t, degM(9, 2, rt), 0.45); bell(t + 0.07, degM(11, 2, rt), 0.35);
        break;
      case 'chime':
        bell(t, degM(4, 2, rt), 0.8); bell(t + 0.35, degM(0, 2, rt), 0.6);
        break;
      case 'crack': {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
        const s = ctx.createBufferSource(); s.buffer = buf;
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 950; bp.Q.value = 0.7;
        const gn = ctx.createGain(); gn.gain.value = 0.5;
        s.connect(bp); bp.connect(gn); gn.connect(buses.fx); s.start(t);
        break;
      }
      case 'ring':
        for (let i = 0; i < 6; i++) bell(t + i * 0.07, degM([0, 2, 4, 7, 9, 11][i], 2, rt), 0.7 + i * 0.06);
        break;
      case 'burst':
        for (let i = 0; i < 5; i++) bell(t + i * 0.05, degM([0, 4, 7, 9, 14][i], 1, rt), 0.9);
        break;
      case 'beat1':
        thump(t, 1); thump(t + 0.30, 0.55);
        break;
      case 'final':
        if (songMode) break;               // the song carries the ending
        piano(t, degM(4, 0, 0), 0.7, buses.fx); piano(t, degM(1, 0, 0), 0.5, buses.fx);
        piano(t + 1.6, degM(0, 0, 0), 0.8, buses.fx); piano(t + 1.6, degM(2, 0, 0), 0.5, buses.fx);
        piano(t + 1.6, degM(4, 0, 0), 0.55, buses.fx); piano(t + 1.62, degM(0, 1, 0), 0.45, buses.fx);
        break;
    }
  }

  /* ---------- songs ---------- */
  let song2Base = null;                 // film time when song 2 took over (fallback when duration is unknown)
  function initSongs(urls) {
    if (songs) return;
    songs = urls.map(u => { const a = new Audio(u); a.preload = 'auto'; a.load(); a.muted = muted; return a; });
    songMode = true;
    for (const a of songs) a.addEventListener('error', () => {
      songMode = false;
      const c = cfg; cfgKey = ''; if (c) setCfg(c);   // re-open the procedural layers
    });
  }
  function syncSongs(filmT, playing, vol) {
    if (!songs || !songMode) return;
    const d0raw = songs[0].duration;
    const d0 = (d0raw && isFinite(d0raw)) ? d0raw : null;
    let idx, want;
    if (d0 !== null) {                  // normal path: hand over at song 1's known end
      idx = filmT < d0 - 0.28 ? 0 : 1;
      want = idx === 0 ? filmT : filmT - d0;
    } else if (songs[0].ended) {        // fallback: chain off the 'ended' flag
      if (song2Base === null) song2Base = filmT;
      idx = 1; want = filmT - song2Base;
    } else { idx = 0; want = filmT; }
    if (idx === 0) song2Base = null;
    if (want < 0) want = 0;
    const a = songs[idx], b = songs[1 - idx];
    if (!b.paused) b.pause();
    a.volume = clamp(vol, 0, 1);
    const dur = (a.duration && isFinite(a.duration)) ? a.duration : null;
    const done = dur !== null && want >= dur - 0.15;
    if (playing && !done) {
      if (Math.abs(a.currentTime - want) > 0.9) { try { a.currentTime = want; } catch (e) {} }
      if (a.paused) a.play().catch(() => {});
    } else if (!a.paused) a.pause();
  }
  function stopSongs() { if (songs) for (const a of songs) a.pause(); }

  /* ---------- config / scheduler ---------- */
  function setCfg(c) {
    const key = JSON.stringify(c) + (songMode ? 'S' : 'P');
    if (key === cfgKey || !ctx) return;
    cfgKey = key; cfg = c;
    const t = ctx.currentTime;
    const L = songMode ? {} : (c.layers || {});
    for (const n of ['piano', 'pluck', 'pad', 'str', 'bass', 'mel'])
      buses[n].gain.setTargetAtTime(L[n] || 0, t, 0.7);
    const A = c.amb || {};
    humG.gain.setTargetAtTime((A.hum || 0) * 0.05, t, 1.2);
    wavesG.gain.setTargetAtTime((A.waves || 0) * 0.16, t, 1.5);
    sizzG.gain.setTargetAtTime((A.sizzle || 0) * 0.02, t, 1.2);
  }

  function schedStep(i, t) {
    const L = cfg.layers || {};
    const pr = cfg.prog || [0];
    const bar = Math.floor(i / 8), s = i % 8;
    const ch = pr[bar % pr.length];
    const rt = cfg.root || 0;
    const tones = [ch, ch + 2, ch + 4, ch + 7];
    const hz = r => (R(i * 1.71 + r) - 0.5) * 0.014;      // humanize

    if (L.bass && s === 0) bass(t, degM(ch, -1, rt), 1);
    if (L.bass && s === 6 && bar % 2 === 1) bass(t, degM(ch + 4, -1, rt), 0.5);

    if (L.piano) {
      if (cfg.pstyle === 'arp') {
        const k = [0, 1, 2, 3, 2, 1, 2, 1][s];
        piano(t + hz(1), degM(tones[k], 0, rt), s === 0 ? 0.9 : 0.45 + R(i) * 0.2);
      } else if (cfg.pstyle === 'min') {
        if (s === 0 && bar % 2 === 0) { piano(t, degM(ch, 0, rt), 0.7); piano(t + 0.03, degM(ch + 4, 0, rt), 0.4); }
      } else { // chords
        if (s === 0) { piano(t, degM(ch, -1, rt), 0.8); piano(t + 0.02, degM(ch + 2, 0, rt), 0.5); piano(t + 0.04, degM(ch + 4, 0, rt), 0.5); }
        if (s === 4) { piano(t + hz(2), degM(ch + 4, -1, rt), 0.4); piano(t + 0.03, degM(ch + 2, 0, rt), 0.3); }
      }
    }
    if (L.pluck) {
      const k = [0, 1, 2, 1, 3, 1, 2, 1][s];
      pluck(t + hz(3), degM(tones[k], 1, rt), 0.5 + R(i + 5) * 0.3);
    }
    if (L.pad && i % 8 === 0) {
      const spb = 60 / cfg.bpm / 2;
      padChord(t, spb * 8 + 0.8, [degM(ch, 0, rt), degM(ch + 2, 0, rt), degM(ch + 4, 0, rt)]);
    }
    if (L.mel) {
      const n = THEME[i % THEME_LEN];
      if (n) {
        const spb = 60 / cfg.bpm / 2;
        const m = degM(n[0], 1, rt);
        piano(t + hz(4), m, 0.85, buses.mel);
        if (L.str) strN(t, n[1] * spb + 0.15, m, 0.9);
      }
    }
  }

  function tick(playing) {
    if (!ctx || !cfg || !playing || ctx.state !== 'running') return;
    const spb = 60 / cfg.bpm / 2;      // seconds per 8th
    if (nextT < ctx.currentTime - 0.2) { nextT = ctx.currentTime + 0.06; }
    while (nextT < ctx.currentTime + 0.35) {
      schedStep(step, nextT);
      step++; nextT += spb;
    }
  }

  return {
    init,
    setCfg,
    sfx,
    tick,
    initSongs, syncSongs, stopSongs,
    resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); },
    suspend() { if (ctx && ctx.state === 'running') ctx.suspend(); },
    setMute(m) {
      muted = m;
      if (ctx) master.gain.setTargetAtTime(m ? 0 : 0.55, ctx.currentTime, 0.1);
      if (songs) for (const a of songs) a.muted = m;
    },
    get muted() { return muted; }
  };
})();
