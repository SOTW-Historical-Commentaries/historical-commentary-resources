/* iPhone-width navigation trail: restore exact search or expanded topic UI. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
(async()=>{
 const browser=await chromium.launch({headless:true,
  executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',
  args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,serviceWorkers:'block'});
  const page=await context.newPage();page.setDefaultTimeout(45000);
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  const base='http://127.0.0.1:8765/mobile-bible-beta/';
  const topicRoot='**/data/topics/nave-torrey/v1/';
  await page.route(topicRoot+'index/topics.json',route=>route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({
   schema:'sotw-topics-search-index/1.0.0',
   topics:[{id:'test-topic-forgiveness',title:'Forgiveness',shard:'shards/fixture.json'}]
  })}));
  await page.route(topicRoot+'shards/fixture.json',route=>route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({
   schema:'sotw-topics-neuu-shard/1.0.0',
   topics:[{id:'test-topic-forgiveness',title:'Forgiveness',
    references:[{raw:'Exodus 21:24',status:'mapped',verse_ids:['EXO.21.24']},
                {raw:'Genesis 45:1',status:'mapped',verse_ids:['GEN.45.1']}],
    aspects:[{label:'.Forgiveness and enemies',references:['Exodus 21:24','Genesis 45:1']}]
   }]
  })}));
  await page.goto(base+'?book=ROM&chapter=12&verse=17&translation=BSB',{waitUntil:'domcontentloaded'});
  await page.locator('#verses .reader-verse[data-verse="17"]').waitFor({state:'visible'});
  await page.locator('#modernSearchButton').click();
  const input=page.locator('#modernSearchInput');
  await input.fill('Forgiveness');
  await page.locator('#modernSearchResults .discovery-hit').first().waitFor({state:'visible'});
  await page.locator('#modernSearchResults .discovery-hit').first().click();
  await page.locator('#sotwDiscoveryDetail.is-open .discovery-topic-group').first().waitFor({state:'visible'});
  await page.locator('.discovery-back-search').waitFor({state:'visible'});
  // The user can return directly from a Nave topic to the exact search list.
  await page.locator('.discovery-back-search').click();
  await page.locator('#readerSearchModal.is-open').waitFor({state:'visible'});
  assert.equal(await input.inputValue(),'Forgiveness');
  await page.locator('#modernSearchResults .discovery-hit').first().click();
  await page.locator('#sotwDiscoveryDetail.is-open .discovery-topic-group').first().waitFor({state:'visible'});
  await page.locator('.discovery-topic-group').first().locator('summary').click();
  assert.equal(await page.locator('.discovery-topic-group').first().getAttribute('open'),null);
  await page.locator('.discovery-topic-group').first().locator('summary').click();
  const topicScroll=await page.locator('#sotwDiscoveryDetail .modal-content').evaluate(node=>{
   node.scrollTop=41;return node.scrollTop;
  });
  await page.locator('#sotwDiscoveryDetail .discovery-citation').first().click();
  await page.waitForURL(/book=EXO&chapter=21&verse=24&translation=BSB/);
  const button=page.locator('#sotwTrailOpen');await button.waitFor({state:'visible'});
  assert.match(await button.innerText(),/Back to Topic · Forgiveness/);
  await button.click();
  await page.locator('#sotwDiscoveryDetail.is-open').waitFor({state:'visible'});
  assert.equal(await page.locator('.discovery-topic-group').first().getAttribute('open'),'');
  assert.equal(await page.locator('#sotwDiscoveryDetail .discovery-citation').count(),2);
  assert.equal(await page.locator('#sotwDiscoveryDetail .modal-content').evaluate(node=>node.scrollTop),topicScroll);
  await page.locator('#sotwDiscoveryDetail .modal-close').click();
  await page.locator('#sotwTrailDismiss').click();
  assert.equal(await page.locator('#sotwTrail').isVisible(),false,'Dismiss clears optional trail');
  // Search navigation should retain its *existing* results, not retype.
  await page.locator('#modernSearchButton').click();
  await input.fill('Lannom Romans');
  await page.locator('.jacob-search-results summary').waitFor({state:'visible'});
  await page.locator('.jacob-search-results summary').click();
  await page.locator('.jacob-search-hit[data-jacob-scope="ROM.12.17"]').click();
  await page.waitForURL(/book=ROM&chapter=12&verse=17&translation=BSB/);
  await page.locator('#studyOverlay.is-open').waitFor({state:'visible'});
  await page.locator('#studyClose').click();
  await page.locator('#sotwTrailOpen').waitFor({state:'visible'});
  assert.match(await page.locator('#sotwTrailOpen').innerText(),/Back to Search · Lannom Romans/);
  await page.locator('#sotwTrailOpen').click();
  await page.locator('#readerSearchModal.is-open').waitFor({state:'visible'});
  assert.equal(await input.inputValue(),'Lannom Romans');
  assert.equal(await page.locator('.jacob-search-results').getAttribute('open'),'');
  assert.equal(await page.locator('.jacob-search-hit:visible').count(),4);
  assert.deepEqual(errors,[]);
  console.log('PASS: topic to verse and back with disclosure/scroll; topic to search; Jacob search returns without retyping, dismiss');
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exit(1)});
