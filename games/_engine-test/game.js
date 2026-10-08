import { GameEngine, GAME_STATES } from '../../framework/core.js';
import { Input } from '../../framework/input.js';
import { rectsOverlap, clamp } from '../../framework/collision.js';
import { Particles } from '../../framework/particles.js';
import { AudioManager } from '../../framework/audio.js';
import { SaveStore } from '../../framework/save.js';

const canvas = document.querySelector('#game');
const input = new Input();
const particles = new Particles();
const audio = new AudioManager();
const save = new SaveStore('engine-test');
const ui = { score: document.querySelector('#score'), lives: document.querySelector('#lives'), best: document.querySelector('#best'), state: document.querySelector('#state') };
const player = { x: 80, y: 220, width: 34, height: 34, speed: 300 };
const coin = { x: 500, y: 250, size: 18 };
const obstacle = { x: 700, y: 180, width: 45, height: 180, vx: -130 };
let invulnerable = 0;

function resetWorld(engine) { player.x=80; player.y=220; coin.x=180+Math.random()*(engine.width-220); coin.y=80+Math.random()*(engine.height-160); obstacle.x=engine.width+100; obstacle.y=80+Math.random()*Math.max(1,engine.height-240); obstacle.vx=-130; invulnerable=0; engine.setLives(3); }
const engine = new GameEngine({ canvas, input, systems:{particles}, hooks:{
  reset: resetWorld,
  start: e => { resetWorld(e); ui.state.textContent='PLAYING'; },
  update(dt,e){
    if(input.isDown('escape','p')) e.pause();
    let dx=(input.right()?1:0)-(input.left()?1:0), dy=(input.down()?1:0)-(input.up()?1:0);
    const len=Math.hypot(dx,dy)||1; player.x=clamp(player.x+dx/len*player.speed*dt,0,e.width-player.width); player.y=clamp(player.y+dy/len*player.speed*dt,0,e.height-player.height);
    obstacle.x += obstacle.vx*dt; if(obstacle.x < -obstacle.width){ obstacle.x=e.width+80; obstacle.y=50+Math.random()*Math.max(1,e.height-180); }
    if(invulnerable>0) invulnerable-=dt;
    const c={x:coin.x-coin.size,y:coin.y-coin.size,width:coin.size*2,height:coin.size*2};
    if(rectsOverlap(player,c)){ e.addScore(10); particles.burst(coin.x,coin.y,18); audio.beep({frequency:760}); coin.x=80+Math.random()*(e.width-160); coin.y=60+Math.random()*(e.height-120); }
    if(invulnerable<=0 && rectsOverlap(player,obstacle)){ invulnerable=.9; e.loseLife(); audio.beep({frequency:140,duration:.15,type:'square'}); if(e.state===GAME_STATES.GAME_OVER) return; player.x=80; player.y=e.height/2; }
    if(e.score>0 && e.score%50===0) e.level=1+Math.floor(e.score/50);
  },
  draw(ctx,e){
    ctx.clearRect(0,0,e.width,e.height); ctx.fillStyle='#102d4d'; ctx.fillRect(0,0,e.width,e.height);
    ctx.globalAlpha=.12; for(let x=0;x<e.width;x+=40)for(let y=0;y<e.height;y+=40){ctx.fillStyle='#fff';ctx.fillRect(x,y,1,1)} ctx.globalAlpha=1;
    ctx.fillStyle='#ffd54a';ctx.beginPath();ctx.arc(coin.x,coin.y,coin.size,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ff5964';ctx.fillRect(obstacle.x,obstacle.y,obstacle.width,obstacle.height);
    ctx.fillStyle=invulnerable>0?'#9fb7ff':'#62d7ff';ctx.fillRect(player.x,player.y,player.width,player.height);
    particles.draw(ctx);
    if(e.state!==GAME_STATES.PLAYING){ctx.fillStyle='rgba(0,0,0,.62)';ctx.fillRect(0,0,e.width,e.height);ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='700 34px system-ui';const title=e.state===GAME_STATES.START?'ENGINE TEST READY':e.state===GAME_STATES.PAUSED?'PAUSED':e.state===GAME_STATES.GAME_OVER?'GAME OVER':'YOU WIN';ctx.fillText(title,e.width/2,e.height/2-10);ctx.font='18px system-ui';ctx.fillText(e.state===GAME_STATES.START?'Press Enter or click to start':'Press R to restart',e.width/2,e.height/2+30);ctx.textAlign='left';}
    ui.score.textContent=e.score;ui.lives.textContent=e.lives;ui.best.textContent=Math.max(e.bestScore,save.get('best',0));ui.state.textContent=e.state.toUpperCase();
  },
  score(s){const best=save.get('best',0);if(s>best)save.set('best',s)},
  gameOver:e=>save.set('best',Math.max(save.get('best',0),e.score))
}});

input.attachTouch(canvas);
canvas.addEventListener('pointerdown',()=>{if(engine.state===GAME_STATES.START||engine.state===GAME_STATES.GAME_OVER)engine.start();});
window.addEventListener('keydown',e=>{if(e.key==='Enter' && engine.state===GAME_STATES.START)engine.start();if(e.key.toLowerCase()==='r'){engine.restart();}if(e.code==='Space'){e.preventDefault();engine.state===GAME_STATES.PAUSED?engine.resume():engine.pause();}});
engine.bestScore=save.get('best',0); engine.resize(); engine.render();
