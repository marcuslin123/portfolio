export function getActivationEffect(target, event, bounds) {
  if (target?.tagName !== 'A' && target?.tagName !== 'BUTTON') return null;
  if (event.detail > 0) return { x: event.clientX, y: event.clientY };
  return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
}
