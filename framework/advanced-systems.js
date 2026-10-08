export class AIController{
  constructor(o={}){this.state=o.state||'idle';this.detection=o.detection||220;this.attackRange=o.attackRange||48;this.speed=o.speed||90;this.cooldown=0;this.lastSeen=null}
  update(a,player,dt){const dx=player.x-a.x,dy=player.y-a.y,d=Math.hypot(dx,dy);this.cooldown=Math.max(0,this.cooldown-dt);if(a.dead){this.state='dead';return}if(d<this.detection){this.lastSeen={x:player.x,y:player.y};this.state=d<this.attackRange?'attack':'chase'}else if(this.lastSeen){const ld=Math.hypot(this.lastSeen.x-a.x,this.lastSeen.y-a.y);this.state=ld>8?'search':'patrol'}else this.state='patrol';if(this.state==='chase'){const n=Math.max(d,1);a.x+=dx/n*this.speed*dt;a.y+=dy/n*this.speed*dt}if(this.state==='search'&&this.lastSeen){const n=Math.max(Math.hypot(this.lastSeen.x-a.x,this.lastSeen.y-a.y),1);a.x+=(this.lastSeen.x-a.x)/n*this.speed*.55*dt;a.y+=(this.lastSeen.y-a.y)/n*this.speed*.55*dt}}
}
export class TileMap{
 constructor(rows,tile=40){this.rows=rows;this.tile=tile;this.h=rows.length;this.w=Math.max(...rows.map(r=>r.length))}
 cellAt(cx,cy){return cy>=0&&cy<this.h&&cx>=0&&cx<this.w?(this.rows[cy]?.[cx]||'.'):'.'}
 solidAt(px,py){const x=Math.floor(px/this.tile),y=Math.floor(py/this.tile);return this.cellAt(x,y)==='#'}
 solidRect(rect){if(!rect)return false;const x0=Math.floor(rect.x/this.tile),x1=Math.floor((rect.x+rect.w-0.001)/this.tile),y0=Math.floor(rect.y/this.tile),y1=Math.floor((rect.y+rect.h-0.001)/this.tile);for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(this.cellAt(x,y)==='#')return true;return false}
 resolveAxis(rect,dx,dy){if(!rect)return {x:dx,y:dy,collided:false};let moved={x:dx,y:dy,collided:false};if(dx){const test={...rect,x:rect.x+dx};if(this.solidRect(test)){moved.x=0;moved.collided=true}}if(dy){const test={...rect,y:rect.y+dy};if(this.solidRect(test)){moved.y=0;moved.collided=true}}return moved}
 draw(g,colors={}){const t=this.tile;for(let y=0;y<this.h;y++)for(let x=0;x<this.rows[y].length;x++){const v=this.rows[y][x];if(v==='.')continue;g.fillStyle=colors[v]||'#334155';g.fillRect(x*t,y*t,t,t);if(v==='#'){g.fillStyle='rgba(255,255,255,.08)';g.fillRect(x*t,y*t,t,4)}}}
}

export class SpriteAnimator{
 constructor({image,frames=4,fps=8}){this.image=image;this.frames=frames;this.fps=fps;this.t=0;this.frame=0}
 update(dt){this.t+=dt;this.frame=Math.floor(this.t*this.fps)%this.frames}
 draw(g,x,y,w,h){if(this.image?.complete&&this.image.naturalWidth){const fw=this.image.naturalWidth/this.frames;g.drawImage(this.image,this.frame*fw,0,fw,this.image.naturalHeight,x,y,w,h)}else{g.fillStyle='#38bdf8';g.fillRect(x,y,w,h)}}
}
export class DialogueSystem{
 constructor(lines=[]){this.lines=lines;this.index=0;this.active=false}
 start(lines=this.lines){this.lines=lines;this.index=0;this.active=true}
 next(){if(!this.active)return false;this.index++;if(this.index>=this.lines.length)this.active=false;return this.active}
 current(){return this.lines[this.index]||null}
}
export class InventorySystem{
 constructor(){this.items=new Map()}
 add(id,n=1){this.items.set(id,(this.items.get(id)||0)+n)}
 remove(id,n=1){const v=(this.items.get(id)||0)-n;if(v<=0)this.items.delete(id);else this.items.set(id,v);return v>0||!this.items.has(id)}
 has(id,n=1){return (this.items.get(id)||0)>=n}
 list(){return [...this.items.entries()]}
}
export class QuestSystem{
 constructor(){this.quests=new Map()}
 add(q){this.quests.set(q.id,{...q,current:q.current||0,done:false})}
 progress(id,n=1){const q=this.quests.get(id);if(!q||q.done)return;if(q.type==='collect'||q.type==='defeat')q.current=Math.min(q.target,q.current+n);if(q.current>=q.target){q.done=true;return true}return false}
 get(id){return this.quests.get(id)}
}
export class BossController{
 constructor({maxHp=1000,phases=[.7,.35]}={}){this.maxHp=maxHp;this.hp=maxHp;this.phases=phases;this.phase=1;this.cooldown=0;this.dead=false}
 damage(n){if(this.dead)return false;this.hp=Math.max(0,this.hp-n);const ratio=this.hp/this.maxHp;this.phase=ratio<=this.phases[1]?3:ratio<=this.phases[0]?2:1;if(this.hp===0)this.dead=true;return true}
 update(dt){this.cooldown=Math.max(0,this.cooldown-dt)}
}
export class VehiclePhysics{
 constructor(o={}){this.speed=0;this.max=o.max||360;this.accel=o.accel||240;this.brake=o.brake||420;this.friction=o.friction||130;this.grip=o.grip||5;this.drift=0}
 update(v,input,dt){const throttle=input.throttle||0,steer=input.steer||0;if(throttle>0)this.speed=Math.min(this.max,this.speed+this.accel*throttle*dt);else if(throttle<0)this.speed=Math.max(-this.max*.35,this.speed+this.brake*throttle*dt);else{const f=this.friction*dt;this.speed=Math.abs(this.speed)<=f?0:this.speed-Math.sign(this.speed)*f}this.drift=Math.max(0,Math.min(1,this.drift+Math.abs(steer)*.9*dt-(Math.abs(throttle)*.7+this.grip*.02)*dt));v.x+=Math.sin(v.angle)*this.speed*dt;v.y-=Math.cos(v.angle)*this.speed*dt;v.angle+=steer*(0.9+Math.min(1,Math.abs(this.speed)/this.max))*dt;}
}
