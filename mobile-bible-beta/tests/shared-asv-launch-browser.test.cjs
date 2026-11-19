/* New-user ASV1901 shared link works when raw GitHub delivery fails.
   Test API response is the byte-identical published ASV Romans 12 fixture. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright-core');
const fixture=fs.readFileSync(path.resolve(__dirname,'fixtures/romans-12-asv1901.json'),'utf8');
const expected=JSON.parse(fixture);
assert.equal(expected.edition_id,'ASV1901');
assert.equal(expected.book_code,'ROM');
assert.equal(expected.chapter,12);
assert.equal(expected.verses.length,21);
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const dir of ['mobile-bible-beta','mobile-bible-sotw']){
   // Fresh browser context without the owner's cache/cookies. Simulate the
   // exact cross-origin network error in the user's screenshot.
   const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,serviceWorkers:'block'});
   const page=await context.newPage();page.setDefaultTimeout(45000);
   const scriptErrors=[];
   page.on('pageerror',e=>scriptErrors.push(String(e)));
   const encoded=Buffer.from(fixture).toString('base64');
   await page.addInitScript((b64)=>{
    window.__sourceRequests=[];
    const orig=window.fetch.bind(window);
    window.fetch=(resource,init)=>{
     const url=String(resource?.url||resource);
     if(url.includes('raw.githubusercontent.com/SOTW-ASV-1901/asv-1901-resources/main/data/asv1901/romans/chapters/12.json')){
      window.__sourceRequests.push('raw');
      return Promise.reject(new TypeError('Response served by service worker is an error'));
     }
     if(url.includes('api.github.com/repos/SOTW-ASV-1901/asv-1901-resources/contents/data/asv1901/romans/chapters/12.json?ref=main')){
      window.__sourceRequests.push('api');
      return Promise.resolve(new Response(JSON.stringify({type:'file',encoding:'base64',content:b64}),
       {status:200,headers:{'Content-Type':'application/json'}}));
     }
     return orig(resource,init);
    };
   },encoded);
   const link='http://127.0.0.1:8765/'+dir+'/?book=ROM&chapter=12&verse=17&translation=ASV1901';
   await page.goto(link,{waitUntil:'domcontentloaded'});
   const verse=page.locator('#verses .reader-verse[data-verse="17"]');
   await verse.waitFor({state:'visible'});
   const text=await verse.innerText();
   const actual=expected.verses.find(v=>v.verse===17).spans.map(s=>s.text).join('');
   assert(text.includes(actual.slice(0,34)),'Exact ASV verse 17 should display after fallback');
   const requests=await page.evaluate(()=>window.__sourceRequests);
   assert.deepEqual(requests,['raw','api'],'Fallback must first try the original source, then official GitHub API');
   assert(!await page.locator('#status.error').isVisible(),'No blocked status or false translation substitute');
   assert.deepEqual(scriptErrors,[]);
   await context.close();
  }
  console.log('PASS: fresh installed-link ASV Romans 12 verse 17 with original raw request blocked; official GitHub API fallback in CGBC and SOTW');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
