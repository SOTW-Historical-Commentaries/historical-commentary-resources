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
const exact=core.rank(rows,"Who was the Word with?",20);
assert(exact.some(r=>r.row[0]==="utq:v91:JHN:1:1-2:jzv6"),"Exact question finds published John 1:1–2");
const bronze=rows.find(r=>r[0]==="utq:v91:2KI:18:4:ndxy");
assert(bronze&&core.score(bronze,core.words("Moses snake on stick"),core.normalize("Moses snake on stick"))>0,
 "Natural-language Moses/snake/stick retrieves published bronze-serpent question");
assert(core.score(bronze,core.words("bronze serpant Moses"),core.normalize("bronze serpant Moses"))>0,"One-edit spelling tolerance");
const noReference=[...rows[0]];noReference[3]=[];
assert.equal(core.rank([noReference],"Moses",10).length,0); // unsupported citation cannot be ranked
assert.equal(core.rank(rows,"and the of",10).length,0);
for(const brand of ["mobile-bible-beta","mobile-bible-sotw"]){
 const html=fs.readFileSync(path.resolve(root,"..",brand,"index.html"),"utf8");
 assert(html.includes("universal-search.js?v=20261121-us3"));
 assert(html.includes("universal-search.css?v=20261121-us3"));
 assert(html.includes("id='readerSourcesAttribution'"),"Sources & Attribution section must be mounted in hamburger");
}
const script=fs.readFileSync(path.join(root,"universal-search.js"),"utf8");
assert(script.includes("chapterIndex?.canonical_chapter"),"Scripture chapter checked before link");
assert(script.includes("state.edition"),"Preserves currently selected edition");
assert(script.includes("SOTWReaderTrail"),"Supports return to search");
assert(!script.includes("data/historical/"),"Excluded historical collection must not load");
assert(script.includes("sourcesHeading.after(sourceDisclosure)"),"Q&A attribution must live inside hamburger source section");
assert(script.includes('sourceDisclosure.open=true'),"Source control expands its own entry");
console.log("PASS: 12,139 unique source-unaltered Q&A; valid passage IDs; natural/fuzzy ranking; two-brand wiring");
