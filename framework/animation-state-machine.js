export class AnimationStateMachine{
  constructor(states={},initial=null){this.states=states;this.current=initial||Object.keys(states)[0]||null;this.time=0}
  set(name,force=false){if(!force&&name===this.current)return false;if(!this.states[name])return false;this.current=name;this.time=0;return true}
  update(dt){this.time+=dt;const s=this.states[this.current];if(s?.duration&&this.time>=s.duration&&!s.loop&&s.next)this.set(s.next)}
  get frame(){const s=this.states[this.current];if(!s)return 0;return s.frames?.length?s.frames[Math.floor(this.time/(s.fps||.1))%s.frames.length]:0}
}