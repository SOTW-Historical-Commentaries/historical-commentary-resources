/* SOTW Bible Topics UI. The only discovery adapter in the public reader.
   Nave/Torrey is an attributed historical index, not doctrine. The
   People/Places/Events research collection remains published separately,
   but is NOT loaded into the reader, searched or shown in verse study.
   BSB publisher interlinear belongs to the existing Word-by-Word view. */
(function(root){
'use strict';
const TOPICS='https://raw.githubusercontent.com/Stewards-of-the-Way/bible-foundation/main/data/topics/nave-torrey/v1/';
const SOURCE='https://github.com/Stewards-of-the-Way/bible-foundation/tree/main/data/topics/nave-torrey/v1';
const asText=x=>String(x??'').trim();
const norm=x=>asText(x).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
function rankTopics(rows,query,limit=8){
 const q=norm(query);
 if(q.length<2||!Array.isArray(rows))return [];
 const rank=x=>{const t=norm(x.title);
  return t===q?0:t.startsWith(q)?1:t.includes(' '+q)?2:t.includes(q)?3:99;};
 return rows.filter(x=>x&&x.id&&x.title&&Number(x.verse_link_count)>0&&rank(x)<99)
  .sort((a,b)=>rank(a)-rank(b)||a.title.localeCompare(b.title))
  .slice(0,limit);
}
function parseScope(scope,bookRows){
 const m=/^([1-3]?[A-Z]{2,3})\.(\d+)(?:\.(\d+))?$/.exec(asText(scope));
 if(!m||!Array.isArray(bookRows))return null;
 const book=bookRows.find(b=>b.code===m[1]);
 const chapter=Number(m[2]),verse=Number(m[3]||1);
 if(!book||!Number.isInteger(chapter)||chapter<1||chapter>book.chapterCount||
  !Number.isInteger(verse)||verse<1||verse>176)return null;
 return {book,chapter,verse,hasVerse:!!m[3]};
}
function verseTopicIds(index,scope){
 const verses=index?.verses;
 if(!verses||typeof verses!=='object'||Array.isArray(verses))return [];
 return Array.isArray(verses[scope])?verses[scope]:[];
}
function sourceHeading(label){
 const original=asText(label);
 const cleaned=original.replace(/^[.\s·]+/,'').replace(/\s+/g,' ').trim();
 // Historical index fragments may contain bare chapter:verse ranges
 // (e.g. "18:5-7,9;" or "5:8,16;6:18;"), not subject headings.
 // Retain the literal source label separately for provenance.
 const numericReferences=/^\d{1,3}:\d{1,3}(?:[-–]\d{1,3})?(?:[,;]\s*(?:\d{1,3}:)?\d{1,3}(?:[-–]\d{1,3})?)*;?$/;
 if(!cleaned||/^\d{2,5}\s*:?$/.test(cleaned)||/^\d+[.)]$/.test(cleaned)||numericReferences.test(cleaned)||/^[.,:;]+$/.test(cleaned)||
  /(?:of|from|in)\s*[1-3]?\s*(?:Ge|Gen|Ex|Exo)\s*\d/i.test(cleaned))
  return {title:'Other indexed passages',sourceLabel:original};
 // A visibly truncated source fragment must not become an invented subject.
 if(/^intoxi$/i.test(cleaned))return {title:'Unclear historical index heading',sourceLabel:original};
 return {title:cleaned,sourceLabel:''};
}
function topicSections(topic){
 const mapped=new Map((topic?.references||[]).filter(x=>x?.status==='mapped'&&
  asText(x.raw)&&Array.isArray(x.verse_ids)&&x.verse_ids.length).map(x=>[x.raw,x]));
 return (topic?.aspects||[]).map(aspect=>{
  const seen=new Set();
  const refs=(aspect.references||[]).filter(raw=>{
   if(!mapped.has(raw)||seen.has(raw))return false;
   seen.add(raw);return true;
  }).map(raw=>({raw,scopes:mapped.get(raw).verse_ids}));
  return {...sourceHeading(aspect.label),references:refs};
 }).filter(section=>section.references.length);
}
root.SOTWDiscoveryCore={rankTopics,parseScope,verseTopicIds,sourceHeading,topicSections};
if(typeof document==='undefined')return;
if(typeof state==='undefined'||typeof searchInput==='undefined'||
 typeof betaOpen==='undefined'||typeof modernCommentaryMenu==='undefined')return;

const cache=new Map();
function sourceJson(url){
 if(!cache.has(url)){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),18000);
  const pending=fetch(url,{cache:'no-store',signal:controller.signal}).then(r=>{
   if(!r.ok)throw Error('HTTP '+r.status);
   return r.json();
  }).catch(e=>{cache.delete(url);throw e}).finally(()=>clearTimeout(timeout));
  cache.set(url,pending);
 }
 return cache.get(url);
}
let topicIndex=null;
async function topicsIndex(){
 if(topicIndex)return topicIndex;
 const data=await sourceJson(TOPICS+'index/topics.json');
 if(data.schema!=='sotw-topics-search-index/1.0.0'||!Array.isArray(data.topics))
  throw Error('Unexpected topics index');
 topicIndex=data.topics;return topicIndex;
}
function el(tag,cls,value){
 const node=document.createElement(tag);
 if(cls)node.className=cls;
 if(value!==undefined)node.textContent=value;
 return node;
}
function note(parent,value,cls='discovery-note'){
 const p=el('p',cls,value);parent.append(p);return p;
}
function button(parent,label,action,cls='discovery-ref'){
 const b=el('button',cls,label);b.type='button';
 b.addEventListener('click',action);parent.append(b);return b;
}
function sourceLink(parent){
 const a=el('a','discovery-link','About the Nave/Torrey historical source');
 a.href=SOURCE;a.target='_blank';a.rel='noopener noreferrer';parent.append(a);
}
const detail=modalLayer('sotwDiscoveryDetail','Bible Topic');
detail.panel.classList.add('discovery-dialog');
function showDetail(heading){
 // A topic opened from search retains a return route to that exact result list.
 const fromSearch=searchModal.veil.classList.contains('is-open');
 const query=searchInput.value,scroll=searchResults.scrollTop;
 detail.panel.querySelectorAll('.discovery-detail-body').forEach(node=>node.remove());
 const body=el('div','discovery-detail-body');
 body.append(el('h3','discovery-heading',heading));
 if(fromSearch&&query.trim()){
  const back=button(body,'‹ Back to search results',()=>{
   detail.veil.classList.remove('is-open');
   if(searchInput.value!==query)return;
   searchModal.veil.classList.add('is-open');
   if(typeof positionSearchViewport==='function')positionSearchViewport();
   requestAnimationFrame(()=>{searchResults.scrollTop=scroll;});
  },'discovery-back-search');
  back.setAttribute('aria-label','Return to search results for '+query.slice(0,90));
 }
 detail.panel.append(body);
 searchModal.veil.classList.remove('is-open');
 detail.veil.classList.add('is-open');detail.panel.scrollTop=0;
 return body;
}
function referenceButton(parent,ref){
 // One historical source citation, not one separate chip for each verse.
 // When it names several verses, the first verified one is the navigation
 // destination, and the *full citation* remains visible verbatim.
 const first=(ref.scopes||[]).find(s=>parseScope(s,BOOKS));
 if(!first)return false;
 const label=asText(ref.raw).replace(/(\d)\-(\d)/g,'$1–$2');
 const parsed=parseScope(first,BOOKS);
 const params=new URLSearchParams({
  book:parsed.book.code,chapter:String(parsed.chapter),verse:String(parsed.verse),
  translation:state.edition
 });
 // Preserve the published original citation, but state exactly which verse
 // the reader can open in the currently selected translation.
 const wrapper=el('div','discovery-reference-entry');
 wrapper.append(el('small','discovery-original-citation','Indexed citation: '+label));
 const destination=parsed.book.name+' '+parsed.chapter+':'+parsed.verse;
 const link=el('a','discovery-citation jacob-passage-link','Read '+destination+' · '+state.edition);
 link.href=location.pathname+'?'+params.toString();
 link.setAttribute('aria-label','Read '+destination+' in '+state.edition+' (first verse of '+label+')');
 wrapper.append(link);parent.append(wrapper);
 return true;
}
function expandList(parent,rows,render,visibleCount=4){
 const list=el('div','discovery-passage-list');parent.append(list);
 const first=rows.slice(0,visibleCount);
 first.forEach(x=>render(list,x));
 if(rows.length>first.length){
  const more=button(parent,'Show all '+rows.length+' references',()=>{
   list.replaceChildren();rows.forEach(x=>render(list,x));more.remove();
  },'discovery-more');
  more.setAttribute('aria-expanded','false');
 }
}
async function showTopic(topic){
 const body=showDetail('Historical Bible Topic · '+topic.title);
 note(body,'Historical Nave/Torrey references. These index associations are not doctrinal rulings.');
 const busy=note(body,'Loading source references…');
 try{
  const shard=await sourceJson(TOPICS+topic.shard);
  const row=shard?.topics?.find(t=>t.id===topic.id);
  if(!body.isConnected||!detail.veil.classList.contains('is-open'))return;
  if(shard.schema!=='sotw-topics-neuu-shard/1.0.0'||!row)throw Error('Topic not found');
  busy.remove();
  const sections=topicSections(row);
  if(!sections.length){note(body,'This topic has no mapped Scripture citations.');sourceLink(body);return;}
  note(body,sections.length+' indexed sections. Each citation opens at its first referenced verse.','discovery-guide');
  const host=el('div','discovery-topic-groups');body.append(host);
  function renderGroup(section,index){
   const group=el('details','discovery-topic-group');
   group.open=index===0;
   const summary=el('summary','discovery-topic-summary');
   summary.append(el('span','',section.title));
   summary.append(el('small','',section.references.length+' '+(section.references.length===1?'passage':'passages')));
   group.append(summary);
   if(section.sourceLabel){
    const original=el('p','discovery-source-heading','Original index heading: '+section.sourceLabel);
    group.append(original);
   }
   expandList(group,section.references,referenceButton,4);
   host.append(group);
  }
  sections.slice(0,5).forEach(renderGroup);
  if(sections.length>5){
   const show=button(body,'Show all '+sections.length+' topic sections',()=>{
    host.replaceChildren();sections.forEach(renderGroup);show.remove();
   },'discovery-more');
  }
  sourceLink(body);
 }catch{
  if(body.isConnected){busy.textContent='Topic references are unavailable right now.';busy.className='discovery-error';}
 }
}
// The reader's own Scripture results remain at the top. No Person, Place or
// Event index is fetched here: its directory awaits a future evidence-led UI.
searchNote.textContent='Scripture references and current-chapter text first. Published Jacob Lannom commentary and Historical Bible Topics appear in clearly labeled results. Whole-Bible word search is not yet available.';
searchInput.placeholder='John 3:16, Lannom Romans, Revenge Lannom, or Bible topic';
const pending=el('p','discovery-search-loading');pending.hidden=true;
searchResults.after(pending);
let seq=0,timer=0;
async function appendTopicSearch(query,current){
 try{
  const topics=rankTopics(await topicsIndex(),query,8);
  if(current!==seq||norm(searchInput.value)!==norm(query)||
   !searchModal.veil.classList.contains('is-open'))return;
  pending.hidden=true;
  if(!topics.length)return;
  searchResults.append(el('h4','discovery-search-label','Historical Bible Topics · Nave/Torrey'));
  topics.forEach(t=>button(searchResults,t.title,()=>showTopic(t),'search-hit discovery-hit'));
 }catch{
  if(current===seq&&searchModal.veil.classList.contains('is-open')){
   pending.hidden=true;
   note(searchResults,'Historical topic source unavailable. Scripture search still works.','discovery-error');
  }
 }
}
searchInput.addEventListener('input',()=>{
 const current=++seq;clearTimeout(timer);pending.hidden=true;
 const query=searchInput.value.trim();
 if(query.length<2||modernParseReference(query))return;
 pending.textContent='Checking historical Bible Topics…';pending.hidden=false;
 timer=setTimeout(()=>appendTopicSearch(query,current),260);
});
searchModal.veil.addEventListener('click',()=>{
 if(!searchModal.veil.classList.contains('is-open')){
  ++seq;clearTimeout(timer);pending.hidden=true;
 }
});
// Verse-specific reverse index references. Never infer a separate link for
// every verse in a chapter or claim that historical topic tags are doctrine.
const verseDiscovery=el('section','discovery-study');
const topicsButton=button(verseDiscovery,'Related Bible Topics',()=>showVerseTopics(),'discovery-launch');
topicsButton.replaceChildren(el('span','discovery-launch-label','Related Bible Topics'),el('small','discovery-launch-meta','Explore topics ›'));
const verseBody=el('div','discovery-verse-body');verseBody.hidden=true;verseDiscovery.append(verseBody);
modernCommentaryMenu.before(verseDiscovery);
let verseSeq=0;
async function showVerseTopics(){
 const book=state.book,chapter=state.chapter,verse=modernStudyVerse,current=++verseSeq;
 const scope=book+'.'+chapter+'.'+verse;
 verseBody.hidden=false;verseBody.replaceChildren();
 note(verseBody,'Loading topic references…');
 const [indexResult,reverseResult]=await Promise.allSettled([
  topicsIndex(),sourceJson(TOPICS+'index/by-scripture/'+book+'.json')
 ]);
 if(current!==verseSeq||!document.body.classList.contains('study-open')||
    state.book!==book||state.chapter!==chapter||modernStudyVerse!==verse)return;
 verseBody.replaceChildren();
 if(indexResult.status!=='fulfilled'||reverseResult.status!=='fulfilled'){
  note(verseBody,'Historical topics are temporarily unavailable. The Bible text is unaffected.','discovery-error');
  return;
 }
 const ids=verseTopicIds(reverseResult.value,scope);
 const named=new Map(indexResult.value.map(t=>[t.id,t]));
 const titles=Array.from(new Set(ids)).map(id=>named.get(id)).filter(Boolean);
 if(titles.length){
  verseBody.append(el('h3','discovery-heading','Topics indexed for this verse'));
  note(verseBody,'Historical Nave/Torrey groupings, not doctrinal conclusions.');
  // The first tap shows topic content and Scripture citations, not a second menu.
  const host=el('div','discovery-topic-groups');verseBody.append(host);
  for(const topic of titles.slice(0,6)){
   const group=el('section','discovery-topic-group');host.append(group);
   group.append(el('h4','discovery-heading',topic.title));
   const loading=note(group,'Loading Scripture references…');
   try{
    const shard=await sourceJson(TOPICS+topic.shard);
    if(current!==verseSeq||!group.isConnected)return;
    const row=shard?.topics?.find(t=>t.id===topic.id);
    if(shard.schema!=='sotw-topics-neuu-shard/1.0.0'||!row)throw Error('Missing topic');
    loading.remove();
    const sections=topicSections(row);
    if(!sections.length){note(group,'No mapped Scripture citations.');continue;}
    for(const section of sections.slice(0,5)){
     const sectionBox=el('div','discovery-verse-topic-section');group.append(sectionBox);
     sectionBox.append(el('h5','discovery-source-heading',section.title));
     expandList(sectionBox,section.references,referenceButton,4);
    }
    if(sections.length>5){
     const more=button(group,'Show remaining '+(sections.length-5)+' sections',()=>{
      more.remove();
      sections.slice(5).forEach(section=>{
       const sectionBox=el('div','discovery-verse-topic-section');group.append(sectionBox);
       sectionBox.append(el('h5','discovery-source-heading',section.title));
       expandList(sectionBox,section.references,referenceButton,4);
      });
     },'discovery-more');
    }
   }catch{if(group.isConnected){loading.textContent='Topic references are unavailable.';loading.className='discovery-error';}}
  }
  if(titles.length>6)note(verseBody,'Showing the first six indexed topics for this verse.');
 }else note(verseBody,'No historical topic entry is indexed for this exact verse.');
 sourceLink(verseBody);
}
// Keep the existing study lifecycle; no separate original-order panel, no
// People/Places section. BSB Word-by-Word continues in study-ux-repair.js.
const earlierOpen=betaOpen,earlierClose=betaCloseSheet;
betaOpen=function(){
 ++verseSeq;verseBody.hidden=true;verseBody.replaceChildren();earlierOpen();
};
betaCloseSheet=function(){
 ++verseSeq;verseBody.hidden=true;verseBody.replaceChildren();earlierClose();
};
})(typeof globalThis==='object'?globalThis:this);
