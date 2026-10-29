(()=>{'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const modules=window.PLP_LAB_MODULES||[], rawBank=window.PLP_LAB_BANK||{};
const questionSig=q=>`${String(q?.topic||'').trim()}||${String(q?.q||'').trim()}||${String(q?.code||'').trim()}`;
const dedupeQuestions=list=>{const seen=new Set();return (list||[]).filter(q=>{const sig=questionSig(q);if(seen.has(sig))return false;seen.add(sig);return true;});};
const bank=Object.fromEntries(Object.entries(rawBank).map(([key,list])=>[key,dedupeQuestions(list)]));
const labError=(message)=>{const area=document.querySelector('#labFeedback');if(area)area.innerHTML=`<div class="v3-feedback bad" role="alert"><strong>Não foi possível carregar a Oficina.</strong><p>${message}</p><button type="button" class="btn ghost" onclick="location.reload()">Recarregar</button></div>`;};
const STATE_KEY='plp-workshop-review-v8';
const modulesById=new Map(modules.map(m=>[m.id,m]));
const readJSON=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const writeJSON=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
const initialState=()=>({version:1,globalSteps:0,modules:{}});
let state=readJSON(STATE_KEY,null);
if(!state||state.version!==1||!state.modules||typeof state.modules!=='object'){
 state=initialState();
 // Migração conservadora: acertos já registrados não devem voltar ao sorteio.
 const priorCorrect=readJSON('plp-lab-correct-ids',[]);
 for(const [module,questions] of Object.entries(bank)){
   const known=new Set(Array.isArray(priorCorrect)?priorCorrect:[]);
   state.modules[module]={steps:0,correct:Object.fromEntries(questions.filter(q=>known.has(q.id)).map(q=>[q.id,true])),wrong:{},last:null};
 }
 writeJSON(STATE_KEY,state);
}
if(!Number.isFinite(state.globalSteps))state.globalSteps=0;
let currentModule=bank.imperativo?'imperativo':modules[0]?.id,question=null,answered=false;
const getModule=()=>{
 if(!state.modules[currentModule])state.modules[currentModule]={steps:0,correct:{},wrong:{},last:null};
 const m=state.modules[currentModule];
 if(!m.correct||typeof m.correct!=='object')m.correct={};
 if(!m.wrong||typeof m.wrong!=='object')m.wrong={};
 if(!Number.isFinite(m.steps))m.steps=0;
 return m;
};
const save=()=>writeJSON(STATE_KEY,state);
const availableFor=(questions,m)=>questions.filter(q=>!m.correct[q.id]&&(!m.wrong[q.id]||state.globalSteps>=m.wrong[q.id].eligibleAt));
const remainingWrong=(m)=>Object.entries(m.wrong).filter(([id])=>!m.correct[id]);
function updateStatus(){
 const el=$('#labQuestionCount');if(!el)return;
 const m=getModule(),questions=bank[currentModule]||[];
 const ready=availableFor(questions,m).length;
 const pending=remainingWrong(m).length;
 const completed=questions.filter(q=>m.correct[q.id]).length;
 el.textContent=`${completed}/${questions.length} dominadas · ${ready} disponíveis${pending?' · '+pending+' em revisão':''}`;
}
function updateSkins(){window.dispatchEvent(new CustomEvent('plp:workshop-progress'));}
function chooseNext(){
 answered=false;question=null;
 $('#labCheck').disabled=false;$('#labCheck').classList.remove('hidden');$('#labNext').classList.add('hidden');$('#labFeedback').innerHTML='';
 const questions=bank[currentModule]||[];
 if(!questions.length){labError('Banco de perguntas indisponível. Confira lab-bank.js.');return;}
 const m=getModule();let candidates=availableFor(questions,m);
 if(candidates.length>1)candidates=candidates.filter(q=>q.id!==m.last);
 question=candidates.length?candidates[Math.floor(Math.random()*candidates.length)]:null;
 updateStatus();
 if(!question){
  $('#labTopic').textContent='Oficina · módulo concluído ou em revisão';
  $('#labTitle').textContent=remainingWrong(m).length?'Aguarde outras três respostas':'Todas as questões deste módulo foram dominadas';
  $('#labIntro').textContent=remainingWrong(m).length?'As perguntas erradas retornam após três outras respostas em qualquer módulo. Selecione outro módulo e continue treinando.':'Você concluiu as perguntas deste módulo. Pode escolher outro módulo ou resetar a Oficina.';
  $('#labCode').textContent='';$('#labOptions').innerHTML='';$('#labCheck').classList.add('hidden');return;
 }
 $('#labTopic').textContent=question.topic;$('#labTitle').textContent=question.q;
 $('#labIntro').textContent='Leia o enunciado, analise o trecho e escolha uma alternativa. Ao confirmar, a resposta é definitiva.';
 $('#labCode').textContent=question.code;
 $('#labOptions').innerHTML=question.options.map((o,i)=>`<label class="v3-lab-option"><input type="radio" name="labOption" value="${i}"><span>${esc(o)}</span></label>`).join('');
}
$('#labCheck').onclick=()=>{
 if(answered||!question)return;
 const selected=$('input[name="labOption"]:checked');
 if(!selected){$('#labFeedback').textContent='Selecione uma alternativa.';return;}
 answered=true;
 const m=getModule(),good=Number(selected.value)===question.answer;
 m.steps+=1;state.globalSteps+=1;m.last=question.id;
 if(good){m.correct[question.id]=true;delete m.wrong[question.id];}
 else{m.wrong[question.id]={eligibleAt:state.globalSteps+3,attempts:(m.wrong[question.id]?.attempts||0)+1};}
 save();
 const permanent=new Set(readJSON('plp-lab-completed-ids',[]));permanent.add(question.id);writeJSON('plp-lab-completed-ids',[...permanent]);localStorage.setItem('plp-lab-ever-completed',String(permanent.size));
 if(good){const correct=new Set(readJSON('plp-lab-correct-ids',[]));correct.add(question.id);writeJSON('plp-lab-correct-ids',[...correct]);}
 $('#labFeedback').innerHTML=`<div class="v3-feedback ${good?'good':'bad'}"><strong>${good?'Resposta correta!':'Resposta incorreta'}</strong><p>Correta: ${esc(question.options[question.answer])}</p><p>${esc(question.why)}</p><p>${good?'Esta questão não volta a aparecer.':'Ela poderá voltar depois de outras 3 respostas em qualquer módulo.'}</p></div>`;
 $('#labOptions').querySelectorAll('input').forEach(x=>x.disabled=true);
 $('#labCheck').classList.add('hidden');$('#labNext').classList.remove('hidden');
 updateStatus();updateSkins();
};
$('#labNext').onclick=chooseNext;
if(!modules.length){labError('Nenhum módulo foi carregado. Verifique lab-bank.js.');return;}
$('#labModule').innerHTML=modules.map(m=>`<option value="${esc(m.id)}">${esc(m.name)} · ${(bank[m.id]||[]).length} exercícios</option>`).join('');
$('#labModule').value=currentModule;
$('#labModule').onchange=e=>{currentModule=e.target.value;chooseNext();};
$('#labReset')?.addEventListener('click',()=>{
 if(!confirm('Apagar TODO o progresso da Oficina, questões dominadas, erros em revisão e skins desbloqueadas? Isso não pode ser desfeito.'))return;
 const keys=['plp-workshop-review-v8','plp-workshop-done-v5','plp-lab-completed-ids','plp-lab-correct-ids','plp-lab-ever-completed','plp-unlocks-v4','plp-skin-v4','plp-skin-toast-seen-v7'];
 keys.forEach(k=>localStorage.removeItem(k));
 state=initialState();
 document.documentElement.dataset.skin='neon';
 updateSkins();chooseNext();
 location.reload();
});
chooseNext();updateSkins();
const routeMap={inicio:'inicio',estudo:'estudo',resumos:'resumos',reader:'materiais',materiais:'materiais',simulado:'simulado',progresso:'progresso',laboratorio:'laboratorio',flashcards:'flashcards'};
const sections=[...document.querySelectorAll('main > section')];
function route(){const key=decodeURIComponent(location.hash.replace(/^#\/?/,'').split('/')[0]||'inicio');const target=routeMap[key]||'inicio';sections.forEach(s=>s.classList.toggle('route-hidden',s.id!==target));document.querySelectorAll('.topbar nav a').forEach(a=>a.getAttribute('href')==='#'+key?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));window.scrollTo(0,0);document.title=`${target==='inicio'?'Início':target.charAt(0).toUpperCase()+target.slice(1)} · PLP Estudos`}
window.addEventListener('hashchange',route);route();
$('#startReview')?.addEventListener('click',()=>location.hash='#simulado');
})();
