// =====================================================================
// 现代浴室（第 1–2、22、25–26 屏）：同一扇窗、同一只漱口杯、同一把牙刷
// =====================================================================
const BR = { bx: 532, by: 868, ang: -Math.PI / 2 - 0.09, L: 250 };      // 杯里的牙刷：刷柄尾、方向、长度（刷毛朝右）
const BP = { x: 680, gy: 1112, s: 1.15, dir: -1 };                       // 镜前的人（朝左站）
const REST = [668, 858];                                                 // 手自然垂下时大约的位置
function brushWorld(b, lx, ly) { const c = Math.cos(b.ang), s = Math.sin(b.ang); return [b.bx + lx * c + ly * s, b.by + lx * s - ly * c]; }
function drawBrush(b, bend, light, warm, a = 1) {
  if (a <= 0.003) return;
  g.save(); g.globalAlpha *= a; g.translate(b.bx, b.by); g.rotate(b.ang); g.scale(1, -1); modernBrush(b.L, bend, light, warm); g.restore();
}
function bathRoom(t, o) {
  const nk = o.night || 0, lamp = o.lamp || 0, win = o.win ?? 1;
  g.fillStyle = rgba(mixc([26, 22, 25], [10, 13, 21], nk), 1); g.fillRect(-500, 0, W + 1000, H);
  g.strokeStyle = rgba(mixc(BEIGE, MOONL, nk), 0.045); g.lineWidth = 1.5;            // 墙砖
  for (let y = 560, r = 0; y < 880; y += 40, r++) { g.beginPath(); g.moveTo(-100, y); g.lineTo(W + 100, y); g.stroke();
    for (let x = (r % 2) * 40 - 80; x < W + 80; x += 80) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 40); g.stroke(); } }
  // 窗：清晨 → 夜里（月光青）
  const wx = 96, wy = 250, ww = 236, wh = 340;
  g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
  const top = mixc(mixc([34, 34, 44], [150, 196, 214], win), [8, 16, 34], nk), bot = mixc(mixc([44, 36, 36], [248, 206, 150], win), [18, 40, 60], nk);
  vgrad([[0, top], [1, bot]], wy, wy + wh);
  if (nk < 0.997) addLight(() => lightPool(236, wy + wh - 40, 210, 140, GOLD, 0.5 * win * (1 - nk)));
  if (nk > 0.003) { g.save(); g.globalAlpha = nk; for (const [x, y, s, p] of STARS.slice(0, 40)) { g.fillStyle = `rgba(225,236,245,${0.5 + 0.3 * Math.sin(t + p)})`; g.beginPath(); g.arc(wx + x % ww, wy + y % 200, s * 0.8, 0, 7); g.fill(); }
    addLight(() => lightPool(272, 330, 90, 90, MOON, 0.45)); g.fillStyle = rgba(MOONL, 1); g.beginPath(); g.arc(272, 330, 24, 0, 7); g.fill(); g.restore(); }
  g.fillStyle = rgba(mixc([66, 52, 56], [6, 10, 20], nk), 1); g.beginPath(); g.moveTo(wx, wy + wh - 54); g.quadraticCurveTo(wx + 60, wy + wh - 110, wx + 118, wy + wh - 78);
  g.lineTo(wx + 150, wy + wh - 96); g.lineTo(wx + 190, wy + wh - 80); g.lineTo(wx + ww, wy + wh - 70); g.lineTo(wx + ww, wy + wh); g.lineTo(wx, wy + wh); g.closePath(); g.fill();
  g.restore();
  g.strokeStyle = '#0b090b'; g.lineWidth = 10; g.strokeRect(wx, wy, ww, wh); g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.moveTo(wx, wy + wh * 0.45); g.lineTo(wx + ww, wy + wh * 0.45); g.stroke();
  g.strokeStyle = rgba(mixc(GOLDL, MOONL, nk), 0.25); g.lineWidth = 2; g.strokeRect(wx - 6, wy - 6, ww + 12, wh + 12);
  g.fillStyle = '#18131a'; g.fillRect(wx - 16, wy + wh + 4, ww + 32, 14);
  // 窗光斜照进来
  const lc = mixc(mixc([230, 226, 214], GOLDL, 0.6), MOON, nk), la = lerp(0.15 * win, 0.08, nk);
  addLight(() => { const gr = g.createLinearGradient(wx + ww, wy, 760, 900); gr.addColorStop(0, rgba(lc, la)); gr.addColorStop(1, rgba(lc, 0));
    g.fillStyle = gr; g.beginPath(); g.moveTo(wx + ww, wy + 20); g.lineTo(wx + ww, wy + wh); g.lineTo(700, 880); g.lineTo(860, 880); g.closePath(); g.fill();
    lightPool(560, 882, 320, 26, lc, la * 1.5); });
  // 镜子
  const mx0 = 400, my0 = 296, mw = 300, mh = 430;
  const mg = g.createLinearGradient(mx0, my0, mx0 + mw, my0 + mh); mg.addColorStop(0, rgba(mixc([46, 46, 52], [26, 36, 48], nk), 1)); mg.addColorStop(1, rgba(mixc([20, 18, 22], [10, 14, 22], nk), 1));
  g.fillStyle = mg; rr(mx0, my0, mw, mh, 10); g.fill();
  g.strokeStyle = rgba(BEIGE, 0.05); g.lineWidth = 16; g.beginPath(); g.moveTo(mx0 + 40, my0 + 120); g.lineTo(mx0 + 150, my0 + 10); g.moveTo(mx0 + 60, my0 + 230); g.lineTo(mx0 + 260, my0 + 30); g.stroke();
  if ((o.ghost || 0) > 0.003) {   // 镜中淡淡的竖排古字影子
    g.save(); g.beginPath(); rr(mx0, my0, mw, mh, 10); g.clip(); g.globalAlpha = o.ghost; g.filter = 'blur(1.2px)';
    g.font = `600 50px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = rgba(INK, 1); g.shadowColor = rgba(LAMP, 0.6); g.shadowBlur = 16;
    [...X.v24b].forEach((ch, i) => g.fillText(ch, 642, 372 + i * 62)); g.restore();
  }
  g.strokeStyle = rgba(mixc(BEIGE, MOONL, nk), 0.28); g.lineWidth = 3; rr(mx0, my0, mw, mh, 10); g.stroke();
  // 镜上的灯
  g.fillStyle = '#1e1816'; rr(470, 262, 160, 18, 9); g.fill();
  if (lamp > 0.003) { g.fillStyle = rgba(LAMP, lamp); rr(478, 277, 144, 6, 3); g.fill();
    addLight(() => { const gr = g.createLinearGradient(0, 280, 0, 900); gr.addColorStop(0, rgba(LAMP, 0.26 * lamp)); gr.addColorStop(1, rgba(LAMP, 0.05 * lamp));
      g.fillStyle = gr; g.beginPath(); g.moveTo(480, 282); g.lineTo(620, 282); g.lineTo(790, 884); g.lineTo(310, 884); g.closePath(); g.fill();
      lightPool(550, 284, 130, 34, LAMP, 0.55 * lamp); lightPool(540, 884, 280, 30, LAMP, 0.4 * lamp); lightPool(530, 720, 130, 170, LAMP, 0.16 * lamp); }); }
  // 洗手台、柜门、水龙头
  const cg = g.createLinearGradient(0, 880, 0, 910); cg.addColorStop(0, rgba(mixc([76, 66, 60], [46, 52, 62], nk), 1)); cg.addColorStop(1, '#151214');
  g.fillStyle = cg; g.fillRect(30, 880, 1020, 28);
  g.fillStyle = rgba(mixc(mixc(GOLDL, MOONL, nk), LAMP, lamp * 0.6), 0.35); g.fillRect(30, 879, 1020, 2);
  g.fillStyle = '#0d0b0c'; g.fillRect(50, 908, 980, 700);
  g.strokeStyle = 'rgba(255,255,255,0.035)'; g.lineWidth = 2; for (const x of [300, 560, 820]) { g.beginPath(); g.moveTo(x, 930); g.lineTo(x, 1500); g.stroke(); }
  g.fillStyle = '#141113'; rr(842, 846, 26, 36, 4); g.fill();
  g.strokeStyle = '#141113'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(855, 850); g.lineTo(855, 800); g.quadraticCurveTo(855, 770, 822, 772); g.lineTo(810, 786); g.stroke();
  g.strokeStyle = rgba(mixc(GOLDL, MOONL, nk), 0.35); g.lineWidth = 2; g.beginPath(); g.moveTo(849, 846); g.lineTo(849, 800); g.quadraticCurveTo(849, 778, 822, 778); g.stroke();
}
function cup(x, nk, lamp) {
  const yb = 880, h = 118, tw = 86, bw = 70;
  g.save();
  g.fillStyle = rgba(mixc([200, 220, 230], [120, 170, 190], nk), 0.12 + 0.06 * lamp);
  g.beginPath(); g.moveTo(x - tw / 2, yb - h); g.lineTo(x + tw / 2, yb - h); g.lineTo(x + bw / 2, yb); g.lineTo(x - bw / 2, yb); g.closePath(); g.fill();
  g.strokeStyle = rgba(mixc(mixc([235, 240, 242], MOONL, nk), LAMP, lamp * 0.5), 0.6); g.lineWidth = 2.4; g.stroke();
  g.strokeStyle = rgba(mixc([255, 255, 255], LAMP, lamp), 0.45); g.lineWidth = 4; g.beginPath(); g.moveTo(x - tw / 2 + 13, yb - h + 12); g.lineTo(x - bw / 2 + 10, yb - 12); g.stroke();
  g.beginPath(); g.ellipse(x, yb - h, tw / 2, 7, 0, 0, 7); g.strokeStyle = 'rgba(235,240,242,0.5)'; g.lineWidth = 2; g.stroke();
  g.fillStyle = 'rgba(200,220,230,0.2)'; g.fillRect(x - bw / 2 + 3, yb - 10, bw - 6, 8);
  g.restore();
}
function bathFig(o) {
  const { gy, s, dir } = BP, x = o.x ?? BP.x;
  const fo = { hair: 'short', lean: 0.03, tilt: o.tilt ?? 0.06, walk: o.walk, amp: o.amp, legA: o.legA };
  if (o.hand) fo.handN = WL(x, gy, s, dir, o.hand);
  const f = standSide(fo);
  silA(o.a ?? 1, at(x, gy, s, dir, f.draw), o.rim, o.rimA, -3, -2, 14);
}
const RIM_AM = mixc(GOLDL, BEIGE, 0.5);
function bathA(t) {   // 第 1 屏：窗光变亮，人走到镜前，抬手拿起牙刷；第 2 屏：牙刷淡掉，只剩空杯
  const t2 = T(2), win = 0.3 + 0.7 * R(t, 0, 2.8);
  const px = lerp(1030, BP.x, RE(t, 0.1, 1.9)), walking = t < 1.95;
  const reach = RE(t, 1.95, 2.7), lift = RE(t, 2.8, 3.35), back = RE(t, t2 + 0.55, t2 + 1.3);
  const grip0 = brushWorld(BR, BR.L * 0.55, 0);
  const hand = reach > 0 && back < 1 ? [lerp(REST[0], grip0[0] + 8, reach * (1 - back)), lerp(REST[1], grip0[1] - 46 * lift, reach * (1 - back))] : undefined;
  const ba = 1 - R(t, t2 + 0.05, t2 + 0.75);
  bathRoom(t, { win });
  drawBrush(reach >= 1 ? { ...BR, by: BR.by - 46 * lift } : BR, 0, 0.55 + 0.45 * win, 0, ba);
  cup(540, 0, 0);
  bathFig({ x: px, walk: walking ? (1030 - px) * 0.05 : undefined, amp: 0.22 * (1 - R(t, 1.55, 1.95)), tilt: 0.06 + 0.04 * (1 - R(t, 1.55, 1.95)), legA: walking ? undefined : [0.13 * R(t, 1.95, 2.3), -0.03 * R(t, 1.95, 2.3)],
    hand, rim: RIM_AM, rimA: 0.35 + 0.45 * win });
}
function bathClose(t) {   // 第 22 屏：杯里那把牙刷特写，软毛被轻轻按下、弯下去再弹回
  const t22 = T(22), head = brushWorld(BR, BR.L * 0.86, -34);
  const c = camMix(CM(head[0] + 4, 708, 2.7), CM(head[0] + 8, 733, 3.15), RE(t, t22, E(22) + 0.6));
  const press = RE(t, t22 + 0.55, t22 + 1.15), rel = t22 + 1.55;
  const b = t < rel ? press : Math.exp(-4.2 * (t - rel)) * Math.cos(10.5 * (t - rel));
  const bh = 0.15 * BR.L, xm = 0.9 * BR.L, tip = brushWorld(BR, xm - Math.max(0, b) * bh * 0.55, -7 - bh * (1 - 0.28 * Math.max(0, b)));
  const appr = RE(t, t22 + 0.1, t22 + 0.6), away = RE(t, rel, rel + 0.5);
  const P = [tip[0] + 3 + 90 * (1 - appr) + 90 * away, tip[1] - 2 + 14 * away];
  cam(c, () => {
    bathRoom(t, { win: 1 });
    drawBrush(BR, b, 1, 0); cup(540, 0, 0);
    const B = [P[0] + 300, P[1] + 70], Wr = wristFor(B, P, 0.82, 'point', true, -0.1);
    armHand(B, Wr, 0.82, 'point', RIM_AM, 0.8, { flip: true, dx: -1, dy: -1, blur: 5, rot: -0.1 });
  });
}
function bathEnd(t0) {   // 第 25 屏：刷完，牙刷放回杯里；第 26 屏：窗外由晨变夜，灯亮，镜中古字一闪淡去；最后约 1.2 秒停住
  const t = Math.min(t0, FREEZE), t25 = T(25), t26 = T(26);
  const nk = RE(t, t26 + 0.1, t26 + 1.9), lamp = R(t, t26 + 1.5, t26 + 1.65) * (1 - 0.55 * pulses(t, [t26 + 1.78], 0.04, 0.03, 0.1));
  const grip0 = brushWorld(BR, BR.L * 0.55, 0), down = RE(t, t25 + 0.3, t25 + 1.35), held = t < t25 + 1.42, away = RE(t, t25 + 1.5, t25 + 2.3);
  const hand = held ? [grip0[0] + 8, grip0[1] - 70 * (1 - down)] : away < 1 ? [lerp(grip0[0] + 8, REST[0], away), lerp(grip0[1], REST[1], away)] : undefined;
  const b = held ? { ...BR, by: BR.by - 70 * (1 - down) } : BR;
  const ghost = 0.42 * R(t, t26 + 2.0, t26 + 2.6) * (1 - R(t, t26 + 3.0, t26 + 3.5));
  bathRoom(t, { night: nk, lamp, win: 1, ghost });
  drawBrush(b, 0, lerp(1, 0.55, nk) + 0.45 * lamp, lamp);
  if (lamp > 0.003) addLight(() => lightPool(522, 700, 70, 120, LAMP, 0.22 * lamp));
  cup(540, nk, lamp);
  const pa = 1 - R(t, t26 + 0.2, t26 + 1.2);
  if (pa > 0.003) bathFig({ hand, a: pa, rim: mixc(RIM_AM, MOONL, nk), rimA: 0.8 });
}

// =====================================================================
// 古代院落（第 2–3 屏）：屋檐、井、远山；一人打哈欠，嘴边一缕气流线，旁人往后让
// =====================================================================
function well(x, gy) {
  g.beginPath(); g.ellipse(x, gy - 70, 82, 16, 0, 0, 7); g.fill(); g.fillRect(x - 82, gy - 70, 164, 70);
  g.fillRect(x - 72, gy - 236, 11, 170); g.fillRect(x + 61, gy - 236, 11, 170);
  roofPath(x - 92, x + 92, gy - 236, 46, { ov: 16, lift: 12 }); g.fill();
  g.fillRect(x - 66, gy - 190, 132, 12); g.fillRect(x - 1.5, gy - 180, 3, 66);
  g.beginPath(); g.moveTo(x - 18, gy - 116); g.lineTo(x + 18, gy - 116); g.lineTo(x + 14, gy - 86); g.lineTo(x - 14, gy - 86); g.closePath(); g.fill();
}
function yard(t) {
  const t2 = T(2), t3 = T(3), c = CM(540, 640, 1 + 0.04 * ramp(t, t2 + 0.9, T(4) + 0.7));
  vgrad([[0, [12, 10, 20]], [0.3, [28, 20, 32]], [0.44, [96, 62, 58]], [0.51, [214, 150, 92]], [0.545, [242, 192, 122]], [0.56, [30, 20, 16]], [1, [8, 6, 6]]]);
  cam(c, () => {
    addLight(() => lightPool(640, 1010, 560, 160, GOLD, 0.4));
    ridge(3, 990, 150, [88, 58, 66]); ridge(4, 1030, 90, [46, 31, 38]);
    vgrad([[0, [24, 17, 14]], [1, [6, 5, 6]]], 1052, 1700); g.fillStyle = rgba(GOLD, 0.25); g.fillRect(-200, 1052, W + 400, 2);
    sil(() => { g.fillRect(-120, 470, 410, 600); }, GOLD, 0.25, 3, -2, 12, '#0c090b');
    g.fillStyle = 'rgba(150,96,56,0.22)'; g.fillRect(70, 700, 120, 356);
    roof(-140, 330, 470, 130, '#0c090b', { ov: 50, lift: 34, rim: GOLD, rimA: 0.5, horn: 16, tiles: GOLDL });
    sil(() => well(870, GY), GOLD, 0.55, 0, -3, 12);
    const oA = { hair: 'topknot', robe: true, lean: 0.02, tilt: 0.04 - 0.42 * RE(t, t3, t3 + 0.4) * (1 - RE(t, t3 + 1.2, t3 + 1.7)), legA: [0.12, -0.03] };
    const fA = fig(410, GY, 0.85, 1, oA, GOLD, 0.8);
    const lb = RE(t, t3 + 0.55, t3 + 1.05);
    const oB = { hair: 'tang', robe: true, lean: 0.02 - 0.17 * lb, tilt: 0.05 - 0.14 * lb, legA: [0.1 - 0.06 * lb, -0.04 - 0.08 * lb] };
    fig(660, GY, 0.85, -1, oB, GOLD, 0.8);
    const m = LW(410, GY, 0.85, 1, mouthOf(fA, oA));
    breath(m[0] + 4, m[1], 0.98, -0.2, (t - t3 - 0.25) / 1.6, 1, 175, 2);
  });
}

// =====================================================================
// 经卷与僧人（第 4 屏）
// =====================================================================
const MONKS = [[150, 0.66], [345, 0.7], [540, 0.72], [735, 0.7], [930, 0.66]];
const LOBES = [[250, 560], [400, 470], [560, 430], [720, 480], [870, 570], [560, 590]];
const CANOPY = (() => { const r = rng(9), a = []; LOBES.forEach(([cx, cy]) => { for (let i = 0; i < 5; i++) a.push([cx + (r() - 0.5) * 110, cy + (r() - 0.5) * 70, 30 + r() * 30]); }); return a; })();
const LEAVES = (() => { const r = rng(10), a = []; for (let i = 0; i < 260; i++) { const c = CANOPY[i % CANOPY.length], an = r() * 6.28; a.push([c[0] + Math.cos(an) * c[2] * (0.95 + r() * 0.2), c[1] + Math.sin(an) * c[2] * (0.95 + r() * 0.2), r() * 6.28, 9 + r() * 6]); } return a; })();
const INKS = (() => { const r = rng(12), a = []; for (const y of [-44, -18, 8, 34]) { let x = -380; while (x < 380) { const l = 18 + r() * 60; a.push([x, y, Math.min(l, 380 - x)]); x += l + 10 + r() * 16; } } return a; })();
function tree() {
  cap(540, 1062, 44, 540, 760, 30); cap(540, 800, 22, 400, 600, 11); cap(400, 600, 11, 250, 570, 6); cap(540, 780, 22, 720, 590, 11); cap(720, 590, 11, 870, 580, 6);
  cap(540, 760, 20, 560, 470, 10); cap(470, 700, 12, 400, 480, 6); cap(620, 700, 12, 720, 490, 6);
  for (const [x, y, r] of CANOPY) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  for (const [x, y, a, s] of LEAVES) { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(0, -s); g.quadraticCurveTo(s * 0.9, -s * 0.2, 0, s * 1.3); g.quadraticCurveTo(-s * 0.9, -s * 0.2, 0, -s); g.fill(); g.restore(); }
}
function scroll(cx, cy, k, a) {
  if (a <= 0.003) return;
  const hw = 410 * k + 14, h = 150;
  g.save(); g.globalAlpha *= a;
  g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 20;
  const pg = g.createLinearGradient(0, cy - h / 2, 0, cy + h / 2); pg.addColorStop(0, '#e4d6b4'); pg.addColorStop(1, '#bba680');
  g.fillStyle = pg; g.fillRect(cx - hw, cy - h / 2, hw * 2, h); g.shadowBlur = 0;
  g.fillStyle = '#6e3420'; g.fillRect(cx - hw, cy - h / 2, hw * 2, 10); g.fillRect(cx - hw, cy + h / 2 - 10, hw * 2, 10);
  g.save(); g.beginPath(); g.rect(cx - hw + 18, cy - h / 2, hw * 2 - 36, h); g.clip();
  g.strokeStyle = 'rgba(38,24,16,0.78)'; g.lineWidth = 5; g.lineCap = 'round';
  for (const [x, y, l] of INKS) { g.beginPath(); g.moveTo(cx + x, cy + y); g.lineTo(cx + x + l, cy + y); g.stroke(); }
  g.restore();
  for (const sx of [-1, 1]) { const x = cx + sx * hw; g.fillStyle = '#3a2416'; rr(x - 13, cy - h / 2 - 18, 26, h + 36, 8); g.fill();
    g.fillStyle = rgba(GOLD, 0.9); g.fillRect(x - 9, cy - h / 2 - 26, 18, 10); g.fillRect(x - 9, cy + h / 2 + 16, 18, 10);
    g.fillStyle = 'rgba(255,230,190,0.25)'; g.fillRect(x - 9, cy - h / 2 - 18, 5, h + 36); }
  g.restore();
}
function sutra(t) {
  const t4 = T(4), td = WC(4, '弟子');
  vgrad([[0, [10, 8, 14]], [0.36, [26, 18, 22]], [0.53, [56, 36, 30]], [0.56, [16, 11, 10]], [1, [6, 5, 5]]]);
  cam(CM(540, 650, 1.05 - 0.05 * ramp(t, t4, E(4) + 0.7)), () => {
    addLight(() => lightPool(540, 1000, 620, 220, WARM, 0.24));
    vgrad([[0, [22, 15, 12]], [1, [6, 5, 5]]], 1050, 1700);
    sil(tree, GOLD, 0.3, 0, -3, 16, '#0b0809');
    const ms = MONKS.map(([x, s]) => { const m = monkSit(); sil(at(x, GY - 4, s, 1, m.draw), WARM, 0.75, 0, -3, 12); return m; });
    [[1, t4 + 0.25, 1], [3, t4 + 1.2, -1], [4, td, 1], [0, td + 0.35, -1], [2, td + 0.7, 1]].forEach(([i, ts, d], k) => {
      const [x, s] = MONKS[i], hd = ms[i].f.Hd, mx = x + s * hd[0], my = GY - 4 + s * (hd[1] - 26 + 13);
      breath(mx + d * 6, my, d * 0.72, -0.69, (t - ts) / 1.7, 1, 120, k * 1.3);
    });
  });
  scroll(540, 352, RE(t, t4 + 0.1, t4 + 1.5), R(t, t4, t4 + 0.3));
}

// =====================================================================
// 光里递下树枝，落进展柜；一头嚼成絮（第 5–6 屏）
// =====================================================================
function gift(t) {
  const t5 = T(5), t6 = T(6), tr = WC(5, '小树枝') - 0.1;
  vgrad([[0, [18, 13, 14]], [0.45, [10, 8, 11]], [1, [5, 4, 6]]]);
  const shaft = R(t, t5, t5 + 0.6) * (1 - 0.7 * R(t, tr + 0.4, t6 + 0.6));
  const vit = R(t, tr + 0.3, tr + 1.1);
  const c = camMix(WIDE, CM(690, 640, 1.32), RE(t, t6 + 0.2, t6 + 3.6));
  cam(c, () => {
    addLight(() => { const gr = g.createLinearGradient(0, 140, 0, 840); gr.addColorStop(0, rgba(GOLDL, 0.4 * shaft)); gr.addColorStop(1, rgba(GOLD, 0));
      g.fillStyle = gr; g.beginPath(); g.moveTo(60, 60); g.lineTo(420, 60); g.lineTo(900, 840); g.lineTo(330, 840); g.closePath(); g.fill();
      lightPool(300, 170, 320, 140, GOLDL, 0.38 * shaft); });
    vitrine(vit);
    const down = RE(t, t5 + 0.05, t5 + 1.05), up = RE(t, tr + 0.35, tr + 1.4), held = t < tr;
    const G = [lerp(lerp(250, 420, down), 210, up), lerp(lerp(60, 392, down), 40, up)];
    const fall = RE(t, tr, tr + 0.6);
    const tw = held ? [G[0] + 170, G[1] + 4] : [lerp(G[0] + 170, 540, fall), lerp(392 + 4, 640, fall)];
    const fray = RE(t, t6 + 0.2, t6 + 3.3);
    twig(tw[0], tw[1], 520, 24, held ? -0.06 : lerp(-0.06, 0, fall), fray, 1, { glow: vit });
    const fl = R(t, tr + 0.5, tr + 0.6) * (1 - R(t, tr + 0.65, tr + 1.45));
    if (fl > 0.003) addLight(() => lightPool(540, 640, 320, 80, GOLDL, 0.35 * fl));
    if (up < 1) { const B = [G[0] - 330, G[1] - 300], pose = held ? 'pinch' : 'open', Wr = wristFor(B, G, 1.7, pose, false, -0.45);
      armHand(B, Wr, 1.7, pose, GOLDL, 0.9, { sleeve: true, blur: 16, rot: -0.45 }); }
  });
}

// =====================================================================
// 印度晨光（第 7 屏）：棕榈、神庙屋顶；大人和三岁小孩各拿一根小树枝
// =====================================================================
function palm(x, gy, h, lean, t, ph) {
  const pts = []; for (let i = 0; i <= 10; i++) { const k = i / 10; pts.push([x + lean * h * k * k, gy - h * k]); }
  for (let i = 0; i < 10; i++) cap(pts[i][0], pts[i][1], lerp(15, 8, i / 10), pts[i + 1][0], pts[i + 1][1], lerp(15, 8, (i + 1) / 10));
  const top = pts[10];
  g.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const a0 = -Math.PI / 2 + (i - 4) * 0.4 + Math.sin(t * 0.9 + ph + i) * 0.035, len = 150 + (i % 3) * 26;
    const P = k => [top[0] + Math.cos(a0) * len * k, top[1] + Math.sin(a0) * len * k + len * 0.6 * k * k];
    g.lineWidth = 5; g.beginPath(); for (let j = 0; j <= 12; j++) { const p = P(j / 12); j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.stroke();
    g.lineWidth = 2.6;
    for (let j = 2; j <= 12; j++) { const k = j / 12, p = P(k), ll = 36 * (1 - k * 0.55), sd = Math.cos(a0) >= 0 ? 1 : -1;
      g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] + sd * ll * 0.5, p[1] + ll * 0.85); g.moveTo(p[0], p[1]); g.lineTo(p[0] - sd * ll * 0.25, p[1] + ll * 0.9); g.stroke(); }
  }
}
function shikhara(x, gy, h) {
  g.fillRect(x - 74, gy - 90, 148, 90);
  g.beginPath(); g.moveTo(x - 60, gy - 90); g.bezierCurveTo(x - 62, gy - h * 0.6, x - 40, gy - h * 0.9, x - 10, gy - h); g.lineTo(x + 10, gy - h);
  g.bezierCurveTo(x + 40, gy - h * 0.9, x + 62, gy - h * 0.6, x + 60, gy - 90); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(x, gy - h - 6, 22, 9, 0, 0, 7); g.fill(); g.fillRect(x - 2, gy - h - 40, 4, 34);
}
function twigInHand(r, len, w, turn) {
  const [ex, ey, wx, wy] = r.wN, a = Math.atan2(wy - ey, wx - ex), hx = wx + Math.cos(a) * r.d.hl * 0.5, hy = wy + Math.sin(a) * r.d.hl * 0.5, b = a + turn;
  g.save(); g.strokeStyle = 'rgb(206,170,120)'; g.lineWidth = w; g.lineCap = 'round';
  g.beginPath(); g.moveTo(hx - Math.cos(b) * len * 0.25, hy - Math.sin(b) * len * 0.25); g.lineTo(hx + Math.cos(b) * len * 0.75, hy + Math.sin(b) * len * 0.75); g.stroke(); g.restore();
}
function india(t) {
  const t7 = T(7);
  vgrad([[0, [14, 10, 24]], [0.3, [42, 26, 46]], [0.45, [150, 82, 66]], [0.53, [246, 168, 92]], [0.552, [255, 204, 128]], [0.556, [26, 16, 12]], [1, [6, 4, 4]]]);
  const sy = lerp(1120, 985, RE(t, t7, E(7) + 0.6));
  addLight(() => { lightPool(540, sy, 380, 240, GOLD, 0.5); lightPool(540, sy, 120, 120, GOLDL, 0.6); });
  g.fillStyle = 'rgb(255,232,180)'; g.beginPath(); g.arc(540, sy, 62, 0, 7); g.fill();
  const col = '#120c10';
  ridge(17, 1048, 30, [40, 24, 26]);
  g.fillStyle = col; g.fillRect(-20, 1060, W + 40, 900);
  sil(() => { shikhara(830, 1062, 330); g.fillRect(660, 990, 110, 72); g.fillRect(900, 1000, 150, 62); g.fillRect(170, 1004, 130, 58); }, GOLD, 0.4, 0, -3, 14, col);
  sil(() => { palm(80, 1062, 560, 0.2, t, 0); palm(1010, 1062, 480, -0.22, t, 2); palm(250, 1062, 300, -0.1, t, 4); }, GOLD, 0.45, 0, -3, 14, col);
  const oA = { hair: 'topknot', robe: true, lean: 0.03, tilt: 0.02, legA: [0.12, -0.03] };
  const fA = standSide(oA); const mA = mouthOf(fA, oA); oA.handN = [mA[0] - 6, mA[1] + 34]; oA.extra = r => twigInHand(r, 46, 5, -1.3);
  silA(1, at(440, GY, 0.9, 1, fA.draw), GOLD, 0.9, 0, -3, 14);
  const k = RE(t, t7 + 0.5, t7 + 1.4);
  const oK = { kid: true, hair: 'topknot', lean: 0.02, tilt: -0.04 + 0.04 * k, legA: [0.12, -0.03] };
  const fK = standSide(oK), mK = mouthOf(fK, oK), dk = fK.d, hang = [fK.S[0] + 10, fK.S[1] + (dk.ua + dk.fa) * 0.86];
  oK.handN = [lerp(hang[0], mK[0] - 4, k), lerp(hang[1], mK[1] + 26, k)]; oK.extra = r => twigInHand(r, 40, 4.5, lerp(0, -1.3, k));
  silA(1, at(650, GY, 0.95, -1, fK.draw), GOLD, 0.9, 0, -3, 14);
}

// =====================================================================
// 唐代庭院（第 8 屏）：垂柳摆动；一只手折下一根柳枝，咬软的一头蘸药粉，粉尘扬起
// =====================================================================
const WIL = (() => { const r = rng(88), a = []; for (let i = 0; i < 42; i++) { const x = -60 + r() * 780; a.push([x, 238 + Math.abs(x - 300) * 0.16 + r() * 40, 340 + r() * 380, r() * 6.28]); }
  a.push([598, 262, 560, 1.3]); return a; })();
const S0 = WIL.length - 1;
const PUFF = (() => { const r = rng(91), a = []; for (let i = 0; i < 34; i++) a.push([(r() - 0.5) * 2, r(), r(), 1.5 + r() * 2.5]); return a; })();
function strandPts(x0, y0, L, t, ph, k1 = 1, extra = 0) {
  const pts = []; for (let i = 0; i <= 24; i++) { const k = (i / 24) * k1; pts.push([x0 + (Math.sin(t * 1.15 + ph) * 18 + Math.sin(t * 0.5 + ph * 2) * 8 + extra) * Math.pow(k, 1.6), y0 + L * k]); }
  return pts;
}
function drawStrand(pts, lw) {
  g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
  for (let i = 2; i < pts.length; i += 2) { const p = pts[i], sd = i % 4 ? 1 : -1; g.save(); g.translate(p[0], p[1]); g.rotate(sd * 0.55 + 1.57); g.beginPath(); g.ellipse(8, 0, 10, 2.6, 0, 0, 7); g.fill(); g.restore(); }
}
function willow(t) {
  const t8 = T(8), tS = t8 + 1.6, tb = WC(8, '咬软'), td = WC(8, '蘸') - 0.15;
  vgrad([[0, [24, 18, 26]], [0.32, [70, 48, 46]], [0.5, [188, 136, 88]], [0.552, [222, 170, 110]], [0.556, [24, 17, 13]], [1, [6, 5, 5]]]);
  const [sx, sy, sL, sph] = WIL[S0], Gp = strandPts(sx, sy, sL, tS, sph)[12];
  const reach = RE(t, t8 + 0.5, t8 + 1.4), carry = RE(t, tS + 0.2, tS + 1.2), dip = 46 * RE(t, td, td + 0.35) - 46 * RE(t, td + 0.55, td + 1.0);
  const live = strandPts(sx, sy, sL, t, sph)[12];
  let G = t < tS ? [lerp(1160, live[0] + 2, reach), lerp(600, live[1], reach)] : [lerp(Gp[0] + 2, 742, carry), lerp(Gp[1], 760, carry) + dip];
  cam(CM(540, 640, 1.02 + 0.03 * ramp(t, t8, E(8))), () => {
    addLight(() => lightPool(620, 1040, 600, 200, GOLD, 0.3));
    ridge(21, 1030, 70, [70, 48, 46]);
    sil(() => { g.fillRect(600, 640, 520, 430); }, GOLD, 0.2, 0, -3, 10, '#0f0b0c');
    g.fillStyle = 'rgba(170,110,60,0.3)'; g.fillRect(760, 760, 150, 150); g.strokeStyle = '#0f0b0c'; g.lineWidth = 6; for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(760 + i * 30, 760); g.lineTo(760 + i * 30, 910); g.moveTo(760, 760 + i * 30); g.lineTo(910, 760 + i * 30); g.stroke(); }
    roof(560, 1150, 640, 120, '#0f0b0c', { ov: 40, lift: 26, rim: GOLD, rimA: 0.45, horn: 14, tiles: GOLDL });
    vgrad([[0, [26, 18, 14]], [1, [6, 5, 5]]], 1058, 1700);
    // 桌、药粉碟
    sil(() => { g.fillRect(470, 1002, 290, 12); g.fillRect(486, 1012, 10, 60); g.fillRect(734, 1012, 10, 60); }, GOLD, 0.5, 0, -2, 8);
    addLight(() => lightPool(596, 992, 120, 40, GOLD, 0.3));
    g.fillStyle = '#2a2420'; g.beginPath(); g.ellipse(596, 996, 64, 13, 0, 0, 7); g.fill(); g.fillRect(560, 996, 72, 6);
    g.fillStyle = 'rgb(232,206,122)'; g.beginPath(); g.ellipse(596, 992, 46, 8, 0, Math.PI, 0); g.fill(); g.beginPath(); g.ellipse(596, 993, 46, 6, 0, 0, Math.PI); g.fill();
    // 柳树
    sil(() => {
      cap(170, 1062, 34, 220, 700, 26); cap(220, 700, 26, 250, 360, 18); cap(250, 420, 16, 80, 250, 8); cap(250, 380, 16, 470, 240, 8); cap(430, 250, 10, 660, 262, 6);
      WIL.forEach(([x, y, L, ph], i) => {
        if (i === S0) { if (t < tS) drawStrand(strandPts(x, y, L, t, ph), 4.2);
          else { const sp = Math.sin(9 * (t - tS)) * Math.exp(-3 * (t - tS)) * 28; drawStrand(strandPts(x, y, L, t, ph, 0.5, sp), 4.2); } }
        else drawStrand(strandPts(x, y, L, t, ph), 2.6);
      });
    }, GOLD, 0.5, 0, -3, 10, '#120e0c');
    // 折下的柳枝：手拿着，咬软的一头散开，蘸药粉
    if (t >= tS) { const ang = lerp(Math.PI / 2, 2.25, carry), Lw = 232;
      twig(G[0] + Math.cos(ang) * (Lw / 2 - 16), G[1] + Math.sin(ang) * (Lw / 2 - 16), Lw, 8, ang, 0.62 * RE(t, tb - 0.1, tb + 0.6), 1,
        { col: [[150, 132, 82], [96, 84, 48], [42, 38, 22]], leaves: 5, noKnot: true, fl: 0.22, tip: [[236, 206, 112], R(t, td + 0.3, td + 0.5)] }); }
    const B = [G[0] + 420, G[1] + 150], Wr = wristFor(B, G, 1.35, 'pinch', true, 0.2);
    armHand(B, Wr, 1.35, 'pinch', GOLD, 0.85, { sleeve: true, flip: true, rot: 0.2, blur: 12 });
    // 粉尘扬起
    const pu = t - (td + 0.35);
    if (pu > 0 && pu < 1.6) { g.save(); g.globalCompositeOperation = 'lighter';
      for (const [dx, sp, ph, sz] of PUFF) { const k = pu / 1.6, x = 596 + dx * 60 * (0.3 + k) + Math.sin(pu * 3 + ph * 6) * 6, y = 990 - (20 + 90 * sp) * Math.sqrt(k);
        const al = (1 - k) * R(pu, 0, 0.1) * 0.55; g.fillStyle = `rgba(240,212,130,${al})`; g.beginPath(); g.arc(x, y, sz * (1 + k), 0, 7); g.fill(); }
      g.restore(); }
  });
}

// =====================================================================
// 盐碗（第 9 屏）：展柜里一只白瓷小碗，手指伸进去蘸一下，指尖沾着亮晶晶的盐
// =====================================================================
function salt(t) {
  const t9 = T(9), td = WC(9, '蘸') - 0.05;
  vgrad([[0, [14, 11, 13]], [0.5, [9, 8, 10]], [1, [5, 4, 6]]]);
  vitrine(1);
  const dipf = pulses(t, [td + 0.05], 0.1, 0.2, 0.6);
  bowl(540, 712, 1, 'salt', t, 1, 1 + 0.25 * dipf);
  const k1 = RE(t, t9 + 0.15, td - 0.3), k2 = RE(t, td - 0.3, td + 0.05), k3 = RE(t, td + 0.45, td + 1.25);
  let P = [lerp(980, 610, k1), lerp(120, 570, k1)]; P = [lerp(P[0], 552, k2), lerp(P[1], 704, k2)]; P = [lerp(P[0], 650, k3), lerp(P[1], 540, k3)];
  const B = [P[0] + 560, P[1] - 470], Wr = wristFor(B, P, 1.75, 'point', false, 0.3);
  armHand(B, Wr, 1.75, 'point', GOLDL, 0.85, { blur: 12, rot: 0.3, sleeve: true });
  if (t > td) { g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 12; i++) { const a = i * 2.4, rr0 = 4 + (i % 4) * 2.6, b = 0.55 + 0.45 * Math.pow(0.5 + 0.5 * Math.sin(t * (3 + i % 3) + i), 3);
      const x = P[0] + Math.cos(a) * rr0, y = P[1] + Math.sin(a) * rr0 * 0.6 + 3;
      g.fillStyle = `rgba(255,255,248,${b * R(t, td, td + 0.15)})`; g.beginPath(); g.arc(x, y, 1.6 + (i % 3) * 0.6, 0, 7); g.fill(); }
    addLight(() => lightPool(P[0], P[1] + 2, 26, 20, [255, 255, 245], 0.4 * R(t, td, td + 0.15))); g.restore(); }
}

// =====================================================================
// 夜海靠岸（第 10 屏）：帆船靠岸，"1223"浮现后退到背景，戴斗笠的和尚下船
// =====================================================================
function junk() {
  g.beginPath(); g.moveTo(-162, -62); g.lineTo(-120, -34); g.lineTo(120, -34); g.quadraticCurveTo(170, -44, 192, -72); g.quadraticCurveTo(172, 6, 110, 22); g.lineTo(-110, 22); g.quadraticCurveTo(-152, 14, -162, -62); g.closePath(); g.fill();
  g.fillRect(-26, -272, 7, 240); g.fillRect(66, -214, 6, 184); g.fillRect(-140, -112, 5, 84);
  g.beginPath(); g.moveTo(-22, -264); g.lineTo(-118, -250); g.lineTo(-132, -74); g.lineTo(-22, -60); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(70, -206); g.lineTo(2, -196); g.lineTo(-6, -72); g.lineTo(70, -64); g.closePath(); g.fill();
}
function sea(t) {
  const t10 = T(10), shipX = lerp(150, 470, RO(t, t10, t10 + 2.0)), bob = Math.sin(t * 1.6) * 3;
  vgrad([[0, [5, 8, 18]], [0.3, [10, 18, 34]], [0.45, [18, 30, 50]], [0.47, [10, 16, 28]], [1, [3, 5, 9]]]);
  stars(t, 0.9, 760);
  addLight(() => lightPool(830, 300, 180, 180, MOON, 0.35)); g.fillStyle = rgba(MOONL, 1); g.beginPath(); g.arc(830, 300, 40, 0, 7); g.fill();
  // 1223：淡金大字浮现，再慢慢退到背景
  const k = RO(t, t10 + 0.1, t10 + 0.8), rk = RE(t, t10 + 1.5, t10 + 2.6);
  if (k > 0.003) { g.save(); g.globalAlpha = k * lerp(0.95, 0.2, rk); g.translate(540, lerp(560, 520, rk)); const sc = lerp(1.06, 1, k) * lerp(1, 0.84, rk); g.scale(sc, sc);
    if (k < 0.999) g.filter = `blur(${((1 - k) * 12).toFixed(2)}px)`;
    g.font = `600 220px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = rgba(GOLD, 0.6); g.shadowBlur = 30;
    g.fillStyle = 'rgb(246,214,150)'; g.fillText(X.year, 0, 0); g.restore(); }
  // 海
  vgrad([[0, [12, 22, 36]], [1, [3, 5, 9]]], 880, 1700);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) { const y = 900 + i * 9 + i * i * 0.4, w = 30 + i * 3, b = 0.5 + 0.5 * Math.sin(t * 2.2 + i * 1.7);
    g.fillStyle = rgba(MOONL, 0.22 * b * (1 - i / 30)); g.fillRect(830 - w / 2 + Math.sin(i * 3.1 + t) * 14, y, w, 2.5); }
  g.restore();
  g.strokeStyle = 'rgba(127,208,230,0.12)'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { const y = 920 + i * 22; g.beginPath(); for (let x = -20; x <= W + 20; x += 20) { const yy = y + Math.sin(x * 0.02 + t * 1.3 + i) * 3; x < 0 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke(); }
  // 岸：宋式屋檐、佛塔
  const col = '#090a10';
  sil(() => { g.beginPath(); g.moveTo(620, 1300); g.lineTo(620, 906); g.lineTo(690, 890); g.lineTo(1120, 890); g.lineTo(1120, 1300); g.closePath(); g.fill();
    g.fillRect(712, 800, 190, 90); pagoda(1000, 890, 420, 6, 124, null, null); g.fillRect(560, 900, 90, 8); }, MOONL, 0.35, 0, -3, 12, col);
  roof(700, 914, 800, 62, col, { ov: 24, lift: 18, rim: MOONL, rimA: 0.4, horn: 8 });
  g.fillStyle = 'rgba(244,190,110,0.7)'; g.fillRect(740, 830, 18, 26); g.fillRect(850, 830, 18, 26);
  addLight(() => { lightPool(750, 843, 40, 30, GOLD, 0.3); lightPool(860, 843, 40, 30, GOLD, 0.3); });
  // 船 + 甲板上的和尚，靠岸后走下船
  const mw = RE(t, t10 + 1.9, t10 + 3.5), onDeck = mw <= 0;
  const monk = (x, y, ph) => fig(x, y, 0.34, 1, { hair: 'douli', robe: 'long', walk: ph, amp: 0.25, lean: 0.03 }, MOONL, 0.8, 1, 0, -2, 8);
  if (onDeck) monk(shipX + 40, 866 + bob, undefined);
  sil(() => { g.save(); g.translate(shipX, 902 + bob); junk(); g.restore(); }, MOONL, 0.5, 0, -3, 12, '#0b0b12');
  g.save(); g.translate(shipX, 902 + bob); g.strokeStyle = 'rgba(206,238,247,0.22)'; g.lineWidth = 1.6;
  for (let y = -240; y < -70; y += 26) { g.beginPath(); g.moveTo(-22, y); g.lineTo(lerp(-118, -132, (y + 250) / 180), y + 8); g.stroke(); }
  for (let y = -186; y < -70; y += 26) { g.beginPath(); g.moveTo(70, y); g.lineTo(lerp(2, -6, (y + 196) / 130), y + 6); g.stroke(); } g.restore();
  if (!onDeck) monk(lerp(shipX + 40, 780, mw), lerp(866 + bob, 890, mw), mw * 14);
}

// =====================================================================
// 宋朝院子（第 11 屏）：和尚在左；戴幞头的宋人在水盆边拿着一件小东西刷牙；镜头推近，那件东西被一束光照亮
// =====================================================================
function songYard(t) {
  const t11 = T(11), s = 0.82;
  const oM = { hair: 'futou', robe: true, lean: 0.14, tilt: 0.04, legA: [0.1, -0.04] }, fM = standSide(oM), mM = mouthOf(fM, oM);
  oM.handN = [mM[0] + 2, mM[1] + 30];
  const obj = LW(770, GY, s, -1, [mM[0] + 16, mM[1] + 6]);
  oM.extra = r => { const [ex, ey, wx, wy] = r.wN, a = Math.atan2(wy - ey, wx - ex), hx = wx + Math.cos(a) * r.d.hl * 0.5, hy = wy + Math.sin(a) * r.d.hl * 0.5;
    g.save(); g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(hx - 6, hy + 10); g.lineTo(hx + 20, hy - 24); g.stroke(); g.restore(); };
  const c = camMix(WIDE, CM(obj[0] - 20, obj[1] + 30, 2.2), RE(t, t11 + 0.5, E(11) + 0.6));
  const beam = R(t, t11 + 1.2, t11 + 1.9);
  vgrad([[0, [18, 14, 24]], [0.35, [54, 38, 44]], [0.48, [176, 124, 84]], [0.54, [232, 178, 112]], [0.556, [20, 14, 11]], [1, [6, 5, 5]]]);
  cam(c, () => {
    addLight(() => lightPool(560, 1000, 600, 220, GOLD, 0.3));
    roof(-100, 470, 640, 110, '#100c0e', { ov: 40, lift: 26, rim: GOLD, rimA: 0.45, horn: 14, tiles: GOLDL });
    sil(() => g.fillRect(-60, 640, 500, 200), GOLD, 0.2, 0, -2, 8, '#100c0e');
    sil(() => { g.fillRect(-100, 840, 1300, 230); }, GOLD, 0.3, 0, -2, 10, '#1a1416');
    roof(-140, 1220, 842, 26, '#120e10', { ov: 0, lift: 4, ins: 10, rim: GOLD, rimA: 0.5 });
    vgrad([[0, [26, 19, 15]], [1, [6, 5, 5]]], 1060, 1700);
    sil(() => { cap(596, 1062, 5, 606, 900, 5); cap(652, 1062, 5, 640, 900, 5); g.beginPath(); g.moveTo(560, 886); g.lineTo(684, 886); g.quadraticCurveTo(672, 912, 622, 914); g.quadraticCurveTo(572, 912, 560, 886); g.fill(); }, GOLD, 0.55, 0, -3, 8);
    g.fillStyle = 'rgba(255,224,166,0.55)'; g.fillRect(574, 885, 96, 2);
    fig(250, GY, s, 1, { hair: 'douli', robe: 'long', lean: 0.02, tilt: 0.05, legA: [0.12, -0.03] }, GOLD, 0.75);
    silA(1, at(770, GY, s, -1, fM.draw), GOLD, 0.75, 0, -3, 12);
    if (beam > 0.003) {
      addLight(() => { const gr = g.createLinearGradient(obj[0] - 260, obj[1] - 600, obj[0], obj[1]); gr.addColorStop(0, rgba(GOLDL, 0)); gr.addColorStop(1, rgba(GOLDL, 0.3 * beam));
        g.fillStyle = gr; g.beginPath(); g.moveTo(obj[0] - 330, obj[1] - 640); g.lineTo(obj[0] - 210, obj[1] - 660); g.lineTo(obj[0] + 30, obj[1] + 20); g.lineTo(obj[0] - 30, obj[1] + 30); g.closePath(); g.fill();
        lightPool(obj[0], obj[1], 46, 40, GOLDL, 0.5 * beam); });
      g.save(); g.globalAlpha = beam; g.lineCap = 'round'; g.strokeStyle = 'rgb(200,150,96)'; g.lineWidth = 4;
      g.beginPath(); g.moveTo(obj[0] + 10, obj[1] + 8); g.lineTo(obj[0] - 12, obj[1] - 18); g.stroke(); g.strokeStyle = 'rgba(30,20,14,0.95)'; g.lineWidth = 7; g.beginPath(); g.moveTo(obj[0] - 12, obj[1] - 18); g.lineTo(obj[0] - 18, obj[1] - 24); g.stroke(); g.restore();
    }
  });
}

// =====================================================================
// 牛角马尾刷（第 12–13 屏）：先画柄、再一簇簇插毛；今天牙刷的白线轮廓移过来重叠
// =====================================================================
function horse(sw) {   // 朝左，原点在身体中心
  g.beginPath(); g.ellipse(0, 0, 100, 44, 0, 0, 7); g.fill();
  cap(-66, -12, 36, -116, -92, 22); cap(-116, -96, 22, -168, -58, 13);
  g.beginPath(); g.moveTo(-110, -114); g.lineTo(-100, -138); g.lineTo(-96, -110); g.closePath(); g.fill();
  for (const [a, b, c, d, e, f] of [[-62, 20, -66, 82, -62, 142], [-38, 22, -46, 84, -50, 142], [56, 18, 72, 80, 62, 142], [76, 14, 94, 76, 86, 140]]) {
    cap(a, b, 15, c, d, 9); cap(c, d, 9, e, f, 7); g.fillRect(e - 8, f, 16, 7); }
  g.lineCap = 'round'; g.lineWidth = 5;
  for (let i = 0; i < 8; i++) { const k = i / 7; g.beginPath(); g.moveTo(94, -22 + k * 8); g.bezierCurveTo(134 + sw * 18, -10 + k * 10, 128 + sw * 40, 40 + k * 20, 112 + sw * 52 + k * 12, 112 + k * 16); g.stroke(); }
  g.lineWidth = 4; for (let i = 0; i < 6; i++) { const k = i / 5; g.beginPath(); g.moveTo(lerp(-70, -112, k), lerp(-40, -116, k)); g.lineTo(lerp(-70, -112, k) + 14, lerp(-40, -116, k) - 6); g.stroke(); }
}
function horn(t) {
  const T12 = T(12), t13 = T(13), ti = WC(12, '插') - 0.35;
  vgrad([[0, [14, 11, 13]], [0.5, [9, 8, 10]], [1, [5, 4, 6]]]);
  const ha = 0.32 * R(t, ti, ti + 0.6) * (1 - R(t, t13, t13 + 0.6));
  if (ha > 0.003) { addLight(() => lightPool(760, 420, 260, 170, GOLD, 0.1 * ha / 0.32));
    const sw = pulses(t, [WC(12, '马尾') + 0.6], 0.35, 0.1, 0.6) - 0.5 * pulses(t, [WC(12, '马尾') + 1.3], 0.3, 0.1, 0.5);
    silA(ha, () => { g.save(); g.translate(770, 420); g.scale(0.95, 0.95); horse(sw); g.restore(); }, GOLDL, 0.9, 0, -3, 12); }
  vitrine(1);
  hornBrush({ line: RE(t, T12 + 0.05, T12 + 0.95), fill: R(t, T12 + 0.7, T12 + 1.2), grain: RE(t, T12 + 0.9, T12 + 1.6), holes: R(t, T12 + 1.1, T12 + 1.4),
    tuft: i => R(t, ti + i * 0.11, ti + i * 0.11 + 0.38), backlight: R(t, ti, ti + 0.8) });
  modernOutline(lerp(-230, 0, RE(t, t13 + 0.4, t13 + 1.35)), R(t, t13 + 0.05, t13 + 0.5), pulses(t, [t13 + 1.6], 0.2, 0.2, 0.5));
}

// =====================================================================
// 南宋杭州夜街（第 14、16 屏）：灯笼、布招"刷牙铺"、挑担货郎；第 16 屏街上人很多，只有一处亮着
// =====================================================================
const LANT = [[106, 668], [254, 668], [466, 668], [614, 668], [866, 668], [1000, 668]];
function streetBg(t, on) {
  vgrad([[0, [7, 8, 18]], [0.27, [16, 14, 28]], [0.45, [34, 22, 26]], [0.56, [14, 9, 9]], [1, [5, 4, 5]]]);
  stars(t, 0.6, 520);
  const far = '#1b1522';
  sil(() => { pagoda(880, 600, 330, 7, 96, null, null); }, MOONL, 0.25, 0, -2, 8, far);
  for (const [x0, x1, y] of [[-60, 300, 560], [260, 640, 548], [600, 980, 566]]) roof(x0, x1, y, 50, far, { ov: 20, lift: 14 });
  g.fillStyle = far; g.fillRect(-60, 560, W + 120, 60);
  for (let i = 0; i < 3; i++) {
    const x0 = i * 360, x1 = x0 + 360, glow = 0.45 + 0.55 * on;
    const ig = g.createLinearGradient(0, 640, 0, 1000); ig.addColorStop(0, rgba([150, 86, 42], glow)); ig.addColorStop(1, rgba([60, 30, 16], glow));
    g.fillStyle = ig; g.fillRect(x0 + 30, 640, 300, 360);
    g.fillStyle = '#120c0a'; for (let k = 0; k < 3; k++) g.fillRect(x0 + 60 + k * 90, 700, 50, 160);
    g.fillStyle = 'rgba(18,12,10,0.9)'; for (let k = 1; k < 6; k++) g.fillRect(x0 + 30 + k * 50, 640, 4, 70); g.fillRect(x0 + 30, 708, 300, 4);
    g.fillStyle = '#130d0b'; g.fillRect(x0 + 30, 930, 300, 70);
    g.fillStyle = '#0d0a0a'; g.fillRect(x0 + 16, 600, 22, 460); g.fillRect(x1 - 38, 600, 22, 460);
    roof(x0 + 14, x1 - 14, 610, 92, '#0d0a0c', { ov: 26, lift: 20, rim: GOLD, rimA: 0.15 + 0.3 * on, horn: 10, tiles: GOLDL });
  }
  vgrad([[0, [24, 16, 13]], [1, [5, 4, 5]]], 1000, 1700);
  addLight(() => lightPool(540, 1010, 600, 60, [255, 150, 80], 0.12 * on));
}
function banner(x, y0, y1, w, a) {   // 布招：竖条布，上写"刷牙铺"
  const sw = Math.sin(a * 0) * 0;
  g.save();
  g.fillStyle = '#1a1210'; g.fillRect(x - w / 2 - 14, y0 - 8, w + 28, 8);
  addLight(() => lightPool(x, (y0 + y1) / 2, w * 1.4, (y1 - y0) * 0.6, [255, 170, 100], 0.12));
  const cg = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); cg.addColorStop(0, '#b9a079'); cg.addColorStop(0.5, '#e2cfa6'); cg.addColorStop(1, '#a88e68');
  g.fillStyle = cg; g.beginPath(); g.moveTo(x - w / 2, y0); g.lineTo(x + w / 2, y0); g.lineTo(x + w / 2, y1); g.lineTo(x + w / 4, y1 - 16); g.lineTo(x, y1); g.lineTo(x - w / 4, y1 - 16); g.lineTo(x - w / 2, y1); g.closePath(); g.fill();
  g.fillStyle = '#7a3a22'; g.fillRect(x - w / 2, y0, w, 12);
  g.font = `700 56px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#24160e';
  [...X.shop].forEach((ch, i) => g.fillText(ch, x + sw, y0 + 62 + i * 66));
  g.restore();
}
function peddlerFig(t, x, ph) {
  const o = { hair: 'topknot', robe: true, walk: ph, amp: 0.28, lean: 0.06, tilt: 0.02 };
  const f = standSide(o);
  o.handN = [f.S[0] + 58, f.S[1] - 4];
  o.extra = r => {
    const S = r.S, py = S[1] - 12, xa = S[0] - 200, xb = S[0] + 200;
    g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(xa, py + 4); g.quadraticCurveTo(S[0], py - 6, xb, py + 4); g.stroke();
    g.lineWidth = 2.4; for (const ex of [xa + 8, xb - 8]) { g.beginPath(); g.moveTo(ex, py + 4); g.lineTo(ex - 30, py + 170); g.moveTo(ex, py + 4); g.lineTo(ex + 30, py + 170); g.stroke();
      g.beginPath(); g.moveTo(ex - 44, py + 170); g.lineTo(ex + 44, py + 170); g.lineTo(ex + 34, py + 226); g.lineTo(ex - 34, py + 226); g.closePath(); g.fill(); }
    // 担子前头挂着一排小刷子，走路时轻轻晃
    for (let i = 0; i < 6; i++) {
      const hx = S[0] + 62 + i * 25, hy = py + 2, sa = Math.sin(t * 5.2 + i * 0.9) * 0.28;
      g.save(); g.translate(hx, hy); g.rotate(sa);
      g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 14); g.stroke();
      g.fillStyle = 'rgb(222,186,132)'; rr(-5.5, 14, 11, 60, 4); g.fill();
      g.fillStyle = 'rgb(255,232,184)'; g.fillRect(-5, 17, 3, 52);
      g.fillStyle = '#1e1410'; g.fillRect(-9, 66, 18, 16);
      g.restore();
    }
  };
  silA(1, at(x, 1090, 0.72, -1, f.draw), GOLD, 0.7, 0, -3, 10);
}
function street1(t) {
  const t14 = T(14), on = i => R(t, t14 + 0.1 + i * 0.17, t14 + 0.4 + i * 0.17);
  cam(CM(540, 640, 1.0 + 0.03 * ramp(t, t14, E(14) + 0.7)), () => {
    streetBg(t, R(t, t14, t14 + 1.2));
    banner(800, 618, 904, 96, 1);
    LANT.forEach(([x, y], i) => lantern(x, y, 24, on(i)));
    const x = lerp(1090, 20, ramp(t, t14, E(14) + 0.7));
    peddlerFig(t, x, (1090 - x) * 0.05);
  });
}
const CROWD = (() => { const r = rng(161), a = []; for (let i = 0; i < 26; i++) { const z = r();
  a.push({ x: 30 + r() * 1020, z, dir: r() < 0.5 ? -1 : 1, hair: ['topknot', 'futou', 'tang', 'topknot'][Math.floor(r() * 4)], ph: r() * 6.28, ti: 0.05 + r() * 1.8, walk: r() < 0.35 }); }
  a.push({ x: 560, z: 0.97, dir: 1, hair: 'topknot', ph: 0, ti: 0, walk: false, star: true }); a.sort((p, q) => p.z - q.z); return a; })();
function crowd(t) {
  const t16 = T(16), u = t - t16;
  cam(CM(540, 680, lerp(1.0, 0.93, RE(t, t16, E(16) + 0.6))), () => {
    streetBg(t, 1); banner(800, 618, 904, 96, 1);
    LANT.forEach(([x, y]) => lantern(x, y, 24, 1));
    g.fillStyle = 'rgba(5,4,6,0.35)'; g.fillRect(-300, 160, W + 600, 1500);
    let star = null;
    for (const p of CROWD) {
      const a = p.star ? 1 : R(u, p.ti, p.ti + 0.5); if (a <= 0.003) continue;
      const s = 0.5 + 0.28 * p.z, gy = 1030 + 70 * p.z;
      const o = { hair: p.hair, robe: true, lean: 0.03, tilt: 0.03, walk: p.walk ? p.ph + t * 3 : undefined, amp: 0.2, legA: [0.12, -0.03] };
      if (p.star) { const f = standSide(o), m = mouthOf(f, o); o.handN = [m[0] + 8, m[1] + 40];
        o.extra = r => { const [ex, ey, wx, wy] = r.wN, an = Math.atan2(wy - ey, wx - ex); star = LW(p.x, gy, s, p.dir, [wx + Math.cos(an) * 14, wy + Math.sin(an) * 14 - 14]); };
        silA(1, at(p.x, gy, s, p.dir, f.draw), GOLD, 0.6, 0, -3, 12); }
      else fig(p.x, gy, s, p.dir, o, GOLD, 0.22, a, 0, -2, 8);
    }
    if (star) { const pl = 0.85 + 0.15 * Math.sin(t * 3);
      addLight(() => { lightPool(star[0], star[1], 90, 90, GOLD, 0.45 * pl); lightPool(star[0], star[1], 26, 26, GOLDL, 0.8 * pl); });
      g.save(); g.translate(star[0], star[1]); g.rotate(-1.1); g.fillStyle = 'rgb(255,226,170)'; rr(-3, -22, 7, 34, 3); g.fill(); g.fillStyle = 'rgb(255,244,214)'; g.fillRect(-4, -30, 9, 9); g.restore(); }
  });
}

// =====================================================================
// 约 400 年（第 15 屏）：金线从左边的牛角刷往右延伸很远，右端欧洲尖顶屋前才出现一把小刷子
// =====================================================================
function euroHouse() {
  g.beginPath(); g.moveTo(880, 760); g.lineTo(880, 660); g.lineTo(940, 560); g.lineTo(1000, 660); g.lineTo(1000, 760); g.closePath(); g.fill();
  g.fillRect(966, 584, 16, 50);
}
function span(t) {
  const t15 = T(15), ty = WC(15, '约') - 0.25, LY = 770, xa = 256, xb = 850;
  vgrad([[0, [10, 9, 16]], [0.5, [14, 11, 14]], [1, [5, 4, 6]]]);
  addLight(() => lightPool(540, LY, 560, 120, GOLD, 0.08));
  // 左：宋式屋檐 + 牛角刷
  g.save(); g.globalAlpha = 0.9; roof(56, 250, 650, 46, '#140f12', { ov: 20, lift: 14, rim: GOLD, rimA: 0.4, horn: 6 }); g.fillStyle = '#140f12'; g.fillRect(76, 650, 156, 50); g.restore();
  addLight(() => lightPool(160, 740, 130, 60, GOLD, 0.3));
  g.save(); g.translate(160, 742); g.scale(0.3, 0.3); g.translate(-540, -670); hornBrush({ fill: 1, grain: 1, holes: 1, tuft: () => 1 }); g.restore();
  // 金线
  const p = RE(t, t15 + 0.25, t15 + 2.2), x2 = lerp(xa, xb, p);
  if (p > 0.001) { g.save(); g.strokeStyle = rgba(GOLDL, 0.95); g.lineWidth = 4; g.lineCap = 'round'; g.shadowColor = rgba(GOLD, 0.9); g.shadowBlur = 16;
    g.beginPath(); g.moveTo(xa, LY); g.lineTo(x2, LY); g.stroke(); g.restore();
    if (p < 0.999) addLight(() => lightPool(x2, LY, 40, 40, GOLDL, 0.6)); }
  // 右：欧洲尖顶屋，屋前才出现一把小刷子
  const ha = R(t, t15 + 1.7, t15 + 2.3);
  if (ha > 0.003) { silA(ha, euroHouse, BEIGE, 0.6, 0, -3, 10, '#130f14');
    g.save(); g.globalAlpha = ha; g.fillStyle = 'rgba(244,190,110,0.75)'; g.fillRect(912, 690, 18, 24); g.fillRect(950, 690, 18, 24);
    g.strokeStyle = 'rgba(20,14,12,0.9)'; g.lineWidth = 3; g.beginPath(); g.moveTo(880, 660); g.lineTo(1000, 660); g.moveTo(940, 660); g.lineTo(940, 760); g.stroke(); g.restore(); }
  const ba = R(t, t15 + 2.2, t15 + 2.7);
  if (ba > 0.003) { addLight(() => lightPool(940, 806, 70, 30, GOLD, 0.4 * ba));
    g.save(); g.globalAlpha = ba; g.translate(940, 806); g.fillStyle = 'rgb(226,206,170)'; rr(-38, -5, 76, 10, 5); g.fill();
    g.strokeStyle = '#2a1e16'; g.lineWidth = 2; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(16 + i * 4, -5); g.lineTo(16 + i * 4, -20); g.stroke(); } g.restore(); }
  // 括号和"约 400 年"
  const q = RE(t, ty, ty + 0.6), qa = R(t, ty, ty + 0.3);
  if (qa > 0.003) { const xm = (xa + xb) / 2, hw = (xb - xa) / 2 * q, yb = 702;
    g.save(); g.globalAlpha = qa; g.strokeStyle = rgba(BEIGE, 0.95); g.lineWidth = 3.4; g.lineJoin = 'round'; g.shadowColor = rgba(BEIGE, 0.5); g.shadowBlur = 8;
    g.beginPath(); g.moveTo(xm - hw, yb + 24); g.lineTo(xm - hw, yb); g.lineTo(xm + hw, yb); g.lineTo(xm + hw, yb + 24); g.stroke(); g.restore(); }
  const sa = R(t, ty + 0.2, ty + 0.7);
  if (sa > 0.003) { g.save(); g.globalAlpha = sa; g.font = `600 58px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.shadowColor = 'rgba(0,0,0,0.9)'; g.shadowBlur = 14;
    g.fillStyle = 'rgb(246,214,150)'; g.fillText(X.span, (xa + xb) / 2, 676); g.restore(); }
}

// =====================================================================
// 一万个人里才有一个（第 17 屏）：俯视，满屏暗光点从中心往外铺开，只有一个是金色的
// =====================================================================
const DOTS2 = (() => { const r = rng(171), a = [], cols = 54, rows = 52;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const x = 50 + (i + 0.5) * (980 / cols) + (r() - 0.5) * 9, y = 176 + (j + 0.5) * (924 / rows) + (r() - 0.5) * 9;
    a.push([x, y, Math.hypot(x - 540, y - 640), 1.5 + r() * 1.3, 0.22 + r() * 0.3, r() * 6.28]); }
  return a; })();
const GOLDI = (() => { let b = 0, bd = 1e9; DOTS2.forEach(([x, y], i) => { const d = Math.hypot(x - 628, y - 556); if (d < bd) { bd = d; b = i; } }); return b; })();
function dots(t) {
  const t17 = T(17), tf = WC(17, '一个用') - 0.1, rad = 1150 * RE(t, t17 + 0.05, t17 + 2.3);
  vgrad([[0, [9, 8, 12]], [1, [5, 4, 6]]]);
  cam(CM(540, 640, lerp(1.22, 1.0, RE(t, t17, t17 + 2.5))), () => {
    g.fillStyle = rgba(BEIGE, 1);
    for (let i = 0; i < DOTS2.length; i++) { if (i === GOLDI) continue; const [x, y, d, sz, a, ph] = DOTS2[i], k = clamp((rad - d) / 80, 0, 1); if (k <= 0) continue;
      g.globalAlpha = a * k * (0.8 + 0.2 * Math.sin(t * 1.3 + ph)); g.beginPath(); g.arc(x, y, sz, 0, 7); g.fill(); }
    g.globalAlpha = 1;
    const [x, y, d] = DOTS2[GOLDI], k = clamp((rad - d) / 80, 0, 1), fl = pulses(t, [tf + 0.15], 0.15, 0.3, 0.7);
    if (k > 0) { addLight(() => { lightPool(x, y, 24 + 90 * fl, 24 + 90 * fl, GOLD, (0.5 + 0.4 * fl) * k); });
      g.fillStyle = rgba(GOLDL, k); g.beginPath(); g.arc(x, y, 4 + 1.5 * fl, 0, 7); g.fill();
      if (fl > 0.01) { g.strokeStyle = rgba(GOLDL, 0.6 * fl); g.lineWidth = 2; g.beginPath(); g.arc(x, y, 14 + 40 * ramp(t, tf, tf + 0.8), 0, 7); g.stroke(); } }
  });
}

// =====================================================================
// 烛光书案（第 18 屏）：线装书一页页翻过，镜头推近书页；第 19 屏：竖排"早起不可用刷牙子"由上往下渐显
// =====================================================================
const PAGEINK = (() => { const r = rng(181), a = []; for (let c = 0; c < 7; c++) { let y = 0; while (y < 0.86) { const l = 0.03 + r() * 0.07; a.push([c, y, Math.min(l, 0.88 - y)]); y += l + 0.02 + r() * 0.03; } } return a; })();
function quad(p) { g.beginPath(); g.moveTo(p[0][0], p[0][1]); for (let i = 1; i < 4; i++) g.lineTo(p[i][0], p[i][1]); g.closePath(); }
function pageInk(p, a) {   // 页上的墨迹（竖列短划，看不出字）
  const P = (u, v) => [lerp(lerp(p[0][0], p[1][0], u), lerp(p[3][0], p[2][0], u), v), lerp(lerp(p[0][1], p[1][1], u), lerp(p[3][1], p[2][1], u), v)];
  g.strokeStyle = `rgba(40,26,16,${a})`; g.lineWidth = 3; g.lineCap = 'round';
  for (const [c, y, l] of PAGEINK) { const u = 0.12 + c * 0.125, A = P(u, 0.08 + y), B = P(u, 0.08 + y + l); g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke(); }
}
function candle(x, y, t) {
  const fl = Math.sin(t * 13.1) * 0.5 + Math.sin(t * 7.3 + 1) * 0.3 + Math.sin(t * 21.7 + 2) * 0.2;
  g.fillStyle = '#3a2a18'; g.beginPath(); g.ellipse(x, y, 46, 12, 0, 0, 7); g.fill();
  const cg = g.createLinearGradient(x - 18, 0, x + 18, 0); cg.addColorStop(0, '#f2e4c4'); cg.addColorStop(1, '#a8926e');
  g.fillStyle = cg; g.fillRect(x - 18, y - 122, 36, 120); g.beginPath(); g.ellipse(x, y - 122, 18, 5, 0, 0, 7); g.fill();
  g.strokeStyle = '#1a1008'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 124); g.lineTo(x, y - 136); g.stroke();
  const fx = x + fl * 2.5, fy = y - 138, fh = 44 * (1 + 0.07 * fl);
  addLight(() => { lightPool(fx, fy - 14, 70, 80, LAMP, 0.45 + 0.06 * fl); });
  const fg = g.createRadialGradient(fx, fy - 8, 1, fx, fy - 14, fh * 0.6); fg.addColorStop(0, 'rgba(255,252,236,1)'); fg.addColorStop(0.45, 'rgba(255,214,130,0.95)'); fg.addColorStop(1, 'rgba(255,140,50,0)');
  g.fillStyle = fg; g.beginPath(); g.moveTo(fx, fy - fh); g.bezierCurveTo(fx + 13, fy - fh * 0.45, fx + 12, fy, fx, fy + 2); g.bezierCurveTo(fx - 12, fy, fx - 13, fy - fh * 0.45, fx, fy - fh); g.fill();
  return fl;
}
function desk(t) {
  const t18 = T(18);
  const c = camMix(CM(540, 700, 1.0), CM(712, 834, 1.8), RE(t, t18 + 1.75, E(18) + 0.55));
  vgrad([[0, [16, 12, 12]], [0.4, [24, 17, 14]], [1, [8, 6, 5]]]);
  cam(c, () => {
    addLight(() => lightPool(220, 650, 420, 420, LAMP, 0.15));
    const dg = g.createLinearGradient(0, 780, 0, 1300); dg.addColorStop(0, '#3e2818'); dg.addColorStop(1, '#120c08');
    g.fillStyle = dg; g.fillRect(-300, 780, W + 600, 900); g.fillStyle = rgba(LAMP, 0.3); g.fillRect(-300, 779, W + 600, 2);
    addLight(() => lightPool(280, 830, 420, 90, LAMP, 0.22));
    candle(200, 800, t);
    // 书：左右两页，下面一叠页边
    const Lp = [[330, 772], [578, 778], [578, 902], [316, 908]], Rp = [[582, 778], [830, 772], [844, 908], [582, 902]];
    g.fillStyle = '#8a7656'; quad([[312, 908], [848, 908], [852, 920], [308, 920]]); g.fill();
    g.fillStyle = 'rgb(160,134,96)'; quad(Lp); g.fill(); g.fillStyle = 'rgb(138,114,82)'; quad(Rp); g.fill();
    pageInk(Lp, 0.5); pageInk(Rp, 0.5);
    g.strokeStyle = 'rgba(30,20,12,0.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(580, 778); g.lineTo(580, 904); g.stroke();
    for (let f = 0; f < 3; f++) {
      const ts = t18 + 0.2 + f * 0.55, th = Math.PI * RE(t, ts, ts + 0.62);
      if (th <= 0.001 || th >= Math.PI - 0.001) continue;
      const cs = Math.cos(th), sn = Math.sin(th);
      const P = [[580, 778], [580 + cs * 252, 774 - sn * 46], [580 + cs * 264, 906 - sn * 40], [580, 902]];
      const sh = 0.55 + 0.45 * Math.abs(cs); g.fillStyle = rgba(mixc([90, 74, 52], cs > 0 ? [140, 116, 84] : [166, 140, 100], sh), 1); quad(P); g.fill();
      g.strokeStyle = 'rgba(40,26,16,0.35)'; g.lineWidth = 1.5; quad(P); g.stroke();
    }
  });
}
const FIB = (() => { const r = rng(191), a = []; for (let i = 0; i < 260; i++) a.push([r() * W, 160 + r() * 960, 10 + r() * 40, (r() - 0.5) * 0.6, r()]); return a; })();
function page(t) {
  const t19 = T(19), t0 = t19 + 0.12;
  vgrad([[0, [8, 6, 6]], [1, [5, 4, 4]]]);
  g.save(); g.translate(540, 640); const sc = lerp(1.05, 1.0, RE(t, t19, E(19))); g.scale(sc, sc); g.translate(-540, -640);
  const pg = g.createRadialGradient(560, 640, 80, 540, 640, 760); pg.addColorStop(0, '#3e3124'); pg.addColorStop(1, '#1e1710');
  g.fillStyle = pg; g.fillRect(40, 150, 1000, 1000);
  g.strokeStyle = 'rgba(200,170,120,0.07)'; g.lineWidth = 1;
  for (const [x, y, l, a, k] of FIB) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  g.strokeStyle = 'rgba(210,176,120,0.16)'; g.lineWidth = 2; for (let x = 120; x < 1000; x += 120) { g.beginPath(); g.moveTo(x, 200); g.lineTo(x, 1090); g.stroke(); }
  g.strokeStyle = 'rgba(210,176,120,0.22)'; g.lineWidth = 3; g.strokeRect(60, 190, 960, 910);
  g.strokeStyle = 'rgba(232,214,176,0.05)'; g.lineWidth = 6; g.lineCap = 'round';   // 其他列：极淡的墨迹，看不出字
  for (const [c, y, l] of PAGEINK) { const xx = [180, 300, 420, 660, 780, 900, 180][c]; g.beginPath(); g.moveTo(xx, 240 + y * 820); g.lineTo(xx, 240 + (y + l) * 820); g.stroke(); }
  // 窗外一线晨光
  const wl = R(t, t19 + 0.1, t19 + 1.6);
  addLight(() => { const gr = g.createLinearGradient(1040, 160, 760, 520); gr.addColorStop(0, rgba(GOLDL, 0.2 * wl)); gr.addColorStop(1, rgba(GOLDL, 0));
    g.fillStyle = gr; g.beginPath(); g.moveTo(860, 150); g.lineTo(1040, 150); g.lineTo(1040, 230); g.lineTo(640, 640); g.lineTo(600, 620); g.closePath(); g.fill(); });
  // 竖排一列字：整列由上往下渐显，墨色晕开（不是逐字跳出）
  g.font = `600 80px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  [...X.v19].forEach((ch, i) => {
    const k = R(t, t0 + i * 0.1, t0 + i * 0.1 + 0.62), out = 1 - R(t, E(19) - 0.32, E(19) - 0.04); if (k * out <= 0.003) return;
    g.save(); g.globalAlpha = k * out; if (k < 0.999) g.filter = `blur(${((1 - k) * 7).toFixed(2)}px)`;
    g.shadowColor = `rgba(236,222,186,${0.25 * k})`; g.shadowBlur = 18; g.fillStyle = rgba(INK, 1); g.fillText(ch, 540, 268 + i * 106); g.restore();
  });
  g.restore();
}

// =====================================================================
// 硬毛与牙齿图标（第 20 屏）；三样东西依次亮起（第 21 屏）
// =====================================================================
function hard(t) {
  const t20 = T(20), t21 = T(21), tr = WC(20, '伤牙根');
  vgrad([[0, [14, 11, 13]], [0.5, [9, 8, 10]], [1, [5, 4, 6]]]);
  const zin = RE(t, t20, t20 + 1.0), zout = RE(t, t21, t21 + 1.1);
  vitrine(1, GOLD, 1 - 0.35 * zout);
  const c = camMix(camMix(WIDE, CM(706, 612, 2.05), zin), WIDE, zout);
  cam(c, () => { g.save(); g.translate(0, -262 * zout);
    hornBrush({ fill: 1, grain: 1, holes: 1, tuft: () => 1, hard: true, backlight: 1 - zout, a: lerp(1, 0.32, zout) }); g.restore(); });
  toothIcon(862, 562, 1.0, R(t, t20 + 0.5, t20 + 1.0) * (1 - R(t, t21, t21 + 0.5)), pulses(t, [tr + 0.3], 0.12, 0.3, 0.6));
  const L = i => R(t, t21 + 0.6 + i * 0.95, t21 + 1.1 + i * 0.95);
  const l0 = L(0), l1 = L(1), l2 = L(2);
  if (l0 > 0.003) bowl(250, 792, 0.5, 'water', t, l0, l0);
  if (l1 > 0.003) { bowl(540, 792, 0.5, 'salt', t, l1, l1); const P = [548, 792], B = [P[0] + 120, P[1] - 330], Wr = wristFor(B, P, 0.95, 'point', false, 0.35);
    armHand(B, Wr, 0.95, 'point', GOLDL, 0.85, { a: l1, blur: 8, rot: 0.35, sleeve: true }); }
  if (l2 > 0.003) willowSprig(826, 800, 230, -0.12, l2, l2);
}

// =====================================================================
// 元代宫殿（第 23 屏）：殿内一盏灯亮起，镜头推近桌上那本书
// =====================================================================
function palace(t) {
  const t23 = T(23), lamp = R(t, t23 + 0.45, t23 + 0.95) * (0.92 + 0.08 * Math.sin(t * 11));
  const c = camMix(CM(540, 700, 1.0), CM(540, 918, 2.6), RE(t, t23 + 0.7, E(23) + 0.6));
  vgrad([[0, [5, 7, 15]], [0.4, [14, 16, 28]], [0.55, [22, 20, 32]], [1, [5, 5, 8]]]);
  stars(t, 0.8, 500);
  const col = '#0b0a10';
  cam(c, () => {
    g.fillStyle = col; g.fillRect(140, 760, 800, 240);
    const ig = g.createLinearGradient(0, 790, 0, 990); ig.addColorStop(0, rgba(mixc([20, 16, 18], [120, 76, 40], lamp), 1)); ig.addColorStop(1, rgba(mixc([12, 10, 12], [60, 36, 20], lamp), 1));
    g.fillStyle = ig; g.fillRect(450, 790, 180, 200);
    addLight(() => { lightPool(596, 896, 110, 90, LAMP, 0.5 * lamp); lightPool(540, 930, 90, 30, LAMP, 0.3 * lamp); });
    g.fillStyle = '#1a120c'; g.fillRect(468, 936, 144, 10); g.fillRect(476, 946, 8, 44); g.fillRect(596, 946, 8, 44);
    g.fillStyle = rgba(mixc([20, 24, 34], [44, 56, 84], lamp), 1); g.fillRect(506, 922, 72, 14); g.fillStyle = rgba(mixc([40, 36, 30], [226, 210, 176], lamp), 1); g.fillRect(508, 934, 68, 3);
    g.fillStyle = rgba(mixc([40, 36, 30], [220, 206, 176], lamp), 1); g.fillRect(520, 924, 12, 9);
    g.fillStyle = '#1a120c'; g.fillRect(592, 900, 6, 36); g.fillRect(584, 934, 22, 4);
    if (lamp > 0.003) { g.fillStyle = rgba([255, 230, 170], lamp); g.beginPath(); g.ellipse(595, 892, 4, 8, 0, 0, 7); g.fill(); }
    sil(() => { for (const x of [170, 300, 430, 630, 760, 890]) g.fillRect(x, 780, 22, 210);
      g.fillRect(100, 990, 880, 20); g.fillRect(70, 1010, 940, 54); }, MOONL, 0.3, 0, -2, 8, col);
    g.strokeStyle = 'rgba(206,238,247,0.08)'; g.lineWidth = 2; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(80, 1020 + i * 12); g.lineTo(1000, 1020 + i * 12); g.stroke(); }
    roof(150, 930, 790, 50, col, { ov: 40, lift: 22, rim: MOONL, rimA: 0.35, horn: 0 });
    g.fillStyle = col; g.fillRect(200, 690, 680, 70);
    g.fillStyle = 'rgba(206,238,247,0.07)'; for (let x = 210; x < 870; x += 26) g.fillRect(x, 716, 12, 10);
    roof(110, 970, 690, 180, col, { ov: 70, lift: 56, rim: MOONL, rimA: 0.4, horn: 30, tiles: MOONL });
  });
}

// =====================================================================
// 日与月（第 24 屏）：上半清晨日出、下半夜里月亮；两列竖排字分别渐显；然后明暗翻转到夜
// =====================================================================
function split(t) {
  const t24 = T(24), tb = WC(24, '不如') - 0.1, fk = RE(t, t24 + 2.0, E(24) + 0.3), MID = 632;
  g.save(); g.beginPath(); g.rect(-100, 0, W + 200, MID); g.clip();
  vgrad([[0, [24, 18, 30]], [0.12, [52, 34, 44]], [0.25, [196, 128, 80]], [0.33, [250, 196, 128]]], 0, MID);
  const sy = lerp(700, 540, RE(t, t24, t24 + 2.0));
  addLight(() => { lightPool(330, sy, 300, 220, GOLD, 0.55); lightPool(330, sy, 100, 100, GOLDL, 0.7); });
  g.fillStyle = 'rgb(255,236,190)'; g.beginPath(); g.arc(330, sy, 66, 0, 7); g.fill();
  ridge(31, MID - 6, 60, [60, 36, 34]);
  g.restore();
  g.save(); g.beginPath(); g.rect(-100, MID, W + 200, H - MID); g.clip();
  vgrad([[0, [10, 18, 34]], [0.3, [6, 10, 20]], [1, [3, 4, 8]]], MID, H);
  stars(t, 0.5 + 0.5 * fk); for (const [x, y, s, p] of STARS) { const yy = MID + 30 + (y - 170) * 0.7; g.fillStyle = `rgba(225,236,245,${(0.3 + 0.3 * Math.sin(t * 1.5 + p)) * (0.6 + 0.4 * fk)})`; g.beginPath(); g.arc(x, yy, s * 0.8, 0, 7); g.fill(); }
  addLight(() => lightPool(330, 862, 200, 200, MOON, 0.3 + 0.3 * fk));
  g.save(); g.beginPath(); g.arc(330, 862, 58, 0, 7); g.clip(); g.fillStyle = rgba(MOONL, 1); g.beginPath(); g.arc(330, 862, 58, 0, 7); g.arc(354, 846, 52, 0, 7); g.fill('evenodd'); g.restore();
  g.restore();
  g.fillStyle = 'rgba(5,4,8,1)'; g.globalAlpha = 0.62 * fk; g.fillRect(-100, 0, W + 200, MID); g.globalAlpha = 1;
  g.strokeStyle = rgba(BEIGE, 0.3); g.lineWidth = 2; g.beginPath(); g.moveTo(0, MID); g.lineTo(W, MID); g.stroke();
  const col = (s, x, y0, ts, br) => { g.font = `600 68px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    [...s].forEach((ch, i) => { const k = R(t, ts + i * 0.1, ts + i * 0.1 + 0.6) * (1 - R(t, E(24) - 0.34, E(24) - 0.04)); if (k <= 0.003) return;
      g.save(); g.globalAlpha = k * br; if (k < 0.999) g.filter = `blur(${((1 - k) * 6).toFixed(2)}px)`; g.shadowColor = 'rgba(0,0,0,0.85)'; g.shadowBlur = 16;
      g.fillStyle = rgba(INK, 1); g.fillText(ch, x, y0 + i * 80); g.restore(); }); };
  col(X.v24a, 760, 260, t24 + 0.12, 1 - 0.45 * fk);
  col(X.v24b, 760, 712, tb, 1);
  if (fk > 0.003) addLight(() => lightPool(760, 870, 120, 240, MOON, 0.12 * fk));
}

// =====================================================================
// 片名、出处卡片（屏幕空间，画在暗角之上）
// =====================================================================
function titleCard(t) {
  const t2 = T(2), t3 = T(3), k = RO(t, t2 + 1.2, t2 + 1.6), ta = k * (1 - R(t, t3, t3 + 0.4));
  if (ta <= 0.003) return;
  addLight(() => lightPool(540, 400, 460, 160, BEIGE, 0.06 * ta));
  g.save(); g.globalAlpha = ta; g.translate(540, 400); const sc = lerp(1.06, 1, k) - 0.02 * ramp(t, t2 + 1.6, t3 + 0.4); g.scale(sc, sc);
  if (k < 0.999) g.filter = `blur(${((1 - k) * 14).toFixed(2)}px)`;
  g.font = `100px ${TITLE}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.shadowColor = 'rgba(0,0,0,0.85)'; g.shadowBlur = 26; g.shadowOffsetY = 8;
  g.strokeStyle = '#140d0a'; g.lineWidth = 11; g.strokeText(X.title, 0, 0);
  g.shadowColor = 'rgba(0,0,0,0)'; g.fillStyle = '#EDE6D6'; g.fillText(X.title, 0, 0);
  g.restore();
}
function cardLabel(x, y, s, a) {
  if (a <= 0.002) return;
  g.font = `500 28px ${SERIF}`; const w = g.measureText(s).width + 64, h = 60;
  g.save(); g.globalAlpha = a; g.translate(x, y);
  g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = 22; g.fillStyle = '#e8e0cf'; rr(0, 0, w, h, 5); g.fill(); g.shadowBlur = 0;
  g.fillStyle = '#b58a4c'; g.fillRect(0, 0, 8, h);
  txt(s, 34, 40, `500 28px ${SERIF}`, '#2a1d14', 'left');
  g.restore();
}

// ---------- 场景表：[开始, 结束, 绘制, 淡入]，后面的盖在前面上 ----------
const SCENES = [
  [0, T(2) + 2.0, bathA, 0],
  [T(2) + 0.9, T(4) + 0.7, yard, 1.0],
  [T(4), T(5) + 0.7, sutra, 0.6],
  [T(5), T(7) + 0.7, gift, 0.6],
  [T(7), T(8) + 0.7, india, 0.6],
  [T(8), T(9) + 0.7, willow, 0.6],
  [T(9), T(10) + 0.7, salt, 0.6],
  [T(10), T(11) + 0.7, sea, 0.6],
  [T(11), T(12) + 0.6, songYard, 0.6],
  [T(12), T(14) + 0.7, horn, 0.5],
  [T(14), T(15) + 0.7, street1, 0.6],
  [T(15), T(16) + 0.7, span, 0.6],
  [T(16), T(17) + 0.8, crowd, 0.6],
  [T(17), T(18) + 0.7, dots, 0.7],
  [T(18), T(19) + 0.6, desk, 0.6],
  [T(19), T(20) + 0.6, page, 0.5],
  [T(20), T(22) + 0.7, hard, 0.6],
  [T(22), T(23) + 0.7, bathClose, 0.6],
  [T(23), T(24) + 0.7, palace, 0.6],
  [T(24), T(25) + 0.7, split, 0.6],
  [T(25), FULL + 1, bathEnd, 0.7],
];
const card = (n0, n1, s) => [T(n0), E(n1) + 0.3, (t) => { const k = RO(t, T(n0) + 0.35, T(n0) + 0.95); cardLabel(lerp(40, 70, k), 172, s, k * (1 - R(t, E(n1) - 0.1, E(n1) + 0.3))); }];
const POST = [[T(2), T(3) + 0.5, titleCard], ...CARDS.map(([a, b, s]) => card(a, b, s))];

// ---------- 屏幕空间：浮尘、暗角、字幕区压暗 ----------
const DUST = (() => { const r = rng(11), a = []; for (let i = 0; i < 240; i++) a.push([r() * W, r() * H, 0.6 + r() * 1.6, 0.04 + r() * 0.10, 4 + r() * 10, r() * 6.28]); return a; })();
const VIG = mk();
{ const v = VIG.getContext('2d');
  const gr = v.createRadialGradient(540, 660, 380, 540, 660, 1150);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.85)'); v.fillStyle = gr; v.fillRect(0, 0, W, H);
  const b = v.createLinearGradient(0, 1060, 0, H);
  b.addColorStop(0, 'rgba(0,0,0,0)'); b.addColorStop(0.07, 'rgba(0,0,0,0.5)'); b.addColorStop(0.35, 'rgba(0,0,0,0.66)'); b.addColorStop(1, 'rgba(0,0,0,0.88)');
  v.fillStyle = b; v.fillRect(0, 1060, W, H - 1060);
  const tp = v.createLinearGradient(0, 0, 0, 180); tp.addColorStop(0, 'rgba(0,0,0,0.6)'); tp.addColorStop(1, 'rgba(0,0,0,0)'); v.fillStyle = tp; v.fillRect(0, 0, W, 180); }
function dustCol(t) { return (t >= T(2) + 1.4 && t < T(22)) || (t >= T(23) && t < T(25)) ? '255,226,180' : '214,226,236'; }

function draw(t) {
  G0.setTransform(1, 0, 0, 1, 0, 0); G0.globalAlpha = 1; G0.globalCompositeOperation = 'source-over'; G0.filter = 'none';
  G0.fillStyle = '#07060A'; G0.fillRect(0, 0, W, H);
  const act = [];
  for (const [a, b, fn, fi] of SCENES) {
    if (t < a - 1e-6 || t > b) continue;
    const alpha = fi > 0 ? R(t, a, a + fi) : 1;
    if (alpha <= 0) continue;
    act.push([fn, alpha]);
  }
  let start = 0; for (let i = act.length - 1; i >= 0; i--) if (act[i][1] >= 0.999) { start = i; break; }
  let bi = 0;
  for (let i = start; i < act.length; i++) {
    const [fn, alpha] = act[i];
    if (alpha >= 0.999 && i === start) { g = G0; G0.save(); fn(t); G0.restore(); continue; }
    const buf = BUF[bi++ % BUF.length], bg = buf.getContext('2d');
    bg.setTransform(1, 0, 0, 1, 0, 0); bg.globalAlpha = 1; bg.globalCompositeOperation = 'source-over'; bg.filter = 'none'; bg.clearRect(0, 0, W, H);
    g = bg; bg.save(); fn(t); bg.restore(); g = G0;
    G0.globalAlpha = alpha; G0.drawImage(buf, 0, 0); G0.globalAlpha = 1;
  }
  g = G0;
  const td = Math.min(t, FREEZE), dc = dustCol(t);
  for (const [x0, y0, s, a, v, p] of DUST) {
    const y = ((y0 - td * v) % H + H) % H, x = x0 + Math.sin(td * 0.25 + p) * 18;
    G0.fillStyle = `rgba(${dc},${a * (0.75 + 0.25 * Math.sin(td * 0.9 + p))})`; G0.beginPath(); G0.arc(x, y, s, 0, 7); G0.fill();
  }
  G0.drawImage(VIG, 0, 0);
  for (const [a, b, fn] of POST) if (t >= a && t <= b) { G0.save(); fn(t); G0.restore(); }
}

// ---------- 时间线 ----------
const tl = gsap.timeline({ paused: true });
const clock = { t: 0 };
function build() {
  tl.fromTo(clock, { t: 0 }, { t: D.DUR, duration: D.DUR, ease: 'none', onUpdate: () => draw(clock.t) }, 0);
  SC.forEach(s => {
    const el = document.getElementById('s' + s.n); if (!el) return;
    const st = el.querySelector('.st'), last = s.n === SC.length;
    if (s.n === 1) tl.fromTo(st, { opacity: 1 }, { opacity: 1, duration: 0.01 }, 0);
    else tl.fromTo(st, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power1.out' }, s.t);
    if (!last) tl.fromTo(st, { opacity: 1 }, { opacity: 0, duration: 0.25, ease: 'power1.in', immediateRender: false }, s.t + s.dur - 0.25);
  });
  if (document.getElementById('endtag')) tl.fromTo('#endtag', { opacity: 0 }, { opacity: 1, duration: 0.3 }, FREEZE);
  draw(0);
  window.__timelines['main'] = tl;
}
const allTxt = Object.values(X).join('') + CARDS.map(c => c[2]).join('');
Promise.all([document.fonts.load('600 60px "HSerif"', allTxt), document.fonts.load('100px "HTitle"', X.title)]).then(build, build);
