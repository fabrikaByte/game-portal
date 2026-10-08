export class SaveStore{
  constructor(key){this.key=`2d-games:${key}`;this.mem={};try{this.mem=JSON.parse(localStorage.getItem(this.key)||'{}')||{}}catch{this.mem={}}}
  get(k,f=0){return Object.prototype.hasOwnProperty.call(this.mem,k)?this.mem[k]:f}
  set(k,v){this.mem[k]=v;try{localStorage.setItem(this.key,JSON.stringify(this.mem))}catch{}}
}
