"use strict";
const assert=require("node:assert/strict"),{chromium}=require("playwright-core");
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||"/usr/bin/google-chrome",args:["--no-sandbox","--disable-dev-shm-usage"]});
 try{
  for(const brand of ["mobile-bible-beta","mobile-bible-sotw"]){
   const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:"block"});
   const page=await context.newPage();page.setDefaultTimeout(50000);
   const errors=[];page.on("pageerror",e=>errors.push(String(e)));
   const abraham={
    id:"utw:v91:names:abraham",slug:"abraham",title:"Abraham, Abram",collection:"bible/names",
    source:{publisher:"unfoldingWord",resource:"en_tw",version:"91"},
    sections:{Definition:"Abram was a Chaldean man from the city of Ur who was chosen by God to be the forefather of the Israelites."},
    bibleReferences:[{label:"Galatians 3:8",resolutionStatus:"READER_ANCHOR_AVAILABLE",
      scriptureTarget:{book:"GAL",chapter:3,verse:8,scope:"GAL.3.8"}}]
   };
   // Stub the immutable published record transport. The allowlist and
   // excluded IDs always come from the real local review-pinned index.
   await page.route("**/names/entries/abraham.json",route=>route.fulfill({
     status:200,contentType:"application/json",body:JSON.stringify(abraham)}));
   await page.route("**/names/qa-links/v1/by-name/abraham.json",route=>route.fulfill({
     status:503,contentType:"application/json",body:"{}"}));
   await page.goto("http://127.0.0.1:8765/"+brand+"/?book=GEN&chapter=1&verse=1&translation=KJV1769",{waitUntil:"domcontentloaded"});
   await page.locator('#verses .reader-verse[data-verse="1"]').waitFor({state:"visible"});
   await page.locator("#modernSearchButton").click();
   const input=page.locator("#modernSearchInput");
   await input.fill("Abram");
   const profile=page.locator('.universal-name-card[data-name-id="utw:v91:names:abraham"]');
   await profile.waitFor({state:"visible"});
   assert((await profile.innerText()).includes("forefather of the Israelites"),"Published article definition visible");
   await profile.locator(".universal-qa-source").click();
   const source=page.locator("#readerSourcesAttribution #approvedNameSourceAttribution");
   await source.waitFor({state:"visible"});
   assert((await source.innerText()).includes("CC BY-SA 4.0"),"Names source points to publisher and license in hamburger");
   await page.locator("#readerMoreModal .modal-close").click();
   await page.locator("#modernSearchButton").click();
   await input.fill("Abram");
   await profile.waitFor({state:"visible"});
   await profile.locator(".universal-name-open").click();
   await page.locator(".universal-name-detail").waitFor({state:"visible"});
   assert((await profile.innerText()).includes("Published Scripture references"),"Profile expands actual source references");
   await profile.locator(".universal-name-detail .universal-qa-ref").first().click();
   await page.waitForFunction(()=>state.book==="GAL"&&state.chapter===3&&state.verse===8);
   assert.equal(await page.locator("#readerEdition").innerText(),"KJV ▾","Navigates the active edition");
   await page.locator("#sotwTrailOpen").click();
   await input.fill("Abiathar");
   await page.waitForTimeout(800);
   assert.equal(await page.locator(".universal-name-card").count(),0,"One of 23 excluded names never renders as profile");
   await input.fill("Moses snake on stick");
   await page.waitForTimeout(800);
   assert.equal(await page.locator(".universal-name-card").count(),0,"Long Q&A request does not generate incidental profile");
   assert.deepEqual(errors,[],"No profile browser errors "+brand);
   await context.close();
  }
  console.log("PASS: two reader brands, eligible name profile, reviewed attribution, verified KJV jump, exclusion and query separation");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
