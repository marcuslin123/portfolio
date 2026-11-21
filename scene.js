const canvas = document.querySelector('.energy-scene');
const button = document.querySelector('.scene-control');
const context = canvas?.getContext('2d');

if (context && button) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const board = document.createElement('canvas');
  const ink = board.getContext('2d');
  const input = [[30, 160], [80, 160], [108, 132], [150, 132], [178, 160], [240, 160]];
  const upper = [[240, 160], [294, 160], [327, 127], [327, 80], [382, 80], [409, 53], [450, 53]];
  const lower = [[240, 160], [294, 160], [327, 193], [327, 240], [382, 240], [409, 267], [450, 267]];
  const traces = [
    [[45, 66], [139, 66], [174, 101], [215, 101], [215, 115]],
    [[53, 103], [114, 103], [134, 83], [151, 83]],
    [[40, 245], [111, 245], [146, 210], [191, 210], [205, 196]],
    [[72, 277], [161, 277], [196, 242], [264, 242], [286, 220]],
    [[258, 115], [258, 93], [290, 61], [348, 61], [379, 30], [437, 30]],
    [[272, 205], [291, 205], [304, 218], [304, 269], [334, 299], [439, 299]],
    [[282, 136], [310, 136], [327, 119], [402, 119], [430, 91], [460, 91]],
    [[282, 183], [309, 183], [326, 200], [401, 200], [429, 228], [461, 228]],
  ];
  let width, height, scale, left, top, density;
  let frame = 0;
  let startedAt = 0;

  function trace(ctx, points, color, weight) {
    ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    ctx.stroke();
  }

  function pad(ctx, x, y, radius, fill, stroke) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function paintBoard() {
    ink.save();
    ink.translate(left, top);
    ink.scale(scale, scale);
    ink.lineJoin = 'round';
    ink.lineCap = 'round';

    ink.beginPath();
    ink.roundRect(8, 10, 477, 300, 16);
    ink.fillStyle = '#141026';
    ink.fill();
    ink.strokeStyle = '#68538c';
    ink.stroke();

    ink.fillStyle = '#aa91f73b';
    for (let y = 25; y < 307; y += 12) {
      for (let x = 25; x < 480; x += 12) ink.fillRect(x, y, 1, 1);
    }

    for (const route of traces) {
      trace(ink, route, '#7356a4', 1.5);
      for (const [x, y] of [route[0], route.at(-1)]) pad(ink, x, y, 3.2, '#1d1333', '#9373c4');
    }
    for (const route of [input, upper, lower]) trace(ink, route, '#ae8af0', 2.4);
    pad(ink, 30, 160, 7, '#263353', '#99e5ff');
    for (const route of [upper, lower]) pad(ink, ...route.at(-1), 7, '#282041', '#ba9cf5');

    ink.fillStyle = '#a78bd7';
    for (let i = 0; i < 7; i += 1) {
      ink.fillRect(203 + i * 11, 109, 4, 12);
      ink.fillRect(203 + i * 11, 199, 4, 12);
      ink.fillRect(189, 124 + i * 11, 12, 4);
      ink.fillRect(279, 124 + i * 11, 12, 4);
    }
    ink.beginPath();
    ink.roundRect(198, 118, 84, 84, 8);
    ink.fillStyle = '#221936';
    ink.fill();
    ink.strokeStyle = '#ac90dc';
    ink.lineWidth = 1.5;
    ink.stroke();
    ink.strokeStyle = '#675384';
    ink.strokeRect(209, 129, 62, 62);
    pad(ink, 240, 160, 10, '#302446', '#9a7cc9');
    pad(ink, 208, 128, 2, '#cebafa', '#cebafa');
    for (const [x, y] of [[23, 25], [470, 25], [23, 295], [470, 295]]) {
      pad(ink, x, y, 4, '#0a0814', '#72598f');
    }
    ink.restore();
  }

  function pulse(route, progress) {
    const routeLength = route.slice(1).reduce((length, [x, y], i) =>
      length + Math.hypot(x - route[i][0], y - route[i][1]), 0);
    let remaining = progress * routeLength;
    for (let i = 1; i < route.length; i += 1) {
      const [x, y] = route[i - 1];
      const dx = route[i][0] - x;
      const dy = route[i][1] - y;
      const length = Math.hypot(dx, dy);
      if (remaining <= length || i === route.length - 1) {
        const fraction = Math.min(1, remaining / length);
        pad(context, x + dx * fraction, y + dy * fraction, 3.4, '#effcff', '#97e8ff');
        return;
      }
      remaining -= length;
    }
  }

  function draw(elapsed = -1) {
    context.clearRect(0, 0, width, height);
    context.drawImage(board, 0, 0, width, height);
    if (elapsed < 0) return;
    context.save();
    context.translate(left, top);
    context.scale(scale, scale);
    context.shadowColor = '#8edbff';
    context.shadowBlur = 13 * density * scale;
    if (elapsed <= 740) {
      pulse(input, elapsed / 740);
    } else {
      pad(context, 240, 160, 7, '#b5ecff', '#e1faff');
      const progress = Math.min((elapsed - 740) / 950, 1);
      context.globalAlpha = elapsed < 1690 ? 1 : Math.max(0, (1980 - elapsed) / 290);
      pulse(upper, progress);
      pulse(lower, progress);
    }
    context.restore();
  }

  function resize() {
    ({ width, height } = canvas.getBoundingClientRect());
    if (width < 1 || height < 1) return;
    density = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = board.width = Math.round(width * density);
    canvas.height = board.height = Math.round(height * density);
    scale = Math.min(width / 510, (height - 56) / 345);
    left = (width - 492 * scale) / 2;
    top = (height - 320 * scale - 45) / 2;
    context.setTransform(density, 0, 0, density, 0, 0);
    ink.setTransform(density, 0, 0, density, 0, 0);
    paintBoard();
    draw();
  }

  function animate(now) {
    const elapsed = now - startedAt;
    draw(elapsed < 1980 ? elapsed : -1);
    frame = elapsed < 1980 ? requestAnimationFrame(animate) : 0;
  }

  button.addEventListener('click', () => {
    if (motion.matches) return;
    cancelAnimationFrame(frame);
    startedAt = performance.now();
    frame = requestAnimationFrame(animate);
  });
  motion.addEventListener('change', () => {
    button.hidden = motion.matches;
    cancelAnimationFrame(frame);
    draw();
  });
  new ResizeObserver(resize).observe(canvas);
  button.hidden = motion.matches;
  resize();
}
