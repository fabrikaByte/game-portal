export class ObjectPool{
  constructor(factory,reset=()=>{},initial=0){this.factory=factory;this.reset=reset;this.free=[];this.active=new Set();for(let i=0;i<initial;i++)this.free.push(factory())}
  acquire(data){const o=this.free.pop()||this.factory();this.reset(o,data);o.dead=false;this.active.add(o);return o}
  release(o){if(!this.active.has(o))return;o.dead=true;this.active.delete(o);this.free.push(o)}
  releaseAll(){for(const o of this.active)o.dead=true;this.free.push(...this.active);this.active.clear()}
  forEach(fn){for(const o of this.active)fn(o)}
  get size(){return this.active.size}
}