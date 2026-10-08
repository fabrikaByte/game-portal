const GAMES=[
{id:'coin-dash',title:'Coin Dash',cat:'أركيد',desc:'اجمع العملات وراوغ حركة المرور في مدينة نيون.',icon:'assets/coin-dash.svg'},
{id:'jungle-run',title:'Jungle Run',cat:'مغامرات',desc:'جري لا نهائي وقفزات سريعة وسط الغابة.',icon:'assets/jungle-run.svg'},
{id:'neon-racer',title:'Neon Racer',cat:'سباقات',desc:'سباق نيون بثلاث حارات وBoost سريع.',icon:'assets/neon-racer.svg'},
{id:'space-defender',title:'Space Defender',cat:'إطلاق نار',desc:'دافع عن الأرض بالتصويب والطلقات الموجهة.',icon:'assets/space-defender.svg'},
{id:'tower-climb',title:'Tower Climb',cat:'مهارة',desc:'منصات عمودية وقفزات وصعود متواصل.',icon:'assets/tower-climb.svg'},
{id:'bubble-pop',title:'Bubble Pop',cat:'ألغاز',desc:'أطلق الفقاعات وطابق الألوان على السقف.',icon:'assets/bubble-pop.svg'},
{id:'dungeon-quest',title:'Dungeon Quest',cat:'مغامرات',desc:'مغامرة Tilemap بمفتاح وحراس وبوابة.',icon:'assets/dungeon-quest.svg'},
{id:'memory-match',title:'Memory Match',cat:'ألغاز',desc:'طابق البطاقات واكشف كل الأزواج.',icon:'assets/memory-match.svg'},
{id:'pong-duel',title:'Pong Duel',cat:'رياضة',desc:'مباراة كلاسيكية ضد الكمبيوتر حتى 5 نقاط.',icon:'assets/pong-duel.svg'},
{id:'whack-mole',title:'Whack Mole',cat:'مهارة',desc:'اختبار رد فعل سريع ضد الخلد والقنابل.',icon:'assets/whack-mole.svg'}];
const grid=document.querySelector('#game-grid');grid.innerHTML=GAMES.map(g=>`<article class="card" data-title="${g.title.toLowerCase()}" data-cat="${g.cat}"><img src="${g.icon}" alt="${g.title}"><div class="card-body"><h3>${g.title}</h3><p>${g.desc}</p><a href="games/${g.id}/index.html">العب الآن</a></div></article>`).join('');
const cats=[...new Set(GAMES.map(g=>g.cat))];document.querySelector('#cats').innerHTML=cats.map(c=>`<div class="cat"><span>🎮</span>${c}</div>`).join('');
document.querySelector('#scores-list').innerHTML=GAMES.slice(0,5).map((g,i)=>`<li><b>${i+1}. ${g.title}</b> — أفضل نتيجة محليًا</li>`).join('');
const search=document.querySelector('#search');search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();document.querySelectorAll('.card').forEach(c=>c.style.display=(!q||c.dataset.title.includes(q)||c.dataset.cat.includes(q))?'block':'none')});
