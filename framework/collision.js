export function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
export function circleHit(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  const r = a.radius + b.radius;
  return dx * dx + dy * dy <= r * r;
}
export function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
