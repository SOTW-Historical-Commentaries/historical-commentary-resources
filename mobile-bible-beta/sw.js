/* One brand-owned PWA cache; do not delete the sibling Study Bible app's assets. */
const PREFIX='sotw-mobile-bible-beta-shell-';
const CACHE=PREFIX+'v0218';
const SHELL=["./","./index.html","./manifest.webmanifest","./icon.svg","./icons/cgbc-sotw/apple-touch-icon.png","./icons/cgbc-sotw/icon-192.png","./icons/cgbc-sotw/icon-512.png","./icons/cgbc-sotw/icon-maskable-512.png","./study-ux-repair.js","./study-ux-repair.css","./desktop-workspace.css","./discovery-integrations.js","./jacob-scripture-links.js","./reader-return.js","./reader-trail.js","./jacob-search.js","./discovery-integrations.css","./universal-search.js","./universal-search.css","./approved-names-search.js","./search-coordinator.js","./data/universal-search/v1/approved-names.json"];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(
  keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key))
 )).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin===self.location.origin){
  event.respondWith((async()=>{
   try{return await fetch(event.request);}
   catch{
    const saved=await caches.match(event.request);
    return saved||new Response('Network unavailable. Reconnect and retry.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
   }
  })());
 }else if(url.hostname==='raw.githubusercontent.com'){
  event.respondWith((async()=>{
   const store=await caches.open(CACHE);
   try{
    const response=await fetch(event.request);
    if(response.ok)event.waitUntil(store.put(event.request,response.clone()).catch(()=>{}));
    else{const saved=await store.match(event.request);if(saved)return saved;}
    return response;
   }catch{
    const saved=await store.match(event.request);
    // 503 is an ordinary failed HTTP response, not Response.error().
    // The reader can then retry the SAME published file via GitHub's API.
    return saved||new Response('Published Bible source is temporarily unreachable.',{
     status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Access-Control-Allow-Origin':'*'}
    });
   }
  })());
 }
});
