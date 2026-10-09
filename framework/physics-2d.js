import { clamp } from './core.js';

const rectOf = r => {
  const left = r.left ?? r.x ?? 0;
  const top = r.top ?? r.y ?? 0;
  const right = r.right ?? (left + (r.w ?? 0));
  const bottom = r.bottom ?? (top + (r.h ?? 0));
  return { left, top, right, bottom, w: r.w ?? (right - left), h: r.h ?? (bottom - top) };
};
const overlaps = (a, b) => a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom;
const horizontalOverlap = (a, b) => a.right > b.left && a.left < b.right;
const verticalOverlap = (a, b) => a.bottom > b.top && a.top < b.bottom;
const EPS = 1e-8;

export class Body2D {
  constructor({ x = 0, y = 0, w = 32, h = 32, vx = 0, vy = 0, mass = 1, gravity = 1200, drag = 0, restitution = 0, friction = 0.8, staticBody = false } = {}) {
    this.x = x; this.y = y; this.w = w; this.h = h; this.vx = vx; this.vy = vy;
    this.mass = Math.max(0.0001, mass); this.gravity = gravity; this.drag = Math.max(0, drag);
    this.restitution = clamp(restitution, 0, 1); this.friction = clamp(friction, 0, 1);
    this.staticBody = !!staticBody; this.onGround = false;
  }
  get left() { return this.x; }
  get right() { return this.x + this.w; }
  get top() { return this.y; }
  get bottom() { return this.y + this.h; }
  integrate(dt) {
    if (this.staticBody) return;
    const d = Math.max(0, Math.min(0.05, Number(dt) || 0));
    this.vy += this.gravity * d;
    const drag = Math.max(0, 1 - this.drag * d);
    this.vx *= drag; this.vy *= drag;
    this.x += this.vx * d; this.y += this.vy * d;
  }
}

export function aabbOverlap(a, b) { return overlaps(rectOf(a), rectOf(b)); }

export function resolveAABB(body, collider) {
  if (body.staticBody) return null;
  const b = rectOf(body), c = rectOf(collider);
  if (!overlaps(b, c)) return null;
  const pushLeft = c.right - b.left, pushRight = b.right - c.left;
  const pushUp = c.bottom - b.top, pushDown = b.bottom - c.top;
  const minX = Math.min(pushLeft, pushRight), minY = Math.min(pushUp, pushDown);
  if (minX < minY) {
    if (pushLeft < pushRight) { body.x = c.right; body.vx = Math.max(0, body.vx) * body.restitution; }
    else { body.x = c.left - body.w; body.vx = Math.min(0, body.vx) * body.restitution; }
    body.vy *= 1 - body.friction * 0.15;
    return { axis: 'x', normal: pushLeft < pushRight ? 1 : -1 };
  }
  if (pushUp < pushDown) { body.y = c.bottom; body.vy = Math.max(0, body.vy) * body.restitution; body.onGround = false; }
  else { body.y = c.top - body.h; body.vy = Math.min(0, body.vy) * body.restitution; body.onGround = true; body.vx *= Math.max(0, 1 - body.friction * 0.08); }
  return { axis: 'y', normal: pushUp < pushDown ? 1 : -1 };
}

/* Continuous axis sweeps prevent fast arcade bodies from crossing thin colliders
   even when a safe number of fixed substeps would be insufficient. */
export function moveAndCollide(body, colliders, dt) {
  body.onGround = false;
  const safeDt = Math.max(0, Math.min(0.05, Number(dt) || 0));
  if (body.staticBody || safeDt === 0) return 0;
  const list = (colliders || []).filter(Boolean).map(rectOf).filter(r => r.w > 0 && r.h > 0);

  body.vy += body.gravity * safeDt;
  const dragFactor = Math.max(0, 1 - body.drag * safeDt);
  body.vx *= dragFactor; body.vy *= dragFactor;

  let contacts = 0;
  for (const collider of list) if (resolveAABB(body, collider)) contacts++;

  const dx = body.vx * safeDt;
  if (dx > 0) {
    let allowed = dx;
    for (const c of list) {
      if (!verticalOverlap(body, c)) continue;
      const gap = c.left - body.right;
      if (gap >= -EPS && gap <= allowed) allowed = Math.max(0, gap);
    }
    if (allowed < dx - EPS || list.some(c => verticalOverlap(body, c) && Math.abs(c.left - body.right) <= EPS)) {
      body.x += allowed; body.vx = -Math.max(0, body.vx) * body.restitution; contacts++;
    } else body.x += dx;
  } else if (dx < 0) {
    const distance = -dx; let allowed = distance;
    for (const c of list) {
      if (!verticalOverlap(body, c)) continue;
      const gap = body.left - c.right;
      if (gap >= -EPS && gap <= allowed) allowed = Math.max(0, gap);
    }
    if (allowed < distance - EPS || list.some(c => verticalOverlap(body, c) && Math.abs(body.left - c.right) <= EPS)) {
      body.x -= allowed; body.vx = Math.max(0, -body.vx) * body.restitution; contacts++;
    } else body.x += dx;
  }

  const dy = body.vy * safeDt;
  if (dy > 0) {
    let allowed = dy;
    for (const c of list) {
      if (!horizontalOverlap(body, c)) continue;
      const gap = c.top - body.bottom;
      if (gap >= -EPS && gap <= allowed) allowed = Math.max(0, gap);
    }
    if (allowed < dy - EPS || list.some(c => horizontalOverlap(body, c) && Math.abs(c.top - body.bottom) <= EPS)) {
      body.y += allowed; body.vy = -Math.max(0, body.vy) * body.restitution; body.onGround = body.restitution <= 0.1; contacts++;
    } else body.y += dy;
  } else if (dy < 0) {
    const distance = -dy; let allowed = distance;
    for (const c of list) {
      if (!horizontalOverlap(body, c)) continue;
      const gap = body.top - c.bottom;
      if (gap >= -EPS && gap <= allowed) allowed = Math.max(0, gap);
    }
    if (allowed < distance - EPS || list.some(c => horizontalOverlap(body, c) && Math.abs(body.top - c.bottom) <= EPS)) {
      body.y -= allowed; body.vy = Math.max(0, -body.vy) * body.restitution; contacts++;
    } else body.y += dy;
  }
  // A body with zero gravity/velocity can remain resting exactly on a surface;
  // keep its grounded flag stable even when there is no vertical displacement.
  if (Math.abs(body.vy) <= EPS) {
    body.onGround = list.some(c => horizontalOverlap(body, c) && Math.abs(body.bottom - c.top) <= EPS);
  }
  return contacts;
}
