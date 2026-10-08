const DEFAULTS={left:['arrowleft','a','ش'],right:['arrowright','d','ي'],up:['arrowup','w','ص'],down:['arrowdown','s','س'],jump:['space','arrowup','w','ص'],attack:['j','k','space'],interact:['e','enter'],pause:['p','ح'],restart:['r']};
export class InputMap {
  constructor(map={}){this.map={...DEFAULTS,...map};}
  bind(action,...keys){this.map[action]=keys.flat();return this;}
  isDown(input,action){const keys=this.map[action]||[];return keys.some(k=>input.isDown(k));}
  axis(input,h='left',r='right',u='up',d='down'){const x=(this.isDown(input,r)?1:0)-(this.isDown(input,h)?1:0),y=(this.isDown(input,d)?1:0)-(this.isDown(input,u)?1:0),l=Math.hypot(x,y);return l?{x:x/l,y:y/l}:{x:0,y:0};}
}
