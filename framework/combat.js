export class CombatSystem {
  constructor({ hitCooldown = 0.18 } = {}) { this.hitCooldown = hitCooldown; this.cooldowns = new WeakMap(); }
  canHit(target, now = performance.now()/1000) { const until = this.cooldowns.get(target) || 0; return now >= until; }
  hit(target, damage = 1, now = performance.now()/1000) {
    if (!target || target.dead || !this.canHit(target, now)) return {hit:false, damage:0, killed:false};
    const amount = Math.max(0, Number(damage) || 0); target.hp = Math.max(0, Number(target.hp ?? target.maxHp ?? amount) - amount);
    this.cooldowns.set(target, now + this.hitCooldown);
    const killed = target.hp <= 0; if (killed) target.dead = true;
    return {hit:true, damage:amount, killed};
  }
  reset(){ this.cooldowns = new WeakMap(); }
}
export class Hitbox { constructor(x=0,y=0,w=0,h=0){Object.assign(this,{x,y,w,h});} }
export function intersects(a,b){return !!a&&!!b&&a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
export function distance(a,b){return Math.hypot((a.x+a.w/2)-(b.x+b.w/2),(a.y+a.h/2)-(b.y+b.h/2));}
