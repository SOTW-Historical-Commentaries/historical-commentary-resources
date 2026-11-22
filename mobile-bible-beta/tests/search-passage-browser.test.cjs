/* Controlled browser fixture for canonical shared-verse evidence; never modifies source data. */
"use strict";
const assert=require("node:assert/strict");
const {chromium}=require("playwright-core");
(async()=>{
 const browser=await chromium.launch({headless:true,
  executablePath:process.env.CHROME_PATH||"/usr/bin/google-chrome",
  args:["--no-sandbox","--disable-dev-shm-usage"]});
 try{
  for(const brand of ["mobile-bible-beta","mobile-bible-sotw"]){
   const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:"block"});
   const page=await ctx.newPage();page.setDefaultTimeout(45000);
   const errors=[];page.on("pageerror",e=>errors.push(String(e)));
   await page.goto("http://127.0.0.1:8765/"+brand+"/?book=GEN&chapter=1&verse=1&translation=KJV1769",
    {waitUntil:"domcontentloaded"});
   await page.locator('#verses .reader-verse[data-verse="1"]').waitFor({state:"visible"});
   await page.locator("#modernSearchButton").click();
   // The browser fixture exercises already source-qualified adapter payloads.
   // Source contract and raw publisher identity are separately tested in unit QA.
   const install=await page.evaluate(()=>{
    const q=document.getElementById("modernSearchInput"),out=document.getElementById("modernSearchResults");
    q.value="bronze serpent";out.replaceChildren();
    const build=(kind,id,relationship,verse)=>{
     const el=document.createElement(kind==="topic"?"button":"article");
     el.className=kind==="topic"?"discovery-hit":"universal-qa-card";
     el.tabIndex=0;
     el.textContent=kind==="topic"?"Historical index article":"Original publisher question";
     el.dataset.searchEvidence=JSON.stringify([{type:kind,id,relationship,
      targets:[{book:"2KI",chapter:18,verse}]}]);
     return el;
    };
    const qa=build("question","utq:v91:2KI:18:4:ndxy","PUBLISHED_QUESTION_CITATION",4);
    const topic=build("topic","NEUU:TOPIC:serpent","MAPPED_HISTORICAL_INDEX_REFERENCE",4);
    const wrong=build("topic","NEUU:TOPIC:unmapped","TITLE_ONLY",4);
    out.append(qa,topic,wrong);
    globalThis.SOTWSearchCoordinator.refresh();
    return !!globalThis.SOTWSearchCoordinatorCore;
   });
   assert(install,"The shared source-qualified grouping runtime is installed");
   const group=page.locator("#modernSearchResults > .sotw-passage-evidence");
   await group.waitFor({state:"visible"});
   assert.match(await group.innerText(),/Shared Scripture citations/);
   assert.match(await group.innerText(),/2 Kings 18:4/);
   await group.locator("summary").click();
   const buttons=group.locator("button");
   assert.equal(await buttons.count(),3,"One verified source per type, plus Scripture open");
   assert.match(await group.innerText(),/same verse/);
   await group.getByRole("button",{name:/View Historical index/}).click();
   assert(await page.locator(".discovery-hit").first().isVisible());
   // A mismatched exact verse must not create a cross-source group.
   await page.evaluate(()=>{
    const t=document.querySelector(".discovery-hit");
    const x=JSON.parse(t.dataset.searchEvidence);x[0].targets[0].verse=5;
    t.dataset.searchEvidence=JSON.stringify(x);
    globalThis.SOTWSearchCoordinator.refresh();
   });
   await page.waitForFunction(()=>!document.querySelector(".sotw-passage-evidence"));
   await page.evaluate(()=>{
    const t=document.querySelector(".discovery-hit");
    const x=JSON.parse(t.dataset.searchEvidence);x[0].targets[0].verse=4;
    t.dataset.searchEvidence=JSON.stringify(x);
    globalThis.SOTWSearchCoordinator.refresh();
   });
   await group.waitFor({state:"visible"});
   await group.locator("summary").click();
   await group.getByRole("button",{name:/Open 2 Kings 18:4/}).click();
   await page.waitForFunction(()=>state.book==="2KI"&&state.chapter===18&&state.verse===4&&
     state.edition==="KJV1769",null,{timeout:45000});
   assert.equal(await page.locator("#readerEdition").innerText(),"KJV ▾");
   await page.locator("#sotwTrailOpen").waitFor({state:"visible"});
   assert.deepEqual(errors,[],"No browser errors in "+brand);
   await ctx.close();
  }
  console.log("PASS: independently branded readers show and navigate only shared canonical Scripture citations");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
