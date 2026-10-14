import { makeBoltPoints, shouldFlash } from './energy.js';

const sparkLayer = document.querySelector('.spark-layer');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');
const electricField = document.querySelector('.electric-field');
let lastFlashY = window.scrollY;
let lastFlashTime = -Infinity;
let flashSequence = 0;

function emitSpark(x, y, count = 4) {
  if (reducedMotion.matches || !sparkLayer) return;
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.45;
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

function emitPulse(x, y) {
  if (reducedMotion.matches || !sparkLayer) return;
  const pulse = document.createElement('span');
  pulse.className = 'click-pulse';
  pulse.style.left = `${x}px`;
  pulse.style.top = `${y}px`;
  sparkLayer.append(pulse);
  pulse.addEventListener('animationend', () => pulse.remove(), { once: true });
}

function flashAcrossScreen() {
  if (reducedMotion.matches || !electricField) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const points = makeBoltPoints(width, height, flashSequence++);
  const pathData = points.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const branchStart = points[6];
  const branchData = `M${branchStart[0].toFixed(1)} ${branchStart[1].toFixed(1)} L${(branchStart[0] + width * 0.07).toFixed(1)} ${Math.min(height, branchStart[1] + height * 0.13).toFixed(1)} L${(branchStart[0] + width * 0.17).toFixed(1)} ${Math.min(height, branchStart[1] + height * 0.08).toFixed(1)}`;
  const burst = document.createElement('div');
  burst.className = 'electric-burst';
  burst.style.setProperty('--flash-y', `${Math.round((points[6][1] / height) * 100)}%`);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  for (const [className, data] of [['bolt-glow', pathData], ['bolt-blue', pathData], ['bolt-core', pathData], ['bolt-branch', branchData]]) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', className);
    path.setAttribute('d', data);
    svg.append(path);
  }
  burst.append(svg);
  electricField.replaceChildren(burst);
  svg.addEventListener('animationend', (event) => {
    if (event.target === svg) burst.remove();
  }, { once: true });
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

document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target.closest('.spark-target') : null;
  if (!target) return;
  const bounds = target.getBoundingClientRect();
  const x = event.detail ? event.clientX : bounds.left + bounds.width / 2;
  const y = event.detail ? event.clientY : bounds.top + bounds.height / 2;
  emitSpark(x, y, 13);
  emitPulse(x, y);
});

window.addEventListener('scroll', () => {
  if (reducedMotion.matches) return;
  const now = performance.now();
  if (!shouldFlash(lastFlashY, window.scrollY, lastFlashTime, now)) return;
  lastFlashY = window.scrollY;
  lastFlashTime = now;
  flashAcrossScreen();
}, { passive: true });
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) electricField?.replaceChildren();
});

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-energized');
      const kicker = entry.target.querySelector('.section-kicker');
      if (kicker) {
        const bounds = kicker.getBoundingClientRect();
        emitSpark(bounds.left + 7, bounds.top + bounds.height / 2, 11);
      }
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -28% 0px', threshold: 0 });
  document.querySelectorAll('.content-section').forEach((section) => observer.observe(section));
}

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());
