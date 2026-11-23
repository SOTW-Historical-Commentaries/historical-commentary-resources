/* One brand-owned PWA cache; do not delete the sibling Study Bible app's assets. */
const PREFIX='sotw-mobile-bible-sotw-shell-';
const CACHE=PREFIX+'v0031';
const SHELL=["./","./index.html","./manifest.webmanifest","./icons/sotw/apple-touch-icon.png","./icons/sotw/icon-192.png","./icons/sotw/icon-512.png","./icons/sotw/icon-maskable-512.png","./branding/v1/SOTW_Bible_and_Name_Transparent.png","./branding/v1/Bible_and_Wordmark_Dark_Grey_4x_Transparent.png","../mobile-bible-beta/study-ux-repair.js","../mobile-bible-beta/study-ux-repair.css","../mobile-bible-beta/desktop-workspace.css","../mobile-bible-beta/discovery-integrations.js","../mobile-bible-beta/jacob-scripture-links.js","../mobile-bible-beta/reader-return.js","../mobile-bible-beta/reader-trail.js","../mobile-bible-beta/jacob-search.js","../mobile-bible-beta/discovery-integrations.css","../mobile-bible-beta/universal-search.js","../mobile-bible-beta/universal-search.css","../mobile-bible-beta/approved-names-search.js","../mobile-bible-beta/search-coordinator.js","../mobile-bible-beta/data/universal-search/v1/approved-names.json"];
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
