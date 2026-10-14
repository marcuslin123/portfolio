const sparkLayer = document.querySelector('.spark-layer');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');

function emitSpark(x, y) {
  if (reducedMotion.matches || !sparkLayer) return;
  for (let i = 0; i < 4; i += 1) {
    const angle = (Math.PI * 2 * i) / 4 + Math.random() * 0.45;
    const distance = 11 + Math.random() * 17;
    const particle = document.createElement('span');
    particle.className = 'spark-particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
    particle.style.setProperty('--angle', `${angle * (180 / Math.PI)}deg`);
    sparkLayer.append(particle);
    particle.addEventListener('animationend', () => particle.remove(), { once: true });
  }
}

document.querySelectorAll('.spark-target').forEach((element) => {
  element.addEventListener('pointerenter', (event) => {
    if (!finePointer.matches) return;
    const bounds = element.getBoundingClientRect();
    emitSpark(Math.min(Math.max(event.clientX, bounds.left), bounds.right), Math.min(Math.max(event.clientY, bounds.top), bounds.bottom));
  });
  element.addEventListener('focus', () => {
    const bounds = element.getBoundingClientRect();
    emitSpark(bounds.left + Math.min(bounds.width - 8, 18), bounds.top + 8);
  });
});

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());
