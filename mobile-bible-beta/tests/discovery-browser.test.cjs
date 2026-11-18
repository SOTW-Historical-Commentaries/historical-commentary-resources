/* Desktop Chromium engine at mobile viewport: real SOTW PWA discovery smoke. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,serviceWorkers:'block'});
  const page=await context.newPage();
  // Stable source-shaped fixture for this one verse-backlink request; the
  // live source schemas are checked in the separate integration QA workflow.
  await page.route('**/data/topics/nave-torrey/v1/index/by-scripture/GEN.json',route=>route.fulfill({
   status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},
   body:JSON.stringify({schema:'sotw-topics-scripture-index/1.0.0',book_code:'GEN',
    verses:{'GEN.1.1':['NEUU:TOPIC:creation']}})
  }));
  page.setDefaultTimeout(45000);
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(String(error?.stack||error)));
  await page.goto('http://127.0.0.1:8765/mobile-bible-beta/?book=GEN&chapter=1&verse=1&translation=BSB',{waitUntil:'domcontentloaded'});
  await page.locator('#modernSearchButton').waitFor({state:'visible'});
  await page.locator('#modernSearchButton').click();
  const input=page.locator('#modernSearchInput');
  await input.fill('Aaron');
  await page.locator('.discovery-search-label').first().waitFor({state:'visible',timeout:45000});
  assert.match(await page.locator('#modernSearchResults').innerText(),/Historical Bible Topics/i);
  await page.locator('.discovery-hit').first().click();
  await page.locator('#sotwDiscoveryDetail.is-open').waitFor({state:'visible'});
  assert.match(await page.locator('#sotwDiscoveryDetail .discovery-heading').first().innerText(),/Historical Bible Topic/);
  await page.locator('#sotwDiscoveryDetail .modal-close').click();
  await page.locator('#modernSearchButton').click();
  await input.fill('Cain');
  await page.locator('.discovery-hit').filter({hasText:'Cain · person'}).first().waitFor({state:'visible',timeout:45000});
  await page.locator('.discovery-hit').filter({hasText:'Cain · person'}).first().click();
  await page.locator('#sotwDiscoveryDetail.is-open').waitFor({state:'visible'});
  assert.match(await page.locator('#sotwDiscoveryDetail').innerText(),/Accepted\/source-qualified CGBC research/);
  await page.locator('#sotwDiscoveryDetail .modal-close').click();
  await page.locator('#modernSearchButton').click();
  await input.fill('Genesis 1:1');
  await page.locator('#modernSearchResults .search-hit').first().click();
  await page.locator('#verses [data-verse="1"]').first().waitFor({state:'visible',timeout:45000});
  // Passage jump scrolls the reader: allow its existing 160 ms gesture guard to settle.
  await page.waitForTimeout(350);
  await page.locator('#verses [data-verse="1"]').first().click();
  await page.locator('.discovery-bsb .discovery-launch').waitFor({state:'visible'});
  await page.locator('.discovery-bsb .discovery-launch').click();
  await page.locator('.discovery-word strong').first().waitFor({state:'visible',timeout:45000});
  assert.match(await page.locator('.discovery-original-body').innerText(),/bsbPos is BSB English-phrase order/);
  assert.match(await page.locator('.discovery-original-body').innerText(),/H7225/);
  // BSB must now have the SAME Word-by-Word card layout as the other editions,
  // populated from publisher-supplied BSB glosses in bsbPos English order.
  await page.locator('#originalLanguageEntry').waitFor({state:'visible',timeout:45000});
  await page.locator('#originalLanguageEntry').click();
  await page.locator('#studyOverlay.is-open .word-sequence-card').first().waitFor({state:'visible',timeout:45000});
  const bsbRows=page.locator('#studyOverlay .word-sequence-card');
  assert.equal(await bsbRows.count(),7,'Genesis 1:1 must have seven published BSB interlinear source-word cards');
  assert.match(await bsbRows.nth(0).innerText(),/In the beginning/);
  assert.match(await bsbRows.nth(0).innerText(),/H7225/);
  assert.match(await bsbRows.nth(1).innerText(),/God/);
  assert.match(await bsbRows.nth(1).innerText(),/H0430/);
  assert.match(await bsbRows.nth(2).innerText(),/Not separately translated/);
  assert.match(await bsbRows.nth(3).innerText(),/created/);
  assert.equal(await page.locator('#studyOverlay .word-sequence-plain').count(),0,
    'BSB must not fall back to the previous empty English word rows');
  assert.match(await bsbRows.nth(0).innerText(),/בְּרֵאשִׁ/);
  await page.locator('#studyOverlayBack').click();
  await page.locator('.discovery-study:not(.discovery-bsb) .discovery-launch').first().click();
  await page.locator('.discovery-verse-body:not([hidden])').waitFor({state:'visible',timeout:45000});
  await page.locator('.discovery-verse-body .discovery-heading').first().waitFor({state:'visible',timeout:45000});
  assert.match(await page.locator('.discovery-verse-body').innerText(),/Historical topic links/);
  // Owner's iPhone example: Matthew 5:18 has 27 publisher interlinear
  // entries; the BSB English-order starts For / I tell / you / truly, NOT
  // the original Greek sequence truly / For / I tell / you.
  await page.goto('http://127.0.0.1:8765/mobile-bible-beta/?book=MAT&chapter=5&verse=18&translation=BSB',
    {waitUntil:'domcontentloaded'});
  await page.locator('#verses [data-verse="18"]').waitFor({state:'visible',timeout:45000});
  await page.waitForTimeout(350);
  await page.locator('#verses [data-verse="18"]').click();
  await page.locator('#originalLanguageEntry').waitFor({state:'visible'});
  await page.locator('#originalLanguageEntry').click();
  await page.locator('#studyOverlay.is-open .word-sequence-card').first().waitFor({state:'visible',timeout:45000});
  const greek=page.locator('#studyOverlay .word-sequence-card');
  assert.equal(await greek.count(),27);
  assert.match(await greek.nth(0).innerText(),/For/);
  assert.match(await greek.nth(0).innerText(),/G1063/);
  assert.match(await greek.nth(1).innerText(),/I tell/);
  assert.match(await greek.nth(2).innerText(),/you/);
  assert.match(await greek.nth(3).innerText(),/truly/);
  assert.equal(await page.locator('#studyOverlay .word-sequence-plain').count(),0);
  assert.deepEqual(pageErrors,[],'Uncaught reader JavaScript errors');
  console.log('PASS: mobile viewport, historical topics, accepted people, BSB seven aligned word cards, English gloss order, passage backlinks');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
