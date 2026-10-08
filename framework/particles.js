export class Particles {
  constructor() { this.items = []; }
  burst(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, speed = 50 + Math.random() * 160;
      this.items.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: .45 + Math.random() * .5, max: 1 });
    }
  }
  update(dt) {
    for (const p of this.items) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 220 * dt; }
    this.items = this.items.filter(p => p.life > 0);
  }
  draw(ctx) {
    for (const p of this.items) { ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.fillRect(p.x - 2, p.y - 2, 4, 4); }
    ctx.globalAlpha = 1;
  }
}
