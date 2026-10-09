export class TileMap{
  constructor({width,height,tileSize=32,layers=[],solidIds=[],tiles={}}={}){
    this.width=Math.max(1,Math.floor(width||1));this.height=Math.max(1,Math.floor(height||1));this.tileSize=Math.max(1,Number(tileSize)||32);
    this.layers=Array.isArray(layers)?layers:[];this.solidIds=new Set(solidIds);this.tiles=tiles||{};
  }
  addLayer(name,data){if(!name)throw new Error('TileMap layer name required');if(!Array.isArray(data)||data.length!==this.width*this.height)throw new Error(`Layer ${name} must contain ${this.width*this.height} tiles`);this.layers.push({name,data:data.slice()});return this}
  layer(name){return this.layers.find(l=>l.name===name)||null}
  index(tx,ty){return ty*this.width+tx}
  inBounds(tx,ty){return tx>=0&&ty>=0&&tx<this.width&&ty<this.height}
  get(tx,ty,layerName=this.layers[0]?.name){const l=this.layer(layerName);return l&&this.inBounds(tx,ty)?l.data[this.index(tx,ty)]:0}
  set(tx,ty,id,layerName=this.layers[0]?.name){const l=this.layer(layerName);if(l&&this.inBounds(tx,ty))l.data[this.index(tx,ty)]=id}
  worldToTile(x,y){return {x:Math.floor(x/this.tileSize),y:Math.floor(y/this.tileSize)}}
  tileToWorld(tx,ty){return {x:tx*this.tileSize,y:ty*this.tileSize}}
  solidAtWorld(x,y){const t=this.worldToTile(x,y);return this.solidAt(t.x,t.y)}
  solidAt(tx,ty){if(!this.inBounds(tx,ty))return true;return this.solidIds.has(this.get(tx,ty))}
  neighbors(tx,ty){const out=[];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=tx+dx,y=ty+dy;if(this.inBounds(x,y)&&!this.solidAt(x,y))out.push({x,y})}return out}
  draw(ctx,{x=0,y=0,tileset=null,layerNames=null}={}){const names=layerNames||this.layers.map(l=>l.name);for(const name of names){const l=this.layer(name);if(!l)continue;for(let ty=0;ty<this.height;ty++){for(let tx=0;tx<this.width;tx++){const id=l.data[this.index(tx,ty)];if(id==null||id===0)continue;const px=x+tx*this.tileSize,py=y+ty*this.tileSize;const t=tileset?.[id];if(t?.draw)t.draw(ctx,px,py,this.tileSize,this.tileSize,id);else{ctx.fillStyle=this.tiles[id]?.color||'#334155';ctx.fillRect(px,py,this.tileSize,this.tileSize)}}}}}
}
