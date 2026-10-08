import {AudioManager} from './audio.js';
import {GAME_STATES} from './core.js';
export function mountGameShell(root,{title,tagline,controls,theme='#22d3ee',backHref='../../index.html',labels={}}){
  if(!root)throw new Error('game root missing');
  root.style.setProperty('--game-accent',theme);
  root.innerHTML=`<div class="game-shell"><header class="game-header"><a class="back" href="${backHref}">← الألعاب</a><div><span class="eyebrow">${tagline}</span><h1>${title}</h1></div><span class="live" id="status">جاهز</span></header><section class="hud"><div><span>${labels.score||'النتيجة'}</span><b id="score">0</b></div><div><span>${labels.best||'الأفضل'}</span><b id="best">0</b></div><div><span>${labels.level||'المستوى'}</span><b id="level">1</b></div><div><span>${labels.timer||'الوقت'}</span><b id="timer">—</b></div><div><span>${labels.extra||'الحالة'}</span><b id="extra">جاهز</b></div></section><section class="stage"><div class="canvas-frame"><canvas id="game" aria-label="${title}"></canvas></div><div class="controls"><button id="start">ابدأ</button><button id="pause">إيقاف مؤقت</button><button id="restart">إعادة</button><button id="mute">صوت</button></div><p class="hint">${controls}</p></section></div>`;
  const audio=new AudioManager(); const q=s=>root.querySelector(s); const ui={root,canvas:q('#game'),status:q('#status'),score:q('#score'),best:q('#best'),level:q('#level'),timer:q('#timer'),extra:q('#extra'),start:q('#start'),pause:q('#pause'),restart:q('#restart'),mute:q('#mute'),audio};
  ui.mute.addEventListener('click',()=>{audio.toggle();ui.mute.textContent=audio.enabled?'صوت':'كتم'});
  ui.pause.disabled=true;
  return ui;
}
export function syncShell(ui,e,extra='—'){
  ui.score.textContent=Math.floor(e.score);ui.best.textContent=Math.floor(e.bestScore);ui.level.textContent=e.level;ui.timer.textContent=e.timeLeft>0?Math.ceil(e.timeLeft):'∞';ui.extra.textContent=extra;
  ui.status.textContent=e.state===GAME_STATES.PLAYING?'يعمل':e.state===GAME_STATES.PAUSED?'متوقف':e.state===GAME_STATES.WON?'فوز':e.state===GAME_STATES.GAME_OVER?'انتهت':'جاهز';
  ui.start.disabled=e.state===GAME_STATES.PLAYING;ui.pause.disabled=![GAME_STATES.PLAYING,GAME_STATES.PAUSED].includes(e.state);ui.pause.textContent=e.state===GAME_STATES.PAUSED?'متابعة':'إيقاف مؤقت';
}
export function bindShell(ui,e){const begin=()=>{if(e.state!==GAME_STATES.PLAYING){e.start()}};ui.start.addEventListener('click',begin);ui.restart.addEventListener('click',()=>e.restart());ui.pause.addEventListener('click',()=>e.state===GAME_STATES.PLAYING?e.pause():e.resume());ui.canvas.addEventListener('pointerdown',()=>{if(e.state===GAME_STATES.START)begin()});window.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&e.state===GAME_STATES.START)begin();if(ev.key.toLowerCase()==='r')e.restart();if(ev.code==='Space'){ev.preventDefault();if(e.state===GAME_STATES.PLAYING)e.pause();else if(e.state===GAME_STATES.PAUSED)e.resume()}})}
