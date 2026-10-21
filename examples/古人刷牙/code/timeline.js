// 《古人怎么刷牙》合成脚本（分镜.md v1，26 屏 89.8 秒，竖屏 1080×1920）。画面只由时间 t 决定（所有随机数固定种子）。
// 贯穿元素：工具特写框（舞台中央打顶光的展柜）。小树枝 → 柳枝 → 手指和盐 → 牛角马尾牙刷 → 今天的软毛牙刷，都在这里亮起。
// 场景：现代浴室（1–2）→ 古代院落（2–3）→ 经卷与僧人（4）→ 光里递下树枝、嚼成絮（5–6）→ 印度晨光（7）→ 唐代柳枝（8）→ 盐碗（9）
//      → 夜海靠岸 1223（10）→ 宋朝院子（11）→ 牛角马尾刷（12–13）→ 杭州夜街（14）→ 约 400 年（15）→ 人群（16）→ 光点（17）
//      → 书案翻页（18）→ 竖排古籍字（19）→ 硬毛与牙齿图标（20–21）→ 浴室软毛（22）→ 宫殿（23）→ 日月（24）→ 浴室晨与夜（25–26）
// 画面上的文字全部来自 D.txt（build.py 里集中定义并检查数字）。剪影工具在 lib.js（沿用 10、11）。

const GOLD = [244, 190, 110], GOLDL = [255, 224, 166], BEIGE = [237, 230, 214], MOON = [127, 208, 230], MOONL = [206, 238, 247];
const LAMP = [255, 196, 128], INK = [236, 222, 186], WOOD = [214, 186, 140];
const TITLE = '"HTitle", serif';
const FREEZE = FULL - 1.2;                         // 最后约 1.2 秒画面停住
const GY = 1060;
const CM = (fx, fy, s) => ({ fx, fy, s });
function camAt(t, K) {
  if (t <= K[0][0]) return K[0][1];
  for (let i = 0; i < K.length - 1; i++) { const [a, ca] = K[i], [b, cb] = K[i + 1]; if (t <= b) return camMix(ca, cb, RE(t, a, b)); }
  return K[K.length - 1][1];
}
// 读到某个词的大致时间：按该屏 t/dur 和字数比例估算
const WT = (n, i, len) => SC[n - 1].t + SC[n - 1].dur * i / len;
const WC = (n, sub) => { const s = SC[n - 1].tx, i = s.indexOf(sub); return WT(n, Math.max(0, i), s.length); };
const LW = (x, gy, s, dir, p) => [x + dir * s * p[0], gy + s * p[1]];          // 剪影局部坐标 → 世界坐标
const WL = (x, gy, s, dir, p) => [(p[0] - x) / (dir * s), (p[1] - gy) / s];   // 世界坐标 → 剪影局部坐标
function vgrad(stops, y0 = 0, y1 = H) {
  const gr = g.createLinearGradient(0, y0, 0, y1);
  for (const [k, c] of stops) gr.addColorStop(k, typeof c === 'string' ? c : rgba(c, c[3] ?? 1));
  g.fillStyle = gr; g.fillRect(-3000, y0, W + 6000, y1 - y0);
}
const STARS = (() => { const r = rng(5), a = []; for (let i = 0; i < 140; i++) a.push([r() * W, 170 + r() * 620, 0.6 + r() * 1.4, r() * 6.28, 0.6 + r() * 1.6]); return a; })();
function stars(t, a, y1 = 9999) {
  if (a <= 0.003) return;
  for (const [x, y, s, p, f] of STARS) { if (y > y1) continue; const b = a * (0.35 + 0.3 * Math.sin(t * f + p));
    g.fillStyle = `rgba(225,236,245,${b})`; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); }
}
function ridge(seed, y, amp, col, step = 70) {   // 远山：平滑起伏的一层
  const r = rng(seed), pts = []; for (let x = -300; x <= W + 300; x += step * (0.7 + r() * 0.6)) pts.push([x, y - r() * amp]);
  g.fillStyle = typeof col === 'string' ? col : rgba(col, col[3] ?? 1); g.beginPath(); g.moveTo(-300, H); g.lineTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; g.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); }
  g.lineTo(W + 300, pts[pts.length - 1][1]); g.lineTo(W + 300, H); g.closePath(); g.fill();
}
function strokeLine(pts, col, lw) { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke(); }

// ---------- 建筑：中式屋顶（檐角上翘）、塔、灯笼、布招 ----------
function roofPath(x0, x1, yb, h, o = {}) {
  const ov = o.ov ?? 40, lift = o.lift ?? 26, w = x1 - x0, ins = o.ins ?? w * 0.14;
  g.beginPath(); g.moveTo(x0 - ov, yb - lift);
  g.quadraticCurveTo(x0 + w * 0.1, yb + 7, x0 + w / 2, yb + 8);
  g.quadraticCurveTo(x1 - w * 0.1, yb + 7, x1 + ov, yb - lift);
  g.quadraticCurveTo(x1 - ins * 0.35, yb - h * 0.25, x1 - ins, yb - h);
  if (o.horn) { g.quadraticCurveTo(x1 - ins + 6, yb - h - o.horn * 1.4, x1 - ins - o.horn * 0.4, yb - h - o.horn); g.lineTo(x1 - ins - o.horn * 0.7, yb - h - 3); }
  if (o.horn) { g.lineTo(x0 + ins + o.horn * 0.7, yb - h - 3); g.lineTo(x0 + ins + o.horn * 0.4, yb - h - o.horn); g.quadraticCurveTo(x0 + ins - 6, yb - h - o.horn * 1.4, x0 + ins, yb - h); }
  else g.lineTo(x0 + ins, yb - h);
  g.quadraticCurveTo(x0 + ins * 0.35, yb - h * 0.25, x0 - ov, yb - lift); g.closePath();
}
function roof(x0, x1, yb, h, col, o = {}) {
  g.fillStyle = col; roofPath(x0, x1, yb, h, o); g.fill();
  if (o.rim) { g.save(); g.strokeStyle = rgba(o.rim, o.rimA ?? 0.5); g.lineWidth = 2; g.shadowColor = rgba(o.rim, 0.8); g.shadowBlur = 8;
    const w = x1 - x0, ov = o.ov ?? 40, lift = o.lift ?? 26;
    g.beginPath(); g.moveTo(x0 - ov, yb - lift); g.quadraticCurveTo(x0 + w * 0.1, yb + 7, x0 + w / 2, yb + 8); g.quadraticCurveTo(x1 - w * 0.1, yb + 7, x1 + ov, yb - lift); g.stroke(); g.restore(); }
  if (o.tiles) { g.save(); roofPath(x0, x1, yb, h, o); g.clip(); g.strokeStyle = rgba(o.tiles, 0.1); g.lineWidth = 2;
    for (let x = x0 - 40; x < x1 + 40; x += 16) { g.beginPath(); g.moveTo(x, yb + 8); g.lineTo(lerp(x, (x0 + x1) / 2, 0.12), yb - h); g.stroke(); } g.restore(); }
}
function pagoda(x, yg, h, lv, w, col, rim, rimA = 0.35) {   // col 为空时用当前填充色（放在 sil 里画轮廓光）
  const hh = h / (lv + 0.6);
  if (col) g.fillStyle = col; col = g.fillStyle;
  for (let i = 0; i < lv; i++) {
    const wi = w * (1 - i * 0.12), y0 = yg - i * hh;
    g.fillRect(x - wi * 0.32, y0 - hh * 0.75, wi * 0.64, hh * 0.78);
    roof(x - wi * 0.45, x + wi * 0.45, y0 - hh * 0.7, hh * 0.3, col, { ov: wi * 0.12, lift: hh * 0.14, rim, rimA });
  }
  g.fillStyle = col; g.fillRect(x - 2.5, yg - lv * hh - hh * 0.9, 5, hh * 0.9);
  g.beginPath(); g.arc(x, yg - lv * hh - hh * 0.35, 6, 0, 7); g.fill();
}
function lantern(x, y, r, on) {
  g.save();
  g.strokeStyle = 'rgba(20,14,12,0.9)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - r - 34); g.lineTo(x, y - r); g.stroke();
  if (on > 0.003) addLight(() => { lightPool(x, y, r * 5.5, r * 5, [255, 140, 70], 0.28 * on); lightPool(x, y + r * 6, r * 4, r * 1.3, [255, 160, 90], 0.12 * on); });
  const gr = g.createRadialGradient(x - r * 0.2, y - r * 0.2, 1, x, y, r * 1.1);
  gr.addColorStop(0, rgba(mixc([70, 34, 26], [255, 218, 160], on), 1)); gr.addColorStop(0.6, rgba(mixc([58, 26, 20], [236, 108, 52], on), 1)); gr.addColorStop(1, rgba(mixc([40, 18, 14], [150, 46, 24], on), 1));
  g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r * 0.86, r, 0, 0, 7); g.fill();
  g.strokeStyle = `rgba(60,20,10,${0.25 + 0.2 * on})`; g.lineWidth = 1.2;
  for (const k of [-0.5, 0, 0.5]) { g.beginPath(); g.ellipse(x, y, r * 0.86 * Math.abs(k) + 0.1, r, 0, 0, 7); g.stroke(); }
  g.fillStyle = '#1a1210'; g.fillRect(x - r * 0.45, y - r - 4, r * 0.9, 7); g.fillRect(x - r * 0.45, y + r - 3, r * 0.9, 7);
  g.strokeStyle = `rgba(150,46,24,${0.5 + 0.4 * on})`; g.lineWidth = 2; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(x + i * 3, y + r + 4); g.lineTo(x + i * 3.6, y + r + 20); g.stroke(); }
  g.restore();
}

// ---------- 手：手腕在原点，手指朝 +x，拇指在 -y 一侧（剪影：窄手腕、手掌、分开的四指各三节、拇指两节） ----------
// 四指：[指根 x, 指根 y, 三节长度, 指根半径]；姿势：每指三个关节的弯曲角（正 = 往掌心 +y 弯），拇指 [起始角, 关节1, 关节2]
const FING = [[46, -12.5, [17, 12, 10], 4.6], [49.5, -3.5, [19, 13, 10.5], 4.7], [48.5, 5.5, [17.5, 12, 10], 4.4], [44, 13.5, [13.5, 10, 8.5], 3.9]];
const POSE = {
  point: { f: [[0.04, 0.03, 0.02], [1.25, 1.45, 1.15], [1.35, 1.45, 1.1], [1.4, 1.45, 1.0]], th: [-0.55, 0.45, 0.35] },
  pinch: { f: [[0.42, 0.75, 0.6], [0.8, 0.95, 0.75], [1.0, 1.05, 0.8], [1.15, 1.1, 0.8]], th: [-0.38, 0.52, 0.55] },
  open: { f: [[0.08, 0.1, 0.06], [0.04, 0.08, 0.06], [0.1, 0.1, 0.08], [0.2, 0.14, 0.1]], th: [-0.95, 0.2, 0.12] },
};
function handGeom(pose) {   // 计算各指关节点（不画）；返回 { fingers: [[点...]], thumb: [点...] }
  const P = POSE[pose], out = { fingers: [], thumb: [] };
  FING.forEach(([x, y, L], i) => { let a = 0, p = [x, y]; const pts = [p];
    L.forEach((l, j) => { a += P.f[i][j]; p = [p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l]; pts.push(p); }); out.fingers.push(pts); });
  let a = P.th[0], p = [13, -11]; out.thumb.push(p);
  [20, 15, 12].forEach((l, j) => { if (j) a += P.th[j]; p = [p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l]; out.thumb.push(p); });
  return out;
}
const HG = { point: handGeom('point'), pinch: handGeom('pinch'), open: handGeom('open') };
function handShape(pose) {
  const G = HG[pose];
  g.beginPath(); g.moveTo(-3, -10); g.bezierCurveTo(8, -13, 18, -18, 30, -17.5); g.lineTo(47, -17); g.quadraticCurveTo(54, -5, 51.5, 7);
  g.quadraticCurveTo(50, 17, 44, 18.5); g.bezierCurveTo(30, 18.5, 14, 15, -3, 10); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(17, -11, 12, 7.5, -0.45, 0, 7); g.fill();
  G.fingers.forEach((pts, i) => { const r0 = FING[i][3];
    for (let j = 0; j < 3; j++) cap(pts[j][0], pts[j][1], r0 * (1 - j * 0.12), pts[j + 1][0], pts[j + 1][1], r0 * (0.88 - j * 0.12)); });
  const T_ = G.thumb; cap(T_[0][0], T_[0][1], 7, T_[1][0], T_[1][1], 5.6); cap(T_[1][0], T_[1][1], 5.6, T_[2][0], T_[2][1], 4.9); cap(T_[2][0], T_[2][1], 4.9, T_[3][0], T_[3][1], 4.2);
}
const HAND_PT = (() => { const pi = HG.pinch, t = pi.thumb[3], j = pi.fingers[0][1];
  return { point: HG.point.fingers[0][3].map((v, k) => v + (k ? 0 : 3.5)), pinch: [(t[0] + j[0]) / 2, (t[1] + j[1]) / 2], open: HG.open.fingers[1][3] }; })();
function handAng(B, Wr, rot = 0) { return Math.atan2(Wr[1] - B[1], Wr[0] - B[0]) + rot; }
function handPt(Wr, ang, s, pose, flip) {   // 手上的抓点/指尖在世界里的位置
  const [lx, ly0] = HAND_PT[pose], ly = flip ? -ly0 : ly0, c = Math.cos(ang), sn = Math.sin(ang);
  return [Wr[0] + (lx * c - ly * sn) * s, Wr[1] + (lx * sn + ly * c) * s];
}
function wristFor(B, P, s, pose, flip, rot = 0) {   // 想让抓点/指尖落在 P：反推手腕位置（迭代三次）
  let Wr = P;
  for (let i = 0; i < 3; i++) { const a = handAng(B, Wr, rot), q = handPt([0, 0], a, s, pose, flip); Wr = [P[0] - q[0], P[1] - q[1]]; }
  return Wr;
}
function forearmHand(B0, Wr, s, pose, o = {}) {   // 前臂有锥度（肘粗、腕细），手臂一直延伸到画面外；o.sleeve：古装袖子盖到前臂一半，袖口略张
  const ang = handAng(B0, Wr, o.rot || 0), fa = Math.atan2(Wr[1] - B0[1], Wr[0] - B0[0]), ux = Math.cos(fa), uy = Math.sin(fa);
  const B = [Wr[0] - ux * 1600, Wr[1] - uy * 1600], mid = [Wr[0] - ux * 120 * s, Wr[1] - uy * 120 * s];
  cap(B[0], B[1], 24 * s, mid[0], mid[1], 18 * s); cap(mid[0], mid[1], 18 * s, Wr[0], Wr[1], 10.5 * s);
  if (o.sleeve) { const e = [Wr[0] - ux * 92 * s, Wr[1] - uy * 92 * s];
    cap(B[0], B[1], 31 * s, e[0], e[1], 31 * s);
    g.save(); g.translate(e[0], e[1]); g.rotate(fa); g.beginPath(); g.ellipse(0, 0, 7 * s, 34 * s, 0, 0, 7); g.fill(); g.restore(); }
  g.save(); g.translate(Wr[0], Wr[1]); g.rotate(ang); if (o.flip) g.scale(1, -1); g.scale(s, s); handShape(pose); g.restore();
}
function armHand(B, Wr, s, pose, rim, rimA, o = {}) {
  silA(o.a ?? 1, () => forearmHand(B, Wr, s, pose, o), rim, rimA, o.dx ?? 0, o.dy ?? -3, o.blur ?? 14, o.dark || C.ink);
}

// ---------- 剪影的人 ----------
function fig(x, gy, s, dir, o, rim, rimA, a = 1, dx = 0, dy = -3, blur = 14) {
  const f = standSide(o); silA(a, at(x, gy, s, dir, f.draw), rim, rimA, dx, dy, blur); return f;
}
function mouthOf(f, o) {   // 侧脸的嘴（局部坐标）
  const ht = (o.lean || 0) + (o.tilt || 0), r = f.d.hr;
  return [f.Hd[0] + Math.cos(ht) * r * 0.95 - Math.sin(ht) * r * 0.5, f.Hd[1] + Math.sin(ht) * r * 0.95 + Math.cos(ht) * r * 0.5];
}
// 一缕淡灰的弯曲气流线（"口臭"）：从嘴边飘出，变长、往上飘、淡掉。u：从冒出到消失 0 → 1
function breath(x, y, dx, dy, u, a, len = 150, seed = 1) {
  if (a <= 0.003 || u <= 0 || u >= 1) return;
  const L = len * RO(u, 0, 0.55), fade = a * R(u, 0, 0.08) * (1 - R(u, 0.6, 1)), up = 26 * u;
  if (L < 2 || fade <= 0.003) return;
  g.save(); g.lineCap = 'round';
  for (const [off, lw, al] of [[0, 4.4, 0.78], [10, 2.6, 0.5]]) {
    const pts = []; for (let i = 0; i <= 24; i++) { const k = i / 24, s = k * L;
      const w = Math.sin(k * 7.5 - u * 5 + seed + off * 0.2) * 9 * k + off * k;
      pts.push([x + dx * s - dy * w, y + dy * s + dx * w - up * k - 20 * k * k]); }
    strokeLine(pts, `rgba(204,198,190,${al * fade})`, lw);
  }
  g.restore();
}
// 坐着的僧人（正面、盘腿、光头），原点在坐垫中心
function monkSit(s) {
  const f = frontFig({ hands: [[-16, -18], [16, -18]], elbows: [[-52, -46], [52, -46]] });
  return { f, draw: () => { g.save(); g.translate(0, -26); f.draw(); g.restore();
    g.beginPath(); g.ellipse(0, -14, 96, 30, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(-60, -4, 34, 16, 0.2, 0, 7); g.fill(); g.beginPath(); g.ellipse(60, -4, 34, 16, -0.2, 0, 7); g.fill(); } };
}

// ---------- 工具特写框：舞台中央打顶光的展柜 ----------
function vitrine(a, col = GOLD, k = 1) {
  if (a <= 0.003) return;
  g.save(); g.globalAlpha *= a;
  addLight(() => {
    const gr = g.createLinearGradient(0, 180, 0, 880); gr.addColorStop(0, rgba(col, 0.2 * k)); gr.addColorStop(0.7, rgba(col, 0.06 * k)); gr.addColorStop(1, rgba(col, 0.02 * k));
    g.fillStyle = gr; g.beginPath(); g.moveTo(488, 186); g.lineTo(592, 186); g.lineTo(880, 862); g.lineTo(200, 862); g.closePath(); g.fill();
    lightPool(540, 862, 380, 34, col, 0.32 * k); lightPool(540, 640, 300, 240, col, 0.09 * k);
  });
  g.strokeStyle = rgba(BEIGE, 0.12); g.lineWidth = 2; g.strokeRect(150, 262, 780, 600);
  g.strokeStyle = rgba(BEIGE, 0.05); g.lineWidth = 10; g.beginPath(); g.moveTo(190, 330); g.lineTo(290, 270); g.moveTo(800, 850); g.lineTo(910, 760); g.stroke();
  const pg = g.createLinearGradient(0, 862, 0, 930); pg.addColorStop(0, '#1d1714'); pg.addColorStop(1, '#0a0809');
  g.fillStyle = pg; g.fillRect(120, 862, 840, 66); g.fillStyle = rgba(col, 0.45 * k); g.fillRect(150, 861, 780, 2);
  g.fillStyle = '#1b1512'; rr(500, 168, 80, 22, 6); g.fill(); g.fillStyle = rgba(GOLDL, 0.7 * k); g.fillRect(512, 186, 56, 3);
  g.restore();
}

// ---------- 小树枝 / 柳枝：(cx,cy) 为中心，ang 方向；fray：右端一丝丝散开成絮 ----------
const TW = (() => { const r = rng(23), f = [], m = []; for (let i = 0; i < 60; i++) f.push([r() - 0.5, r(), r(), r()]);
  for (let i = 0; i < 30; i++) m.push([r(), r() - 0.5, 5 + r() * 14]); return { f, m }; })();
function twig(cx, cy, L, w, ang, fray, a = 1, o = {}) {
  if (a <= 0.003) return;
  g.save(); g.globalAlpha *= a; g.translate(cx, cy); g.rotate(ang);
  const x0 = -L / 2, x1 = L / 2, Lf = L * (o.fl ?? 0.2), xs = x1 - Lf * clamp(fray * 1.1, 0, 1);
  const hw = x => lerp(w * 0.5, w * 0.4, (x - x0) / L), bow = x => Math.sin((x - x0) / L * Math.PI) * w * 0.25;
  const col = o.col || [[132, 94, 58], [78, 52, 30], [36, 24, 14]];
  if (o.glow) addLight(() => lightPool(0, 0, L * 0.6, w * 3, GOLD, 0.16 * o.glow));
  const gr = g.createLinearGradient(0, -w / 2, 0, w / 2); gr.addColorStop(0, rgba(col[0], 1)); gr.addColorStop(0.45, rgba(col[1], 1)); gr.addColorStop(1, rgba(col[2], 1));
  g.fillStyle = gr; g.beginPath();
  for (let i = 0; i <= 20; i++) { const x = lerp(x0, xs, i / 20); g[i ? 'lineTo' : 'moveTo'](x, -hw(x) - bow(x)); }
  for (let i = 20; i >= 0; i--) { const x = lerp(x0, xs, i / 20); g.lineTo(x, hw(x) - bow(x)); }
  g.closePath(); g.fill();
  // 节疤、小侧枝
  if (!o.noKnot) { g.beginPath(); g.ellipse(x0 + L * 0.34, -bow(x0 + L * 0.34) - hw(0) * 0.7, w * 0.32, w * 0.22, -0.3, 0, 7); g.fill();
    g.beginPath(); g.moveTo(x0 + L * 0.58, -bow(x0 + L * 0.58) - hw(0) * 0.6); g.lineTo(x0 + L * 0.63, -bow(x0 + L * 0.6) - hw(0) - w * 0.7); g.lineTo(x0 + L * 0.61, -bow(x0 + L * 0.6) - hw(0) * 0.4); g.closePath(); g.fill(); }
  // 切口（浅色木心）
  g.fillStyle = rgba(WOOD, 0.9); g.beginPath(); g.ellipse(x0, -bow(x0), w * 0.16, hw(x0), 0, 0, 7); g.fill();
  // 顶光高光、树皮纹
  g.strokeStyle = rgba(GOLDL, 0.55); g.lineWidth = Math.max(1.2, w * 0.08); g.beginPath();
  for (let i = 0; i <= 16; i++) { const x = lerp(x0 + 4, xs - 3, i / 16); g[i ? 'lineTo' : 'moveTo'](x, -hw(x) - bow(x) + w * 0.12); } g.stroke();
  g.strokeStyle = 'rgba(20,12,6,0.45)'; g.lineWidth = 1.2;
  for (const [k, yy, l] of TW.m) { const x = lerp(x0 + 6, xs - 10, k); if (x + l > xs) continue; g.beginPath(); g.moveTo(x, yy * w * 0.7 - bow(x)); g.lineTo(x + l * (L / 520), yy * w * 0.7 - bow(x) + 1); g.stroke(); }
  if (o.leaves) { g.fillStyle = rgba([60, 74, 40], 1); for (let i = 0; i < o.leaves; i++) { const x = lerp(x0 + 20, xs - 30, i / Math.max(1, o.leaves - 1)), sd = i % 2 ? 1 : -1;
    g.save(); g.translate(x, -bow(x) + sd * hw(x)); g.rotate(sd * 0.7 + 0.35); g.beginPath(); g.ellipse(L * 0.05, 0, L * 0.06, w * 0.35, 0, 0, 7); g.fill(); g.restore(); } }
  // 絮：几十根细纤维从断口散开，像刷头
  if (fray > 0.001) {
    const h0 = hw(xs), by = -bow(xs);
    g.fillStyle = rgba(WOOD, 0.35 * R(fray, 0, 0.2)); g.beginPath(); g.ellipse(xs, by, w * 0.12, h0, 0, 0, 7); g.fill();
    g.lineCap = 'round';
    TW.f.forEach(([yy, lr, cu, sh], i) => {
      if (o.nf && i >= o.nf) return;
      const vis = R(fray, sh * 0.45, sh * 0.45 + 0.3); if (vis <= 0.003) return;
      const len = (Lf + w * 1.2) * (0.55 + 0.5 * lr) * (0.3 + 0.7 * fray), yb = by + yy * 2 * h0 * 0.92;
      const an = yy * 1.15 * fray + (cu - 0.5) * 0.3 * fray, ex = xs - 3 + Math.cos(an) * len, ey = yb + Math.sin(an) * len;
      const cxp = xs + len * 0.5, cyp = yb + Math.sin(an) * len * 0.35 + (cu - 0.5) * w * 0.6 * fray;
      g.strokeStyle = o.tip ? rgba(mixc(WOOD, o.tip[0], o.tip[1] * lr), 0.9 * vis) : rgba(mixc([236, 214, 172], [176, 136, 92], lr), 0.9 * vis);
      g.lineWidth = Math.max(0.9, w * (0.06 + 0.04 * cu)); g.beginPath(); g.moveTo(xs - 6, yb); g.quadraticCurveTo(cxp, cyp, ex, ey); g.stroke();
    });
  }
  g.restore();
}

// ---------- 一根柳枝（第 21 屏）：细枝 + 几片细长柳叶，一端咬散 ----------
function willowSprig(cx, cy, L, ang, a, lit = 1) {
  if (a <= 0.003) return;
  if (lit > 0.003) addLight(() => lightPool(cx, cy, L * 0.62, L * 0.3, GOLD, 0.2 * lit));
  twig(cx, cy, L, 9, ang, 0.85, a, { col: [[170, 150, 92], [108, 94, 54], [52, 46, 26]], noKnot: true, fl: 0.2 });
  g.save(); g.globalAlpha *= a; g.translate(cx, cy); g.rotate(ang);
  const lv = [[-0.36, -1, 0.55], [-0.24, 1, 0.5], [-0.12, -1, 0.6], [0.0, 1, 0.48], [0.12, -1, 0.55], [0.22, 1, 0.45]];
  for (const [k, sd, rot] of lv) {
    const x = k * L, ll = L * 0.2, ww = 6.5;
    g.save(); g.translate(x, sd * 4); g.rotate(sd * rot);
    const lg = g.createLinearGradient(0, 0, ll, 0); lg.addColorStop(0, rgba(mixc([60, 76, 36], [128, 162, 78], lit), 1)); lg.addColorStop(1, rgba(mixc([50, 66, 30], [104, 140, 60], lit), 1));
    g.fillStyle = lg; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(ll * 0.45, sd * ww * 1.3, ll, sd * 1.5); g.quadraticCurveTo(ll * 0.45, -sd * ww * 0.35, 0, 0); g.fill();
    g.strokeStyle = rgba([226, 236, 180], 0.35 * lit); g.lineWidth = 1; g.beginPath(); g.moveTo(2, 0); g.lineTo(ll * 0.9, sd * 1.2); g.stroke();
    g.restore();
  }
  g.restore();
}

// ---------- 白瓷小碗：(x, y) 为碗口中心；fill：'salt' / 'water' ----------
const SALT = (() => { const r = rng(41), a = []; for (let i = 0; i < 70; i++) a.push([r() * 2 - 1, r() * 2 - 1, r() * 6.28, 1.5 + r() * 3, 0.8 + r() * 1.6]); return a; })();
function bowl(x, y, s, fill, t, a = 1, lit = 1) {
  if (a <= 0.003) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s);
  const rx = 150, ry = 34;
  addLight(() => lightPool(0, 40, 230, 140, GOLD, 0.12 * lit));
  // 碗身
  const gr = g.createLinearGradient(-rx, 0, rx, 0);
  gr.addColorStop(0, rgba(mixc([90, 96, 104], [200, 208, 214], lit * 0.6), 1)); gr.addColorStop(0.4, rgba(mixc([150, 156, 162], [246, 246, 240], lit), 1)); gr.addColorStop(1, rgba(mixc([60, 64, 72], [150, 156, 164], lit * 0.6), 1));
  g.fillStyle = gr; g.beginPath(); g.moveTo(-rx, 0); g.bezierCurveTo(-rx + 6, 74, -66, 112, -40, 116); g.lineTo(40, 116); g.bezierCurveTo(66, 112, rx - 6, 74, rx, 0); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI); g.closePath(); g.fill();
  g.fillStyle = rgba(mixc([70, 74, 80], [190, 196, 200], lit * 0.7), 1); g.fillRect(-44, 114, 88, 14);
  g.strokeStyle = rgba(MOON, 0.35 * lit); g.lineWidth = 2; g.beginPath(); g.moveTo(-rx + 14, 26); g.bezierCurveTo(-60, 52, 60, 52, rx - 14, 26); g.stroke();
  // 碗口与内面
  g.fillStyle = rgba(mixc([40, 42, 46], [120, 124, 128], lit * 0.6), 1); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.fill();
  if (fill === 'salt') {
    g.fillStyle = rgba(mixc([120, 120, 118], [232, 230, 222], lit), 1); g.beginPath(); g.ellipse(0, 6, rx * 0.84, ry * 0.7, 0, 0, 7); g.fill();
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const [px, py, ph, f, sz] of SALT) { const b = Math.pow(0.5 + 0.5 * Math.sin(t * f + ph), 6) * lit; if (b < 0.05) continue;
      const sx = px * rx * 0.78, sy = 6 + py * ry * 0.58; g.fillStyle = `rgba(255,255,250,${b})`; g.beginPath(); g.arc(sx, sy, sz * 0.8, 0, 7); g.fill();
      g.strokeStyle = `rgba(255,255,250,${b * 0.6})`; g.lineWidth = 1; g.beginPath(); g.moveTo(sx - sz * 2.4, sy); g.lineTo(sx + sz * 2.4, sy); g.moveTo(sx, sy - sz * 2.4); g.lineTo(sx, sy + sz * 2.4); g.stroke(); }
    g.restore();
  } else if (fill === 'water') {
    const wg = g.createLinearGradient(0, -ry, 0, ry); wg.addColorStop(0, rgba(MOONL, 0.55 * lit + 0.1)); wg.addColorStop(1, rgba(MOON, 0.25 * lit + 0.05));
    g.fillStyle = wg; g.beginPath(); g.ellipse(0, 5, rx * 0.86, ry * 0.72, 0, 0, 7); g.fill();
    g.strokeStyle = rgba(MOONL, 0.6 * lit); g.lineWidth = 2; for (const k of [0.35, 0.62]) { g.beginPath(); g.ellipse(Math.sin(t * 1.3) * 6, 5, rx * k, ry * k * 0.8, 0, 0.2, 2.6); g.stroke(); }
  }
  g.strokeStyle = rgba(mixc([140, 146, 150], [255, 255, 250], lit), 0.9); g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.stroke();
  g.restore();
}

// ---------- 牛角马尾刷（展柜里，柄长宽比约 8:1）与今天牙刷的线描轮廓 ----------
const HB = { x0: 280, x1: 800, y: 670, w: 64 };
function hbPath(dx = 0, dy = 0, sc = 1) {
  const { x0, x1, y, w } = HB, Y = y + dy, X0 = x0 + dx, X1 = x1 + dx, h = k => w * k * sc;
  g.beginPath(); g.moveTo(X0 + 18, Y - h(0.34));
  g.bezierCurveTo(X0 + 160, Y - h(0.38), X1 - 260, Y - h(0.42), X1 - 150, Y - h(0.44));
  g.bezierCurveTo(X1 - 100, Y - h(0.46), X1 - 60, Y - h(0.52), X1 - 26, Y - h(0.5));
  g.quadraticCurveTo(X1 + 8, Y - h(0.46), X1 + 8, Y); g.quadraticCurveTo(X1 + 8, Y + h(0.46), X1 - 26, Y + h(0.5));
  g.bezierCurveTo(X1 - 60, Y + h(0.52), X1 - 100, Y + h(0.46), X1 - 150, Y + h(0.44));
  g.bezierCurveTo(X1 - 260, Y + h(0.42), X0 + 160, Y + h(0.38), X0 + 18, Y + h(0.34));
  g.quadraticCurveTo(X0 - 6, Y, X0 + 18, Y - h(0.34)); g.closePath();
}
const HOLES = (() => { const a = []; for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) a.push([HB.x1 - 116 + i * 23 + r * 6, HB.y + (r ? 9 : -11), r]); return a; })();
const HAIR = (() => { const r = rng(77), a = []; for (let i = 0; i < 10; i++) { const h = []; for (let j = 0; j < 19; j++) h.push([(r() - 0.5) * 15, (r() - 0.5) * 0.08, 0.9 + r() * 0.14]); a.push(h); } return a; })();
// o: line 轮廓画出比例, fill, grain, holes, tuft(k) → 0..1, hairH, hard, a
function hornBrush(o) {
  const a = o.a ?? 1; if (a <= 0.003) return;
  const { x0, x1, y, w } = HB;
  g.save(); g.globalAlpha *= a;
  if ((o.fill ?? 0) > 0.003) {
    g.save(); g.globalAlpha *= o.fill;
    g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = 24; g.shadowOffsetY = 14;
    const gr = g.createLinearGradient(0, y - w / 2, 0, y + w / 2);
    gr.addColorStop(0, '#c08a52'); gr.addColorStop(0.3, '#9a6434'); gr.addColorStop(0.75, '#6a3e1e'); gr.addColorStop(1, '#3e2210');
    g.fillStyle = gr; hbPath(); g.fill(); g.shadowColor = 'rgba(0,0,0,0)';
    const lg = g.createLinearGradient(x0, 0, x1, 0); lg.addColorStop(0, 'rgba(60,30,12,0.35)'); lg.addColorStop(0.5, 'rgba(255,200,140,0.0)'); lg.addColorStop(1, 'rgba(40,20,8,0.25)');
    g.fillStyle = lg; hbPath(); g.fill();
    g.restore();
  }
  if ((o.grain ?? 0) > 0.003) {   // 牛角的细纹
    g.save(); hbPath(); g.clip(); g.beginPath(); g.rect(x0 - 20, y - 60, (x1 - x0 + 40) * o.grain, 120); g.clip();
    for (let i = 0; i < 9; i++) { const yy = y - w * 0.36 + i * w * 0.09;
      g.strokeStyle = i % 3 === 0 ? 'rgba(255,226,180,0.22)' : 'rgba(40,18,6,0.22)'; g.lineWidth = 1.3; g.beginPath();
      for (let x = x0; x <= x1; x += 12) { const yv = yy + Math.sin(x * 0.021 + i * 1.7) * 2.2 + Math.sin(x * 0.006 + i) * 3; x === x0 ? g.moveTo(x, yv) : g.lineTo(x, yv); } g.stroke(); }
    g.strokeStyle = 'rgba(255,236,200,0.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0 + 30, y - w * 0.24); g.bezierCurveTo(x0 + 200, y - w * 0.28, x1 - 200, y - w * 0.3, x1 - 40, y - w * 0.34); g.stroke();
    g.restore();
  }
  if ((o.line ?? 0) > 0.003) {   // 图纸一样的线：沿轮廓一笔画出
    const Lp = 1180; g.save(); g.strokeStyle = rgba(BEIGE, 0.9 * (1 - 0.6 * (o.fill ?? 0))); g.lineWidth = 2.6; g.shadowColor = rgba(GOLDL, 0.6); g.shadowBlur = 8;
    g.setLineDash([Lp * o.line, Lp]); hbPath(); g.stroke(); g.restore();
  }
  if ((o.holes ?? 0) > 0.003) for (const [hx, hy] of HOLES) { g.fillStyle = `rgba(28,14,6,${0.85 * o.holes})`; g.beginPath(); g.ellipse(hx, hy, 6, 3.6, 0, 0, 7); g.fill(); }
  // 马尾毛：一簇簇直挺的深色毛，插在孔里往上立；后排先画
  const HH = o.hairH ?? 78;
  if (o.tuft) {
    if (o.backlight) addLight(() => lightPool(x1 - 66, y - HH * 0.6, 170, 120, GOLD, 0.3 * o.backlight));
    const order = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (const i of order) {
      const p = o.tuft(i); if (p <= 0.003) continue;
      const [hx, hy] = HOLES[i], dy = -(1 - RO(p, 0, 1)) * 46, al = R(p, 0, 0.5);
      g.save(); g.globalAlpha *= al; g.lineCap = o.hard ? 'butt' : 'round';
      for (const [ox, lean, hk] of HAIR[i]) {
        const bx = hx + ox * 0.5, by = hy + dy, tx = hx + ox * 1.25 + lean * HH, ty = hy + dy - HH * hk;
        g.strokeStyle = '#1b1310'; g.lineWidth = o.hard ? 2.4 : 2.1; g.beginPath(); g.moveTo(bx, by); g.lineTo(tx, ty); g.stroke();
        g.strokeStyle = rgba(GOLDL, o.hard ? 0.55 : 0.4); g.lineWidth = 0.9; g.beginPath(); g.moveTo(bx - 1, by - 4); g.lineTo(tx - 0.8, ty + 1); g.stroke();
        if (o.hard) { g.fillStyle = rgba(GOLDL, 0.75); g.beginPath(); g.moveTo(tx - 1.2, ty + 4); g.lineTo(tx, ty - 3); g.lineTo(tx + 1.2, ty + 4); g.closePath(); g.fill(); }
      }
      g.fillStyle = 'rgba(20,10,4,0.9)'; g.beginPath(); g.ellipse(hx, hy + dy, 9, 4, 0, 0, 7); g.fill();
      g.restore();
    }
  }
  g.restore();
}
// 今天牙刷的白色线描轮廓（与牛角刷同长；p 画出比例，dy 偏移）
function modernOutline(dy, a, glow = 0) {
  if (a <= 0.003) return;
  const { x0, x1, y, w } = HB, Y = y + dy;
  g.save(); g.globalAlpha *= a; g.strokeStyle = 'rgba(250,252,250,0.95)'; g.lineWidth = 3; g.lineJoin = 'round'; g.lineCap = 'round';
  g.shadowColor = rgba(MOONL, 0.8); g.shadowBlur = 10 + 14 * glow;
  g.beginPath(); g.moveTo(x0 + 22, Y - w * 0.36);
  g.bezierCurveTo(x0 + 120, Y - w * 0.46, x0 + 260, Y - w * 0.44, x1 - 190, Y - w * 0.3);
  g.bezierCurveTo(x1 - 160, Y - w * 0.22, x1 - 140, Y - w * 0.36, x1 - 120, Y - w * 0.42);
  g.lineTo(x1 - 24, Y - w * 0.42); g.quadraticCurveTo(x1 + 6, Y - w * 0.4, x1 + 6, Y); g.quadraticCurveTo(x1 + 6, Y + w * 0.4, x1 - 24, Y + w * 0.42);
  g.lineTo(x1 - 120, Y + w * 0.42); g.bezierCurveTo(x1 - 140, Y + w * 0.36, x1 - 160, Y + w * 0.22, x1 - 190, Y + w * 0.3);
  g.bezierCurveTo(x0 + 260, Y + w * 0.44, x0 + 120, Y + w * 0.46, x0 + 22, Y + w * 0.36);
  g.quadraticCurveTo(x0 - 4, Y, x0 + 22, Y - w * 0.36); g.closePath(); g.stroke();
  // 刷毛块：细竖线 + 波浪顶
  const bx0 = x1 - 122, bx1 = x1 - 8, top = Y - w * 0.2 - 76;
  g.lineWidth = 2.4; g.beginPath(); g.moveTo(bx0, Y - w * 0.2); g.lineTo(bx0, top + 6);
  for (let x = bx0; x <= bx1; x += 6) g.lineTo(x, top + 4 + Math.sin((x - bx0) * 0.11) * 4); g.lineTo(bx1, Y - w * 0.2); g.stroke();
  g.lineWidth = 1.2; g.strokeStyle = 'rgba(250,252,250,0.5)'; for (let x = bx0 + 10; x < bx1; x += 10) { g.beginPath(); g.moveTo(x, Y - w * 0.22); g.lineTo(x, top + 12 + Math.sin((x - bx0) * 0.11) * 4); g.stroke(); }
  g.restore();
}
// 今天的软毛牙刷（实体，局部坐标：刷柄尾在原点，刷头朝 +x，刷毛在 -y 一侧）。bend：刷毛被按弯的程度
function modernBrush(L, bend = 0, light = 1, warm = 0) {
  const hw = x => x < 0.6 * L ? lerp(10, 13, Math.sin(x / (0.6 * L) * Math.PI * 0.9)) : x < 0.79 * L ? lerp(9, 5.5, R(x, 0.6 * L, 0.66 * L)) : 8.5;
  g.save();
  const gr = g.createLinearGradient(0, -14, 0, 14);
  const hi = mixc([236, 242, 244], [255, 236, 206], warm), lo = mixc([120, 132, 140], [140, 110, 84], warm);
  gr.addColorStop(0, rgba(mixc([40, 44, 50], hi, light), 1)); gr.addColorStop(0.5, rgba(mixc([30, 32, 38], mixc(hi, lo, 0.4), light), 1)); gr.addColorStop(1, rgba(mixc([20, 22, 26], lo, light), 1));
  g.fillStyle = gr; g.beginPath();
  for (let i = 0; i <= 40; i++) { const x = L * i / 40; g[i ? 'lineTo' : 'moveTo'](x, -hw(x)); }
  g.quadraticCurveTo(L + 9, 0, L, hw(L)); for (let i = 40; i >= 0; i--) { const x = L * i / 40; g.lineTo(x, hw(x)); }
  g.quadraticCurveTo(-8, 0, 0, -hw(0)); g.closePath(); g.fill();
  g.fillStyle = rgba(MOON, 0.85 * light); rr(L * 0.12, -4, L * 0.4, 8, 4); g.fill();
  // 刷毛：细软的弧线（根白、梢微青），被按下时弯下去
  g.lineCap = 'round';
  const n = 19, bh = 0.17 * L, sc = L / 250;
  for (let row = 0; row < 2; row++) for (let i = 0; i < n; i++) {
    const x = lerp(0.812 * L, 0.988 * L, i / (n - 1)) + row * 2.5, b = bend * (0.85 + 0.3 * Math.sin(i * 1.7 + row));
    const curl = (Math.sin(i * 2.3 + row * 1.1) * 0.5 + 0.5) * 5;
    const tipx = x + curl - b * bh * 0.6, tipy = -7 - bh * (1 - 0.3 * Math.abs(b)) * (0.94 + 0.06 * row), cx = x + 3 + curl * 0.3 - b * bh * 0.05, cy = -7 - bh * 0.6;
    const gb = g.createLinearGradient(0, -7, 0, tipy); gb.addColorStop(0, rgba(mixc([50, 60, 66], [244, 248, 250], light), 0.95)); gb.addColorStop(1, rgba(mixc([40, 56, 64], [170, 228, 242], light), 0.9));
    g.strokeStyle = gb; g.lineWidth = (row ? 1.5 : 1.8) * sc; g.beginPath(); g.moveTo(x, -7); g.quadraticCurveTo(cx, cy, tipx, tipy); g.stroke();
  }
  g.restore();
}
// 简单的牙齿线描图标；root：牙根处暗红细线闪一下
function toothIcon(x, y, s, a, root = 0) {
  if (a <= 0.003) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
  const crown = () => { g.beginPath(); g.moveTo(-58, -20); g.bezierCurveTo(-66, -70, -40, -96, -20, -84); g.quadraticCurveTo(0, -72, 20, -84); g.bezierCurveTo(40, -96, 66, -70, 58, -20);
    g.bezierCurveTo(54, 6, 48, 18, 42, 26); g.bezierCurveTo(40, 70, 30, 104, 22, 116); g.bezierCurveTo(14, 118, 10, 80, 4, 44); g.quadraticCurveTo(0, 38, -4, 44);
    g.bezierCurveTo(-10, 80, -14, 118, -22, 116); g.bezierCurveTo(-30, 104, -40, 70, -42, 26); g.bezierCurveTo(-48, 18, -54, 6, -58, -20); g.closePath(); };
  g.fillStyle = 'rgba(14,11,12,0.85)'; crown(); g.fill();
  g.strokeStyle = rgba(BEIGE, 0.92); g.lineWidth = 3.6; g.shadowColor = rgba(BEIGE, 0.5); g.shadowBlur = 8; crown(); g.stroke();
  g.shadowBlur = 0; g.strokeStyle = rgba(BEIGE, 0.35); g.lineWidth = 2; g.beginPath(); g.moveTo(-46, 22); g.quadraticCurveTo(0, 32, 46, 22); g.stroke();
  if (root > 0.003) { g.strokeStyle = `rgba(178,38,34,${0.95 * root})`; g.lineWidth = 3; g.shadowColor = `rgba(200,40,30,${root})`; g.shadowBlur = 14;
    g.beginPath(); g.moveTo(42, 30); g.bezierCurveTo(40, 70, 30, 104, 22, 116); g.moveTo(-42, 30); g.bezierCurveTo(-40, 70, -30, 104, -22, 116); g.stroke(); }
  g.restore();
}
