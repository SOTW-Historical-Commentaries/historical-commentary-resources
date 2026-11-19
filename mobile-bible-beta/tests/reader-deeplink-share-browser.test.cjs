/* 390px Chromium: explicit deep links, fresh base, persisted resume, and real share destinations. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
(async()=>{
 const browser=await chromium.launch({headless:true,
  executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const dir of ['mobile-bible-beta','mobile-bible-sotw']){
   const base='http://127.0.0.1:8765/'+dir+'/';
   const key=dir==='mobile-bible-beta'?'sotw.mobile.reader.beta.v1':'sotw.mobile.reader.sotw.v1';
   const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,serviceWorkers:'block'});
   const page=await ctx.newPage();page.setDefaultTimeout(45000);
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.addInitScript(()=>{
    Object.defineProperty(navigator,'share',{configurable:true,value:async info=>{window.__lastShared=info;}});
   });
   // Fresh Add-to-Home-Screen base URL defaults to Genesis 1:1, not ROM 12:1.
   await page.goto(base,{waitUntil:'domcontentloaded'});
   await page.locator('#verses .reader-verse[data-verse="1"]').waitFor({state:'visible'});
   assert.match(await page.locator('#readerLocation').innerText(),/Genesis 1/);
   assert.match(await page.locator('#verses .reader-verse[data-verse="1"]').innerText(),/In the beginning/);
   // Share the selected verse using native iPhone-like Web Share.
   await page.locator('#modernMoreButton').click();
   await page.locator('#shareCurrentVerse').click();
   const shared=await page.evaluate(()=>window.__lastShared);
   assert(shared?.url.startsWith(base),dir+' share remains in brand');
   const url=new URL(shared.url);
   assert.equal(url.searchParams.get('book'),'GEN');
   assert.equal(url.searchParams.get('chapter'),'1');
   assert.equal(url.searchParams.get('verse'),'1');
   assert.equal(url.searchParams.get('translation'),'KJV1769');
   await page.close();
   // An old Romans resume must not hijack an explicit Genesis shared link.
   const returning=await ctx.newPage();
   returning.setDefaultTimeout(45000);
   await returning.addInitScript(key=>{
    localStorage.setItem(key,JSON.stringify({book:'ROM',chapter:12,verse:10,edition:'KJV1769'}));
   },key);
   await returning.goto(base+'?book=GEN&chapter=1&verse=1&translation=KJV1769',{waitUntil:'domcontentloaded'});
   await returning.locator('#verses .reader-verse[data-verse="1"]').waitFor({state:'visible'});
   assert.match(await returning.locator('#readerLocation').innerText(),/Genesis 1/);
   assert.equal(new URL(returning.url()).searchParams.get('book'),'GEN');
   // Published Jacob deep link opens the exact commentary in its author panel.
   await returning.goto(base+'?book=ROM&chapter=12&verse=17&translation=KJV1769&jacob=ROM.12.17',
    {waitUntil:'domcontentloaded'});
   await returning.locator('#studyOverlay.is-open').waitFor({state:'visible',timeout:45000});
   assert.match(await returning.locator('#studyOverlay').innerText(),/Refuse Retaliation/);
   await returning.evaluate(()=>{
    Object.defineProperty(navigator,'share',{configurable:true,value:async info=>{window.__lastShared=info;}});
   });
   await returning.locator('.jacob-share-action').first().click();
   const comment=await returning.evaluate(()=>window.__lastShared);
   assert(comment?.url.startsWith(base),dir+' Jacob link must remain on same brand');
   const loc=new URL(comment.url);
   assert.equal(loc.searchParams.get('book'),'ROM');
   assert.equal(loc.searchParams.get('chapter'),'12');
   assert.equal(loc.searchParams.get('verse'),'17');
   assert.equal(loc.searchParams.get('jacob'),'ROM.12.17');
   await returning.goto(base+'?book=ROM&chapter=12&verse=17&translation=KJV1769&jacob=NOT_A_RECORD',
    {waitUntil:'domcontentloaded'});
   await returning.locator('#verses .reader-verse[data-verse="17"]').waitFor({state:'visible'});
   assert.equal(await returning.locator('#studyOverlay.is-open').count(),0,'Unpublished author scope cannot open');
   assert.deepEqual(errors,[],'No browser JavaScript errors');
   await ctx.close();
  }
  console.log('PASS: CGBC/SOTW fresh Genesis 1:1, existing Romans state overridden, verse share and accepted Jacob deep-link round trips');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
