export class GridNavigator {
  constructor(rows, { walkable='.' } = {}) { this.rows=rows; this.walkable=new Set(Array.isArray(walkable)?walkable:[walkable]); this.h=rows.length; this.w=Math.max(...rows.map(r=>r.length)); }
  isWalkable(x,y){ return y>=0&&y<this.h&&x>=0&&x<this.w&&this.walkable.has(this.rows[y]?.[x]||'.'); }
  neighbors(x,y){ const out=[]; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) if(this.isWalkable(x+dx,y+dy)) out.push([x+dx,y+dy]); return out; }
  findPath(start,goal,maxNodes=5000){
    const sx=Math.floor(start.x),sy=Math.floor(start.y),gx=Math.floor(goal.x),gy=Math.floor(goal.y);
    if(!this.isWalkable(sx,sy)||!this.isWalkable(gx,gy)) return [];
    const key=(x,y)=>x+','+y, q=[[sx,sy]], came=new Map(), seen=new Set([key(sx,sy)]); let nodes=0;
    while(q.length&&nodes++<maxNodes){ const [x,y]=q.shift(); if(x===gx&&y===gy) break; for(const [nx,ny] of this.neighbors(x,y)){const k=key(nx,ny);if(seen.has(k))continue;seen.add(k);came.set(k,[x,y]);q.push([nx,ny]);} }
    const out=[]; let cur=[gx,gy]; while(!(cur[0]===sx&&cur[1]===sy)){const k=key(cur[0],cur[1]),prev=came.get(k);if(!prev)return [];out.push(cur);cur=prev;}out.push([sx,sy]);out.reverse();return out;
  }
}
