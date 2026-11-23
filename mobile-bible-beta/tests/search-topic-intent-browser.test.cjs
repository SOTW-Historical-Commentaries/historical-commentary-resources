/* Source-grounded natural-language topic coverage, both independently branded readers.
   Fixture excerpts reproduce the original historical topic ID, mapped
   citations and publisher labels. They are never changed in production. */
"use strict";
const assert=require("node:assert/strict");
const {chromium}=require("playwright-core");
const faithIndexTopic={id:"NEUU:TOPIC:faith",slug:"faith",
 title:"FAITH",shard:"topics/F.json",sources:["NAV","TOR"],
 verse_link_count:442,see_also:[]};
const accusationTopic={id:"NEUU:TOPIC:accusation__false",title:"ACCUSATION, FALSE",
 shard:"topics/A.json",verse_link_count:210};
const index={schema:"sotw-topics-search-index/1.0.0",topics:[
 {id:"NEUU:TOPIC:brazen_serpent",slug:"brazen_serpent",
  title:"BRAZEN SERPENT",shard:"topics/B.json",sources:["NAV"],
  verse_link_count:3,see_also:[]},faithIndexTopic,accusationTopic
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
const reverseMAT={schema:"sotw-topics-scripture-index/1.0.0",
 book_code:"MAT",verses:{"MAT.12.5":[accusationTopic.id]}};
const originalReferences=[
 ["Exodus 23:1,7",["EXO.23.1","EXO.23.7"]],
 ["Leviticus 19:16",["LEV.19.16"]],
 ["Psalms 41:5-9",["PSA.41.5","PSA.41.6","PSA.41.7","PSA.41.8","PSA.41.9"]],
 ["Matthew 5:11",["MAT.5.11"]],
 ["Luke 3:14",["LUK.3.14"]],
 ["2 Timothy 3:3",["2TI.3.3"]],
 ["1 Peter 4:14",["1PE.4.14"]],
 ["Genesis 39:7-20",["GEN.39.7"]]
];
const accusationShard={schema:"sotw-topics-neuu-shard/1.0.0",topics:[{
 id:accusationTopic.id,title:accusationTopic.title,aspects:[
 {label:"General scriptures concerning",references:originalReferences.slice(0,7).map(r=>r[0])},
 {label:".Against Joseph by Potiphar’s wife",references:["Genesis 39:7-20"]}],
 references:originalReferences.map(([raw,verse_ids])=>({raw,status:"mapped",verse_ids}))
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
   await page.route("**/data/topics/nave-torrey/v1/index/by-scripture/MAT.json",route=>
    route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(reverseMAT)}));
   await page.route("**/data/topics/nave-torrey/v1/topics/A.json",route=>
    route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(accusationShard)}));
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
   const fold=page.locator("#modernSearchResults > .sotw-search-topics-group > details.sotw-search-expandable");
   await fold.locator("summary").waitFor({state:"visible"});
   assert.equal(await fold.getAttribute("open"),"","Nave group is expanded by default");
   await fold.locator("summary").click();
   assert.equal(await topic.isVisible(),false,"Nave results can be collapsed");
   await fold.locator("summary").click();
   await topic.waitFor({state:"visible"});
   // Titles are source-verified. A missing Q&A does not block Nave matching.
   const fallback=await page.evaluate(()=>{
    const core=window.SOTWDiscoveryCore,words=window.SOTWUniversalSearchCore;
    const topics=[{id:"NEUU:TOPIC:serpent",title:"SERPENT",verse_link_count:49},
     {id:"NEUU:TOPIC:salvation",title:"SALVATION",verse_link_count:316}];
    return core.rankTopics(topics,"Moses snake on stick",8,[],words).map(x=>x.id);
   });
   assert(fallback.includes("NEUU:TOPIC:serpent"),
    "Original publisher SERPENT topic can be found without a Q&A citation");
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
   assert.equal(await details.locator(".discovery-citation").count(),2,
    "Both complete original historical citations remain available as direct links");
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
   // Matthew 12:5: source headings and original reference count are genuine
   // Nave/Torrey data, while the mobile presentation is a compact link list.
   await page.goto("http://127.0.0.1:8765/"+brand+
    "/?book=MAT&chapter=12&verse=5&translation=KJV1769",
    {waitUntil:"domcontentloaded"});
   await page.locator('#verses .reader-verse[data-verse="5"]').click();
   // The historical Topics module owns a distinctive launch label.
   const topicsControl=page.locator(".discovery-study .discovery-launch")
    .filter({hasText:"Related Bible Topics"});
   await topicsControl.waitFor({state:"visible"});
   await topicsControl.click();
   await topicsControl.click();
   assert.equal(await topicsControl.getAttribute("aria-expanded"),"false",
    "Closing during an in-flight source lookup cancels disclosure safely");
   await topicsControl.click();
   assert.equal(await topicsControl.getAttribute("aria-expanded"),"true",
    "Reopening after an interrupted load works");
   const topicsBody=page.locator(".discovery-verse-body").filter({hasText:"Accusation"});
   await topicsBody.locator(".discovery-verse-topic").first().waitFor({state:"visible"});
   assert.equal(await topicsBody.locator(".discovery-verse-heading").count(),0,
    "The launcher already identifies the Topics panel");
   assert.equal(await topicsBody.locator(".discovery-note").count(),0,
    "License and doctrine disclaimers belong in About & Sources, not atop listings");
   const firstTopic=topicsBody.locator(".discovery-verse-topic").first();
   assert.match(await firstTopic.locator("summary").innerText(),/False Accusation/);
   assert.equal(await firstTopic.getAttribute("open"),"","First relevant topic expands initially");
   const joseph=firstTopic.locator(".discovery-verse-topic-section").first();
   assert.match(await joseph.locator(".discovery-section-title").innerText(),
    /Against Joseph by Potiphar/);
   assert.match(await joseph.locator(".discovery-citation").first().innerText(),/Genesis 39:7–20/);
   const general=firstTopic.locator(".discovery-verse-topic-section").nth(1);
   assert.equal(await general.locator(".discovery-section-title").innerText(),"General references",
    "Descriptive historical sections must precede general references");
   const firstLink=general.locator(".discovery-citation").first();
   assert.equal(await firstLink.innerText(),"Exodus 23:1,7","Full source wording is the link");
   assert.match(await firstLink.getAttribute("href"),/book=EXO.*chapter=23.*verse=1.*translation=KJV1769/);
   assert.equal(await topicsBody.locator(".discovery-original-citation").count(),0,
    "No CSV-style Indexed citation metadata");
   const more=general.locator(".discovery-more");
   assert.match(await more.innerText(),/Show 3 more passages/);
   await more.click();
   assert.equal(await general.locator(".discovery-citation").count(),7);
   assert.match(await more.innerText(),/Show fewer passages/);
   await more.click();
   assert.equal(await general.locator(".discovery-citation").count(),4);
   await firstTopic.locator("summary").click();
   assert.equal(await firstLink.isVisible(),false,"Topic can be folded without losing source data");
   await firstTopic.locator("summary").click();
   await firstLink.waitFor({state:"visible"});
   const visual=await page.evaluate(()=>{
    const area=document.querySelector("#sotwVerseTopicsBody");
    const px=el=>parseFloat(getComputedStyle(el).fontSize);
    const weight=el=>parseInt(getComputedStyle(el).fontWeight,10);
    return {
     topic:px(area.querySelector(".discovery-verse-topic > summary")),
     section:px(area.querySelector(".discovery-section-title")),
     passage:px(area.querySelector(".discovery-citation")),
     subjectWeight:weight(area.querySelector(".discovery-verse-topic > summary")),
     linkWeight:weight(area.querySelector(".discovery-citation"))
    };
   });
   assert(visual.topic>=18&&visual.section>=16&&visual.passage>=16.5,
    "Mobile reading type must be larger and hierarchy distinct: "+JSON.stringify(visual));
   assert(visual.subjectWeight>visual.linkWeight,
    "Subject title must be visually stronger than Scripture link");
   assert.equal(await topicsControl.getAttribute("aria-expanded"),"true",
    "Launcher exposes an accessible expanded state");
   const closeFooter=page.locator("#sotwVerseTopicsBody .discovery-close-topics");
   await closeFooter.click();
   assert.equal(await topicsControl.getAttribute("aria-expanded"),"false",
    "Footer closes the entire Topics section");
   assert.equal(await page.locator("#sotwVerseTopicsBody").isVisible(),false);
   assert.match(await topicsControl.innerText(),/Explore topics/);
   await topicsControl.click();
   await page.locator("#sotwVerseTopicsBody .discovery-verse-topic > summary")
    .first().waitFor({state:"visible"});
   assert.equal(await topicsControl.getAttribute("aria-expanded"),"true",
    "Closed section can be reopened from the same launcher");
   await topicsControl.click();
   assert.equal(await topicsControl.getAttribute("aria-expanded"),"false",
    "Tapping Related Bible Topics again closes the entire section");
   assert.equal(await page.locator("#sotwVerseTopicsBody").isVisible(),false);
   // Restore the original verse Study Tool, not just the reader passage.
   // Preserve open topic, expanded citation list, and source verse in both brands.
   await topicsControl.click();
   await firstTopic.locator("summary").waitFor({state:"visible"});
   await general.locator(".discovery-more").click();
   assert.equal(await general.locator(".discovery-citation").count(),7);
   const contextual=general.locator(".discovery-citation").filter({hasText:"Matthew 5:11"});
   await contextual.click();
   await page.waitForURL(/book=MAT&chapter=5&verse=11&translation=KJV1769/);
   const studyTrail=page.locator("#sotwTrailOpen");
   await studyTrail.waitFor({state:"visible"});
   assert.match(await studyTrail.innerText(),/Back to Topic · False Accusation/,
    "An inline Study Topic citation must generate a contextual return");
   assert.match(await page.locator("#sotwReturnToPassage").innerText(),/Back to Matthew 12:5/);
   await studyTrail.click();
   await page.waitForURL(/book=MAT&chapter=12&verse=5&translation=KJV1769/);
   await page.waitForFunction(()=>
    document.body.classList.contains("study-open")&&
    document.querySelector("#sotwVerseTopicsBody")?.hidden===false&&
    document.querySelector(".discovery-verse-topic summary")?.textContent.includes("False Accusation"));
   assert.equal(await topicsControl.getAttribute("aria-expanded"),"true");
   assert.equal(await firstTopic.getAttribute("open"),"");
   assert.equal(await general.locator(".discovery-citation").count(),7,
    "Expanded historical references must be restored, not reset to four");
   assert.equal(await studyTrail.isVisible(),false,
    "One-time return target clears once restored to Study Topics");
   // Also support the owner's two-stage route:
   // Back to Scripture first, then Back to the previously opened Topic.
   await page.evaluate(()=>{window.__studyReturnContinuity='still-on-same-page';});
   await contextual.click();
   await page.waitForURL(/book=MAT&chapter=5&verse=11&translation=KJV1769/);
   const returnState=await page.evaluate(()=>({
    pageMarker:window.__studyReturnContinuity,
    url:location.search,book:state.book,chapter:state.chapter,verse:state.verse,
    studyOpen:document.body.classList.contains('study-open'),
    returnHidden:document.querySelector('#sotwReturnToPassage')?.hidden,
    returnLabel:document.querySelector('#sotwReturnToPassage')?.textContent,
    trailHidden:document.querySelector('#sotwTrail')?.hidden,
    trailLabel:document.querySelector('#sotwTrailOpen')?.textContent,
    readerReturnReady:!!window.SOTWReaderReturn,
    topicText:document.querySelector('#sotwVerseTopicsBody')?.textContent?.slice(0,90)
   }));
   assert.equal(returnState.returnHidden,false,
    'Return to original Scripture must stay active after a second topic citation: '+
    JSON.stringify(returnState));
   await page.locator("#sotwReturnToPassage").click();
   await page.waitForURL(/book=MAT&chapter=12&verse=5&translation=KJV1769/);
   assert.equal(await page.locator("#sotwVerseTopicsBody").isVisible(),false);
   await studyTrail.waitFor({state:"visible"});
   await studyTrail.click();
   await firstTopic.locator("summary").waitFor({state:"visible"});
   assert.equal(await topicsControl.getAttribute("aria-expanded"),"true");
   assert.equal(await general.locator(".discovery-citation").count(),7);
   assert.deepEqual(errors,[],"Unexpected browser errors "+brand);
   await context.close();
  }
  console.log("PASS: both brands recover multiple independent source-mapped topics through general Scripture-link evidence");
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
