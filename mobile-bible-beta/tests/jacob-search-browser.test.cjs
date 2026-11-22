/* iPhone-width Chromium: published Jacob discovery + marker-first verse focus. */
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
  const errors=[];page.on('pageerror',err=>errors.push(String(err)));
  await page.goto('http://127.0.0.1:8765/mobile-bible-beta/?book=ROM&chapter=12&verse=10&translation=BSB',
   {waitUntil:'domcontentloaded'});
  await page.locator('#verses .reader-verse[data-verse="10"]').waitFor({state:'visible'});
  await page.locator('#modernSearchButton').click();
  const input=page.locator('#modernSearchInput');
  // Ordinary Jacob queries are compact: the full catalog remains in the
  // published source but does not bury the search field and Bible results.
  await input.fill('Lannom');
  await page.waitForFunction(()=>document.querySelector('.jacob-search-section')?.textContent.includes('(20)'));
  const group=page.locator('details.jacob-search-results');
  assert.equal(await group.getAttribute('open'),null,'Lannom stays collapsed');
  assert.equal(await page.locator('.jacob-search-hit').count(),20,'All published entries preserved in collapsible list');
  assert.equal(await page.locator('.jacob-search-hit:visible').count(),0);
  // Explicit author All is the intentional expand-everything command.
  await input.fill('Lannom all');
  await page.waitForFunction(()=>document.querySelector('.jacob-search-results[open]')?.querySelectorAll('.jacob-search-hit').length===20);
  // Simulate the reduced visual area while an iOS software keyboard is open.
  await page.setViewportSize({width:390,height:430});
  await page.waitForTimeout(120);
  const scroll=await page.evaluate(()=>{
    const pane=document.getElementById('modernSearchResults');
    const field=document.getElementById('modernSearchInput').getBoundingClientRect();
    const area=pane.getBoundingClientRect();
    const modal=document.getElementById('readerSearchModal').getBoundingClientRect();
    pane.scrollTop=pane.scrollHeight;
    const down=pane.scrollTop;
    pane.scrollTop=0;
    const up=pane.scrollTop;
    return {down,up,fieldTop:field.top,fieldBottom:field.bottom,areaTop:area.top,
      modalTop:modal.top,modalBottom:modal.bottom,viewportHeight:visualViewport.height};
  });
  assert(scroll.down>100,'Published results must scroll independently: '+JSON.stringify(scroll));
  assert.equal(scroll.up,0,'Reader must scroll back to top');
  assert(scroll.fieldTop>=0&&scroll.fieldBottom<=scroll.viewportHeight+2,'Search input must remain visible: '+JSON.stringify(scroll));
  assert(scroll.areaTop>=scroll.fieldBottom,'Only results should scroll: '+JSON.stringify(scroll));
  assert(scroll.modalBottom<=scroll.viewportHeight+3,'Sheet must stay above keyboard-sized viewport: '+JSON.stringify(scroll));
  assert.equal(await input.evaluate(e=>document.activeElement===e),true,'Typing focus preserved');
  await page.setViewportSize({width:390,height:844});
  await input.fill('Lannom Romans');
  await page.waitForFunction(()=>document.querySelector('.jacob-search-section')?.textContent.includes('(4)'));
  assert.equal(await group.getAttribute('open'),null,'Book-filtered author list is collapsed');
  await group.locator('summary').click();
  const scopes=await page.locator('.jacob-search-hit').evaluateAll(els=>els.map(e=>e.dataset.jacobScope).sort());
  assert.deepEqual(scopes,['ROM','ROM.12','ROM.12.17','ROM.12.18']);
  await input.fill('Revenge Lannom');
  await page.waitForFunction(()=>document.querySelector('.jacob-search-section')?.textContent.includes('(6)'));
  assert.equal(await group.getAttribute('open'),null,'Topical author list is collapsed');
  await group.locator('summary').click();
  await page.locator('.jacob-search-hit[data-jacob-scope="ROM.12.17"]').waitFor({state:'visible'});
  const choices=await page.locator('.jacob-search-hit').evaluateAll(els=>els.map(e=>e.dataset.jacobScope));
  assert(choices.includes('GEN.45.1-8'));
  await page.locator('.jacob-search-hit[data-jacob-scope="ROM.12.17"]').click();
  await page.waitForURL(/book=ROM&chapter=12&verse=17&translation=BSB/);
  await page.locator('#studyOverlay.is-open').waitFor({state:'visible'});
  assert.match(await page.locator('#studyOverlay').innerText(),/Refuse Retaliation/);
  // Reader anchor is set before opening the genuine author panel.
  const marker=page.locator('#verses .jacob-verse-marker[data-jacob-verse="17"]');
  const geo=await page.evaluate(()=>{
   const pane=document.getElementById('verses').getBoundingClientRect();
   const anchor=document.querySelector('#verses .jacob-verse-marker[data-jacob-verse="17"]').getBoundingClientRect();
   return {top:anchor.top-pane.top,pane:document.getElementById('verses').scrollTop};
  });
  assert(geo.top>=-3&&geo.top<=30,'Jacob marker must align at reader top, got '+JSON.stringify(geo));
  // Open an ordinary Scripture reference next: no author marker, so use verse.
  await page.evaluate(()=>{
   document.getElementById('studyOverlay').classList.remove('is-open');
   betaCloseSheet();
  });
  await page.locator('#modernSearchButton').click();
  await input.fill('Exodus 13:12');
  const open=page.locator('#modernSearchResults button.search-hit').filter({hasText:'Open Exodus 13:12'});
  await open.waitFor({state:'visible'});await open.click();
  await page.waitForURL(/book=EXO&chapter=13&verse=12&translation=BSB/);
  await page.locator('#verses .reader-verse[data-verse="12"]').waitFor({state:'visible'});
  const normal=await page.evaluate(()=>{
   const pane=document.getElementById('verses').getBoundingClientRect();
   const target=document.querySelector('#verses .reader-verse[data-verse="12"]').getBoundingClientRect();
   return {top:target.top-pane.top};
  });
  assert(normal.top>=-3&&normal.top<=30,'Ordinary verse must align at reader top, got '+JSON.stringify(normal));
  assert.deepEqual(errors,[],'No browser JavaScript errors');
  console.log('PASS: Lannom all, Romans filter, revenge search, exact commentary, marker-first and ordinary reference alignment');
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exit(1)});
