export class DebugMetrics {
  constructor(){this.reset();this._fpsTime=0;this._fpsFrames=0}
  reset(){this.frameTime=0;this.fps=0;this.updates=0;this.draws=0;this.entities=0;this.errors=0}
  sample(dt){const d=Math.max(0,Number(dt)||0);this.frameTime=d;this._fpsTime+=d;this._fpsFrames++;if(this._fpsTime>=.5){this.fps=this._fpsFrames/this._fpsTime;this._fpsTime=0;this._fpsFrames=0}}
  snapshot(){return {fps:this.fps,frameTime:this.frameTime,updates:this.updates,draws:this.draws,entities:this.entities,errors:this.errors}}
}
export class DebugOverlay {
  constructor({enabled=false,position='top-left'}={}){this.enabled=enabled;this.position=position}
  draw(ctx,metrics){if(!this.enabled)return;const data=metrics.snapshot();ctx.save();ctx.font='12px ui-monospace,monospace';ctx.textBaseline='top';const lines=[`FPS ${data.fps.toFixed(1)}`,`DT ${(data.frameTime*1000).toFixed(1)}ms`,`Entities ${data.entities}`,`Errors ${data.errors}`];const pad=8;const w=150,h=lines.length*16+pad*2;let x=8,y=8;if(this.position==='top-right')x=Math.max(8,960-w-8);if(this.position==='bottom-left')y=Math.max(8,540-h-8);if(this.position==='bottom-right'){x=Math.max(8,960-w-8);y=Math.max(8,540-h-8)}ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(x,y,w,h);ctx.fillStyle='#9fe7ff';for(let i=0;i<lines.length;i++)ctx.fillText(lines[i],x+pad,y+pad+i*16);ctx.restore()}
}
