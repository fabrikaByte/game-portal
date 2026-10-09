export class EventBus {
  constructor(){this.listeners=new Map();}
  on(type,fn){if(typeof fn!=='function')throw new TypeError('EventBus.on requires a function');let set=this.listeners.get(type);if(!set){set=new Set();this.listeners.set(type,set)}set.add(fn);return()=>this.off(type,fn)}
  once(type,fn){const off=this.on(type,(...args)=>{off();fn(...args)});return off}
  off(type,fn){const set=this.listeners.get(type);if(!set)return false;const removed=set.delete(fn);if(!set.size)this.listeners.delete(type);return removed}
  emit(type,payload){const set=this.listeners.get(type);if(!set)return 0;for(const fn of [...set])fn(payload);return set.size}
  clear(type){if(type===undefined){this.listeners.clear();return}this.listeners.delete(type)}
  listenerCount(type){return type===undefined?[...this.listeners.values()].reduce((n,s)=>n+s.size,0):(this.listeners.get(type)?.size||0)}
}
