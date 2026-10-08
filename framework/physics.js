export class PhysicsBody{
  constructor(opts={}){Object.assign(this,{x:0,y:0,w:40,h:40,vx:0,vy:0,gravity:1500,maxFall:1100,jumpVelocity:-620,onGround:false,canDoubleJump:false,jumpsLeft:1},opts)}
  apply(dt){this.vy=Math.min(this.maxFall,this.vy+this.gravity*dt);this.x+=this.vx*dt;this.y+=this.vy*dt}
  jump(){if(this.onGround||this.jumpsLeft>0){this.vy=this.jumpVelocity;if(!this.onGround)this.jumpsLeft--;this.onGround=false;return true}return false}
  land(y){this.y=y-this.h;this.vy=0;this.onGround=true;this.jumpsLeft=1}
}