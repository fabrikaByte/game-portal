export const GAME_STATES=Object.freeze({START:'start',PLAYING:'playing',PAUSED:'paused',WON:'won',GAME_OVER:'game-over'});
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export const lerp=(a,b,t)=>a+(b-a)*t;

export class GameEngine{
  constructor({canvas,input=null,config={},hooks={},audio=null,particles=null,shake=null,save=null}){
    if(!canvas) throw new Error('GameEngine requires a canvas');
    const ctx=canvas.getContext('2d',{alpha:false}); if(!ctx) throw new Error('2D context unavailable');
    this.canvas=canvas; this.ctx=ctx; this.input=input; this.config={width:960,height:540,lives:3,timer:0,levelEvery:500,...config};
    this.hooks=hooks; this.audio=audio; this.particles=particles; this.shake=shake; this.save=save;
    this.state=GAME_STATES.START; this.running=true; this.score=0; this.bestScore=save?.get('best',0)||0; this.lives=this.config.lives;
    this.level=1; this.elapsed=0; this.timeLeft=this.config.timer||0; this.raf=0; this.lastTime=performance.now();
    this._resize=()=>this.resize(); window.addEventListener('resize',this._resize,{passive:true}); this.resize();
  }
  resize(){
    const r=this.canvas.getBoundingClientRect(); const w=Math.max(320,r.width||this.config.width); const h=Math.max(180,r.height||w*9/16);
    const d=Math.min(window.devicePixelRatio||1,2); this.canvas.width=Math.round(w*d); this.canvas.height=Math.round(h*d);
    this.viewportW=w; this.viewportH=h; this.scale=Math.min(w/this.config.width,h/this.config.height); this.offsetX=(w-this.config.width*this.scale)/2; this.offsetY=(h-this.config.height*this.scale)/2; this.hooks.resize?.(w,h,this);
  }
  reset(){this.score=0;this.lives=Math.max(0,Math.floor(this.config.lives));this.level=1;this.elapsed=0;this.timeLeft=this.config.timer||0;this.input?.clear();this.particles?.clear();this.shake?.clear();this.hooks.reset?.(this);}
  start(){if(this.state===GAME_STATES.PAUSED){this.resume();return}if(this.state===GAME_STATES.PLAYING)return;this.reset();this.state=GAME_STATES.PLAYING;this.lastTime=performance.now();this.audio?.unlock();this.hooks.start?.(this);this.loop(this.lastTime)}
  pause(){if(this.state!==GAME_STATES.PLAYING)return;this.state=GAME_STATES.PAUSED;this.input?.clear();this.audio?.pause();this.hooks.pause?.(this)}
  resume(){if(this.state!==GAME_STATES.PAUSED)return;this.state=GAME_STATES.PLAYING;this.lastTime=performance.now();this.audio?.resume();this.hooks.resume?.(this)}
  restart(){this.state=GAME_STATES.START;this.reset();this.hooks.restart?.(this);this.render()}
  addScore(n){const v=Number(n);if(!Number.isFinite(v))return;this.score=Math.max(0,this.score+v);if(this.score>this.bestScore){this.bestScore=this.score;this.save?.set('best',Math.floor(this.bestScore))}this.hooks.score?.(this,v)}
  setLives(n){this.lives=Math.max(0,Math.floor(Number(n)||0))}
  loseLife(n=1){this.setLives(this.lives-Math.max(1,Math.floor(n)));this.hooks.lifeLost?.(this);if(this.lives<=0)this.gameOver()}
  win(){if(this.state!==GAME_STATES.PLAYING)return;this.state=GAME_STATES.WON;this.input?.clear();this.audio?.win();this.save?.set('best',Math.max(this.save?.get('best',0)||0,Math.floor(this.score)));this.hooks.win?.(this)}
  gameOver(){if(this.state!==GAME_STATES.PLAYING)return;this.state=GAME_STATES.GAME_OVER;this.input?.clear();this.audio?.gameOver();this.save?.set('best',Math.max(this.save?.get('best',0)||0,Math.floor(this.score)));this.hooks.gameOver?.(this)}
  loop(t){if(!this.running)return;const dt=Math.min(.033,Math.max(0,(t-this.lastTime)/1000));this.lastTime=t;if(this.state===GAME_STATES.PLAYING){this.elapsed+=dt;if(this.timeLeft>0){this.timeLeft=Math.max(0,this.timeLeft-dt);if(this.timeLeft===0){this.hooks.timerExpired?.(this);if(this.state===GAME_STATES.PLAYING)this.gameOver()}}this.hooks.update?.(dt,this);this.particles?.update(dt);this.shake?.update(dt);this.level=1+Math.floor(this.score/Math.max(1,this.config.levelEvery));}this.render();this.raf=requestAnimationFrame(x=>this.loop(x))}
  render(){const d=Math.min(window.devicePixelRatio||1,2);const c=this.ctx;c.setTransform(d,0,0,d,0,0);c.fillStyle='#06111f';c.fillRect(0,0,this.viewportW,this.viewportH);c.save();c.translate(this.offsetX,this.offsetY);c.scale(this.scale,this.scale);this.hooks.draw?.(c,this);c.restore()}
  destroy(){this.running=false;cancelAnimationFrame(this.raf);window.removeEventListener('resize',this._resize);this.input?.destroy()}
}
