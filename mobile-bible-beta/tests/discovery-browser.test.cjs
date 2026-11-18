/* Headless Chromium (iPhone-width) for v0.17.3 topic-only UI and BSB. */
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
  const page=await context.newPage();page.setDefaultTimeout(45000);
  const errors=[],requests=[];
  page.on('pageerror',error=>errors.push(String(error?.stack||error)));
  page.on('request',request=>requests.push(request.url()));
  // The real topic contract is tested separately. This fixture isolates the
  // verse backlink interaction from intermittent remote index latency.
  await page.route('**/data/topics/nave-torrey/v1/index/by-scripture/GEN.json',route=>route.fulfill({
   status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},
   body:JSON.stringify({schema:'sotw-topics-scripture-index/1.0.0',book_code:'GEN',
    verses:{'GEN.1.1':['NEUU:TOPIC:creation']}})
  }));
  await page.goto('http://127.0.0.1:8765/mobile-bible-beta/?book=GEN&chapter=1&verse=1&translation=BSB',
   {waitUntil:'domcontentloaded'});
  await page.locator('#modernSearchButton').waitFor({state:'visible'});
  await page.locator('#modernSearchButton').click();
  let input=page.locator('#modernSearchInput');
  await input.fill('Forgiveness');
  await page.locator('.discovery-hit').first().waitFor({state:'visible',timeout:45000});
  const searchText=await page.locator('#modernSearchResults').innerText();
  assert.match(searchText,/Historical Bible Topics/i);
  assert(!/People, Places & Events|Accepted People/i.test(searchText));
  await page.locator('.discovery-hit').first().click();
  await page.locator('#sotwDiscoveryDetail.is-open').waitFor({state:'visible'});
  await page.locator('.discovery-topic-group').first().waitFor({state:'visible',timeout:45000});
  assert.match(await page.locator('#sotwDiscoveryDetail .discovery-heading').first().innerText(),/Historical Bible Topic/);
  const group=page.locator('#sotwDiscoveryDetail .discovery-topic-group').first();
  assert.match(await group.locator('summary').innerText(),/OF ENEMIES/i);
  assert.match(await group.locator('summary').innerText(),/19 passages/);
  assert.equal(await group.locator('.discovery-citation').count(),4,
   'Only a few readable source citations should be initially visible');
  assert.match(await group.locator('.discovery-citation').first().innerText(),/Exodus 23:4/);
  await group.locator('.discovery-more').click();
  assert.equal(await group.locator('.discovery-citation').count(),19,
   'Expanded source subsection must retain all 19 mapped citations');
  const allText=await page.locator('#sotwDiscoveryDetail').innerText();
  assert(!/Person ·|Evidence gate:|Additional references are preserved/i.test(allText));
  await page.locator('#sotwDiscoveryDetail .modal-close').click();
  await page.locator('#modernSearchButton').click();
  input=page.locator('#modernSearchInput');
  await input.fill('Jesus');
  await page.locator('.discovery-hit').first().waitFor({state:'visible',timeout:45000});
  assert(!/PEOPLE, PLACES|· person|· place|· event/i.test(
   await page.locator('#modernSearchResults').innerText()));
  await input.fill('Genesis 1:1');
  await page.locator('#modernSearchResults .search-hit').first().click();
  await page.locator('#verses [data-verse="1"]').first().waitFor({state:'visible',timeout:45000});
  await page.waitForTimeout(350);
  await page.locator('#verses [data-verse="1"]').first().click();
  assert.equal(await page.locator('.discovery-bsb').count(),0,
   'Redundant BSB original-language order panel must be absent');
  assert.equal(await page.locator('.discovery-study .discovery-launch').count(),1,
   'Study should show only the compact Related Bible Topics action');
  assert.match(await page.locator('.discovery-study .discovery-launch').innerText(),/Related Bible Topics/);
  // Word-by-Word remains the single full original-language study for BSB.
  await page.locator('#originalLanguageEntry').waitFor({state:'visible'});
  await page.locator('#originalLanguageEntry').click();
  await page.locator('#studyOverlay.is-open .word-sequence-card').first().waitFor({state:'visible',timeout:45000});
  const rows=page.locator('#studyOverlay .word-sequence-card');
  assert.equal(await rows.count(),7);
  assert.match(await rows.nth(0).innerText(),/In the beginning/);
  assert.match(await rows.nth(0).innerText(),/H7225/);
  assert.match(await rows.nth(1).innerText(),/God/);
  assert.match(await rows.nth(2).innerText(),/Not separately translated/);
  assert.equal(await page.locator('#studyOverlay .word-sequence-plain').count(),0);
  await page.locator('#studyOverlayBack').click();
  await page.locator('.discovery-study .discovery-launch').first().click();
  await page.locator('.discovery-verse-body .discovery-heading').first().waitFor({state:'visible',timeout:45000});
  assert.match(await page.locator('.discovery-verse-body').innerText(),/Topics indexed for this verse/);
  assert(!/People, places & events|Chapter-level context/.test(
   await page.locator('.discovery-verse-body').innerText()));
  // Regression: the owner's screenshot verse remains fully aligned to BSB
  // English-order glosses, without a second language-order panel.
  await page.goto('http://127.0.0.1:8765/mobile-bible-beta/?book=MAT&chapter=5&verse=18&translation=BSB',
   {waitUntil:'domcontentloaded'});
  await page.locator('#verses [data-verse="18"]').waitFor({state:'visible',timeout:45000});
  await page.waitForTimeout(350);
  await page.locator('#verses [data-verse="18"]').click();
  assert.equal(await page.locator('.discovery-bsb').count(),0);
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
  await page.locator('#studyOverlayBack').click();
  await page.locator('#modernMoreButton').click();
  await page.locator('#readerMoreModal.is-open').waitFor({state:'visible'});
  assert.match(await page.locator('#readerMoreModal .modal-head').innerText(),/About & Sources/);
  assert(!requests.some(u=>u.includes('/people-time-place/accepted/')),
   'Reader must never request the retired people/place directory');
  assert.deepEqual(errors,[],'No uncaught browser JavaScript errors');
  console.log('PASS topic-only search, compact source sections, no people/place requests, BSB Word-by-Word, About & Sources');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
