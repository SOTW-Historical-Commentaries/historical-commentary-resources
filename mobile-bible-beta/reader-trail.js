/* SOTW Reader: one dismissible, per-tab exploration return.
   Reuses the actual search or historical-topic DOM, including expanded groups
   and scroll location. Never stores sources, user searches, or identifiers. */
(function(root){
'use strict';
const line=document.querySelector('#modernReaderHeader .modern-inner .location-line');
const search=document.getElementById('readerSearchModal');
const searchInput=document.getElementById('modernSearchInput');
const results=document.getElementById('modernSearchResults');
if(!line||!search||!searchInput||!results)return;
const css=document.createElement('style');
css.textContent=[
 '.mobile-beta #sotwTrail{display:flex;max-width:100%;width:max-content;min-height:29px;margin-top:5px;align-items:stretch;border:1px solid #56747b;border-radius:999px;background:#233940;color:#d9e9ed;overflow:hidden}',
 '.mobile-beta #sotwTrail[hidden]{display:none!important}',
 '.mobile-beta #sotwTrailOpen,.mobile-beta #sotwTrailDismiss{border:0;background:transparent;color:inherit;cursor:pointer;font:600 12px/1.25 system-ui}',
 '.mobile-beta #sotwTrailOpen{display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:min(280px,73vw);padding:7px 10px;white-space:nowrap;overflow:hidden}',
 '.mobile-beta #sotwTrailOpen svg{width:13px;height:13px;flex:none}',
 '.mobile-beta #sotwTrailOpen .sotw-trail-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
 '.mobile-beta #sotwTrailDismiss{border-left:1px solid #587078;padding:4px 11px;min-width:32px;font-size:16px}',
 '.mobile-beta #sotwTrail button:focus-visible{outline:3px solid #dfa94f;outline-offset:-3px}',
 '.mobile-beta .discovery-back-search{display:block;width:100%;margin:10px 0 13px;padding:11px 12px;text-align:left;border:1px solid #66848b;border-radius:9px;background:#2b444a;color:#dff0f2;font:600 13px system-ui;cursor:pointer}',
 '.mobile-beta.beta-light .discovery-back-search{background:#e8f2ef;color:#2b4b52;border-color:#adc6c8}',
 '.mobile-beta.beta-light #sotwTrail{background:#e7f1ee;color:#294750;border-color:#abc7c9}',
 '.mobile-beta.beta-light #sotwTrailDismiss{border-color:#abc7c9}'
].join('');
document.head.append(css);
const group=document.createElement('div');group.id='sotwTrail';group.hidden=true;
const open=document.createElement('button');open.id='sotwTrailOpen';open.type='button';
// Match Back to Scripture's left chevron, not a curved return glyph.
open.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m15 18-6-6 6-6"/></svg>';
const openLabel=document.createElement('span');openLabel.className='sotw-trail-label';open.append(openLabel);
const dismiss=document.createElement('button');dismiss.id='sotwTrailDismiss';dismiss.type='button';
dismiss.textContent='×';dismiss.setAttribute('aria-label','Dismiss last exploration return');
group.append(open,dismiss);
const anchor=document.getElementById('sotwReturnStatus')||document.getElementById('sotwReturnToPassage');
if(anchor)anchor.after(group);else line.after(group);
let last=null;
const visible=node=>!!node?.classList.contains('is-open');
function searchSnapshot(){
 if(!visible(search)||!searchInput.value.trim())return null;
 return {kind:'search',label:'Search · '+searchInput.value.trim().slice(0,48),
   query:searchInput.value,scroll:results.scrollTop};
}
function topicSnapshot(){
 const veil=document.getElementById('sotwDiscoveryDetail');
 const panel=veil?.querySelector('.modal-content');
 const heading=panel?.querySelector('.discovery-detail-body .discovery-heading');
 if(!visible(veil)||!heading)return null;
 return {kind:'topic',label:('Topic · '+heading.textContent.replace(/^Historical Bible Topic\s*·\s*/, '')).slice(0,65),
   heading:heading.textContent,scroll:(panel.querySelector('.discovery-detail-body')||panel).scrollTop};
}
function studyTopicSnapshot(anchor){
 const body=document.getElementById('sotwVerseTopicsBody');
 const groups=body?[...body.querySelectorAll('.discovery-verse-topic')]:[];
 const selected=anchor?.closest('.discovery-verse-topic');
 const index=groups.indexOf(selected);
 if(body?.hidden||!document.body.classList.contains('study-open')||
  !selected||index<0||!state.index||!state.bible)return null;
 const title=selected.querySelector(':scope > summary span')?.textContent.trim()||'Bible Topic';
 const panel=document.querySelector('section[aria-label="Commentary comparison"]');
 return {kind:'study-topic',label:'Topic · '+title.slice(0,58),
  book:state.book,chapter:state.chapter,verse:Number(modernStudyVerse)||state.verse,
  edition:state.edition,selectedTitle:title,selectedIndex:index,
  expandedTopics:body.querySelector('.discovery-more-topics')?.getAttribute('aria-expanded')==='true',
  openTopics:groups.map((g,i)=>g.open?i:-1).filter(i=>i>=0),
  expandedSections:groups.map((g,i)=>({
   topic:i,expanded:!!g.querySelector(':scope > .discovery-topic-content > .discovery-more[aria-expanded="true"]')
  })).filter(x=>x.expanded),
  openSubtopics:groups.flatMap((g,i)=>[...g.querySelectorAll('.discovery-verse-topic-section')]
   .flatMap((section,n)=>section.querySelector('.discovery-subtopic-references')?.open
    ?[{topic:i,section:n}]:[])),
  expandedReferences:groups.flatMap((g,i)=>[...g.querySelectorAll('.discovery-verse-topic-section')]
   .flatMap((section,n)=>section.querySelector('.discovery-more[aria-expanded="true"]')
    ?[{topic:i,section:n}]:[])),
  previews:groups.flatMap((g,i)=>[...g.querySelectorAll('.discovery-verse-topic-section')].flatMap((section,n)=>[...section.querySelectorAll('.discovery-inline-trigger')].flatMap((b,k)=>b.getAttribute('aria-expanded')==='true'?[{topic:i,section:n,citation:k,raw:b.dataset.rawCitation}]:[]))),
  scroll:panel?.scrollTop||0};
}
function qaSnapshot(anchor){
 const body=document.querySelector('#sotwVerseQuestions .discovery-verse-body');
 if(!body||body.hidden||!document.body.classList.contains('study-open'))return null;
 const cards=[...body.querySelectorAll('.shared-qa-row')];
 return {kind:'study-qa',label:'Bible Questions',book:state.book,chapter:state.chapter,verse:Number(modernStudyVerse)||state.verse,edition:state.edition,
 expanded:body.querySelector('.shared-qa-more')?.getAttribute('aria-expanded')==='true',
 rows:cards.filter(c=>c.open).map(c=>({id:c.dataset.qaId,variants:!!c.querySelector('.universal-qa-variants[open]'),previews:[...c.querySelectorAll('.discovery-inline-trigger')].map((b,i)=>b.getAttribute('aria-expanded')==='true'?i:-1).filter(i=>i>=0)})),
 scroll:document.querySelector('section[aria-label="Commentary comparison"]')?.scrollTop||0};
}
function capture(type,anchor){
 if(type==='study-qa')return qaSnapshot(anchor);
 return type==='study-topic'?studyTopicSnapshot(anchor):
  type==='topic'?topicSnapshot():searchSnapshot();
}
function paint(){
 group.hidden=!last;
 group.dataset.returnKind=last?.kind||'';
 if(last){openLabel.textContent='Back to '+last.label;
  open.setAttribute('aria-label','Return to previous '+last.label);}
}
function commit(snapshot){
 if(!snapshot)return;
 // Do not save a failed navigation that never left its source context.
 if(snapshot.kind==='study-topic'||snapshot.kind==='study-qa'){
  if(document.body.classList.contains('study-open'))return;
 }else{
  const target=snapshot.kind==='topic'?document.getElementById('sotwDiscoveryDetail'):search;
  if(visible(target))return;
 }
 last=snapshot;paint();
}
function clear(){last=null;paint();}
async function restore(){
 if(!last)return false;
 const snap=last;
 if(snap.kind==='study-qa'){
  const same=state.book===snap.book&&state.chapter===snap.chapter&&state.verse===snap.verse&&state.edition===snap.edition&&state.bible?.book_code===snap.book&&Number(state.bible?.chapter)===snap.chapter&&state.bible?.edition_id===snap.edition;
  if(!same&&!await root.SOTWReaderReturn?.returnToStudySource?.(snap))return false;
  modernStudyVerse=snap.verse;chooseVerse(snap.verse);betaOpen();
  await root.SOTWUniversalSearch?.openVerseQuestions?.();
  const body=document.querySelector('#sotwVerseQuestions .discovery-verse-body');
  if(!body||body.hidden)return false;
  if(snap.expanded)body.querySelector('.shared-qa-more')?.click();
  const cards=[...body.querySelectorAll('.shared-qa-row')];
  if(snap.rows.some(saved=>!cards.some(c=>c.dataset.qaId===saved.id)))return false;
  for(const saved of snap.rows){
   const card=cards.find(c=>c.dataset.qaId===saved.id);card.open=true;
   const variants=card.querySelector('.universal-qa-variants');if(variants)variants.open=saved.variants;
   for(const i of saved.previews)card.querySelectorAll('.discovery-inline-trigger')[i]?.click();
  }
  const panel=document.querySelector('section[aria-label="Commentary comparison"]');
  requestAnimationFrame(()=>{if(panel)panel.scrollTop=snap.scroll;});clear();return true;
 }
 if(snap.kind==='study-topic'){
  const sameSource=state.book===snap.book&&state.chapter===snap.chapter&&
   state.verse===snap.verse&&state.edition===snap.edition&&
   state.index?.canonical_chapter===snap.book+'.'+snap.chapter&&
   Number(state.index?.verse_count)>=snap.verse&&
   state.bible?.book_code===snap.book&&Number(state.bible?.chapter)===snap.chapter&&
   state.bible?.edition_id===snap.edition;
  if(!sameSource){
   const returned=await root.SOTWReaderReturn?.returnToStudySource?.(snap);
   if(!returned)return false;
  }
  if(!root.SOTWDiscoveryCore?.openVerseTopics)return false;
  modernStudyVerse=snap.verse;
  chooseVerse(snap.verse);betaOpen();
  await root.SOTWDiscoveryCore.openVerseTopics();
  const body=document.getElementById('sotwVerseTopicsBody');
  if(snap.expandedTopics)await body?.querySelector('.discovery-more-topics')?.expandTopics?.();
  const groups=body?[...body.querySelectorAll('.discovery-verse-topic')]:[];
  if(!groups.length||body.hidden){
   // Keep the return available if the original publisher data cannot reload.
   return false;
  }
  const selected=groups[snap.selectedIndex];
  if(!selected||selected.querySelector(':scope > summary span')?.textContent.trim()!==snap.selectedTitle)
   return false;
  for(const entry of snap.expandedSections||[]){
   const button=groups[entry.topic]?.querySelector(':scope > .discovery-topic-content > .discovery-more');
   if(button?.getAttribute('aria-expanded')==='false')button.click();
  }
  for(const entry of snap.openSubtopics||[]){
   const section=groups[entry.topic]?.querySelectorAll('.discovery-verse-topic-section')[entry.section];
   const disclosure=section?.querySelector('.discovery-subtopic-references');
   if(disclosure&&!disclosure.open){
    disclosure.open=true;
    // Render the initially deferred references before restoring Show more.
    disclosure.dispatchEvent(new Event('toggle'));
   }
  }
  for(const entry of snap.expandedReferences||[]){
   const section=groups[entry.topic]?.querySelectorAll('.discovery-verse-topic-section')[entry.section];
   const button=section?.querySelector('.discovery-more');
   if(button?.getAttribute('aria-expanded')==='false')button.click();
  }
  groups.forEach((g,i)=>{g.open=snap.openTopics.includes(i);});
  selected.open=true;
  for(const entry of snap.previews||[]){
   const section=groups[entry.topic]?.querySelectorAll('.discovery-verse-topic-section')[entry.section];
   const trigger=section?.querySelectorAll('.discovery-inline-trigger')[entry.citation];
   if(trigger?.dataset.rawCitation===entry.raw)trigger.click();
  }
  const panel=document.querySelector('section[aria-label="Commentary comparison"]');
  requestAnimationFrame(()=>{if(panel)panel.scrollTop=snap.scroll;});
  clear();
  return true;
 }
 const topic=document.getElementById('sotwDiscoveryDetail');
 const panel=topic?.querySelector('.modal-content');
 if(snap.kind==='topic'){
  const heading=panel?.querySelector('.discovery-detail-body .discovery-heading')?.textContent;
  if(!heading||heading!==snap.heading){clear();return false;}
  search.classList.remove('is-open');
  topic.classList.add('is-open');
  requestAnimationFrame(()=>{(panel.querySelector('.discovery-detail-body')||panel).scrollTop=snap.scroll;});
 }else{
  if(searchInput.value!==snap.query){clear();return false;}
  topic?.classList.remove('is-open');
  search.classList.add('is-open');
  if(typeof positionSearchViewport==='function')positionSearchViewport();
  requestAnimationFrame(()=>{results.scrollTop=snap.scroll;});
 }
 group.hidden=true;
 return true;
}
open.addEventListener('click',()=>{
 if(open.disabled)return;
 open.disabled=true;
 Promise.resolve(restore()).catch(()=>false).finally(()=>{open.disabled=false;});
});
dismiss.addEventListener('click',clear);
for(const id of ['readerSearchModal','sotwDiscoveryDetail']){
 const veil=document.getElementById(id);
 if(veil){
  const obs=new MutationObserver(()=>{if(!visible(veil))paint();});
  obs.observe(veil,{attributes:true,attributeFilter:['class']});
 }
}
root.SOTWReaderTrail={capture,commit,restore,clear,getLast:()=>last};
paint();
})(typeof globalThis==='object'?globalThis:this);
