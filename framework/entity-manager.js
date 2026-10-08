export class EntityManager{
  constructor(){this.entities=new Map();this.nextId=1}
  add(entity){const id=entity.id??`e${this.nextId++}`;entity.id=id;this.entities.set(id,entity);return entity}
  remove(id){this.entities.delete(id)}
  clear(){this.entities.clear()}
  get(id){return this.entities.get(id)}
  all(){return [...this.entities.values()]}
  update(dt,ctx){for(const e of this.entities.values()) if(!e.dead&&e.update)e.update(dt,ctx)}
  draw(ctx){for(const e of this.entities.values()) if(!e.dead&&e.draw)e.draw(ctx)}
}