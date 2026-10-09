export class DialogueRunner{
  constructor({nodes=[],start=null,flags={},onEvent=null}={}){this.nodes=new Map((nodes||[]).map(n=>[String(n.id),n]));this.current=start?String(start):null;this.flags={...flags};this.index=0;this.onEvent=onEvent}
  node(){return this.current?this.nodes.get(this.current)||null:null}
  start(id=this.current){this.current=id?String(id):null;this.index=0;this.onEvent?.({type:'start',node:this.node()});return this.node()}
  canEnter(n){return !n?.condition || !!this.flags[n.condition]}
  choices(){const n=this.node();return (n?.choices||[]).filter(c=>this.canEnter(c))}
  currentLine(){const n=this.node();return n?.lines?.[this.index]??null}
  next(){const n=this.node();if(!n)return null;if(this.index+1<n.lines?.length){this.index++;return this.currentLine()}const options=this.choices();if(options.length===1)return this.choose(options[0].id);if(options.length>1)return {choices:options};if(n.next)return this.start(n.next);this.current=null;this.onEvent?.({type:'end'});return null}
  choose(choiceId){const n=this.node();const c=(n?.choices||[]).find(x=>String(x.id)===String(choiceId));if(!c)return null;if(c.setFlag)this.flags[c.setFlag]=true;if(c.event)this.onEvent?.({type:'choice-event',event:c.event});return c.next?this.start(c.next):this.next()}
  setFlag(name,value=true){this.flags[name]=!!value;return this}
  reset(id=this.current){this.current=id;this.index=0}
}
