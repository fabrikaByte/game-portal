export class Scene {
  constructor(name='scene'){this.name=name;this.active=false}
  enter(){this.active=true}
  exit(){this.active=false}
  update(){ }
  draw(){ }
}
export class SceneManager {
  constructor(){this.current=null;this.scenes=new Map()}
  add(scene){if(!scene?.name)throw new Error('Scene requires a name');this.scenes.set(scene.name,scene);return scene}
  switch(name,...args){const next=typeof name==='string'?this.scenes.get(name):name;if(!next)throw new Error(`Unknown scene: ${name}`);if(this.current===next)return next;this.current?.exit?.();this.current=next;this.current.enter?.(...args);return next}
  update(dt,engine){this.current?.update?.(dt,engine)}
  draw(ctx,engine){this.current?.draw?.(ctx,engine)}
  clear(){this.current?.exit?.();this.current=null;this.scenes.clear()}
}
