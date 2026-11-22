/* Source-grounded natural-language topic coverage, both independently branded readers.
   Fixture excerpts reproduce the original historical topic ID, mapped
   citations and publisher labels. They are never changed in production. */
"use strict";
const assert=require("node:assert/strict");
const {chromium}=require("playwright-core");
const faithIndexTopic={id:"NEUU:TOPIC:faith",slug:"faith",
 title:"FAITH",shard:"topics/F.json",sources:["NAV","TOR"],
 verse_link_count:442,see_also:[]};
const index={schema:"sotw-topics-search-index/1.0.0",topics:[
 {id:"NEUU:TOPIC:brazen_serpent",slug:"brazen_serpent",
  title:"BRAZEN SERPENT",shard:"topics/B.json",sources:["NAV"],
  verse_link_count:3,see_also:[]},faithIndexTopic
]};
const faithShard={schema:"sotw-topics-neuu-shard/1.0.0",topics:[{
 id:"NEUU:TOPIC:faith",title:"FAITH",slug:"faith",sources:["NAV","TOR"],
 aspects:[{label:"Without fruits, is dead",references:["James 2:17,20,26"],source:"TOR"}],
 references:[{raw:"James 2:17,20,26",status:"mapped",
  verse_ids:["JAS.2.17","JAS.2.20","JAS.2.26"]}]
}]};
const reverse2KI={schema:"sotw-topics-scripture-index/1.0.0",
 book_code:"2KI",verses:{"2KI.18.4":["NEUU:TOPIC:brazen_serpent"]}};
const reverseJAS={schema:"sotw-topics-scripture-index/1.0.0",
 book_code:"JAS",verses:{"JAS.2.17":["NEUU:TOPIC:faith"]}};
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
   await page.route("**/data/topics/nave-torrey/v1/index/by-scripture/2KI.json",route=>
    route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(reverse2KI)}));
   await page.route("**/data/topics/nave-torrey/v1/index/by-scripture/JAS.json",route=>
    route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(reverseJAS)}));
   await page.route("**/data/topics/nave-torrey/v1/topics/F.json",route=>
    route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(faithShard)}));
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
   // A different published subject follows the same cross-source path.
   await input.fill("What is faith by itself if it has no works");
   const faith=page.locator('#modernSearchResults .discovery-hit').filter({hasText:/^FAITH$/});
   await faith.waitFor({state:"visible"});
   const published=page.locator('.universal-qa-card[data-qa-id="utq:v91:JAS:2:17:fpr8"]');
   await published.waitFor({state:"visible"});
   await page.waitForFunction(()=>{
    const g=document.querySelector("#modernSearchResults > .sotw-passage-evidence");
    return !!g&&g.textContent.includes("James 2:17");
   });
   await faith.click();
   const faithDetail=page.locator("#sotwDiscoveryDetail .discovery-detail-body");
   await faithDetail.waitFor({state:"visible"});
   assert.match(await faithDetail.innerText(),/James 2:17,20,26/);
   await faithDetail.locator(".discovery-back-search").click();
   assert.equal(await input.inputValue(),"What is faith by itself if it has no works");
   assert.deepEqual(errors,[],"Unexpected browser errors "+brand);
   await context.close();
  }
  console.log("PASS: both brands recover multiple independent source-mapped topics through general Scripture-link evidence");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
