const W = 1080, H = 1920;
const SC = D.screens, X = D.txt, FULL = D.FULL, CARDS = D.cards;
const T = n => SC[n - 1].t, E = n => +(SC[n - 1].t + SC[n - 1].dur).toFixed(3);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const sm = x => x * x * (3 - 2 * x);
const eio = x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eout = x => 1 - Math.pow(1 - x, 3);
const ramp = (t, a, b) => (b <= a ? (t >= a ? 1 : 0) : clamp((t - a) / (b - a), 0, 1));
const R = (t, a, b) => sm(ramp(t, a, b));
const RE = (t, a, b) => eio(ramp(t, a, b));
const RO = (t, a, b) => eout(ramp(t, a, b));
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let q = Math.imul(seed ^ seed >>> 15, 1 | seed);
  q = q + Math.imul(q ^ q >>> 7, 61 | q) ^ q; return ((q ^ q >>> 14) >>> 0) / 4294967296; }; }

const C = { gold: '#F4D179', white: '#FEFEFC', ink: '#0b0705' };
const COLD = [191, 211, 230], WARM = [244, 190, 110], GOLDC = [244, 209, 121], SOFT = [255, 214, 150], ICE = [226, 238, 248];
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mixc = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const SERIF = '"HSerif", serif', SANS = '"HSans", sans-serif';

// ---------- 画布 ----------
const main = document.getElementById('stage');
const G0 = main.getContext('2d');
function mk() { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; }
const BUF = [mk(), mk(), mk()], PAN = [mk(), mk()];
let g = G0;

// ---------- 通用绘制 ----------
function lightPool(x, y, rx, ry, col, a) {
  if (a <= 0.002 || rx <= 1) return;
  g.save(); g.translate(x, y); g.scale(1, ry / rx);
  const h = g.createRadialGradient(0, 0, 0, 0, 0, rx);
  h.addColorStop(0, rgba(col, a)); h.addColorStop(1, rgba(col, 0));
  g.fillStyle = h; g.beginPath(); g.arc(0, 0, rx, 0, 7); g.fill(); g.restore();
}
function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function txt(s, x, y, font, col, align = 'center') { g.font = font; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(s, x, y); g.textAlign = 'left'; }
function cam(c, fn) { g.save(); g.translate(540, 640); g.scale(c.s, c.s); g.translate(-c.fx, -c.fy); fn(); g.restore(); }
const WIDE = { fx: 540, fy: 640, s: 1 };
const camMix = (a, b, k) => ({ fx: lerp(a.fx, b.fx, k), fy: lerp(a.fy, b.fy, k), s: lerp(a.s, b.s, k) });
function poly(pts) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); }
function darken(a) { if (a > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(5,3,2,${a})`; g.fillRect(0, 0, W, H); g.restore(); } }
// ---------- 剪影 ----------
// 人由带锥度的肢段（两端圆、粗细不同）+ 贝塞尔躯干 + 头组成；先用光色偏移、带模糊画一遍做轮廓光，再用深色盖上。不画五官。
function cap(x1, y1, r1, x2, y2, r2) {
  g.beginPath(); g.arc(x1, y1, r1, 0, 7); g.fill(); g.beginPath(); g.arc(x2, y2, r2, 0, 7); g.fill();
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy); if (L < 1e-3) return;
  const nx = -dy / L, ny = dx / L;
  g.beginPath(); g.moveTo(x1 + nx * r1, y1 + ny * r1); g.lineTo(x2 + nx * r2, y2 + ny * r2); g.lineTo(x2 - nx * r2, y2 - ny * r2); g.lineTo(x1 - nx * r1, y1 - ny * r1); g.closePath(); g.fill();
}
function ik(sx, sy, tx, ty, a, b, bend) {   // 两段 IK：返回 [肘/膝 x, y, 腕/踝 x, y]
  const dx = tx - sx, dy = ty - sy, ang = Math.atan2(dy, dx);
  const d = clamp(Math.hypot(dx, dy), Math.abs(a - b) + 1e-3, a + b - 1e-3);
  const A = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1)), e = ang - bend * A;
  return [sx + Math.cos(e) * a, sy + Math.sin(e) * a, sx + Math.cos(ang) * d, sy + Math.sin(ang) * d];
}
function mitt(ex, ey, wx, wy, len, wid, ang = 0) {   // 远景里的手：沿前臂方向的掌 + 拇指
  const a = Math.atan2(wy - ey, wx - ex) + ang;
  g.save(); g.translate(wx, wy); g.rotate(a);
  g.beginPath(); g.ellipse(len * 0.45, 0, len * 0.55, wid * 0.5, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(len * 0.2, -wid * 0.42, len * 0.32, wid * 0.2, -0.55, 0, 7); g.fill();
  g.restore();
}
function DIM(kid) {   // 本片加宽了躯干和肢段（人要有肩膀和腰身），孩子改成小学生的比例
  return kid ? { torso: 108, neck: 11, rN: 11, hr: 25, ua: 54, fa: 48, th: 76, sh: 72, rU: 12.5, rE: 10, rW: 7.5, rT: 19, rK: 13, rA: 9, hl: 21, hw: 16, ft: 22,
                 shW: [27, 26], waW: [24, 27], hiW: [28, 29], fsh: 33, fwa: 28, fhi: 30 }
             : { torso: 152, neck: 16, rN: 14, hr: 25, ua: 80, fa: 72, th: 112, sh: 104, rU: 17, rE: 13, rW: 9, rT: 27, rK: 17.5, rA: 11, hl: 28, hw: 20, ft: 30,
                 shW: [37, 34], waW: [28, 31], hiW: [35, 38], fsh: 50, fwa: 36, fhi: 41 };
}
// 躯干：N 颈根，Hp 臀中心；sh/wa/hi = [背侧, 胸侧] 半宽（正面视角时两侧相同）
function torso(N, Hp, sh, wa, hi, drop = 0.1) {
  const ux = N[0] - Hp[0], uy = N[1] - Hp[1], L = Math.hypot(ux, uy), vx = ux / L, vy = uy / L, px = -vy, py = vx;
  const P = (k, w) => [Hp[0] + vx * L * k + px * w, Hp[1] + vy * L * k + py * w];
  const nB = P(1, -sh[0] * 0.38), nF = P(1, sh[1] * 0.38), cB = P(1, -sh[0] * 1.02), cF = P(1, sh[1] * 1.02);
  const sB = P(1 - drop * 1.6, -sh[0]), sF = P(1 - drop * 1.6, sh[1]);
  const b1 = P(0.72, -sh[0]), b2 = P(0.6, -wa[0]), wB = P(0.45, -wa[0]), b3 = P(0.28, -wa[0]), b4 = P(0.12, -hi[0]), hB = P(0, -hi[0]);
  const f1 = P(0.72, sh[1]), f2 = P(0.6, wa[1]), wF = P(0.45, wa[1]), f3 = P(0.28, wa[1]), f4 = P(0.12, hi[1]), hF = P(0, hi[1]);
  const bot = P(-0.16, 0);
  g.beginPath(); g.moveTo(nB[0], nB[1]);
  g.quadraticCurveTo(cB[0], cB[1], sB[0], sB[1]);
  g.bezierCurveTo(b1[0], b1[1], b2[0], b2[1], wB[0], wB[1]);
  g.bezierCurveTo(b3[0], b3[1], b4[0], b4[1], hB[0], hB[1]);
  g.quadraticCurveTo(bot[0], bot[1] + 0, hF[0], hF[1]);
  g.bezierCurveTo(f4[0], f4[1], f3[0], f3[1], wF[0], wF[1]);
  g.bezierCurveTo(f2[0], f2[1], f1[0], f1[1], sF[0], sF[1]);
  g.quadraticCurveTo(cF[0], cF[1], nF[0], nF[1]); g.closePath(); g.fill();
}
function headSide(x, y, r, rot, kid) {   // 侧脸轮廓（朝 +x）：后脑、下颌、鼻尖、下巴，不画五官
  g.save(); g.translate(x, y); g.rotate(rot);
  g.beginPath(); g.ellipse(-r * 0.04, 0, r, r * 1.08, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(r * 0.3, r * 0.42, r * 0.66, r * 0.58, 0.25, 0, 7); g.fill();
  g.beginPath(); g.moveTo(r * 0.86, -r * 0.1); g.quadraticCurveTo(r * (kid ? 1.1 : 1.2), r * 0.28, r * 0.88, r * 0.36); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(r * 0.6, r * 0.78, r * 0.3, r * 0.24, 0.3, 0, 7); g.fill();
  g.restore();
}
function headFront(x, y, r, rot) {
  g.save(); g.translate(x, y); g.rotate(rot || 0);
  g.beginPath(); g.ellipse(0, 0, r * 0.9, r * 1.06, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(0, r * 0.45, r * 0.66, r * 0.62, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(-r * 0.88, r * 0.12, r * 0.17, r * 0.24, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(r * 0.88, r * 0.12, r * 0.17, r * 0.24, 0, 0, 7); g.fill();
  g.restore();
}
function hairSide(type, x, y, r, rot, sway) {
  if (!type || type === 'bald') return;
  g.save(); g.translate(x, y); g.rotate(rot);
  if (type === 'futou' || type === 'tang') {   // 幞头：包住头顶的软帽 + 后脑凸起；futou 后面一根平直的长脚，tang 两条软脚垂在脑后
    g.beginPath(); g.ellipse(-r * 0.1, -r * 0.42, r * 1.0, r * 0.74, -0.08, 0, 7); g.fill();
    g.beginPath(); g.ellipse(-r * 0.32, -r * 0.92, r * 0.56, r * 0.5, 0, 0, 7); g.fill();
    if (type === 'futou') { g.beginPath(); g.moveTo(-r * 0.5, -r * 0.62); g.lineTo(-r * 3.1, -r * 0.78); g.lineTo(-r * 3.12, -r * 0.6); g.lineTo(-r * 0.5, -r * 0.4); g.closePath(); g.fill(); }
    else { const sw = sway || 0; for (const k of [0, 1]) { g.beginPath(); g.moveTo(-r * 0.75, -r * 0.55 + k * r * 0.25);
      g.quadraticCurveTo(-r * (1.5 + sw * 0.2 + k * 0.15), r * 0.2, -r * (1.3 + sw * 0.25 + k * 0.2), r * 1.15); g.lineTo(-r * (1.08 + k * 0.2), r * 1.1);
      g.quadraticCurveTo(-r * (1.2 + k * 0.1), r * 0.1, -r * 0.6, -r * 0.3); g.closePath(); g.fill(); } }
    g.restore(); return;
  }
  if (type === 'douli') {   // 斗笠：宽平的锥形帽
    g.beginPath(); g.moveTo(-r * 2.1, -r * 0.3); g.quadraticCurveTo(0, -r * 0.62, r * 2.1, -r * 0.3); g.lineTo(r * 1.9, -r * 0.42);
    g.quadraticCurveTo(r * 0.6, -r * 1.05, r * 0.05, -r * 1.55); g.quadraticCurveTo(-r * 0.6, -r * 1.05, -r * 1.9, -r * 0.42); g.closePath(); g.fill();
    g.restore(); return;
  }
  if (type === 'topknot') {   // 束发 + 头顶发髻
    g.beginPath(); g.ellipse(-r * 0.14, -r * 0.2, r * 1.05, r * 0.98, -0.1, 0, 7); g.fill();
    g.beginPath(); g.arc(-r * 0.12, -r * 1.12, r * 0.4, 0, 7); g.fill();
    g.restore(); return;
  }
  if (type === 'ponytail') {
    g.beginPath(); g.ellipse(-r * 0.12, -r * 0.12, r * 1.04, r * 1.04, 0, 0, 7); g.fill();
    const sw = sway || 0;
    g.beginPath(); g.moveTo(-r * 0.62, -r * 0.82);
    g.bezierCurveTo(-r * 1.65, -r * 0.9, -r * (1.7 + sw * 0.2), r * 0.3, -r * (1.25 + sw * 0.3), r * 1.25);
    g.bezierCurveTo(-r * 1.2, r * 0.4, -r * 1.05, -r * 0.2, -r * 0.7, -r * 0.42); g.closePath(); g.fill();
    g.beginPath(); g.arc(-r * 0.8, -r * 0.7, r * 0.22, 0, 7); g.fill();
  } else if (type === 'long') {
    g.beginPath(); g.moveTo(r * 0.7, -r * 0.85);
    g.bezierCurveTo(r * 0.1, -r * 1.35, -r * 1.25, -r * 1.05, -r * 1.12, r * 0.2);
    g.bezierCurveTo(-r * 1.1, r * 1.1, -r * 1.0, r * 1.8, -r * 0.75, r * 2.2);
    g.lineTo(-r * 0.15, r * 1.75); g.bezierCurveTo(-r * 0.1, r * 1.0, r * 0.1, r * 0.3, r * 0.3, -r * 0.2); g.closePath(); g.fill();
  } else if (type === 'short') {
    g.beginPath(); g.ellipse(-r * 0.14, -r * 0.2, r * 1.05, r * 0.98, -0.1, 0, 7); g.fill();
  } else if (type === 'bob') {
    g.beginPath(); g.ellipse(-r * 0.18, -r * 0.05, r * 1.12, r * 1.14, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(-r * 1.2, 0); g.quadraticCurveTo(-r * 1.15, r * 0.9, -r * 0.5, r * 0.95); g.lineTo(0, r * 0.2); g.closePath(); g.fill();
  }
  g.restore();
}
function hairFront(type, x, y, r) {
  if (!type) return;
  if (type === 'buns') { g.beginPath(); g.arc(x - r * 0.72, y - r * 0.82, r * 0.34, 0, 7); g.fill(); g.beginPath(); g.arc(x + r * 0.72, y - r * 0.82, r * 0.34, 0, 7); g.fill(); }
  else if (type === 'pigtails') {
    g.beginPath(); g.ellipse(x - r * 1.05, y + r * 0.35, r * 0.24, r * 0.55, 0.35, 0, 7); g.fill();
    g.beginPath(); g.ellipse(x + r * 1.05, y + r * 0.35, r * 0.24, r * 0.55, -0.35, 0, 7); g.fill();
    g.beginPath(); g.ellipse(x, y - r * 0.12, r * 0.98, r * 1.0, 0, 0, 7); g.fill();
  } else if (type === 'bob') {
    g.beginPath(); g.ellipse(x, y - r * 0.1, r * 1.1, r * 1.1, 0, 0, 7); g.fill();
    g.fillRect(x - r * 1.08, y - r * 0.1, r * 0.4, r * 0.95); g.fillRect(x + r * 0.68, y - r * 0.1, r * 0.4, r * 0.95);
  } else if (type === 'short') { g.beginPath(); g.ellipse(x, y - r * 0.3, r * 0.98, r * 0.82, 0, 0, 7); g.fill(); }
  else if (type === 'long') {
    g.beginPath(); g.ellipse(x, y - r * 0.1, r * 1.08, r * 1.1, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(x - r * 1.05, y); g.quadraticCurveTo(x - r * 1.35, y + r * 1.6, x - r * 1.1, y + r * 2.3); g.lineTo(x - r * 0.55, y + r * 1.4); g.lineTo(x - r * 0.6, y); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(x + r * 1.05, y); g.quadraticCurveTo(x + r * 1.35, y + r * 1.6, x + r * 1.1, y + r * 2.3); g.lineTo(x + r * 0.55, y + r * 1.4); g.lineTo(x + r * 0.6, y); g.closePath(); g.fill();
  }
}
let SLEEVE = 0;   // 1 = 古装宽袖：前臂画成往手腕张开的袖筒
function arm(S, Tg, d, bend, foreOnly) {
  const [ex, ey, wx, wy] = ik(S[0], S[1], Tg[0], Tg[1], d.ua, d.fa, bend);
  if (!foreOnly) cap(S[0], S[1], d.rU * (SLEEVE ? 1.15 : 1), ex, ey, d.rE * (SLEEVE ? 1.25 : 1));
  if (SLEEVE) { const k = 0.8; cap(ex, ey, d.rE * 1.3, lerp(ex, wx, k), lerp(ey, wy, k), d.rW * 2.1);
    g.beginPath(); const mx = lerp(ex, wx, k), my = lerp(ey, wy, k); g.moveTo(mx - d.rW * 2, my); g.quadraticCurveTo(mx - d.rW * 0.5, my + d.rW * 4.2, mx + d.rW * 1.6, my + d.rW * 1.2); g.closePath(); g.fill(); }
  cap(ex, ey, d.rE, wx, wy, d.rW);
  mitt(ex, ey, wx, wy, d.hl, d.hw);
  return [ex, ey, wx, wy];
}
function armOut(S, Tg, d, side, foreOnly) {   // 正面视角：肘往外
  const a = ik(S[0], S[1], Tg[0], Tg[1], d.ua, d.fa, 1), b = ik(S[0], S[1], Tg[0], Tg[1], d.ua, d.fa, -1);
  const pick = (a[0] - S[0]) * side + 0.3 * (a[1] - S[1]) > (b[0] - S[0]) * side + 0.3 * (b[1] - S[1]) ? 1 : -1;
  return arm(S, Tg, d, pick, foreOnly);
}
function leg(Hp, A, d, ft = 1) {
  const [kx, ky, ax, ay] = ik(Hp[0], Hp[1], A[0], A[1], d.th, d.sh, 1);
  cap(Hp[0], Hp[1], d.rT, kx, ky, d.rK); cap(kx, ky, d.rK, ax, ay, d.rA);
  cap(ax - d.rA * 0.3, ay, d.rA, ax + d.ft * ft, ay + d.rA * 0.25, d.rA * 0.7);
}
// 头（含头发）。o.headBack：头转向身后（侧脸镜像）
function headAt(o, Hd, d, ht) {
  if (o.turn !== undefined && o.turn > 0.001) {   // 转头：0 朝前 → 1 转向身后；中间横向压扁，读起来像在转
    const c = Math.cos(Math.PI * clamp(o.turn, 0, 1)), sx = (c >= 0 ? 1 : -1) * Math.max(0.55, Math.abs(c)), r2 = c >= 0 ? ht : -ht * 0.5;
    g.save(); g.translate(Hd[0], Hd[1]); g.scale(sx, 1); headSide(0, 0, d.hr, r2, o.kid); hairSide(o.hair, 0, 0, d.hr, r2, o.sway); g.restore(); return;
  }
  if (o.headBack) { g.save(); g.translate(Hd[0], Hd[1]); g.scale(-1, 1); headSide(0, 0, d.hr, -ht * 0.5, o.kid); hairSide(o.hair, 0, 0, d.hr, -ht * 0.5, o.sway); g.restore(); return; }
  headSide(Hd[0], Hd[1], d.hr, ht, o.kid); hairSide(o.hair, Hd[0], Hd[1], d.hr, ht, o.sway);
}
// 坐着的侧影（朝 +x），臀部在原点。o: kid, lean, tilt, hair, handN/handF（近/远手目标）, foot
function seatedSide(o) {
  const d = DIM(o.kid), lean = o.lean || 0, sn = Math.sin(lean), cs = Math.cos(lean);
  const N = [sn * d.torso, -cs * d.torso], S = [N[0] - sn * d.torso * 0.12 + 3, N[1] + cs * d.torso * 0.12];
  const ht = lean + (o.tilt || 0), Hd = [N[0] + Math.sin(ht) * (d.neck + d.hr * 0.95), N[1] - Math.cos(ht) * (d.neck + d.hr * 0.95)];
  const foot = o.foot || [d.th + 6, d.sh * 0.98];
  const r = { N, S, Hd, d };
  r.draw = () => {
    leg([5, -3], o.footF || [foot[0] + 8, foot[1] - 2], d);
    if (o.handF) arm([S[0] + 4, S[1] - 3], o.handF, d, -1);
    torso(N, [0, 0], d.shW, d.waW, d.hiW);
    cap(N[0] - sn * 4, N[1] + 4, d.rN, N[0] + Math.sin(ht) * d.neck, N[1] - Math.cos(ht) * d.neck, d.rN * 0.9);
    headAt(o, Hd, d, ht);
    leg([0, 0], foot, d);
    if (o.handN) r.wN = arm(S, o.handN, d, -1);
    if (o.extra) o.extra(r);
  };
  return r;
}
// 站着/走路的侧影（朝 +x），脚底在原点。o: kid, walk(相位), amp, lean, hair, handN/handF, extra
function standSide(o) {
  const d = DIM(o.kid), L = d.th + d.sh, ph = o.walk, walking = ph !== undefined && ph !== null;
  const amp = o.amp ?? 0.3, sw = walking ? Math.sin(ph) : 0;
  const hipH = (walking ? L * 0.97 - (1 - Math.abs(Math.cos(ph))) * 3 : L * 0.985) + d.rA;
  const Hp = [0, -hipH], lean = o.lean || 0;
  const N = [Hp[0] + Math.sin(lean) * d.torso, Hp[1] - Math.cos(lean) * d.torso];
  const S = [N[0] - Math.sin(lean) * d.torso * 0.12 + 2, N[1] + Math.cos(lean) * d.torso * 0.12];
  const ht = lean + (o.tilt || 0), Hd = [N[0] + Math.sin(ht) * (d.neck + d.hr * 0.95), N[1] - Math.cos(ht) * (d.neck + d.hr * 0.95)];
  // 站立：重心在后腿（近乎伸直），前腿放松、膝盖微弯、脚在前面着地；走路：两腿交替摆动
  const legA = walking ? [amp * sw, -amp * sw] : (o.legA || [0.13, -0.03]);
  const ank = legA.map((a, k) => { const lift = walking ? Math.max(0, Math.cos(ph + k * Math.PI)) * 0.06 * L : 0;
    if (!walking) return [Hp[0] + Math.sin(a) * L, -d.rA];
    return [Hp[0] + Math.sin(a) * L * 0.97, Math.min(-d.rA, Hp[1] + Math.cos(a) * L * 0.97 - lift)]; });
  const hang = (a) => [S[0] + Math.sin(a) * (d.ua + d.fa) * 0.9 + 4, S[1] + Math.cos(a) * (d.ua + d.fa) * 0.9];
  const r = { N, S, Hd, Hp, d };
  r.draw = () => {
    leg([Hp[0] + 3, Hp[1] - 2], ank[1], d);
    SLEEVE = o.robe ? 1 : 0; r.wF = arm([S[0] + 3, S[1] - 3], o.handF || hang(-legA[1] * 0.9 + 0.08), d, -1); SLEEVE = 0;
    torso(N, Hp, d.shW, d.waW, d.hiW);
    cap(N[0], N[1] + 4, d.rN, N[0] + Math.sin(ht) * d.neck, N[1] - Math.cos(ht) * d.neck, d.rN * 0.9);
    headAt(o, Hd, d, ht);
    leg(Hp, ank[0], d);
    if (o.robe) {   // 长袍：从腰往下张开到脚踝（僧袍到地）
      const Wst = [lerp(Hp[0], N[0], 0.42), lerp(Hp[1], N[1], 0.42)], hem = o.robe === 'long' ? -2 : -d.rA * 1.6;
      const xb = Math.min(ank[0][0], ank[1][0]) - d.rA * 2.6, xf = Math.max(ank[0][0], ank[1][0]) + d.rA * 2.4;
      g.beginPath(); g.moveTo(Wst[0] - d.waW[0] * 1.02, Wst[1]);
      g.bezierCurveTo(Hp[0] - d.hiW[0] * 1.15, Hp[1] + 10, xb + 6, hem - 60, xb, hem);
      g.quadraticCurveTo((xb + xf) / 2, hem + 6, xf, hem);
      g.bezierCurveTo(xf - 4, hem - 60, Hp[0] + d.hiW[1] * 1.12, Hp[1] + 10, Wst[0] + d.waW[1] * 1.02, Wst[1]); g.closePath(); g.fill();
      SLEEVE = 1;
    }
    r.wN = arm(S, o.handN || hang(-legA[0] * 0.9 + 0.08), d, -1);
    SLEEVE = 0;
    if (o.extra) o.extra(r);
  };
  return r;
}
// 正面的人，臀中心在原点。o: kid, hands [[左手目标],[右手目标]], hair, headDy, headX, headRot, stand（画腿）
function frontFig(o) {
  const d = DIM(o.kid), N = [o.leanX || 0, -d.torso];
  const Sl = [N[0] - d.fsh + d.rU * 0.8, N[1] + d.torso * 0.13], Sr = [N[0] + d.fsh - d.rU * 0.8, N[1] + d.torso * 0.13];
  const Hd = [N[0] + (o.headX || 0), N[1] - d.neck - d.hr * 0.98 + (o.headDy || 0)];
  const r = { N, Hd, d, Sl, Sr };
  r.draw = (part) => {
    if (part !== 'fore') {
      if (o.stand) { const hh = (d.th + d.sh) * 0.97 + d.rA;
        leg([-d.fhi * 0.45, 0], [-d.fhi * 0.55 - 4, hh], d, -0.3); leg([d.fhi * 0.45, 0], [d.fhi * 0.55 + 4, hh], d, 0.3); }
      torso(N, [0, 0], [d.fsh, d.fsh], [d.fwa, d.fwa], [d.fhi, d.fhi], o.kid ? 0.17 : 0.11);
      cap(N[0], N[1] + 6, d.rN * 1.15, Hd[0] * 0.6 + N[0] * 0.4, N[1] - d.neck, d.rN);
      hairFront(o.hair === 'long' || o.hair === 'pigtails' ? o.hair : null, Hd[0], Hd[1], d.hr);
      headFront(Hd[0], Hd[1], d.hr, o.headRot);
      if (o.hair !== 'long' && o.hair !== 'pigtails') hairFront(o.hair, Hd[0], Hd[1], d.hr);
    }
    if (o.hands && o.elbows) {   // 手臂自然搭在桌上：上臂从肩膀往下到桌面，前臂往前伸到手
      [[Sl, 0], [Sr, 1]].forEach(([S, k]) => { const E = o.elbows[k], Wt = o.hands[k];
        if (part !== 'fore') cap(S[0], S[1], d.rU, E[0], E[1], d.rE);
        cap(E[0], E[1], d.rE * 1.05, Wt[0], Wt[1], d.rW); mitt(E[0], E[1], Wt[0], Wt[1], d.hl, d.hw);
        if (k) r.wR = [E[0], E[1], Wt[0], Wt[1]]; else r.wL = [E[0], E[1], Wt[0], Wt[1]]; });
    } else if (o.hands) { r.wL = armOut(Sl, o.hands[0], d, -1, part === 'fore'); r.wR = armOut(Sr, o.hands[1], d, 1, part === 'fore'); }
    if (o.extra) o.extra(r, part);
  };
  return r;
}
function at(x, y, s, dir, fn, rot) { return () => { g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.scale(s * dir, s); fn(); g.restore(); }; }
function sil(fn, rim, rimA, dx = 3, dy = -3, blur = 16, dark = C.ink) {
  if (rimA > 0.01) { g.save(); g.translate(dx, dy); g.fillStyle = g.strokeStyle = rgba(rim, rimA); g.shadowColor = rgba(rim, Math.min(1, rimA)); g.shadowBlur = blur; fn(); g.restore(); }
  g.save(); g.fillStyle = g.strokeStyle = dark; fn(); g.restore();
}
const SCR = mk();
function silA(alpha, fn, rim, rimA, dx = 3, dy = -3, blur = 16, dark = C.ink) {   // 整体淡入淡出的剪影（不露出肢段重叠）
  if (alpha <= 0.002) return;
  if (alpha >= 0.999) return sil(fn, rim, rimA, dx, dy, blur, dark);
  const sc = SCR.getContext('2d'); sc.setTransform(1, 0, 0, 1, 0, 0); sc.globalAlpha = 1; sc.clearRect(0, 0, W, H); sc.setTransform(g.getTransform());
  const prev = g; g = sc; sil(fn, rim, rimA, dx, dy, blur, dark); g = prev;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha *= alpha; g.drawImage(SCR, 0, 0); g.restore();
}
function clipAbove(y, fn) { g.save(); g.beginPath(); g.rect(-5000, -5000, 12000, y + 5000); g.clip(); fn(); g.restore(); }

// ---------- 小工具 ----------
function rotP(x, y, cx, cy, a) { const c = Math.cos(a), s = Math.sin(a); return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]; }
function pathFill(map, cmds) {   // 用映射函数画一条闭合贝塞尔路径并填充
  g.beginPath();
  for (const c of cmds) { const p = []; for (let i = 1; i < c.length; i += 2) p.push(...map(c[i], c[i + 1]));
    if (c[0] === 'M') g.moveTo(p[0], p[1]); else if (c[0] === 'L') g.lineTo(p[0], p[1]); else if (c[0] === 'Q') g.quadraticCurveTo(p[0], p[1], p[2], p[3]); else g.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]); }
  g.closePath(); g.fill();
}
function pulses(t, times, up = 0.32, hold = 0.22, down = 0.45) {   // 动作曲线：每个时刻 ti 之前抬起、停一下、放下
  let v = 0; for (const ti of times) v = Math.max(v, R(t, ti - up, ti) * (1 - R(t, ti + hold, ti + hold + down))); return v;
}
function addLight(fn) { g.save(); g.globalCompositeOperation = 'lighter'; fn(); g.restore(); }
