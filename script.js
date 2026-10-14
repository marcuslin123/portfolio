import { getActivationEffect } from './interaction.js';

const sparkLayer = document.querySelector('.spark-layer');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function emitSpark(x, y, count = 13) {
  if (reducedMotion.matches || !sparkLayer) return;
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.45;
    const distance = 15 + Math.random() * 23;
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

document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target.closest('.spark-target') : null;
  if (!target || reducedMotion.matches) return;
  const effect = getActivationEffect(target, event, target.getBoundingClientRect());
  if (!effect) return;
  emitSpark(effect.x, effect.y);
  emitPulse(effect.x, effect.y);
  target.classList.remove('is-clicked');
  void target.offsetWidth;
  target.classList.add('is-clicked');
  target.addEventListener('animationend', () => target.classList.remove('is-clicked'), { once: true });
});

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());
