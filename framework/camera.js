export class Camera2D{
  constructor(w,h){this.x=0;this.y=0;this.w=w;this.h=h;this.shake=0}
  follow(target,bounds={}){const tx=target.x+target.w/2-this.w/2,ty=target.y+target.h/2-this.h*.58;this.x=tx;this.y=ty;if(bounds.w)this.x=Math.max(0,Math.min(Math.max(0,bounds.w-this.w),this.x));if(bounds.h)this.y=Math.max(0,Math.min(Math.max(0,bounds.h-this.h),this.y))}
  kick(amount=8){this.shake=Math.max(this.shake,amount)}
  update(dt){this.shake=Math.max(0,this.shake-30*dt)}
  offset(){return this.shake?[(Math.random()-.5)*this.shake,(Math.random()-.5)*this.shake]:[0,0]}
}