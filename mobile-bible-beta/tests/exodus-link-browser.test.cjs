/* Chrome at iPhone width: Exodus 21:24 must open from published Jacob links. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,serviceWorkers:'block'});
  const page=await context.newPage();page.setDefaultTimeout(45000);
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:8765/mobile-bible-beta/?book=ROM&chapter=12&verse=17&translation=BSB',{waitUntil:'domcontentloaded'});
  const marker=page.locator('button.jacob-verse-marker[data-jacob-verse="17"]').first();
  await marker.waitFor({state:'visible'});await marker.click();
  const link=page.locator('#studyOverlay .jacob-passage-link').filter({hasText:'Exodus 21:24'}).first();
  await link.waitFor({state:'visible'});await link.click();
  await page.waitForURL(/book=EXO&chapter=21&verse=24&translation=BSB/);
  const verse=page.locator('#verses .reader-verse[data-verse="24"]');
  await verse.waitFor({state:'visible'});
  assert.match(await verse.innerText(),/eye for eye, tooth for tooth/i);
  assert(!/Cannot verify|Unexpected book manifest/.test(await page.locator('#status').innerText()));
  const back=page.locator('#sotwReturnToPassage');await back.waitFor({state:'visible'});
  await back.click();await page.waitForURL(/book=ROM&chapter=12&verse=17&translation=BSB/);
  assert.deepEqual(errors,[]);
  console.log('PASS: accepted Jacob Exodus 21:24 link loads real BSB Scripture and returns to Romans');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
