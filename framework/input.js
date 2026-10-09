const CONTROL_KEYS=new Set(['arrowleft','arrowright','arrowup','arrowdown','a','d','w','s','p','r',' ','enter','shift','q','e','1','2','3','ش','س','ص','ي','ح','ق']);
const norm=k=>String(k||'').toLowerCase();
export class Input{
  constructor(){
    this.keys=new Set();this.just=new Set();
    this.pointer={x:480,y:270,active:false,down:false,pressed:false,button:0};
    this.swipes=[];this.el=null;this.logicalWidth=960;this.logicalHeight=540;this.viewport={scale:1,offsetX:0,offsetY:0};this._touchStart=null;
    this._kd=e=>{const k=norm(e.key),c=norm(e.code);this.keys.add(k);this.keys.add(c);this.just.add(k);this.just.add(c);if(CONTROL_KEYS.has(k))e.preventDefault()};
    this._ku=e=>{this.keys.delete(norm(e.key));this.keys.delete(norm(e.code))};
    this._clear=()=>this.clear();
    this._visibility=()=>{if(document.hidden)this.clear()};
    window.addEventListener('keydown',this._kd,{passive:false});window.addEventListener('keyup',this._ku);window.addEventListener('blur',this._clear);document.addEventListener('visibilitychange',this._visibility);
  }
  setLogicalSize(width,height){this.logicalWidth=Math.max(1,Number(width)||960);this.logicalHeight=Math.max(1,Number(height)||540);}
  setViewport({scale=1,offsetX=0,offsetY=0}={}){this.viewport={scale:Math.max(0.0001,Number(scale)||1),offsetX:Number(offsetX)||0,offsetY:Number(offsetY)||0};}
  attach(el){if(this.el)this.detach();this.el=el;el.style.touchAction='none';
    this._pd=e=>{const p=this.pos(e);this.pointer.x=p.x;this.pointer.y=p.y;this.pointer.active=true;this.pointer.down=e.pointerType==='mouse'?e.button===0:true;this.pointer.pressed=true;this.pointer.button=e.button||0;this._touchStart={x:p.x,y:p.y,pid:e.pointerId,kind:e.pointerType};try{el.setPointerCapture(e.pointerId)}catch{}};
    this._pm=e=>{const p=this.pos(e);this.pointer.x=p.x;this.pointer.y=p.y;this.pointer.active=true;if(this._touchStart&&this._touchStart.pid===e.pointerId&&e.pointerType!=='mouse'){const dx=p.x-this._touchStart.x,dy=p.y-this._touchStart.y;if(Math.hypot(dx,dy)>22){this.swipes.push({dx,dy});this._touchStart={...this._touchStart,x:p.x,y:p.y}}}};
    this._pu=e=>{if(e.pointerType==='mouse')this.pointer.down=false;this._touchStart=null};
    this._pc=e=>{if(e.pointerType==='mouse')this.pointer.down=false;this._touchStart=null};
    el.addEventListener('pointerdown',this._pd);el.addEventListener('pointermove',this._pm);el.addEventListener('pointerup',this._pu);el.addEventListener('pointercancel',this._pc);
  }
  pos(e){const r=this.el?.getBoundingClientRect();if(!r||!r.width||!r.height)return{x:0,y:0};const sx=this.viewport.scale,ox=this.viewport.offsetX,oy=this.viewport.offsetY;return{x:Math.max(0,Math.min(this.logicalWidth,(e.clientX-r.left-ox)/sx)),y:Math.max(0,Math.min(this.logicalHeight,(e.clientY-r.top-oy)/sx))}}
  detach(){if(!this.el)return;this.el.removeEventListener('pointerdown',this._pd);this.el.removeEventListener('pointermove',this._pm);this.el.removeEventListener('pointerup',this._pu);this.el.removeEventListener('pointercancel',this._pc);this.el=null}
  down(...keys){return keys.some(k=>this.keys.has(norm(k))||this.keys.has('key'+norm(k)))}
  pressed(...keys){return keys.some(k=>this.just.has(norm(k))||this.just.has('key'+norm(k)))}
  vector(){const x=(this.down('arrowright','d','ي')?1:0)-(this.down('arrowleft','a','ش')?1:0),y=(this.down('arrowdown','s','س')?1:0)-(this.down('arrowup','w','ص')?1:0),m=Math.hypot(x,y);return m?{x:x/m,y:y/m}:{x:0,y:0}}
  consumePointerPress(){const p=this.pointer.pressed;this.pointer.pressed=false;return p}
  consumeSwipe(){return this.swipes.shift()||null}
  clear(){this.keys.clear();this.just.clear();this.pointer.down=false;this.pointer.pressed=false;this.pointer.active=false;this.swipes.length=0;this._touchStart=null}
  endFrame(){this.just.clear();this.pointer.pressed=false;this.swipes.length=0;}
  destroy(){window.removeEventListener('keydown',this._kd);window.removeEventListener('keyup',this._ku);window.removeEventListener('blur',this._clear);document.removeEventListener?.('visibilitychange',this._visibility);this.detach();this.clear()}
}
