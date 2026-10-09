export class InputMap {
  constructor(bindings={}){this.bindings=new Map();for(const [action,keys] of Object.entries(bindings))this.bind(action,keys)}
  bind(action,keys){const list=Array.isArray(keys)?keys:[keys];this.bindings.set(String(action),list.filter(Boolean).map(v=>String(v).toLowerCase()));return this}
  unbind(action){this.bindings.delete(String(action));return this}
  keys(action){return this.bindings.get(String(action))||[]}
  pressed(input,action){return input?.pressed(...this.keys(action))||false}
  down(input,action){return input?.down(...this.keys(action))||false}
  vector(input,left='left',right='right',up='up',down='down'){const x=(this.down(input,right)?1:0)-(this.down(input,left)?1:0),y=(this.down(input,down)?1:0)-(this.down(input,up)?1:0),m=Math.hypot(x,y);return m?{x:x/m,y:y/m}:{x:0,y:0}}
}
