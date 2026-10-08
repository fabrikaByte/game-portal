export class DebugTools {
  constructor(){this.enabled=false;this.flags=new Set();}
  toggle(flag){this.flags.has(flag)?this.flags.delete(flag):this.flags.add(flag);this.enabled=this.flags.size>0;}
  has(flag){return this.flags.has(flag);}
  draw(g,engine,entities=[]){if(!this.enabled)return;g.save();g.font='12px monospace';g.fillStyle='#e2e8f0';g.fillText(`FPS:${Math.round(1/Math.max(.001,engine._debugDt||.016))} ENT:${entities.length}`,12,18);if(this.has('hitboxes')){g.strokeStyle='#fb7185';for(const e of entities)if(e?.w&&e?.h)g.strokeRect(e.x,e.y,e.w,e.h);}g.restore();}
}
