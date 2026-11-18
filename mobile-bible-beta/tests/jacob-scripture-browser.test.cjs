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
  await page.goto('http://127.0.0.1:8765/review-jake-scripture.html?book=ROM&scope=ROM.12.17&translation=BSB',
    {waitUntil:'domcontentloaded'});
  const links=page.locator('#related .scripture-destination');
  await links.first().waitFor({state:'visible'});
  assert.equal(await links.count(),7,'Romans 12:17 review must surface all seven published Scripture relationships');
  assert.equal(await page.locator('#incoming .scripture-destination').count(),1);
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
  assert.equal(await mobile.count(),8,'Seven outbound plus one chapter-intro inbound Bible link');
  assert.equal(await mobile.first().innerText(),'Proverbs 20:22');
  assert.match(await page.locator('#studyOverlay').innerText(),/Related Scripture/);
  assert.match(await page.locator('#studyOverlay').innerText(),/Commentary connecting to this passage/);
  assert(!/Accepted pastoral commentary|Not Yet Accepted/i.test(await page.locator('#studyOverlay').innerText()));
  const range=page.locator('#studyOverlay .jacob-passage-link').filter({hasText:'Romans 12:14–16'}).first();
  assert.equal(await range.getAttribute('href'),
    './?book=ROM&chapter=12&verse=14&translation=BSB');
  await mobile.first().click();
  await page.waitForURL(/book=PRO&chapter=20&verse=22&translation=BSB/);
  await page.locator('#readerLocation').waitFor({state:'visible'});
  assert.deepEqual(errors,[],'No browser JS errors during Scripture-link navigation');
  console.log('PASS: seven Romans links, inbound source, reviewed-only public data, no acceptance badge, review and mobile Scripture navigation');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
