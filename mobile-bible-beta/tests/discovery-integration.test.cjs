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
assert(script.includes("'discovery-citation jacob-passage-link'")&&script.includes('parent.append(link)'),'Topic citation must be a navigable verified link');
assert(!script.includes('innerHTML='),'Source text must never become executable HTML');
assert(!script.includes('eval('));
assert(html.includes("const moreModal=modalLayer('readerMoreModal','About & Sources')"));
assert(html.includes('discovery-integrations.js?v=20261120-discovery9'));
assert(html.includes('reader-return.js?v=20261118-return1'),'Reader must load return navigation');
assert(html.includes('study-ux-repair.js?v=20261118-reader166'),'Reader must load current Strong’s repair');
assert(html.includes('m.counts?.chapters'),'Exodus-style manifests must be accepted with verified chapter counts');
assert(study.includes('canonicalStrongsEntryKey(id)'),'Padded BSB Strong’s IDs must resolve to canonical dictionary keys');
assert(html.includes('discovery-integrations.css?v=20261120-discovery4'));
assert(sw.includes("PREFIX='sotw-mobile-bible-beta-shell-'")&&sw.includes("CACHE=PREFIX+'v0191'"));
assert(sw.includes('./reader-return.js'),'PWA must precache the return script');
assert(sw.includes('./jacob-search.js'),'PWA must precache published Jacob search');
assert(html.includes('jacob-search.js?v=20261118-jacobsearch2'));
assert(sw.includes('./discovery-integrations.js')&&sw.includes('./discovery-integrations.css'));
assert(study.includes('renderBsbWordByWord')&&study.includes("if(state.edition==='BSB')"),
 'Full publisher-aligned BSB Word-by-Word must remain intact');
console.log('PASS: topic-only adapter, compact mapped citations, old directory and original-order panel removed, BSB unchanged');
