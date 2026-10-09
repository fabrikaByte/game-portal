export class Inventory{
  constructor({capacity=20,maxStack=99,items=[]}={}){this.capacity=Math.max(1,Math.floor(capacity));this.maxStack=Math.max(1,Math.floor(maxStack));this.items=new Map();this.onChange=null;for(const item of items)this.add(item.id,item.qty??1,item)}
  _emit(){this.onChange?.(this.toJSON(),this)}
  setChangeHandler(fn){this.onChange=typeof fn==='function'?fn:null;return this}
  count(id){return this.items.get(String(id))?.qty||0}
  has(id,qty=1){return this.count(id)>=Math.max(0,qty)}
  add(id,qty=1,data={}){id=String(id);qty=Math.max(0,Math.floor(qty));if(!id||!qty)return 0;let entry=this.items.get(id);if(!entry){if(this.items.size>=this.capacity)return qty;entry={id,qty:0,...data};this.items.set(id,entry)}const room=this.maxStack-entry.qty;const added=Math.min(room,qty);entry.qty+=added;this._emit();return qty-added}
  remove(id,qty=1){id=String(id);const e=this.items.get(id);if(!e)return 0;const n=Math.min(e.qty,Math.max(0,Math.floor(qty)));e.qty-=n;if(e.qty<=0)this.items.delete(id);this._emit();return n}
  consume(id,qty=1){return this.remove(id,qty)===Math.floor(qty)}
  clear(){this.items.clear();this._emit()}
  list(){return [...this.items.values()].map(x=>({...x}))}
  toJSON(){return {capacity:this.capacity,maxStack:this.maxStack,items:this.list()}}
  static fromJSON(data){return new Inventory(data||{})}
}
