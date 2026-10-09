import {clamp} from './core.js';

const rectOf=r=>({left:r.left??r.x??0,right:r.right??((r.x??0)+(r.w??0)),top:r.top??r.y??0,bottom:r.bottom??((r.y??0)+(r.h??0)),w:r.w??((r.right??0)-(r.x??0)),h:r.h??((r.bottom??0)-(r.y??0))});
const overlap=(a,b)=>a.right>b.left&&a.left<b.right&&a.bottom>b.top&&a.top<b.bottom;

export class Body2D{
  constructor({x=0,y=0,w=32,h=32,vx=0,vy=0,mass=1,gravity=1200,drag=0,restitution=0,friction=0.8,staticBody=false}={}){
    this.x=x;this.y=y;this.w=w;this.h=h;this.vx=vx;this.vy=vy;this.mass=Math.max(0.0001,mass);this.gravity=gravity;this.drag=Math.max(0,drag);this.restitution=clamp(restitution,0,1);this.friction=clamp(friction,0,1);this.staticBody=!!staticBody;this.onGround=false;
  }
  get left(){return this.x} get right(){return this.x+this.w} get top(){return this.y} get bottom(){return this.y+this.h}
  integrate(dt){if(this.staticBody)return;const d=Math.max(0,Math.min(0.05,Number(dt)||0));this.vy+=this.gravity*d;const drag=Math.max(0,1-this.drag*d);this.vx*=drag;this.vy*=drag;this.x+=this.vx*d;this.y+=this.vy*d;}
}

export function aabbOverlap(a,b){return overlap(rectOf(a),rectOf(b))}

export function resolveAABB(body,collider){
  if(body.staticBody)return null;
  const b=rectOf(body),c=rectOf(collider);if(!overlap(b,c))return null;
  const pushLeft=c.right-b.left,pushRight=b.right-c.left,pushUp=c.bottom-b.top,pushDown=b.bottom-c.top;
  const minX=Math.min(pushLeft,pushRight),minY=Math.min(pushUp,pushDown);
  if(minX<minY){
    if(pushLeft<pushRight){body.x=c.right;body.vx=Math.max(0,body.vx)*body.restitution}
    else{body.x=c.left-body.w;body.vx=Math.min(0,body.vx)*body.restitution}
    body.vy*=1-body.friction*0.15;return{axis:'x',normal:pushLeft<pushRight?1:-1};
  }
  if(pushUp<pushDown){body.y=c.bottom;body.vy=Math.max(0,body.vy)*body.restitution;body.onGround=false}
  else{body.y=c.top-body.h;body.vy=Math.min(0,body.vy)*body.restitution;body.onGround=true;body.vx*=Math.max(0,1-body.friction*0.08)}
  return{axis:'y',normal:pushUp<pushDown?1:-1};
}

export function moveAndCollide(body,colliders,dt){
  body.onGround=false;const safeDt=Math.max(0,Number(dt)||0);if(body.staticBody||safeDt===0)return 0;
  const list=colliders||[];let minFeature=Math.min(body.w,body.h);
  for(const c of list){const r=rectOf(c);if(r.w>0&&r.h>0)minFeature=Math.min(minFeature,r.w,r.h)}
  const travel=Math.max(Math.abs(body.vx*safeDt),Math.abs(body.vy*safeDt));
  const stepLength=Math.max(1,minFeature*0.5);
  const steps=Math.max(1,Math.min(128,Math.ceil(travel/stepLength)));
  const stepDt=safeDt/steps;let contacts=0;
  for(let i=0;i<steps;i++){body.integrate(stepDt);for(const c of list){if(resolveAABB(body,c))contacts++}}
  return contacts;
}
