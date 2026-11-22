/* Source-scoped Jacob doctrine badges: accepted reader evidence only. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.resolve(__dirname,'..');
const index=JSON.parse(fs.readFileSync(path.join(dir,'data/verse-doctrine-tags.v1.json'),'utf8'));
const jacob=JSON.parse(fs.readFileSync(path.resolve(dir,'../api/jacob-lannom/v1/current-commentary.json'),'utf8'));
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const study=fs.readFileSync(path.join(dir,'study-ux-repair.js'),'utf8');
assert.equal(index.schema,'sotw-reader-verse-doctrine-display-v1');
assert.equal(index.status,'LIMITED_EVIDENCE_SCOPED_COVERAGE');
assert.equal(jacob.authorId,'jacob-lannom');
assert(jacob.entries.length>=16,'Published Jacob corpus must not shrink below the validated baseline');
const mapped=new Set();
for(const tag of index.entries){
 assert(tag.display&&tag.formal&&Array.isArray(tag.aliases)&&tag.aliases.length);
 const source=tag.evidenceScopeKey||tag.scopeKey;
 const entry=jacob.entries.find(x=>x.scopeKey===source);
 assert(entry&&entry.commentary.trim(),'Doctrine tag must resolve to accepted author commentary: '+source);
 if(tag.evidenceScopeKey){
  assert.equal(tag.evidenceLevel,'PASSAGE_THEME_IN_CHAPTER_CONTEXT');
  assert.equal(tag.evidenceScopeType,entry.scopeType);
  assert.equal(source,'ACT.2');
  assert.equal(tag.scopeKey,'ACT.2.1-4','Chapter context does not authorize a whole-chapter badge');
 }else assert.equal(source,tag.scopeKey,'Direct labels must match exact author scopes');
 mapped.add(source);
}
assert.deepEqual(Array.from(mapped).sort(),
 ['ACT.2','ACT.2.37-41','ACT.6.1-7','EPH.4.11-16','GAL.6.1','HEB.13.17','1CO.5.1-13'].sort());
assert(!mapped.has('ROM.12.17'),'Romans 12:17 must not receive invented doctrine label');
assert(html.includes('function appendJacobDoctrineBadge(parent,entry,generation)'));
assert(html.includes("appendJacobDoctrineBadge(body,entry,gen)"),'Badge follows each Jacob entry title');
assert(html.includes("appendJacobDoctrineBadge(disclosure,entry,gen)"),'Chapter introductions can display scoped passage themes');
assert(html.includes("(tag.evidenceScopeKey||tag.scopeKey)===entry.scopeKey"),
 'Badges are joined to precise accepted author scopes, not search terms');
assert(html.includes("tag.evidenceLevel==='PASSAGE_THEME_IN_CHAPTER_CONTEXT'"));
assert(html.includes('tag.aliases.slice(0,4)'),'Source-owned aliases are displayed');
assert(!html.includes('showVerseDoctrineTags()'),'No standalone general verse study doctrine card');
assert(!study.includes('doctrineTags'),'Word study must not expect the removed generic badge widget');
assert(!html.includes('id=\'doctrineTags\''),'Generic study badge container removed');
console.log('PASS: seven accepted scoped doctrine rows, expanded Jacob source entries, author-only badge placement, no inference');
