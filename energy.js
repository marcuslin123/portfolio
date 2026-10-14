export function shouldFlash(lastScrollY, scrollY, lastTime, now) {
  return Math.abs(scrollY - lastScrollY) >= 280 && now - lastTime >= 650;
}

export function makeBoltPoints(width, height, seed = 0) {
  const w = Math.max(1, width);
  const h = Math.max(1, height);
  const baseY = h * (0.28 + (Math.abs(seed) % 3) * 0.19);
  return Array.from({ length: 13 }, (_, index) => {
    const x = -w * 0.04 + (w * 1.08 * index) / 12;
    const offset = Math.sin((index + 1) * 2.4 + seed * 1.7) * h * 0.065;
    const jag = (index % 2 ? 1 : -1) * h * 0.025;
    const y = Math.min(h, Math.max(0, baseY + offset + jag));
    return [x, y];
  });
}
