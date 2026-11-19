/* Dual branded Study Bible PWA: exact owner-supplied image bytes and distinct app scope. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const brands=[
 {dir:'mobile-bible-beta',icons:'cgbc-sotw',label:'CGBC',samples:[
 ['apple-touch-icon.png',180,'26799955075611d89ca99a5ebee13feea78d70c238d3f0500e7f8fa7d6dddbe3'],
 ['icon-192.png',192,'9f57f0337bfcd41c6adeab2d7028034e33fad025320cbaf029ddba1e8f526838'],
 ['icon-512.png',512,'4ed360fe364dd241738fe12d9c9404009a6569f8af7bafca106380fb823ecfae'],
 ['icon-maskable-512.png',512,'79ec6bbc920eb28413b8aee25d7831d7973a92657a1cb2444d387f2db9a08b87']
 ]},
 {dir:'mobile-bible-sotw',icons:'sotw',label:'SOTW',samples:[
 ['apple-touch-icon.png',180,'717590f9af94df0a64310a25c6b1eac6cc7fbb89ea21da38a8daa6e142ae62e5'],
 ['icon-192.png',192,'d01d217f095960b7a95877406e3ee57e8777d6a9d9aa1a71b7890ca2817e3df3'],
 ['icon-512.png',512,'e41c0fad6b4663a92f0c6ae38471936cbf69fa64545287b375063227f1e93b8b'],
 ['icon-maskable-512.png',512,'bf33ed5b9f20333be46dfb41a7fb60eac2e3ba8511d1108d49041fe63da5b106']
 ]}
];
for(const b of brands){
 const dir=path.join(root,b.dir);
 const index=fs.readFileSync(path.join(dir,'index.html'),'utf8');
 const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.webmanifest'),'utf8'));
 const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');
 assert.equal(manifest.name,'Study Bible',b.label);
 assert.equal(manifest.short_name,'Study Bible',b.label);
 assert.equal(manifest.start_url,'./');
 assert.equal(manifest.scope,'./');
 assert.equal(manifest.id,'./');
 assert.match(index,/name="apple-mobile-web-app-title" content="Study Bible"/);
 assert(index.includes('apple-touch-icon.png'),'Apple icon link required');
 assert(index.includes('manifest.webmanifest'));
 assert(manifest.icons.some(i=>i.purpose==='maskable'));
 for(const [name,size,expected] of b.samples){
  const png=fs.readFileSync(path.join(dir,'icons',b.icons,name));
  assert.equal(crypto.createHash('sha256').update(png).digest('hex'),expected,name+' MUST be exact source bytes');
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG header');
  assert.equal(png.readUInt32BE(16),size,name+' width');
  assert.equal(png.readUInt32BE(20),size,name+' height');
  assert(sw.includes(name),'Service worker precaches '+name);
 }
}
const cgbc=fs.readFileSync(path.join(root,'mobile-bible-beta','index.html'),'utf8');
const sotw=fs.readFileSync(path.join(root,'mobile-bible-sotw','index.html'),'utf8');
const swC=fs.readFileSync(path.join(root,'mobile-bible-beta','sw.js'),'utf8');
const swS=fs.readFileSync(path.join(root,'mobile-bible-sotw','sw.js'),'utf8');
assert(cgbc.includes('cgbc-sotw-full-header-900.png'),'Retain CGBC approved reader header');
assert(!sotw.includes('cgbc-sotw-full-header-900.png'),'Never show CGBC header on SOTW');
assert(sotw.includes('<base href="../mobile-bible-beta/">'),'Share functioning code, not duplicate canonical Bible data');
assert(sotw.includes('src="../mobile-bible-sotw/icons/sotw/icon-192.png"'));
assert(sotw.includes('href="../mobile-bible-sotw/manifest.webmanifest"'));
assert(sotw.includes("navigator.serviceWorker.register('../mobile-bible-sotw/sw.js')"));
assert(swC.includes('shell-v0184')&&swS.includes('shell-v0001'),'Distinct caches');
assert(swS.includes('../mobile-bible-beta/jacob-search.js'),'SOTW shares published reader runtime');
assert(!fs.existsSync(path.join(root,'mobile-bible-sotw','api')),'No second canonical author collection');
console.log('PASS: 8 exact approved PNGs, both 180/192/512/maskable sets, unique scoped Study Bible PWAs and distinct branding');
