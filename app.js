const TEST={title:'Engine Test Lab',desc:'اختبار المحرك الداخلي: الحركة، الإدخال، الحالات، الصوت، الحفظ، التصادم، الجسيمات وScreen Shake.',href:'games/_engine-test/index.html'};
const grid=document.querySelector('#game-grid');
if(grid){grid.innerHTML=`<article class="card"><img src="assets/hero.svg" alt="Engine Test Lab"><div class="card-body"><h3>${TEST.title}</h3><p>${TEST.desc}</p><a href="${TEST.href}">افتح الاختبار</a></div></article>`;}
const cats=document.querySelector('#cats');
if(cats){cats.innerHTML='<div class="cat"><span>🧪</span>اختبار المحرك</div>';}
const scores=document.querySelector('#scores-list');
if(scores){scores.innerHTML='<li><b>Engine Test Lab</b> — اختبار داخلي فقط</li>';}
