import { getScrollCharge } from './energy.js';

const sparkLayer = document.querySelector('.spark-layer');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');
const energyFill = document.querySelector('.energy-rail-fill');
const energyHead = document.querySelector('.energy-rail-head');
const energyRail = document.querySelector('.energy-rail');
let scrollFrame = 0;
let flowTimer = 0;

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
  if (element.matches('a')) {
    element.addEventListener('click', () => {
      const bounds = element.getBoundingClientRect();
      emitSpark(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, 9);
    });
  }
});

function updateScrollCharge() {
  scrollFrame = 0;
  if (reducedMotion.matches || !energyFill || !energyHead) return;
  const charge = getScrollCharge(window.scrollY, document.documentElement.scrollHeight, window.innerHeight);
  const position = `${(charge * 100).toFixed(2)}%`;
  energyFill.style.height = position;
  energyHead.style.top = position;
}

window.addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollCharge);
  if (energyRail && !reducedMotion.matches) {
    energyRail.classList.add('is-flowing');
    window.clearTimeout(flowTimer);
    flowTimer = window.setTimeout(() => energyRail.classList.remove('is-flowing'), 180);
  }
}, { passive: true });
window.addEventListener('resize', updateScrollCharge);
updateScrollCharge();

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-energized');
      const kicker = entry.target.querySelector('.section-kicker');
      if (kicker) {
        const bounds = kicker.getBoundingClientRect();
        emitSpark(bounds.left + 7, bounds.top + bounds.height / 2, 8);
      }
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -28% 0px', threshold: 0 });
  document.querySelectorAll('.content-section').forEach((section) => observer.observe(section));
}

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());
