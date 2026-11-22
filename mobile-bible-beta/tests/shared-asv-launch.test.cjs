/* Reproduce iPhone shared ASV link failure and verify source-safe recovery. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const official='https://raw.githubusercontent.com/SOTW-ASV-1901/asv-1901-resources/main/data/asv1901/romans/chapters/12.json';
const api='https://api.github.com/repos/SOTW-ASV-1901/asv-1901-resources/contents/data/asv1901/romans/chapters/12.json?ref=main';
const bytes=JSON.stringify({schema_version:'1.0.0',edition_id:'ASV1901',book_code:'ROM',chapter:12,verses:[]});
for(const dir of ['mobile-bible-beta','mobile-bible-sotw']){
 const html=fs.readFileSync(path.join(root,'..',dir,'index.html'),'utf8');
 const begin=html.indexOf('async function fetchTranslationWithFallback(url){');
 const end=html.indexOf('async function getJson(url)',begin);
 assert(begin>=0&&end>begin,'Resilient fetch helper is installed in '+dir);
 const helper=html.slice(begin,end);
 assert(html.includes("fetchTranslationWithFallback(url)"));
 assert(html.includes("retry.textContent='Retry chapter'"));
 const expected={'ASV1901':['ASV','SOTW-ASV-1901/asv-1901-resources','asv1901']};
 let requests=[];
 const sandbox={
  EDITIONS:expected,
  fetch:async (url)=>{
   requests.push(url);
   if(url===official)throw new TypeError('Response served by service worker is an error');
   if(url===api)return {ok:true,json:async()=>({type:'file',encoding:'base64',content:Buffer.from(bytes).toString('base64')})};
   throw Error('unexpected URL '+url);
  },
  atob:encoded=>Buffer.from(encoded,'base64').toString('binary'),
  Uint8Array,TextDecoder,Error,TypeError,JSON,Promise,Object
 };
 vm.runInNewContext(helper+'\nglobalThis.readBible=fetchTranslationWithFallback;',sandbox);
 assert.equal(sandbox.isPublishedEditionSource(official),true,'Official ASV chapter uses the fallback');
 assert.equal(sandbox.isPublishedEditionSource('https://raw.githubusercontent.com/SOTW-Original-Languages/original-language-resources/main/study-data/v1/lexicon/G/G00501-G00750.json'),false,
  'External Strong’s lexicons must continue through the existing normal fetch');
 assert.equal(sandbox.isPublishedEditionSource('https://raw.githubusercontent.com/SOTW-BSB/-bsb-resources/main/data/bsb/helloao-interlinear/v1/chapters/ROM/12.json'),false,
  'Publisher-aligned BSB interlinear is not a Bible edition chapter');

 const resultPromise=sandbox.readBible(official);
 globalThis._pendingTestRuns??=[];
 globalThis._pendingTestRuns.push(resultPromise.then(result=>{
  assert.equal(result.edition_id,'ASV1901');
  assert.equal(result.book_code,'ROM');
  assert.equal(result.chapter,12);
  assert.deepEqual(requests,[official,api]);
  sandbox.fetch=async()=>{throw TypeError('Unavailable')};
  return assert.rejects(sandbox.readBible(official),/Published translation could not be reached/);
 }).then(()=>console.log('PASS '+dir+' exact ASV source API fallback and no substitute on double failure')));
}
async function workerChecks(dir,own,sibling){
 const code=fs.readFileSync(path.join(root,'..',dir,'sw.js'),'utf8');
 const listeners={},deleted=[],keys=[own.slice(0,-5)+'v0000',own,sibling,'unrelated-website-cache'];
 const store={match:async()=>undefined,put:async()=>{}};
 const sandbox={
  self:{location:{origin:'https://example.test'},clients:{claim:async()=>{}},skipWaiting:async()=>{},
   addEventListener:(name,fn)=>listeners[name]=fn},
  caches:{keys:async()=>keys,delete:async key=>{deleted.push(key);return true},open:async()=>store,match:async()=>undefined},
  fetch:async()=>{throw TypeError('network disconnected')},
  URL,Request,Response,Promise,Error
 };
 vm.runInNewContext(code,sandbox,{filename:dir+'/sw.js'});
 let activation;
 listeners.activate({waitUntil:p=>activation=p});
 await activation;
 assert.equal(deleted.length,1,'Only stale own-brand caches should be deleted');
 assert(deleted[0].startsWith(own.split('v0')[0]));
 assert(!deleted.includes(sibling)&&!deleted.includes('unrelated-website-cache'));
 let reply;
 const waits=[];
 listeners.fetch({request:new Request(official),respondWith:p=>reply=p,waitUntil:p=>waits.push(p)});
 const resp=await reply;
 assert.equal(resp.status,503,'Uncached raw source returns recoverable HTTP error, not Response.error()');
 assert.equal(resp.headers.get('Access-Control-Allow-Origin'),'*');
 listeners.fetch({request:new Request('https://example.test/mobile-bible-beta/missing.json'),respondWith:p=>reply=p,waitUntil:p=>waits.push(p)});
 assert.equal((await reply).status,503,'Same-origin uncached network errors produce real HTTP status');
 console.log('PASS '+dir+' cache isolation and recoverable 503 source failures');
}
Promise.all([
 ...(globalThis._pendingTestRuns||[]),
 workerChecks('mobile-bible-beta','sotw-mobile-bible-beta-shell-v0199','sotw-mobile-bible-sotw-shell-v0017'),
 workerChecks('mobile-bible-sotw','sotw-mobile-bible-sotw-shell-v0017','sotw-mobile-bible-beta-shell-v0199')
]).then(()=>console.log('PASS shared ASV link recovery and both SW cache ownership')).catch(e=>{console.error(e);process.exitCode=1});
