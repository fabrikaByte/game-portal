export class SeededRandom{
  constructor(seed=Date.now()){this.seed=hashSeed(seed)}
  next(){let x=this.seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;this.seed=x|0;return ((x>>>0)%1000000)/1000000}
  range(min,max){return min+(max-min)*this.next()}
  int(min,max){return Math.floor(this.range(min,max+1))}
  pick(arr){return arr?.length?arr[Math.floor(this.next()*arr.length)]:undefined}
}
export function hashSeed(value){let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h|0}
export function valueNoise2D(x,y,seed=0){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const n=(ix,iy)=>{let h=hashSeed(`${ix},${iy},${seed}`);h=Math.imul(h^h>>>16,0x45d9f3b);return (h>>>0)/4294967295};const fade=t=>t*t*(3-2*t);const u=fade(xf),v=fade(yf);const a=n(xi,yi),b=n(xi+1,yi),c=n(xi,yi+1),d=n(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
export function generateDungeon({width=40,height=24,seed='dungeon',fill=.46}={}){const rng=new SeededRandom(seed),w=Math.max(5,Math.floor(width)),h=Math.max(5,Math.floor(height));const cells=Array.from({length:h},()=>Array(w).fill(1));const rooms=[];const roomCount=Math.max(3,Math.floor((w*h)/120));for(let i=0;i<roomCount;i++){const rw=rng.int(4,Math.max(4,Math.floor(w/4))),rh=rng.int(4,Math.max(4,Math.floor(h/4)));const x=rng.int(1,Math.max(1,w-rw-2)),y=rng.int(1,Math.max(1,h-rh-2));for(let yy=y;yy<y+rh;yy++)for(let xx=x;xx<x+rw;xx++)cells[yy][xx]=0;rooms.push({x,y,w:rw,h:rh,cx:x+Math.floor(rw/2),cy:y+Math.floor(rh/2)})}for(let i=1;i<rooms.length;i++){const a=rooms[i-1],b=rooms[i];let x=a.cx,y=a.cy;while(x!==b.cx){cells[y][x]=0;x+=Math.sign(b.cx-x)}while(y!==b.cy){cells[y][x]=0;y+=Math.sign(b.cy-y)}}for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++)if(cells[y][x]===1&&rng.next()>fill)cells[y][x]=0;return {width:w,height:h,cells,rooms}}
