/* Browser-level Q&A search, source link, selected-edition jump and return. */
"use strict";
const assert=require("node:assert/strict");
const {chromium}=require("playwright-core");
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||"/usr/bin/google-chrome",args:["--no-sandbox","--disable-dev-shm-usage"]});
 try{
  for(const brand of ["mobile-bible-beta","mobile-bible-sotw"]){
   const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,serviceWorkers:"block"});
   const page=await ctx.newPage();page.setDefaultTimeout(50000);
   const pageErrors=[],requests=[];
   page.on("pageerror",e=>pageErrors.push(String(e)));
   page.on("request",r=>requests.push(r.url()));
   await page.goto("http://127.0.0.1:8765/"+brand+"/?book=GEN&chapter=1&verse=1&translation=KJV1769",{waitUntil:"domcontentloaded"});
   await page.locator('#verses .reader-verse[data-verse="1"]').waitFor({state:"visible"});
   await page.locator("#modernSearchButton").click();
   const input=page.locator("#modernSearchInput");
   await input.fill("Who was the Word with?");
   const hit=page.locator('.universal-qa-card[data-qa-id="utq:v91:JHN:1:1-2:jzv6"]');
   await hit.waitFor({state:"visible"});
   assert((await hit.innerText()).includes("The Word was with God."),"Unaltered answer visible");
   assert.equal(await hit.locator(".universal-qa-question").count(),1,"Question is a label, not a misleading Scripture hyperlink");
   assert.equal(await hit.locator(".universal-qa-answer-label").innerText(),"PUBLISHED ANSWER","Published answer is distinguishable from Bible passage");
   assert((await hit.innerText()).includes("John 1:1–2"),"Exact source range retained");
   await hit.locator(".universal-qa-ref").click();
   await page.waitForFunction(()=>state.book==="JHN"&&state.chapter===1&&state.verse===1&&
     !document.getElementById("sotwTrail")?.hidden);
   await page.locator('#verses .reader-verse[data-verse="1"]').waitFor({state:"visible"});
   const location=await page.evaluate(()=>({book:state.book,chapter:state.chapter,verse:state.verse,edition:state.edition,trail:document.getElementById("sotwTrail")?.hidden}));
   assert.deepEqual(location,{book:"JHN",chapter:1,verse:1,edition:"KJV1769",trail:false},"Navigates verified Scripture in selected edition and preserves search trail");
   await page.locator("#sotwTrailOpen").click();
   assert.equal(await input.inputValue(),"Who was the Word with?");
   await hit.waitFor({state:"visible"});
   await input.fill("Moses snake on stick");
   const snake=page.locator('.universal-qa-card[data-qa-id="utq:v91:2KI:18:4:ndxy"]');
   await snake.waitFor({state:"visible"});
   await snake.locator(".universal-qa-source").click();
   await page.locator("#universalSearchAttribution").waitFor({state:"visible"});
   assert.equal(await page.locator("#readerSourcesHeading").innerText(),"Sources & Attribution","Hamburger has dedicated attribution section");
   assert.equal(await page.locator("#readerSourcesAttribution #universalSearchAttribution").count(),1,"Question source appears once inside Sources & Attribution");
   assert(await page.locator("#universalSearchAttribution").getAttribute("open")!==null,"Source ↗ expands matching source notice");
   assert(await page.locator("#universalSearchAttribution").innerText().then(s=>s.includes("CC BY-SA 4.0")),"Full license and provenance in hamburger source section");
   assert.equal(await page.locator("#readerMoreModal .reader-citation-identity img").count(),1,"Owned reader mark appears on citation screen");
   await page.waitForFunction(()=>{const img=document.querySelector("#readerMoreModal .reader-citation-identity img");return img?.complete&&img.naturalWidth>0;},"Citation image should finish loading");
   assert(await page.locator("#readerMoreModal .reader-citation-identity img").evaluate(img=>img.naturalWidth>0),"Citation-screen reader image loads");
   await page.locator("#readerMoreModal .modal-close").click();
   await page.locator("#modernMoreButton").click();
   assert(await page.locator("#readerSourcesAttribution #universalSearchAttribution").count()===1,"Source notice is accessible directly through hamburger, without any search");
   assert.equal(await page.locator("#readerSourcesAttribution .more-resource").count(),7,"Six existing source notices plus approved names attribution stay together");
   assert(!requests.some(u=>u.includes("/historical-people-places/")),"Excluded separate historical dataset not requested");
   assert.deepEqual(pageErrors,[],"Browser console errors "+brand);
   await ctx.close();
  }
  console.log("PASS: two branded readers, source Q&A, natural question, attribution, checked passage and return at 390px");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
