/* Read-only URL/share rules for both branded reader entrypoints. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'../..');
for(const dir of ['mobile-bible-beta','mobile-bible-sotw']){
 const src=fs.readFileSync(path.join(root,dir,'index.html'),'utf8');
 assert(src.includes("const incomingBook=BOOKS.find(b=>b.code===query.get('book'))"),dir+' accepts explicit book');
 assert(src.includes("const initBook=(incomingBook||savedBook||BOOKS[0]).code"),dir+' fresh base Genesis default');
 assert(src.includes("incomingBook?(validChapter(queryChapter,incomingBook)?queryChapter:1)"),dir+' explicit book does not inherit saved chapter');
 assert(src.includes("incomingBook?(validVerse(Number(query.get('verse')))?Number(query.get('verse')):1)"),dir+' explicit book does not inherit saved verse');
 assert(src.includes("const incomingJacobScope=query.get('jacob')||''"),dir+' accepts exact Jacob scope');
 assert(src.includes("state.jacob.find(e=>e.scopeKey===incomingJacobScope"),dir+' only validated author source');
 assert(src.includes("readerShareUrl(verse=state.verse,jacobScope=''"),dir+' source-scoped outgoing URL');
 assert(src.includes("new URL(location.pathname+'?'+params.toString(),location.origin)"),dir+' current brand URL not a hardcoded other brand');
 assert(src.includes("const scope=accepted&&parseScope(accepted.scopeKey)"),dir+' links book, chapter and passage author scopes');
 assert(src.includes("params.set('jacob',accepted.scopeKey)"),dir+' exact author identity');
 assert(src.includes("shareVerseAction.id='shareCurrentVerse'"),dir+' reader share action');
 assert(src.includes("share.className='jacob-share-action'"),dir+' commentary share action');
 assert(src.includes("share.textContent='↗ Share'"),dir+' compact Jacob share label');
 assert(src.includes("label.textContent=description"),dir+' exact published passage reference in header');
 assert(src.includes("appendJacobReferenceShare(body,entry)"),dir+' reference is shown before commentary text');
 assert(src.includes("readerShare(parsed?.from||1,entry.scopeKey)"),dir+' each action shares its own published scope');
 assert(src.includes("scope?(scope.chapter||1):state.chapter"),dir+' book overview shares its canonical first chapter');
 assert(src.includes("navigator.share({title:scope?"),dir+' native share with clipboard fallback');
 const key=dir==='mobile-bible-beta'?'sotw.mobile.reader.beta.v1':'sotw.mobile.reader.sotw.v1';
 assert(src.includes('localStorage.getItem("'+key+'")'),dir+' isolated saved reading key');
 assert(src.includes("const p=loadJacob();await loadBook();await p;"),dir+' Scripture and author need to load before opening scope');
}
const sw1=fs.readFileSync(path.join(root,'mobile-bible-beta','sw.js'),'utf8');
const sw2=fs.readFileSync(path.join(root,'mobile-bible-sotw','sw.js'),'utf8');
assert(sw1.includes("PREFIX='sotw-mobile-bible-beta-shell-'")&&sw2.includes("PREFIX='sotw-mobile-bible-sotw-shell-'"));
console.log('PASS: both brand URL parsers and share paths, source-scoped Jacob links, no cross-brand share, isolated PWA state');
