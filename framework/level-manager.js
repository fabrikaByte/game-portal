export class LevelManager{
  constructor(levels=[],start=0){this.levels=levels;this.index=start;this.elapsed=0}
  get current(){return this.levels[this.index]||null}
  start(index=this.index){this.index=Math.max(0,Math.min(this.levels.length-1,index));this.elapsed=0;return this.current}
  update(dt){this.elapsed+=dt}
  next(){if(this.index<this.levels.length-1){this.index++;this.elapsed=0;return this.current}return null}
  restart(){this.elapsed=0;return this.current}
  get complete(){return this.index>=this.levels.length-1}
}