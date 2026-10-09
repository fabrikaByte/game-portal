export class FixedStepper {
  constructor({step=1/60,maxSteps=6}={}){this.step=Math.max(.001,Number(step)||1/60);this.maxSteps=Math.max(1,Math.floor(maxSteps));this.accumulator=0;this.alpha=0}
  update(dt,fn){let delta=Math.max(0,Math.min(.25,Number(dt)||0));this.accumulator+=delta;let steps=0;while(this.accumulator>=this.step&&steps<this.maxSteps){fn(this.step);this.accumulator-=this.step;steps++}this.alpha=this.accumulator/this.step;return steps}
  reset(){this.accumulator=0;this.alpha=0}
}
