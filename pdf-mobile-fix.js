/* Deep links to original PDFs use #page=N; browser support varies. */
(() => {
  const reader=document.getElementById('reader');
  if(!reader)return;
  const opener=document.getElementById('pdfNewTab');
  if(opener){opener.textContent='Abrir PDF original';opener.setAttribute('aria-label','Abrir PDF original em nova aba');}
  // Evita scroll horizontal quando o usuário alterna aulas em telas pequenas.
  reader.querySelectorAll('button').forEach(button=>button.setAttribute('type','button'));
})();
