export class LeaderboardClient{
  constructor({endpoint=null,key='2d-games-leaderboard',storage=globalThis.localStorage}={}){this.endpoint=endpoint;this.key=key;this.storage=storage}
  _local(){try{return JSON.parse(this.storage?.getItem(this.key)||'[]')}catch{return[]}}
  _saveLocal(rows){try{this.storage?.setItem(this.key,JSON.stringify(rows.slice(0,100)))}catch{}}
  async get(limit=10){limit=Math.max(1,Math.min(100,Math.floor(limit)));if(this.endpoint){const r=await fetch(`${this.endpoint}?limit=${limit}`,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error(`Leaderboard GET ${r.status}`);return await r.json()}return this._local().sort((a,b)=>b.score-a.score).slice(0,limit)}
  async submit({player='Player',score=0,meta={}}={}){const entry={player:String(player).slice(0,40)||'Player',score:Math.max(0,Math.floor(Number(score)||0)),meta,createdAt:new Date().toISOString()};if(this.endpoint){const r=await fetch(this.endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(entry)});if(!r.ok)throw new Error(`Leaderboard POST ${r.status}`);return await r.json()}const rows=this._local();rows.push(entry);rows.sort((a,b)=>b.score-a.score);this._saveLocal(rows);return entry}
}
