/* Chrome iPhone-width regression: padded BSB Strong's ID and Webster lookup. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,serviceWorkers:'block'});
  const page=await context.newPage();page.setDefaultTimeout(45000);
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  // Small rights-neutral fixture keeps this UI test from downloading the
  // full ~15 MB historical English dictionary; lexical Greek is live source.
  await page.route('**/webster1828.json',route=>route.fulfill({status:200,contentType:'application/json',
   headers:{'access-control-allow-origin':'*'},
   body:JSON.stringify({evil:[['EVIL','Harm, wrong, or moral evil.',1]]})}));
  await page.goto('http://127.0.0.1:8765/mobile-bible-beta/?book=ROM&chapter=12&verse=17&translation=BSB',{waitUntil:'domcontentloaded'});
  const verse=page.locator('#verses .reader-verse[data-verse="17"]');await verse.waitFor({state:'visible'});
  await verse.click();
  const wordAction=page.locator('#originalLanguageEntry');await wordAction.waitFor({state:'visible'});
  await wordAction.click();
  const first=page.locator('#studyOverlay .word-sequence-card').first();
  await first.waitFor({state:'visible'});
  assert.match(await first.innerText(),/Do not repay anyone/);
  assert.match(await first.innerText(),/G0591/);
  await page.waitForFunction(()=>/to give away/i.test(document.querySelector('#studyOverlay .word-sequence-card .word-atlas-short')?.textContent||''),null,{timeout:45000});
  assert.equal(await first.locator('.word-sequence-dictionary').count(),0,'Multiword publisher gloss must not become a fake English headword');
  const evil=page.locator('#studyOverlay .word-sequence-card').filter({hasText:'evil'}).first();
  await evil.waitFor({state:'visible'});
  assert.equal((await evil.locator('.word-atlas-head strong').innerText()).trim(),'evil');
  const dictionary=evil.locator('.word-sequence-dictionary');await dictionary.waitFor({state:'visible'});
  await dictionary.click();
  await page.getByText('Harm, wrong, or moral evil.').waitFor({state:'visible'});
  assert.deepEqual(errors,[]);
  console.log('PASS: G0591 resolves unpadded Strong’s dictionary key; multiword gloss no Webster; single-word English Webster link');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
