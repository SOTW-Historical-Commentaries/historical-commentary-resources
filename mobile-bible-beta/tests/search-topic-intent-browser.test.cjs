/* Source-grounded natural-language topic coverage, both independently branded readers.
   Fixture excerpts reproduce the original historical topic ID, mapped
   citations and publisher labels. They are never changed in production. */
"use strict";
const assert=require("node:assert/strict");
const {chromium}=require("playwright-core");
const index={schema:"sotw-topics-search-index/1.0.0",topics:[
 {id:"NEUU:TOPIC:brazen_serpent",slug:"brazen_serpent",
  title:"BRAZEN SERPENT",shard:"topics/B.json",sources:["NAV"],
  verse_link_count:3,see_also:[]}
]};
const shard={schema:"sotw-topics-neuu-shard/1.0.0",topics:[{
 id:"NEUU:TOPIC:brazen_serpent",title:"BRAZEN SERPENT",
 slug:"brazen_serpent",sources:["NAV"],see_also:[],
 aspects:[
  {label:"Ma",references:[],source:"NAV"},
  {label:"Worshiped by Israelites",references:["2 Kings 18:4"],source:"NAV"},
  {label:"A symbol of Christ",references:["John 3:14,15"],source:"NAV"}
 ],
 references:[
  {raw:"2 Kings 18:4",status:"mapped",verse_ids:["2KI.18.4"]},
  {raw:"John 3:14,15",status:"mapped",verse_ids:["JHN.3.14","JHN.3.15"]}
 ]
}]};
(async()=>{
 const browser=await chromium.launch({headless:true,
  executablePath:process.env.CHROME_PATH||"/usr/bin/google-chrome",
  args:["--no-sandbox","--disable-dev-shm-usage"]});
 try{
  for(const brand of ["mobile-bible-beta","mobile-bible-sotw"]){
   const context=await browser.newContext({
    viewport:{width:390,height:844},deviceScaleFactor:3,
    isMobile:true,hasTouch:true,serviceWorkers:"block"});
   const page=await context.newPage();page.setDefaultTimeout(50000);
   const errors=[];page.on("pageerror",e=>errors.push(String(e)));
   await page.route("**/data/topics/nave-torrey/v1/index/topics.json",route=>
    route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(index)}));
   await page.route("**/data/topics/nave-torrey/v1/topics/B.json",route=>
    route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(shard)}));
   await page.goto("http://127.0.0.1:8765/"+brand+
    "/?book=RUT&chapter=1&verse=1&translation=KJV1769",
    {waitUntil:"domcontentloaded"});
   await page.locator('#verses .reader-verse[data-verse="1"]').waitFor({state:"visible"});
   await page.locator("#modernSearchButton").click();
   const input=page.locator("#modernSearchInput");
   await input.fill("Moses snake on stick");
   const topic=page.locator('#modernSearchResults .discovery-hit').filter({hasText:/^BRAZEN SERPENT$/});
   await topic.waitFor({state:"visible"});
   const bronze=page.locator('.universal-qa-card[data-qa-id="utq:v91:2KI:18:4:ndxy"]');
   await bronze.waitFor({state:"visible"});
   assert.match(await bronze.innerText(),/2 Kings 18:4/);
   const group=page.locator("#modernSearchResults > .sotw-passage-evidence");
   await page.waitForFunction(()=>{
    const g=document.querySelector("#modernSearchResults > .sotw-passage-evidence");
    return !!g&&g.textContent.includes("2 Kings 18:4");
   });
   assert.match(await group.innerText(),/2 Kings 18:4/);
   await group.locator("summary").filter({hasText:"2 Kings 18:4"}).click();
   assert.match(await group.innerText(),/Historical index/);
   await topic.click();
   const details=page.locator("#sotwDiscoveryDetail .discovery-detail-body");
   await details.waitFor({state:"visible"});
   assert.match(await details.innerText(),/2 Kings 18:4/);
   await details.locator(".discovery-topic-group").nth(1).locator("summary").click();
   assert.match(await details.innerText(),/John 3:14,15/);
   assert.equal(await details.locator(".discovery-original-citation").count(),2,
    "Both original historical citations stay visibly attributed");
   await details.locator(".discovery-back-search").click();
   assert.equal(await input.inputValue(),"Moses snake on stick");
   await topic.waitFor({state:"visible"});
   await input.fill("Moses staff became a snake");
   await page.locator(".universal-qa-section").waitFor({state:"visible"});
   await page.waitForTimeout(850);
   assert.equal(await page.locator("#modernSearchResults .discovery-hit")
    .filter({hasText:/^BRAZEN SERPENT$/}).count(),0,
    "Unrelated staff transformation must not generate brazen serpent topic");
   assert.deepEqual(errors,[],"Unexpected browser errors "+brand);
   await context.close();
  }
  console.log("PASS: both brands recover source-published serpent topic for a natural-language query, share precise citation and exclude staff confusion");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
