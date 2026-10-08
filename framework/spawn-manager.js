export class SpawnManager {
  constructor({maxAlive=30}={}){this.maxAlive=maxAlive;this.groups=new Map();this.nextId=1;}
  define(id,opts={}){this.groups.set(id,{id,interval:Math.max(.05,opts.interval??1),timer:0,factory:opts.factory||(()=>({})),max:opts.max??this.maxAlive,active:0});return this;}
  update(dt,spawn){for(const g of this.groups.values()){g.timer-=dt;if(g.timer<=0&&g.active<g.max){const count=Math.min(1+Math.floor(Math.random()*Math.max(1,g.max-g.active)),g.max-g.active);for(let i=0;i<count;i++){const item=g.factory(this.nextId++);if(item){item.spawnGroup=g.id;spawn(item,g);g.active++;}}g.timer=g.interval;}}}
  release(item){const g=this.groups.get(item?.spawnGroup);if(g)g.active=Math.max(0,g.active-1);}
  reset(){for(const g of this.groups.values()){g.timer=0;g.active=0;}}
}
