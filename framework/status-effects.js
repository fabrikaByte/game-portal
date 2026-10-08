export class StatusEffects {
  constructor(){this.map=new Map();}
  add(target,id,duration,stacks=1){if(!target||!id)return;const key=target.id||target;let list=this.map.get(key)||[];const old=list.find(e=>e.id===id);if(old){old.time=Math.max(old.time,duration);old.stacks+=stacks;}else list.push({id,time:Math.max(0,duration),stacks});this.map.set(key,list);}
  has(target,id){const list=this.map.get(target.id||target)||[];return list.some(e=>e.id===id&&e.time>0);}
  update(dt,onExpire){for(const [key,list] of this.map){for(let i=list.length-1;i>=0;i--){list[i].time-=dt;if(list[i].time<=0){onExpire?.(key,list[i]);list.splice(i,1);}}if(!list.length)this.map.delete(key);}}
  clear(){this.map.clear();}
}
