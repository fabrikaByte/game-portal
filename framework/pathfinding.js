import {distance,normalize} from './ai.js';

class MinHeap{
  constructor(){this.items=[]}
  push(item){this.items.push(item);let i=this.items.length-1;while(i>0){const p=(i-1)>>1;if(this.items[p].f<=item.f)break;this.items[i]=this.items[p];i=p;this.items[i]=item}}
  pop(){if(!this.items.length)return null;const root=this.items[0],last=this.items.pop();if(this.items.length){this.items[0]=last;let i=0;for(;;){let l=i*2+1,r=l+1,b=i;if(l<this.items.length&&this.items[l].f<this.items[b].f)b=l;if(r<this.items.length&&this.items[r].f<this.items[b].f)b=r;if(b===i)break;[this.items[i],this.items[b]]=[this.items[b],this.items[i]];i=b}}return root}
  get size(){return this.items.length}
}
const key=(x,y)=>`${x},${y}`;
export class GridPathfinder{
  constructor(grid,{diagonal=false,heuristic='manhattan'}={}){this.grid=grid;this.diagonal=!!diagonal;this.heuristic=heuristic}
  heuristicCost(a,b){if(this.heuristic==='octile'){const dx=Math.abs(a.x-b.x),dy=Math.abs(a.y-b.y);return Math.max(dx,dy)+(Math.SQRT2-1)*Math.min(dx,dy)}return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)}
  neighbors(n){const dirs=this.diagonal?[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]:[[1,0],[-1,0],[0,1],[0,-1]];const out=[];for(const [dx,dy] of dirs){const x=n.x+dx,y=n.y+dy;if(!this.grid.inBounds?.(x,y))continue;if(this.grid.solidAt?.(x,y))continue;if(this.diagonal&&dx&&dy&&(this.grid.solidAt?.(n.x+dx,n.y)||this.grid.solidAt?.(n.x,n.y+dy)))continue;out.push({x,y})}return out}
  find(start,goal,{maxNodes=20000}={}){if(!start||!goal)return[];if(this.grid.solidAt?.(start.x,start.y)||this.grid.solidAt?.(goal.x,goal.y))return[];const open=new MinHeap(),g=new Map(),came=new Map(),closed=new Set(),s={x:start.x,y:start.y};g.set(key(s.x,s.y),0);open.push({x:s.x,y:s.y,f:this.heuristicCost(s,goal)});let nodes=0;while(open.size&&nodes++<maxNodes){const cur=open.pop(),ck=key(cur.x,cur.y);if(closed.has(ck))continue;closed.add(ck);if(cur.x===goal.x&&cur.y===goal.y){const path=[{x:cur.x,y:cur.y}];let k=ck;while(came.has(k)){const p=came.get(k);path.push(p);k=key(p.x,p.y)}path.reverse();return path}for(const n of this.neighbors(cur)){const nk=key(n.x,n.y);if(closed.has(nk))continue;const step=(n.x!==cur.x&&n.y!==cur.y)?Math.SQRT2:1;const tentative=(g.get(ck)??Infinity)+step;if(tentative<(g.get(nk)??Infinity)){came.set(nk,{x:cur.x,y:cur.y});g.set(nk,tentative);open.push({x:n.x,y:n.y,f:tentative+this.heuristicCost(n,goal)})}}}return[]}
  followPath(worldX,worldY,path){if(!path?.length)return null;const t=this.grid.worldToTile?.(worldX,worldY);if(!t)return null;let nearest=0,best=Infinity;path.forEach((p,i)=>{const d=distance(p,t);if(d<best){best=d;nearest=i}});const next=path[Math.min(path.length-1,nearest+1)];const w=this.grid.tileToWorld?.(next.x,next.y);return w?normalize({x:w.x+this.grid.tileSize/2-worldX,y:w.y+this.grid.tileSize/2-worldY}):null}
}
