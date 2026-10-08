import { GameEngine, GAME_STATES } from '../../framework/core.js';
import { Input } from '../../framework/input.js';
import { rectsOverlap, clamp } from '../../framework/collision.js';
import { MovementController } from '../../framework/movement.js';
import { Particles } from '../../framework/particles.js';
import { SaveStore } from '../../framework/save.js';
import { DifficultyManager } from '../../framework/difficulty.js';
import { LevelManager } from '../../framework/levels.js';
import { GameTimer } from '../../framework/timer.js';
import { PowerUpManager } from '../../framework/powerups.js';
import { ComboManager } from '../../framework/combo.js';
import { ScreenShake } from '../../framework/screen-shake.js';
import { mountGameTemplate } from '../../framework/game-template.js';

const ui = mountGameTemplate(document.querySelector('#game-root'), {
  title: 'Coin Dash', version: 'Foundation Engine — v1.6.1',
  instructions: 'التحكم: الأسهم / WASD أو الماوس — اسحب على اللعبة للموبايل. Space / P للإيقاف.'
});
const canvas = ui.canvas, ctx = canvas.getContext('2d');
const input = new Input();
const audio = ui.audio;
const save = new SaveStore('coin-dash');
const particles = new Particles();
const difficulty = new DifficultyManager('NORMAL');
const levels = new LevelManager([{score:0,speed:1},{score:500,speed:1.08},{score:1200,speed:1.18},{score:2200,speed:1.3}]);
const timer = new GameTimer(0);
const powerups = new PowerUpManager();
const combo = new ComboManager();
const shake = new ScreenShake();
const movement = new MovementController({input, speed: 380, mouseFollow: true, mouseSpeed: 1000});
const player = {x:375,y:420,width:50,height:32};
const coin = {x:250,y:120,radius:13};
const state = {coins:0, invulnerable:0, flash:0, roadOffset:0, spawn:0, coinPulse:0};
const enemies = [];
const rand = (a,b) => Math.random()*(b-a)+a;

function spawnEnemy(offset=0){
  const lane=[195,325,455,585][Math.floor(Math.random()*4)];
  enemies.push({x:lane,y:-80-offset,width:48,height:70,speed:rand(180,245)});
}
function randomCoin(e){
  coin.x=175+Math.random()*Math.max(1,e.width-350);
  coin.y=70+Math.random()*Math.max(1,e.height-180);
}
function resetWorld(e){
  player.x=clamp(e.width/2-player.width/2,155,e.width-player.width-155);
  player.y=e.height-player.height-45;
  state.coins=0;state.invulnerable=0;state.flash=0;state.roadOffset=0;state.spawn=.65;state.coinPulse=0;
  enemies.length=0;spawnEnemy(0);spawnEnemy(180);randomCoin(e);particles.items.length=0;powerups.reset();combo.reset();shake.time=0;shake.power=0;e.setLives(3);
}
function hud(e){
  ui.score.textContent=Math.floor(e.score);ui.lives.textContent='❤️'.repeat(e.lives)+'🖤'.repeat(3-e.lives);
  ui.best.textContent=Math.floor(Math.max(e.bestScore,save.get('best',0)));ui.level.textContent=e.level;
  ui.timer.textContent='∞';ui.combo.textContent='x'+combo.multiplier;ui.state.textContent=e.state.toUpperCase();
  ui.status.textContent=e.state===GAME_STATES.PLAYING?'PLAYING':e.state.toUpperCase();
  ui.pauseBtn.textContent=e.state===GAME_STATES.PAUSED?'متابعة':'إيقاف مؤقت';
  ui.pauseBtn.disabled=!([GAME_STATES.PLAYING,GAME_STATES.PAUSED].includes(e.state));
}
function collectCoin(e){
  state.coins++;const c=combo.hit();e.addScore(Math.round(100*combo.multiplier));
  particles.burst(coin.x,coin.y,16);audio.coin();state.coinPulse=.35;randomCoin(e);
  if(c===3) powerups.collect('double-score',5);
}
function hit(e){
  if(state.invulnerable>0)return;state.invulnerable=.9;state.flash=.2;combo.reset();particles.burst(player.x+player.width/2,player.y+player.height/2,20);shake.trigger(9,.2);audio.hit();e.loseLife();
  player.x=clamp(e.width/2-player.width/2,155,e.width-player.width-155);player.y=e.height-player.height-45;
}
function drawCar(x,y,w,h,playerCar=false,blink=false){
  if(blink&&Math.floor(state.invulnerable*14)%2===0)return;
  ctx.fillStyle=playerCar?'#38bdf8':'#ef4444';ctx.beginPath();ctx.roundRect(x,y,w,h,8);ctx.fill();
  ctx.fillStyle=playerCar?'#e0f2fe':'#bae6fd';ctx.fillRect(x+7,y+10,w-14,16);
  ctx.fillStyle='#0f172a';ctx.fillRect(x+5,y+h-7,10,5);ctx.fillRect(x+w-15,y+h-7,10,5);
}
const engine=new GameEngine({canvas,input,systems:{particles,audio,levels,timer,powerups,combo,shake},config:{lives:3,timer:0},hooks:{
  reset:resetWorld,
  start:()=>audio.unlock(), pause:()=>audio.pause(), resume:()=>audio.resume(),
  score:(score)=>{if(score>save.get('best',0))save.set('best',score)},
  gameOver:e=>save.set('best',Math.max(save.get('best',0),Math.floor(e.score))),
  lifeLost:()=>{},
  update(dt,e){
    if(input.isDown('p','ح'))e.pause();
    movement.axisX(player,dt,155,e.width-155,380); // keyboard/touch lane control
    if(!input.hasKeyboardMovement()) movement.move(player,dt,e.width,e.height);
    player.y=clamp(player.y,40,e.height-player.height-20);
    state.roadOffset=(state.roadOffset+220*dt)%80;state.spawn-=dt;
    if(state.spawn<=0){spawnEnemy();state.spawn=Math.max(.4,1.05-e.level*.035)*difficulty.spawn/levels.data.speed;}
    for(const x of enemies)x.y+=x.speed*difficulty.speed*levels.data.speed*dt;
    for(let i=enemies.length-1;i>=0;i--)if(enemies[i].y>e.height+80)enemies.splice(i,1);
    const coinBox={x:coin.x-coin.radius,y:coin.y-coin.radius,width:coin.radius*2,height:coin.radius*2};
    if(rectsOverlap(player,coinBox,3))collectCoin(e);
    for(const x of enemies){if(rectsOverlap(player,x,4)){x.y=e.height+100;hit(e);break;}}
    state.invulnerable=Math.max(0,state.invulnerable-dt);state.flash=Math.max(0,state.flash-dt);state.coinPulse=Math.max(0,state.coinPulse-dt);
    e.score+=dt*(10+e.level*2)*(powerups.has('double-score')?2:1);
    hud(e);
  },
  draw(c,e){
    const sx=c.canvas.clientWidth/800,sy=c.canvas.clientHeight/500;c.setTransform(sx,0,0,sy,0,0);c.clearRect(0,0,800,500);c.save();const off=shake.offset();c.translate(off.x,off.y);
    const bg=c.createLinearGradient(0,0,0,500);bg.addColorStop(0,'#0b1222');bg.addColorStop(1,'#172033');c.fillStyle=bg;c.fillRect(0,0,800,500);
    c.fillStyle='#334155';c.fillRect(140,0,520,500);c.fillStyle='#111827';c.fillRect(150,0,500,500);c.fillStyle='#475569';c.fillRect(150,0,7,500);c.fillRect(643,0,7,500);
    c.strokeStyle='#e2e8f0';c.lineWidth=5;c.setLineDash([28,28]);c.lineDashOffset=-state.roadOffset;c.beginPath();c.moveTo(300,0);c.lineTo(300,500);c.moveTo(500,0);c.lineTo(500,500);c.stroke();c.setLineDash([]);
    const cs=1+Math.sin(state.coinPulse*18)*.15;c.save();c.translate(coin.x,coin.y);c.scale(cs,cs);c.fillStyle='#facc15';c.beginPath();c.arc(0,0,14,0,Math.PI*2);c.fill();c.fillStyle='#f59e0b';c.beginPath();c.arc(0,0,7,0,Math.PI*2);c.fill();c.restore();
    for(const x of enemies)drawCar(x.x,x.y,x.width,x.height,false);drawCar(player.x,player.y,player.width,player.height,true,state.invulnerable>0);c.fillStyle='#fde047';particles.draw(c);c.restore();
    if(state.flash>0){c.fillStyle=`rgba(248,113,113,${state.flash/.2*.18})`;c.fillRect(0,0,800,500)}
    if(e.state!==GAME_STATES.PLAYING){c.fillStyle='rgba(0,0,0,.55)';c.fillRect(0,0,800,500);c.textAlign='center';c.fillStyle='#fff';c.font='700 34px system-ui';c.fillText(e.state===GAME_STATES.START?'COIN DASH':e.state===GAME_STATES.GAME_OVER?'GAME OVER':e.state===GAME_STATES.PAUSED?'PAUSED':'YOU WIN',400,235);c.font='18px system-ui';c.fillText(e.state===GAME_STATES.START?'اضغط ابدأ أو Enter':e.state===GAME_STATES.GAME_OVER?'اضغط إعادة اللعب':'',400,270);c.textAlign='left'}
  }
}});
engine.bestScore=save.get('best',0);input.attachPointer(canvas,{mouse:true,touch:true});
function begin(){if([GAME_STATES.START,GAME_STATES.GAME_OVER,GAME_STATES.WON].includes(engine.state)){audio.unlock();engine.start()}}
ui.startBtn.addEventListener('click',begin);ui.restartBtn.addEventListener('click',()=>engine.restart());ui.pauseBtn.addEventListener('click',()=>engine.state===GAME_STATES.PLAYING?engine.pause():engine.resume());
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;begin()},{passive:true});
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(e.key==='Enter')begin();if(k==='r')engine.restart();if(e.code==='Space'){e.preventDefault();if(engine.state===GAME_STATES.PLAYING)engine.pause();else if(engine.state===GAME_STATES.PAUSED)engine.resume()}});
engine.resize();engine.render();
