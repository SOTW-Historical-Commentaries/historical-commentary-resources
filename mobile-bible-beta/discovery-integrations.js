/* SOTW Discovery v0.17: three independently attributed, published data adapters.
   1) NEUU Nave/Torrey historical topics, 2) accepted CGBC people/place/event source,
   3) HelloAO BSB original-language forms. Nothing changes the Scripture renderer.
   No English-token alignments are inferred from HelloAO bsbPos. */
(function(root){
'use strict';
const TOPICS='https://raw.githubusercontent.com/Stewards-of-the-Way/bible-foundation/main/data/topics/nave-torrey/v1/';
const ACCEPTED='https://raw.githubusercontent.com/Stewards-of-the-Way/bible-foundation/main/data/search/people-time-place/accepted/v1/';
const BSB='https://raw.githubusercontent.com/SOTW-BSB/-bsb-resources/main/data/bsb/helloao-interlinear/v1/';
const SOURCES={
 topics:'https://github.com/Stewards-of-the-Way/bible-foundation/tree/main/data/topics/nave-torrey/v1',
 people:'https://github.com/Stewards-of-the-Way/bible-foundation/tree/main/data/search/people-time-place/accepted/v1',
 language:'https://github.com/SOTW-BSB/-bsb-resources/tree/main/data/bsb/helloao-interlinear/v1'
};
const asText=x=>String(x??'').trim();
const norm=x=>asText(x).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
const tokenMatch=(title,query)=>{const t=norm(title),q=norm(query);return t===q?0:t.startsWith(q)?1:t.includes(' '+q)?2:t.includes(q)?3:99;};
function rankTopics(rows,query,limit=8){
 if(norm(query).length<2)return [];
 return rows.filter(x=>x&&x.id&&x.title&&tokenMatch(x.title,query)<99)
 .sort((a,b)=>tokenMatch(a.title,query)-tokenMatch(b.title,query)||a.title.localeCompare(b.title))
 .slice(0,limit);
}
function rankEntities(data,query,limit=8){
 if(norm(query).length<2)return [];
 const combined=[...(data.people||[]).map(x=>({...x,type:'person'})),
 ...(data.places||[]).map(x=>({...x,type:'place'})),
 ...(data.events||[]).map(x=>({...x,type:'event'}))];
 return combined.filter(x=>x.id&&x.name&&tokenMatch(x.name,query)<99)
 .sort((a,b)=>tokenMatch(a.name,query)-tokenMatch(b.name,query)||a.name.localeCompare(b.name))
 .slice(0,limit);
}
function parseScope(scope,bookRows){
 const m=/^([1-3]?[A-Z]{2,3})\.(\d+)(?:\.(\d+))?$/.exec(asText(scope));
 if(!m)return null;
 const book=bookRows.find(b=>b.code===m[1]),chapter=Number(m[2]),verse=Number(m[3]||1);
 if(!book||chapter<1||chapter>book.chapterCount||verse<1||verse>176)return null;
 return {book,chapter,verse,hasVerse:!!m[3]};
}
function verseTopicIds(index,scope){
 if(!Array.isArray(index?.verses))return [];
 const row=index.verses.find(x=>Array.isArray(x)&&x[0]===scope);
 return Array.isArray(row?.[1])?row[1]:[];
}
function entityIdsForScope(data,scope){
 const map=data?.reverseScriptureScopes||{};
 const key=scope.split('.').slice(0,2).join('.');
 return Array.from(new Set(map[scope]||[]));
}
function getWords(chapter,book,number,verse){
 if(!chapter||chapter.schema!=='sotw-bsb-helloao-interlinear-source/1.0.0'||
 chapter.edition_id!=='BSB'||chapter.book_code!==book||Number(chapter.chapter)!==Number(number))return [];
 const row=(chapter.verses||[]).find(v=>v.id===book+'.'+number+'.'+verse&&Number(v.verse)===Number(verse));
 return Array.isArray(row?.words)?row.words.filter(w=>w&&typeof w.text==='string'&&Number.isInteger(w.pos)).sort((a,b)=>a.pos-b.pos):[];
}
root.SOTWDiscoveryCore={rankTopics,rankEntities,parseScope,verseTopicIds,entityIdsForScope,getWords};
if(typeof document==='undefined')return;

/* The reader owns state, navigation, study sheet, reference ranking, and author UI.
   This is one load-after adapter with read-only async fetches and cache. */
if(typeof state==='undefined'||typeof searchInput==='undefined'||typeof betaOpen==='undefined')return;
let topicIndex=null,acceptedData=null;
const cache=new Map();
function sourceJson(url){
 if(!cache.has(url)){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),18000);
  const pending=fetch(url,{cache:'no-store',signal:controller.signal}).then(r=>{
   if(!r.ok)throw Error('HTTP '+r.status+' for '+url);return r.json();
  }).catch(e=>{cache.delete(url);throw e}).finally(()=>clearTimeout(timeout));
  cache.set(url,pending);
 }
 return cache.get(url);
}
async function topicsIndex(){
 if(!topicIndex){
  const data=await sourceJson(TOPICS+'index/topics.json');
  if(data.schema!=='sotw-topics-search-index/1.0.0'||!Array.isArray(data.topics))throw Error('Topics index contract mismatch');
  topicIndex=data.topics;
 }
 return topicIndex;
}
async function accepted(){
 if(!acceptedData){
  const data=await sourceJson(ACCEPTED+'accepted-source.json');
  if(data.schema!=='sotw-accepted-people-place-source/1.0.0'||
   data.status!=='PUBLISHED_ACCEPTED_SOURCE_NOT_UI_CONNECTED'||!Array.isArray(data.people)||
   !Array.isArray(data.places)||!Array.isArray(data.events))throw Error('Accepted source contract mismatch');
  acceptedData=data;
 }
 return acceptedData;
}
function el(tag,cls,text){
 const x=document.createElement(tag);
 if(cls)x.className=cls;
 if(text!==undefined)x.textContent=text;
 return x;
}
function paragraph(parent,text,cls='discovery-note'){const p=el('p',cls,text);parent.append(p);return p;}
function link(parent,label,url){const a=el('a','discovery-link',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';parent.append(a);return a;}
function title(parent,heading,sub){
 parent.append(el('h3','discovery-heading',heading));
 if(sub)paragraph(parent,sub);
}
function button(parent,txt,fn,cls='discovery-card'){
 const b=el('button',cls,txt);b.type='button';b.addEventListener('click',fn);parent.append(b);return b;
}
const detail=modalLayer('sotwDiscoveryDetail','Source detail');
detail.panel.classList.add('discovery-dialog');
function showDetail(heading,make){
 detail.panel.querySelectorAll('.discovery-detail-body').forEach(x=>x.remove());
 const body=el('div','discovery-detail-body');
 title(body,heading);
 make(body);
 detail.panel.append(body);
 searchModal.veil.classList.remove('is-open');
 detail.veil.classList.add('is-open');
 detail.panel.scrollTop=0;
}
async function jump(scope){
 const target=parseScope(scope,BOOKS);if(!target)return;
 const b=target.book;
 try{
  const idx=await getJson(snapshotRoot(b)+'index/'+b.code+'/'+target.chapter+'.json');
  const max=Number(idx?.verse_count||0);
  if(idx?.canonical_chapter!==b.code+'.'+target.chapter||max<1||(target.hasVerse&&target.verse>max))
   throw Error('Unverified Scripture scope');
  detail.veil.classList.remove('is-open');
  searchModal.veil.classList.remove('is-open');
  betaCloseSheet();
  const same=state.book===b.code&&state.chapter===target.chapter;
  state.book=b.code;state.chapter=target.chapter;state.verse=target.verse;
  $('book').value=b.code;
  if(!same)await loadBook();else chooseVerse(target.verse);
  if(state.bible)modernJumpToVerse(target.verse);
 }catch(e){
  const body=detail.panel.querySelector('.discovery-detail-body');
  if(body)paragraph(body,'Unable to verify that passage. Nothing was changed.','discovery-error');
 }
}
function scopeButton(parent,scope){
 const parsed=parseScope(scope,BOOKS);
 if(!parsed)return;
 button(parent,parsed.book.name+' '+parsed.chapter+(parsed.hasVerse?':'+parsed.verse:''),()=>jump(scope),'discovery-ref');
}
function scopedLinks(parent,scopes,limit=20){
 const row=el('div','discovery-references');parent.append(row);
 for(const s of Array.from(new Set(scopes||[])).slice(0,limit))scopeButton(row,s);
 if((scopes||[]).length>limit)paragraph(parent,'Additional references are preserved in the published source.');
}
async function showTopic(topic){
 showDetail('Historical Bible Topic · '+topic.title,body=>{
  paragraph(body,'Nave/Torrey historical source associations, not an SOTW doctrinal ruling.');
  paragraph(body,'Loading published topic references…');
 });
 const body=detail.panel.querySelector('.discovery-detail-body');
 try{
  const shard=await sourceJson(TOPICS+topic.shard);
  const row=shard?.topics?.find(t=>t.id===topic.id);
  if(!body.isConnected||!row||shard.schema!=='sotw-topics-neuu-shard/1.0.0')throw Error('Topic source unavailable');
  body.querySelectorAll('p').forEach((p,i)=>{if(i===1)p.remove()});
  let shown=0;
  for(const aspect of row.aspects||[]){
   const mapped=(row.references||[]).filter(r=>r.status==='mapped'&&Array.isArray(r.verse_ids));
   const scopes=Array.from(new Set(mapped.filter(r=>(aspect.references||[]).includes(r.raw)).flatMap(r=>r.verse_ids)));
   if(!scopes.length)continue;
   const group=el('section','discovery-section');title(group,asText(aspect.label)||'Related Scriptures');
   scopedLinks(group,scopes,12);body.append(group);shown++;
   if(shown>=5)break;
  }
  if(!shown)paragraph(body,'No validated verse-level links are published for this topic.');
  link(body,'Nave/Torrey source and attribution',SOURCES.topics);
 }catch{if(body.isConnected)paragraph(body,'The topic detail could not be loaded. The original source was not changed.','discovery-error')}
}
function showEntity(x,data){
 const kind=x.type==='person'?'Person':x.type==='place'?'Place':'Event';
 showDetail(kind+' · '+x.name,body=>{
  paragraph(body,'Accepted/source-qualified CGBC research. Relationship, date and site claims retain their original limitations.');
  if(x.gate)paragraph(body,'Evidence gate: '+x.gate);
  const source=[...(x.sourceReferences||[]),...(x.sourceReference?[x.sourceReference]:[])].filter(Boolean);
  if(source.length)paragraph(body,'Source: '+source.slice(0,4).join(' · '));
  if(x.dateQualification)paragraph(body,x.dateQualification);
  if(x.mapWarning)paragraph(body,x.mapWarning);
  if(x.scriptureQualification)paragraph(body,x.scriptureQualification);
  if(x.scriptureScopes?.length){title(body,'Scripture references');scopedLinks(body,x.scriptureScopes,16);}
  const links=(data.relationships||[]).filter(r=>r.from===x.id||r.to===x.id).slice(0,12);
  if(links.length){
   title(body,'Documented connections');
   const people=new Map(data.people.map(p=>[p.id,p.name]));
   for(const r of links){
    const to=r.from===x.id?r.to:r.from;
    const label=people.get(to)||to;
    const row=el('div','discovery-relationship',label+' · '+r.relationship);
    body.append(row);
    if(r.gate==='ACCEPT_DIRECT')scopedLinks(body,r.scriptureScopes,2);
   }
  }
  const alt=(data.alternatives||[]).filter(a=>a.entityId===x.id);
  for(const a of alt)paragraph(body,'Alternative interpretations: '+a.alternatives.map(t=>t.label).join(' / '));
  link(body,'Accepted source, rights and evidence gate',SOURCES.people);
 });
}
/* Add secondary discovery results only after the reader's own Scripture hits.
   Results do not imply all-Bible word/phrase search has been implemented. */
searchNote.textContent='Scripture references and current-chapter text first. Historical Bible Topics and accepted People/Places/Events appear below. Whole-Bible word search is not yet available.';
searchInput.placeholder='Scripture, current-chapter words, topic or person';
const searchPending=el('p','discovery-search-loading');searchPending.hidden=true;
searchResults.after(searchPending);
let seq=0,timer=0;
async function appendDiscovery(q,n){
 const [topicResult,peopleResult]=await Promise.allSettled([topicsIndex(),accepted()]);
 if(n!==seq||norm(searchInput.value)!==norm(q)||!searchModal.veil.classList.contains('is-open'))return;
 searchPending.hidden=true;
 const topics=topicResult.status==='fulfilled'?rankTopics(topicResult.value,q,6):[];
 const entities=peopleResult.status==='fulfilled'?rankEntities(peopleResult.value,q,6):[];
 if(!topics.length&&!entities.length){
  if(topicResult.status==='rejected'||peopleResult.status==='rejected')
   paragraph(searchResults,'Some discovery sources could not be reached; Scripture search remains available.','discovery-error');
  return;
 }
 if(topics.length){
  searchResults.append(el('h4','discovery-search-label','Historical Bible Topics (Nave / Torrey)'));
  for(const row of topics)button(searchResults,row.title+' · '+row.verse_link_count+' source links',()=>showTopic(row),'search-hit discovery-hit');
 }
 if(entities.length){
  searchResults.append(el('h4','discovery-search-label','Accepted People, Places & Events'));
  for(const item of entities)button(searchResults,item.name+' · '+item.type,()=>showEntity(item,peopleResult.value),'search-hit discovery-hit');
 }
}
searchInput.addEventListener('input',()=>{
 const n=++seq;clearTimeout(timer);searchPending.hidden=true;
 const q=searchInput.value.trim();
 if(q.length<2||modernParseReference(q))return;
 searchPending.textContent='Checking historical discovery sources…';searchPending.hidden=false;
 timer=setTimeout(()=>appendDiscovery(q,n),260);
});
searchModal.veil.addEventListener('click',()=>{
 if(!searchModal.veil.classList.contains('is-open')){++seq;clearTimeout(timer);searchPending.hidden=true;}
});
/* Verse-scoped connections, lazy loaded. A chapter-level source card never
   becomes an unsupported hit on every individual verse. */
const verseDiscovery=el('section','discovery-study');
const verseToggle=button(verseDiscovery,'Related topics & accepted people ›',()=>showVerseDiscovery(),'discovery-launch');
const verseBody=el('div','discovery-verse-body');verseBody.hidden=true;verseDiscovery.append(verseBody);
modernCommentaryMenu.before(verseDiscovery);
let verseSeq=0;
async function showVerseDiscovery(){
 const book=state.book,chapter=state.chapter,verse=modernStudyVerse,n=++verseSeq;
 const key=book+'.'+chapter+'.'+verse,chapterKey=book+'.'+chapter;
 verseBody.hidden=false;verseBody.replaceChildren();
 paragraph(verseBody,'Loading passage connections…');
 const [topicIndexResult,reverseResult,peopleResult]=await Promise.allSettled([
  topicsIndex(),sourceJson(TOPICS+'index/by-scripture/'+book+'.json'),accepted()
 ]);
 if(n!==verseSeq||!document.body.classList.contains('study-open')||
 state.book!==book||state.chapter!==chapter||modernStudyVerse!==verse)return;
 verseBody.replaceChildren();
 let total=0;
 if(reverseResult.status==='fulfilled'&&topicIndexResult.status==='fulfilled'){
  const topicIds=verseTopicIds(reverseResult.value,key);
  const names=new Map(topicIndexResult.value.map(t=>[t.id,t]));
  const found=topicIds.map(id=>names.get(id)).filter(Boolean).slice(0,8);
  if(found.length){title(verseBody,'Historical topic links','Source associations from Nave/Torrey, not doctrine.');
   for(const t of found)button(verseBody,t.title,()=>showTopic(t),'discovery-ref');
   total+=found.length;}
 }
 if(peopleResult.status==='fulfilled'){
  const data=peopleResult.value,ids=entityIdsForScope(data,key);
  const entries=[...data.people.map(x=>({...x,type:'person'})),
   ...data.places.map(x=>({...x,type:'place'})),...data.events.map(x=>({...x,type:'event'}))];
  const map=new Map(entries.map(x=>[x.id,x]));
  const found=ids.map(id=>map.get(id)).filter(Boolean).slice(0,8);
  if(found.length){title(verseBody,'Accepted people, places & events');
   for(const x of found)button(verseBody,x.name,()=>showEntity(x,data),'discovery-ref');
   total+=found.length;}
  const chapters=entityIdsForScope(data,chapterKey).map(id=>map.get(id)).filter(Boolean).slice(0,6);
  if(chapters.length){title(verseBody,'Chapter-level context','Covers this chapter generally; not a claim about every verse.');
   for(const x of chapters)button(verseBody,x.name,()=>showEntity(x,data),'discovery-ref');
   total+=chapters.length;}
 }
 if(!total)paragraph(verseBody,'No validated discovery links available for this verse; a source may be unavailable. This does not mean no historical material exists.');
 link(verseBody,'Topic sources',SOURCES.topics);paragraph(verseBody,' · ','discovery-inline');
 link(verseBody,'Accepted source',SOURCES.people);
}
/* Full HelloAO BSB original-language source. Its word sequence is original
   language ordering, not verified alignment with displayed English tokens. */
const originalSection=el('section','discovery-study discovery-bsb');
const originalButton=button(originalSection,'BSB original-language forms ›',()=>showOriginalVerse(),'discovery-launch');
const originalBody=el('div','discovery-original-body');originalBody.hidden=true;originalSection.append(originalBody);
const originalEntry=document.getElementById('originalLanguageEntry');
if(!originalEntry)throw Error('SOTW word-study entry point unavailable');
originalEntry.after(originalSection);
let originalSeq=0;
async function showOriginalVerse(){
 const book=state.book,chapter=state.chapter,verse=modernStudyVerse,n=++originalSeq;
 originalBody.hidden=false;originalBody.replaceChildren();
 paragraph(originalBody,'Loading the published BSB interlinear source…');
 try{
  const pad=String(chapter).padStart(2,'0');
  const data=await sourceJson(BSB+'chapters/'+book+'/'+pad+'.json');
  if(n!==originalSeq||!document.body.classList.contains('study-open')||
    state.book!==book||state.chapter!==chapter||modernStudyVerse!==verse)return;
  const words=getWords(data,book,chapter,verse);
  originalBody.replaceChildren();
  if(!words.length){paragraph(originalBody,'No verified source-form record is available for this verse.');return;}
  title(originalBody,bookInfo().name+' '+chapter+':'+verse+' · source-language sequence');
  paragraph(originalBody,'HelloAO / Berean Bible publisher glosses and parsing. bsbPos is not an English word position; no English alignment is inferred.');
  const list=el('div','discovery-word-grid');
  for(const w of words){
   const card=el('div','discovery-word');
   card.append(el('strong','',w.text));
   if(w.transliteration)card.append(el('span','',w.transliteration));
   if(w.gloss)card.append(el('span','',w.gloss));
   if(w.parsingFull||w.parsing)card.append(el('small','',w.parsingFull||w.parsing));
   const id=/^[HG]\d{1,5}$/.test(asText(w.strongs))?w.strongs:'';
   if(id){
    const sb=button(card,id,()=>{
     betaLexicon('strongs:'+id,modernStudyRequest,w.text);
     betaWordDetail.scrollIntoView({block:'nearest'});
    },'discovery-strongs');
    sb.setAttribute('aria-label','Read existing SOTW Strong’s '+id+' entry');
   }
   list.append(card);
  }
  originalBody.append(list);
  link(originalBody,'BSB interlinear source and rights',SOURCES.language);
 }catch(e){
  if(n===originalSeq){originalBody.replaceChildren();paragraph(originalBody,'Original-language source unavailable; no substitute was generated.','discovery-error');}
 }
}
const earlierOpen=betaOpen,earlierClose=betaCloseSheet;
betaOpen=function(){
 ++verseSeq;++originalSeq;verseBody.hidden=true;verseBody.replaceChildren();
 originalBody.hidden=true;originalBody.replaceChildren();
 earlierOpen();
};
betaCloseSheet=function(){
 ++verseSeq;++originalSeq;verseBody.hidden=true;originalBody.hidden=true;
 earlierClose();
};
})(typeof globalThis==='object'?globalThis:this);
