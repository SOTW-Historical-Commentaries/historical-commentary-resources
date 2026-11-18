/* Chrome at 390px: clicked Jacob Scripture links resolve to Bible even when
   the target has no separate Jacob commentary. No review-only data published. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
(async()=>{
 const browser=await chromium.launch({headless:true,
  executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',
  args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},
   deviceScaleFactor:1,serviceWorkers:'block'});
  const page=await context.newPage();
  page.setDefaultTimeout(45000);
  const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  // A bounded Webster fixture tests the reader action without fetching the
  // entire 15 MB English dictionary in every browser smoke run.
  await page.route('**/webster1828.json',route=>route.fulfill({status:200,contentType:'application/json',
   headers:{'access-control-allow-origin':'*'},
   body:JSON.stringify({evil:[['EVIL','Harm, wrong, or moral evil.',1]]})}));
  await page.goto('http://127.0.0.1:8765/review-jake-scripture.html?book=ROM&scope=ROM.12.17&translation=BSB',
    {waitUntil:'domcontentloaded'});
  const links=page.locator('#related .scripture-destination');
  await links.first().waitFor({state:'visible'});
  assert((await links.count())>=7,'Romans 12:17 review must surface at least the seven previously published links');
  assert((await page.locator('#incoming .scripture-destination').count())>=1);
  assert.equal(await links.first().innerText(),'Proverbs 20:22');
  const toProverbs=await links.first().getAttribute('href');
  assert.equal(toProverbs,'mobile-bible-beta/?book=PRO&chapter=20&verse=22&translation=BSB');
  assert.match(await page.locator('#related').innerText(),/Supports/);
  assert.match(await page.locator('#related').innerText(),/Qualifies/);
  assert(!/not yet available|Not Yet Accepted/i.test(await page.locator('#related').innerText()));
  await links.first().click();
  await page.waitForURL(/book=PRO&chapter=20&verse=22&translation=BSB/);
  await page.locator('#readerLocation').waitFor({state:'visible'});
  await page.getByText('Proverbs 20',{exact:false}).first().waitFor({state:'visible'});
  // Author panel reached by the Jacob verse marker must expose the same links.
  await page.goto('http://127.0.0.1:8765/mobile-bible-beta/?book=ROM&chapter=12&verse=17&translation=BSB',
    {waitUntil:'domcontentloaded'});
  const marker=page.locator('button.jacob-verse-marker[data-jacob-verse="17"]').first();
  await marker.waitFor({state:'visible'});
  await marker.click();
  await page.locator('#studyOverlay.is-open').waitFor({state:'visible'});
  const mobile=page.locator('#studyOverlay .jacob-passage-link');
  await mobile.first().waitFor({state:'visible'});
  assert((await mobile.count())>=8,'All seven outbound links and chapter-intro inbound relationship must remain followable');
  assert.equal(await mobile.first().innerText(),'Proverbs 20:22');
  assert.match(await page.locator('#studyOverlay').innerText(),/Related Scripture/);
  assert.match(await page.locator('#studyOverlay').innerText(),/Commentary connecting to this passage/);
  assert(!/Accepted pastoral commentary|Not Yet Accepted/i.test(await page.locator('#studyOverlay').innerText()));
  const range=page.locator('#studyOverlay .jacob-passage-link').filter({hasText:'Romans 12:14–16'}).first();
  assert.equal(await range.getAttribute('href'),
    './?book=ROM&chapter=12&verse=14&translation=BSB');
  const returnPill=page.locator('#sotwReturnToPassage');
  assert.equal(await returnPill.isVisible(),false,'Direct incoming Scripture should not invent a return place');
  await mobile.first().click();
  await page.waitForURL(/book=PRO&chapter=20&verse=22&translation=BSB/);
  await returnPill.waitFor({state:'visible'});
  assert.match(await returnPill.innerText(),/Back to Romans 12:17/);
  await returnPill.click();
  await page.waitForURL(/book=ROM&chapter=12&verse=17&translation=BSB/);
  assert.equal(await returnPill.isVisible(),false,'Return control hides on original Scripture');
  assert.match(await page.locator('#readerEdition').innerText(),/BSB/);
  // Exodus has a valid manifest that exposes counts.chapters rather than
  // chapter_verse_count. Following the accepted Jacob reference must work.
  await page.locator('button.jacob-verse-marker[data-jacob-verse="17"]').first().click();
  await page.locator('#studyOverlay .jacob-passage-link').filter({hasText:'Exodus 21:24'}).first().click();
  await page.waitForURL(/book=EXO&chapter=21&verse=24&translation=BSB/);
  await page.locator('#verses .reader-verse[data-verse="24"]').waitFor({state:'visible'});
  assert(!/Cannot verify|Unexpected book manifest/.test(await page.locator('#status').innerText()));
  await returnPill.click();
  await page.waitForURL(/book=ROM&chapter=12&verse=17&translation=BSB/);
  // The BSB publisher supplies G0591, while Strong's stores strongs:G591.
  // The first card must now show its sourced definition ahead of morphology.
  await page.locator('#verses .reader-verse[data-verse="17"]').click();
  await page.locator('#originalLanguageEntry').waitFor({state:'visible'});
  await page.locator('#originalLanguageEntry').click();
  const firstWord=page.locator('#studyOverlay .word-sequence-card').first();
  await firstWord.waitFor({state:'visible'});
  assert.match(await firstWord.innerText(),/Do not repay anyone/);
  assert.match(await firstWord.innerText(),/G0591/);
  await page.waitForFunction(()=>{
   const text=document.querySelector('#studyOverlay .word-sequence-card .word-atlas-short')?.textContent||'';
   return /to give away/i.test(text);
  },null,{timeout:45000});
  // A multiword publisher phrase is never one Webster headword. A verified
  // one-word English gloss can open the separate Webster 1828 dictionary.
  assert.equal(await firstWord.locator('.word-sequence-dictionary').count(),0);
  const evilCard=page.locator('#studyOverlay .word-sequence-card').filter({hasText:/^evil/}).first();
  await evilCard.waitFor({state:'visible'});
  await evilCard.locator('.word-sequence-dictionary').waitFor({state:'visible'});
  await evilCard.locator('.word-sequence-dictionary').click();
  await page.getByText('Harm, wrong, or moral evil.').waitFor({state:'visible'});
  assert.deepEqual(errors,[],'No browser JS errors during Scripture-link and original-language study');
  console.log('PASS: seven Romans links, inbound source, reviewed-only public data, no acceptance badge, review and mobile Scripture navigation');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
