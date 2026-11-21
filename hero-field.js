const base = document.querySelector('.hero-field-strands');
const overlay = document.querySelector('.hero-field-motion');
const ink = base?.getContext('2d');
const glow = overlay?.getContext('2d');

if (ink && glow) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const traces = [];
  let width = 0;
  let height = 0;
  let visible = false;
  let frame = 0;
  let lastPaint = 0;

  function follow(x, y, direction) {
    const points = [[x, y]];
    const scale = Math.max(280, Math.min(width, height));
    for (let i = 0; i < 165; i += 1) {
      const u = x / scale;
      const v = y / scale;
      const angle = -.28 + 1.5 * Math.sin(u * 4.1 - v * 2.9)
        + .82 * Math.cos(u * 2.3 + v * 5.7) + .45 * Math.sin(u * 10.2 + v * 3.8);
      x += direction * 4 * Math.cos(angle);
      y += direction * 4 * Math.sin(angle);
      if (x < -24 || x > width + 24 || y < -24 || y > height + 24) break;
      points.push([x, y]);
    }
    return points;
  }

  function drawTrace(context, points, start = 0, end = points.length - 1) {
    context.beginPath();
    context.moveTo(...points[start]);
    for (let i = start + 1; i <= end; i += 1) context.lineTo(...points[i]);
    context.stroke();
  }

  function resize() {
    ({ width, height } = base.getBoundingClientRect());
    if (width < 1 || height < 1) return;
    const density = Math.min(devicePixelRatio || 1, 1.6);
    base.width = overlay.width = Math.round(width * density);
    base.height = overlay.height = Math.round(height * density);
    ink.setTransform(density, 0, 0, density, 0, 0);
    glow.setTransform(density, 0, 0, density, 0, 0);

    traces.length = 0;
    let seed = 431;
    function random() {
      seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
      return seed / 4294967296;
    }

    ink.globalCompositeOperation = 'lighter';
    const bundles = Math.max(26, Math.min(70, Math.round(width / 14)));
    for (let bundle = 0; bundle < bundles; bundle += 1) {
      const x = random() * width;
      const y = random() * height;
      const bright = bundle % 7 === 0;
      for (let strand = 0; strand < 8; strand += 1) {
        const px = x + (random() - .5) * 38;
        const py = y + (random() - .5) * 38;
        const points = follow(px, py, -1).reverse().concat(follow(px, py, 1).slice(1));
        if (points.length < 8) continue;
        ink.strokeStyle = bright ? '#b9ee762b' : '#80b45412';
        ink.lineWidth = bright ? .86 : .65;
        drawTrace(ink, points);
        if (bright && strand === 0 && points.length > 45) {
          ink.strokeStyle = '#c6f98557';
          ink.lineWidth = 1.25;
          ink.shadowColor = '#beff61';
          ink.shadowBlur = 8;
          drawTrace(ink, points);
          ink.shadowBlur = 0;
          traces.push({ points, phase: random() });
        }
      }
    }
  }

  function animate(now) {
    if (now - lastPaint >= 33) {
      glow.clearRect(0, 0, width, height);
      glow.lineWidth = 1.5;
      glow.shadowColor = '#b7ff66';
      glow.shadowBlur = 10;
      for (const { points, phase } of traces) {
        const travel = (now / 11000 + phase) % 1;
        const start = Math.floor(travel * (points.length - 26));
        glow.strokeStyle = `rgb(207 255 144 / ${Math.sin(travel * Math.PI) * .38})`;
        drawTrace(glow, points, start, start + 24);
      }
      lastPaint = now;
    }
    frame = requestAnimationFrame(animate);
  }

  function updateAnimation() {
    const running = visible && !document.hidden && !motion.matches;
    if (running && !frame) frame = requestAnimationFrame(animate);
    if (!running && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      glow.clearRect(0, 0, width, height);
    }
  }

  new ResizeObserver(resize).observe(base);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateAnimation();
  }).observe(base);
  motion.addEventListener('change', updateAnimation);
  document.addEventListener('visibilitychange', updateAnimation);
}
