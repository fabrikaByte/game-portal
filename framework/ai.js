export const AI_STATES=Object.freeze({IDLE:'idle',PATROL:'patrol',CHASE:'chase',ATTACK:'attack',FLEE:'flee',STUN:'stun',DEAD:'dead'});

const finite=n=>Number.isFinite(n)?n:0;
const dist=(a,b)=>Math.hypot((b.x-a.x),(b.y-a.y));

export class AIController{
  constructor({x=0,y=0,speed=120,acceleration=900,turnRate=8,target=null,world=null,rng=Math.random}={}){
    this.position={x,y}; this.velocity={x:0,y:0}; this.speed=Math.max(0,speed); this.acceleration=Math.max(0,acceleration); this.turnRate=Math.max(0,turnRate);
    this.state=AI_STATES.IDLE; this.target=target; this.world=world; this.rng=rng; this.stateTime=0; this.attackCooldown=0; this.blackboard=new Map(); this.waypoints=[]; this.waypointIndex=0;
  }
  setState(state){if(!Object.values(AI_STATES).includes(state))throw new Error(`Unknown AI state: ${state}`); if(this.state!==state){this.state=state;this.stateTime=0}}
  setTarget(target){this.target=target||null}
  setWaypoints(points=[]){this.waypoints=Array.isArray(points)?points.map(p=>({x:finite(p.x),y:finite(p.y)})):[];this.waypointIndex=0}
  _desired(){
    if(this.state===AI_STATES.CHASE||this.state===AI_STATES.ATTACK){
      if(!this.target)return {x:0,y:0};
      return normalize({x:this.target.x-this.position.x,y:this.target.y-this.position.y});
    }
    if(this.state===AI_STATES.FLEE){
      if(!this.target)return {x:0,y:0};
      return normalize({x:this.position.x-this.target.x,y:this.position.y-this.target.y});
    }
    if(this.state===AI_STATES.PATROL&&this.waypoints.length){
      const w=this.waypoints[this.waypointIndex%this.waypoints.length];
      const d=Math.hypot(w.x-this.position.x,w.y-this.position.y);
      if(d<12)this.waypointIndex=(this.waypointIndex+1)%this.waypoints.length;
      const n=this.waypoints[this.waypointIndex%this.waypoints.length];
      return normalize({x:n.x-this.position.x,y:n.y-this.position.y});
    }
    return {x:0,y:0};
  }
  update(dt){
    dt=Math.max(0,Math.min(0.05,Number(dt)||0)); if(this.state===AI_STATES.DEAD)return;
    this.stateTime+=dt; this.attackCooldown=Math.max(0,this.attackCooldown-dt);
    const desired=this._desired(); const want={x:desired.x*this.speed,y:desired.y*this.speed};
    const maxDelta=this.acceleration*dt; const dx=want.x-this.velocity.x,dy=want.y-this.velocity.y; const m=Math.hypot(dx,dy);
    if(m>maxDelta&&m>0){this.velocity.x+=dx/m*maxDelta;this.velocity.y+=dy/m*maxDelta}else{this.velocity.x=want.x;this.velocity.y=want.y}
    if(this.turnRate>0){this.velocity.x += (want.x-this.velocity.x)*Math.min(1,this.turnRate*dt);this.velocity.y += (want.y-this.velocity.y)*Math.min(1,this.turnRate*dt)}
    this.position.x+=this.velocity.x*dt;this.position.y+=this.velocity.y*dt;
    this.world?.constrain?.(this.position,this.velocity,this);
  }
  canAttack(){return this.attackCooldown<=0&&this.state===AI_STATES.ATTACK}
  triggerAttack(cooldown=1){this.attackCooldown=Math.max(0,Number(cooldown)||0);return true}
}
export function normalize(v){const m=Math.hypot(finite(v.x),finite(v.y));return m?{x:v.x/m,y:v.y/m}:{x:0,y:0}}
export function distance(a,b){return dist(a,b)}
export function chooseWeighted(options,rng=Math.random){const list=(options||[]).filter(o=>Number(o.weight)>0);const total=list.reduce((s,o)=>s+Number(o.weight),0);if(!list.length)return null;let r=rng()*total;for(const o of list){r-=Number(o.weight);if(r<=0)return o.value}return list[list.length-1].value}
