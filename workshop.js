(()=>{'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const modules=window.PLP_LAB_MODULES||[], bank=window.PLP_LAB_BANK||{};
const labError=(message)=>{const area=document.querySelector('#labFeedback');if(area)area.innerHTML=`<div class="v3-feedback bad" role="alert"><strong>Não foi possível carregar a Oficina.</strong><p>${message}</p><button type="button" class="btn ghost" onclick="location.reload()">Recarregar</button></div>`;};
const KEY='plp-workshop-done-v5';
const COOLDOWN_MS=60*60*1000; // 1 hora desde a resposta de cada pergunta
let cooldownInterval=null;
const EXECUTOR_CONFIG='executor-config.json';
let executorBase='';
fetch(EXECUTOR_CONFIG,{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(c=>{executorBase=typeof c.baseUrl==='string'?c.baseUrl.replace(/\/$/,''):''}).catch(()=>{});

let done;try{done=JSON.parse(localStorage.getItem(KEY)||'{}');if(!done||typeof done!=='object'||Array.isArray(done))done={}}catch{done={}}
// Mantém os registros anteriores (timestamps). Dados legados sem data válida são descartados.
function pruneExpired(){
 const cutoff=Date.now()-COOLDOWN_MS;
 let changed=false;
 for(const [id,time] of Object.entries(done)){
  if(!Number.isFinite(Number(time))||Number(time)<=cutoff||Number(time)>Date.now()+60000){delete done[id];changed=true;}
 }
 if(changed)save();
}
function formatRemaining(ms){
 const sec=Math.max(0,Math.ceil(ms/1000));
 const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;
 return [h,m,s].map(v=>String(v).padStart(2,'0')).join(':');
}
function updateCooldownStatus(){
 const remainingEl=$('#labQuestionCount');
 if(!remainingEl)return;
 const questions=bank[currentModule]||[];
 const available=questions.filter(q=>!done[q.id]).length;
 if(available){remainingEl.textContent=`${available} questões disponíveis neste módulo`;return;}
 const times=questions.map(q=>Number(done[q.id])).filter(Number.isFinite);
 if(!times.length){remainingEl.textContent='Sem questões cadastradas neste módulo';return;}
 const earliest=Math.min(...times)+COOLDOWN_MS;
 remainingEl.textContent=`Novas questões em ${formatRemaining(earliest-Date.now())}`;
 if(earliest<=Date.now())chooseNext();
}
let currentModule='imperativo',question=null,answered=false;
let execution=null;
const isRunnable=q=>q&&['imperativo','ponteiros','escopo','tipos','subprogramas','sintaxe'].includes(currentModule)&&!/(\bclass\s|\binterface\s|\bextends\b|\bimplements\b|\bdef\s|\bprint\s*\(|\bSystem\.|\bnew\s|\babstract\s|\bvoid\s+\w+\s*\(|\bint\s+\w+\s*\([^;]*\)\s*\{)/.test(q.code)&&!q.code.includes('...');
const codeFor=q=>{const snippet=q.code.trim();return '#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n'+snippet.split('\n').map(line=>'    '+line).join('\n')+'\n    return 0;\n}\n'};
function hideRunner(){const p=$('#labRunner');if(p)p.classList.add('hidden');const o=$('#labRunOutput');if(o)o.textContent='';}
function showRunner(){const p=$('#labRunner');if(!p)return;p.classList.remove('hidden');const eligible=isRunnable(question);$('#labRunLanguage').textContent=eligible?'C (gcc)':'Exemplo conceitual';$('#labEditor').value=eligible?codeFor(question):question.code;$('#labEditor').readOnly=!eligible;$('#labRunBtn').disabled=!eligible;$('#labEditor').setAttribute('aria-label',eligible?'Editor de código C':'Exemplo não executável');$('#labRunOutput').textContent=eligible?'Edite o código e clique em Executar. A saída aparecerá aqui.':'Este trecho não é um programa C completo. Consulte a explicação e avance para outra questão.';}

const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(done))}catch{}};
function updateSkins(){
 // A interface e os critérios de desbloqueio pertencem ao v4.js.
 // Este evento atualiza a interface sem reinicializar a Oficina.
 window.dispatchEvent(new CustomEvent('plp:workshop-progress'));
}

function chooseNext(){
 pruneExpired();
 answered=false;question=null;hideRunner();
 $('#labCheck').disabled=false;$('#labCheck').classList.remove('hidden');$('#labNext').classList.add('hidden');$('#labFeedback').innerHTML='';
 const available=bank[currentModule]||[];
 if(!available.length){labError('Banco de perguntas indisponível. Atualize a página ou confira o deploy de lab-bank.js.');return;}
 const unseen=available.filter(q=>!done[q.id]);
 question=unseen.length?unseen[Math.floor(Math.random()*unseen.length)]:null;
 updateCooldownStatus();
 if(!question){
  $('#labTopic').textContent='Oficina · pausa do módulo';
  $('#labTitle').textContent='Você já praticou todas as questões disponíveis';
  $('#labIntro').textContent='As perguntas deste módulo ficam indisponíveis durante 1 hora após cada resposta. O contador acima mostra quando a próxima será liberada. Enquanto isso, escolha outro módulo.';
  $('#labCode').textContent='';$('#labOptions').innerHTML='';$('#labCheck').classList.add('hidden');
  return;
 }
 $('#labTopic').textContent=question.topic;$('#labTitle').textContent=question.q;
 $('#labIntro').textContent='Leia o exemplo, escolha uma alternativa e confira a explicação. Cada pergunta só volta a aparecer após 1 hora.';
 $('#labCode').textContent=question.code;
 $('#labOptions').innerHTML=question.options.map((o,i)=>`<label class="v3-lab-option"><input type="radio" name="labOption" value="${i}"><span>${esc(o)}</span></label>`).join('');
}
$('#labCheck').onclick=()=>{
 if(answered||!question)return;
 const selected=$('input[name="labOption"]:checked');
 if(!selected){$('#labFeedback').textContent='Selecione uma alternativa.';return}
 answered=true;done[question.id]=Date.now();save();
 try{
  const permanent=JSON.parse(localStorage.getItem('plp-lab-completed-ids')||'[]');
  if(!permanent.includes(question.id)){permanent.push(question.id);localStorage.setItem('plp-lab-completed-ids',JSON.stringify(permanent));localStorage.setItem('plp-lab-ever-completed',String(permanent.length));}
  if(Number(selected.value)===question.answer){
   const correct=JSON.parse(localStorage.getItem('plp-lab-correct-ids')||'[]');
   if(!correct.includes(question.id)){correct.push(question.id);localStorage.setItem('plp-lab-correct-ids',JSON.stringify(correct));}
  }
 }catch{}
 updateCooldownStatus();
 const good=Number(selected.value)===question.answer;
 $('#labFeedback').innerHTML=`<div class="v3-feedback ${good?'good':'bad'}"><strong>${good?'Resposta correta!':'Resposta incorreta'}</strong><p>Correta: ${esc(question.options[question.answer])}</p><p>${esc(question.why)}</p></div>`;
 $('#labOptions').querySelectorAll('input').forEach(x=>x.disabled=true);
 $('#labCheck').classList.add('hidden');$('#labNext').classList.remove('hidden');showRunner();updateSkins();
};
$('#labNext').onclick=chooseNext;
$('#labRunBtn').onclick=async()=>{if(!answered||!question||!isRunnable(question))return;const code=$('#labEditor').value;const output=$('#labRunOutput');if(code.length>12000){output.textContent='Limite: 12.000 caracteres.';return}if(!executorBase){output.textContent='Execução remota ainda não ativada. Configure executor-config.json com a URL do Worker publicado.';return}$('#labRunBtn').disabled=true;output.textContent='Compilando e executando…';const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);try{const r=await fetch(executorBase+'/execute',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language:'c',code}),signal:controller.signal});const d=await r.json();if(!r.ok)throw Error(d.error||'Falha HTTP '+r.status);output.textContent=[d.compileOutput&&'Compilador:\n'+d.compileOutput,d.runOutput&&'Saída:\n'+d.runOutput,d.exitCode!==null&&d.exitCode!==undefined?'Código de saída: '+d.exitCode:null].filter(Boolean).join('\n\n')||'(O programa terminou sem imprimir dados.)'}catch(e){output.textContent=e.name==='AbortError'?'Tempo limite da requisição excedido.':'Não foi possível executar: '+e.message}finally{clearTimeout(timeout);$('#labRunBtn').disabled=false}};
$('#labResetCode').onclick=()=>{if(answered&&question)$('#labEditor').value=isRunnable(question)?codeFor(question):question.code};
if(!modules.length){labError('Nenhum módulo foi carregado. Verifique o arquivo lab-bank.js.');return;}
$('#labModule').innerHTML=modules.map(m=>`<option value="${esc(m.id)}">${esc(m.name)} · 112 exercícios</option>`).join('');
$('#labModule').onchange=e=>{currentModule=e.target.value;chooseNext()};
try{const permanent=JSON.parse(localStorage.getItem('plp-lab-completed-ids')||'[]');for(const id of Object.keys(done))if(!permanent.includes(id))permanent.push(id);localStorage.setItem('plp-lab-completed-ids',JSON.stringify(permanent));localStorage.setItem('plp-lab-ever-completed',String(permanent.length));}catch{}
updateSkins();chooseNext();
// Atualiza contagem regressiva mesmo sem interação; libera automaticamente quando expira.
cooldownInterval=setInterval(()=>{pruneExpired();updateCooldownStatus()},1000);
const routeMap={inicio:'inicio',estudo:'estudo',resumos:'resumos',reader:'materiais',materiais:'materiais',simulado:'simulado',progresso:'progresso',laboratorio:'laboratorio',flashcards:'flashcards'};
const sections=[...document.querySelectorAll('main > section')];
function route(){const key=decodeURIComponent(location.hash.replace(/^#\/?/,'').split('/')[0]||'inicio');const target=routeMap[key]||'inicio';sections.forEach(s=>s.classList.toggle('route-hidden',s.id!==target));document.querySelectorAll('.topbar nav a').forEach(a=>a.getAttribute('href')==='#'+key?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));window.scrollTo(0,0);document.title=`${target==='inicio'?'Início':target.charAt(0).toUpperCase()+target.slice(1)} · PLP Estudos`}
window.addEventListener('hashchange',route);route();
$('#startReview')?.addEventListener('click',()=>location.hash='#simulado');
})();
