(()=>{'use strict';
const EXAM_AT=Date.parse('2026-10-29T19:10:00-03:00');
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
 const days=Math.floor(Math.max(0,remaining)/86400000);
 $('examClockBadge').textContent=ended?'Agora':days>=1?`${days}d`:'Hoje';
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
const ios=/iPad|iPhone|iPod/.test(navigator.userAgent);note.textContent=ios?'No Safari, toque em Compartilhar (quadrado com seta) → Adicionar à Tela de Início. Se estiver em outro navegador, abra a página no Safari.':'No Chrome ou navegador do celular, abra o menu ⋮ e escolha “Instalar app” ou “Adicionar à tela inicial”.';
});
render();setInterval(render,1000);
})();
