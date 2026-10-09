export class EntityManager {
  constructor(){this.entities=new Set();this.pendingAdd=[];this.pendingRemove=new Set();this._updating=false}
  add(entity){if(!entity || typeof entity!=='object')throw new TypeError('EntityManager.add requires an object');if(this._updating)this.pendingAdd.push(entity);else this.entities.add(entity);entity.onAdd?.(this);return entity}
  remove(entity){if(!entity)return false;if(this._updating){this.pendingRemove.add(entity);return true}const ok=this.entities.delete(entity);if(ok)entity.onRemove?.(this);return ok}
  clear(){for(const e of this.entities)e.onRemove?.(this);this.entities.clear();this.pendingAdd.length=0;this.pendingRemove.clear()}
  update(dt,context){this._updating=true;for(const e of this.entities){if(this.pendingRemove.has(e))continue;e.update?.(dt,context)}this._updating=false;for(const e of this.pendingRemove)this.remove(e);this.pendingRemove.clear();for(const e of this.pendingAdd)this.entities.add(e);this.pendingAdd.length=0}
  draw(ctx,context){for(const e of this.entities){if(this.pendingRemove.has(e))continue;e.draw?.(ctx,context)}}
  query(predicate){const out=[];for(const e of this.entities)if(predicate(e))out.push(e);return out}
  find(predicate){for(const e of this.entities)if(predicate(e))return e;return null}
  get size(){return this.entities.size}
  values(){return this.entities.values()}
}
