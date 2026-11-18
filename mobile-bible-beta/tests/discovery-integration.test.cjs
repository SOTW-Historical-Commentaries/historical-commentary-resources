/* SOTW v0.17 source/schema, ranking and protected-reader smoke tests. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const dir=path.resolve(__dirname,'..');
const script=fs.readFileSync(path.join(dir,'discovery-integrations.js'),'utf8');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(dir,'sw.js'),'utf8');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(script,sandbox,{filename:'discovery-integrations.js',timeout:3000});
const core=sandbox.SOTWDiscoveryCore;
assert(core&&typeof core.rankTopics==='function');
const topics=[
{id:'t2',title:'Aaron',verse_link_count:100},{id:'t1',title:'Aaronic Priesthood',verse_link_count:70},
{id:'t3',title:'Atonement',verse_link_count:90},{id:'t4',title:'Annual Feasts',verse_link_count:8}
];
assert.deepEqual(Array.from(core.rankTopics(topics,'Aaron',3),x=>x.id),['t2','t1']);
assert.equal(core.rankTopics(topics,'a').length,0);
const people={people:[{id:'person-cain',name:'Cain',scriptureScopes:['GEN.4.17']}],
 places:[{id:'place-canaan',name:'Canaan',mapWarning:'candidate only'}],
 events:[{id:'event-plagues',name:'The Ten Plagues',scriptureScopes:['EXO.7']}]};
assert.deepEqual(Array.from(core.rankEntities(people,'Ca',4),x=>x.id),['person-cain','place-canaan']);
assert.deepEqual(Array.from(core.rankEntities(people,'plagues',4),x=>x.id),['event-plagues']);
const books=[{code:'GEN',name:'Genesis',chapterCount:50},{code:'EXO',name:'Exodus',chapterCount:40}];
assert.equal(core.parseScope('GEN.4.17',books)?.verse,17);
assert.equal(core.parseScope('EXO.7',books)?.hasVerse,false);
for(const key of ['GEN.0','GEN.90','UNKNOWN.1','EXO.2.0'])assert.equal(core.parseScope(key,books),null);
const idx={verses:{'GEN.4.17':['t2','t3'],'GEN.4.18':['t4']}};
assert.deepEqual(Array.from(core.verseTopicIds(idx,'GEN.4.17')),['t2','t3']);
assert.deepEqual(Array.from(core.verseTopicIds(idx,'GEN.4.19')),[]);
const reverse={reverseScriptureScopes:{'EXO.7':['event-plagues'],'EXO.7.1':['person-cain']}};
assert.deepEqual(Array.from(core.entityIdsForScope(reverse,'EXO.7.1')),['person-cain']);
assert.deepEqual(Array.from(core.entityIdsForScope(reverse,'EXO.7.9')),[]);
assert.deepEqual(Array.from(core.entityIdsForScope(reverse,'EXO.7')),['event-plagues']);
const sample={schema:'sotw-bsb-helloao-interlinear-source/1.0.0',edition_id:'BSB',
book_code:'GEN',chapter:1,verses:[{id:'GEN.1.1',verse:1,words:[
 {pos:2,bsbPos:3,text:'בָּרָא',strongs:'H1254'},
 {pos:1,bsbPos:4,text:'בְּרֵאשִׁית',strongs:'H7225'}
]}]};
assert.deepEqual(Array.from(core.getWords(sample,'GEN',1,1),x=>x.strongs),['H7225','H1254']);
assert.equal(core.getWords(sample,'GEN',1,2).length,0);
assert(!script.includes('innerHTML='),'Integration must not interpolate source-derived HTML');
assert(!script.includes('eval('));
const css=html.indexOf('discovery-integrations.css');
const study=html.indexOf('study-ux-repair.js');
const discovery=html.indexOf('discovery-integrations.js');
assert(css>0&&study>0&&discovery>study&&html.indexOf('discovery-integrations.js',discovery+1)<0,
 'Integration scripts must load once and after study repair.');
assert(sw.includes('./discovery-integrations.js')&&sw.includes('./discovery-integrations.css'),
 'PWA must cache its new read-only study resources.');
assert(script.includes("sourceJson(TOPICS+'index/by-scripture/'"));
assert(script.includes("sourceJson(BSB+'chapters/'"));
assert(script.includes("sourceJson(ACCEPTED+'accepted-source.json')"));
console.log('PASS: 3 adapters, source schema, exact/chapter scope separation, original word order, safe UI integration');
