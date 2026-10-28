(()=>{'use strict';
const $=s=>document.querySelector(s),escape=t=>String(t??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const apiConfig=fetch('config.json').then(r=>r.json()).catch(()=>({apiBase:''}));
let token=sessionStorage.getItem('plp-wallet-token')||'',account='',question=null,moduleId='imperativo',answered=false,config={},onlineQuestion=false;
const doneKey='plp-workshop-done-v5';let done=(()=>{try{return JSON.parse(localStorage.getItem(doneKey)||'{}')}catch{return {}}})();
const record=id=>{done[id]=Date.now();localStorage.setItem(doneKey,JSON.stringify(done))};
const modules=window.PLP_LAB_MODULES,bank=window.PLP_LAB_BANK;
async function call(path,body,authenticated=false){if(!config.apiBase)throw Error('API global não configurada. Consulte README.');const res=await fetch(config.apiBase.replace(/\/$/,'')+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(authenticated?{'Authorization':'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});const data=await res.json().catch(()=>({error:'Erro do serviço'}));if(!res.ok)throw Error(data.error||'Falha ao comunicar com API');return data}
function message(x){$('#walletState').textContent=x}
async function ranking(){try{const d=await call('/api/wallet/ranking');$('#walletRanking').innerHTML=d.ranking.length?d.ranking.map((x,i)=>`<div class="rank-item"><span>${i+1}. ${escape(x.name)}</span><strong>${x.coins} ◈</strong></div>`).join(''):'<p>O ranking começa quando alguém ganhar coins.</p>'}catch(e){$('#walletRanking').textContent=config.apiBase?'Ranking indisponível.':'Ative o Worker para usar o ranking global.'}}
async function profile(){if(!token){message('Entre ou crie uma wallet. Nenhuma senha é armazenada no navegador.');return}try{const d=await call('/api/wallet/me',undefined,true);account=d.name;message(`${d.name} · ${d.coins} coins · ${d.correct} acertos validados`)}catch(e){token='';sessionStorage.removeItem('plp-wallet-token');message('Sessão encerrada. Entre novamente.')}}
async function authenticate(mode){const name=$('#walletName').value.trim(),password=$('#walletPass').value; if(name.length<3||password.length<10){message('Use um nome de 3 a 32 caracteres e senha de pelo menos 10 caracteres.');return}try{const d=await call('/api/wallet/'+mode,{name,password});token=d.token;sessionStorage.setItem('plp-wallet-token',token);$('#walletPass').value='';await profile();await next()}catch(e){message(e.message)}}
$('#walletForm').onsubmit=e=>{e.preventDefault();authenticate('login')};$('#walletRegister').onclick=()=>authenticate('register');$('#walletLogout').onclick=()=>{token='';account='';sessionStorage.removeItem('plp-wallet-token');profile();next()};
function unseen(){const arr=bank[moduleId].filter(x=>!done[x.id]);return arr[Math.floor(Math.random()*arr.length)]||null}
async function next(){answered=false;$('#labNext').classList.add('hidden');$('#labCheck').classList.remove('hidden');$('#labFeedback').innerHTML='';onlineQuestion=false;
if(token&&config.apiBase){try{const d=await call('/api/wallet/challenge',{module:moduleId},true);question={id:d.challengeId,topic:d.module,q:d.question,code:d.code,options:d.options,why:''};onlineQuestion=true}catch(e){message(e.message)}}
if(!onlineQuestion)question=unseen();
const remaining=bank[moduleId].filter(x=>!done[x.id]).length;
$('#labQuestionCount').textContent=onlineQuestion?'Coins habilitadas · resposta validada no servidor':`${remaining} exercícios inéditos neste aparelho · sem coins`;
if(!question){$('#labTitle').textContent='Módulo concluído';$('#labIntro').textContent='Você respondeu às 112 variações deste módulo. Selecione outro módulo para continuar.';$('#labCode').textContent='';$('#labOptions').innerHTML='';$('#labCheck').classList.add('hidden');return}
$('#labTopic').textContent=question.topic;$('#labTitle').textContent=question.q;$('#labIntro').textContent=onlineQuestion?'A resposta será verificada pelo servidor e pode render coins.':'Responda uma única vez; após confirmar, você segue para outra questão.';$('#labCode').textContent=question.code;$('#labOptions').innerHTML=question.options.map((o,i)=>`<label class="v3-lab-option"><input type="radio" name="labOption" value="${i}" /> <span>${escape(o)}</span></label>`).join('');}
$('#labCheck').onclick=async()=>{if(answered||!question)return;const picked=$('input[name="labOption"]:checked');if(!picked){$('#labFeedback').textContent='Selecione uma alternativa.';return}answered=true;$('#labCheck').disabled=true;let good=false,correct='',why='';try{
if(onlineQuestion){const d=await call('/api/wallet/answer',{challengeId:question.id,choice:Number(picked.value)},true);good=d.correct;correct=d.correctOption;why=d.explanation;await profile();await ranking()}
else{good=Number(picked.value)===question.answer;correct=question.options[question.answer];why=question.why;record(question.id);syncUnlocks()}
$('#labFeedback').innerHTML=`<div class="v3-feedback ${good?'good':'bad'}"><strong>${good?'Correto!':'Resposta incorreta'}</strong><p>Resposta certa: ${escape(correct)}</p><p>${escape(why)}</p><p>${onlineQuestion?(good?'+5 coins creditadas.':'Nenhuma coin nesta resposta.'):'Treino local: sem coins.'}</p></div>`;
$('#labOptions').querySelectorAll('input').forEach(x=>x.disabled=true);$('#labCheck').classList.add('hidden');$('#labNext').classList.remove('hidden')
}catch(e){answered=false;$('#labFeedback').textContent=e.message}finally{$('#labCheck').disabled=false}};
function syncUnlocks(){const count=Object.keys(done).length;const unlocks=Array.from({length:Math.min(7,count)},(_,i)=>i);try{const old=JSON.parse(localStorage.getItem('plp-unlocks-v4')||'[]');for(const n of old)if(!unlocks.includes(n))unlocks.push(n)}catch{}localStorage.setItem('plp-unlocks-v4',JSON.stringify(unlocks));const thresholds={neon:0,matrix:2,sunset:4,ice:7};document.querySelectorAll('[data-skin]').forEach(b=>{const active=unlocks.length>=thresholds[b.dataset.skin];b.disabled=!active;const sm=b.querySelector('small');if(sm&&active)sm.textContent='Disponível · toque para aplicar';});const tally=document.querySelector('.v4-count');if(tally)tally.textContent=unlocks.length+'/7 desbloqueios de skin';}
$('#labNext').onclick=next;syncUnlocks();
$('#labModule').innerHTML=modules.map(m=>`<option value="${m.id}">${m.name} · 112 questões</option>`).join('');$('#labModule').onchange=e=>{moduleId=e.target.value;next()};
// Real client-side hash routes: page-like navigation without server rewrites.
const routes={inicio:'inicio',estudo:'estudo',resumos:'resumos',reader:'materiais',materiais:'materiais',simulado:'simulado',progresso:'progresso',laboratorio:'laboratorio',flashcards:'flashcards',comunidade:'comunidade',wallet:'wallet'};
const sections=[...document.querySelectorAll('main > section')];
function route(){const key=decodeURIComponent(location.hash.replace(/^#\/?/,'').split('/')[0]||'inicio');const target=routes[key]||'inicio';sections.forEach(s=>s.classList.toggle('route-hidden',s.id!==target));document.querySelectorAll('.topbar nav a').forEach(a=>{if((a.getAttribute('href')||'').replace('#','')===key)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});window.scrollTo({top:0,behavior:'instant'});document.title=`${key==='inicio'?'Início':key.charAt(0).toUpperCase()+key.slice(1)} · PLP Estudos`;}
window.addEventListener('hashchange',route);route();
// Override SPA interactions that relied on scrolling to a hidden section.
$('#startReview')?.addEventListener('click',()=>location.hash='#simulado');
$('#studyDrawer')?.addEventListener('keydown',e=>{if(e.key==='Escape')$('#drawerClose')?.click()});
apiConfig.then(async c=>{config=c||{};await ranking();await profile();await next()});
})();
