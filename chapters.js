const chapterLinks = [...document.querySelectorAll('.section-nav a[href^="#"]')];
const chapters = chapterLinks.flatMap((link) => {
  const section = document.getElementById(link.hash.slice(1));
  return section ? [{ link, section }] : [];
});
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const cursorLayer = document.querySelector('.cursor-effect-layer');
let scrollFrame = 0;
let activeChapter;
let lastArc;

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
  cursorLayer?.replaceChildren();
  lastArc = undefined;
  scheduleChapters();
});
scheduleChapters();

window.addEventListener('pointermove', (event) => {
  if (reducedMotion.matches || event.pointerType !== 'mouse' || !cursorLayer) return;
  const { clientX: x, clientY: y, timeStamp: time } = event;
  const dx = lastArc ? lastArc.x - x : -event.movementX;
  const dy = lastArc ? lastArc.y - y : -event.movementY;
  if (lastArc && (time - lastArc.time < 58 || Math.hypot(dx, dy) < 19)) return;

  lastArc = { x, y, time };
  const arc = document.createElement('span');
  arc.className = 'cursor-arc';
  arc.style.left = `${x}px`;
  arc.style.top = `${y}px`;
  arc.style.setProperty('--arc-angle', `${Math.atan2(dy, dx)}rad`);
  arc.style.setProperty('--arc-flip', Math.random() < .5 ? '-1' : '1');
  arc.addEventListener('animationend', () => arc.remove(), { once: true });
  cursorLayer.append(arc);
}, { passive: true });
