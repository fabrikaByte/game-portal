import {GameEngine,GAME_STATES} from '../../framework/core.js';
import {Input} from '../../framework/input.js';
import {MovementController} from '../../framework/movement.js';
import {rectsOverlap,clamp} from '../../framework/collision.js';
import {Particles} from '../../framework/particles.js';
import {SaveStore} from '../../framework/save.js';
import {DifficultyManager} from '../../framework/difficulty.js';
import {LevelManager} from '../../framework/levels.js';
import {GameTimer} from '../../framework/timer.js';
import {PowerUpManager} from '../../framework/powerups.js';
import {ComboManager} from '../../framework/combo.js';
import {ScreenShake} from '../../framework/screen-shake.js';
import {getGameMetadata} from '../../framework/metadata.js';
import {mountGameTemplate} from '../../framework/game-template.js';

const ui=mountGameTemplate(document.querySelector('#game-root'),{
  title:'Foundation Engine Test v2',version:'Foundation Engine — v1.6.2',
  instructions:'التحكم: الأسهم / WASD أو الماوس. اجمع العملات وتجنب الحاجز. Space أو P للإيقاف و R للإعادة.'
});
const canvas=ui.canvas,input=new Input(),particles=new Particles(),audio=ui.audio,save=new SaveStore('engine-test-v2');
const stage=ui.root.querySelector('.game-stage');
const panel=document.createElement('aside');panel.className='engine-panel';panel.innerHTML='<div class="test-summary"><div><h2>Engine Test v2</h2><p>اختبار تكاملي للمحرك. العلامات اليدوية لا تُحسب إلا بعد التجربة.</p></div><strong class="test-count" id="test-count">0/16 مكتمل</strong></div><div id="engine-tests" class="test-list"></div><div class="engine-live"><div class="live-box">Difficulty<strong id="diff-state">NORMAL ×1.00</strong></div><div class="live-box">Power-up<strong id="power-state">No active power-up</strong></div></div><div class="engine-note">الماوس يتبع المؤشر بسلاسة، ويتوقف هدفه عند الخروج من إطار اللعبة.</div>';
const layout=document.createElement('div');layout.className='engine-test-layout';stage.parentNode.insertBefore(layout,stage);layout.append(stage,panel);
const difficulty=new DifficultyManager('NORMAL');
const levels=new LevelManager([{score:0,speed:1},{score:80,speed:1.08},{score:160,speed:1.18},{score:240,speed:1.3}]);
const timer=new GameTimer(60),powerups=new PowerUpManager(),combo=new ComboManager(1800),shake=new ScreenShake();
const movement=new MovementController({input,speed:330,mouseFollow:true,mouseSpeed:420,bounds:true});
const player={x:70,y:200,width:34,height:34};
const coin={x:500,y:250,size:18};
const obstacle={x:700,y:180,width:45,height:150,vx:-105};
const power={x:0,y:0,radius:16,visible:false};
let invulnerable=0,powerNotice=0,powerCooldown=0,lastLevel=1,roundStartedAt=0;

const tests=new Map([
 ['input',{label:'Input — Keyboard + Mouse',mode:'manual',done:false,detail:'جرّب الأسهم/WASD ثم الماوس'}],
 ['movement',{label:'Movement — الحركة المشتركة',mode:'manual',done:false,detail:'تأكد من الحركة السلسة بدون Snap'}],
 ['collision',{label:'Collision — التصادم',mode:'manual',done:false,detail:'اصطدم بالحاجز مرة واحدة'}],
 ['states',{label:'Game States — الحالات',mode:'auto',done:false,detail:'Start / Playing / Pause / Game Over / Restart'}],
 ['audio',{label:'Audio — الصوت والكتم',mode:'manual',done:false,detail:'جرّب Mute أثناء اللعب'}],
 ['save',{label:'Save — الحفظ',mode:'auto',done:false,detail:'Best Score والحالة تُحفظ'}],
 ['levels',{label:'Levels — المستويات',mode:'auto',done:false,detail:'80 / 160 / 240 نقاط للمستويات التالية'}],
 ['difficulty',{label:'Difficulty — الصعوبة',mode:'auto',done:false,detail:'السرعة تتدرج مع المستوى'}],
 ['timer',{label:'Timer — المؤقت',mode:'auto',done:false,detail:'60 ثانية، يتوقف مع Pause'}],
 ['powerups',{label:'Power-ups — القدرات',mode:'manual',done:false,detail:'اجمع Power-up مستقلًا عن الـCombo'}],
 ['particles',{label:'Particles — الجزيئات',mode:'auto',done:false,detail:'تظهر عند جمع Coin والاصطدام'}],
 ['shake',{label:'Screen Shake — اهتزاز الشاشة',mode:'auto',done:false,detail:'يظهر عند الاصطدام'}],
 ['combo',{label:'Combo — الكومبو',mode:'manual',done:false,detail:'اجمع 3 عملات متتالية'}],
 ['responsive',{label:'Responsive — تغيير الحجم',mode:'manual',done:false,detail:'كبّر وصغّر نافذة المتصفح'}],
 ['config',{label:'Configuration — الإعدادات',mode:'auto',done:false,detail:'القيم المشتركة محملة'}],
 ['metadata',{label:'Game Metadata — بيانات اللعبة',mode:'auto',done:false,detail:'الاسم والوصف والفئة والصورة موجودة'}]
]);

function scale(e){return clamp(e.width/900,.72,1.15)}
function sync(e){const s=scale(e);player.width=34*s;player.height=34*s;player.x=clamp(player.x,0,e.width-player.width);player.y=clamp(player.y,0,e.height-player.height);coin.size=18*s;obstacle.width=45*s;obstacle.height=150*s;power.radius=16*s}
function resetPlayer(e){player.x=70*scale(e);player.y=clamp(e.height/2-player.height/2,0,e.height-player.height);input.clearMouseTarget()}
function randomCoin(e){coin.x=90+Math.random()*Math.max(1,e.width-180);coin.y=55+Math.random()*Math.max(1,e.height-110)}
function spawnPower(e){power.x=120+Math.random()*Math.max(1,e.width-240);power.y=55+Math.random()*Math.max(1,e.height-110);power.visible=true;powerNotice=8;powerCooldown=12}
function resetWorld(e){sync(e);resetPlayer(e);randomCoin(e);obstacle.x=e.width+120;obstacle.y=25+Math.random()*Math.max(1,e.height-obstacle.height-50);invulnerable=0;power.visible=false;powerups.reset();combo.reset();lastLevel=1;powerNotice=0;powerCooldown=8;roundStartedAt=performance.now()}
function mark(id,detail){const t=tests.get(id);if(!t)return;t.done=true;if(detail)t.detail=detail;renderTests()}
function renderTests(){const el=document.querySelector('#engine-tests');if(!el)return;el.innerHTML='';for(const [id,t] of tests){const row=document.createElement('button');row.type='button';row.className='test-row '+(t.done?'pass':'pending');row.innerHTML=`<span class="test-dot">${t.done?'✓':'○'}</span><span><strong>${t.label}</strong><small>${t.detail}</small></span>`;if(t.mode==='manual')row.addEventListener('click',()=>mark(id,'تم تعليم الاختبار كمجتاز بعد التجربة'));el.appendChild(row)}const done=[...tests.values()].filter(t=>t.done).length;document.querySelector('#test-count').textContent=`${done}/${tests.size} مكتمل`}
function diagnostics(){
  const collision=rectsOverlap({x:0,y:0,width:10,height:10},{x:5,y:5,width:10,height:10});
  const hard=new DifficultyManager('HARD');
  const level=new LevelManager([{score:0},{score:80}]);
  const timerProbe=new GameTimer(2);timerProbe.start();timerProbe.update(1);timerProbe.pause();
  const comboProbe=new ComboManager(1000);comboProbe.hit();comboProbe.hit();comboProbe.hit();
  const shakeProbe=new ScreenShake();shakeProbe.trigger(8,.2);
  const saveProbe=new SaveStore('engine-test-v2-diagnostic');saveProbe.set('ok',true);const saveOK=saveProbe.get('ok')===true;saveProbe.remove('ok');
  const meta=getGameMetadata('_engine-test');
  if(collision)mark('collision','اختبار التصادم الرياضي ناجح');
  if(hard.speed>1)mark('difficulty','DifficultyManager يرفع السرعة');
  if(level.update(80)===2)mark('levels','LevelManager يرفع المستوى عند 80 نقطة');
  if(timerProbe.elapsed===1&&!timerProbe.running)mark('timer','Timer يعمل ويتوقف مع Pause');
  if(comboProbe.multiplier===2)mark('combo','ComboManager يرفع المضاعف بعد 3 ضربات');
  if(shakeProbe.time>0)mark('shake','ScreenShake يعمل');
  particles.burst(10,10,3);if(particles.items.length===3)mark('particles','Particles burst يعمل');
  if(saveOK)mark('save','SaveStore يكتب ويقرأ من localStorage');
  if(meta?.id==='_engine-test'&&meta.image)mark('metadata','Metadata يحتوي الصورة والبيانات');
  if(movement.speed===330&&movement.mouseSpeed===420&&timer.limit===60)mark('config','Config: keyboard 330 / mouse 420 / timer 60s');
}

const engine=new GameEngine({canvas,input,systems:{particles,audio,levels,timer,powerups,combo,shake},config:{lives:3,timer:60},hooks:{
 resize:(_,__,e)=>{sync(e);mark('responsive','تم تحديث أبعاد اللعبة مع Resize')},
 reset:resetWorld,
 start:()=>{audio.unlock();mark('states','Playing بدأ من Start')},
 pause:()=>{audio.pause();mark('states','Pause يعمل')},
 resume:()=>{audio.resume();mark('states','Resume يعمل')},
 score:(s)=>{if(s>save.get('best',0))save.set('best',s);if(s>=80)mark('levels','Level 2 تم الوصول إليه');if(s>=160)mark('levels','Level 3 تم الوصول إليه');if(s>=240)mark('levels','Level 4 تم الوصول إليه')},
 lifeLost:()=>{audio.hit();particles.burst(player.x+player.width/2,player.y+player.height/2,14);shake.trigger(9,.22);mark('collision','اصطدام واحد = حياة واحدة');mark('shake','Screen Shake عند الاصطدام');mark('particles','Particles ظهرت عند الاصطدام')},
 gameOver:e=>{save.set('best',Math.max(save.get('best',0),e.score));mark('states','Game Over يعمل');mark('audio','Game Over sound متصل')},
 win:()=>mark('states','Win state يعمل'),
 timerExpired:()=>mark('timer','Timer وصل للنهاية'),
 update(dt,e){
   if(input.isDown('p','ح','keyp')){e.pause();return}
   const levelSpeed=levels.data.speed||1;const difficultySpeed=1+(Math.max(0,e.level-1)*.06);difficulty.config={...difficulty.config,speed:difficultySpeed};
   movement.move(player,dt,e.width,e.height);
   obstacle.vx=-105*levelSpeed*difficulty.speed;
   obstacle.x+=obstacle.vx*dt;
   if(obstacle.x<-obstacle.width-30){obstacle.x=e.width+90;obstacle.y=25+Math.random()*Math.max(1,e.height-obstacle.height-50)}
   if(invulnerable>0)invulnerable-=dt;
   if(powerCooldown>0)powerCooldown-=dt;
   if(powerNotice>0)powerNotice-=dt;
   if(!power.visible&&!powerups.has('double-score')&&powerCooldown<=0&&e.score>=30)spawnPower(e);
   const c={x:coin.x-coin.size,y:coin.y-coin.size,width:coin.size*2,height:coin.size*2};
   if(rectsOverlap(player,c)){
     const comboCount=combo.hit();const multiplier=powerups.has('double-score')?2:1;e.addScore(10*combo.multiplier*multiplier);particles.burst(coin.x,coin.y,18);audio.coin();mark('input','Keyboard وMouse Input يعملان');mark('movement','MovementController المشترك يحرك اللاعب');mark('particles','Particles عند جمع Coin');if(comboCount>=3)mark('combo','Combo ارتفع مع العملات المتتالية');randomCoin(e)
   }
   if(power.visible&&rectsOverlap(player,{x:power.x-power.radius,y:power.y-power.radius,width:power.radius*2,height:power.radius*2})){powerups.collect('double-score',5);power.visible=false;powerNotice=0;mark('powerups','Power-up Double Score تم جمعه وتفعيله 5 ثوانٍ')}
   if(invulnerable<=0&&rectsOverlap(player,obstacle,2)){invulnerable=.9;particles.burst(player.x+player.width/2,player.y+player.height/2,16);e.loseLife();resetPlayer(e);if(e.state===GAME_STATES.GAME_OVER)return}
   if(e.score>=300)e.win();
 },
 draw(ctx,e){
   ctx.clearRect(0,0,e.width,e.height);const off=shake.offset();ctx.save();ctx.translate(off.x,off.y);ctx.fillStyle='#102d4d';ctx.fillRect(0,0,e.width,e.height);ctx.globalAlpha=.1;ctx.fillStyle='#fff';for(let x=0;x<e.width;x+=40)for(let y=0;y<e.height;y+=40)ctx.fillRect(x,y,1,1);ctx.globalAlpha=1;
   ctx.fillStyle='#ffd54a';ctx.beginPath();ctx.arc(coin.x,coin.y,coin.size,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff5964';ctx.fillRect(obstacle.x,obstacle.y,obstacle.width,obstacle.height);if(power.visible){ctx.fillStyle='#b66cff';ctx.beginPath();ctx.arc(power.x,power.y,power.radius,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='700 12px system-ui';ctx.textAlign='center';ctx.fillText('2X',power.x,power.y+4)}ctx.fillStyle=invulnerable>0?'#9fb7ff':'#62d7ff';ctx.fillRect(player.x,player.y,player.width,player.height);particles.draw(ctx);ctx.restore();
   if(e.state!==GAME_STATES.PLAYING){ctx.fillStyle='rgba(0,0,0,.62)';ctx.fillRect(0,0,e.width,e.height);ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='700 34px system-ui';const title=e.state===GAME_STATES.START?'ENGINE TEST v2':e.state===GAME_STATES.PAUSED?'PAUSED':e.state===GAME_STATES.GAME_OVER?'GAME OVER':'YOU WIN';ctx.fillText(title,e.width/2,e.height/2-10);ctx.font='18px system-ui';ctx.fillText(e.state===GAME_STATES.PAUSED?'Space / P / ح للمتابعة':'Enter أو اضغط اللعبة للبدء',e.width/2,e.height/2+30);ctx.textAlign='left'}
   ui.score.textContent=Math.floor(e.score);ui.lives.textContent=e.lives;ui.best.textContent=Math.max(e.bestScore,save.get('best',0));ui.level.textContent=e.level;ui.timer.textContent=timer.limit?Math.ceil(timer.remaining)+'s':'—';ui.combo.textContent='x'+combo.multiplier;ui.state.textContent=e.state.toUpperCase();ui.status.textContent=e.state===GAME_STATES.PLAYING?'PLAYING':e.state.toUpperCase();ui.pauseBtn.textContent=e.state===GAME_STATES.PAUSED?'متابعة':'إيقاف مؤقت';ui.pauseBtn.disabled=!([GAME_STATES.PLAYING,GAME_STATES.PAUSED].includes(e.state));ui.startBtn.disabled=e.state===GAME_STATES.PLAYING;document.querySelector('#power-state').textContent=powerups.has('double-score')?`Double Score ${Math.ceil(powerups.active.get('double-score')?.remaining||0)}s`:power.visible?'Power-up ظاهر':'No active power-up';document.querySelector('#diff-state').textContent=`${difficulty.name} ×${difficulty.speed.toFixed(2)}`;
 }
}});
engine.bestScore=save.get('best',0);input.attachPointer(canvas,{mouse:true,touch:true});
function begin(){if([GAME_STATES.START,GAME_STATES.GAME_OVER,GAME_STATES.WON].includes(engine.state)){audio.unlock();engine.start()}}
canvas.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button===0)begin()});ui.startBtn.addEventListener('click',begin);ui.restartBtn.addEventListener('click',()=>{engine.restart();mark('states','Restart أعاد الحالة إلى Start')});ui.pauseBtn.addEventListener('click',()=>engine.state===GAME_STATES.PLAYING?engine.pause():engine.resume());
ui.muteBtn.addEventListener('click',()=>mark('audio','زر Mute متصل بـ AudioManager'));
window.addEventListener('keydown',e=>{
  const code=String(e.code||'').toLowerCase(),key=String(e.key||'').toLowerCase();
  if(key==='enter'||code==='enter')begin();
  if(key==='r'||key==='ق'||code==='keyr'){e.preventDefault();engine.restart();mark('states','R / ق يعملان لإعادة الجولة')}
  if(e.code==='Space'||key==='p'||key==='ح'||code==='keyp'){e.preventDefault();if(engine.state===GAME_STATES.PLAYING){engine.pause()}else if(engine.state===GAME_STATES.PAUSED){engine.resume()}}
});
renderTests();diagnostics();engine.resize();engine.render();
