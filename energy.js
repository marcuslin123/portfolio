export function getScrollCharge(scrollY, scrollHeight, viewportHeight) {
  const distance = scrollHeight - viewportHeight;
  if (distance <= 0) return 0;
  return Math.min(1, Math.max(0, scrollY / distance));
}
