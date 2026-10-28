const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

$('#menuBtn').addEventListener('click',()=>$('#nav').classList.toggle('open'));
$$('#nav a').forEach(a=>a.addEventListener('click',()=>$('#nav').classList.remove('open')));

const topicFilter = $('#topicFilter');
const quickGrid = $('#quickGrid');
let activeTopic='all';
function renderTopics(){
  topicFilter.innerHTML = [{id:'all',label:'Todos'},...TOPICS].map(t=>`<button class="chip ${activeTopic===t.id?'active':''}" data-topic="${t.id}">${t.label}</button>`).join('');
  $$('.chip').forEach(b=>b.onclick=()=>{activeTopic=b.dataset.topic;renderTopics();renderQuick();});
}
function renderQuick(){
  const rows=QUICK_NOTES.filter(n=>activeTopic==='all'||n.topic===activeTopic);
  quickGrid.innerHTML=rows.map(n=>`<article class="quick-card"><div><span class="tag">${TOPICS.find(t=>t.id===n.topic)?.label||n.topic}</span><h3>${n.title}</h3><p>${n.text}</p></div><div class="remember">→ ${n.remember}</div></article>`).join('');
}

$('#summaryList').innerHTML=SUMMARIES.map((s,i)=>`<article class="summary-item"><button class="summary-trigger"><span class="summary-num">${String(i+1).padStart(2,'0')}</span><span class="summary-title">${s.title}</span><span class="summary-icon">+</span></button><div class="summary-content hidden">${s.body}</div></article>`).join('');
$$('.summary-trigger').forEach(btn=>btn.onclick=()=>{const c=btn.nextElementSibling; c.classList.toggle('hidden'); btn.querySelector('.summary-icon').textContent=c.classList.contains('hidden')?'+':'−';});

$('#docsGrid').innerHTML=DOCUMENTS.map(d=>`<article class="doc-card"><span class="doc-icon">PDF</span><div><strong>${d[0]} · ${d[1]}</strong><small>material original</small></div><a href="material/${encodeURIComponent(d[2])}" target="_blank" rel="noopener">abrir ↗</a></article>`).join('');

let quiz=[],idx=0,answers=[],student='';
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
function startQuiz(){
 student=$('#studentName').value.trim(); if(!student){$('#studentName').focus();return;}
 quiz=shuffle(QUESTIONS).slice(0,10).map(q=>({...q,options:q.options.map((o,i)=>({o,i})).sort(()=>Math.random()-.5)})); idx=0;answers=Array(10).fill(null);
 $('#quizStart').classList.add('hidden');$('#resultBox').classList.add('hidden');$('#quizBox').classList.remove('hidden');$('#quizStudent').textContent=student;renderQuestion();
}
function renderQuestion(){
 const q=quiz[idx];$('#quizProgress').textContent=`${idx+1}/10`;
 $('#questionArea').innerHTML=`<h3 class="question-title">${q.q}</h3>${q.options.map(x=>`<label class="option"><input type="radio" name="answer" value="${x.i}" ${answers[idx]===x.i?'checked':''}> ${x.o}</label>`).join('')}`;
 $$('input[name=answer]').forEach(r=>r.onchange=()=>answers[idx]=Number(r.value));
 $('#prevQuestion').disabled=idx===0;$('#nextQuestion').textContent=idx===9?'Finalizar':'Próxima';
}
function finishQuiz(){
 const score=quiz.reduce((s,q,i)=>s+(answers[i]===q.answer?1:0),0); const percent=score*10;
 const attempt={name:student,score,percent,date:new Date().toISOString()};
 const hist=JSON.parse(localStorage.getItem('plp-history')||'[]');hist.unshift(attempt);localStorage.setItem('plp-history',JSON.stringify(hist.slice(0,50)));
 $('#quizBox').classList.add('hidden');const r=$('#resultBox');r.classList.remove('hidden');
 r.innerHTML=`<p class="eyebrow">Resultado de ${student}</p><div class="result-score">${score}/10</div><p>${percent}% de aproveitamento.</p><div class="review-list">${quiz.map((q,i)=>`<div class="review-item"><strong class="${answers[i]===q.answer?'ok':'bad'}">${answers[i]===q.answer?'✓ correta':'✕ revisar'}</strong><div>${q.q}</div><small>Resposta: ${q.options.find(x=>x.i===q.answer)?.o}</small></div>`).join('')}</div><button class="btn primary" id="retryQuiz">Novo simulado</button>`;
 $('#retryQuiz').onclick=()=>{r.classList.add('hidden');$('#quizStart').classList.remove('hidden');};renderHistory();
}
$('#startQuiz').onclick=startQuiz;$('#studentName').addEventListener('keydown',e=>{if(e.key==='Enter')startQuiz()});
$('#prevQuestion').onclick=()=>{if(idx>0){idx--;renderQuestion()}};
$('#nextQuestion').onclick=()=>{if(answers[idx]===null){alert('Marque uma alternativa antes de continuar.');return;} if(idx<9){idx++;renderQuestion()} else finishQuiz();};
function renderHistory(){
 const hist=JSON.parse(localStorage.getItem('plp-history')||'[]');
 $('#historyList').innerHTML=hist.length?hist.map(h=>`<div class="history-row"><span>${h.name}</span><span class="history-score">${h.score}/10</span><span>${new Date(h.date).toLocaleString('pt-BR')}</span></div>`).join(''):'<p class="muted">Nenhuma tentativa registrada neste navegador.</p>';
}
$('#clearHistory').onclick=()=>{if(confirm('Limpar todo o histórico local de simulados?')){localStorage.removeItem('plp-history');renderHistory();}};
renderTopics();renderQuick();renderHistory();
