const CACHE='hohk-v1';
const CORE=['./','./index.html','./qrcode.min.js','./og.png','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  // App navigation -> network-first, fall back to cached shell (offline)
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return r;}).catch(()=>caches.match('./index.html')));
    return;
  }
  // Same-origin static -> cache-first
  if(url.origin===location.origin){
    e.respondWith(caches.match(req).then(c=>c||fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(ch=>ch.put(req,cp));return r;})));
    return;
  }
  // Cross-origin (fonts/images) -> stale-while-revalidate
  e.respondWith(caches.match(req).then(c=>{const f=fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(ch=>ch.put(req,cp));return r;}).catch(()=>c); return c||f;}));
});
