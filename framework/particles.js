export class Particles{
  constructor(){this.items=[]}
  clear(){this.items.length=0}
  burst(x,y,count=14,opts={}){for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=(opts.speed||120)*(0.45+Math.random()),life=(opts.life||.55)*(0.6+Math.random()*.6);this.items.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life,max:life,size:(opts.size||3)*(0.6+Math.random()),color:opts.color||'#fff'})}}
  update(dt){for(let i=this.items.length-1;i>=0;i--){const p=this.items[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=110*dt;if(p.life<=0)this.items.splice(i,1)}}
  draw(c){for(const p of this.items){c.globalAlpha=Math.max(0,p.life/p.max);c.fillStyle=p.color;c.fillRect(p.x,p.y,p.size,p.size);c.globalAlpha=1}}
}
