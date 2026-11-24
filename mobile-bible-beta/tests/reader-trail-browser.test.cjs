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
  const topicRoot='**/data/topics/nave-torrey/reader/v1/';
  await page.route(topicRoot+'index/topics.json',route=>route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({
   schema:'sotw-topics-search-index/1.0.0',
   topics:[{id:'test-topic-forgiveness',title:'Forgiveness',verse_link_count:2,shard:'shards/fixture.json'}]
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
  // Pixel-independent browser assertion: use the exact same chevron SVG path
  // as the already familiar Back to Scripture control, never a curved emoji.
  const backIcons=await page.evaluate(()=>({
   scripture:document.querySelector('#sotwReturnToPassage svg path')?.getAttribute('d'),
   last:document.querySelector('#sotwTrailOpen svg path')?.getAttribute('d'),
   label:document.querySelector('#sotwTrailOpen')?.innerText
  }));
  assert(backIcons.scripture&&backIcons.last,'Both return controls have left chevrons');
  assert.equal(backIcons.last,backIcons.scripture,'Return glyphs must match exactly');
  assert(!backIcons.label.includes('↩'),'No curved return arrow glyph');

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
  // Owner-reported failure: Genesis pilot has no published per-book manifest.
  // An HTTP 503 for that nonexistent path must not prevent an independently
  // verified GEN index and source translation from opening. Also ensure a
  // genuine failure at another book restores the prior loaded passage.
  for(const brand of ['mobile-bible-beta','mobile-bible-sotw']){
   const p=await context.newPage();p.setDefaultTimeout(45000);
   const runtimeErrors=[];p.on('pageerror',e=>runtimeErrors.push(String(e)));
   let genesisManifestRequests=0;
   await p.route('**/api/v3/snapshots/structured-genesis-2026-11-03/manifest.json',route=>{
    genesisManifestRequests++;
    return route.fulfill({status:503,body:'Service Unavailable'});
   });
   await p.goto('http://127.0.0.1:8765/'+brand+
    '/?book=MAT&chapter=12&verse=33&translation=BSB',{waitUntil:'domcontentloaded'});
   await p.locator('#verses .reader-verse[data-verse="33"]').waitFor({state:'visible'});
   await p.evaluate(()=>{
    const a=document.createElement('a');
    a.id='verified-topic-reference';a.className='discovery-citation jacob-passage-link';
    a.href=location.pathname+'?book=GEN&chapter=1&verse=1&translation=BSB';
    a.textContent='Genesis 1:1';
    document.body.append(a);
   });
   await p.locator('#verified-topic-reference').click();
   await p.waitForURL(/book=GEN&chapter=1&verse=1&translation=BSB/);
   await p.locator('#verses .reader-verse[data-verse="1"]').waitFor({state:'visible'});
   const genesis=await p.evaluate(()=>({
    book:state.book,canonical:state.index?.canonical_chapter,
    translation:state.bible?.edition_id,content:state.bible?.book_code,
    status:document.querySelector('#status')?.textContent
   }));
   assert.equal(genesisManifestRequests,0,'Absent Genesis manifest must never be requested');
   assert.equal(genesis.book,'GEN');assert.equal(genesis.canonical,'GEN.1');
   assert.equal(genesis.content,'GEN');assert.equal(genesis.translation,'BSB');
   assert(!/Cannot verify|HTTP 503/i.test(genesis.status||''));
   await p.locator('#sotwReturnToPassage').click();
   await p.waitForURL(/book=MAT&chapter=12&verse=33&translation=BSB/);
   await p.waitForFunction(()=>state.bible?.book_code==='MAT'&&
    state.index?.canonical_chapter==='MAT.12');
   await p.route('**/api/v3/snapshots/structured-exodus-2026-11-03/manifest.json',route=>
    route.fulfill({status:503,body:'Service Unavailable'}));
   await p.evaluate(()=>{
    const a=document.querySelector('#verified-topic-reference');
    a.href=location.pathname+'?book=EXO&chapter=21&verse=24&translation=BSB';
    a.textContent='Exodus 21:24';
   });
   await p.locator('#verified-topic-reference').click();
   await p.locator('#sotwReturnStatus:visible').waitFor({state:'visible'});
   const afterError=await p.evaluate(()=>({
    book:state.book,chapter:state.chapter,verse:state.verse,
    canonical:state.index?.canonical_chapter,
    translationBook:state.bible?.book_code,selected:document.querySelector('#book').value,
    url:location.search,notice:document.querySelector('#sotwReturnStatus').textContent
   }));
   assert.equal(afterError.book,'MAT');
   assert.equal(afterError.translationBook,'MAT');
   assert.equal(afterError.canonical,'MAT.12');
   assert.equal(afterError.selected,'MAT');
   assert.match(afterError.url,/book=MAT&chapter=12&verse=33/);
   assert.match(afterError.notice,/previous passage was restored/i);
   // Dismissing the optional original-verse return must keep the new passage.
   await p.evaluate(()=>{
    const a=document.querySelector('#verified-topic-reference');
    a.href=location.pathname+'?book=GEN&chapter=1&verse=1&translation=BSB';
    a.textContent='Genesis 1:1';
   });
   await p.locator('#verified-topic-reference').click();
   await p.waitForURL(/book=GEN&chapter=1&verse=1&translation=BSB/);
   await p.locator('#sotwReturnDismiss').waitFor({state:'visible'});
   await p.locator('#sotwReturnDismiss').click();
   assert.equal(await p.locator('#sotwReturnToPassage').isVisible(),false,
    'Return disappears when X is tapped, without navigating');
   assert.equal(await p.evaluate(()=>state.book),'GEN',
    'Dismissing the return keeps the verse currently being read');
   assert.deepEqual(runtimeErrors,[],brand+' navigation errors');
   await p.close();
  }
  console.log('PASS: verified Genesis pilot navigation despite simulated 503 manifest; failing source request restores previous passage in both brands');
  console.log('PASS: topic to verse and back with disclosure/scroll; topic to search; Jacob search returns without retyping, dismiss');
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exit(1)});
