/* iPhone-width Chromium: evidence-scoped doctrine badges appear on Jacob's
   commentary entry, not generically on Bible verses or unrelated entries. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
(async()=>{
 const browser=await chromium.launch({headless:true,
  executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',
  args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},
   deviceScaleFactor:1,serviceWorkers:'block'});
  const page=await ctx.newPage();page.setDefaultTimeout(45000);
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const base='http://127.0.0.1:8765/mobile-bible-beta/';
  await page.goto(base+'?book=ACT&chapter=6&verse=1&translation=BSB',{waitUntil:'domcontentloaded'});
  const marker=page.locator('#verses .jacob-verse-marker[data-jacob-verse="1"]');
  await marker.waitFor({state:'visible'});
  assert.equal(await page.locator('#doctrineTags').count(),0,
   'Generic verse-level doctrine display must be removed');
  await marker.click();
  await page.locator('#studyOverlay.is-open').waitFor({state:'visible'});
  const badge=page.locator('#studyOverlay .jacob-doctrine:not([hidden])');
  await badge.waitFor({state:'visible'});
  assert.match(await badge.innerText(),/Doctrine & study terms/);
  assert.match(await badge.innerText(),/The Church/);
  assert.match(await badge.innerText(),/Ecclesiology/);
  assert.match(await badge.innerText(),/church leadership/);
  assert.match(await badge.innerText(),/deacons/);
  assert.equal(await page.locator('.jacob-doctrine').count(),1);
  // A different accepted Jacob entry with no approved doctrine mapping must
  // not inherit Acts/Ecclesiology, despite overlapping broad subjects.
  await page.goto(base+'?book=ROM&chapter=12&verse=17&translation=BSB',{waitUntil:'domcontentloaded'});
  const romanMarker=page.locator('#verses .jacob-verse-marker[data-jacob-verse="17"]');
  await romanMarker.waitFor({state:'visible'});
  await romanMarker.click();
  await page.locator('#studyOverlay.is-open').waitFor({state:'visible'});
  assert.match(await page.locator('#studyOverlay').innerText(),/Refuse Retaliation/);
  assert.equal(await page.locator('#studyOverlay .jacob-doctrine:not([hidden])').count(),0,
   'No unreviewed Roman revenge doctrine is inferred');
  // Chapter context has an approved narrower ACT.2.1-4 theme. Its badge must
  // state that limited passage instead of claiming blanket chapter coverage.
  await page.goto(base+'?book=ACT&chapter=2&verse=1&translation=BSB',{waitUntil:'domcontentloaded'});
  const intro=page.locator('#verses .jacob-chapter-intro');
  await intro.waitFor({state:'visible'});
  await intro.click();
  await page.locator('#studyOverlay.is-open').waitFor({state:'visible'});
  const contextual=page.locator('#studyOverlay .jacob-doctrine:not([hidden])');
  await contextual.waitFor({state:'visible'});
  const content=await contextual.innerText();
  assert.match(content,/Passage theme · Acts 2:1-4/);
  assert.match(content,/The Holy Spirit/);
  assert.match(content,/Pneumatology/);
  assert.match(content,/not a separate verse-by-verse exposition/i);
  assert.deepEqual(errors,[],'No JavaScript errors');
  console.log('PASS: Jacob-only accepted doctrine/alias badge, untagged Romans, scoped Acts 2 passage theme');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
