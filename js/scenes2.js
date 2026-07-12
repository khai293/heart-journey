'use strict';
/* ============================================================
   The Heart Journey — scenes part 2
   ch4 hotpot · ch5 cinema hands · ch6 night ride
   finale proposal · outro back to the cinema
   ============================================================ */

/* ============================================================
   CH4 — hotpot dinner                                  (38 s)
   ============================================================ */
SCENES.push({
  name: 'ch4', dur: 38,
  cues: [[0, { bpm: 92, root: 2, prog: [0, 4, 5, 3], pstyle: 'arp', layers: { pluck: 0.75, piano: 0.5, bass: 0.5 }, amb: { sizzle: 0.6 } }]],
  sfx: [[30.1, 'heart']],
  draw(t) {
    const GY = 178;
    vgrad(0, 0, W, GY, [[0, '#4a2a30'], [0.6, '#3c2128'], [1, '#301a20']]);
    texNoise(0, 0, W, 130, 21, 0.03);
    px(0, GY, W, H - GY, '#241418');
    for (let x = 14; x < W; x += 40) px(x, GY, 1, H - GY, '#1e1014');
    // window (night, left)
    px(20, 46, 58, 68, '#33202a'); px(24, 50, 50, 60, '#10142c');
    px(46, 50, 4, 60, '#33202a'); px(24, 78, 50, 4, '#33202a');
    moon(62, 62, 4, 0.9);
    for (let i = 0; i < 5; i++) px(26 + R(i) * 44, 52 + R(i + 3) * 22, 1, 1, rgba('#ffe9c8', 0.6));
    // hanging red lanterns
    for (let i = 0; i < 2; i++) {
      const lx = 120 + i * 148 + Math.sin(t * 0.8 + i * 2.4) * 2;
      px(lx, 0, 1, 24, '#1c1014');
      px(lx - 5, 24, 11, 3, '#8c6a2c');
      px(lx - 6, 27, 13, 12, '#c0303a'); px(lx - 4, 27, 9, 12, '#d84450');
      px(lx - 6, 32, 13, 2, '#8c2830');
      px(lx - 2, 39, 5, 3, '#8c6a2c'); px(lx - 1, 42, 3, 4, '#c8963f');
      glow(lx, 33, 40, '#ff6a50', 0.32 + 0.04 * Math.sin(t * 1.7 + i));
    }
    // shelf with jars
    px(300, 96, 70, 4, '#54331f');
    for (let i = 0; i < 6; i++) px(306 + i * 11, 84, 6, 12, ['#b0563a', '#8a7a3c', '#4a7a5a'][i % 3]);
    // second shelf with stacked bowls
    px(300, 122, 70, 3, '#54331f');
    for (let k = 0; k < 3; k++) for (let i = 0; i < 3; i++)
      px(306 + k * 22, 119 - i * 3, 12, 3, i % 2 ? '#ece4d0' : '#c9b98a');
    // hanging cloth banner with a little heart
    px(174, 52, 48, 30, '#8c2830'); px(174, 52, 48, 3, '#5c1a20');
    px(178, 56, 40, 22, '#a03440');
    heartSpr(198, 67, 1.6, 0);
    px(174, 82, 48, 2, '#c8963f');
    // wood wall panelling
    px(0, 132, W, 3, '#241418');
    for (let x = 8; x < W; x += 34) px(x, 132, 1, 46, '#241418');

    const bob = (a, b) => 1.2 * Math.pow(Math.sin(clamp((t - a) / (b - a), 0, 1) * Math.PI * 6), 2) * pulse(t, a, a + 0.2, b - 0.2, b);
    // another table in the back, murmuring over their own pot
    const BGY = GY - 7;
    person(52, BGY, { who: 'boy', pose: 'sit', f: 1, seat: 7, arm: 'lap', sil: '#4a3038' });
    person(112, BGY, { who: 'girl', pose: 'sit', f: -1, seat: 7, arm: 'hold', sil: '#3f343c' });
    px(58, BGY - 13, 50, 4, '#4a3024'); px(74, BGY - 20, 18, 7, '#54202a');
    steam(83, BGY - 22, t, 41, 5, 12, '#c9b9b0');
    // a waiter slips past with a tray
    if (t >= 12 && t < 16.5) {
      const wx = lerp(340, 20, seg(t, 12, 16.2));
      person(wx, GY - 8, { who: 'boy', pose: 'walk', f: -1, frame: Math.floor(t * 7), sil: '#2a1e24' });
      px(wx - 9, GY - 8 - 26, 15, 2, '#3a2c30');
      px(wx - 5, GY - 8 - 29, 6, 3, '#54424a');
    }
    // chairs + couple, close, facing each other across the pot
    chairSide(160, GY, 1); chairSide(236, GY, -1);
    const bReach = pulse(t, 5, 5.5, 7, 7.6) + pulse(t, 12, 12.5, 14, 14.6) + pulse(t, 20, 20.5, 22, 22.6);
    const gReach = pulse(t, 8, 8.5, 10, 10.6) + pulse(t, 15, 15.5, 17, 17.6) + pulse(t, 23, 23.5, 25, 25.6);
    person(162, GY, {
      who: 'boy', pose: 'sit', f: 1, seat: 7, arm: bReach > 0.3 ? 'hold' : 'lap',
      blush: 0.3, bob: bob(10, 11.6) + bob(26, 28.4)
    });
    person(234, GY, {
      who: 'girl', pose: 'sit', f: -1, seat: 7, arm: gReach > 0.3 ? 'hold' : 'lap',
      blush: 0.4, bob: bob(18, 19.6) + bob(26.2, 28.6)
    });
    // chopsticks while reaching
    if (bReach > 0.3) { px(172, GY - 22, 1, 1, '#c8963f'); px(174, GY - 24, 1, 1, '#c8963f'); px(176, GY - 26, 1, 1, '#c8963f'); }
    if (gReach > 0.3) { px(224, GY - 22, 1, 1, '#c8963f'); px(222, GY - 24, 1, 1, '#c8963f'); px(220, GY - 26, 1, 1, '#c8963f'); }
    // table
    px(154, GY - 13, 88, 4, '#6b4530'); px(154, GY - 13, 88, 1, '#8a5c3a');
    px(160, GY - 9, 4, 9, '#4a2e18'); px(232, GY - 9, 4, 9, '#4a2e18');
    // side dishes and drinks
    px(160, GY - 15, 7, 2, '#e8e2d2'); px(161, GY - 16, 5, 1, '#4a8a5a');
    px(229, GY - 15, 7, 2, '#e8e2d2'); px(230, GY - 16, 5, 1, '#e86a5a');
    px(170, GY - 18, 3, 5, rgba('#e8a04a', 0.85)); px(170, GY - 18, 3, 1, '#fff3dc');
    px(223, GY - 18, 3, 5, rgba('#e8a04a', 0.85)); px(223, GY - 18, 3, 1, '#fff3dc');
    glow(198, GY - 12, 28, '#ff6a50', 0.08);           // lantern light pooling on the wood
    // burner + pot
    px(188, GY - 15, 22, 3, '#20222f');
    px(184, GY - 26, 30, 11, '#7a2830'); px(184, GY - 26, 30, 2, '#9a3a40');
    px(182, GY - 27, 3, 6, '#5c1e24'); px(213, GY - 27, 3, 6, '#5c1e24');  // handles
    px(186, GY - 28, 26, 3, '#ff9a4a');                                     // broth
    for (let i = 0; i < 5; i++) {                                           // bubbles
      const bph = (t * (1.5 + R(i)) + R(i + 9)) % 1;
      if (bph < 0.5) px(188 + R(i + 4) * 22, GY - 28, 1, 1, rgba('#ffd98a', 0.9 - bph));
    }
    // food dropping in
    for (const dt of [5.4, 8.4, 12.4, 15.4, 20.4, 23.4]) {
      const u = (t - dt) / 0.5;
      if (u > 0 && u < 1) px(198, GY - 40 + u * 12, 3, 2, u > 0.5 ? '#d84450' : '#e8a04a');
      if (u >= 1 && u < 1.5) px(196, GY - 30, 6, 2, rgba('#ffd98a', (1.5 - u) * 1.4));
    }
    // steam — the heart of the scene
    steam(198, GY - 30, t, 3, 12, 26, '#ffe9d8');
    steam(198, GY - 34, t, 21, 8, 14, '#fff3dc');
    glow(198, GY - 30, 34, '#ff9a4a', 0.22);
    // emotes
    if (t > 10 && t < 12) note(170, GY - 46 - (t - 10) * 5, '#ffd98a', pulse(t, 10, 10.4, 11.4, 12));
    if (t > 18 && t < 20) note(228, GY - 46 - (t - 18) * 5, '#ff9dab', pulse(t, 18, 18.4, 19.4, 20));
    if (t > 26 && t < 28.6) {
      note(168 + (t - 26) * 4, GY - 48 - (t - 26) * 5, '#ffd98a', pulse(t, 26, 26.4, 27.8, 28.6));
      note(230 - (t - 26) * 4, GY - 50 - (t - 26) * 5, '#ff9dab', pulse(t, 26.2, 26.6, 28, 28.6));
    }
    // heart rises out of the steam
    flyHeart(lin(t, 30, 33.4), 198, 122, 250, 34, hudX(3), HUD_Y);
    dim(0.1);
  }
});

/* ============================================================
   CH5 — the cinema, two hands                          (44 s)
   ============================================================ */
SCENES.push({
  name: 'ch5', dur: 44,
  cues: [
    [0, { bpm: 60, root: 4, prog: [0, 5, 3, 4], pstyle: 'min', layers: { piano: 0.5, pad: 0.4 }, amb: { hum: 0.5 } }],
    [27, { bpm: 60, root: 4, prog: [0, 5, 3, 4], pstyle: 'min', layers: { piano: 0.55, pad: 0.5, mel: 0.5, str: 0.3 }, amb: { hum: 0.4 } }]
  ],
  sfx: [[15.1, 'kiss'], [17, 'chime'], [36.1, 'heart']],
  draw(t) {
    const closeup = t >= 10 && t < 27;
    if (!closeup) {
      cinemaRoom(t, {
        screen: 0.5, beam: 0.75, lamps: 0,
        extras: true, exclude: { row: 2, x0: 172, x1: 218 },
        content: S => movieOnScreen(S, t),
        midDraw: () => coupleHeads(186, 204 - 3 * seg(t, 30, 32), 186,
          { lum: 0.42, hands: t > 27, leanG: -2 * seg(t, 30, 32) })
      });
    } else {
      drawHandsCloseup(t);
    }
    flyHeart(lin(t, 36, 39.2), 195, 172, 260, 40, hudX(4), HUD_Y);
  }
});

function movieOnScreen(S, t) {
  // the cartoon: little yellow fellows and a runaway banana
  px(S.x, S.y, S.w, S.h, '#7ac4ea');
  px(S.x, S.y + S.h - 30, S.w, 30, '#8ad2a0');
  px(S.x, S.y + S.h - 30, S.w, 2, '#a2e4b4');
  disc(S.x + 24, S.y + 16, 7, '#ffe66e'); glow(S.x + 24, S.y + 16, 14, '#ffe66e', 0.4);
  const cl = S.x + ((t * 7) % (S.w + 40)) - 20;
  px(cl, S.y + 14, 24, 5, '#ffffff'); px(cl + 5, S.y + 10, 14, 4, '#ffffff');
  const gy = S.y + S.h - 30;
  const loop = t % 8;
  const chase = Math.min(1, loop / 4.6);
  const caught = loop >= 4.6;
  const mx = S.x + 30 + chase * 92;
  // the banana, always one hop ahead — until it isn't
  const bnx = caught ? mx - 2 : S.x + 56 + chase * 92;
  const bny = caught ? gy - 29 - Math.abs(Math.sin(t * 8)) * 5 : gy - 5 - Math.abs(Math.sin(t * 7)) * 9;
  const hopM = caught ? Math.abs(Math.sin(t * 8)) * 5 : 0;
  minionSpr(mx, gy - hopM, t, { eyes: 2, run: !caught, armsUp: caught });
  bananaSpr(bnx, bny);
  // a little one-eyed friend giggling at the edge
  minionSpr(S.x + S.w - 24, gy - Math.abs(Math.sin(t * 5 + 1)) * 3, t + 2, { eyes: 1, small: true, run: false });
  if (caught) {
    const hu = seg(loop, 4.8, 5.6);
    heartSpr(mx + 1, gy - 36 - (loop - 4.8) * 3, 1.4 * hu + 0.3, 0.3);
  }
}
function minionSpr(x, y, t, o) {
  const h = o.small ? 13 : 16, w = o.small ? 10 : 12;
  const yb = '#f5d442', ybD = '#d8b430', den = '#3e5a9e';
  // capsule body
  px(x - w / 2 + 1, y - h, w - 2, h, yb);
  px(x - w / 2, y - h + 2, w, h - 4, yb);
  px(x + w / 2 - 2, y - h + 2, 2, h - 4, ybD);
  // goggle strap + goggles
  px(x - w / 2, y - h + 4, w, 1, '#2c2c34');
  if (o.eyes === 2) {
    px(x - 4, y - h + 2, 4, 4, '#c8ccd4'); px(x, y - h + 2, 4, 4, '#c8ccd4');
    px(x - 3, y - h + 3, 2, 2, '#ffffff'); px(x + 1, y - h + 3, 2, 2, '#ffffff');
    px(x - 3, y - h + 4, 1, 1, '#6a4a2c'); px(x + 1, y - h + 4, 1, 1, '#6a4a2c');
  } else {
    px(x - 2, y - h + 2, 5, 5, '#c8ccd4');
    px(x - 1, y - h + 3, 3, 3, '#ffffff');
    px(x, y - h + 4, 1, 1, '#6a4a2c');
  }
  px(x - 1, y - h + 8, 3, 1, '#7a4a2c');            // grin
  // denim overalls
  px(x - w / 2, y - 6, w, 6, den);
  px(x - w / 2 + 1, y - 8, 1, 2, den); px(x + w / 2 - 2, y - 8, 1, 2, den);
  px(x - 1, y - 5, 3, 2, mix(den, '#000000', 0.25));
  // arms
  if (o.armsUp) { px(x - w / 2 - 2, y - h - 2, 2, 5, '#2c2c34'); px(x + w / 2, y - h - 2, 2, 5, '#2c2c34'); }
  else { px(x - w / 2 - 2, y - 8, 2, 4, '#2c2c34'); px(x + w / 2, y - 8, 2, 4, '#2c2c34'); }
  // little feet
  const step = o.run ? Math.sin(t * 12) * 1.5 : 0;
  px(x - 3 + step, y, 3, 2, '#2c2c34'); px(x + 1 - step, y, 3, 2, '#2c2c34');
}
function bananaSpr(x, y) {
  px(x, y, 6, 2, '#f4d848');
  px(x + 1, y - 1, 5, 1, '#f4d848');
  px(x - 1, y + 1, 2, 1, '#c8a83a');
  px(x + 5, y - 1, 1, 1, '#8a6a2c');
}

function drawHandsCloseup(t) {
  // medium shot, facing them: two seats, two nervous people, one armrest
  vgrad(0, 0, W, H, [[0, '#0d0a18'], [1, '#080610']]);
  const idx = Math.floor(t / 2.8), u = ss((t % 2.8) / 2.8);
  const cols = ['#e8c84e', '#5a86b0', '#f5d442', '#7ab0c8'];
  const lc = mix(cols[Math.floor(R(idx) * 4)], cols[Math.floor(R(idx + 1) * 4)], u);
  const fl = 0.8 + 0.2 * Math.sin(t * 10.7) * Math.sin(t * 4.3);

  g.save();
  g.translate(192, 124); g.scale(1.5, 1.5); g.translate(-192, -124);
  // plush cinema seats with rounded tops and stitched panels
  for (const cx of [96, 160, 224, 288]) {
    px(cx - 26, 84, 52, 68, '#4a2334');
    px(cx - 22, 79, 44, 8, '#4a2334');
    px(cx - 20, 85, 40, 60, '#5e3042');
    px(cx - 20, 85, 40, 2, '#754055');
    px(cx - 1, 88, 1, 54, rgba('#3a1b28', 0.7));       // centre seam
    px(cx - 20, 112, 40, 1, rgba('#3a1b28', 0.5));
  }
  glow(192, 118, 80, '#ff9dab', 0.07);
  // neighbours, lost in the film
  dimFront(96, t); dimFront(288, t + 3);

  /* story beats: one glance, one breath — and he simply takes her hand */
  const skinB = mix(PAL.skin, '#c8814e', 0.35);
  const skinG2 = mix(PAL.skinG, '#ffffff', 0.18);
  const grab = seg(t, 14.2, 15.2);
  const startle = 1.5 * pulse(t, 15.2, 15.35, 15.9, 16.3);
  const hx2 = 206, hy2 = 130 - startle;
  let bx = 168 + 10 * seg(t, 12.4, 13.6);
  bx = lerp(bx, hx2 - 9, grab);
  const by = lerp(131, 128, grab) - Math.sin(grab * Math.PI) * 5;
  const sq = pulse(t, 17.8, 18.05, 18.35, 18.75) + pulse(t, 20.6, 20.85, 21.15, 21.55);
  const stroke = Math.sin(seg(t, 19, 19.8) * Math.PI) * 1.5;

  // faces: a quick glance, then eyes that meet and stay
  const bGlance = pulse(t, 12, 12.4, 14, 14.6);
  const meet = seg(t, 16.6, 17.4) * (1 - seg(t, 24.2, 25.4));
  frontPerson(160, {
    who: 'boy', eyeDx: bGlance + meet, blush: 0.3 + 0.5 * seg(t, 12, 15.5),
    smile: t > 15
  });
  frontPerson(224, {
    who: 'girl', eyeDx: -meet, eyeDy: pulse(t, 15.2, 15.5, 16.8, 17.4),
    blush: 0.85 * seg(t, 15.2, 16.2), smile: t > 17
  });
  // popcorn on her lap
  px(234, 138, 12, 11, '#e8e2d2');
  px(234, 138, 3, 11, '#c84a4a'); px(240, 138, 3, 11, '#c84a4a');
  for (let i = 0; i < 5; i++) px(235 + R(i) * 9, 135 + R(i + 4) * 3, 2, 2, '#ffedbe');
  px(243, 140, 4, 4, skinG2);                       // her other hand on the box
  // armrests over laps, each with a cup-holder ring
  for (const ax of [128, 192, 256]) {
    px(ax - 8, 134, 16, 6, '#544874');
    px(ax - 8, 134, 16, 2, '#6a5c96');
    px(ax + 3, 135, 4, 3, '#3a3050'); px(ax + 4, 136, 2, 2, '#241c38');
    px(ax - 6, 140, 12, 22, '#2c2444');
  }
  // a popcorn kernel jumps when she startles
  const popU = lin(t, 15.2, 15.9);
  if (popU > 0 && popU < 1) {
    px(238 - popU * 6, 134 - Math.sin(popU * Math.PI) * 10 + popU * 4, 2, 2, '#ffedbe');
  }
  // drink in the left armrest, his other hand beside it
  px(120, 126, 6, 9, '#c84a4a'); px(121, 124, 4, 2, '#e8e2d2'); px(123, 118, 1, 7, '#e8e2d2');
  miniHand(136, 130, -1, skinB);
  // arms reaching to the middle
  armTo(160, 1, bx + 3, by + 3, PAL.bShirtD, 120);
  armTo(224, -1, hx2 - 3, hy2 + 3, PAL.gDressD, 127);
  // her hand first — his lands warmly on top of it
  miniHand(hx2, hy2 + sq * 0.5, -1, skinG2);
  miniHand(bx, by + sq, 1, skinB);
  if (grab >= 1) px(hx2 - 7 + stroke, hy2 + 4 + sq, 5, 2, skinB);   // his thumb, a soft stroke
  // sparks of contact + shy little hearts
  sparkle(200, 128, 1.5 + pulse(t, 15.1, 15.3, 15.8, 16.4) * 1.5, '#ffd7de', pulse(t, 15.1, 15.3, 16, 16.8));
  if (t > 16.8 && t < 23) for (let i = 0; i < 3; i++) {
    const hu = ((t - 16.8) * 0.45 + i * 0.33) % 1;
    heartSpr(180 + i * 12 + Math.sin(t * 2 + i * 2.1) * 3, 118 - hu * 24, 1.1, 0.35 * (1 - hu));
  }
  if (t > 20.5) sparkle(192, 116, 2.2, '#ffd7de', pulse(t, 20.5, 21, 22.2, 23.4));
  glow(160, 103, 26, '#ffcfae', 0.12 * fl);         // screen light on their faces
  glow(224, 107, 26, '#ffcfae', 0.12 * fl);
  g.restore();

  // the row in front, dark
  px(0, 188, W, 28, '#0a0812');
  for (let x = -8; x < W + 20; x += 34) { px(x, 182, 30, 22, '#110d1c'); px(x, 182, 30, 2, '#1a1428'); }
  // flicker of the cartoon washing over everything
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = rgba(lc, 0.10 * fl); g.fillRect(0, 0, W, H);
  g.restore();
  dim(0.04);
}
function frontPerson(cx, o) {
  const boy = o.who !== 'girl';
  const skin = boy ? PAL.skin : PAL.skinG;
  const hair = boy ? PAL.bHair : PAL.gHair;
  const top = boy ? PAL.bShirt : PAL.gDress;
  const topD = boy ? PAL.bShirtD : PAL.gDressD;
  const y0 = boy ? 96 : 104;                          // petite — her head at his neck
  // torso
  px(cx - 10, y0 + 22, 20, 56 - (y0 - 96) - 22, top);
  px(cx - 10, y0 + 22, 20, 2, mix(top, '#ffffff', 0.25));
  px(cx - 10, y0 + 22, 3, 34, topD);
  px(cx - 2, y0 + 18, 5, 5, skin);                    // neck
  // soft rounded face
  px(cx - 5, y0, 11, 13, skin);
  px(cx - 6, y0 + 1, 13, 11, skin);
  if (boy) {
    px(cx - 5, y0 - 2, 11, 4, hair);                  // swept-up top
    px(cx - 6, y0 + 1, 13, 2, hair);
    px(cx - 7, y0 + 1, 2, 8, hair); px(cx + 6, y0 + 1, 2, 8, hair);
    px(cx - 3, y0 - 2, 5, 1, PAL.bHairL);             // shine
    px(cx + 1, y0 + 2, 4, 2, hair);                   // fringe sweep
  } else {
    px(cx - 5, y0 - 1, 11, 4, hair);
    px(cx - 6, y0 + 1, 13, 3, hair);
    px(cx - 9, y0 + 2, 3, 23, hair); px(cx + 7, y0 + 2, 3, 23, hair);
    px(cx - 3, y0 + 3, 3, 1, hair); px(cx + 1, y0 + 3, 3, 1, hair);
    px(cx + 5, y0 + 1, 2, 2, '#ff8aa5');              // little hairpin
  }
  // big soft eyes with a sparkle
  const ex = Math.round(o.eyeDx || 0), ey = Math.round(o.eyeDy || 0);
  px(cx - 4 + ex, y0 + 6 + ey, 2, 3, '#1c1c28');
  px(cx + 3 + ex, y0 + 6 + ey, 2, 3, '#1c1c28');
  px(cx - 4 + ex, y0 + 6 + ey, 1, 1, '#ffffff');
  px(cx + 3 + ex, y0 + 6 + ey, 1, 1, '#ffffff');
  if (!boy) {                                          // her round glasses
    px(cx - 5, y0 + 5, 5, 1, PAL.glass); px(cx - 5, y0 + 9, 5, 1, PAL.glass);
    px(cx - 5, y0 + 6, 1, 3, PAL.glass); px(cx - 1, y0 + 6, 1, 3, PAL.glass);
    px(cx + 2, y0 + 5, 5, 1, PAL.glass); px(cx + 2, y0 + 9, 5, 1, PAL.glass);
    px(cx + 2, y0 + 6, 1, 3, PAL.glass); px(cx + 6, y0 + 6, 1, 3, PAL.glass);
    px(cx, y0 + 7, 2, 1, PAL.glass);                  // bridge
  }
  // ever-present blush + a soft smile
  const bl = 0.35 + (o.blush || 0) * 0.65;
  px(cx - 6, y0 + 10, 3, 2, rgba(PAL.cheek, bl * 0.8));
  px(cx + 4, y0 + 10, 3, 2, rgba(PAL.cheek, bl * 0.8));
  if (o.smile) { px(cx - 1, y0 + 12, 3, 1, '#c07a5a'); px(cx - 2, y0 + 11, 1, 1, '#c07a5a'); px(cx + 2, y0 + 11, 1, 1, '#c07a5a'); }
  else px(cx - 1, y0 + 12, 2, 1, '#c07a5a');
}
function dimFront(cx, t) {
  const hy = 100 + Math.round(Math.sin(t * 0.8) * 0.8);
  px(cx - 9, 120, 18, 32, '#3a2a44');
  px(cx - 5, hy, 12, 12, '#4a3852');
  px(cx - 5, hy, 12, 4, '#2e2038');
}
function armTo(cx, side, hx, hy, sleeve, sy) {
  const s0 = sy === undefined ? 120 : sy;
  const sx = cx + (side > 0 ? 6 : -10);
  px(sx, s0, 4, Math.max(2, hy - s0 - 2), sleeve);
  const x0 = Math.min(sx + 2, hx), x1 = Math.max(sx + 2, hx);
  px(x0, hy - 3, x1 - x0 + 2, 4, sleeve);
}
function miniHand(x, y, f, skin) {    // small palm-down, fingers toward f
  const out = mix(skin, '#3a2418', 0.5);
  const r = (dx, dy, w, h, c) => px(f > 0 ? x + dx : x - dx - w, y + dy, w, h, c);
  r(-1, -1, 10, 8, out);
  r(0, 0, 8, 6, skin);
  for (let i = 0; i < 3; i++) { r(7, i * 2 - 0.3, 5, 2.4, out); r(8, i * 2, 4, 1.6, skin); }
  r(3, 5.4, 4, 2, skin);
}
function miniOpen(x, y, skin, fold) { // small palm-up invitation
  const lite = mix(skin, '#ffffff', 0.25);
  const out = mix(skin, '#3a2418', 0.5);
  px(x - 1, y - 1, 11, 9, out);
  px(x, y, 9, 7, lite);
  px(x + 2, y + 2, 5, 3, mix(lite, '#c88a5a', 0.3));
  const L = 5 * (1 - (fold || 0));
  if (L >= 1.2) for (let i = 0; i < 3; i++) {
    px(x + 8, y + i * 2.2 - 0.2, L + 1.5, 2.2, out);
    px(x + 9, y + i * 2.2, L, 1.4, lite);
  }
}
function handDown(x, y, f, skin, sleeve) {   // palm-down, fingers toward f
  const out = mix(skin, '#3a2418', 0.5);
  const dk = mix(skin, '#5c3a2a', 0.3);
  const lens = [8, 10, 10, 7];
  const r = (dx, dy, w, h, c) => px(f > 0 ? x + dx : x - dx - w, y + dy, w, h, c);
  r(-19, -2, 19, 14, sleeve); r(-19, -2, 19, 2, mix(sleeve, '#000000', 0.3));
  r(-1, -1, 15, 12, out);
  r(0, 0, 13, 10, skin);
  r(10, 0, 3, 10, dk);
  for (let i = 0; i < 4; i++) {
    r(12, i * 2.6 - 0.4, lens[i] + 2, 3, out);
    r(13, i * 2.6, lens[i], 2, skin);
    r(13 + lens[i] - 2, i * 2.6, 2, 2, dk);
  }
  r(6, 9, 7, 3, out); r(7, 9, 5, 2, skin);
  r(0, 0, 13, 1, mix(skin, '#ffffff', 0.3));
}
function handOpen(x, y, skin, sleeve, fold) { // palm-up invitation, fingers spread right
  const lite = mix(skin, '#ffffff', 0.22);
  const out = mix(skin, '#3a2418', 0.5);
  px(x - 19, y - 2, 19, 14, sleeve); px(x - 19, y - 2, 19, 2, mix(sleeve, '#000000', 0.3));
  px(x - 1, y - 1, 17, 13, out);
  px(x, y, 15, 11, lite);
  px(x + 3, y + 3, 9, 5, mix(lite, '#c88a5a', 0.3));     // the hollow of his palm
  const lens = [7, 9, 9, 7], dys = [-0.5, 2.2, 4.9, 7.6];
  for (let i = 0; i < 4; i++) {
    const L = lens[i] * (1 - (fold || 0));
    if (L >= 1.5) {
      px(x + 14, y + dys[i] - 0.4, L + 2, 3, out);
      px(x + 15, y + dys[i], L, 2, lite);
    }
  }
  px(x + 1, y - 3, 7, 3, out); px(x + 2, y - 3, 5, 2, lite);   // thumb
}

/* ============================================================
   CH6 — the night ride                                 (52 s)
   ============================================================ */
SCENES.push({
  name: 'ch6', dur: 52,
  cues: [[0, { bpm: 104, root: 7, prog: [0, 4, 5, 3], pstyle: 'arp', layers: { piano: 0.85, bass: 0.7, pluck: 0.5, str: 0.5, mel: 0.75, pad: 0.35 }, amb: {} }]],
  sfx: [],
  draw(t) {
    const SEG = 12.2, T0 = 1.5;
    const u = clamp((t - T0) / SEG, 0, 3.999);
    const pf = Math.floor(u), fr = u - pf;
    rideBackdrop(pf, t, 1);
    if (fr > 0.88 && pf < 3) {
      g.save();
      g.globalAlpha = ss((fr - 0.88) / 0.12);
      rideBackdrop(pf + 1, t, 1);
      g.restore();
    }
    // road
    px(0, 178, W, 20, '#565064');
    px(0, 178, W, 1, '#7a7488'); px(0, 197, W, 1, '#3c3848');
    for (let k = 0; k < 11; k++) {
      const xx = (((k * 44 - t * 150) % (W + 44)) + (W + 44)) % (W + 44) - 22;
      px(xx, 187, 18, 2, rgba('#f4ead0', 0.75));
    }
    // a manhole cover slips past now and then
    const mhx = (((520 - t * 150) % 760) + 760) % 760 - 60;
    px(mhx, 192, 10, 3, '#3c3848'); px(mhx + 2, 193, 6, 1, '#2c2838');
    // speed streaks
    for (let i = 0; i < 4; i++) {
      const sx = (((R(i) * W - t * 260) % (W + 60)) + (W + 60)) % (W + 60) - 30;
      px(sx, 60 + R(i + 8) * 100, 22, 1, rgba('#ffffff', 0.08));
    }
    // oncoming traffic, muted tones
    for (let k = 0; k < 2; k++) {
      const per = 780 + k * 170;
      const ox = W + 40 - ((t * (225 + k * 45) + k * 420) % per);
      if (ox > -40 && ox < W + 40) {
        const oy = 189 + Math.sin(t * 9 + k * 2) * 0.6;
        shadow(ox, 194, 30, 0.16);
        g.save(); g.translate(ox, 0); g.scale(-1, 1); scooter(0, oy, {}); g.restore();
        person(ox + 3, oy - 1, {
          who: k ? 'girl' : 'boy', pose: 'ride', f: -1, seat: 11, footH: 7,
          arm: 'hold', sil: k ? '#7a6a72' : '#6a6480'
        });
      }
    }
    // scooter + the two of them, bright in the morning light
    const bobY = Math.sin(t * 8.6) * 0.8;
    const sy = 193 + bobY;
    shadow(152, 197, 34, 0.2);
    scooter(152, sy, { light: false });
    person(146, sy - 1, { who: 'boy', pose: 'ride', f: 1, seat: 11, footH: 7, arm: 'hold' });
    person(133, sy - 1, { who: 'girl', pose: 'ride', f: 1, seat: 11, footH: 7, arm: 'hugF', headDx: 1 });
    // scarf in the wind
    for (let i = 0; i < 6; i++) {
      const sx = 128 - 5 - i * 4;
      const syy = sy - 24 + Math.sin(t * 7 + i * 0.9) * (1 + i * 0.55) + i * 0.6;
      px(sx, syy, 4, 2, rgba(i % 2 ? '#ff9dab' : '#ffb3c4', 1 - i * 0.12));
    }
  }
});

function rideBackdrop(i, t, a) {
  if (i === 0) {          // bridge in the morning light
    vgrad(0, 0, W, 178, [[0, '#6ab0d8'], [0.7, '#b8e0ea'], [1, '#ffe9c0']]);
    disc(64, 40, 8, '#fff6e2'); glow(64, 40, 40, '#fff3d8', 0.5 * a);
    rideBirds(t, 3, a);
    // towers (H-frames)
    for (let k = 0; k < 2; k++) {
      const tx = (((k * 300 + 120 - t * 26) % 620) + 620) % 620 - 120;
      px(tx, 34, 7, 144, rgba('#5e6a8e', a)); px(tx + 20, 34, 7, 144, rgba('#5e6a8e', a));
      px(tx + 2, 34, 2, 144, rgba('#8a94b8', a)); px(tx + 22, 34, 2, 144, rgba('#8a94b8', a));
      px(tx, 52, 27, 5, rgba('#5e6a8e', a)); px(tx, 96, 27, 5, rgba('#5e6a8e', a));
    }
    // sagging cable + festival flags
    for (let x = 0; x < W; x += 10) {
      const sag = 60 + Math.pow(((x + t * 26) % 300) / 150 - 1, 2) * -34 + 40;
      px(x, sag, 6, 1, rgba('#5e6a8e', a));
      if (x % 20 === 0)
        px(x + 2, sag + 2, 3, 3, rgba(['#e86a5a', '#eac84e', '#6ab0a0'][(x / 20) % 3], a * 0.9));
    }
    // sparkling water below, a sailboat drifting past
    px(0, 198, W, 18, rgba('#4e8ab0', a));
    for (let k = 0; k < 14; k++) {
      const wx = (((k * 30 + t * 12) % (W + 20)) + (W + 20)) % (W + 20) - 10;
      px(wx, 202 + R(k) * 10, 8, 1, rgba('#ffffff', a * 0.3 * (0.5 + 0.5 * Math.sin(t * 3 + k))));
    }
    const sbx = (((t * 6) % (W + 60)) + (W + 60)) % (W + 60) - 30;
    px(sbx, 204, 10, 3, rgba('#e8e2d2', a));
    px(sbx + 4, 196, 1, 8, rgba('#8a7a5e', a));
    px(sbx + 5, 197, 4, 5, rgba('#ffffff', a * 0.9)); px(sbx + 5, 197, 4, 1, rgba('#e86a5a', a));
  } else if (i === 1) {   // the city waking up
    vgrad(0, 0, W, 178, [[0, '#7ab8d8'], [0.75, '#cfeaf2'], [1, '#ffedbe']]);
    disc(300, 34, 7, '#fff6e2'); glow(300, 34, 34, '#fff3d8', 0.5 * a);
    rideBirds(t, 2, a);
    for (let k = 0; k < 12; k++) {  // far skyline
      const bx = (((k * 44 - t * 9) % (W + 60)) + (W + 60)) % (W + 60) - 30;
      const bh = 40 + R(k + 60) * 52;
      px(bx, 178 - bh - 20, 40, bh + 20, rgba('#9aa4c4', a));
      px(bx, 178 - bh - 20, 40, 2, rgba('#c8d2e4', a));
    }
    for (let k = 0; k < 7; k++) {   // near buildings, sunlit faces
      const bx = (((k * 82 - t * 34) % (W + 120)) + (W + 120)) % (W + 120) - 60;
      const bh = 66 + R(k + 80) * 60;
      px(bx, 178 - bh, 62, bh, rgba('#7a84a8', a));
      px(bx, 178 - bh, 62, 3, rgba('#b8c2dc', a));
      px(bx + 58, 178 - bh, 4, bh, rgba('#a8b2cc', a));
      if (k % 3 === 0) {            // rooftop water tank + antenna
        px(bx + 10, 172 - bh, 9, 6, rgba('#8a94b8', a)); px(bx + 12, 169 - bh, 5, 3, rgba('#6a7492', a));
        px(bx + 40, 166 - bh, 1, 12, rgba('#4e5878', a)); px(bx + 37, 168 - bh, 7, 1, rgba('#4e5878', a));
      }
      for (let wI = 0; wI < 8; wI++)
        if (R(k * 13 + wI) > 0.4) px(bx + 6 + (wI % 3) * 16, 178 - bh + 10 + Math.floor(wI / 3) * 18, 5, 6, rgba('#525c7e', a * 0.8));
      if (R(k + 5) > 0.35) px(bx + 8, 160, 34, 5, rgba(['#c05848', '#4a8a6a', '#c8963f'][k % 3], a));
    }
    px(0, 198, W, 18, rgba('#6a7288', a));
  } else if (i === 2) {   // green rice fields, butterflies
    vgrad(0, 0, W, 178, [[0, '#6ab0d8'], [0.8, '#b8e0ea'], [1, '#fff3d8']]);
    disc(86, 40, 8, '#fff6e2'); glow(86, 40, 38, '#fff3d8', 0.5 * a);
    for (let k = 0; k < 8; k++) {   // soft hills
      const hx = (((k * 90 - t * 7) % (W + 160)) + (W + 160)) % (W + 160) - 80;
      disc(hx, 152, 34 + R(k) * 18, rgba('#7aa86a', a));
    }
    px(0, 148, W, 30, rgba('#6aa050', a));
    for (let r = 0; r < 4; r++)     // paddy rows
      for (let k = 0; k < 9; k++) {
        const fx = (((k * 48 - t * (40 + r * 26)) % (W + 48)) + (W + 48)) % (W + 48) - 24;
        px(fx, 152 + r * 7, 30 - r * 4, 1, rgba('#4e7a3c', a));
      }
    const tx = (((520 - t * 90) % 900) + 900) % 900 - 150; // passing tree
    px(tx, 118, 5, 60, rgba('#6a4a34', a)); disc(tx + 2, 112, 16, rgba('#4e8a44', a));
    // a water buffalo grazing, an egret at its side
    const bfx = (((260 - t * 7) % (W + 200)) + (W + 200)) % (W + 200) - 100;
    px(bfx, 156, 16, 7, rgba('#4a4048', a)); px(bfx + 13, 152, 5, 6, rgba('#4a4048', a));
    px(bfx + 12, 151, 2, 2, rgba('#2e282e', a)); px(bfx + 17, 151, 2, 2, rgba('#2e282e', a));
    px(bfx + 2, 163, 2, 4, rgba('#3a343c', a)); px(bfx + 11, 163, 2, 4, rgba('#3a343c', a));
    px(bfx - 5, 155, 3, 6, rgba('#f4f8ff', a)); px(bfx - 5, 153, 2, 2, rgba('#f4f8ff', a));   // egret
    for (let k = 0; k < 10; k++) {  // butterflies
      const fx2 = (((R(k) * W - t * 24) % (W + 30)) + (W + 30)) % (W + 30) - 15 + Math.sin(t * 2.2 + k) * 5;
      const fy = 118 + R(k + 44) * 50 + Math.sin(t * 3.1 + k * 2) * 4;
      px(fx2, fy, 2, 1, rgba(k % 2 ? '#fff6e2' : '#eac84e', a * 0.9));
    }
    px(0, 198, W, 18, rgba('#4e7a3c', a));
  } else {                // coast road, sun on the water
    vgrad(0, 0, W, 130, [[0, '#5ea8d8'], [1, '#b8e0ea']]);
    disc(110, 38, 8, '#fff6e2'); glow(110, 38, 42, '#fff3d8', 0.55 * a);
    rideBirds(t, 3, a);
    vgrad(0, 130, W, 48, [[0, '#4e9ec8'], [1, '#2e6a98']]);
    px(0, 130, W, 1, rgba('#d8ecf2', a * 0.8));
    for (let r = 0; r < 6; r++)
      for (let k = 0; k < 6; k++) {
        const wx = (((k * 70 + r * 27 + t * (5 + r) * 3) % (W + 30)) + (W + 30)) % (W + 30) - 15;
        const nearSun = clamp(1 - Math.abs(wx - 105) / 70, 0, 1);
        px(wx, 134 + r * 7, 8 + r * 2, 1, rgba('#ffffff', a * (0.15 + 0.3 * nearSun)));
      }
    // sailboats out on the blue
    for (let k = 0; k < 2; k++) {
      const sb2 = (((k * 210 + t * 5) % (W + 80)) + (W + 80)) % (W + 80) - 40;
      px(sb2, 140 + k * 9, 8, 2, rgba('#e8e2d2', a));
      px(sb2 + 3, 133 + k * 9, 1, 7, rgba('#8a7a5e', a));
      px(sb2 + 4, 134 + k * 9, 3, 4, rgba('#ffffff', a * 0.9));
    }
    for (let k = 0; k < 6; k++) {   // guard posts
      const gx2 = (((k * 70 - t * 150) % (W + 70)) + (W + 70)) % (W + 70) - 35;
      px(gx2, 166, 3, 12, rgba('#e8e4d8', a)); px(gx2, 166, 3, 3, rgba('#e84a5a', a));
    }
    px(0, 198, W, 18, rgba('#d8c49a', a));
    // a beach umbrella planted in the sand
    const ux = (((300 - t * 150) % (W + 160)) + (W + 160)) % (W + 160) - 80;
    px(ux, 196, 2, 14, rgba('#8a7a5e', a));
    px(ux - 7, 194, 16, 3, rgba('#e86a5a', a));
    px(ux - 4, 191, 10, 3, rgba('#e86a5a', a));
    px(ux - 1, 189, 4, 2, rgba('#e86a5a', a));
    px(ux - 4, 194, 3, 3, rgba('#f4ead0', a)); px(ux + 3, 194, 3, 3, rgba('#f4ead0', a));
  }
}
function rideBirds(t, n, a) {
  for (let i = 0; i < n; i++) {
    const bx = W - ((t * (10 + i * 3) + i * 140) % (W + 70)) + 35;
    const by = 30 + R(i + 30) * 36 + Math.sin(t * 2.2 + i * 2) * 3;
    const c = rgba('#4a5e7a', a * 0.85);
    px(bx, by, 2, 1, c); px(bx + 3, by, 2, 1, c);
    px(bx + 2, by - 1 + (Math.sin(t * 6 + i) > 0 ? 0 : 1), 1, 1, c);
  }
}

/* ============================================================
   FINALE — five hearts, one ring                       (62 s)
   ============================================================ */
SCENES.push({
  name: 'finale', dur: 62,
  cues: [
    [0, { bpm: 69, root: 0, prog: [3, 4], pstyle: 'min', layers: { pad: 0.5, str: 0.35, piano: 0.3 }, amb: {} }],
    [15, { bpm: 72, root: 0, prog: [0, 4, 5, 3], pstyle: 'chords', layers: { piano: 0.7, pad: 0.6, str: 0.7, mel: 0.8, bass: 0.5 }, amb: {} }],
    [24, { bpm: 69, root: 0, prog: [3, 4, 0, 0], pstyle: 'min', layers: { pad: 0.6, str: 0.5, piano: 0.4 }, amb: {} }],
    [39.5, { bpm: 74, root: 2, prog: [0, 4, 5, 3], pstyle: 'chords', layers: { piano: 0.9, pad: 0.7, str: 0.95, mel: 1, bass: 0.7, pluck: 0.4 }, amb: {} }]
  ],
  sfx: [[15, 'heart'], [20, 'crack'], [22.3, 'crack'], [24, 'crack'], [24.4, 'ring'], [42, 'burst'], [43.7, 'burst']],
  draw(t) {
    const GY = 176;
    if (t >= 43.5) {
      hugShot(t - 43.5);
      flash('#fff6e2', pulse(t, 43.4, 43.55, 43.7, 44.4) * 0.7);
      return;
    }
    vgrad(0, 0, W, H, [[0, '#0d0a1a'], [0.6, '#161030'], [1, '#0f0b20']]);
    // dreamy bokeh drifting up through the dark
    for (let i = 0; i < 8; i++) {
      const bu = ((t * (2 + R(i + 500) * 3) * 0.02 + R(i + 510)) % 1);
      glow(30 + R(i + 520) * 324 + Math.sin(t * 0.5 + i * 2) * 8, 200 - bu * 190,
        3 + R(i + 530) * 6, i % 2 ? '#8a6ac0' : '#c06a8e', 0.10 * Math.sin(bu * Math.PI));
    }
    // glowing dream-screen backdrop
    const bgPulse = 0.5 + 0.12 * Math.sin(t * 1.3) + 0.3 * seg(t, 12, 15);
    px(56, 18, 272, 104, '#221a3d');
    glow(192, 70, 150, '#6a4a9e', 0.22 * bgPulse);
    px(56, 18, 272, 2, '#332852'); px(56, 120, 272, 2, '#332852');
    // floor reflection
    vgrad(0, GY, W, H - GY, [[0, '#1a1430'], [1, '#0c0918']]);
    glow(192, GY + 8, 90, '#6a4a9e', 0.12);
    if (t >= 15 && t < 29) glow(192, GY + 6, 70, '#ff4d64', 0.10 * (1 - seg(t, 26.5, 29)));   // the heart mirrored in the floor

    // couple walks in
    const bxw = lerp(56, 150, seg(t, 0.5, 4.5));
    const gxw = lerp(328, 234, seg(t, 0.8, 4.8));
    const wf = Math.floor(t * 7);

    // hearts fly from HUD → orbit → merge
    if (t >= 4 && t < 15.6) {
      for (let i = 0; i < 5; i++) {
        const d0 = 4 + i * 0.8;
        const fl2 = clamp((t - d0) / 2.2, 0, 1);
        if (fl2 <= 0) { heartSpr(hudX(i), HUD_Y, 1.5, 0.35); continue; }
        const ang = t * (2.2 + seg(t, 12, 15) * 4) + i * TAU / 5;
        const rad = lerp(34, 3, seg(t, 12, 15));
        const ox2 = 192 + Math.cos(ang) * rad, oy2 = 80 + Math.sin(ang) * rad * 0.7;
        if (fl2 < 1) {
          const uu = ss(fl2);
          const hx2 = (1 - uu) * (1 - uu) * hudX(i) + 2 * (1 - uu) * uu * (192 + (hudX(i) - 192) * 0.5) + uu * uu * ox2;
          const hy2 = (1 - uu) * (1 - uu) * HUD_Y + 2 * (1 - uu) * uu * 30 + uu * uu * oy2;
          heartSpr(hx2, hy2, lerp(1.5, 2.2, uu), 0.6);
        } else {
          heartSpr(ox2, oy2, 2.2 + seg(t, 12, 15), 0.7);
          px(ox2 - Math.cos(ang - 0.5) * rad * 0.3, oy2 - Math.sin(ang - 0.5) * rad * 0.2, 1, 1, rgba('#ff9dab', 0.6));
        }
      }
    }
    // merge flash
    flash('#fff0f2', pulse(t, 14.8, 15.1, 15.4, 16) * 0.5);

    // the giant heart
    if (t >= 15 && t < 29) {
      const pop = 1 + 0.35 * Math.sin(clamp((t - 15) / 0.7, 0, 1) * Math.PI) ;
      const beat = 1 + 0.05 * Math.sin(t * 5.2) * seg(t, 15.8, 16.5);
      const split = seg(t, 24, 26) * 26;
      const fade2 = 1 - seg(t, 26.5, 29);
      const cell = 7 * pop * beat;
      if (fade2 > 0) {
        if (split < 1) heartSpr(192, 80, cell, 0.8);
        else {
          g.save(); g.beginPath(); g.rect(0, 0, 192, H); g.clip();
          g.globalAlpha = fade2; heartSpr(192 - split, 80, cell, 0.5); g.restore();
          g.save(); g.beginPath(); g.rect(192, 0, 192, H); g.clip();
          g.globalAlpha = fade2; heartSpr(192 + split, 80, cell, 0.5); g.restore();
          g.globalAlpha = 1;
        }
      }
      // cracks
      const c1 = seg(t, 20, 21.4), c2 = seg(t, 22.3, 23.4);
      if (split < 1) {
        const path = [[192, 62], [189, 67], [193, 72], [190, 78], [194, 84], [191, 90], [193, 96]];
        for (let i = 0; i < Math.floor(path.length * c1); i++) px(path[i][0], path[i][1], 2, 3, '#5c0f1e');
        const path2 = [[181, 70], [184, 75], [182, 81], [185, 86]];
        for (let i = 0; i < Math.floor(path2.length * c2); i++) px(path2[i][0] + 20, path2[i][1] - 4, 2, 2, '#5c0f1e');
        if (c2 > 0.5) for (let i = 0; i < Math.floor(path2.length * c2); i++) px(path2[i][0], path2[i][1], 2, 2, '#5c0f1e');
      }
      // heart-shards drifting away
      if (t > 26) for (let i = 0; i < 16; i++) {
        const uu = (t - 26) / 3;
        const sx2 = 192 + (R(i) - 0.5) * 90 * uu + (i < 8 ? -20 : 20);
        const sy2 = 80 + (R(i + 9) - 0.5) * 40 * uu + uu * uu * 26;
        px(sx2, sy2, 2, 2, rgba(i % 2 ? '#ff4d64' : '#d92e48', clamp(1 - uu, 0, 1) * 0.9));
      }
    }
    flash('#fff0f2', pulse(t, 23.9, 24.15, 24.4, 25) * 0.6);

    // the bouquet of ocean-blue flowers
    if (t >= 24 && t < 43.5) {
      let rx = 192, ry = 82, rs = 1;
      if (t >= 27 && t < 31) { rx = lerp(192, 160, seg(t, 27, 31)); ry = lerp(82, 152, seg(t, 27, 31)); rs = lerp(1, 0.6, seg(t, 27, 31)); }
      else if (t >= 31 && t < 34.5) { rx = lerp(160, 216, seg(t, 31.2, 34.2)); ry = 152; rs = 0.6; }
      else if (t >= 34.5) { rx = 216; ry = 154; rs = 0.6; }
      if (t >= 41.5) { rx = lerp(216, 228, seg(t, 41.5, 42.2)); ry = lerp(152, 159, seg(t, 41.5, 42.2)); rs = 0.6; }   // into her arms
      drawBouquet(rx, ry, rs, t);
    }

    // characters
    if (t < 31.4) {
      person(bxw, GY, { who: 'boy', pose: t < 4.6 ? 'walk' : 'stand', f: 1, frame: wf, arm: t > 28 ? 'hold' : 'down', shade: 0.15 });
    } else if (t < 34.2) {
      person(lerp(150, 208, seg(t, 31.4, 34)), GY, { who: 'boy', pose: 'walk', f: 1, frame: wf, arm: 'hold', shade: 0.15 });
    } else if (t < 40.8) {
      person(208, GY, { who: 'boy', pose: 'kneel', f: 1, arm: 'hold', shade: 0.15 });
    } else {
      person(lerp(208, 220, seg(t, 40.8, 42)), GY, { who: 'boy', pose: 'stand', f: 1, arm: 'hold', shade: 0.1, blush: 0.5 });
    }
    const trem = pulse(t, 36, 36.2, 37.4, 37.8) * Math.sin(t * 30) * 0.7;
    const nod = (pulse(t, 39, 39.2, 39.5, 39.8) + pulse(t, 39.9, 40.1, 40.4, 40.7)) * 2;
    person((t < 5 ? gxw : 234) + trem, GY, {
      who: 'girl', pose: t < 5.2 ? 'walk' : 'stand', f: -1, frame: wf + 2,
      arm: (t > 35.5 && t < 40.5) ? 'face' : (t > 41 ? 'hold' : 'down'),
      headDy: -nod, blush: seg(t, 35, 37), shade: 0.15
    });
    if (t > 34.5 && t < 40.5) sparkle(218, 144, 2 + Math.sin(t * 6), '#bfe4ff', 0.8);
    if (t > 41.8) { sparkle(229, 142, 2.5, '#bfe4ff', 0.9); sparkle(234, 150, 1.5, '#fff6e2', 0.7); }
    flash('#fff6e2', pulse(t, 43.4, 43.55, 43.7, 44.4) * 0.7);
  }
});

function drawBouquet(x, y, s, t) {
  const petal = ['#4aa8e8', '#6ec0f0', '#3e8ed0'];
  glow(x, y - 5 * s, 24 * s, '#6ec0f0', 0.42);
  // rotating light rays while it's still the big reveal
  if (s > 0.8) {
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) {
      const a = t * 0.7 + i * TAU / 6;
      g.fillStyle = 'rgba(191,228,255,0.09)';
      g.beginPath();
      g.moveTo(x, y - 4);
      g.lineTo(x + Math.cos(a) * 44, y - 4 + Math.sin(a) * 44);
      g.lineTo(x + Math.cos(a + 0.16) * 44, y - 4 + Math.sin(a + 0.16) * 44);
      g.closePath(); g.fill();
    }
    g.restore();
  }
  // paper wrap, folded to a point
  for (let r = 0; r < 9; r++) {
    const w2 = (14 - r * 1.4) * s;
    if (w2 < 1) break;
    px(x - w2 / 2, y + r * s, w2, Math.max(1, s + 0.5), r % 3 === 2 ? '#e4d6b4' : '#f4ead0');
  }
  px(x - 5 * s, y + 1.5 * s, 10 * s, Math.max(1, 2 * s), '#3e8ed0');   // ribbon
  // leaves peeking out
  px(x - 9 * s, y - 4 * s, 4 * s, 3 * s, '#4a8a5a');
  px(x + 5 * s, y - 6 * s, 4 * s, 3 * s, '#4a8a5a');
  px(x - 3 * s, y - 12 * s, 3 * s, 2 * s, '#4a8a5a');
  // ocean-blue blossoms
  const offs = [[0, -5], [-5, -3], [5, -3], [-3, -8], [3, -8], [0, -11], [-7, -6], [7, -7]];
  for (let i = 0; i < offs.length; i++) {
    const fx = x + offs[i][0] * s, fy = y + offs[i][1] * s;
    const c = petal[i % 3];
    px(fx - 2 * s, fy - s, 4 * s, 2 * s, c);
    px(fx - s, fy - 2 * s, 2 * s, 4 * s, c);
    px(fx - s * 0.5, fy - s * 0.5, Math.max(1, s), Math.max(1, s), '#fff3d8');
  }
  sparkle(x + Math.cos(t * 2.2) * 8 * s, y - 7 * s + Math.sin(t * 2.2) * 3, 1.5 + s, '#bfe4ff', 0.7 + 0.3 * Math.sin(t * 5));
}

/* the embrace — shared by finale ending and outro screen */
function hugShot(t) {
  vgrad(0, 0, W, H, [[0, '#2a1836'], [0.6, '#41204a'], [1, '#2a1430']]);
  const puls = 0.75 + 0.1 * Math.sin(t * 1.8);
  glow(192, 120, 170, '#ff9a5f', 0.28 * puls);
  glow(192, 128, 90, '#ffd7de', 0.30 * puls);
  // two soft columns of light falling on them
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const lx of [150, 226]) {
    g.fillStyle = rgba('#ffd7a0', 0.045 + 0.015 * Math.sin(t * 1.2 + lx));
    g.beginPath(); g.moveTo(lx - 6, 0); g.lineTo(lx + 14, 0);
    g.lineTo(lx + 30, 176); g.lineTo(lx - 22, 176); g.closePath(); g.fill();
  }
  g.restore();
  px(0, 176, W, 40, '#1c1026');
  hugPair(192, 176, {});
  shadow(192, 176, 26, 0.3);
  // confetti among the petals
  for (let i = 0; i < 14; i++) {
    const cu = ((t * (10 + R(i + 600) * 8) * 0.08 + R(i + 610)) % 1);
    px(30 + R(i + 620) * 324 + Math.sin(t * 1.6 + i) * 5, cu * 200,
      2, 2, rgba(['#8ad2f0', '#ffe66e', '#b48aff', '#96da74'][i % 4], 0.8 * (1 - cu * 0.5)));
  }
  petals(t + 4, 26, { x0: 20, x1: 364, y0: 6, y1: 200 }, 1);
  for (let i = 0; i < 10; i++) {
    const sx = 40 + R(i + 70) * 300, sy = 30 + R(i + 90) * 130;
    sparkle(sx, sy, 1.5 + R(i) * 1.5, i % 2 ? '#ffe9a0' : '#ffd7de', 0.4 + 0.5 * Math.sin(t * 2 + i * 2.1));
  }
  const hu = (t * 0.35) % 1;
  heartSpr(150 + R(Math.floor(t * 0.35)) * 90, 150 - hu * 90, 1.5, 0.4 * (1 - hu));
  drawBouquet(206, 156, 0.5, t);                 // her blue bouquet, held close
}

/* ============================================================
   OUTRO — it was all a film                            (42 s)
   ============================================================ */
SCENES.push({
  name: 'outro', dur: 42, fi: 0.01, fo: 0.01,
  cues: [
    [0, { bpm: 60, root: 2, prog: [0, 3, 0, 4], pstyle: 'chords', layers: { piano: 0.5, pad: 0.35, str: 0.3 }, amb: { hum: 0.5 } }],
    [10, { bpm: 58, root: 2, prog: [3, 0], pstyle: 'min', layers: { piano: 0.35, pad: 0.25 }, amb: { hum: 0.6 } }],
    [15.5, { bpm: 58, root: 2, prog: [0], pstyle: 'min', layers: {}, amb: { hum: 0.35 } }]
  ],
  sfx: [[18, 'beat1'], [21.2, 'beat1'], [24.8, 'beat1'], [30.5, 'final']],
  draw(t) {
    const pull = seg(t, 0.5, 7);                       // camera pulls back
    const scrDim = seg(t, 9, 13);
    const beatGlow =
      Math.max(0, 1 - (t - 18) * 2.4) * (t > 18 ? 1 : 0) +
      Math.max(0, 1 - (t - 21.2) * 2.4) * (t > 21.2 ? 1 : 0) +
      Math.max(0, 1 - (t - 24.8) * 2.4) * (t > 24.8 ? 1 : 0);
    const lum = (1 - scrDim) * 0.5 + beatGlow * 0.12;
    // room
    cinemaRoom(t, {
      screen: 0.001, beam: 0.7 * (1 - seg(t, 13, 15.5)), lamps: 0,
      extras: true, exclude: { row: 2, x0: 173, x1: 212 },
      midDraw: () => coupleHeads(187, 198, 186, { lum: Math.max(lum, beatGlow * 0.3), leanG: -2, hands: true })
    });
    // film on the screen: the embrace, shrinking into place
    const sc = lerp(1, SCR.w / W, ss(pull));
    const ox = lerp(0, SCR.x, ss(pull)), oy = lerp(0, SCR.y, ss(pull));
    if (t < 14) {
      g.save();
      g.translate(ox, oy); g.scale(sc, sc);
      g.beginPath(); g.rect(0, 0, W, H); g.clip();
      hugShot(18.5 + t * 0.4);
      g.fillStyle = `rgba(8,6,16,${scrDim})`; g.fillRect(0, 0, W, H);
      g.restore();
    } else {
      px(SCR.x, SCR.y, SCR.w, SCR.h, '#0a0814');
    }
    // darkness closes in
    dim(seg(t, 13, 16) * 0.55);
    // the little glowing heart
    if (t >= 16 && t < 28.6) {
      let cell = 2 * seg(t, 16, 17.5);
      let pulseS = 0;
      for (const bt of [18, 21.2, 24.8]) if (t > bt) pulseS = Math.max(pulseS, Math.max(0, 1 - (t - bt) * 2.2));
      cell *= 1 + pulseS * 0.7;
      cell *= 1 - seg(t, 26.5, 28.3);
      if (cell > 0.05) {
        heartSpr(192, 96, cell, 0.7 + pulseS * 0.5);
        glow(192, 96, 60 + pulseS * 50, '#ff4d64', 0.15 + pulseS * 0.3);
      }
      if (t > 28 && t < 28.9) {
        px(192, 96, 1, 1, rgba('#ffffff', 1 - (t - 28) / 0.9));
        glow(192, 96, 14 * (1 - (t - 28)), '#ffffff', 0.8 * (1 - (t - 28) / 0.9));
      }
    }
    // curtains
    const cw = seg(t, 29, 34) * (W / 2 + 6);
    if (cw > 0) {
      for (const side of [0, 1]) {
        for (let x = 0; x < cw; x += 7) {
          const fold = Math.floor(x / 7) % 2;
          const wob = Math.sin(x * 0.4 + t * 1.5) * 1.5;
          const xx = side === 0 ? cw - x - 7 : W - cw + x;
          px(xx, 0, 7, H, fold ? '#6a1522' : '#83202f');
          px(xx + (fold ? 1 : 4), 10 + wob, 1, H, fold ? '#4f0e19' : '#8f2a3a');
        }
        px(side === 0 ? cw - 2 : W - cw, 0, 2, H, '#c8963f');
      }
      // valance
      px(0, 0, W, 12, '#5c1220');
      for (let x = 0; x < W; x += 24) disc(x + 12, 12, 11, '#5c1220');
      px(0, 20, W, 1, rgba('#c8963f', seg(t, 30, 33)));
    }
    dim(seg(t, 35, 40) * 0.85);
  }
});
