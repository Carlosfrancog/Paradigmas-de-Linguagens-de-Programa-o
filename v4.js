/* V4: progressive enhancement, no dependencies. */
(()=>{'use strict';
const q=s=>document.querySelector(s), all=s=>[...document.querySelectorAll(s)], escapeHTML=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const store=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const set=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
const shuffleSafe=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
let level=localStorage.getItem('plp-difficulty-v4')||'mix';
q('#v4QuizControls').innerHTML=`<span>Configuração da prova</span><div class="v4-levels"><button data-level="mix">Mista</button><button data-level="easy">Fundamentos</button><button data-level="medium">Aplicação</button><button data-level="hard">Desafio</button></div><p class="muted">Todas mantêm 10 questões e limite de 15 minutos. A dificuldade é uma classificação editorial do banco, não uma avaliação oficial.</p>`;
const assignDifficulty=x=>{const t=x.q.toLowerCase();if(/qual é|o que é|define|denomina|característica|exemplo|conceito/.test(t))return'easy';if(/código|saida|saída|resultado|analise|analise|subprograma|parâmetro|conversão/.test(t))return'hard';return'medium'};
window.plpQuizPool=bank=>{let pool=bank.filter(x=>level==='mix'||assignDifficulty(x)===level);if(pool.length<10)pool=bank;return shuffleSafe(pool).slice(0,10)};
function levelPaint(){all('[data-level]').forEach(b=>{b.classList.toggle('active',b.dataset.level===level);b.onclick=()=>{level=b.dataset.level;localStorage.setItem('plp-difficulty-v4',level);levelPaint()}})} levelPaint();
const skins=[{id:'neon',name:'Neon Genesis',desc:'Padrão cyberpunk',required:0},{id:'matrix',name:'Matrix Green',desc:'Desbloqueia com 2 desafios corretos',required:2},{id:'sunset',name:'Synth Sunset',desc:'Desbloqueia com 4 desafios corretos',required:4},{id:'ice',name:'Cryo Blue',desc:'Desbloqueia com 7 desafios corretos',required:7}];
let chosen=localStorage.getItem('plp-skin-v4')||'neon';
const unlockKey='plp-unlocks-v4';
function progressCount(){
 // Conquistas anteriores permanecem válidas, mesmo se o cooldown expirar.
 const old=store(unlockKey,[]);
 const correct=store('plp-lab-correct-ids',[]);
 const completed=store('plp-lab-completed-ids',[]);
 const legacy=Number(localStorage.getItem('plp-lab-ever-completed')||0);
 return Math.min(7,Math.max(Array.isArray(old)?old.length:0,Array.isArray(correct)?new Set(correct).size:0,Array.isArray(completed)?new Set(completed).size:0,Number.isFinite(legacy)?legacy:0));
}
function paintSkins(){
 const progress=progressCount();
 const old=store(unlockKey,[]);
 const previous=Array.isArray(old)?old.filter(n=>Number.isInteger(n)&&n>=0&&n<7):[];
 const unlocked=[...new Set([...previous,...Array.from({length:progress},(_,i)=>i)])].sort((a,b)=>a-b);
 if(unlocked.length!==previous.length)set(unlockKey,unlocked);
 if(!q('#v4Unlocks'))return;
 q('#v4Unlocks').innerHTML=`<div><p class="eyebrow">Oficina</p><h3>Temas visuais</h3><p class="muted">Resolva questões na Oficina para liberar novas aparências. O progresso não expira com o cooldown das perguntas.</p><span class="v4-count">${progress}/7 conquistas</span></div><div class="v4-skins">${skins.map(s=>{const locked=progress<s.required;return `<button type="button" class="v4-skin ${chosen===s.id?'active':''}" data-skin="${s.id}" ${locked?'disabled':''}><span class="v4-skin-preview skin-${s.id}"></span><strong>${escapeHTML(s.name)}</strong><small>${locked?'Bloqueada · '+escapeHTML(s.desc):chosen===s.id?'✓ Ativa':'Aplicar tema'}</small></button>`}).join('')}</div>`;
 all('[data-skin]').forEach(b=>b.onclick=()=>{chosen=b.dataset.skin;localStorage.setItem('plp-skin-v4',chosen);applySkin();paintSkins()});
}
function applySkin(){document.documentElement.dataset.skin=chosen}
applySkin();paintSkins();
window.addEventListener('plp:workshop-progress',paintSkins);
// Spaced repetition based on small, persisted scheduling intervals.
const FLASH_KEY='plp-flash-v4', intervals=[0,1,3,7,15,30];let review=store(FLASH_KEY,{}),flashIdx=0,flipped=false,flashTopic='all';
const notes=typeof QUICK_NOTES==='undefined'?[]:QUICK_NOTES;
q('#flashTopic').innerHTML='<option value="all">Todos os temas</option>'+TOPICS.map(t=>`<option value="${t.id}">${escapeHTML(t.label)}</option>`).join('');
function dueNotes(){const today=Date.now();return notes.map((n,i)=>({...n,i})).filter(n=>(flashTopic==='all'||n.topic===flashTopic)&&(!review[n.i]||review[n.i].due<=today))}
function drawFlash(){const due=dueNotes();if(!due.length){q('#flashDue').textContent='Revisão do dia concluída';q('#flashCard').innerHTML='<span class="v4-flash-kicker">// CHECKPOINT</span><strong>Tudo em dia!</strong><p>Volte quando novas revisões vencerem, ou altere o assunto.</p>';q('#flashActions').hidden=true;return}if(flashIdx>=due.length)flashIdx=0;const n=due[flashIdx];q('#flashDue').textContent=`${due.length} cartão(ões) para revisar · ${TOPICS.find(t=>t.id===n.topic)?.label||n.topic}`;q('#flashCard').innerHTML=flipped?`<span class="v4-flash-kicker">// RESPOSTA · TOQUE PARA VOLTAR</span><strong>${escapeHTML(n.remember)}</strong><p>${escapeHTML(n.text)}</p>`:`<span class="v4-flash-kicker">// PERGUNTA · TOQUE PARA VIRAR</span><strong>${escapeHTML(n.title)}</strong><p>Explique este conceito antes de revelar a resposta.</p>`;q('#flashActions').hidden=!flipped}
q('#flashCard').onclick=()=>{flipped=!flipped;drawFlash()};q('#flashTopic').onchange=e=>{flashTopic=e.target.value;flashIdx=0;flipped=false;drawFlash()};all('[data-grade]').forEach(b=>b.onclick=()=>{const n=dueNotes()[flashIdx];if(!n)return;const last=review[n.i]||{stage:0};let stage=+b.dataset.grade===0?0:Math.min(5,last.stage+(+b.dataset.grade===1?0:1)+(+b.dataset.grade===3?1:0));let days=+b.dataset.grade===0?0:intervals[Math.max(1,stage)];review[n.i]={stage,due:Date.now()+(days||0.015)*86400000};set(FLASH_KEY,review);flipped=false;drawFlash()});drawFlash();
})();
