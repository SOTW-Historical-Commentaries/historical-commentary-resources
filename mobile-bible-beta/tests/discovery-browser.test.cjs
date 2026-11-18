/* Desktop Chromium engine at mobile viewport: real SOTW PWA discovery smoke. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  page.setDefaultTimeout(45000);
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(String(error?.stack||error)));
  await page.goto('http://127.0.0.1:8765/mobile-bible-beta/?book=GEN&chapter=1&verse=1&translation=BSB',{waitUntil:'domcontentloaded'});
  await page.locator('#modernSearchButton').waitFor({state:'visible'});
  await page.locator('#modernSearchButton').click();
  const input=page.locator('#modernSearchInput');
  await input.fill('Aaron');
  await page.locator('.discovery-search-label').first().waitFor({state:'visible',timeout:45000});
  assert.match(await page.locator('#modernSearchResults').innerText(),/Historical Bible Topics/);
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
  await page.locator('#verses [data-verse="1"]').first().click();
  await page.locator('.discovery-bsb .discovery-launch').waitFor({state:'visible'});
  await page.locator('.discovery-bsb .discovery-launch').click();
  await page.locator('.discovery-word strong').first().waitFor({state:'visible',timeout:45000});
  assert.match(await page.locator('.discovery-original-body').innerText(),/bsbPos is not an English word position/);
  assert.match(await page.locator('.discovery-original-body').innerText(),/H7225/);
  await page.locator('.discovery-study:not(.discovery-bsb) .discovery-launch').first().click();
  await page.locator('.discovery-verse-body:not([hidden])').waitFor({state:'visible',timeout:45000});
  assert.match(await page.locator('.discovery-verse-body').innerText(),/Historical topic links/);
  assert.deepEqual(pageErrors,[],'Uncaught reader JavaScript errors');
  console.log('PASS: mobile viewport, topic search, accepted person, BSB source, passage backlinks and no uncaught JS errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
