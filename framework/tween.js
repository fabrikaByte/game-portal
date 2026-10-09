const clamp01=v=>Math.max(0,Math.min(1,v));
export const EASINGS=Object.freeze({linear:t=>t,easeIn:t=>t*t,easeOut:t=>1-(1-t)*(1-t),easeInOut:t=>t<.5?2*t*t:1-((-2*t+2)**2)/2});

export class TweenManager {
  constructor(){this.items=new Set();this.nextId=1}
  to(target,props,duration,{easing='easeOut',delay=0,onUpdate,onComplete}={}){
    if(!target||typeof target!=='object')throw new TypeError('Tween target must be an object');
    const keys=Object.keys(props||{}).filter(k=>Number.isFinite(Number(target[k]))&&Number.isFinite(Number(props[k])));
    if(!keys.length||Number(duration)<=0){for(const k of keys)target[k]=Number(props[k]);onUpdate?.(1);onComplete?.();return 0}
    const item={id:this.nextId++,target,from:Object.fromEntries(keys.map(k=>[k,Number(target[k])])),to:Object.fromEntries(keys.map(k=>[k,Number(props[k])])),keys,duration:Math.max(.001,Number(duration)),delay:Math.max(0,Number(delay)||0),time:0,easing:typeof easing==='function'?easing:(EASINGS[easing]||EASINGS.linear),onUpdate,onComplete,cancelled:false};
    this.items.add(item);return item.id;
  }
  cancel(id){for(const item of this.items)if(item.id===id){item.cancelled=true;this.items.delete(item.id);return true}return false}
  update(dt){const delta=Math.max(0,Number(dt)||0);for(const item of [...this.items]){if(item.cancelled)continue;item.time+=delta;if(item.time<item.delay)continue;const t=clamp01((item.time-item.delay)/item.duration),e=clamp01(item.easing(t));for(const k of item.keys)item.target[k]=item.from[k]+(item.to[k]-item.from[k])*e;item.onUpdate?.(t,item);if(t>=1){this.items.delete(item.id);item.onComplete?.(item)}}}
  clear(){this.items.clear()}
  get size(){return this.items.size}
}
