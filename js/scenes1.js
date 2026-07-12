'use strict';
/* ============================================================
   The Heart Journey — scenes part 1
   intro cinema · ch1 restaurant · ch2 library/kiss · ch3 sea
   Every scene: { name, dur, cues[[t,cfg]], sfx[[t,name]], draw(t) }
   ============================================================ */

const SCENES = [];

/* collected-hearts HUD — absolute film times when each heart lands */
const HEART_ARRIVE = [83.5, 138, 215.6, 259.4, 303.2];
const HEART_DEPART = [364, 364.8, 365.6, 366.4, 367.2];   // finale pickup
const hudX = i => W - 12 - i * 13;
const HUD_Y = 11;

/* ------------------------------------------------------------
   Cinema room (shared: intro + ch5 wide + outro)
   o: {screen 0..1, beam 0..1, lamps 0..1, content(fn), heads}
   Screen rect:
   ------------------------------------------------------------ */
const SCR = { x: 92, y: 32, w: 200, h: 112 };

function cinemaRoom(t, o) {
  o = o || {};
  // walls
  vgrad(0, 0, W, H, [[0, '#100c1c'], [0.65, '#151020'], [1, '#0b0814']]);
  // screen
  const lum = o.screen || 0;
  px(SCR.x - 4, SCR.y - 4, SCR.w + 8, SCR.h + 8, '#060510');
  px(SCR.x - 2, SCR.y - 2, SCR.w + 4, 1, mix('#3a2f18', '#8a6a2c', lum));   // gilded trim
  px(SCR.x - 2, SCR.y + SCR.h + 1, SCR.w + 4, 1, mix('#3a2f18', '#8a6a2c', lum));
  px(SCR.x - 2, SCR.y - 2, 1, SCR.h + 4, mix('#3a2f18', '#8a6a2c', lum));
  px(SCR.x + SCR.w + 1, SCR.y - 2, 1, SCR.h + 4, mix('#3a2f18', '#8a6a2c', lum));
  const flick = 0.92 + 0.08 * Math.sin(t * 11.3) * Math.sin(t * 5.1);
  px(SCR.x, SCR.y, SCR.w, SCR.h, mix('#0e0b18', '#fff3dc', lum * flick));
  if (o.content) o.content(SCR);
  if (lum > 0.05) glow(192, SCR.y + SCR.h / 2, 130, '#ffe9c0', lum * 0.25);
  // projector beam (overhead cone toward screen)
  const bm = o.beam || 0;
  if (bm > 0.01) {
    g.save(); g.globalCompositeOperation = 'lighter';
    const fl2 = 0.8 + 0.2 * Math.sin(t * 13.7);
    for (let i = 0; i < 3; i++) {
      const s = 1 - i * 0.3;
      g.fillStyle = `rgba(255,240,210,${0.045 * bm * fl2 * s})`;
      g.beginPath();
      g.moveTo(192 - 9 * s, 0); g.lineTo(192 + 9 * s, 0);
      g.lineTo(SCR.x + SCR.w * (0.5 + 0.5 * s), SCR.y + 4);
      g.lineTo(SCR.x + SCR.w * (0.5 - 0.5 * s), SCR.y + 4);
      g.closePath(); g.fill();
    }
    g.restore();
    // dust motes in the beam
    for (let i = 0; i < 22; i++) {
      const u = (R(i) + t * 0.02 * (0.5 + R(i + 4))) % 1;
      const spanX = lerp(14, SCR.w * 0.9, u);
      const xx = 192 + (R(i + 9) - 0.5) * spanX + Math.sin(t * 0.7 + i) * 2;
      const yy = lerp(2, SCR.y + 2, u) + Math.sin(t * 0.5 + i * 2) * 2;
      px(xx, yy, 1, 1, rgba('#ffeecb', 0.25 * bm * (0.4 + 0.6 * R(i + 2))));
    }
  }
  // wall lamps
  const lm = o.lamps || 0;
  for (const lx of [26, 358]) {
    px(lx - 2, 84, 4, 8, mix('#241d33', '#ffc477', lm));
    if (lm > 0.02) glow(lx, 88, 22, '#ffb45e', 0.4 * lm);
  }
  // seat rows (far → near); returns nothing, heads drawn between rows by caller
  seatRow(t, 158, 12, 9, 0.0, o, lum);
  seatRow(t, 170, 14, 11, 0.12, o, lum);
  if (o.extras) extraHeads(lum, o.exclude);   // the rest of the audience
  if (o.midDraw) o.midDraw();          // walkers / couple heads live between row1 and row2
  seatRow(t, 186, 17, 13, 0.25, o, lum);
  seatRow(t, 204, 21, 14, 0.4, o, lum);
  // little aisle lights along the steps
  for (const ly of [166, 180, 196]) {
    for (const lx2 of [4, W - 6]) {
      px(lx2, ly, 2, 2, '#c8963f');
      glow(lx2 + 1, ly + 1, 5, '#ffca7a', 0.35);
    }
  }
}
/* scattered audience heads, dim so the couple stays the focus */
function extraHeads(lum, exclude) {
  const rows = [[158, 17], [170, 19], [186, 22], [204, 26]];
  const hair = ['#2c2540', '#382a34', '#253038', '#3a3048', '#30263a'];
  for (let r = 0; r < 4; r++) {
    const ry = rows[r][0], pitch = rows[r][1];
    for (let k = 0; k < Math.ceil(W / pitch); k++) {
      const seed = r * 53 + k * 7;
      if (R(seed) > 0.42) continue;
      const x = 6 + k * pitch + R(seed + 1) * 6;
      if (exclude && r === exclude.row && x > exclude.x0 && x < exclude.x1) continue;
      const bob = R(seed + 3) * 2;
      px(x - 4, ry - 3, 9, 3, mix('#241e34', '#4a4258', lum * 0.5));
      px(x - 3, ry - 9 - bob, 6, 7, mix(hair[Math.floor(R(seed + 2) * 5)], '#5e5670', lum * 0.5));
      if (lum > 0.05) px(x - 3, ry - 9 - bob, 6, 1, rgba('#ffe9c0', lum * 0.3));
    }
  }
}
function seatRow(t, y, w, h, dk, o, lum) {
  const c = mix(mix('#221a31', '#0e0a18', dk), '#4a3c56', lum * 0.35);
  for (let x = -6; x < W + 20; x += w + 4) {
    px(x, y, w, h, c);
    px(x, y, w, 2, mix(c, '#5a4a68', 0.4 + lum * 0.3));
  }
}
/* back-view heads of the couple, sitting; bottomY = seatback top they sit behind */
function coupleHeads(bx, gx, bottomY, o) {
  o = o || {};
  const lum = Math.min(1, (o.lum || 0) + 0.22);          // the leads catch more light
  glow((bx + gx) / 2, bottomY - 8, 22, '#ffcf9a', 0.08 + lum * 0.10);
  const bh = mix('#23253d', '#4d5378', lum), gh = mix('#1a1a22', '#36363e', lum);
  const bs = mix('#3d4152', '#767e94', lum), gd = mix('#242e48', '#3e4c72', lum);
  // boy
  px(bx - 5, bottomY - 3, 10, 3, bs);                    // shoulders
  px(bx - 3, bottomY - 10 - (o.leanB || 0), 7, 8, bh);   // head
  // girl, petite beside him
  px(gx - 5, bottomY - 3, 10, 3, gd);
  px(gx - 3, bottomY - 6 - (o.leanG || 0), 7, 6, gh);
  px(gx - 4, bottomY - 5 - (o.leanG || 0), 2, 5, gh);    // long hair sides
  px(gx + 2, bottomY - 5 - (o.leanG || 0), 2, 5, gh);
  if (lum > 0.05) {                                       // screen rim light
    px(bx - 3, bottomY - 10 - (o.leanB || 0), 7, 1, rgba('#ffe9c0', lum * 0.5));
    px(gx - 3, bottomY - 6 - (o.leanG || 0), 7, 1, rgba('#ffe9c0', lum * 0.5));
  }
  if (o.hands) {                                          // clasped hands on the armrest
    const hx = (bx + gx) / 2;
    px(hx - 2, bottomY - 2, 2, 2, mix('#b98a66', '#f2bd92', lum));
    px(hx, bottomY - 2, 2, 2, mix('#c39a72', '#f7cda6', lum));
  }
}

/* ============================================================
   INTRO — the old cinema wakes up                       (32 s)
   ============================================================ */
SCENES.push({
  name: 'intro', dur: 32, fi: 1.0, fo: 2.2, foc: '#fff6e2',
  cues: [[0, { bpm: 66, root: 0, prog: [0, 3], pstyle: 'min', layers: { pad: 0.5, piano: 0.35 }, amb: { hum: 0.8 } }]],
  sfx: [],
  draw(t) {
    const beam = seg(t, 2, 5);
    const lamps = 0.7 * (1 - seg(t, 20.5, 24));
    const scrLum = 0.10 * beam + 0.9 * seg(t, 24, 28.5);
    const boyX = lerp(330, 183, seg(t, 8, 12.5));
    const girlX = lerp(334, 219, seg(t, 15.5, 20));
    cinemaRoom(t, {
      screen: scrLum, beam, lamps,
      extras: true, exclude: { row: 2, x0: 168, x1: 234 },
      midDraw() {
        // boy walking in, then seated
        if (t >= 8 && t < 12.8) {
          person(boyX, 196, { who: 'boy', pose: 'walk', f: -1, frame: Math.floor(t * 7), shade: 0.82 });
        }
        if (t >= 15.5 && t < 20.4) {
          person(girlX, 196, { who: 'girl', pose: 'walk', f: -1, frame: Math.floor(t * 7), shade: 0.82 });
        }
        const bSeat = t >= 12.8, gSeat = t >= 20.4;
        if (bSeat && gSeat) coupleHeads(183, 219, 186, { lum: scrLum });
        else if (bSeat) coupleHeads(183, -40, 186, { lum: scrLum });
      }
    });
    // white bloom as the film begins
    const wf = seg(t, 28.5, 31.6);
    if (wf > 0) { glow(192, 88, 40 + wf * 260, '#fff6e2', wf * 0.9); flash('#fff6e2', wf * wf); }
  }
});

/* ============================================================
   CH1 — first meal together                            (52 s)
   ============================================================ */
SCENES.push({
  name: 'ch1', dur: 52, fi: 1.4, fic: '#fff6e2',
  cues: [
    [0, { bpm: 88, root: 0, prog: [0, 4, 5, 3], pstyle: 'arp', layers: { piano: 0.8, bass: 0.5, pluck: 0.45 }, amb: {} }],
    [44, { bpm: 88, root: 0, prog: [3, 4, 0, 0], pstyle: 'chords', layers: { piano: 0.6, pad: 0.4, bass: 0.3 }, amb: {} }]
  ],
  sfx: [[3.9, 'chime'], [11.6, 'chime'], [48.9, 'heart']],
  draw(t) {
    if (t < 48.5) drawRestaurant(t);
    else drawCh1Exterior(t);
    flyHeart(lin(t, 48.8, 51.7), 192, 148, 275, 34, hudX(0), HUD_Y);
  }
});

function drawRestaurant(t) {
  const GY = 178;
  // warm plaster walls of a little neighbourhood eatery
  vgrad(0, 0, W, GY, [[0, '#8a5c42'], [0.6, '#75503a'], [1, '#5e402e']]);
  px(0, 0, W, 5, '#4a2e18'); px(0, 5, W, 1, '#3a2314');               // ceiling beam
  // glass window, bright morning outside
  px(296, 38, 62, 74, '#3a2318');
  vgrad(300, 42, 54, 66, [[0, '#9ed4ec'], [0.6, '#cfeaf2'], [1, '#ffe9c0']]);
  disc(310, 52, 4, '#fff3d8'); glow(310, 52, 12, '#fff3d8', 0.5);
  px(318, 60, 2, 1, '#5e708a'); px(322, 59, 2, 1, '#5e708a');
  px(336, 66, 2, 1, '#5e708a'); px(340, 65, 2, 1, '#5e708a');
  px(325, 42, 4, 66, '#3a2318'); px(300, 72, 54, 4, '#3a2318');
  // sunlight spilling in through the window
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = rgba('#fff3d8', 0.10);
  g.beginPath();
  g.moveTo(300, 42); g.lineTo(354, 42); g.lineTo(310, GY); g.lineTo(248, GY);
  g.closePath(); g.fill(); g.restore();
  // shelf with jars and bottles behind the counter
  px(8, 66, 76, 4, '#54331f'); px(8, 96, 76, 4, '#54331f');
  for (let i = 0; i < 9; i++) {
    const bc = ['#b0563a', '#4a7a5a', '#c8963f', '#69502e'][i % 4];
    px(12 + i * 8, 54 + (i % 2), 4, 12, bc);
    px(13 + i * 8, 86, 3, 10, ['#4a7a5a', '#b0563a', '#69502e'][i % 3]);
  }
  px(4, 128, 84, 50, '#4a2c1c'); px(4, 128, 84, 3, '#6b4530');       // counter
  px(8, 116, 12, 12, '#3a3440'); px(10, 112, 8, 4, '#2c2834');       // register
  px(11, 118, 6, 4, '#8ad2f0');
  for (let i = 0; i < 3; i++) px(26, 122 - i * 4, 8, 3, '#ece4d0');  // stacked cups
  px(44, 110, 26, 18, rgba('#bfe4f0', 0.30));                        // glass cake case
  px(44, 110, 26, 1, '#8a94a8'); px(44, 127, 26, 1, '#8a94a8');
  px(48, 120, 7, 6, '#ffd9e2'); px(49, 118, 5, 2, '#ff8aa5');        // little cakes
  px(59, 121, 7, 5, '#e8c87a'); px(60, 119, 5, 2, '#8a5c3a');
  steam(46, 108, t, 31, 4, 18, '#f4e3cc');
  // chalkboard menu
  px(106, 44, 46, 36, '#2a2018'); px(110, 48, 38, 28, '#26312a');
  px(114, 53, 20, 2, rgba('#e8e2c8', 0.7)); px(114, 59, 26, 2, rgba('#e8e2c8', 0.55)); px(114, 65, 16, 2, rgba('#e8e2c8', 0.6));
  // side drapes on the window
  px(294, 38, 5, 74, '#8a4436'); px(296, 38, 1, 74, '#6e3428');
  px(357, 38, 5, 74, '#8a4436'); px(359, 38, 1, 74, '#6e3428');
  // potted plant in the corner
  px(344, GY - 12, 12, 12, '#7a4630');
  px(340, GY - 26, 6, 10, '#3f6b3a'); px(348, GY - 30, 6, 14, '#4a7a44'); px(354, GY - 24, 5, 9, '#3f6b3a');
  // the shop cat, asleep in the sun
  const catBr = Math.sin(t * 1.6) * 0.5;
  px(318, GY - 5 - catBr, 12, 5 + catBr, '#e8a04a');
  px(320, GY - 4, 3, 1, '#c8823a'); px(325, GY - 4, 3, 1, '#c8823a');  // stripes
  px(327, GY - 7 - catBr, 5, 4, '#e8a04a');                            // head
  px(327, GY - 8 - catBr, 1, 2, '#e8a04a'); px(330, GY - 8 - catBr, 1, 2, '#e8a04a'); // ears
  px(314, GY - 3, 4, 2, '#e8a04a'); px(313, GY - 5, 2, 3, '#c8823a');  // curled tail
  // wall pictures and a little shelf
  px(170, 88, 26, 20, '#3a2318'); px(173, 91, 20, 14, '#c98a5a');
  px(176, 98, 6, 4, '#8a4436'); px(185, 94, 5, 5, '#4a7a5a');
  px(232, 82, 20, 24, '#3a2318'); px(235, 85, 14, 18, '#2c3e56');
  moonInFrame(242, 91);
  px(120, 118, 60, 3, '#54331f');
  px(128, 110, 8, 8, '#8a4436'); px(142, 108, 6, 10, '#4a7a5a'); px(156, 112, 9, 6, '#c8963f');
  // hanging lamps (off in the morning, just gently swaying)
  for (let i = 0; i < 3; i++) {
    const lx = 96 + i * 96 + Math.sin(t * 0.7 + i * 2) * 1.5;
    px(lx, 0, 1, 30, '#241812');
    px(lx - 7, 30, 15, 3, '#b07430'); px(lx - 5, 33, 11, 5, '#c98a3a');
    px(lx - 2, 38, 5, 3, '#a8823c');
    glow(lx, 42, 26, '#ffb45e', 0.10);
  }
  // wooden door with a little bell
  const open = pulse(t, 3.5, 4.2, 6.2, 7.2) + pulse(t, 11.2, 11.9, 14.6, 15.6) + pulse(t, 44.5, 45.2, 50, 51);
  px(24, 106, 38, GY - 106, '#3a2318');
  px(28, 110, 30, GY - 110, open > 0.05 ? '#140f1a' : '#54331f');
  if (open > 0.05) px(28 + 24 * (1 - open), 110, Math.max(2, 28 * (1 - open)), GY - 110, '#54331f');
  px(52, 140, 3, 6, '#c8963f');
  px(41, 106, 4, 3, '#c8963f');
  if (open > 0.1) px(42 + Math.sin(t * 20) * 1.5, 109, 2, 2, '#e8b85e');
  // wooden floor
  px(0, GY, W, H - GY, '#4a3228');
  px(0, GY, W, 2, '#5e402e');
  for (let x = 20; x < W; x += 46) px(x, GY, 1, H - GY, '#3e2a22');
  texNoise(0, 0, W, 104, 11, 0.035);                                 // plaster tooth on the walls
  px(0, GY - 3, W, 3, '#3e2a1c');                                    // skirting board
  // soft contact shadows
  shadow(192, GY + 1, 62, 0.13); shadow(150, GY + 1, 16, 0.16); shadow(234, GY + 1, 16, 0.16);
  shadow(310, GY + 1, 30, 0.12);

  // ------- characters -------
  const bob = (a, b) => 1.2 * Math.pow(Math.sin(clamp((t - a) / (b - a), 0, 1) * Math.PI * 6), 2) * pulse(t, a, a + 0.2, b - 0.2, b);
  // girl (always painted before the table so she can pass behind it)
  if (t >= 11.5) {
    if (t < 17.3) {
      person(lerp(44, 234, seg(t, 11.5, 17)), GY - 2, { who: 'girl', pose: 'walk', f: 1, frame: Math.floor(t * 7) });
    } else if (t < 44.7) {
      const look = pulse(t, 23, 23.6, 25, 25.8);
      person(234, GY, {
        who: 'girl', pose: 'sit', f: -1, seat: 4,
        arm: (t > 18.6 && t < 19.9) ? 'up' : (t > 31 && Math.floor(t * 0.9) % 2 === 0 ? 'hold' : 'lap'),
        headDy: -look, blush: pulse(t, 19, 21, 26, 28) * 0.9 + (t > 31 ? 0.35 : 0),
        bob: bob(37, 39) + bob(40.5, 43)
      });
    } else {
      person(lerp(234, 56, seg(t, 44.7, 48.4)), GY - 2, { who: 'girl', pose: 'walk', f: -1, frame: Math.floor(t * 7) });
    }
  }
  // waiter silhouette
  if (t >= 27 && t < 34) {
    const wx = t < 29.5 ? lerp(330, 254, seg(t, 27, 29.5)) : (t < 31 ? 254 : lerp(254, 330, seg(t, 31, 33.5)));
    const walking = t < 29.5 || t > 31;
    person(wx, GY - 6, { who: 'boy', pose: walking ? 'walk' : 'stand', f: t < 30 ? -1 : 1, frame: Math.floor(t * 7), sil: '#2a1e22' });
    if (t < 30.4) px(wx - 8, GY - 6 - 26, 14, 2, '#3a2c30');           // tray
  }
  // a quiet regular at his own low table, lost in a book
  stool(296, GY);
  person(296, GY, { who: 'boy', pose: 'sit', f: 1, seat: 4, arm: 'hold', sil: '#6a5a50' });
  px(304, GY - 20, 7, 9, '#8a8274');                                   // book
  px(305, GY - 18, 5, 1, '#6a6458'); px(305, GY - 15, 5, 1, '#6a6458');
  px(300, GY - 9, 24, 3, '#6b4530'); px(304, GY - 6, 3, 6, '#54331f'); px(316, GY - 6, 3, 6, '#54331f');
  px(310, GY - 12, 5, 3, '#c9b98a');                                   // his tea
  // low wooden stools for the two of them
  stool(148, GY); stool(234, GY);
  // boy
  if (t >= 4) {
    if (t < 9) {
      person(lerp(44, 150, seg(t, 4, 8.8)), GY - 2, { who: 'boy', pose: 'walk', f: 1, frame: Math.floor(t * 7) });
    } else if (t < 44.7) {
      const look = pulse(t, 20, 20.6, 22, 22.8);
      person(150, GY, {
        who: 'boy', pose: 'sit', f: 1, seat: 4,
        arm: (t > 18 && t < 19.3) ? 'up' : (t > 31 && Math.floor(t * 0.9) % 2 === 1 ? 'hold' : 'lap'),
        headDy: -look, blush: pulse(t, 24, 26, 27, 29) * 0.8 + (t > 31 ? 0.3 : 0),
        bob: bob(34, 36) + bob(40.5, 43)
      });
    } else {
      person(lerp(150, 40, seg(t, 44.7, 48.4)), GY - 2, { who: 'boy', pose: 'walk', f: -1, frame: Math.floor(t * 7) });
    }
  }
  // chabudai — low wooden table
  px(162, GY - 10, 60, 3, '#6b4530'); px(162, GY - 10, 60, 1, '#8a5c3a');
  px(167, GY - 7, 3, 7, '#54331f'); px(214, GY - 7, 3, 7, '#54331f');
  if (t >= 30.2 && t < 45) {
    bowl(178, GY - 12); bowl(206, GY - 12);
    steam(179, GY - 16, t, 7, 4, 8, '#fff3dc'); steam(207, GY - 16, t, 13, 4, 8, '#fff3dc');
    px(189, GY - 15, 7, 5, '#4a6e5a'); px(190, GY - 16, 4, 1, '#4a6e5a');  // teapot
    px(196, GY - 14, 2, 2, '#4a6e5a');
    px(171, GY - 13, 3, 3, '#ece4d0'); px(212, GY - 13, 3, 3, '#ece4d0');  // tea cups
    px(170, GY - 15, 1, 5, '#c8963f'); px(172, GY - 15, 1, 5, '#c8963f');  // chopsticks
  }
  // emotes
  if (t > 18 && t < 20) { note(158, GY - 38, '#ffd98a', pulse(t, 18, 18.4, 19.4, 20)); }
  if (t > 34 && t < 36.4) note(156 + (t - 34) * 3, GY - 40 - (t - 34) * 5, '#ffd98a', pulse(t, 34, 34.4, 35.6, 36.4));
  if (t > 37 && t < 39.4) note(240 - (t - 37) * 3, GY - 40 - (t - 37) * 5, '#ff9dab', pulse(t, 37, 37.4, 38.6, 39.4));
  if (t > 40.5 && t < 43) {
    note(160 + (t - 40.5) * 4, GY - 42 - (t - 40.5) * 6, '#ffd98a', pulse(t, 40.5, 41, 42.2, 43));
    note(230 - (t - 40.5) * 4, GY - 44 - (t - 40.5) * 6, '#ff9dab', pulse(t, 40.8, 41.3, 42.4, 43));
  }
}
function stool(x, gy) {   // low wooden stool
  px(x - 7, gy - 5, 14, 2, '#8a5c3a'); px(x - 7, gy - 5, 14, 1, '#a0703c');
  px(x - 6, gy - 3, 2, 3, '#5c3a20'); px(x + 4, gy - 3, 2, 3, '#5c3a20');
}
function moonInFrame(x, y) { px(x, y, 4, 4, '#f7ecd0'); px(x - 4, y + 6, 12, 1, '#4a5e7a'); }
function chairSide(x, gy, f) {
  px(x - 7 * f - (f > 0 ? 0 : 0) - 7, gy - 10, 14, 3, '#5c3a20');
  px(x - 8 * f - 1, gy - 26, 3, 16, '#5c3a20');
  px(x - 6, gy - 7, 2, 7, '#4a2e18'); px(x + 4, gy - 7, 2, 7, '#4a2e18');
}
function bowl(x, y) {
  px(x - 6, y - 3, 12, 4, '#e8e2d2'); px(x - 5, y - 4, 10, 1, '#c9b98a');
  px(x - 4, y - 4, 8, 1, '#d8893f');
}
function drawCh1Exterior(t) {
  vgrad(0, 0, W, 150, [[0, '#6ab0d8'], [0.6, '#b8e0ea'], [1, '#ffe9c0']]);
  disc(316, 42, 8, '#fff3d8'); glow(316, 42, 40, '#fff3d8', 0.55);
  // soft morning clouds
  for (let i = 0; i < 4; i++) {
    const cx = ((R(i) * W + t * 2) % (W + 90)) - 45, cy = 26 + R(i + 8) * 44;
    px(cx, cy, 38 + R(i) * 22, 4, rgba('#ffffff', 0.6));
    px(cx + 8, cy - 3, 24 + R(i + 2) * 14, 3, rgba('#ffffff', 0.5));
  }
  px(268, 60, 2, 1, '#4a5e7a'); px(272, 59, 2, 1, '#4a5e7a');           // birds
  px(84, 44, 2, 1, '#4a5e7a'); px(88, 43, 2, 1, '#4a5e7a');
  // rooftops in daylight
  for (let i = 0; i < 10; i++) {
    const bx = i * 42 - 10, bh = 40 + R(i) * 46;
    px(bx, 150 - bh, 40, bh + 10, mix('#8a94b8', '#a8b2cc', R(i + 2)));
    px(bx, 150 - bh, 40, 3, '#c8d2e4');
    for (let wI = 0; wI < 4; wI++)
      if (R(i * 7 + wI) > 0.45) px(bx + 5 + wI * 9, 158 - bh + R(i + wI) * (bh - 22), 3, 4, rgba('#4e5878', 0.7));
  }
  px(0, 158, W, 58, '#6a7288');
  px(0, 158, W, 2, '#8a92a8');
  // morning passers-by, and the little restaurant
  crowdWalker(1, t, 176, true); crowdWalker(2, t, 178, true); crowdWalker(3, t, 177, true);
  px(150, 118, 84, 42, '#a88a6a');
  px(150, 112, 84, 8, '#c05848'); px(150, 112, 84, 2, '#d86a58');
  px(162, 132, 16, 22, '#d8ecf2'); px(206, 132, 16, 22, '#d8ecf2');
  px(163, 133, 6, 8, '#f4fbff');
  px(186, 130, 12, 28, '#54331f'); px(188, 132, 8, 24, '#7a5a3a');
  px(168, 120, 48, 6, '#f4ead0');
  // noren over the door + paper lanterns
  px(182, 130, 20, 8, '#2e4a6e'); px(191, 130, 2, 8, '#243a58');
  px(166, 126, 6, 9, '#c04a3a'); px(167, 125, 4, 1, '#8c2830'); px(167, 130, 4, 1, '#8c2830');
  px(212, 126, 6, 9, '#c04a3a'); px(213, 125, 4, 1, '#8c2830'); px(213, 130, 4, 1, '#8c2830');
  heartSpr(192, 123, 1, 0);
}

/* ============================================================
   CH2 — library afternoon → sunset kiss                (58 s)
   ============================================================ */
SCENES.push({
  name: 'ch2', dur: 58,
  cues: [
    [0, { bpm: 76, root: 5, prog: [0, 3, 5, 4], pstyle: 'chords', layers: { piano: 0.7, pad: 0.4, mel: 0.65 }, amb: {} }],
    [30, { bpm: 72, root: 5, prog: [0, 4, 5, 3], pstyle: 'chords', layers: { piano: 0.6, pad: 0.45, str: 0.4, mel: 0.55 }, amb: {} }],
    [42, { bpm: 66, root: 5, prog: [3, 4], pstyle: 'min', layers: { piano: 0.45, pad: 0.4 }, amb: {} }],
    [49, { bpm: 70, root: 5, prog: [0, 5, 3, 4], pstyle: 'chords', layers: { piano: 0.7, pad: 0.5, str: 0.55, mel: 0.7 }, amb: {} }]
  ],
  sfx: [[14, 'kiss'], [26.2, 'chime'], [41.6, 'chime'], [44.9, 'kiss'], [51.2, 'heart']],
  draw(t) {
    if (t < 30) drawLibrary(t);
    else drawSunsetStreet(t);
    flyHeart(lin(t, 51, 54.5), 234, 132, 292, 26, hudX(1), HUD_Y);
  }
});

function drawLibrary(t) {
  const GY = 170;
  const warm = 0.12 + 0.1 * lin(t, 0, 28);                       // gentle morning gold
  // school walls: warm yellow above a painted green dado
  vgrad(0, 0, W, GY, [[0, mix('#e0cfa0', '#e8d4a2', warm)], [1, mix('#c9b884', '#d0bc86', warm)]]);
  px(0, 146, W, 2, '#7a8a68');
  px(0, 148, W, GY - 148, '#a8b892');
  px(0, GY, W, H - GY, '#8a7a5e');                               // worn wooden floor
  px(0, GY, W, 2, '#a8946e');
  for (let x = 16; x < W; x += 52) px(x, GY, 1, H - GY, '#75664c');
  // fluorescent bars on the ceiling
  for (const fx of [96, 292]) {
    px(fx - 24, 6, 48, 3, '#e8ecf0'); px(fx - 24, 9, 48, 1, '#b8c4cc');
    glow(fx, 9, 26, '#f4f8ff', 0.14);
  }
  // ceiling fan, lazily turning
  px(145, 8, 3, 6, '#4a4438'); disc(146, 16, 3, '#5e5648');
  for (let b = 0; b < 3; b++) {
    const a = t * 2.2 + b * TAU / 3;
    const bw = Math.abs(Math.cos(a)) * 13 + 2;
    px(146 + Math.cos(a) * bw - 1, 15 + Math.sin(a) * 3, Math.max(2, bw * 0.8), 2, '#6a6250');
  }
  // wall clock reading a school morning
  disc(240, 18, 8, '#ece4d0'); disc(240, 18, 8.5, rgba('#4a4438', 0.25));
  px(232, 10, 17, 1, '#4a4438'); px(232, 26, 17, 1, '#4a4438');
  px(232, 10, 1, 17, '#4a4438'); px(248, 10, 1, 17, '#4a4438');
  px(235, 17, 5, 2, '#4a4438');                                  // hour hand → 9
  px(239, 12, 2, 6, '#4a4438');                                  // minute hand → 12
  // PA speaker box
  px(348, 8, 18, 12, '#5e5648'); px(351, 11, 12, 6, '#3e3a30');
  // bookshelves
  for (const sx of [8, 100, 205]) bookshelf(sx, 40, 66, t);
  // cork bulletin board with pinned notes
  px(306, 42, 62, 52, '#8a6a42'); px(310, 46, 54, 44, '#c9a86a');
  for (let i = 0; i < 6; i++) {
    const nx = 314 + (i % 3) * 17, ny = 50 + Math.floor(i / 3) * 20;
    px(nx, ny, 12, 14, ['#ece4d0', '#bfe4f0', '#ffd9e2', '#d8ecc0', '#ffedbe', '#ece4d0'][i]);
    px(nx + 5, ny - 1, 2, 2, '#c04a3a');
    px(nx + 2, ny + 4, 8, 1, rgba('#6a6458', 0.6)); px(nx + 2, ny + 7, 6, 1, rgba('#6a6458', 0.5));
  }
  // class timetable poster below
  px(314, 100, 44, 32, '#ece4d0'); px(314, 100, 44, 4, '#4a7a8a');
  for (let r = 1; r < 4; r++) px(314, 100 + 4 + r * 7, 44, 1, rgba('#6a6458', 0.5));
  for (let c = 1; c < 4; c++) px(314 + c * 11, 104, 1, 28, rgba('#6a6458', 0.5));
  // windows + shafts
  for (const wx of [62, 167, 272]) {
    px(wx - 3, 23, 40, 88, '#4a7a8a');
    vgrad(wx, 26, 34, 82, [[0, mix('#bfe4f0', '#cfeaf4', warm)], [1, mix('#ffedbe', '#ffe4a8', warm)]]);
    px(wx + 15, 26, 4, 82, '#4a7a8a'); px(wx, 62, 34, 4, '#4a7a8a');
    // light shaft
    g.save(); g.globalCompositeOperation = 'lighter';
    g.fillStyle = rgba(warm > 0.5 ? '#ffb46a' : '#ffe4b0', 0.11);
    const sk = 26 + warm * 16;
    g.beginPath();
    g.moveTo(wx, 26); g.lineTo(wx + 34, 26);
    g.lineTo(wx + 34 - sk, GY); g.lineTo(wx - sk, GY);
    g.closePath(); g.fill(); g.restore();
    // motes
    for (let i = 0; i < 6; i++) {
      const u = (R(i + wx) + t * 0.03) % 1;
      px(wx + 17 - u * (26 + warm * 16) + Math.sin(t + i) * 3, 30 + u * (GY - 34), 1, 1, rgba('#ffe9c8', 0.35));
    }
  }
  // a soft rug under the reading table
  px(112, GY + 3, 168, 11, '#4a5e7a'); px(114, GY + 4, 164, 9, '#54688a');
  for (let k = 0; k < 8; k++) px(122 + k * 20, GY + 8, 8, 1, rgba('#8a9ec0', 0.6));
  // a potted fern on the middle window sill
  px(178, 102, 10, 6, '#7a4630'); px(176, 96, 5, 6, '#4a7a44'); px(183, 94, 5, 8, '#3f6b3a');
  // classmates sharing the long table, heads down in revision
  chairSide(128, GY, 1); chairSide(252, GY, -1);
  person(132, GY, { who: 'boy', pose: 'sit', f: 1, seat: 7, arm: 'hold', sil: '#8a8ca0' });
  person(248, GY, { who: 'girl', pose: 'sit', f: -1, seat: 7, arm: 'hold', sil: '#9a8a7e' });
  // long table + chairs — the two of them side by side, shoulder to shoulder
  chairSide(170, GY, 1); chairSide(187, GY, 1);
  const lean = seg(t, 12, 14) * (1 - seg(t, 17, 19));
  const up = seg(t, 27, 28.5);                                    // standing up at the end
  if (up < 0.5) {
    person(174, GY, { who: 'boy', pose: 'sit', f: 1, seat: 7, arm: 'hold', blush: lean * 0.6, headDx: 1 * lean });
    person(190, GY, { who: 'girl', pose: 'sit', f: 1, seat: 7, arm: 'hold', headDx: -2.5 * lean, headDy: -lean, blush: lean * 0.9 });
  } else {
    person(176, GY, { who: 'boy', pose: 'stand', f: 1 });
    person(190, GY, { who: 'girl', pose: 'stand', f: 1 });
  }
  // schoolbags waiting by the chairs
  px(156, GY - 10, 9, 10, '#3f5e7a'); px(158, GY - 8, 5, 4, '#2e4a62'); px(157, GY - 11, 7, 2, '#2e4a62');
  px(208, GY - 9, 9, 9, '#c05f7a'); px(210, GY - 7, 5, 4, '#a04862'); px(209, GY - 10, 7, 2, '#a04862');
  px(120, GY - 13, 150, 4, '#7a5230'); px(120, GY - 13, 150, 1, '#a0703c');
  px(126, GY - 9, 4, 9, '#54371e'); px(258, GY - 9, 4, 9, '#54371e');
  // one shared book between them, notebooks, a pencil
  book(190, GY - 15, t, 0);
  book(140, GY - 15, t, 2); book(242, GY - 15, t, 8);
  px(206, GY - 15, 6, 2, '#bfe4f0'); px(213, GY - 15, 4, 1, '#eac84e');
  // globe at the table's end
  px(256, GY - 17, 5, 2, '#54371e'); px(258, GY - 19, 1, 2, '#54371e');
  disc(258, GY - 22, 4, '#4a8ac0'); px(256, GY - 24, 3, 2, '#4a8a5a'); px(259, GY - 21, 3, 2, '#4a8a5a');
  // a green banker's lamp keeps them company
  px(228, GY - 16, 8, 2, '#8c6a2c'); px(231, GY - 19, 2, 3, '#8c6a2c');
  px(226, GY - 22, 12, 3, '#2e6a4a'); px(226, GY - 20, 12, 1, '#245a3c');
  glow(232, GY - 19, 12, '#d8ffb0', 0.22);
  // page-flip glints on the shared book
  for (const ft of [6.5, 9.2, 13, 17.5, 21]) if (Math.abs(t - ft) < 0.25) px(187, GY - 18, 6, 2, rgba('#ffffff', 0.8));
  if (t > 13.5 && t < 16) note(184, GY - 44 - (t - 13.5) * 4, '#ff9dab', pulse(t, 13.5, 14, 15.2, 16));
  // stack of books on table
  px(140, GY - 16, 12, 3, '#8a4436'); px(142, GY - 19, 10, 3, '#3f5e7a'); px(141, GY - 21, 9, 2, '#8a7a3c');
  // another reader deep in the stacks
  person(84, GY, { who: 'girl', pose: 'stand', f: 1, sil: '#7a7488' });
  px(88, GY - 20, 5, 7, '#8a8274');
}
function bookshelf(x, y, w, t) {
  px(x - 2, y - 4, w + 4, 106, '#3a281c');
  for (let r = 0; r < 6; r++) {
    px(x, y + r * 17, w, 2, '#54371e');
    for (let b = 0; b < w / 5 - 1; b++) {
      const i = x * 7 + r * 31 + b;
      const c = ['#8a4436', '#3f5e7a', '#8a7a3c', '#5e3f7a', '#4a7a5a', '#a0703c'][Math.floor(R(i) * 6)];
      px(x + 2 + b * 5, y + 4 + r * 17 - R(i + 1) * 2, 4, 11 + R(i + 1) * 2, c);
    }
  }
}
function book(x, y, t, ph) {
  px(x - 6, y, 6, 3, '#f2ead2'); px(x, y, 6, 3, '#fffbe8');
  px(x - 6, y + 2, 12, 1, '#c9b98a');
  px(x - 4, y + 1, 3, 1, '#b0a888'); px(x + 1, y + 1, 3, 1, '#b0a888');
}

function drawSunsetStreet(t) {
  const GY = 176;
  const ph = lin(t, 30, 56);                                       // morning brightens
  vgrad(0, 0, W, 150, [
    [0, mix('#6ab0d8', '#8ac4e0', ph)],
    [0.5, mix('#b8e0ea', '#cfeaf2', ph)],
    [1, mix('#ffe4b0', '#fff3d8', ph)]
  ]);
  const sun = { x: 96, y: 86 - ph * 16 };
  glow(sun.x, sun.y, 42, '#fff3d8', 0.55);
  disc(sun.x, sun.y, 8, '#fff6e2');
  // clouds and birds
  for (let i = 0; i < 3; i++) {
    const cx = ((R(i + 12) * W + t * 2.4) % (W + 90)) - 45, cy = 24 + R(i + 5) * 40;
    px(cx, cy, 36 + R(i) * 20, 4, rgba('#ffffff', 0.6));
    px(cx + 7, cy - 3, 22 + R(i + 2) * 12, 3, rgba('#ffffff', 0.5));
  }
  for (let i = 0; i < 3; i++) {
    const gx2 = W - ((t * (8 + i * 2) + i * 130) % (W + 60)) + 30;
    const gy2 = 34 + R(i + 30) * 26 + Math.sin(t * 2 + i * 2) * 2;
    px(gx2, gy2, 2, 1, '#4a5e7a'); px(gx2 + 3, gy2, 2, 1, '#4a5e7a');
  }
  // skyline in daylight
  for (let i = 0; i < 11; i++) {
    const bx = i * 38 - 8, bh = 34 + R(i + 20) * 40;
    px(bx, 150 - bh, 36, bh, mix('#8a94b8', '#a4aec8', R(i + 3)));
    px(bx, 150 - bh, 36, 2, '#c8d2e4');
    for (let wI = 0; wI < 3; wI++)
      if (R(i * 9 + wI) > 0.5) px(bx + 6 + wI * 10, 156 - bh + R(i + wI + 4) * (bh - 20), 3, 3, rgba('#525c7e', 0.6));
  }
  // street trees peeking over the hedge
  for (const tx of [58, 148]) {
    disc(tx, 136, 15, '#5e8a52'); disc(tx - 4, 130, 9, '#74a266');
    px(tx + 3, 128, 2, 1, '#8ab87a');
  }
  px(0, 150, W, 26, '#7a9a6a');                                    // hedge in the sun
  px(0, 150, W, 2, '#9ab884');
  px(0, GY, W, H - GY, '#8a8ea8');                                 // pavement
  px(0, GY, W, 2, '#a8acc0');
  // a rain puddle still holding a piece of the sky
  px(52, GY + 9, 30, 4, '#b8dce8'); px(56, GY + 8, 20, 1, '#cfeaf2');
  px(60, GY + 10, 6, 1, '#fff6e2');
  // bicycles at the rack
  px(178, GY - 14, 2, 14, '#5e6878'); px(206, GY - 14, 2, 14, '#5e6878');
  px(178, GY - 14, 30, 2, '#5e6878');
  bikeSpr(186, GY, '#4a7ac0', '#8a8ea8'); bikeSpr(200, GY, '#c05f7a', '#8a8ea8');
  // pigeons pecking at crumbs
  pigeon(96, GY + 7, t, 0); pigeon(112, GY + 10, t, 1); pigeon(330, GY + 8, t, 2);
  petals(t, 7, { x0: 0, x1: W, y0: 60, y1: 168 }, 0.45);
  // ---- the parking lot ----
  // painted bay lines
  for (let k = 0; k < 5; k++) px(248 + k * 30, GY + 2, 2, 12, rgba('#e8e8f0', 0.7));
  // parking sign: a little bicycle glyph
  px(210, 118, 3, GY - 118, '#3c4256');
  px(202, 106, 19, 16, '#2e5a9e'); px(204, 108, 15, 12, '#4a7ac0');
  disc(208, 116, 2, '#f0f4f8'); disc(215, 116, 2, '#f0f4f8'); px(209, 112, 5, 1, '#f0f4f8'); px(211, 113, 1, 3, '#f0f4f8');
  // attendant's booth, someone half-asleep inside
  px(346, 118, 34, GY - 118, '#8a7a5e'); px(344, 114, 38, 6, '#6a5a42');
  px(352, 128, 22, 16, '#2c3040');
  px(358, 133, 8, 8, '#8a8ca0'); px(358, 133, 8, 3, '#3a3440');
  px(346, 152, 34, 2, '#6a5a42');
  // other bikes sleeping in their bays
  shadow(282, GY + 1, 28, 0.14); shadow(312, GY + 1, 28, 0.14); shadow(340, GY + 1, 28, 0.14);
  scooter(282, GY, { body: '#6a7a9e' });
  scooter(312, GY, { body: '#5e8a7a' });
  scooter(340, GY, { body: '#8a8ca0' });
  // a couple of passers-by
  for (let i = 0; i < 3; i++) crowdWalker(i + 10, t, GY - 1 + (i % 2), true);

  // ------- couple choreography: goodbye at his scooter -------
  const wf = Math.floor(t * 7);
  const rideOff = seg(t, 51.5, 56);
  const bikeX = 254 + Math.pow(rideOff, 1.4) * 180;
  // his red scooter, parked — then leaving
  if (t < 48.5) { shadow(254, GY + 1, 28, 0.16); scooter(254, GY, {}); }
  else { shadow(bikeX, GY + 1, 28, 0.16 * (1 - rideOff)); scooter(bikeX, GY - Math.sin(t * 9) * 0.5 * rideOff, { light: false }); }
  if (t < 37.6) {                                                  // walking in together
    const cx = lerp(46, 226, seg(t, 30.2, 37.2));
    const walking = t < 37.2;
    shadow(cx + 6, GY + 1, 11, 0.13); shadow(cx - 8, GY + 1, 12, 0.13);
    person(cx + 6, GY, { who: 'girl', pose: walking ? 'walk' : 'stand', f: 1, frame: wf + 2 });
    person(cx - 8, GY, { who: 'boy', pose: walking ? 'walk' : 'stand', f: 1, frame: wf });
  } else {
    // he goes to his bike, hand on the bars... then comes back for one more thing
    let bx = 218, bf = 1, bWalk = false, bArm = 'down';
    if (t < 40) { bx = lerp(218, 246, seg(t, 38, 39.8)); bWalk = t < 39.8; }
    else if (t < 42.2) { bx = 246; bArm = 'hold'; bf = t > 41.6 ? -1 : 1; }         // about to mount — hesitates
    else if (t < 44) { bx = lerp(246, 238, seg(t, 42.2, 43.8)); bWalk = true; bf = -1; }
    else if (t < 47) { bx = 238; bf = -1; }
    else if (t < 48.5) { bx = lerp(238, 250, seg(t, 47, 48.4)); bWalk = true; bf = 1; }
    const kiss = pulse(t, 44.3, 44.8, 45.6, 46.2);
    const startle = pulse(t, 45.8, 46, 46.8, 47.4);
    // she sees him off
    shadow(232, GY + 1, 11, 0.13);
    if (t < 48.5) shadow(bx, GY + 1, 12, 0.13);
    person(232, GY, {
      who: 'girl', pose: 'stand', f: 1, frame: wf + 2,
      arm: (t > 49 && t < 55) ? 'up' : 'down',
      blush: seg(t, 44.5, 45.8), bob: startle * 2 + pulse(t, 49.5, 49.7, 50.2, 50.6),
      headDy: startle * -1
    });
    if (t < 48.5) {
      person(bx, GY, {
        who: 'boy', pose: bWalk ? 'walk' : 'stand', f: bf, frame: wf, arm: bArm,
        headDx: 2 * kiss, headDy: -3 * kiss, blush: seg(t, 44, 45) * 0.7
      });
    } else {
      person(bikeX - 6, GY - 1, {
        who: 'boy', pose: 'ride', f: 1, seat: 11, footH: 7,
        arm: (t > 49.3 && t < 50.6) ? 'up' : 'hold', blush: 0.5
      });
    }
    if (kiss > 0.2) {                                              // little pink puff at her cheek
      px(235, GY - 15, 2, 2, rgba('#ff9dab', kiss));
      px(238, GY - 18, 1, 1, rgba('#ffb3c4', kiss));
      px(233, GY - 19, 1, 1, rgba('#ffb3c4', kiss * 0.8));
    }
    if (t > 41.6 && t < 42.5) sparkle(250, GY - 32, 2, '#ffe9c8', pulse(t, 41.6, 41.8, 42.2, 42.5));
    if (startle > 0.3) sparkle(230, GY - 26, 2.5, '#ff9dab', startle);
    if (rideOff > 0 && rideOff < 1) {                              // puffs of dust behind the bike
      for (let i = 0; i < 3; i++) {
        const du = (t * 2 + i * 0.4) % 1;
        px(bikeX - 20 - du * 10, GY - 2 - du * 3, 2, 2, rgba('#c8c2d8', (1 - du) * 0.5 * rideOff));
      }
    }
    if (t > 49 && t < 51.5) {
      note(226, GY - 30 - (t - 49) * 4, '#ff9dab', pulse(t, 49, 49.4, 50.6, 51.5));
      note(244, GY - 34 - (t - 49) * 4, '#ffd98a', pulse(t, 49.3, 49.7, 50.8, 51.5));
    }
  }
}

/* ============================================================
   CHAT — texting all the time, from home to work       (40 s)
   ============================================================ */
SCENES.push({
  name: 'chat', dur: 40,
  cues: [
    [0, { bpm: 80, root: 0, prog: [0, 5, 3, 4], pstyle: 'min', layers: { piano: 0.5, pad: 0.35 }, amb: {} }],
    [16.5, { bpm: 92, root: 0, prog: [0, 4, 5, 3], pstyle: 'arp', layers: { piano: 0.6, pluck: 0.45, bass: 0.4 }, amb: {} }]
  ],
  sfx: [[3, 'msg'], [5.2, 'msg'], [7.5, 'msg'], [9.7, 'msg'], [12, 'msg'], [14, 'msg'],
        [21, 'msg'], [25, 'msg'], [31.5, 'msg'], [33.5, 'msg']],
  draw(t) {
    if (t < 16.5) drawChatSplit(t);
    else drawChatOffice(t - 16.5);
  }
});

function chatBubble(x, y, fromLeft, kind, a) {
  if (a <= 0) return;
  const bgC = fromLeft ? '#f0f4f8' : '#ffd7de';
  px(x - 9, y - 6, 18, 12, rgba(mix(bgC, '#000000', 0.3), a));
  px(x - 8, y - 5, 16, 10, rgba(bgC, a));
  if (fromLeft) px(x - 10, y + 4, 3, 3, rgba(bgC, a));
  else px(x + 7, y + 4, 3, 3, rgba(bgC, a));
  if (kind === 'dots') { for (let i = 0; i < 3; i++) px(x - 5 + i * 4, y - 1, 2, 2, rgba('#8a8ca0', a)); }
  else if (kind === 'note') note(x - 2, y + 1, '#6a7a9e', a);
  else if (a > 0.4) heartSpr(x, y, 1.1, 0);
}
function phoneSpr(x, y, lit) {
  px(x, y, 4, 7, '#20222f');
  px(x + 1, y + 1, 2, 5, lit ? '#bfe4f0' : '#3a4050');
  if (lit) glow(x + 2, y + 3, 9, '#9ec4e8', 0.45);
}

function drawChatSplit(t) {
  // ----- his room, moonlight blue -----
  vgrad(0, 0, 192, H, [[0, '#141b36'], [0.7, '#101527'], [1, '#0c101e']]);
  px(20, 26, 46, 52, '#2a3050');                                   // window
  vgrad(24, 30, 38, 44, [[0, '#0c1030'], [1, '#1c2048']]);
  moon(42, 42, 5, 0.9);
  for (let i = 0; i < 6; i++) px(26 + R(i) * 33, 32 + R(i + 3) * 20, 1, 1, rgba('#ffe9c8', 0.7));
  px(41, 30, 3, 44, '#2a3050'); px(24, 50, 38, 3, '#2a3050');
  px(112, 36, 30, 38, '#24304e');                                  // rocket poster
  px(124, 46, 6, 14, '#d8dce8'); px(125, 42, 4, 5, '#e86a5a');
  px(124, 60, 2, 4, '#ffca7a'); px(128, 60, 2, 4, '#ffca7a');
  // glow-in-the-dark star stickers
  for (let i = 0; i < 5; i++) {
    const sx2 = 84 + R(i + 300) * 70, sy2 = 16 + R(i + 310) * 24;
    px(sx2, sy2, 2, 2, rgba('#d8ff8a', 0.35 + 0.3 * Math.sin(t * 1.4 + i * 2)));
  }
  // rug + sneakers kicked off by the bed
  px(58, 182, 66, 9, '#3e5a7a'); px(60, 183, 62, 7, '#4a688e');
  px(36, 182, 8, 4, '#e8ecf0'); px(37, 181, 6, 2, '#4a7ac0');
  px(46, 184, 8, 4, '#e8ecf0'); px(47, 183, 6, 2, '#4a7ac0');
  // bed
  px(24, 150, 128, 8, '#54371e'); px(26, 158, 6, 14, '#3e2a16'); px(142, 158, 6, 14, '#3e2a16');
  px(24, 140, 128, 10, '#7a84a8'); px(24, 140, 128, 2, '#9aa4c4');
  px(28, 134, 24, 9, '#e8e8f0');                                   // pillow
  // nightstand + warm lamp
  px(158, 150, 22, 22, '#3e2a16');
  px(164, 138, 10, 4, '#c98a3a'); px(167, 142, 4, 8, '#54371e');
  glow(169, 141, 16, '#ffca7a', 0.35);
  // him, cross-legged on the bed, phone glowing
  person(92, 138, { who: 'boy', pose: 'sit', f: 1, seat: 4, arm: 'hold', shade: 0.25, blush: 0.3, bob: pulse(t, 5.2, 5.5, 6.4, 7) * 1.5 });
  phoneSpr(100, 138 - 13, true);

  // ----- her room, warm pink -----
  vgrad(192, 0, 192, H, [[0, '#2e1a2e'], [0.7, '#241424'], [1, '#180e1a']]);
  for (let i = 0; i < 9; i++) {                                    // fairy lights
    const fx = 206 + i * 19, fy = 28 + Math.sin(i * 1.4) * 5;
    px(fx, fy, 2, 2, rgba('#ffd98a', 0.5 + 0.45 * Math.sin(t * 2 + i * 1.7)));
    glow(fx + 1, fy + 1, 7, '#ffca7a', 0.22);
    px(fx - 9, fy - 2 - Math.sin(i * 1.4 - 0.7) * 2, 10, 1, rgba('#4a3040', 0.8));
  }
  for (let i = 0; i < 3; i++) {                                    // little photo frames
    px(300 + i * 22, 46, 14, 16, '#54371e');
    px(302 + i * 22, 48, 10, 12, ['#c98a5a', '#7a9ab0', '#c05f7a'][i]);
  }
  px(206, 60, 16, 20, '#3e5a7a'); px(209, 54, 10, 8, '#4a7a5a');   // plant
  // vanity mirror catching the fairy lights
  px(230, 84, 16, 20, '#54371e'); px(232, 86, 12, 16, '#8a94b8');
  px(233, 88, 4, 8, rgba('#cfeaf2', 0.6));
  // rug on her side too
  px(250, 184, 66, 9, '#8a4a62'); px(252, 185, 62, 7, '#a05a76');
  // bed (mirrored)
  px(232, 150, 128, 8, '#6b4530'); px(234, 158, 6, 14, '#4a2e18'); px(350, 158, 6, 14, '#4a2e18');
  px(232, 140, 128, 10, '#c08a9a'); px(232, 140, 128, 2, '#d8a4b4');
  px(332, 134, 24, 9, '#ffe4ea');                                  // pillow
  // her teddy bear propped on the pillow
  px(338, 128, 7, 7, '#c8963f'); px(337, 126, 2, 2, '#c8963f'); px(344, 126, 2, 2, '#c8963f');
  px(340, 130, 3, 2, '#e8c87a'); px(339, 129, 1, 1, '#2c2834'); px(343, 129, 1, 1, '#2c2834');
  // her, hugging a pillow, phone glowing
  px(302, 128, 14, 10, '#ffd7de');                                 // hugged pillow
  person(292, 138, { who: 'girl', pose: 'sit', f: -1, seat: 4, arm: 'hold', shade: 0.2, blush: 0.4, bob: pulse(t, 3.2, 3.5, 4.4, 5) * 1.5 + pulse(t, 12.2, 12.5, 13.4, 14) * 1.5 });
  phoneSpr(281, 138 - 13, true);

  // the split
  px(190, 0, 4, H, '#05040a');
  px(189, 0, 1, H, rgba('#9aa4c4', 0.25)); px(194, 0, 1, H, rgba('#d8a4b4', 0.25));

  // messages crossing the night
  const sends = [[3, true, 'heart'], [7.5, true, 'note'], [12, true, 'heart']];
  const replies = [[5.2, false, 'heart'], [9.7, false, 'heart'], [14, false, 'note']];
  for (const [t0, left, kind] of sends.concat(replies)) {
    const u = (t - t0) / 2.4;
    if (u > 0 && u < 1) chatBubble(left ? 108 : 272, 116 - u * 54, left, kind, (1 - u) * Math.min(1, u * 9));
  }
  for (const rt of [5.2, 9.7, 14])                                 // her typing dots
    if (t > rt - 1.5 && t < rt - 0.2) chatBubble(272, 112, false, 'dots', 0.85);
  for (const rt of [7.5, 12])                                      // his typing dots
    if (t > rt - 1.4 && t < rt - 0.2) chatBubble(108, 112, true, 'dots', 0.85);
}

function drawChatOffice(t) {
  const GY = 172;
  // office, mid-morning
  vgrad(0, 0, W, GY, [[0, '#cfd8de'], [0.7, '#b8c4cc'], [1, '#a0aeb8']]);
  texNoise(0, 0, W, 140, 31, 0.022);
  px(0, GY, W, H - GY, '#7a8694');
  px(0, GY, W, 2, '#94a0ac');
  // window with the city outside
  px(206, 26, 140, 68, '#8a94a8');
  vgrad(210, 30, 132, 60, [[0, '#8ac4e0'], [1, '#cfeaf2']]);
  for (let i = 0; i < 6; i++) {
    const bx = 214 + i * 22, bh = 18 + R(i + 70) * 26;
    px(bx, 90 - bh, 18, bh, rgba('#8a94b8', 0.9));
    px(bx, 90 - bh, 18, 2, '#a8b2cc');
  }
  px(274, 30, 4, 60, '#8a94a8'); px(210, 58, 132, 3, '#8a94a8');
  for (let i = 0; i < 4; i++) px(210, 33 + i * 5, 132, 1, rgba('#e8ecf0', 0.5));   // blinds, half-open
  // ceiling light bars
  for (const fx of [90, 260]) { px(fx - 22, 4, 44, 3, '#e8ecf0'); glow(fx, 6, 22, '#f4f8ff', 0.12); }
  // water cooler in the corner
  px(8, GY - 34, 12, 34, '#c8d2d8'); px(10, GY - 44, 8, 10, rgba('#8ad2f0', 0.75));
  px(11, GY - 42, 3, 6, rgba('#ffffff', 0.5)); px(12, GY - 26, 4, 3, '#5e6878');
  // clock + whiteboard with a little chart
  disc(60, 24, 7, '#ece4d0'); px(57, 23, 4, 2, '#4a4438'); px(59, 18, 2, 5, '#4a4438');
  px(28, 44, 70, 42, '#e8ecf0'); px(28, 44, 70, 3, '#8a94a8');
  px(36, 66, 8, 14, '#4a8ac0'); px(48, 58, 8, 22, '#e86a5a'); px(60, 62, 8, 18, '#4a8a5a');
  px(74, 52, 16, 2, '#8a94a8'); px(74, 58, 12, 2, '#8a94a8');
  // plant
  px(354, GY - 14, 12, 14, '#7a4630');
  px(350, GY - 28, 7, 12, '#3f6b3a'); px(358, GY - 32, 7, 16, '#4a7a44');
  // colleagues at their desks (the office is never empty)
  deskSide(30, 96, GY, t, 0);
  chairSide(50, GY, 1);
  person(56, GY, { who: 'boy', pose: 'sit', f: 1, seat: 7, arm: 'hold', sil: '#8a8ca0', bob: Math.abs(Math.sin(t * 7)) * 0.5 });
  deskSide(268, 334, GY, t, 1);
  chairSide(290, GY, 1);
  person(296, GY, { who: 'girl', pose: 'sit', f: 1, seat: 7, arm: pulse(t, 6, 6.4, 8, 8.6) > 0.3 ? 'face' : 'hold', sil: '#9a8a7e' });
  px(300, GY - 23, 4, 5, '#f0f4f8');                               // her coffee on the desk
  // the boss drifts past — look busy!
  const bossOn = t > 10 && t < 14;
  // our guy at his desk
  const panic = bossOn ? 1 : 0;
  const happy = seg(t, 17.5, 18.5);
  chairSide(168, GY, 1);
  person(174, GY, {
    who: 'boy', pose: 'sit', f: 1, seat: 7,
    arm: 'hold',
    blush: 0.3 + 0.4 * seg(t, 5.5, 6.5) * (1 - panic),
    bob: (t < 4.5 || panic ? Math.abs(Math.sin(t * 9)) * 0.7 : 0) + pulse(t, 15, 15.3, 16.2, 16.8) * 1.5,
    headDy: happy * -1
  });
  // sweat drop while the boss is near
  if (bossOn) px(178, GY - 24 + (t % 0.8) * 4, 2, 3, rgba('#8ad2f0', 0.85));
  deskSide(150, 236, GY, t, 2);
  // his phone: on the desk buzzing, then in his hand — hidden while the boss passes
  const buzz = pulse(t, 4.5, 4.6, 5, 5.4) * Math.sin(t * 45) * 1.2;
  if (t < 5.5) phoneSpr(196 + buzz, GY - 25, t > 4.4);
  else if (!bossOn) phoneSpr(180, GY - 19, true);
  if (bossOn) {
    const bx = lerp(360, 30, seg(t, 10, 14));
    person(bx, GY + 8, { who: 'boy', pose: 'walk', f: -1, frame: Math.floor(t * 6), sil: '#3a3440' });
    px(bx - 2, GY + 8 - 21, 3, 8, '#2a242e');                      // the tie
  }
  // messages float up from the phone
  const evs = [[4.6, false, 'heart'], [8.5, true, 'heart'], [15, false, 'heart'], [17, true, 'note']];
  for (const [t0, left, kind] of evs) {
    const u = (t - t0) / 2.2;
    if (u > 0 && u < 1 && !(bossOn && t0 < 10)) chatBubble(left ? 172 : 194, GY - 42 - u * 36, left, kind, (1 - u) * Math.min(1, u * 9));
  }
  if (t > 13.2 && t < 14.8) chatBubble(194, GY - 44, false, 'dots', 0.85);
  // happy notes at the end
  if (t > 18 && t < 21) {
    note(168 + (t - 18) * 4, GY - 52 - (t - 18) * 6, '#ffd98a', pulse(t, 18, 18.4, 20, 21));
    note(190 - (t - 18) * 3, GY - 56 - (t - 18) * 5, '#ff9dab', pulse(t, 18.5, 18.9, 20.3, 21));
  }
}
function deskSide(x0, x1, gy, t, kind) {
  const w = x1 - x0;
  px(x0, gy - 18, w, 3, '#8a94a8'); px(x0, gy - 18, w, 1, '#aab4c0');
  px(x0 + 3, gy - 15, 3, 15, '#5e6878'); px(x1 - 6, gy - 15, 3, 15, '#5e6878');
  // monitor standing on the desk, screen toward the sitter
  px(x1 - 20, gy - 34, 4, 13, '#2c3040');
  px(x1 - 20, gy - 32, 1, 10, ['#bfe4f0', '#d8ecc0', '#bfe4f0'][kind]);
  glow(x1 - 19, gy - 28, 8, '#bfe4f0', 0.18);
  px(x1 - 19, gy - 21, 2, 3, '#3a4050'); px(x1 - 21, gy - 19, 6, 1, '#3a4050');
  // keyboard on the desk
  px(x0 + 14, gy - 20, 13, 2, '#3a4050');
  // paperwork and a sticky note
  px(x0 + 4, gy - 20, 8, 2, '#f4f8ff'); px(x0 + 5, gy - 19, 6, 1, rgba('#8a94a8', 0.6));
  px(x1 - 15, gy - 31, 3, 3, ['#ffedbe', '#d8ecc0', '#ffd9e2'][kind]);
}
/* ============================================================
   CH3 — sunrise over the sea                           (44 s)
   ============================================================ */
SCENES.push({
  name: 'ch3', dur: 44,
  cues: [[0, { bpm: 63, root: 0, prog: [5, 3, 0, 4], pstyle: 'chords', layers: { pad: 0.6, str: 0.7, mel: 0.6, bass: 0.3, piano: 0.35 }, amb: { waves: 0.85 } }]],
  sfx: [[30.1, 'heart']],
  draw(t) {
    const ph = lin(t, 0, 36);                       // night → dawn → morning
    const c3 = (a, b, c) => ph < 0.5 ? mix(a, b, ph * 2) : mix(b, c, (ph - 0.5) * 2);
    const HOR = 132;
    vgrad(0, 0, W, HOR, [
      [0, c3('#0c1030', '#4c3a72', '#6ab0d8')],
      [0.5, c3('#1c1a42', '#b0527e', '#ffca8a')],
      [1, c3('#2c2450', '#e2637e', '#ffe4b0')]
    ]);
    stars(46, t, 100, 1 - seg(ph, 0.25, 0.7));
    moon(310, 38, 7, 1 - seg(ph, 0.2, 0.55));
    // clouds catching the first light
    for (let i = 0; i < 4; i++) {
      const cx = ((R(i) * W + t * 1.2) % (W + 80)) - 40, cy = 34 + R(i + 8) * 40;
      px(cx, cy, 34 + R(i) * 20, 3, rgba(c3('#241c3e', '#b0527e', '#fff3dc'), 0.55));
      px(cx + 6, cy - 2, 20 + R(i + 2) * 14, 2, rgba(c3('#2c2450', '#c86a8e', '#ffffff'), 0.45));
    }
    // the sun climbs out of the sea
    const sun = { x: 150, y: 142 - ph * 44 };
    const sunUp = seg(ph, 0.25, 0.7);
    glow(sun.x, Math.min(sun.y, HOR - 2), 60, '#ffdf9a', 0.8 * sunUp);
    disc(sun.x, sun.y, 10, c3('#8a4a5e', '#ff7e5f', '#ffe9b0'));
    // sea
    vgrad(0, HOR, W, 176 - HOR + 44, [[0, c3('#1a1836', '#8a4a6e', '#7ab0c8')], [1, c3('#10102a', '#43356e', '#3c6a92')]]);
    for (let r = 0; r < 9; r++) {
      const wy = HOR + 2 + r * 5;
      for (let k = 0; k < 7; k++) {
        const wx = ((k * 62 + r * 23 + Math.sin(t * 0.9 + r * 1.7 + k) * 9 + t * (3 + r)) % (W + 30)) - 15;
        const nearSun = clamp(1 - Math.abs(wx + 5 - sun.x) / 60, 0, 1) * sunUp;
        px(wx, wy, 7 + r, 1, rgba(c3('#3a3a6e', '#c98a8a', '#eef8fc'), 0.13 + 0.32 * nearSun));
      }
    }
    // a lighthouse far down the coast, still turning
    px(24, HOR - 24, 7, 24, mix('#ece4d0', '#4c3a72', (1 - sunUp) * 0.55));
    px(24, HOR - 19, 7, 3, '#c04a3a'); px(24, HOR - 10, 7, 3, '#c04a3a');
    px(25, HOR - 28, 5, 4, '#2c3450');
    const lhA = (1 - ph) * (0.5 + 0.5 * Math.sin(t * 1.8));
    if (lhA > 0.08) {
      glow(27, HOR - 26, 10, '#ffe9a0', lhA * 0.8);
      g.save(); g.globalCompositeOperation = 'lighter';
      g.fillStyle = rgba('#ffe9a0', lhA * 0.10);
      g.beginPath(); g.moveTo(28, HOR - 26);
      g.lineTo(28 + 70, HOR - 34 + Math.sin(t * 0.9) * 10);
      g.lineTo(28 + 70, HOR - 16 + Math.sin(t * 0.9) * 10);
      g.closePath(); g.fill(); g.restore();
    }
    // a little fishing boat drifting home
    const boatX = 205 + Math.sin(t * 0.22) * 8;
    px(boatX, HOR - 2 + Math.sin(t * 1.1) * 0.6, 11, 3, '#2c3450');
    px(boatX + 4, HOR - 8, 1, 6, '#2c3450');
    px(boatX + 5, HOR - 8, 1, 1, rgba('#ffca7a', 0.5 + 0.5 * Math.sin(t * 2.6)));
    // morning glitter on the water
    if (sunUp > 0.4) for (let i = 0; i < 12; i++) {
      const gx3 = 84 + R(i + 120) * 160, gy3 = HOR + 4 + R(i + 140) * 36;
      const twk = Math.pow(Math.max(0, Math.sin(t * (2 + R(i)) + i * 2.7)), 6);
      px(gx3, gy3, 1, 1, rgba('#fff6e2', twk * 0.8 * sunUp));
    }
    // gulls wake with the light
    for (let i = 0; i < 3; i++) {
      const gx = W - ((t * (9 + i * 3) + i * 150) % (W + 70)) + 35;
      const gy = 44 + R(i + 30) * 34 + Math.sin(t * 2.2 + i * 2) * 3;
      const gc = rgba('#2c3450', 0.8 * seg(ph, 0.45, 0.9));
      px(gx, gy, 2, 1, gc); px(gx + 3, gy, 2, 1, gc);
      px(gx + 2, gy - 1 + (Math.sin(t * 6 + i) > 0 ? 0 : 1), 1, 1, gc);
    }
    // cliff
    px(252, 166, 132, 50, c3('#1e1626', '#241a2e', '#3a3448'));
    px(262, 156, 122, 12, c3('#241a2e', '#2a1e34', '#443c52'));
    px(266, 150, 118, 8, c3('#2a1e34', '#32243c', '#4e4660'));
    px(266, 150, 60, 1, rgba('#ffb36b', 0.65 * sunUp));
    for (let i = 0; i < 7; i++) px(272 + i * 15, 148 + (R(i) > 0.5 ? 0 : 1), 1, 2, '#1c2e22');
    // sea spray at the rocks
    for (let i = 0; i < 5; i++) {
      const sp = (t * 1.4 + R(i) * 3) % 3;
      if (sp < 1) px(250 + R(i + 6) * 14, 164 - sp * 8, 2, 1, rgba('#e8e2d2', (1 - sp) * 0.5));
    }
    // a low rock they sit on
    px(272, 143, 38, 7, c3('#150f1e', '#1a1326', '#2e2a3e'));
    px(274, 142, 34, 2, c3('#1e1730', '#241c38', '#3c3650'));
    // two cups of something warm, and wildflowers in the grass
    teacup(266, 148, t, 61); teacup(311, 148, t, 67);
    px(276, 147, 1, 1, '#ffd9e2'); px(279, 148, 1, 1, '#fff6e2'); px(306, 147, 1, 1, '#ffd9e2');
    // the couple: dark against the night, lit as the sun finds them
    const lean = seg(t, 22, 25.5);
    const shade = 0.75 - 0.35 * sunUp;
    const rim = sunUp > 0.15 ? mix('#ff9a5f', '#ffd9a0', ph) : null;
    person(281, 150, {
      who: 'girl', pose: 'sit', f: -1, seat: 7, shade, rim,
      headDx: -3 * lean, headDy: -1 * lean, arm: 'lap'
    });
    person(295, 150, { who: 'boy', pose: 'sit', f: -1, seat: 7, shade: shade + 0.03, rim, arm: 'lap' });
    // breeze in her hair
    for (let i = 0; i < 3; i++)
      px(288 + i * 2 + Math.sin(t * 3 + i) * 1.5, 135 + i, 2, 1, rgba('#24242e', 0.8));
    flyHeart(lin(t, 30, 33.6), 286, 126, 240, 26, hudX(2), HUD_Y);
    dim((1 - ph) * 0.22);
  }
});
