// 封面：竖 3:4（1080×1440）/ 横 4:3（1440×1080）。底图从成片抽帧（scene.png，1080×1920），字幕带（源 y>1150）压黑。
// 三层文字：① 片名书法体（华文新魏）米白 + 深色描边 + 投影；② 结论粗黑体亮黄 + 黑描边；③ 钩子小字米白在底部。
(function () {
  const O = window.O || 'v';
  const W = O === 'v' ? 1080 : 1440, H = O === 'v' ? 1440 : 1080;
  const cv = document.getElementById('c'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const C = { cream: '#F6EBD2', yellow: '#FFD23F', white: '#FBF6EA' };
  const img = new Image(); img.src = 'scene.png';
  img.onload = () => {
    g.fillStyle = '#07060A'; g.fillRect(0, 0, W, H);
    let s, ox, oy;
    if (O === 'v') { s = 1.0; ox = 0; oy = 50; } else { s = 0.95; ox = 430; oy = -110; }
    g.save(); g.beginPath(); g.rect(0, 0, W, oy + 1110 * s); g.clip();
    g.drawImage(img, ox, oy, 1080 * s, 1920 * s); g.restore();
    // 地面以下渐黑
    const b0 = oy + 1000 * s, b1 = oy + 1110 * s;
    const gb = g.createLinearGradient(0, b0, 0, b1);
    gb.addColorStop(0, 'rgba(7,6,10,0)'); gb.addColorStop(1, 'rgba(7,6,10,1)');
    g.fillStyle = gb; g.fillRect(0, b0, W, b1 - b0);
    // 顶部压暗给片名
    const th = O === 'v' ? 380 : 320;
    const gt = g.createLinearGradient(0, 0, 0, th);
    gt.addColorStop(0, 'rgba(7,6,10,0.9)'); gt.addColorStop(1, 'rgba(7,6,10,0)');
    g.fillStyle = gt; g.fillRect(0, 0, W, th);
    if (O === 'h') { // 左侧压暗给文字
      const gl = g.createLinearGradient(0, 0, 900, 0);
      gl.addColorStop(0, 'rgba(7,6,10,1)'); gl.addColorStop(0.55, 'rgba(7,6,10,0.92)'); gl.addColorStop(1, 'rgba(7,6,10,0)');
      g.fillStyle = gl; g.fillRect(0, 0, 820, H);
    }
    function title(t, x, y, size) {
      g.save(); g.font = `400 ${size}px "STXinwei"`; g.lineJoin = 'round';
      g.shadowColor = 'rgba(0,0,0,0.85)'; g.shadowBlur = 24; g.shadowOffsetX = 6; g.shadowOffsetY = 10;
      g.lineWidth = size * 0.11; g.strokeStyle = '#1a120a'; g.strokeText(t, x, y);
      g.shadowColor = 'transparent';
      g.lineWidth = size * 0.045; g.strokeStyle = '#3a2a16'; g.strokeText(t, x, y);
      g.fillStyle = C.cream; g.fillText(t, x, y); g.restore();
    }
    function conclusion(t, x, y, size, align = 'left') {
      g.save(); g.font = `700 ${size}px "Microsoft YaHei"`; g.textAlign = align; g.lineJoin = 'round';
      g.shadowColor = 'rgba(0,0,0,0.9)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
      g.lineWidth = size * 0.16; g.strokeStyle = '#000'; g.strokeText(t, x, y);
      g.shadowColor = 'transparent'; g.fillStyle = C.yellow; g.fillText(t, x, y); g.restore();
    }
    function hook(t, x, y, size, align = 'center') {
      g.save(); g.font = `500 ${size}px "Noto Serif SC"`; g.letterSpacing = '3px'; g.textAlign = align; g.textBaseline = 'middle';
      g.shadowColor = 'rgba(0,0,0,0.95)'; g.shadowBlur = 12; g.fillStyle = C.white; g.fillText(t, x, y); g.restore();
    }
    if (O === 'v') {
      title('古人怎么刷牙', 60, 240, 152);
      conclusion('牙刷有了', W / 2, 1185, 116, 'center');
      conclusion('医书却说别用', W / 2, 1310, 116, 'center');
      hook('没牙刷的年代，古人拿什么刷？', W / 2, 1395, 40);
    } else {
      title('古人怎么刷牙', 60, 210, 150);
      conclusion('牙刷有了', 70, 380, 96);
      conclusion('医书却说别用', 70, 495, 96);
      hook('没牙刷的年代，古人拿什么刷？', W / 2, 1020, 38);
    }
    document.title = 'done';
  };
})();
