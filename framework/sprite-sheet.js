export class SpriteSheet{
  constructor({image,frameWidth,frameHeight,columns=1,rows=1}={}){this.image=image||null;this.frameWidth=Math.max(1,Math.floor(frameWidth||1));this.frameHeight=Math.max(1,Math.floor(frameHeight||1));this.columns=Math.max(1,Math.floor(columns||1));this.rows=Math.max(1,Math.floor(rows||1))}
  frame(index=0){const i=Math.max(0,Math.floor(index));return {sx:(i%this.columns)*this.frameWidth,sy:Math.floor(i/this.columns)%this.rows*this.frameHeight,sw:this.frameWidth,sh:this.frameHeight}}
  draw(ctx,index,x,y,w=this.frameWidth,h=this.frameHeight,flipX=false){if(!this.image||!ctx)return;const f=this.frame(index);ctx.save();if(flipX){ctx.translate(x+w,y);ctx.scale(-1,1);x=0;y=0}ctx.drawImage(this.image,f.sx,f.sy,f.sw,f.sh,x,y,w,h);ctx.restore()}
}
export class SpriteAnimator{
  constructor({sheet,animations={idle:[0],run:[0,1,2,3]},fps=10}={}){this.sheet=sheet;this.animations=animations;this.fps=fps;this.name='idle';this.time=0;this.frame=0;this.loop=true;this.finished=false}
  play(name,{restart=false,loop=true}={}){if(!this.animations[name])return false;if(restart||this.name!==name){this.name=name;this.time=0;this.frame=0;this.finished=false}this.loop=loop;return true}
  update(dt){const frames=this.animations[this.name]||[0];if(!frames.length)return;this.time+=Math.max(0,Number(dt)||0);const dur=1/Math.max(.001,this.fps);let steps=Math.floor(this.time/dur);if(steps<=0)return;this.time-=steps*dur;let next=this.frame+steps;if(this.loop)next=next%frames.length;else if(next>=frames.length-1){next=frames.length-1;this.finished=true}this.frame=next}
  index(){const a=this.animations[this.name]||[0];return a[this.frame%a.length]}
  draw(ctx,x,y,w,h,flipX=false){this.sheet?.draw(ctx,this.index(),x,y,w,h,flipX)}
}
