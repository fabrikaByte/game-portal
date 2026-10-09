export class ObjectPool {
  constructor({create,reset=null,maxSize=1000}={}){if(typeof create!=='function')throw new TypeError('ObjectPool.create is required');this.create=create;this.reset=reset;this.maxSize=Math.max(1,Math.floor(maxSize));this.free=[];this.active=new Set()}
  acquire(...args){const obj=this.free.pop()||this.create(...args);this.active.add(obj);return obj}
  release(obj){if(!this.active.has(obj))return false;this.active.delete(obj);if(this.reset)this.reset(obj);if(this.free.length<this.maxSize)this.free.push(obj);return true}
  releaseAll(){for(const obj of [...this.active])this.release(obj)}
  get activeCount(){return this.active.size} get freeCount(){return this.free.length}
  clear(){this.active.clear();this.free.length=0}
}
