const chapterLinks = [...document.querySelectorAll('.section-nav a[href^="#"]')];
const chapters = chapterLinks.flatMap((link) => {
  const section = document.getElementById(link.hash.slice(1));
  return section ? [{ link, section }] : [];
});
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const rippleLayer = document.querySelector('.ripple-layer');
let scrollFrame = 0;
let activeChapter;
let lastRipple;

function updateChapters() {
  scrollFrame = 0;
  const viewportHeight = window.innerHeight;
  const readingLine = viewportHeight * .42;
  let current;

  for (const chapter of chapters) {
    const { section } = chapter;
    const { top, bottom, height } = section.getBoundingClientRect();
    if (top <= readingLine && bottom > readingLine) current = chapter;
    if (reducedMotion.matches || bottom < 0 || top > viewportHeight) continue;

    const progress = (viewportHeight - top) / (viewportHeight + height);
    section.style.setProperty('--scene-offset', `${(progress - .5) * 124}px`);
    section.style.setProperty('--scene-scale', (1 + progress * .18).toFixed(3));
  }

  if (current !== activeChapter) {
    activeChapter?.link.removeAttribute('aria-current');
    current?.link.setAttribute('aria-current', 'location');
    activeChapter = current;
  }
}

function scheduleChapters() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateChapters);
}

window.addEventListener('scroll', scheduleChapters, { passive: true });
window.addEventListener('resize', scheduleChapters);
reducedMotion.addEventListener('change', () => {
  rippleLayer?.replaceChildren();
  lastRipple = undefined;
  scheduleChapters();
});
scheduleChapters();

window.addEventListener('pointermove', (event) => {
  if (reducedMotion.matches || event.pointerType !== 'mouse' || !rippleLayer) return;
  const { clientX: x, clientY: y, timeStamp: time } = event;
  if (lastRipple && (time - lastRipple.time < 64 ||
      Math.hypot(x - lastRipple.x, y - lastRipple.y) < 22)) return;

  lastRipple = { x, y, time };
  const ripple = document.createElement('span');
  ripple.className = 'cursor-ripple';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  rippleLayer.append(ripple);
}, { passive: true });
