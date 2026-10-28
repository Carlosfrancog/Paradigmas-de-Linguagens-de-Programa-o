(()=>{'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const modules=window.PLP_LAB_MODULES, bank=window.PLP_LAB_BANK;
const KEY='plp-workshop-done-v5';
const EXECUTOR_CONFIG='executor-config.json';
let executorBase='';
fetch(EXECUTOR_CONFIG,{cache:'no-store'}).then(r=>r.ok?r.json():{}).then(c=>{executorBase=typeof c.baseUrl==='string'?c.baseUrl.replace(/\/$/,''):''}).catch(()=>{});

let done;try{done=JSON.parse(localStorage.getItem(KEY)||'{}')}catch{done={}}
let currentModule='imperativo',question=null,answered=false;
let execution=null;
const isRunnable=q=>q&&['imperativo','ponteiros','escopo','tipos','subprogramas','sintaxe'].includes(currentModule)&&!/(\bclass\s|\binterface\s|\bextends\b|\bimplements\b|\bdef\s|\bprint\s*\(|\bSystem\.|\bnew\s|\babstract\s|\bvoid\s+\w+\s*\(|\bint\s+\w+\s*\([^;]*\)\s*\{)/.test(q.code)&&!q.code.includes('...');
const codeFor=q=>{const snippet=q.code.trim();return '#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n'+snippet.split('\n').map(line=>'    '+line).join('\n')+'\n    return 0;\n}\n'};
function hideRunner(){const p=$('#labRunner');if(p)p.classList.add('hidden');const o=$('#labRunOutput');if(o)o.textContent='';}
function showRunner(){const p=$('#labRunner');if(!p)return;p.classList.remove('hidden');const eligible=isRunnable(question);$('#labRunLanguage').textContent=eligible?'C (gcc)':'Exemplo conceitual';$('#labEditor').value=eligible?codeFor(question):question.code;$('#labEditor').readOnly=!eligible;$('#labRunBtn').disabled=!eligible;$('#labEditor').setAttribute('aria-label',eligible?'Editor de código C':'Exemplo não executável');$('#labRunOutput').textContent=eligible?'Edite o código e clique em Executar. A saída aparecerá aqui.':'Este trecho não é um programa C completo. Consulte a explicação e avance para outra questão.';}

const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(done))}catch{}};
function updateSkins(){
 const count=Object.keys(done).length;
 const unlocks=Array.from({length:Math.min(7,count)},(_,i)=>i);
 try{for(const n of JSON.parse(localStorage.getItem('plp-unlocks-v4')||'[]'))if(!unlocks.includes(n))unlocks.push(n)}catch{}
 localStorage.setItem('plp-unlocks-v4',JSON.stringify(unlocks));
 const need={neon:0,matrix:2,sunset:4,ice:7};
 document.querySelectorAll('[data-skin]').forEach(b=>{const ok=unlocks.length>=need[b.dataset.skin];b.disabled=!ok;const sm=b.querySelector('small');if(sm&&ok)sm.textContent='Disponível · toque para aplicar'});
 const tally=$('.v4-count');if(tally)tally.textContent=unlocks.length+'/7 skins liberadas';
}
function chooseNext(){
 answered=false; hideRunner(); $('#labCheck').disabled=false;$('#labCheck').classList.remove('hidden');$('#labNext').classList.add('hidden');$('#labFeedback').innerHTML='';
 const unseen=bank[currentModule].filter(x=>!done[x.id]);
 question=unseen[Math.floor(Math.random()*unseen.length)]||null;
 $('#labQuestionCount').textContent=`${unseen.length} exercícios disponíveis neste módulo`;
 if(!question){$('#labTopic').textContent='';$('#labTitle').textContent='Módulo concluído';$('#labIntro').textContent='Você respondeu todas as questões deste módulo neste navegador. Selecione outro módulo para continuar.';$('#labCode').textContent='';$('#labOptions').innerHTML='';$('#labCheck').classList.add('hidden');return}
 $('#labTopic').textContent=question.topic;$('#labTitle').textContent=question.q;
 $('#labIntro').textContent='Leia o exemplo, escolha uma alternativa e confira a explicação. Cada questão pode ser respondida uma vez.';
 $('#labCode').textContent=question.code;
 $('#labOptions').innerHTML=question.options.map((o,i)=>`<label class="v3-lab-option"><input type="radio" name="labOption" value="${i}"><span>${esc(o)}</span></label>`).join('');
}
$('#labCheck').onclick=()=>{
 if(answered||!question)return;
 const selected=$('input[name="labOption"]:checked');
 if(!selected){$('#labFeedback').textContent='Selecione uma alternativa.';return}
 answered=true;done[question.id]=Date.now();save();
 const good=Number(selected.value)===question.answer;
 $('#labFeedback').innerHTML=`<div class="v3-feedback ${good?'good':'bad'}"><strong>${good?'Resposta correta!':'Resposta incorreta'}</strong><p>Correta: ${esc(question.options[question.answer])}</p><p>${esc(question.why)}</p></div>`;
 $('#labOptions').querySelectorAll('input').forEach(x=>x.disabled=true);
 $('#labCheck').classList.add('hidden');$('#labNext').classList.remove('hidden');showRunner();updateSkins();
};
$('#labNext').onclick=chooseNext;
$('#labRunBtn').onclick=async()=>{if(!answered||!question||!isRunnable(question))return;const code=$('#labEditor').value;const output=$('#labRunOutput');if(code.length>12000){output.textContent='Limite: 12.000 caracteres.';return}if(!executorBase){output.textContent='Execução remota ainda não ativada. Configure executor-config.json com a URL do Worker publicado.';return}$('#labRunBtn').disabled=true;output.textContent='Compilando e executando…';const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);try{const r=await fetch(executorBase+'/execute',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language:'c',code}),signal:controller.signal});const d=await r.json();if(!r.ok)throw Error(d.error||'Falha HTTP '+r.status);output.textContent=[d.compileOutput&&'Compilador:\n'+d.compileOutput,d.runOutput&&'Saída:\n'+d.runOutput,d.exitCode!==null&&d.exitCode!==undefined?'Código de saída: '+d.exitCode:null].filter(Boolean).join('\n\n')||'(O programa terminou sem imprimir dados.)'}catch(e){output.textContent=e.name==='AbortError'?'Tempo limite da requisição excedido.':'Não foi possível executar: '+e.message}finally{clearTimeout(timeout);$('#labRunBtn').disabled=false}};
$('#labResetCode').onclick=()=>{if(answered&&question)$('#labEditor').value=isRunnable(question)?codeFor(question):question.code};
$('#labModule').innerHTML=modules.map(m=>`<option value="${esc(m.id)}">${esc(m.name)} · 112 exercícios</option>`).join('');
$('#labModule').onchange=e=>{currentModule=e.target.value;chooseNext()};
updateSkins();chooseNext();
const routeMap={inicio:'inicio',estudo:'estudo',resumos:'resumos',reader:'materiais',materiais:'materiais',simulado:'simulado',progresso:'progresso',laboratorio:'laboratorio',flashcards:'flashcards'};
const sections=[...document.querySelectorAll('main > section')];
function route(){const key=decodeURIComponent(location.hash.replace(/^#\/?/,'').split('/')[0]||'inicio');const target=routeMap[key]||'inicio';sections.forEach(s=>s.classList.toggle('route-hidden',s.id!==target));document.querySelectorAll('.topbar nav a').forEach(a=>a.getAttribute('href')==='#'+key?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));window.scrollTo(0,0);document.title=`${target==='inicio'?'Início':target.charAt(0).toUpperCase()+target.slice(1)} · PLP Estudos`}
window.addEventListener('hashchange',route);route();
$('#startReview')?.addEventListener('click',()=>location.hash='#simulado');
})();
