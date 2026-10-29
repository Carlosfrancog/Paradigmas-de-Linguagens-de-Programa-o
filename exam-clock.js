(()=>{'use strict';
const EXAM_AT=Date.parse('2026-10-29T19:10:00-03:00');
const examDay='2026-10-29';
const saoPauloDay=()=>{const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const obj=Object.fromEntries(parts.map(p=>[p.type,p.value]));return `${obj.year}-${obj.month}-${obj.day}`;};
const fab=document.createElement('button');fab.type='button';fab.className='exam-clock-fab';fab.setAttribute('aria-label','Abrir contagem regressiva da prova');fab.setAttribute('aria-haspopup','dialog');fab.setAttribute('aria-expanded','false');fab.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg><span class="exam-clock-badge" id="examClockBadge">Prova</span>';
const panel=document.createElement('section');panel.id='examClockPanel';panel.className='exam-clock-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Data da prova e instalar atalho');panel.hidden=true;
panel.innerHTML=`<div class="exam-clock-head"><h2>Contagem para a prova</h2><button type="button" class="exam-clock-close" id="examClockClose" aria-label="Fechar painel">×</button></div><p id="examClockStatus" aria-live="polite">29/10/2026 às 19h10 · Horário de São Paulo</p><div class="exam-clock-count" aria-label="Tempo restante"><div class="exam-clock-unit"><strong id="examDays">--</strong><span>dias</span></div><div class="exam-clock-unit"><strong id="examHours">--</strong><span>horas</span></div><div class="exam-clock-unit"><strong id="examMinutes">--</strong><span>minutos</span></div><div class="exam-clock-unit"><strong id="examSeconds">--</strong><span>segundos</span></div></div><p class="exam-clock-help">Data oficial: 29 de outubro de 2026, às 19h10 (Brasília/São Paulo). A contagem usa o relógio do dispositivo.</p><hr/><h2>Atalho no celular</h2><p>Abra o portal direto pela tela inicial, como um aplicativo.</p><button type="button" class="exam-clock-action secondary" id="examInstall">Adicionar à tela inicial</button><div class="exam-install-note" id="examInstallNote" role="status" hidden></div>`;
document.body.append(fab,panel);
const $=id=>document.getElementById(id);let installPrompt=null;
function format(n){return String(n).padStart(2,'0');}
function render(){
 const remaining=EXAM_AT-Date.now();const ended=remaining<=0;let delta=Math.max(0,remaining);
 $('examClockStatus').textContent=ended?'A prova começou em 29/10/2026 às 19h10.':'Prova: 29/10/2026 às 19h10 · Horário de São Paulo';
 for(const [id,unit] of [['examDays',86400000],['examHours',3600000],['examMinutes',60000],['examSeconds',1000]]){
  const v=Math.floor(delta/unit);$(id).textContent=format(v);delta%=unit;
 }
 const today=saoPauloDay();
 const label=ended?'Iniciada':today===examDay?'Hoje':today<examDay?'Amanhã':'Iniciada';
 $('examClockBadge').textContent=ended?'Fim':label;
 if(!ended && today<examDay){$('examClockStatus').textContent='A prova é amanhã, 29/10, às 19h10 (São Paulo).';} else if(!ended && today===examDay){$('examClockStatus').textContent='A prova é hoje, às 19h10 (São Paulo).';}
 fab.classList.toggle('exam-clock-ended',ended);
}
function close(){panel.hidden=true;fab.setAttribute('aria-expanded','false');fab.focus();}
function open(){panel.hidden=false;fab.setAttribute('aria-expanded','true');render();$('examClockClose').focus();}
fab.addEventListener('click',()=>panel.hidden?open():close());$('examClockClose').addEventListener('click',close);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close();});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
$('examInstall').addEventListener('click',async()=>{const note=$('examInstallNote');note.hidden=false;
if(window.matchMedia('(display-mode: standalone)').matches||navigator.standalone){note.textContent='O site já está aberto como aplicativo na tela inicial.';return;}
if(installPrompt){const prompt=installPrompt;installPrompt=null;try{await prompt.prompt();const result=await prompt.userChoice;note.textContent=result.outcome==='accepted'?'Atalho solicitado. Confira a tela inicial.':'Você pode instalar quando quiser pelo menu do navegador.';}catch{note.textContent='Use o menu do navegador e escolha “Adicionar à tela inicial”.';}return;}
const ua=navigator.userAgent;const ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const android=/Android/i.test(ua),chrome=/(Chrome|CriOS)/.test(ua)&&!/Edg|OPR|SamsungBrowser|FxiOS/.test(ua);
const edge=/EdgA?|EdgiOS/.test(ua),samsung=/SamsungBrowser/.test(ua),firefox=/Firefox|FxiOS/.test(ua);
if(ios){note.innerHTML='<strong>iPhone / iPad</strong><p>Toque em Compartilhar (quadrado com seta) e selecione “Adicionar à Tela de Início”. No Chrome iOS, abra o menu Compartilhar e procure essa opção; se não existir, abra no Safari.</p>';}
else if(android&&chrome){note.innerHTML='<strong>Chrome no Android</strong><p>Toque no menu ⋮ → “Instalar app” ou “Adicionar à tela inicial”. O botão automático aparece somente quando o Chrome oferece a instalação.</p>';}
else if(android&&edge){note.textContent='No Edge para Android, abra o menu ⋯ → Adicionar ao telefone / Adicionar à tela inicial.';}
else if(android&&samsung){note.textContent='No Samsung Internet, abra o menu ☰ e toque em Adicionar página a → Tela inicial.';}
else if(firefox){note.textContent='No Firefox para Android, abra o menu ⋮ e procure Instalar ou Adicionar à tela inicial. No iOS, use Compartilhar → Adicionar à Tela de Início.';}
else{note.textContent='Abra o menu do navegador e procure “Instalar aplicativo” ou “Adicionar à tela inicial”. Se estiver no computador, procure o ícone de instalação na barra de endereços.';}

});
window.addEventListener('appinstalled',()=>{installPrompt=null;const note=$('examInstallNote');note.hidden=false;note.textContent='Aplicativo instalado!';});
if('serviceWorker' in navigator&&window.isSecureContext) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{}));
render();setInterval(render,1000);
})();
