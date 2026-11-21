const canvas = document.querySelector('.energy-scene');
const button = document.querySelector('.scene-control');
const context = canvas?.getContext('2d');

if (context && button) {
  const stateLabel = button.querySelector('.scene-control-state');
  const fullTurn = Math.PI * 2;
  const steps = 480;
  const strands = 24;
  let width = 0;
  let height = 0;
  let density = 1;
  let lit = false;

  function point(progress, strand, scale) {
    const t = progress * fullTurn;
    const twist = strand + 7 * t;
    const radius = .64 + .24 * Math.cos(3 * t) + .078 * Math.cos(twist);
    const x = radius * Math.cos(2 * t);
    const y = radius * Math.sin(2 * t);
    const z = .24 * Math.sin(3 * t) + .078 * Math.sin(twist);
    const tilt = .73 * y + .68 * z;
    const depth = .73 * z - .68 * y;
    const perspective = 1 / (1.14 - depth * .29);
    return [
      width / 2 + (x * .93 - tilt * .37) * scale * perspective,
      height * .48 + (x * .37 + tilt * .93) * scale * perspective,
      depth,
    ];
  }

  function paintArtwork() {
    context.clearRect(0, 0, width, height);
    const scale = Math.min(width * .54, height * .56);
    for (let i = 0; i < 96; i += 1) {
      const x = ((i * 173.731) % 100) * width / 100;
      const y = ((i * 313.293) % 100) * height / 100;
      context.fillStyle = i % 8 ? '#b4a2ff58' : '#e5d8ffba';
      context.fillRect(x, y, i % 8 ? 1 : 2, 1);
    }

    const gradient = context.createLinearGradient(width * .13, height * .69, width * .92, height * .22);
    gradient.addColorStop(0, lit ? '#a1b4ffda' : '#7688ff57');
    gradient.addColorStop(.43, lit ? '#eddbffef' : '#c3a2ff95');
    gradient.addColorStop(.7, lit ? '#bc88ffe8' : '#a35dff87');
    gradient.addColorStop(1, lit ? '#ffddfff2' : '#f8c6ff9c');
    context.strokeStyle = gradient;
    context.shadowColor = '#ad68ff';
    for (let strand = 0; strand < strands; strand += 1) {
      const offset = strand * fullTurn / strands;
      context.beginPath();
      for (let i = 0; i <= steps; i += 1) {
        const [x, y] = point(i / steps, offset, scale);
        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      const accent = strand % 6 === 0;
      context.shadowBlur = lit && accent ? 16 * density : 0;
      context.lineWidth = accent ? 1.4 : .75;
      context.stroke();
    }

    for (let i = 0; i < 90; i += 1) {
      const progress = ((i * .618034) % 1);
      const [x, y, depth] = point(progress, i * 2.4, scale);
      context.beginPath();
      context.arc(x, y, Math.max(.55, 1 + depth), 0, fullTurn);
      context.fillStyle = lit ? '#fff0ff' : '#dec9ffab';
      context.shadowColor = '#ba7dff';
      context.shadowBlur = lit ? 8 * density : 4;
      context.fill();
    }
    context.shadowBlur = 0;
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    if (!width || !height) return;
    density = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    context.setTransform(density, 0, 0, density, 0, 0);
    paintArtwork();
  }

  button.addEventListener('click', () => {
    lit = !lit;
    button.setAttribute('aria-pressed', String(lit));
    stateLabel.textContent = lit ? 'On' : 'Off';
    paintArtwork();
  });
  new ResizeObserver(resize).observe(canvas);
  button.hidden = false;
  resize();
}
