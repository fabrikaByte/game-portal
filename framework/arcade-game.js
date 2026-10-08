import { GameEngine, GAME_STATES } from './core.js';
import { Input } from './input.js';
import { MovementController } from './movement.js';
import { Particles } from './particles.js';
import { SaveStore } from './save.js';
import { DifficultyManager } from './difficulty.js';
import { LevelManager } from './levels.js';
import { GameTimer } from './timer.js';
import { PowerUpManager } from './powerups.js';
import { ComboManager } from './combo.js';
import { ScreenShake } from './screen-shake.js';
import { mountGameTemplate } from './game-template.js';
import {InputMap} from './input-map.js';
import {PlatformerPhysics} from './platformer-physics.js';
import {CombatSystem} from './combat.js';
import {StatusEffects} from './status-effects.js';
import {SpawnManager} from './spawn-manager.js';
import {AssetManager} from './asset-manager.js';

const themes={
'coin-dash':{mode:'runner',title:'Coin Dash',tag:'Neon City',bg:['#071426','#123b63'],accent:'#38bdf8',accent2:'#facc15',player:'runner',goal:1000,asset:'../../assets/coin-dash.svg'},
'jungle-run':{mode:'runner',title:'Jungle Run',tag:'Wild Trails',bg:['#08251b','#14532d'],accent:'#4ade80',accent2:'#facc15',player:'adventurer',goal:1000,asset:'../../assets/jungle-run.svg'},
'jungle-rush':{mode:'runner',title:'Jungle Rush',tag:'Canopy Chase',bg:['#062b20','#166534'],accent:'#22c55e',accent2:'#f97316',player:'adventurer',goal:1000,asset:'../../assets/jungle-run.svg'},
'forest-escape':{mode:'runner',title:'Forest Escape',tag:'Moonlit Woods',bg:['#101827','#14532d'],accent:'#86efac',accent2:'#fb7185',player:'adventurer',goal:1000,asset:'../../assets/forest-escape.svg'},
'ocean-runner':{mode:'swim',title:'Ocean Runner',tag:'Deep Blue',bg:['#06283d','#075985'],accent:'#22d3ee',accent2:'#f0f9ff',player:'diver',goal:1000,asset:'../../assets/ocean-runner.svg'},
'deep-sea-survivor':{mode:'swim',title:'Deep Sea Survivor',tag:'Abyss',bg:['#020617','#164e63'],accent:'#67e8f9',accent2:'#a78bfa',player:'diver',goal:1000,asset:'../../assets/ocean-runner.svg'},
'neon-racer':{mode:'racer',title:'Neon Racer',tag:'Night Circuit',bg:['#10002b','#111827'],accent:'#22d3ee',accent2:'#f472b6',player:'car',goal:1000,asset:'../../assets/neon-racer.svg'},
'cyber-drift':{mode:'racer',title:'Cyber Drift',tag:'Future Grid',bg:['#020617','#1e1b4b'],accent:'#a78bfa',accent2:'#22d3ee',player:'car',goal:1000,asset:'../../assets/neon-racer.svg'},
'space-defender':{mode:'shooter',title:'Space Defender',tag:'Earth Shield',bg:['#020617','#172554'],accent:'#60a5fa',accent2:'#f472b6',player:'ship',goal:1000,asset:'../../assets/space-defender.svg'},
'galaxy-assault':{mode:'shooter',title:'Galaxy Assault',tag:'Star Front',bg:['#020617','#312e81'],accent:'#818cf8',accent2:'#fb7185',player:'ship',goal:1000,asset:'../../assets/space-defender.svg'},
'meteor-dodge':{mode:'shooter',title:'Meteor Dodge',tag:'Meteor Belt',bg:['#09090b','#451a03'],accent:'#fb923c',accent2:'#fef3c7',player:'ship',goal:1000,asset:'../../assets/space-defender.svg'},
'pixel-dash':{mode:'platform',title:'Pixel Dash',tag:'Pixel Kingdom',bg:['#111827','#312e81'],accent:'#c084fc',accent2:'#facc15',player:'pixel',goal:1000,asset:'../../assets/pixel-jump.svg'},
'pixel-jump':{mode:'platform',title:'Pixel Jump',tag:'Sky Blocks',bg:['#0f172a','#1d4ed8'],accent:'#60a5fa',accent2:'#facc15',player:'pixel',goal:1000,asset:'../../assets/pixel-jump.svg'},
'tower-climb':{mode:'platform',title:'Tower Climb',tag:'Clockwork Tower',bg:['#171717','#3f3f46'],accent:'#fbbf24',accent2:'#fb7185',player:'adventurer',goal:1000,asset:'../../assets/tower-climb.svg'},
'sky-tower':{mode:'platform',title:'Sky Tower',tag:'Cloud Summit',bg:['#082f49','#0369a1'],accent:'#e0f2fe',accent2:'#fbbf24',player:'adventurer',goal:1000,asset:'../../assets/tower-climb.svg'},
'ninja-slash':{mode:'slash',title:'Ninja Slash',tag:'Shadow Dojo',bg:['#09090b','#27272a'],accent:'#ef4444',accent2:'#f8fafc',player:'ninja',goal:1000,asset:'../../assets/mystic-forest.svg'},
'mystic-forest':{mode:'slash',title:'Mystic Forest',tag:'Spirit Grove',bg:['#052e16','#14532d'],accent:'#a3e635',accent2:'#c084fc',player:'ninja',goal:1000,asset:'../../assets/mystic-forest.svg'},
'fruit-catcher':{mode:'catcher',title:'Fruit Catcher',tag:'Sunny Orchard',bg:['#431407','#7c2d12'],accent:'#fb923c',accent2:'#4ade80',player:'basket',goal:1000,asset:'../../assets/forest-escape.svg'},
'gold-miner':{mode:'miner',title:'Gold Miner',tag:'Crystal Cavern',bg:['#18181b','#422006'],accent:'#facc15',accent2:'#a3e635',player:'miner',goal:1000,asset:'../../assets/tower-climb.svg'},
'bubble-pop':{mode:'bubble',title:'Bubble Pop',tag:'Candy Lagoon',bg:['#3b0764','#701a75'],accent:'#f0abfc',accent2:'#67e8f9',player:'mage',goal:1000,asset:'../../assets/bubble-pop.svg'},
'bubble-blitz':{mode:'bubble',title:'Bubble Blitz',tag:'Bubble Arena',bg:['#082f49','#164e63'],accent:'#22d3ee',accent2:'#f9a8d4',player:'mage',goal:1000,asset:'../../assets/bubble-pop.svg'},
'whack-mole':{mode:'whack',title:'Whack Mole',tag:'Garden Panic',bg:['#172554','#365314'],accent:'#84cc16',accent2:'#f59e0b',player:'hammer',goal:1000,asset:'../../assets/forest-escape.svg'},
'brick-breaker':{mode:'breaker',title:'Brick Breaker',tag:'Arcade Vault',bg:['#111827','#312e81'],accent:'#60a5fa',accent2:'#f472b6',player:'paddle',goal:1000,asset:'../../assets/space-defender.svg'},
'brick-storm':{mode:'breaker',title:'Brick Storm',tag:'Neon Blocks',bg:['#0f172a','#164e63'],accent:'#22d3ee',accent2:'#f97316',player:'paddle',goal:1000,asset:'../../assets/neon-racer.svg'},
'pong-duel':{mode:'pong',title:'Pong Duel',tag:'Cyber Arena',bg:['#020617','#1e293b'],accent:'#22d3ee',accent2:'#f43f5e',player:'paddle',goal:1000,asset:'../../assets/neon-racer.svg'},
'snake-arena':{mode:'snake',title:'Snake Arena',tag:'Neon Garden',bg:['#052e16','#064e3b'],accent:'#4ade80',accent2:'#facc15',player:'snake',goal:1000,asset:'../../assets/forest-escape.svg'},
'color-switch':{mode:'switch',title:'Color Switch',tag:'Chromatic Gate',bg:['#172554','#581c87'],accent:'#f472b6',accent2:'#22d3ee',player:'orb',goal:1000,asset:'../../assets/bubble-pop.svg'},
'memory-match':{mode:'memory',title:'Memory Match',tag:'Mind Palace',bg:['#0f172a','#312e81'],accent:'#a78bfa',accent2:'#facc15',player:'card',goal:1000,asset:'../../assets/pixel-jump.svg'},
'coin-rush':{mode:'runner',title:'Coin Rush',tag:'Treasure Highway',bg:['#172554','#78350f'],accent:'#fbbf24',accent2:'#22c55e',player:'runner',goal:1000,asset:'../../assets/coin-dash.svg'}
,'zombie-road':{mode:'shooter',title:'Zombie Road',tag:'Dead Highway',bg:['#09090b','#3f1d16'],accent:'#f97316',accent2:'#84cc16',player:'car',goal:1000,asset:'../../assets/neon-racer.svg'}
,'pirate-treasure':{mode:'slash',title:'Pirate Treasure',tag:'Skull Island',bg:['#082f49','#7c2d12'],accent:'#fbbf24',accent2:'#38bdf8',player:'adventurer',goal:1000,asset:'../../assets/forest-escape.svg'}
,'robot-factory':{mode:'platform',title:'Robot Factory',tag:'Steel Works',bg:['#111827','#334155'],accent:'#22d3ee',accent2:'#f97316',player:'robot',goal:1000,asset:'../../assets/tower-climb.svg'}

};

function drawCharacter(ctx,p,type,accent,accent2){
 ctx.save(); ctx.translate(p.x,p.y); const w=p.w||46,h=p.h||50; const t=performance.now()/180; const bob=Math.sin(t)*1.8; ctx.translate(0,bob);
 ctx.shadowColor=accent; ctx.shadowBlur=10;
 if(type==='ship'){
  ctx.fillStyle=accent;ctx.beginPath();ctx.moveTo(w/2,0);ctx.quadraticCurveTo(w-2,18,w-5,h);ctx.lineTo(w/2,h-10);ctx.lineTo(5,h);ctx.quadraticCurveTo(2,18,w/2,0);ctx.fill();
  ctx.shadowBlur=0;ctx.fillStyle='#e0f2fe';ctx.beginPath();ctx.ellipse(w/2,18,7,10,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=accent2;ctx.fillRect(6,h-5,11,6);ctx.fillRect(w-17,h-5,11,6);
 } else if(type==='car'){
  ctx.fillStyle='#0b1020';ctx.roundRect(1,15,w-2,h-15,10);ctx.fill();ctx.fillStyle=accent;ctx.roundRect(5,10,w-10,h-13,9);ctx.fill();ctx.fillStyle=accent2;ctx.roundRect(12,3,w-24,16,6);ctx.fill();
  ctx.fillStyle='#dff8ff';ctx.fillRect(14,7,7,7);ctx.fillRect(w-21,7,7,7);ctx.fillStyle='#05070d';ctx.fillRect(3,h-6,11,7);ctx.fillRect(w-14,h-6,11,7);
 } else if(type==='ninja'){
  ctx.shadowBlur=0;ctx.fillStyle='#111318';ctx.beginPath();ctx.arc(w/2,13,12,0,Math.PI*2);ctx.fill();ctx.fillStyle=accent;ctx.fillRect(3,15,w-6,8);ctx.fillStyle='#fff';ctx.fillRect(11,18,5,2);ctx.fillRect(w-16,18,5,2);ctx.fillStyle='#252831';ctx.roundRect(8,24,w-16,21,7);ctx.fill();ctx.strokeStyle=accent2;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(w-1,26);ctx.lineTo(w+10,14);ctx.stroke();
 } else if(type==='basket'){
  ctx.shadowBlur=0;ctx.fillStyle=accent;ctx.beginPath();ctx.arc(w/2,12,11,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f8d7b0';ctx.beginPath();ctx.arc(w/2,14,7,0,Math.PI*2);ctx.fill();ctx.fillStyle=accent2;ctx.roundRect(7,23,w-14,20,7);ctx.fill();ctx.strokeStyle=accent;ctx.lineWidth=4;ctx.beginPath();ctx.arc(w/2,28,18,Math.PI,0);ctx.stroke();
 } else if(type==='miner'){
  ctx.shadowBlur=0;ctx.fillStyle='#f6c453';ctx.beginPath();ctx.arc(w/2,14,11,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f7d3ad';ctx.beginPath();ctx.arc(w/2,17,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#facc15';ctx.roundRect(4,5,w-8,7,5);ctx.fill();ctx.fillStyle=accent;ctx.roundRect(8,25,w-16,18,7);ctx.fill();
 } else if(type==='hammer'){
  ctx.shadowBlur=0;ctx.fillStyle='#f3c9a5';ctx.beginPath();ctx.arc(w/2,15,10,0,Math.PI*2);ctx.fill();ctx.fillStyle=accent;ctx.roundRect(8,25,w-16,19,7);ctx.fill();ctx.fillStyle='#9ca3af';ctx.roundRect(w-1,3,10,20,3);ctx.fill();ctx.fillStyle='#78350f';ctx.fillRect(w+3,20,5,20);
 else if(type==='robot'){
  ctx.shadowBlur=0;ctx.fillStyle=accent;ctx.roundRect(6,14,w-12,h-16,7);ctx.fill();
  ctx.fillStyle='#dbeafe';ctx.fillRect(12,22,w-24,13);
  ctx.fillStyle='#0f172a';ctx.fillRect(16,26,5,5);ctx.fillRect(w-21,26,5,5);
  ctx.fillStyle=accent2;ctx.fillRect(17,4,12,9);ctx.fillRect(10,0,5,10);ctx.fillRect(w-15,0,5,10);
 } else {
  ctx.shadowBlur=0;ctx.fillStyle=accent;ctx.beginPath();ctx.arc(w/2,14,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f4c7a1';ctx.beginPath();ctx.arc(w/2,16,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#111827';ctx.fillRect(11,11,6,3);ctx.fillRect(w-17,11,6,3);ctx.fillStyle=accent2;ctx.roundRect(7,25,w-14,19,7);ctx.fill();ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(11,43);ctx.lineTo(8,49);ctx.moveTo(w-11,43);ctx.lineTo(w-8,49);ctx.stroke();
 }
 ctx.restore();
}

export function mountArcadeGame(id){const c=themes[id]||themes['coin-dash'];const root=document.querySelector('#game-root');const ui=mountGameTemplate(root,{title:c.title,version:'2D GAMES • FOUNDATION ENGINE',instructions:'التحكم: الأسهم / WASD أو الماوس — اسحب على اللعبة للموبايل. اجمع العناصر وتجنب الأخطار.',backHref:'../../index.html'});const canvas=ui.canvas,ctx=canvas.getContext('2d');const input=new Input(); const actions=new InputMap(); actions.bind('boost','shift','b'); const platformer=new PlatformerPhysics(); const combat=new CombatSystem(); const effects=new StatusEffects(); const spawner=new SpawnManager({maxAlive:18}); const assets=new AssetManager();const particles=new Particles(),audio=ui.audio,save=new SaveStore(id);const difficulty=new DifficultyManager('NORMAL');const levels=new LevelManager([{score:0,speed:1},{score:200,speed:1.08},{score:450,speed:1.18},{score:700,speed:1.3},{score:1000,speed:1.45}]);const timer=new GameTimer(120);const powerups=new PowerUpManager(),combo=new ComboManager(),shake=new ScreenShake();const movement=new MovementController({input,speed:420,mouseFollow:true,mouseSpeed:1000});
 const p={x:380,y:410,w:44,h:46,vx:0,vy:0,onGround:true,jumpsLeft:1,attack:0,boost:0};const objects=[];const shots=[];const state={spawn:0,spawnPU:8,goal:c.goal,particles:[],flash:0,theme:c.mode,selected:null,cardA:null,cardB:null,anim:0,bg:null};
 const bgImage=assets.image(c.asset); bgImage.onload=()=>{state.bg=bgImage};
 const rand=(a,b)=>Math.random()*(b-a)+a; const reset=e=>{p.x=e.width/2-p.w/2;p.y=e.height-p.h-28;p.vx=p.vy=0;p.onGround=true;p.jumpsLeft=1;p.attack=0;p.boost=0;objects.length=0;shots.length=0;state.spawn=.2;state.spawnPU=7;state.flash=0;powerups.reset();combo.reset();shake.time=0;shake.power=0;e.setLives(3);if(c.mode==='memory'){state.cardA=null;state.cardB=null}};
 function addObj(o){objects.push(o)} function hitEffect(x,y){particles.burst(x,y,20);shake.trigger(7,.16);audio.hit();state.flash=.15}
 function collect(e,o,pts=40){o.dead=true;combo.hit();e.addScore(Math.round(pts*combo.multiplier));particles.burst(o.x,o.y,15);audio.coin()}
 function spawn(e){const m=c.mode;if(['runner','racer','swim','platform','shooter'].includes(m)){if(m==='shooter')addObj({x:rand(30,e.width-60),y:-40,w:38,h:38,vy:rand(120,210),kind:'meteor'});else addObj({x:rand(45,e.width-65),y:-35,w:28,h:28,vy:rand(120,210),kind:'hazard'});addObj({x:rand(40,e.width-60),y:rand(70,e.height-100),w:22,h:22,vy:rand(30,80),kind:'coin'})}}
 function spawnPower(e){powerups.spawn('boost',rand(50,e.width-50),rand(80,e.height-80),6)}
 function updateCommon(dt,e){state.spawn-=dt;state.spawnPU-=dt;state.flash=Math.max(0,state.flash-dt);if(state.spawn<=0){spawn(e);state.spawn=Math.max(.38,1.0-e.level*.07)*difficulty.spawn/levels.data.speed}if(state.spawnPU<=0){spawnPower(e);state.spawnPU=12}for(const o of objects){o.y+=(o.vy||0)*dt;if(o.kind==='hazard'||o.kind==='meteor')o.vy+=(e.level*4)*dt}for(let i=objects.length-1;i>=0;i--)if(objects[i].y>e.height+60||objects[i].dead)objects.splice(i,1);for(let i=shots.length-1;i>=0;i--){shots[i].y-=620*dt;if(shots[i].y<-20)shots.splice(i,1)}
 }
 const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
 const engine=new GameEngine({canvas,input,systems:{particles,audio,levels,timer,powerups,combo,shake},config:{lives:3,timer:120},hooks:{reset,start:()=>audio.unlock(),pause:()=>audio.pause(),resume:()=>audio.resume(),score:s=>{if(s>save.get('best',0))save.set('best',Math.floor(s))},gameOver:e=>save.set('best',Math.max(save.get('best',0),Math.floor(e.score))),win:e=>save.set('best',Math.max(save.get('best',0),Math.floor(e.score))),timerExpired:e=>e.gameOver(),update(dt,e){
   if(actions.isDown(input,'pause'))e.pause(); effects.update(dt);const m=c.mode;
   if(m==='runner'||m==='racer'||m==='swim'||m==='platform'){
   const speed=(m==='racer'&&p.boost>0)?650:420;
   movement.axisX(p,dt,20,e.width-p.w-20,speed);
   if(!input.hasKeyboardMovement()&&!input.isMouseDown)movement.move(p,dt,e.width,e.height);
   if(m==='racer' && (actions.isDown(input,'boost')||input.isDown('shift')||input.isDown(' '))) p.boost=Math.min(1.2,p.boost+dt);
   else p.boost=Math.max(0,p.boost-dt*.8);
   if(m==='platform'){
     const ax=actions.axis(input); platformer.update(p,dt,{left:ax.x<0,right:ax.x>0,jump:actions.isDown(input,'jump'),groundY:e.height-78,minX:20,maxX:e.width-20});
   }else if(m==='swim'){
     p.vy+=(input.isDown('ArrowUp','w')?-320:120)*dt;
     if(input.isDown('ArrowDown','s'))p.vy+=220*dt;
     p.vy=Math.max(-260,Math.min(260,p.vy));p.y+=p.vy*dt;p.y=Math.max(20,Math.min(e.height-p.h-18,p.y));
   }else{p.y=Math.max(20,Math.min(e.height-p.h-18,p.y))}
 }
   else if(m==='shooter'){movement.move(p,dt,e.width,e.height);if(input.isMouseDown||input.isDown(' ')){shots.push({x:p.x+p.w/2,y:p.y});audio.beep({frequency:620,duration:.03});}}
   else if(m==='slash'){
   movement.axisX(p,dt,20,e.width-p.w-20,440);
   if(!input.hasKeyboardMovement()&&!input.isMouseDown)movement.move(p,dt,e.width,e.height);
   p.attack=Math.max(0,p.attack-dt);
   if((input.isDown(' ','j','k')||input.isMouseDown)&&p.attack<=0){p.attack=.28;audio.beep({frequency:760,duration:.06});particles.burst(p.x+p.w/2,p.y+p.h/2,8);for(const o of objects)if(!o.dead&&Math.abs((o.x+o.w/2)-(p.x+p.w/2))<85){o.dead=true;collect(e,o,75)}}
 }else if(m==='catcher'||m==='miner'||m==='bubble'||m==='whack'||m==='breaker'||m==='pong'||m==='snake'||m==='switch'||m==='memory'){movement.axisX(p,dt,20,e.width-p.w-20,460);if(!input.hasKeyboardMovement())movement.move(p,dt,e.width,e.height)}
   updateCommon(dt,e);
   for(const o of objects){if(o.kind==='coin'&&overlap(p,o))collect(e,o,40);else if((o.kind==='hazard'||o.kind==='meteor')&&overlap(p,o)){o.dead=true;hitEffect(p.x+p.w/2,p.y+p.h/2);e.loseLife();combo.reset()}}
   for(const s of shots)for(const o of objects)if(o.kind==='meteor'&&!o.dead&&s.x>o.x&&s.x<o.x+o.w&&s.y<o.y+o.h&&s.y>o.y){o.dead=true;s.y=-100;collect(e,o,55)}
   for(const q of powerups.items){if(!q.dead&&Math.hypot(p.x+p.w/2-q.x,p.y+p.h/2-q.y)<30){q.dead=true;powerups.collect('boost',6);e.addScore(70);audio.powerup?.();particles.burst(q.x,q.y,25)}}powerups.items=powerups.items.filter(q=>!q.dead);
   if(e.score>=state.goal)e.win();
   hud(e)
 },draw(c2,e){drawScene(c2,e)},}});function hud(e){ui.score.textContent=Math.floor(e.score);ui.lives.textContent='❤️'.repeat(e.lives)+'🖤'.repeat(3-e.lives);ui.best.textContent=Math.floor(Math.max(e.bestScore,save.get('best',0)));ui.level.textContent=e.level;ui.timer.textContent=Math.ceil(timer.remaining);ui.combo.textContent='x'+combo.multiplier;ui.state.textContent=e.state.toUpperCase();ui.status.textContent=e.state===GAME_STATES.PLAYING?'PLAYING':e.state.toUpperCase();ui.pauseBtn.textContent=e.state===GAME_STATES.PAUSED?'متابعة':'إيقاف مؤقت';ui.pauseBtn.disabled=!([GAME_STATES.PLAYING,GAME_STATES.PAUSED].includes(e.state))}
 function drawScene(g,e){const w=800,h=500;const grad=g.createLinearGradient(0,0,0,h);grad.addColorStop(0,c.bg[0]);grad.addColorStop(1,c.bg[1]);g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,w,h);g.fillStyle=grad;g.fillRect(0,0,w,h);if(state.bg){g.save();g.globalAlpha=.28;g.drawImage(state.bg,0,0,w,h);g.restore();}g.save();const off=shake.offset();g.translate(off.x,off.y);
   // environment layers
   g.globalAlpha=.16;
   if(c.mode==='runner'){g.fillStyle=c.accent;for(let i=0;i<9;i++){const bx=(i*103+30)%w;g.fillRect(bx,300-(i%3)*34,62+(i%4)*18,200);g.fillStyle=c.accent2;g.fillRect(bx+12,320-(i%3)*34,7,10);g.fillRect(bx+28,320-(i%3)*34,7,10);g.fillStyle=c.accent;}}
   if(c.mode==='swim'){g.strokeStyle=c.accent;g.lineWidth=2;for(let y=80;y<h;y+=46){g.beginPath();for(let x=0;x<w;x+=30)g.quadraticCurveTo(x+8,y-7,x+16,y);g.stroke();}}
   if(c.mode==='shooter'){for(let i=0;i<7;i++){g.fillStyle=i%2?c.accent:c.accent2;g.beginPath();g.arc((i*137+70)%w,70+(i*83)%360,18+(i%3)*8,0,Math.PI*2);g.fill();}}
   if(c.mode==='platform'){g.fillStyle=c.accent2;for(let i=0;i<7;i++){g.fillRect((i*137)%w,380-(i%4)*58,100,10);}}
   if(c.mode==='racer'){g.fillStyle=c.accent2;for(let i=0;i<12;i++)g.fillRect((i*79)%w,40+(i*57)%h,3,3);}
   g.globalAlpha=.22;for(let i=0;i<14;i++){g.fillStyle=c.accent;g.beginPath();g.arc((i*83+e.elapsed*18)%860,80+(i%5)*70,2+(i%3),0,Math.PI*2);g.fill()}g.globalAlpha=1;
   if(c.mode==='runner'||c.mode==='racer'){g.fillStyle='rgba(15,23,42,.65)';g.fillRect(120,0,560,h);g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=4;g.setLineDash([24,22]);g.lineDashOffset=-(e.elapsed*160);g.beginPath();g.moveTo(300,0);g.lineTo(300,h);g.moveTo(500,0);g.lineTo(500,h);g.stroke();g.setLineDash([])}
   if(c.mode==='swim'){g.fillStyle='rgba(34,211,238,.12)';for(let y=70;y<h;y+=70)g.fillRect(0,y,w,2)}
   if(c.mode==='platform'){g.fillStyle='rgba(255,255,255,.1)';for(let y=90;y<h;y+=95){for(let x=(y%140)-30;x<w;x+=150)g.fillRect(x,y,100,8)}}
   if(c.mode==='shooter'){g.fillStyle='rgba(96,165,250,.12)';g.beginPath();g.arc(400,250,170,0,Math.PI*2);g.fill()}
   for(const q of powerups.items){g.fillStyle=c.accent2;g.beginPath();g.arc(q.x,q.y,14+Math.sin(e.elapsed*7)*2,0,Math.PI*2);g.fill();g.fillStyle='#111827';g.font='bold 16px system-ui';g.textAlign='center';g.fillText('⚡',q.x,q.y+6)}
   for(const o of objects){if(o.kind==='coin'){g.fillStyle=c.accent2;g.beginPath();g.arc(o.x,o.y,11,0,Math.PI*2);g.fill();g.fillStyle='#fff7ed';g.beginPath();g.arc(o.x-3,o.y-3,3,0,Math.PI*2);g.fill()}else if(o.kind==='hazard'||o.kind==='meteor'){g.fillStyle=c.accent2;g.beginPath();g.arc(o.x+o.w/2,o.y+o.h/2,o.w/2,0,Math.PI*2);g.fill();g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.arc(o.x+o.w*.35,o.y+o.h*.35,o.w*.16,0,Math.PI*2);g.fill()}}
   for(const s of shots){g.fillStyle=c.accent;g.fillRect(s.x-2,s.y,4,18)}drawCharacter(g,p,c.player,c.accent,c.accent2);particles.draw(g);g.restore();if(state.flash>0){g.fillStyle='rgba(255,80,80,.12)';g.fillRect(0,0,w,h)}if(e.state!==GAME_STATES.PLAYING){g.fillStyle='rgba(2,6,23,.58)';g.fillRect(0,0,w,h);g.textAlign='center';g.fillStyle='#fff';g.font='800 38px system-ui';g.fillText(e.state===GAME_STATES.START?c.title:e.state===GAME_STATES.GAME_OVER?'GAME OVER':e.state===GAME_STATES.WON?'YOU WIN':'PAUSED',w/2,235);g.font='16px system-ui';g.fillStyle=c.accent;g.fillText(c.tag,w/2,266);g.textAlign='left'}}
 input.attachPointer(canvas,{mouse:true,touch:true});const begin=()=>{if([GAME_STATES.START,GAME_STATES.GAME_OVER,GAME_STATES.WON].includes(engine.state)){audio.unlock();engine.start()}};ui.startBtn.addEventListener('click',begin);ui.restartBtn.addEventListener('click',()=>engine.restart());ui.pauseBtn.addEventListener('click',()=>engine.state===GAME_STATES.PLAYING?engine.pause():engine.resume());canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;begin()},{passive:true});window.addEventListener('keydown',e=>{if(e.key==='Enter')begin();if(e.key.toLowerCase()==='r')engine.restart();if(e.code==='Space'){e.preventDefault();engine.state===GAME_STATES.PLAYING?engine.pause():engine.resume()}});engine.bestScore=save.get('best',0);engine.resize();engine.render();}
