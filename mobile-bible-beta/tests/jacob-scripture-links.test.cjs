/* Published Jacob reference-link contract and pass-through validation. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..','..');
const script=fs.readFileSync(path.join(root,'mobile-bible-beta/jacob-scripture-links.js'),'utf8');
const sandbox={URLSearchParams};sandbox.globalThis=sandbox;
vm.runInNewContext(script,sandbox,{filename:'jacob-scripture-links.js',timeout:5000});
const links=sandbox.SOTWJacobLinks;
assert(links,'Missing published Scripture-link router');
const sourceFile=JSON.parse(fs.readFileSync(path.join(root,'api/jacob-lannom/v1/current-commentary.json'),'utf8'));
assert.equal(sourceFile.schemaVersion,'jacob-commentary-current-v1');
assert.equal(sourceFile.authorId,'jacob-lannom');
const entries=sourceFile.entries;
const romans=entries.find(x=>x.scopeKey==='ROM.12.17');
assert(romans&&typeof romans.commentary==='string');
assert.equal(links.outbound(romans).length,7,'All seven owner-published Romans links must be exposed');
assert.deepEqual(Array.from(links.outbound(romans),x=>x.scope),[
 'PRO.20.22','PRO.24.29','EXO.21.24','2CO.8.21','1TH.5.15','ROM.12.14-16','ROM.12.18-21'
]);
assert.equal(links.inbound(entries,'ROM.12.17').length,1,'Romans chapter intro should point inward');
assert.equal(links.inbound(entries,'ROM.12.17')[0].scope,'ROM.12');
assert.equal(links.label('PRO.20.22'),'Proverbs 20:22');
assert.equal(links.label('ROM.12.14-16'),'Romans 12:14–16');
assert.equal(links.label('1TH.5.15'),'1 Thessalonians 5:15');
assert.equal(links.relationshipName({type:'QUALIFIES'}),'Qualifies');
assert.equal(links.relationshipName({type:'ILLUSTRATES'}),'Illustrates');
assert.equal(links.parse('ROM.12.14-16').verse,14);
assert.equal(links.parse('ROM.12.14-16').endVerse,16);
assert.deepEqual(links.parse('ROM.12.18-21')?.hasRange,true);
assert.equal(links.parse('ROM.12.22-18'),null);
assert.equal(links.parse('ROM.99.1'),null);
assert.equal(links.parse('XYZ.2.1'),null);
assert.equal(links.parse('ROM.12.0'),null);
assert.equal(links.parse('ROM.12.177'),null);
assert.equal(links.parse('ROM.12.17;alert(1)'),null);
const url=links.bibleHref('ROM.12.14-16','BSB','mobile-bible-beta/');
assert.equal(url,'mobile-bible-beta/?book=ROM&chapter=12&verse=14&translation=BSB');
assert.equal(links.bibleHref('ROM.12.17','ASV1901','./'),'./?book=ROM&chapter=12&verse=17&translation=ASV1901');
assert.equal(links.bibleHref('ROM.12.17','WEBSTER1833','./'),'./?book=ROM&chapter=12&verse=17&translation=WEBSTER1833');
assert.equal(links.bibleHref('ROM.12.17','untrusted','./'),'./?book=ROM&chapter=12&verse=17&translation=KJV1769');
assert.equal(links.bibleHref('INVALID.12.9','BSB','./'),null);
for(const e of entries){
 for(const rel of links.outbound(e)){
  assert(links.bibleHref(rel.scope,'KJV1769','./'),'Unfollowable published Scripture relationship');
 }
}
const mobile=fs.readFileSync(path.join(root,'mobile-bible-beta/index.html'),'utf8');
const review=fs.readFileSync(path.join(root,'review-jake-scripture.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'mobile-bible-beta/sw.js'),'utf8');
assert(mobile.includes('jacob-scripture-links.js?v=20261118-jacoblinks1'));
assert(review.includes('mobile-bible-beta/jacob-scripture-links.js?v=20261118-jacoblinks1'));
assert(mobile.includes('appendJacobScriptureReferences(body,entry)'), 'Full reader author sheet must show links');
assert(mobile.includes('appendJacobScriptureReferences(c.body,e)'), 'Compact reader author sheet must show links');
assert(review.includes("routing.bibleHref(row.scope,$('translation').value,'mobile-bible-beta/')"),
 'Review viewer must link Scripture in the selected edition even without Jacob target commentary');
assert(sw.includes('./jacob-scripture-links.js'), 'PWA must cache this routing code');
assert(!/Accepted pastoral commentary|accepted passage commentary|No accepted Jacob commentary/.test(mobile),
 'Do not render internal acceptance statuses to public');
assert(!review.includes('Jacob commentary not yet available for this exact scope'),
 'Review viewer must not imply the Bible target is unavailable');
console.log('PASS published-only Jacob references: seven Romans links, incoming context, four editions, canonical scope/range, no acceptance labels');
