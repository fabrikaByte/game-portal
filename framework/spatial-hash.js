export class SpatialHash {
  constructor(cellSize=64){this.cellSize=Math.max(1,cellSize);this.cells=new Map();this.objectKeys=new Map()}
  _cell(v){return Math.floor(v/this.cellSize)}
  _keysFor(a){const x0=this._cell(a.x),x1=this._cell(a.x+a.w),y0=this._cell(a.y),y1=this._cell(a.y+a.h),keys=[];for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)keys.push(`${x},${y}`);return keys}
  clear(){this.cells.clear();this.objectKeys.clear()}
  insert(obj,aabb){this.remove(obj);const keys=this._keysFor(aabb);this.objectKeys.set(obj,keys);for(const k of keys){let set=this.cells.get(k);if(!set)this.cells.set(k,set=new Set());set.add(obj)}return obj}
  remove(obj){const keys=this.objectKeys.get(obj);if(!keys)return false;for(const k of keys){const set=this.cells.get(k);set?.delete(obj);if(set?.size===0)this.cells.delete(k)}this.objectKeys.delete(obj);return true}
  update(obj,aabb){return this.insert(obj,aabb)}
  query(aabb){const out=new Set();for(const k of this._keysFor(aabb)){for(const obj of this.cells.get(k)||[])out.add(obj)}return [...out]}
}
