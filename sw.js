/* Cache limitado ao shell da aplicação. PDFs são acessados pela rede. */
const CACHE='plp-study-shell-2026-10-29-v3';
const ASSETS=['./','./index.html','./styles.css','./v4.css','./v5.css','./v6.css','./skins-extra.css','./study-polish.css','./exam-clock.css','./exam-clock.js','./data.js','./app.js','./v3.js','./v3-content.js','./v4.js','./lab-bank.js','./workshop.js','./manifest.webmanifest','./favicon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('plp-study-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;if(req.mode==='navigate'){event.respondWith(fetch(req).catch(()=>caches.match('./index.html')));return;}event.respondWith(caches.match(req).then(cached=>cached||fetch(req)));});
