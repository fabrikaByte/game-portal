export class TimerManager {
  constructor(){this.items=new Map();this.nextId=1}
  after(delay,fn){return this._add(delay,0,fn)}
  every(interval,fn){const d=Math.max(0.001,Number(interval)||0.001);return this._add(d,d,fn)}
  _add(delay,repeat,fn){if(typeof fn!=='function')throw new TypeError('Timer callback must be a function');const id=this.nextId++;this.items.set(id,{id,remaining:Math.max(0,Number(delay)||0),repeat,fn});return id}
  cancel(id){return this.items.delete(id)}
  update(dt,context){const delta=Math.max(0,Number(dt)||0);for(const item of [...this.items.values()]){item.remaining-=delta;if(item.remaining>0)continue;item.fn(context,item);if(!this.items.has(item.id))continue;if(item.repeat>0){item.remaining+=item.repeat;while(item.remaining<=0)item.remaining+=item.repeat}else this.items.delete(item.id)}}
  clear(){this.items.clear()}
  get size(){return this.items.size}
}
