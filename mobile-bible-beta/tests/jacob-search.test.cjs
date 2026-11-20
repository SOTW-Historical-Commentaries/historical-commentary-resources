/* Published-only Jacob commentary search, lexical context and navigation gates. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const js=fs.readFileSync(path.join(root,'jacob-search.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(js,sandbox,{filename:'jacob-search.js',timeout:5000});
const core=sandbox.SOTWJacobSearchCore;
assert(core&&typeof core.search==='function');
const data=JSON.parse(fs.readFileSync(path.resolve(root,'../api/jacob-lannom/v1/current-commentary.json'),'utf8'));
assert.equal(data.authorId,'jacob-lannom');
assert(Array.isArray(data.entries)&&data.entries.length>=16);
const books=[
 {code:'ACT',name:'Acts',chapterCount:28},{code:'HEB',name:'Hebrews',chapterCount:13},
 {code:'EPH',name:'Ephesians',chapterCount:6},{code:'1CO',name:'1 Corinthians',chapterCount:16},
 {code:'GAL',name:'Galatians',chapterCount:6},{code:'ROM',name:'Romans',chapterCount:16},
 {code:'GEN',name:'Genesis',chapterCount:50},{code:'1SA',name:'1 Samuel',chapterCount:31},
 {code:'LUK',name:'Luke',chapterCount:24}
];
const scopes=q=>Array.from(core.search(data.entries,q,books),r=>r.entry.scopeKey);
assert.equal(scopes('Lannom').length,data.entries.length);
assert.equal(scopes('Jacob').length,data.entries.length);
assert.equal(scopes('Lannom All').length,data.entries.length);
assert.deepEqual(scopes('Lannom Romans').sort(),['ROM','ROM.12','ROM.12.17','ROM.12.18'].sort());
assert.deepEqual(scopes('Lannom in Rom').sort(),['ROM','ROM.12','ROM.12.17','ROM.12.18'].sort());
assert.deepEqual(scopes('Lannom Acts').sort(),['ACT.2','ACT.2.37-41','ACT.6.1-7','ACT.7.54-60'].sort());
const revenge=scopes('Revenge - Lannom');
assert(revenge.includes('ROM.12.17'),'Romans private revenge teaching must be discoverable');
assert(revenge.includes('GEN.45.1-8'),'Genesis revenge entry must be discoverable');
assert(revenge.includes('1SA.24.3-7'),'David entry must be discoverable');
assert(scopes('private revenge').includes('ROM.12.17'));
assert.equal(scopes('the').length,0,'Common filler must not flood general Scripture search');
assert(!js.includes('review-package')&&!js.includes('SPP_RESEARCH'),'No unpublished source imports');
assert(js.includes("getJson('../api/jacob-lannom/v1/current-commentary.json')"),
 'Only published Jacob catalog is searched');
assert(js.includes('scopeKey:entry.scopeKey'),'Search should open exact author scope');
assert(html.includes('jacob-search.js?v=20261118-jacobsearch2'));
assert(js.includes("host.open=expandAll")&&js.includes("document.createElement('details')"),
 'Published Jacob sections should collapse until expanded or explicit Lannom all');
assert(html.includes("window.visualViewport?.addEventListener('resize',positionSearchViewport"),
 'Search modal must track the software keyboard viewport');
assert(html.includes('overscroll-behavior-y:contain')&&html.includes('#readerSearchModal .modal-content'),
 'Search results must scroll independently while header and input remain visible');
assert(html.includes("button.jacob-verse-marker[data-jacob-verse="),
 'Selected verse must prefer marker anchor');
assert(html.includes('readerView.scrollTop=Math.max(0,readerView.scrollTop+anchor.top-pane.top-'),
 'Scroll the chapter pane, not the sticky document');
assert(!html.includes("el.scrollIntoView({block:'start',behavior:'instant'})"),
 'No document-level verse jump under sticky header');
assert(sw.includes("PREFIX='sotw-mobile-bible-beta-shell-'")&&sw.includes("CACHE=PREFIX+'v0189'")&&sw.includes('./jacob-search.js'));
console.log('PASS: 16 published Jacob entries, author/book/topic matches, exact scope, marker-first chapter scrolling and cache');
