import { clamp } from './collision.js';

export class MovementController {
  constructor({ input, speed = 300, mouseFollow = true, mouseSpeed = 900, bounds = true } = {}) {
    this.input = input;
    this.speed = speed;
    this.mouseFollow = mouseFollow;
    this.mouseSpeed = mouseSpeed;
    this.bounds = bounds;
  }
  move(body, dt, width, height) {
    const k = this.input?.vector?.() || { x: 0, y: 0 };
    if (k.x || k.y) {
      body.x += k.x * this.speed * dt;
      body.y += k.y * this.speed * dt;
    } else if (this.mouseFollow) {
      const m = this.input?.mousePosition?.();
      if (m) {
        const targetX = m.x - body.width / 2;
        const targetY = m.y - body.height / 2;
        const maxStep = this.mouseSpeed * dt;
        body.x += Math.max(-maxStep, Math.min(maxStep, targetX - body.x));
        body.y += Math.max(-maxStep, Math.min(maxStep, targetY - body.y));
      }
    }
    if (this.bounds) {
      body.x = clamp(body.x, 0, Math.max(0, width - body.width));
      body.y = clamp(body.y, 0, Math.max(0, height - body.height));
    }
    return body;
  }
  axisX(body, dt, min, max, speed = this.speed) {
    const x = (this.input?.right?.() ? 1 : 0) - (this.input?.left?.() ? 1 : 0);
    body.x = clamp(body.x + x * speed * dt, min, Math.max(min, max - body.width));
    return body;
  }
}
