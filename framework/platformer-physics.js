export class PlatformerPhysics {
  constructor(o={}){this.gravity=o.gravity??1500;this.jumpSpeed=o.jumpSpeed??560;this.maxFall=o.maxFall??900;this.coyote=o.coyote??.1;this.jumpBuffer=o.jumpBuffer??.1;}
  update(p,dt,{left=false,right=false,jump=false,groundY=null,minX=0,maxX=Infinity}={}){
    p.vx??=0;p.vy??=0;p.onGround??=false;p.coyoteTime=p.onGround?this.coyote:Math.max(0,(p.coyoteTime||0)-dt);p.jumpBuffer=jump?this.jumpBuffer:Math.max(0,(p.jumpBuffer||0)-dt);
    const accel=left||right?1700:2200;const dir=(right?1:0)-(left?1:0);p.vx+=(dir*accel)*dt;if(!dir)p.vx*=Math.max(0,1-10*dt);p.vx=Math.max(-420,Math.min(420,p.vx));
    if(p.jumpBuffer>0&&(p.onGround||p.coyoteTime>0)){p.vy=-this.jumpSpeed;p.onGround=false;p.coyoteTime=0;p.jumpBuffer=0;}
    p.vy=Math.min(this.maxFall,p.vy+this.gravity*dt);p.x=Math.max(minX,Math.min(maxX-p.w,p.x+p.vx*dt));p.y+=p.vy*dt;
    if(groundY!=null&&p.y+p.h>=groundY){p.y=groundY-p.h;p.vy=0;p.onGround=true;}else p.onGround=false;
  }
}
