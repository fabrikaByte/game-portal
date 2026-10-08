export class AnimationEvents {
  constructor(){this.listeners=new Map();}
  on(name,fn){if(typeof fn!=='function')return()=>{};const set=this.listeners.get(name)||new Set();set.add(fn);this.listeners.set(name,set);return()=>set.delete(fn);}
  emit(name,payload){for(const fn of this.listeners.get(name)||[])fn(payload);}
  clear(){this.listeners.clear();}
}
