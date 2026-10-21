// vibe-fx.js：给 Canvas 2D 画的知识视频加"质感"。三样东西：
//   1. 成片质感层 finish()：泛光、胶片颗粒、调色、暗角。每帧画完所有内容后调用一次，成本最低、效果最明显。
//   2. 材料处理 texture() / shade()：让平涂的色块有纸纹颗粒和明暗体积，不再是扁平矢量。
//   3. 运镜 camAt()：按关键帧算出某一时刻的镜头（缩放 + 对准点），推、拉、移都用它。
// 全部只依赖时间 t 和固定种子：同一帧每次渲染完全一样（HyperFrames 的硬要求）。
// 用法见 references/画面质感.md；示例：
//   const FX = makeFx(1080, 1920, { bloom: 0.35, grain: 0.07, grade: [255, 200, 140, 0.06] });
//   function draw(t) { ……画完场景……; FX.finish(ctx, t); }
// 思路参考 huashu-art-motion（alchaincyf，MIT）"平涂之后至少做一样材料处理"和"成片质感层"的经验，代码是重写的。

function makeFx(W, H, opt = {}) {
  const o = Object.assign({
    bloom: 0.3,          // 泛光强度 0–1：亮处向外晕开。烛光、金字、屏幕光最受益
    bloomBlur: 16,       // 泛光半径（按 1/4 尺寸的像素算）
    bloomCut: 2.2,       // 只让亮部发光：越大，参与泛光的亮部越少
    grain: 0.06,         // 胶片颗粒强度 0–0.15
    grainFrames: 6,      // 颗粒换几套图案循环（每帧换一套，看起来是"活"的颗粒）
    vignette: 0,         // 暗角强度 0–1（工程里已经有暗角就设 0）
    grade: null,         // 调色：[r, g, b, 强度]，用柔光叠一层颜色，比如暖色 [255, 200, 140, 0.06]
    fps: 30,
    seed: 7,
  }, opt);
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let q = Math.imul(seed ^ seed >>> 15, 1 | seed);
    q = q + Math.imul(q ^ q >>> 7, 61 | q) ^ q; return ((q ^ q >>> 14) >>> 0) / 4294967296; }; }

  // ---- 预先生成：颗粒图块（细）和纸纹图块（粗细两层）----
  const TILE = 256;
  function noiseTile(seed, coarse) {
    const c = mk(TILE, TILE), x = c.getContext('2d'), img = x.createImageData(TILE, TILE), r = rng(seed);
    // 纸纹：两层能首尾相接的格点噪声（格子 32px 和 8px），图块平铺时看不出接缝
    const oct = [[TILE / 32, 0.3], [TILE / 8, 0.25]].map(([n, amp]) => ({ n, amp, v: Array.from({ length: n * n }, r) }));
    const sm = k => k * k * (3 - 2 * k);
    for (let y = 0; y < TILE; y++) for (let xx = 0; xx < TILE; xx++) {
      let v = r();
      if (coarse) {
        let lv = 0;
        for (const { n, amp, v: g } of oct) {
          const gx = xx * n / TILE, gy = y * n / TILE, ix = gx | 0, iy = gy | 0, fx = sm(gx - ix), fy = sm(gy - iy);
          const L = (a, b) => g[(b % n) * n + (a % n)];
          lv += amp * ((L(ix, iy) * (1 - fx) + L(ix + 1, iy) * fx) * (1 - fy) + (L(ix, iy + 1) * (1 - fx) + L(ix + 1, iy + 1) * fx) * fy);
        }
        v = lv + 0.45 * v;                            // 0.55 的起伏 + 0.45 的细颗粒
      }
      const p = (y * TILE + xx) * 4, g = 128 + (v - 0.5) * 255;
      img.data[p] = img.data[p + 1] = img.data[p + 2] = g; img.data[p + 3] = 255;
    }
    x.putImageData(img, 0, 0); return c;
  }
  const GRAIN = Array.from({ length: o.grainFrames }, (_, i) => noiseTile(o.seed * 101 + i, false));
  const PAPER = noiseTile(o.seed * 7 + 3, true);
  const SMALL = mk(Math.ceil(W / 4), Math.ceil(H / 4));
  const VIG = mk(W, H);
  if (o.vignette > 0) {
    const v = VIG.getContext('2d'), gr = v.createRadialGradient(W / 2, H * 0.42, Math.min(W, H) * 0.35, W / 2, H * 0.42, Math.hypot(W, H) * 0.6);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${o.vignette})`); v.fillStyle = gr; v.fillRect(0, 0, W, H);
  }

  // ---- 1. 成片质感层 ----
  function finish(ctx, t) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
    if (o.bloom > 0) {                                 // 缩小 → 压暗部、提亮部 → 模糊 → 用"滤色"叠回去
      const s = SMALL.getContext('2d');
      s.globalCompositeOperation = 'copy';
      // 先拉对比度（以中灰为轴）：暗部归零、亮部顶满；再整体压一点，只剩亮处参与发光
      s.filter = `contrast(${(1 + o.bloomCut).toFixed(3)}) brightness(0.85) blur(${o.bloomBlur / 4}px)`;
      s.drawImage(ctx.canvas, 0, 0, SMALL.width, SMALL.height);
      s.filter = 'none'; s.globalCompositeOperation = 'source-over';
      ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = o.bloom;
      ctx.drawImage(SMALL, 0, 0, W, H);
    }
    if (o.grade) {
      const [r, g, b, k] = o.grade;
      ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = k;
      ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fillRect(0, 0, W, H);
    }
    if (o.vignette > 0) { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.drawImage(VIG, 0, 0); }
    if (o.grain > 0) {                                 // 按帧号换图块和偏移：颗粒在"跳"，但同一帧永远一样
      const f = Math.floor(t * o.fps + 1e-6), tile = GRAIN[((f % o.grainFrames) + o.grainFrames) % o.grainFrames];
      const r = rng(o.seed * 7919 + f), ox = -Math.floor(r() * TILE), oy = -Math.floor(r() * TILE);
      ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = o.grain;
      for (let y = oy; y < H; y += TILE) for (let x = ox; x < W; x += TILE) ctx.drawImage(tile, x, y);
    }
    ctx.restore();
  }

  // ---- 2. 材料处理：在当前的剪裁区域里叠纸纹 / 明暗 ----
  // 用法：ctx.save(); 画出物体的路径; ctx.fill(); ctx.clip(); FX.texture(ctx, 0.35); FX.shade(ctx, x0, y0, x1, y1); ctx.restore();
  function texture(ctx, alpha = 0.3, mode = 'overlay') {
    ctx.save(); ctx.globalCompositeOperation = mode; ctx.globalAlpha = alpha;
    const m = ctx.getTransform(); ctx.setTransform(1, 0, 0, 1, 0, 0);   // 纸纹贴在屏幕上，不跟着镜头缩放变糊
    ctx.fillStyle = ctx.createPattern(PAPER, 'repeat'); ctx.fillRect(0, 0, W, H);
    ctx.setTransform(m); ctx.restore();
  }
  // 从 (x0,y0) 受光到 (x1,y1) 背光：受光一侧提亮、背光一侧压暗，平面立刻有体积
  function shade(ctx, x0, y0, x1, y1, light = 0.28, dark = 0.45) {
    ctx.save();
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, `rgba(255,240,220,${light})`); g.addColorStop(0.45, 'rgba(255,240,220,0)');
    g.addColorStop(0.55, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${dark})`);
    ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = g; ctx.fillRect(-1e4, -1e4, 2e4, 2e4);
    ctx.restore();
  }

  // ---- 3. 运镜：关键帧插值 ----
  // keys: [{ t: 秒, s: 缩放, x: 对准点 x, y: 对准点 y, ease: 'io' | 'in' | 'out' | 'snap' }, ...]，按时间排好。
  // 'io' 缓进缓出（默认，过渡用）；'snap' 快推（0.25 秒内到位，留给揭晓和反转）。
  // 返回 { s, fx, fy }，用法：ctx.translate(舞台中心x, 舞台中心y); ctx.scale(c.s, c.s); ctx.translate(-c.fx, -c.fy);
  const EASE = {
    io: x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    in: x => x * x * x, out: x => 1 - Math.pow(1 - x, 3),
    snap: x => 1 - Math.pow(1 - Math.min(1, x * 4), 4),
  };
  function camAt(t, keys) {
    if (t <= keys[0].t) return { s: keys[0].s, fx: keys[0].x, fy: keys[0].y };
    for (let i = 1; i < keys.length; i++) {
      const a = keys[i - 1], b = keys[i];
      if (t <= b.t) {
        const k = (EASE[b.ease || 'io'])((t - a.t) / Math.max(1e-6, b.t - a.t));
        return { s: a.s + (b.s - a.s) * k, fx: a.x + (b.x - a.x) * k, fy: a.y + (b.y - a.y) * k };
      }
    }
    const z = keys[keys.length - 1]; return { s: z.s, fx: z.x, fy: z.y };
  }

  return { finish, texture, shade, camAt, opt: o };
}
