export const QUEST_STATES=Object.freeze({LOCKED:'locked',ACTIVE:'active',COMPLETED:'completed',FAILED:'failed'});
export class QuestManager{
  constructor(quests=[]){this.quests=new Map();this.onChange=null;quests.forEach(q=>this.add(q))}
  add(def){if(!def?.id)throw new Error('Quest id required');this.quests.set(String(def.id),{id:String(def.id),title:def.title||def.id,description:def.description||'',state:def.state||QUEST_STATES.LOCKED,objectives:(def.objectives||[]).map(o=>({id:String(o.id),description:o.description||o.id,target:Math.max(1,Number(o.target)||1),progress:Math.max(0,Number(o.progress)||0),optional:!!o.optional}))});return this}
  get(id){return this.quests.get(String(id))||null}
  activate(id){const q=this.get(id);if(q&&q.state===QUEST_STATES.LOCKED){q.state=QUEST_STATES.ACTIVE;this._emit(q)}return q}
  progress(id,objectiveId,amount=1){const q=this.get(id);if(!q||q.state!==QUEST_STATES.ACTIVE)return false;const o=q.objectives.find(x=>x.id===String(objectiveId));if(!o)return false;o.progress=Math.min(o.target,o.progress+Math.max(0,Number(amount)||0));this._recheck(q);this._emit(q);return true}
  setObjective(id,objectiveId,value){const q=this.get(id);if(!q)return false;const o=q.objectives.find(x=>x.id===String(objectiveId));if(!o)return false;o.progress=Math.max(0,Math.min(o.target,Number(value)||0));this._recheck(q);this._emit(q);return true}
  fail(id){const q=this.get(id);if(q){q.state=QUEST_STATES.FAILED;this._emit(q)}return q}
  _recheck(q){const required=q.objectives.filter(o=>!o.optional);if(required.length&&required.every(o=>o.progress>=o.target))q.state=QUEST_STATES.COMPLETED}
  active(){return [...this.quests.values()].filter(q=>q.state===QUEST_STATES.ACTIVE)}
  all(){return [...this.quests.values()].map(q=>JSON.parse(JSON.stringify(q)))}
  setChangeHandler(fn){this.onChange=typeof fn==='function'?fn:null}
  _emit(q){this.onChange?.(q,this)}
}
