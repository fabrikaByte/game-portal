import {clamp,lerp} from './core.js';
export class Camera2D {
  constructor({x=0,y=0,viewportW=960,viewportH=540,worldW=Infinity,worldH=Infinity,smoothing=10,zoom=1}={}){
    Object.assign(this,{x,y,viewportW,viewportH,worldW,worldH,smoothing:Math.max(0,smoothing),zoom:Math.max(.05,zoom)});this.target=null;this.shakeX=0;this.shakeY=0;
  }
  setViewport(w,h){this.viewportW=Math.max(1,w);this.viewportH=Math.max(1,h);this.clamp()}
  setBounds(w,h){this.worldW=Number.isFinite(w)?Math.max(0,w):Infinity;this.worldH=Number.isFinite(h)?Math.max(0,h):Infinity;this.clamp()}
  follow(target){this.target=target||null}
  lookAt(x,y){this.x=Number(x)||0;this.y=Number(y)||0;this.clamp()}
  update(dt){if(this.target){const tx=Number(this.target.x)||0,ty=Number(this.target.y)||0;const t=1-Math.exp(-this.smoothing*Math.max(0,dt));this.x=lerp(this.x,tx,t);this.y=lerp(this.y,ty,t);this.clamp()}}
  clamp(){const halfW=this.viewportW/(2*this.zoom),halfH=this.viewportH/(2*this.zoom);if(Number.isFinite(this.worldW)&&this.worldW>0)this.x=clamp(this.x,halfW,Math.max(halfW,this.worldW-halfW));if(Number.isFinite(this.worldH)&&this.worldH>0)this.y=clamp(this.y,halfH,Math.max(halfH,this.worldH-halfH))}
  setShake(x=0,y=0){this.shakeX=Number(x)||0;this.shakeY=Number(y)||0}
  worldToScreen(x,y){return {x:(x-this.x)*this.zoom+this.viewportW/2+this.shakeX,y:(y-this.y)*this.zoom+this.viewportH/2+this.shakeY}}
  screenToWorld(x,y){return {x:(x-this.viewportW/2-this.shakeX)/this.zoom+this.x,y:(y-this.viewportH/2-this.shakeY)/this.zoom+this.y}}
  begin(ctx){ctx.save();ctx.translate(this.viewportW/2+this.shakeX,this.viewportH/2+this.shakeY);ctx.scale(this.zoom,this.zoom);ctx.translate(-this.x,-this.y)}
  end(ctx){ctx.restore()}
}
