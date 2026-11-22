/* Browser-level Q&A in-search citation previews, explicit Bible jump, source and return. */
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
   const inline=hit.locator(".universal-scripture-preview");
   await inline.waitFor({state:"visible"});
   await page.waitForFunction(()=>document.querySelector('[data-qa-id="utq:v91:JHN:1:1-2:jzv6"] .universal-scripture-preview p')?.textContent.includes("2 "));
   assert((await inline.innerText()).includes("John 1:1–2"),"Cited range appears inside search");
   const before=await page.evaluate(()=>({book:state.book,chapter:state.chapter,verse:state.verse,edition:state.edition}));
   assert.deepEqual(before,{book:"GEN",chapter:1,verse:1,edition:"KJV1769"},"Preview must not navigate Scripture");
   assert(await input.isVisible(),"Search remains open while reading inline verse");
   assert.equal(await input.inputValue(),"Who was the Word with?","Query is unchanged during preview");
   await inline.getByRole("button",{name:"Close Scripture preview"}).click();
   assert.equal(await hit.locator(".universal-scripture-preview").count(),0,"Close dismisses only the preview");
   assert(await input.isVisible(),"Closing preview keeps search/results in place");
   await hit.locator(".universal-qa-ref").click();
   await hit.locator(".universal-scripture-preview").getByRole("button",{name:"Open in Bible"}).click();
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
   await page.locator(".universal-qa-section").waitFor({state:"visible"});
   // The concurrent Universal Search three-gate milestone initially reveals
   // only the top answer group. Preserve this user-controlled expansion.
   if(!await snake.count())await page.locator(".universal-qa-section > .universal-qa-show-more").click();
   await snake.waitFor({state:"visible"});

   // The first search destination is Scripture only when a published source
   // supplies the citation; it forwards to the existing in-search preview.
   const scriptureShortcut=page.locator("#modernSearchResults > .sotw-search-scripture");
   await scriptureShortcut.waitFor({state:"visible"});
   assert.match(await scriptureShortcut.innerText(),/Preview Scripture cited by Bible Questions/);
   await scriptureShortcut.click();
   const forwardedPreview=page.locator(".universal-qa-section .universal-qa-card .universal-scripture-preview").first();
   await forwardedPreview.waitFor({state:"visible"});
   assert(await input.isVisible(),"Coordinated Scripture shortcut keeps Search open");
   await forwardedPreview.getByRole("button",{name:"Close Scripture preview"}).click();

   await snake.locator(".universal-qa-ref").click();
   const bronzePreview=snake.locator(".universal-scripture-preview");
   await bronzePreview.waitFor({state:"visible"});
   await page.waitForFunction(()=>document.querySelector('[data-qa-id="utq:v91:2KI:18:4:ndxy"] .universal-scripture-preview p')?.textContent.includes("4 "));
   assert(await input.isVisible(),"Bronze-serpent citation opens inline without leaving search");
   await bronzePreview.getByRole("button",{name:"Close Scripture preview"}).click();
   assert(await snake.isVisible(),"Expanded search result remains after closing preview");
   await snake.locator(".universal-qa-source").click();
   await page.locator("#universalSearchAttribution").waitFor({state:"visible"});
   assert.equal(await page.locator("#readerSourcesHeading").innerText(),"Sources & Attribution","Hamburger has dedicated attribution section");
   assert.equal(await page.locator("#readerSourcesAttribution #universalSearchAttribution").count(),1,"Question source appears once inside Sources & Attribution");
   assert(await page.locator("#universalSearchAttribution").getAttribute("open")!==null,"Source ↗ expands matching source notice");
   assert(await page.locator("#universalSearchAttribution").innerText().then(s=>s.includes("CC BY-SA 4.0")),"Full license and provenance in hamburger source section");
   assert.equal(await page.locator("#readerMoreModal .reader-citation-identity img").count(),1,"Owned reader mark appears on citation screen");
   try{
    await page.waitForFunction(()=>{const img=document.querySelector("#readerMoreModal .reader-citation-identity img");return img?.complete&&img.naturalWidth>0;},null,{timeout:8000});
   }catch(error){
    const info=await page.locator("#readerMoreModal .reader-citation-identity img").evaluate(img=>({src:img.src,complete:img.complete,naturalWidth:img.naturalWidth}));
    const response=await page.request.get(info.src);
    throw new Error("Citation mark failed: "+JSON.stringify({...info,status:response.status(),type:response.headers()["content-type"]}));
   }
   assert(await page.locator("#readerMoreModal .reader-citation-identity img").evaluate(img=>img.naturalWidth>0),"Citation-screen reader image loads");
   await page.locator("#readerMoreModal .modal-close").click();
   await page.locator("#modernMoreButton").click();
   assert(await page.locator("#readerSourcesAttribution #universalSearchAttribution").count()===1,"Source notice is accessible directly through hamburger, without any search");
   assert.equal(await page.locator("#readerSourcesAttribution .more-resource").count(),7,"Six existing source notices plus approved names attribution stay together");
   assert(!requests.some(u=>u.includes("/historical-people-places/")),"Excluded separate historical dataset not requested");
   // Source-backed questions are opt-in on the studied verse, not a new source.
   await page.goto("http://127.0.0.1:8765/"+brand+"/?book=1CO&chapter=16&verse=10&translation=KJV1769",{waitUntil:"domcontentloaded"});
   const verse10=page.locator('#verses .reader-verse[data-verse="10"]');
   await verse10.waitFor({state:"visible"});await verse10.click();
   const studyQA=page.locator("#sotwVerseQuestions");
   await studyQA.waitFor({state:"visible"});
   assert.equal(await studyQA.locator(".universal-qa-card").count(),0);
   await studyQA.locator("button.discovery-launch").click();
   const timothy=studyQA.locator('.universal-qa-card[data-qa-id="utq:v91:1CO:16:10-11:lt0q"]');
   await timothy.waitFor({state:"visible"});
   assert((await timothy.innerText()).includes("What did Paul command the church at Corinth"));
   assert((await timothy.innerText()).includes("1 Corinthians 16:10–11"));
   assert((await timothy.innerText()).includes("PUBLISHED ANSWER"));
   assert.deepEqual(await page.evaluate(()=>({book:state.book,chapter:state.chapter,verse:modernStudyVerse,edition:state.edition})),
    {book:"1CO",chapter:16,verse:10,edition:"KJV1769"});
   await studyQA.locator("button.discovery-launch").click();
   assert.equal(await studyQA.locator(".universal-qa-card").count(),0);
   await page.locator("#studyClose").click();
   await page.locator("#modernSearchButton").click();
   await page.locator("#modernSearchInput").fill("Abarim");
   await page.waitForTimeout(1000);
   assert.equal(await page.locator(".discovery-hit").filter({hasText:/^ABARIM$/}).count(),0,"Exact unlinked ABARIM topic must not be navigable; related mapped topic titles may remain");
   assert.deepEqual(pageErrors,[],"Browser console errors "+brand);
   await ctx.close();
  }
  console.log("PASS: two branded readers, source Q&A, natural question, attribution, checked passage and return at 390px");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
