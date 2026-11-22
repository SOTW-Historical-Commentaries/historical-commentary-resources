/* SOTW v0.17.3: historical Bible Topics only, BSB Word-by-Word protected. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const script=fs.readFileSync(path.join(root,'discovery-integrations.js'),'utf8');
const css=fs.readFileSync(path.join(root,'discovery-integrations.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const study=fs.readFileSync(path.join(root,'study-ux-repair.js'),'utf8');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(script,sandbox,{filename:'discovery-integrations.js',timeout:5000});
const core=sandbox.SOTWDiscoveryCore;
assert(core&&typeof core.rankTopics==='function');
const topics=[
 {id:'t2',title:'Aaron',verse_link_count:100},
 {id:'t1',title:'Aaronic Priesthood',verse_link_count:70},
 {id:'t3',title:'Atonement',verse_link_count:90},
 {id:'t4',title:'Annual Feasts',verse_link_count:8}
];
assert.deepEqual(Array.from(core.rankTopics(topics,'Aaron',3),x=>x.id),['t2','t1']);
assert.equal(core.rankTopics(topics,'a').length,0);
assert.equal(core.rankTopics([{id:'orphan',title:'ABARIM',verse_link_count:0}],'ABARIM').length,0,'Unmapped topic must not be navigable');

// Generic cross-source retrieval: the bridge applies to EVERY source-backed
// question and topic. These small records are synthetic test fixtures, not
// new historical index entries or asserted Bible references.
const qContext={};qContext.globalThis=qContext;
vm.createContext(qContext);
vm.runInContext(fs.readFileSync(path.join(root,'universal-search.js'),'utf8'),qContext);
const lexical=qContext.SOTWUniversalSearchCore;
assert(lexical&&typeof lexical.tokenMatch==='function');
assert(lexical.tokenMatch('brazen',new Set(['bronze']))>.7,
 'Original lexical synonyms are usable in either source direction');
const topicFixture=[
 {id:'NEUU:TOPIC:brazen_serpent',title:'BRAZEN SERPENT',
  shard:'topics/B.json',verse_link_count:3},
 {id:'FIXTURE:noah',title:'NOAH',shard:'topics/N.json',verse_link_count:4},
 {id:'FIXTURE:timothy',title:'TIMOTHY',shard:'topics/T.json',verse_link_count:4},
 {id:'FIXTURE:faith',title:'FAITH',shard:'topics/F.json',verse_link_count:4},
 {id:'FIXTURE:unrelated',title:'INCENSE OFFERINGS',shard:'topics/I.json',verse_link_count:4}
];
const qaFixture=[
 {row:['utq:v91:2KI:18:4:ndxy',
  'What were the people doing to the bronze serpent Moses had made?',
  'The people were burning incense to the bronze serpent.',[['2KI',18,4,0]]],score:49},
 {row:['utq:v91:GEN:6:9:test',
  'What kind of person was Noah?','Noah was righteous.',[['GEN',6,9,0]]],score:40},
 {row:['utq:v91:1CO:16:10:test',
  'What did Paul say about Timothy?','Timothy was working.',[['1CO',16,10,11]]],score:39},
 {row:['utq:v91:JAS:2:17:test',
  'What is faith by itself?','Faith without works is dead.',[['JAS',2,17,0]]],score:38}
];
const sources={
 '2KI':{schema:'sotw-topics-scripture-index/1.0.0',book_code:'2KI',
  verses:{'2KI.18.4':['NEUU:TOPIC:brazen_serpent','FIXTURE:unrelated']}},
 'GEN':{schema:'sotw-topics-scripture-index/1.0.0',book_code:'GEN',
  verses:{'GEN.6.9':['FIXTURE:noah']}},
 '1CO':{schema:'sotw-topics-scripture-index/1.0.0',book_code:'1CO',
  verses:{'1CO.16.10':['FIXTURE:timothy']}},
 'JAS':{schema:'sotw-topics-scripture-index/1.0.0',book_code:'JAS',
  verses:{'JAS.2.17':['FIXTURE:faith']}}
};
for(const [row,book,expected] of [
 [qaFixture[0],'2KI','NEUU:TOPIC:brazen_serpent'],
 [qaFixture[1],'GEN','FIXTURE:noah'],
 [qaFixture[2],'1CO','FIXTURE:timothy'],
 [qaFixture[3],'JAS','FIXTURE:faith']
]){
 const linked=Array.from(core.evidenceLinkedTopics(topicFixture,[row],
  {[book]:sources[book]},lexical),t=>t.id);
 assert.deepEqual(linked,[expected],book+' finds only a topic named in Q&A and citing the same verse');
}
assert.deepEqual(Array.from(core.evidenceLinkedTopics(topicFixture,[qaFixture[0]],
 {2KI:{...sources['2KI'],book_code:'GEN'}},lexical),t=>t.id),[],
 'Unverified reverse-index identity does not produce topic hits');
assert.deepEqual(Array.from(core.evidenceLinkedTopics(topicFixture,[qaFixture[0]],
 {2KI:{...sources['2KI'],verses:{'2KI.18.5':['NEUU:TOPIC:brazen_serpent']}}},lexical),t=>t.id),[],
 'A same-chapter different-verse historical topic is not linked');
assert.deepEqual(Array.from(core.evidenceLinkedTopics([
 {...topicFixture[0],verse_link_count:0}],[qaFixture[0]],sources,lexical),t=>t.id),[],
 'A topic without verified mapped verses cannot be retrieved');
assert.deepEqual(Array.from(core.evidenceLinkedTopics(topicFixture,
 [{row:[...qaFixture[0].row.slice(0,3),[]],score:49}],sources,lexical),t=>t.id),[],
 'Question text without an original Scripture citation cannot create a link');
assert.equal(core.rankTopics(topicFixture,'Moses snake on stick').length,0,
 'No hardcoded biblical event in literal topic matching');
assert.deepEqual(Array.from(core.rankTopics(topicFixture,'Moses snake on stick',8,
 core.evidenceLinkedTopics(topicFixture,[qaFixture[0]],sources,lexical)),t=>t.id),
 ['NEUU:TOPIC:brazen_serpent']);
assert.deepEqual(Array.from(core.rankTopics(topicFixture,'BRAZEN SERPENT',8,
 [topicFixture[0]]),t=>t.id),['NEUU:TOPIC:brazen_serpent'],
 'Cross-source match must not duplicate a literal source title');
assert.deepEqual(Array.from(core.requiredTopicBooks(qaFixture,3)),['2KI','GEN','1CO']);

assert.deepEqual(Array.from(core.rankTopics([{id:'mapped',title:'Aaron',verse_link_count:1},{id:'orphan',title:'Aaron',verse_link_count:0}],'Aaron'),x=>x.id),['mapped']);
const books=[{code:'GEN',name:'Genesis',chapterCount:50},{code:'EXO',name:'Exodus',chapterCount:40}];
assert.equal(core.parseScope('GEN.4.17',books)?.verse,17);
assert.equal(core.parseScope('EXO.7',books)?.hasVerse,false);
for(const key of ['GEN.0','GEN.90','UNKNOWN.1','EXO.2.0'])
 assert.equal(core.parseScope(key,books),null);
const idx={verses:{'GEN.4.17':['t2','t3'],'GEN.4.18':['t4']}};
assert.deepEqual(Array.from(core.verseTopicIds(idx,'GEN.4.17')),['t2','t3']);
assert.deepEqual(Array.from(core.verseTopicIds(idx,'GEN.4.19')),[]);
assert.equal(core.sourceHeading('.Esau forgives Jacob').title,'Esau forgives Jacob');
assert.equal(core.sourceHeading('1545:').title,'Other indexed passages');
assert.equal(core.sourceHeading('1545:').sourceLabel,'1545:');
for(const label of ['18:5-7,9;','5:8,16;6:18;']){
 assert.equal(core.sourceHeading(label).title,'Other indexed passages');
 assert.equal(core.sourceHeading(label).sourceLabel,label);
}
assert.equal(core.sourceHeading('The old man of Gibeah').title,'The old man of Gibeah');
assert.equal(core.sourceHeading('1.').title,'Other indexed passages');
assert.equal(core.sourceHeading('1.').sourceLabel,'1.');
assert.equal(core.sourceHeading('Intoxi').title,'Unclear historical index heading');
assert.equal(core.sourceHeading('Intoxi').sourceLabel,'Intoxi');
const sampleTopic={references:[
 {raw:'Genesis 33:4,11',status:'mapped',verse_ids:['GEN.33.4','GEN.33.11']},
 {raw:'Genesis 45:5-15',status:'mapped',verse_ids:['GEN.45.5','GEN.45.6']},
 {raw:'Unknown 1',status:'unresolved',verse_ids:[]}],
 aspects:[
 {label:'.Esau forgives Jacob',references:['Genesis 33:4,11']},
 {label:'.Joseph forgives his brothers',references:['Genesis 45:5-15']},
 {label:'1545:',references:['Genesis 33:4,11']},
 {label:'.SeeENEMY',references:[]},
 {label:'Broken',references:['Unknown 1']}]
};
const sections=Array.from(core.topicSections(sampleTopic));
assert.equal(sections.length,3);
assert.equal(sections[0].title,'Esau forgives Jacob');
assert.equal(sections[0].references[0].raw,'Genesis 33:4,11');
assert.equal(sections[0].references[0].scopes.length,2,
 'One source citation may contain multiple verses and must remain one reference row');
assert.equal(sections[1].title,'Joseph forgives his brothers');
assert.equal(sections[2].title,'Other indexed passages');
assert(!script.includes('accepted-source.json')&&!script.includes('ACCEPTED='),
 'People/Places/Events directory must not be loaded by the public reader');
assert(!script.includes('rankEntities')&&!script.includes('showEntity('));
assert(!script.includes('sourceJson(BSB+')&&!script.includes('discovery-bsb'),
 'Redundant source-language order panel must be absent');
assert(!css.includes('.discovery-word-grid')&&!css.includes('.discovery-original-body'));
assert(script.includes("'Related Bible Topics'")&&script.includes("'Explore topics ›'")&&script.includes('sourceHeading('));
assert(css.includes('border:0;border-radius:11px;background:transparent'),'Topics launcher should not have nested border');
assert(script.includes('The first tap shows topic content and Scripture citations'),'Topics must render actual content without intermediate topic menu');
assert(!script.includes("expandList(verseBody,titles,(parent,t)=>button(parent,t.title,()=>showTopic(t)"),'No extra topic selection layer');
assert(script.includes("sourceJson(TOPICS+'index/by-scripture/'"));
assert(script.includes('One historical source citation')&&script.includes('expandList('));
assert(script.includes("'discovery-citation jacob-passage-link'")&&script.includes('wrapper.append(link);parent.append(wrapper)'),'Topic citation must be a navigable verified link with original text');
assert(!script.includes('innerHTML='),'Source text must never become executable HTML');
assert(!script.includes('eval('));
assert(html.includes("const moreModal=modalLayer('readerMoreModal','About & Sources')"));
assert(html.includes('discovery-integrations.js?v=20261122-discovery12'));
assert(html.includes('reader-return.js?v=20261118-return1'),'Reader must load return navigation');
assert(html.includes('study-ux-repair.js?v=20261118-reader166'),'Reader must load current Strong’s repair');
assert(html.includes('m.counts?.chapters'),'Exodus-style manifests must be accepted with verified chapter counts');
assert(study.includes('canonicalStrongsEntryKey(id)'),'Padded BSB Strong’s IDs must resolve to canonical dictionary keys');
assert(html.includes('discovery-integrations.css?v=20261120-discovery4'));
assert(sw.includes("PREFIX='sotw-mobile-bible-beta-shell-'")&&sw.includes("CACHE=PREFIX+'v0203'"));
assert(sw.includes('./reader-return.js'),'PWA must precache the return script');
assert(sw.includes('./jacob-search.js'),'PWA must precache published Jacob search');
assert(html.includes('jacob-search.js?v=20261118-jacobsearch2'));
assert(sw.includes('./discovery-integrations.js')&&sw.includes('./discovery-integrations.css'));
assert(study.includes('renderBsbWordByWord')&&study.includes("if(state.edition==='BSB')"),
 'Full publisher-aligned BSB Word-by-Word must remain intact');
console.log('PASS: topic-only adapter, compact mapped citations, old directory and original-order panel removed, BSB unchanged');
