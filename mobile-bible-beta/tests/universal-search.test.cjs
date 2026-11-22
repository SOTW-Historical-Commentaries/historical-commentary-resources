/* Source-first Universal Search QA. No general web research or invented links. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const dir=path.join(root,"data/universal-search/v1");
const manifest=JSON.parse(fs.readFileSync(path.join(dir,"manifest.json"),"utf8"));
assert.equal(manifest.schema,"sotw-reader-universal-search-manifest/1.0.0");
assert.equal(manifest.source.commit,"b4a7702a8bb1f7410514b7f44663c49ecfd25d33");
assert.equal(manifest.source.reviewStatus,"SOURCE_RECORD_UNALTERED_NOT_INDEPENDENTLY_FACT_CHECKED");
assert.equal(manifest.source.license,"CC BY-SA 4.0");
assert.deepEqual(manifest.excludedSources,["separate-historical-people-places","unreviewed-name-profile-articles"]);
const rows=[],ids=new Set();
for(const s of manifest.shards){
 const j=JSON.parse(fs.readFileSync(path.join(dir,s.path),"utf8"));
 assert.equal(j.schema,"sotw-reader-qa-search-shard/1.0.0");
 assert.equal(j.version,"91");
 assert.equal(j.records.length,s.count);
 for(const r of j.records){
  assert.equal(r.length,6);assert(r[0].startsWith("utq:v91:"));
  assert(typeof r[1]==="string"&&r[1].trim());
  assert(typeof r[2]==="string"&&r[2].trim());
  assert(r[3].length>0);
  for(const t of r[3])assert(t.length===4&&typeof t[0]==="string"&&Number.isInteger(t[1])&&t[1]>0&&Number.isInteger(t[2])&&t[2]>0);
  assert(!ids.has(r[0]),"Duplicate Q&A ID "+r[0]);ids.add(r[0]);rows.push(r);
 }
}
assert.equal(rows.length,12139);assert.equal(rows.length,manifest.indexedRecords);
const context={};context.globalThis=context;vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,"universal-search.js"),"utf8"),context,{filename:"universal-search.js"});
const core=context.SOTWUniversalSearchCore;
assert(core&&typeof core.rank==="function");
const timothy=rows.find(r=>r[0]==="utq:v91:1CO:16:10-11:lt0q");
assert(timothy,"Published multi-verse Q&A must exist");
const reverse={schema:"sotw-qa-verse-index/1.0.0",book:"1CO",verses:{"16.10":[timothy[0]],"16.11":[timothy[0]],"16.12":[]}};
for(const v of [10,11])assert.deepEqual(Array.from(core.verseQuestions(reverse,rows,"1CO",16,v),r=>r[0]),[timothy[0]]);
assert.equal(core.verseQuestions(reverse,rows,"1CO",16,12).length,0);
assert.throws(()=>core.verseQuestions({...reverse,verses:{"16.12":[timothy[0]]}},rows,"1CO",16,12),/citation mismatch/);
assert.throws(()=>core.verseQuestions({...reverse,book:"2KI"},rows,"1CO",16,11),/Unverified/);
const exact=core.rank(rows,"Who was the Word with?",20);
assert(exact.some(r=>r.row[0]==="utq:v91:JHN:1:1-2:jzv6"),"Exact question finds published John 1:1–2");
const bronze=rows.find(r=>r[0]==="utq:v91:2KI:18:4:ndxy");
assert(bronze&&core.score(bronze,core.words("Moses snake on stick"),core.normalize("Moses snake on stick"))>0,
 "Natural-language Moses/snake/stick retrieves published bronze-serpent question");
assert(core.score(bronze,core.words("bronze serpant Moses"),core.normalize("bronze serpant Moses"))>0,"One-edit spelling tolerance");

const intentTerms=[
 ["Moses snake on stick","utq:v91:2KI:18:4:ndxy"],
 ["Moses snake on a pole","utq:v91:2KI:18:4:ndxy"],
 ["snake on pole","utq:v91:2KI:18:4:ndxy"],
 ["bronze serpent","utq:v91:2KI:18:4:ndxy"],
 ["Moses staff became a snake","utq:v91:EXO:4:4:ns41"]
];
for(const [query,expectedId] of intentTerms){
 const ranked=core.rank(rows,query,15);
 assert.equal(ranked[0]?.row[0],expectedId,
  "Top published question follows described event for "+query);
}
const bronzeFirst=core.rank(rows,"Moses snake on stick",15);
assert.deepEqual(bronzeFirst[0].row[3],[["2KI",18,4,0]],
 "Promoted question keeps original published citation: 2 Kings 18:4");
assert(bronzeFirst.some(x=>x.row[0]==="utq:v91:EXO:4:4:ns41"),
 "Alternative staff-turns-to-snake question remains available");
assert.equal(core.rank(rows,"Moses snake on stick",15).length,8,
 "Relevance fix does not delete any matching Q&A");
assert.equal(core.rank(rows,"Who was the Word with?",20).some(x=>x.row[0]==="utq:v91:JHN:1:1-2:jzv6"),true,
 "Existing exact Bible question continues to rank");

const noReference=[...rows[0]];noReference[3]=[];
assert.equal(core.rank([noReference],"Moses",10).length,0); // unsupported citation cannot be ranked
assert.equal(core.rank(rows,"and the of",10).length,0);
for(const brand of ["mobile-bible-beta","mobile-bible-sotw"]){
 const html=fs.readFileSync(path.resolve(root,"..",brand,"index.html"),"utf8");
 assert(html.includes("universal-search.js?v=20261122-us8"));
 assert(html.includes("universal-search.css?v=20261122-us6"));
 assert(html.includes("id='readerSourcesAttribution'"),"Sources & Attribution section must be mounted in hamburger");
}
const script=fs.readFileSync(path.join(root,"universal-search.js"),"utf8");
assert(script.includes("chapterIndex?.canonical_chapter"),"Scripture chapter checked before link");
assert(script.includes("state.edition"),"Preserves currently selected edition");
assert(script.includes("verseSource+book"),"Existing source reverse index must be consumed");
assert(script.includes("priorQAOpen=betaOpen"),"Study lifecycle must reset question panel");
assert(script.includes("SOTWReaderTrail"),"Supports return to search");
assert(script.includes('ref.addEventListener("click",()=>preview(row,ref))'),"Q&A citation opens in-search Scripture");
assert(script.includes('close.addEventListener("click",()=>{panel.remove();anchor.focus({preventScroll:true});})'),"Close returns to search reference without scrolling");
assert(!script.includes("data/historical/"),"Excluded historical collection must not load");
assert(script.includes("sourcesHeading.after(sourceDisclosure)"),"Q&A attribution must live inside hamburger source section");
assert(script.includes('sourceDisclosure.open=true'),"Source control expands its own entry");
// Shared coordination ranks published source sections without creating facts
// or changing adapter-owned IDs, ranges, author scopes or click behavior.
const coordinatorContext={};coordinatorContext.globalThis=coordinatorContext;
vm.createContext(coordinatorContext);
vm.runInContext(fs.readFileSync(path.join(root,"search-coordinator.js"),"utf8"),coordinatorContext);
const coord=coordinatorContext.SOTWSearchCoordinatorCore;
assert(coord&&typeof coord.order==="function");
assert.equal(coord.exactName("Who was Noah?","Noah"),true);
assert.equal(coord.exactName("Noah","Noah, Noah's family"),true);
const types=(groups,q)=>Array.from(coord.order(groups,q),g=>g.type);
assert.deepEqual(types([
 {type:"questions",caption:"What did Moses lift on the pole?"},
 {type:"topic",caption:"Moses"},
 {type:"scripture",caption:"Current chapter"}
],"Moses snake on stick"),["scripture","questions","topic"]);
assert.deepEqual(types([
 {type:"scripture",caption:"Current chapter"},
 {type:"questions",caption:"Who was Noah?"},
 {type:"name",caption:"Noah"}
],"Noah"),["name","scripture","questions"]);
assert(coord.weight("jacob","Jacob Romans 12","")>coord.weight("topic","Jacob Romans 12","Romans"));
for(const brand of ["mobile-bible-beta","mobile-bible-sotw"]){
 const html=fs.readFileSync(path.resolve(root,"..",brand,"index.html"),"utf8");
 assert(html.includes("search-coordinator.js?v=20261122-search3"),"Both branded readers load the coordinator");
}

// A passage group is only created when DIFFERENT independently attributed
// source types explicitly cite the same canonical book.chapter.verse.
const books=[{code:"2KI",name:"2 Kings",chapterCount:25},
 {code:"GEN",name:"Genesis",chapterCount:50},
 {code:"ROM",name:"Romans",chapterCount:16},
 {code:"1CO",name:"1 Corinthians",chapterCount:16}];
const valid=(type,id,book,chapter,verse,relationship)=>({
 type,id,relationship:relationship||coord.RELATIONS[type],
 targets:[{book,chapter,verse}]
});
const passageCandidates=[
 valid("question","utq:v91:2KI:18:4:ndxy","2KI",18,4),
 valid("topic","NEUU:TOPIC:brazen-serpent","2KI",18,4),
 valid("topic","NEUU:TOPIC:brazen-serpent","2KI",18,4), // same record cannot inflate coverage
 valid("jacob","ROM.12.17","ROM",12,17),
 valid("name","utw:v91:names:noah","GEN",6,8),
 valid("question","utq:v91:GEN:6:8:fictional-fixture","GEN",6,8)
];
const grouped=coord.groupEvidence(passageCandidates,books);
assert.equal(grouped.length,2,"Only explicitly overlapping citations make a group");
const bronzeGroup=grouped.find(g=>g.key==="2KI.18.4");
assert(bronzeGroup&&bronzeGroup.sources.length===2&&bronzeGroup.members.length===2,
 "The same historical source ID must not count twice");
const noahGroup=grouped.find(g=>g.key==="GEN.6.8");
assert(noahGroup&&noahGroup.sources.includes("name")&&noahGroup.sources.includes("question"));
assert(!grouped.some(g=>g.key==="ROM.12.17"),"An isolated accepted Jacob scope cannot claim other sources");
assert.equal(coord.canonicalTarget({book:"2KI",chapter:18,verse:4},books).key,"2KI.18.4");
assert.equal(coord.canonicalTarget({book:"2KI",chapter:27,verse:4},books),null);
assert.equal(coord.canonicalTarget({book:"2KI",chapter:18,verse:0},books),null);
assert.equal(coord.groupEvidence([
 valid("topic","unmapped","2KI",18,4,"TITLE_ONLY"),
 valid("question","verified","2KI",18,4)
],books).length,0,"A topic name alone is not mapped Scripture evidence");
assert.equal(coord.groupEvidence([
 valid("name","publisher-qa-association","2KI",18,4,"QUESTION_MENTION_ONLY"),
 valid("question","verified","2KI",18,4)
],books).length,0,"A publisher name mention is not an independent article citation");
assert.equal(coord.groupEvidence([
 valid("question","a","1CO",16,10),
 valid("topic","b","1CO",16,11)
],books).length,0,"Overlapping chapter but different exact verse must not be joined");
for(const brand of ["mobile-bible-beta","mobile-bible-sotw"]){
 const html=fs.readFileSync(path.resolve(root,"..",brand,"index.html"),"utf8");
 assert(html.includes("search-coordinator.js?v=20261122-search3"),
 "Both independent brands load the exact same passage evidence code");
}

console.log("PASS: 12,139 unique source-unaltered Q&A; valid passage IDs; natural/fuzzy ranking; two-brand wiring");
