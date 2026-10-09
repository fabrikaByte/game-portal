export class BossController{
  constructor({maxHealth=1000,phases=[],enrageAt=0.2}={}){this.maxHealth=Math.max(1,maxHealth);this.health=this.maxHealth;this.phases=(phases||[]).map((p,i)=>({id:p.id??i+1,threshold:Number(p.threshold??(1-i/(phases.length||1))),duration:p.duration??0,onEnter:p.onEnter,onUpdate:p.onUpdate})).sort((a,b)=>b.threshold-a.threshold);this.phaseIndex=-1;this.enrageAt=Math.max(0,Math.min(1,enrageAt));this.enraged=false;this.dead=false;this.time=0;this.onPhase=null;this.onDeath=null}
  ratio(){return this.health/this.maxHealth}
  takeDamage(amount){if(this.dead)return 0;const n=Math.max(0,Number(amount)||0);const before=this.health;this.health=Math.max(0,this.health-n);if(this.health<=0){this.dead=true;this.onDeath?.(this);return before}return before-this.health}
  update(dt){if(this.dead)return;this.time+=Math.max(0,Number(dt)||0);const r=this.ratio();let idx=-1;for(let i=0;i<this.phases.length;i++)if(r<=this.phases[i].threshold)idx=i;if(idx!==this.phaseIndex){this.phaseIndex=idx;const p=this.phases[idx];p?.onEnter?.(this);this.onPhase?.(p,this)}if(!this.enraged&&r<=this.enrageAt){this.enraged=true}const p=this.phases[this.phaseIndex];p?.onUpdate?.(dt,this)}
  reset(){this.health=this.maxHealth;this.phaseIndex=-1;this.enraged=false;this.dead=false;this.time=0}
  get phase(){return this.phases[this.phaseIndex]||null}
}
