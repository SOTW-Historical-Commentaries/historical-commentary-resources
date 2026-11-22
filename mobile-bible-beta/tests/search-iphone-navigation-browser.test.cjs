/* iPhone Search navigation regression: owner's Ruth -> Noah path.
 * Source IDs are unchanged; browser fixture stabilizes publisher transport. */
"use strict";
const assert=require("node:assert/strict"),{chromium}=require("playwright-core");
(async()=>{
 const browser=await chromium.launch({headless:true,
  executablePath:process.env.CHROME_PATH||"/usr/bin/google-chrome",
  args:["--no-sandbox","--disable-dev-shm-usage"]});
 try{
  for(const brand of ["mobile-bible-beta","mobile-bible-sotw"]){
   const context=await browser.newContext({viewport:{width:390,height:844},
    deviceScaleFactor:3,isMobile:true,hasTouch:true,serviceWorkers:"block"});
   const page=await context.newPage();page.setDefaultTimeout(50000);
   const errors=[],crashes=[];page.on("pageerror",e=>errors.push(String(e)));
   page.on("crash",e=>crashes.push(String(e)));
   await page.route("**/names/entries/noah.json",route=>route.fulfill({
    status:200,contentType:"application/json",body:JSON.stringify({
     id:"utw:v91:names:noah",slug:"noah",title:"Noah",
     collection:"bible/names",source:{publisher:"unfoldingWord",resource:"en_tw",version:"91"},
     sections:{Definition:"Noah was a man who lived over 4,000 years ago, at the time when God sent a worldwide flood."},
     bibleReferences:[
      {label:"Genesis 6:8",resolutionStatus:"READER_ANCHOR_AVAILABLE",
       scriptureTarget:{book:"GEN",chapter:6,verse:8,scope:"GEN.6.8"}},
      {label:"Genesis 8:1",resolutionStatus:"READER_ANCHOR_AVAILABLE",
       scriptureTarget:{book:"GEN",chapter:8,verse:1,scope:"GEN.8.1"}}
     ]
    })
   }));
   await page.goto("http://127.0.0.1:8765/"+brand+"/?book=RUT&chapter=1&verse=1&translation=KJV1769",
    {waitUntil:"domcontentloaded"});
   await page.locator('#verses .reader-verse[data-verse="1"]').waitFor({state:"visible"});
   await page.locator("#modernSearchButton").click();
   const search=page.locator("#modernSearchInput");
   await search.fill("Noah");
   const card=page.locator('.universal-name-card[data-name-id="utw:v91:names:noah"]');
   await page.waitForFunction(()=>document.querySelector('.universal-name-card[data-name-id="utw:v91:names:noah"]')?.textContent?.includes("worldwide flood"));
   // Let the independent Q&A, topic, and author adapters complete too.
   await page.waitForTimeout(1300);
   assert(await card.isVisible(),"Noah profile survives async Search updates");
   assert.equal(await page.locator("#modernSearchResults").evaluate(el=>
    el.firstElementChild?.classList.contains("universal-name-section")),true,
    "Exact Noah profile should lead");
   assert.deepEqual(await page.evaluate(()=>({book:state.book,chapter:state.chapter,verse:state.verse})),
    {book:"RUT",chapter:1,verse:1},"Typing Search cannot navigate Scripture");
   // A self-observing coordinator must settle, not endlessly reorder itself.
   await page.evaluate(()=>{
    const el=document.getElementById("modernSearchResults");
    globalThis.__searchMutations=0;
    const o=new MutationObserver(records=>{globalThis.__searchMutations+=records.length});
    o.observe(el,{childList:true});
    globalThis.__searchMutationMonitor=o;
    SOTWSearchCoordinator.refresh();
   });
   await page.waitForTimeout(350);
   const before=await page.evaluate(()=>globalThis.__searchMutations);
   await page.waitForTimeout(650);
   const after=await page.evaluate(()=>globalThis.__searchMutations);
   assert(after-before<12,"Search mutation observer loop did not settle: "+before+" -> "+after);
   await card.locator(".universal-name-open").click();
   await card.locator(".universal-name-detail").waitFor({state:"visible"});
   await card.locator(".universal-name-detail .universal-qa-ref").first().click();
   await page.waitForFunction(()=>state.book==="GEN"&&state.chapter===6&&
    state.verse===8&&state.edition==="KJV1769");
   await page.locator("#sotwTrailOpen").waitFor({state:"visible"});
   await page.locator("#sotwTrailOpen").click();
   assert.equal(await search.inputValue(),"Noah","Return retains Search query");
   await card.waitFor({state:"visible"});
   assert.deepEqual(errors,[],brand+" Search errors");
   assert.deepEqual(crashes,[],brand+" renderer crashes");
   await context.close();
  }
  console.log("PASS: two brands, iPhone-width Ruth -> Noah Search -> published verse -> back, stable mutations");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
