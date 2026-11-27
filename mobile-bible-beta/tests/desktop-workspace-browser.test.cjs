/* Desktop workspace geometry + mobile non-regression in both branded readers. */
"use strict";
const assert=require("node:assert/strict");
const {chromium}=require("playwright-core");
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||"/usr/bin/google-chrome",args:["--no-sandbox","--disable-dev-shm-usage"]});
 async function checkBottomCollapse(page){
  const launch=page.locator('#studyBodyScroll .discovery-launch').filter({hasText:"Related Bible Topics"});
  await launch.click();
  const topics=page.locator('#sotwVerseTopicsBody .discovery-verse-topic');
  await topics.first().waitFor({state:"visible"});
  const footer=page.locator('.shared-context-nav');await footer.waitFor({state:"visible"});
  assert.equal(await page.locator('#sotwVerseTopicsBody .shared-bottom-collapse').count(),0);
  assert.equal(await page.locator('#sotwVerseTopicsBody .discovery-more').count(),0);
  assert.equal(await footer.getByRole('button',{name:/Show fewer/}).count(),0);
  const first=topics.first();await first.locator(':scope > summary').click();
  await first.locator('.discovery-verse-topic-section').first().waitFor({state:'visible'});
  assert.equal(await first.locator('.discovery-more').count(),0);
  await footer.getByRole('button',{name:/^Close (?!all topics)/}).waitFor({state:"visible"});
  await footer.getByRole('button',{name:/^Close (?!all topics)/}).click();
  assert.equal(await first.getAttribute("open"),null,"Individual topic collapses");
  await footer.getByRole('button',{name:"Close all topics",exact:true}).click();
  assert.equal(await launch.getAttribute("aria-expanded"),"false");
  assert(await launch.evaluate(el=>document.activeElement===el),"Category close restores heading focus");
  await footer.waitFor({state:"hidden"});
 }
 try{
  for(const brand of ["mobile-bible-beta","mobile-bible-sotw"]){
   for(const width of [1280,1512]){
    const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:"block"});
    const page=await context.newPage();page.setDefaultTimeout(50000);
    const errors=[];page.on("pageerror",e=>errors.push(String(e)));
    await page.goto("http://127.0.0.1:8765/"+brand+"/?book=GEN&chapter=3&verse=19&translation=BSB",{waitUntil:"domcontentloaded"});
    const v=page.locator('#verses .reader-verse[data-verse="19"]');
    await v.waitFor({state:"visible"});
    await page.locator("#desktop-book").waitFor({state:"visible"});
    assert.equal(await page.locator("#desktop-book").inputValue(),"GEN");
    assert.equal(await page.locator("#desktop-chapter").inputValue(),"3");
    await page.locator("#desktop-book").selectOption("EXO");
    await page.waitForFunction(()=>document.querySelector('#verses .reader-verse[data-verse="1"]')?.getAttribute("aria-label")==="Exodus 1:1");
    assert.equal(await page.locator("#desktop-chapter").inputValue(),"1");
    assert(!await page.locator("body").evaluate(e=>e.classList.contains("study-open")));
    await page.locator("#desktop-book").selectOption("GEN");
    await page.waitForFunction(()=>document.querySelector('#verses .reader-verse[data-verse="1"]')?.getAttribute("aria-label")==="Genesis 1:1");
    await page.locator("#desktop-chapter").selectOption("3");
    await page.waitForFunction(()=>document.querySelector('#verses .reader-verse[data-verse="1"]')?.getAttribute("aria-label")==="Genesis 3:1");
    await page.locator("#desktop-verse").selectOption("22");
    assert.equal(await page.locator("#desktop-verse").inputValue(),"22");
    assert(!await page.locator("body").evaluate(e=>e.classList.contains("study-open")),"Dropdown must navigate only");
    assert(await page.locator("#desktopStudyEmpty").isVisible(),"Workspace persists without selection");
    await page.locator('#verses .reader-verse[data-verse="22"]').click();
    await page.waitForFunction(()=>document.querySelector('#verses .reader-verse[data-verse="22"]')?.classList.contains("is-studying"));
    await page.locator("#studyClose").click();
    assert(!await page.locator("body").evaluate(e=>e.classList.contains("study-open")));
    assert(await page.locator("#desktopStudyEmpty").isVisible(),"Workspace remains after clearing");
    assert.equal(await page.locator("#verses .is-studying").count(),0);
    await v.click();
    await page.locator('#verses .reader-verse[data-verse="19"].is-studying').waitFor({state:"visible"});
    assert(!await page.locator("#modernStudyVerse").isVisible(),"Duplicate verse hidden on desktop");
    assert(!await page.locator("#studyHeading").isVisible(),"Duplicate heading hidden on desktop");
    await page.locator('#studyBodyScroll .discovery-launch').filter({hasText:"Related Bible Topics"}).click();
    await page.locator('#sotwVerseTopicsBody .discovery-verse-topic>.discovery-topic-summary').first().waitFor({state:"visible"});
    const topicStyle=await page.locator('#sotwVerseTopicsBody .discovery-verse-topic>.discovery-topic-summary').first().evaluate(el=>({border:getComputedStyle(el).borderLeftWidth,font:getComputedStyle(el).fontSize}));
    assert.equal(topicStyle.border,"3px","Mobile topic accent bar reused");
    assert.equal(topicStyle.font,"19px","Mobile topic typography reused");
    await page.locator('#studyBodyScroll .discovery-launch').filter({hasText:"Related Bible Topics"}).click();
    await checkBottomCollapse(page);
    const g=await page.evaluate(()=>{
     const rect=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
     const study=document.querySelector('section[aria-label="Commentary comparison"]');
     const styles=getComputedStyle(study);
     return {
      header:rect("#modernReaderHeader"),brand:rect("#modernReaderHeader .brand-line"),
      location:rect("#modernReaderHeader .location-line"),reading:rect(".layout>.scripture"),
      panel:rect('section[aria-label="Commentary comparison"]'),
      tools:rect('section[aria-label="Commentary comparison"] .tools'),
      scroll:rect("#studyBodyScroll"),paragraph:rect("#verses .reader-paragraph"),
      scrollHeight:document.querySelector("#studyBodyScroll").scrollHeight,
      overlay:rect("#studyOverlay"),heightStyle:styles.height,
      position:styles.position,bodyOverflow:document.documentElement.scrollWidth,
      studyVerseText:document.getElementById("modernStudyVerse").textContent.slice(0,50),
      excerptFont:getComputedStyle(document.querySelector("#verses .reader-paragraph")).fontSize
     };
    });
    assert(g.panel.x>g.reading.right-5,`Desktop study must appear to right of Scripture ${brand} ${width} ${JSON.stringify(g)}`);
    assert(g.brand.y<g.location.y,`Book/chapter should be on clearly separated header row ${brand} ${width}`);
    assert(g.location.x<g.header.w/4,`Book/chapter should anchor left, not crowd search icons at right ${brand} ${width}`);
    assert(g.panel.h<755&&g.panel.h>=175,`Study panel should fit content, not fill full viewport ${brand} ${width} ${JSON.stringify(g)}`);
    assert(g.panel.h-g.tools.h-g.scroll.h<125,`No giant empty footer below study controls ${brand} ${width} ${JSON.stringify(g)}`);
    assert(g.bodyOverflow<=width+2,`Desktop workspace should not overflow horizontally ${brand} ${width}`);
    assert(parseFloat(g.excerptFont)>=19,`Readable Scripture on desktop ${brand} ${width}`);
    assert(g.studyVerseText.includes("sweat"),`Study displays actual selected Genesis 3:19 verse ${brand} ${width}`);
    assert.deepEqual(errors,[],`No browser errors desktop ${brand} ${width}`);
    await context.close();
   }
   // At iPhone size, the new desktop stylesheet must not change the full-screen study sheet.
   const mobile=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:"block"});
   const page=await mobile.newPage();page.setDefaultTimeout(50000);
   await page.goto("http://127.0.0.1:8765/"+brand+"/?book=GEN&chapter=3&verse=19&translation=BSB",{waitUntil:"domcontentloaded"});
   const v=page.locator('#verses .reader-verse[data-verse="19"]');await v.waitFor({state:"visible"});await v.click();
   const m=await page.evaluate(()=>{
    const e=document.querySelector('section[aria-label="Commentary comparison"]'),r=e.getBoundingClientRect();
    return {position:getComputedStyle(e).position,x:r.x,y:r.y,w:r.width,h:r.height,viewport:innerWidth,open:document.body.classList.contains("study-open")};
   });
   assert(m.open&&m.position==="fixed"&&m.w>=m.viewport-5,`Mobile study must remain full screen ${brand} ${JSON.stringify(m)}`);
   assert(await page.locator("#modernStudyVerse").isVisible(),"Mobile retains verse quotation");
   await checkBottomCollapse(page);
   assert.equal(await page.locator("#desktopPassage").count(),0,"Desktop controls absent on mobile");
   await page.locator("#studyClose").click();
   assert(!await page.locator("body").evaluate(e=>e.classList.contains("study-open")),`Mobile Close still works ${brand}`);
   await mobile.close();
  }
  console.log("PASS: responsive CGBC/SOTW desktop study proportions, readable Scripture, no blank panel and unchanged iPhone study");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
