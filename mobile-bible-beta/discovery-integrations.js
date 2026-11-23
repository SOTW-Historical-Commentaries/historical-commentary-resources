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
// Reusable evidence bridge: any source-published Q&A citation may lead to
// original historical topics indexed to the SAME exact verse. Topic title
// terms must be present in the source Q&A (with the shared lexical matcher).
// No biblical person, event, topic, or passage is hardcoded here.
function rankTopics(rows,query,limit=8,linked=[],core=null){
 const q=norm(query);
 if(q.length<2||!Array.isArray(rows))return [];
 const rank=x=>{const t=norm(x.title);
  return t===q?0:t.startsWith(q)?1:t.includes(' '+q)?2:t.includes(q)?3:99;};
 const valid=x=>x&&typeof x.id==='string'&&x.title&&
  Number.isInteger(x.verse_link_count)&&x.verse_link_count>0;
 const literal=rows.filter(x=>valid(x)&&rank(x)<99)
  .sort((a,b)=>rank(a)-rank(b)||a.title.localeCompare(b.title));
 const result=literal.slice(0,limit),ids=new Set(result.map(t=>t.id));
 // Prioritize published Q&A-linked topics only when their original indexed
 // verse and title evidence was independently verified by the adapter.
 for(const t of linked){
  if(result.length>=limit)break;
  if(valid(t)&&!ids.has(t.id)){result.push(t);ids.add(t.id)}
 }
 // A question without a matching Q&A still has access to Nave directly.
 // Match indexed source TITLES conservatively, not fabricated verse links.
 // Reserve room for linked evidence during the earlier asynchronous pass.
 const terms=typeof core?.words==='function'?core.words(query):[];
 if(terms.length>1&&typeof core?.tokenMatch==='function'){
  const candidates=[];
  for(const t of rows){
   if(!valid(t)||ids.has(t.id))continue;
   const titleTerms=core.words(t.title),nameWords=new Set(titleTerms);
   if(!titleTerms.length)continue;
   let count=0,strength=0;
   for(const term of terms){
    const match=core.tokenMatch(term,nameWords);
    if(match>=.7){count++;strength+=match;}
   }
   // A single generic word may match a one-word topic; longer titles
   // require at least two independently matching terms.
   if(count<(titleTerms.length>1?2:1))continue;
   candidates.push({topic:t,score:strength*10+count/titleTerms.length});
  }
  candidates.sort((a,b)=>b.score-a.score||a.topic.title.localeCompare(b.topic.title));
  // Do not swamp historical source-linked candidates with broad lexical hits.
  const ceiling=linked.length?limit:Math.min(limit,4);
  for(const {topic} of candidates){
   if(result.length>=ceiling)break;
   result.push(topic);ids.add(topic.id);
  }
 }
 return result;
}
function evidenceLinkedTopics(topics,questionMatches,byBook,core,limit=8){
 if(!Array.isArray(topics)||!Array.isArray(questionMatches)||
    !byBook||typeof byBook!=='object'||typeof core?.words!=='function'||
    typeof core?.tokenMatch!=='function')return [];
 const eligible=new Map(topics.filter(t=>t&&typeof t.id==='string'&&
  Number.isInteger(t.verse_link_count)&&t.verse_link_count>0&&t.title)
  .map(t=>[t.id,t]));
 const ranked=new Map();
 const high=questionMatches[0]?.score||0;
 for(const {row,score} of questionMatches.slice(0,8)){
  if(!Array.isArray(row)||!row[0]?.startsWith('utq:v91:')||
     !Array.isArray(row[3])||score<Math.max(17,high*.55))continue;
  const context=new Set(core.words(row[1]+' '+row[2]));
  for(const target of row[3]){
   if(!Array.isArray(target)||target.length<3)continue;
   const [book,chapter,first,last]=target,idx=byBook[book];
   if(idx?.schema!=='sotw-topics-scripture-index/1.0.0'||
      idx.book_code!==book||!idx.verses||
      !Number.isInteger(chapter)||!Number.isInteger(first)||
      chapter<1||first<1||first>176)continue;
   const end=Number.isInteger(last)&&last>=first?Math.min(last,first+3):first;
   for(let verse=first;verse<=end;verse++){
    for(const id of idx.verses[book+'.'+chapter+'.'+verse]||[]){
     const topic=eligible.get(id);
     if(!topic)continue;
     const terms=core.words(topic.title);
     if(!terms.length)continue;
     const count=terms.filter(t=>core.tokenMatch(t,context)>=.7).length;
     if(count<Math.max(1,Math.ceil(terms.length*.75)))continue;
     const relevance=score*(count/terms.length);
     if(relevance>(ranked.get(id)?.score||0))ranked.set(id,{topic,score:relevance});
    }
   }
  }
 }
 return [...ranked.values()].sort((a,b)=>b.score-a.score||
    a.topic.title.localeCompare(b.topic.title)).slice(0,limit).map(x=>x.topic);
}
function requiredTopicBooks(matches,limit=3){
 const result=[];
 for(const {row} of (matches||[]).slice(0,8)){
  for(const ref of row[3]||[]){
   const book=ref?.[0];
   if(typeof book==='string'&&!result.includes(book))result.push(book);
   if(result.length>=limit)return result;
  }
 }
 return result;
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
 return (topic?.aspects||[]).filter(aspect=>
  !aspect?.source||aspect.source==='NAV'||aspect.source==='TOR').map(aspect=>{
  const seen=new Set();
  const refs=(aspect.references||[]).filter(raw=>{
   if(!mapped.has(raw)||seen.has(raw))return false;
   seen.add(raw);return true;
  }).map(raw=>({raw,scopes:mapped.get(raw).verse_ids}));
  return {...sourceHeading(aspect.label),references:refs};
 }).filter(section=>section.references.length);
}
// Presentation filters only. Preserve the complete source shards, reference
// IDs and raw aspect captions for historical/provenance use.
function isReaderLabel(label){
 const value=norm(label).replace(/[_,:;/.-]+/g,' ').replace(/\s+/g,' ').trim();
 if(!value||/^(?:unknown|uncategorized|uncategorised|unclassified|unclear|n a)(?:\s+(?:unknown|uncategorized|uncategorised|unclassified|unclear))*$/.test(value))return false;
 return !/\b(?:ai\s*only|only\s*ai|ai\s*derived|derived\s*by\s*ai|ai\s*generated)\b/.test(value);
}
function isReaderTopic(topic){
 if(!topic||!isReaderLabel(topic.title))return false;
 return !Array.isArray(topic.sources)||!topic.sources.length||
  topic.sources.some(source=>source==='NAV'||source==='TOR');
}
function isAmbiguousSection(section){
 const title=asText(section?.title),words=title.match(/[\p{L}\p{N}]+/gu)||[];
 if(!title||title==='Other indexed passages'||title==='Unclear historical index heading')return true;
 if(isGeneralSection(section))return false;
 if(words.length===1||words.length===2&&words.every(w=>w.length<=3))return true;
 if(/\b(?:of|to|for|from|with|by|in|and|the|his|her|their|a|an)\s*$/iu.test(title))return true;
 return false;
}
function readerSections(topic){
 const sections=topicSections(topic).filter(section=>
  isReaderLabel(section.title));
 // Keep original source order inside each tier; general lists follow the
 // more descriptive historical headings, without inventing relevance.
 return sections.sort((a,b)=>Number(isAmbiguousSection(a))-Number(isAmbiguousSection(b))||
  Number(isGeneralSection(a))-Number(isGeneralSection(b)));
}
function isGeneralSection(section){
 return /^(?:general(?: scriptures? concerning| references?)?|scriptures? generally)$/i.test(asText(section?.title));
}
function orderVerseTopics(rows){
 // A narrower published Scripture-link footprint is a transparent, stable
 // focus proxy, not a machine-inferred theological or semantic relationship.
 return rows.filter(isReaderTopic).sort((a,b)=>
  (Number.isInteger(a.verse_link_count)&&a.verse_link_count>0?a.verse_link_count:Infinity)-
  (Number.isInteger(b.verse_link_count)&&b.verse_link_count>0?b.verse_link_count:Infinity)||
  a.title.localeCompare(b.title));
}
function readerTopicTitle(title){
 const text=asText(title);
 // Safely unfold simple inverted index adjectives for natural reading.
 // Both the original published title and source ID remain untouched.
 const inverted=/^([^,]+),\s*(false|true)$/iu.exec(text);
 if(inverted)return readerTopicTitle(inverted[2])+' '+readerTopicTitle(inverted[1]);
 return text===text.toLocaleUpperCase()?
  text.toLocaleLowerCase().replace(/(^|[\s,(/-])([\p{L}])/gu,(_,lead,letter)=>lead+letter.toLocaleUpperCase()):text;
}
function readerSectionTitle(section){
 if(/^general scriptures concerning$/i.test(section?.title||''))return 'General references';
 if(section?.title==='Other indexed passages'||section?.title==='Unclear historical index heading')
  return 'Other references';
 return section?.title||'References';
}
root.SOTWDiscoveryCore={rankTopics,evidenceLinkedTopics,requiredTopicBooks,parseScope,verseTopicIds,sourceHeading,topicSections,readerTopicTitle,readerSectionTitle,readerSections,isAmbiguousSection,isReaderLabel,isReaderTopic,isGeneralSection,orderVerseTopics};
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
 topicIndex=data.topics.filter(isReaderTopic);return topicIndex;
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
 // Preserve the original, complete historical citation as the visible link.
 // Source-provenance and first-verse navigation remain separately explicit
 // in the accessible label; never invent a new multi-verse target.
 const first=(ref.scopes||[]).find(s=>parseScope(s,BOOKS));
 if(!first)return false;
 const parsed=parseScope(first,BOOKS);
 const label=asText(ref.raw).replace(/(\d)\-(\d)/g,'$1–$2');
 const destination=parsed.book.name+' '+parsed.chapter+':'+parsed.verse;
 const params=new URLSearchParams({
  book:parsed.book.code,chapter:String(parsed.chapter),verse:String(parsed.verse),
  translation:state.edition
 });
 const wrapper=el('div','discovery-reference-entry');
 const link=el('a','discovery-citation jacob-passage-link',label);
 link.href=location.pathname+'?'+params.toString();
 link.setAttribute('aria-label','Read '+label+' in '+state.edition+
  '. Opens at '+destination+'.');
 link.title='Open '+destination+' in '+state.edition;
 wrapper.append(link);parent.append(wrapper);
 return true;
}
function expandList(parent,rows,render,visibleCount=4){
 const list=el('div','discovery-passage-list');parent.append(list);
 rows.slice(0,visibleCount).forEach(x=>render(list,x));
 const remaining=rows.length-visibleCount;
 if(remaining>0){
  const more=button(parent,'Show '+remaining+' more '+(remaining===1?'passage':'passages'),
   ()=>{const expanded=more.getAttribute('aria-expanded')==='true';
    if(expanded){
     while(list.children.length>visibleCount)list.lastElementChild.remove();
     more.textContent='Show '+remaining+' more '+(remaining===1?'passage':'passages');
     more.setAttribute('aria-expanded','false');
    }else{
     rows.slice(visibleCount).forEach(x=>render(list,x));
     more.textContent='Show fewer passages';
     more.setAttribute('aria-expanded','true');
    }
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
  const sections=readerSections(row);
  if(!sections.length){note(body,'No displayable, source-labeled Scripture references.');sourceLink(body);return;}
  note(body,sections.length+' groups of Scripture references.','discovery-guide');
  const host=el('div','discovery-topic-groups');body.append(host);
  function renderGroup(section,index){
   const group=el('details','discovery-topic-group');
   group.open=index===0;
   const summary=el('summary','discovery-topic-summary');
   summary.append(el('span','',readerSectionTitle(section)));
   summary.append(el('small','',section.references.length+' '+(section.references.length===1?'passage':'passages')));
   group.append(summary);
   // Retain ambiguous publisher headings as metadata, not screen clutter.
   if(section.sourceLabel)group.dataset.originalSourceHeading=section.sourceLabel;
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
  const indexed=await topicsIndex();
  const valid=()=>current===seq&&norm(searchInput.value)===norm(query)&&
   searchModal.veil.classList.contains('is-open');
  if(!valid())return;
  const direct=rankTopics(indexed,query,8,[],root.SOTWUniversalSearchCore);
  const displayed=new Set();
  let label=null;
  function addTopics(topics){
   if(!valid())return;
   for(const t of topics){
    if(displayed.size>=8||displayed.has(t.id))continue;
    if(!label)label=searchResults.appendChild(
     el('h4','discovery-search-label','Historical Bible Topics · Nave/Torrey'));
    displayed.add(t.id);
    const hit=button(searchResults,t.title,()=>showTopic(t),'search-hit discovery-hit');
   // Fetch existing source shard, never guess Scripture links from a title.
   // Mapped citations are associations in a historical index, not doctrine.
   sourceJson(TOPICS+t.shard).then(shard=>{
    if(current!==seq||!hit.isConnected||
       norm(searchInput.value)!==norm(query)||!searchModal.veil.classList.contains('is-open'))return;
    const row=shard?.topics?.find(x=>x.id===t.id);
    if(shard?.schema!=='sotw-topics-neuu-shard/1.0.0'||!row)return;
    const targets=[];
    for(const section of topicSections(row)){
     for(const ref of section.references){
      for(const scope of ref.scopes||[]){
       const p=parseScope(scope,BOOKS);
       if(p?.hasVerse)targets.push({book:p.book.code,chapter:p.chapter,verse:p.verse});
      }
     }
    }
    if(!targets.length)return;
    // The complete source article remains available in the topic detail.
    hit.dataset.searchEvidence=JSON.stringify([{type:'topic',id:t.id,
     relationship:'MAPPED_HISTORICAL_INDEX_REFERENCE',targets}]);
    root.SOTWSearchCoordinator?.refresh();
   }).catch(()=>{});
  }
  }
  addTopics(direct); // Preserve fast literal lookup even when remote reverse indexes are slow.
  pending.hidden=true;
  if(displayed.size>=8)return;
  try{
   // Reuse original, already checked Q&A records. Source citations are
   // evidence of an association, not a newly authored Bible reference.
   const matches=await root.SOTWUniversalSearch?.searchCandidates(query,8)||[];
   if(!valid())return;
   const books=requiredTopicBooks(matches,3);
   const responses=await Promise.allSettled(books.map(book=>
    sourceJson(TOPICS+'index/by-scripture/'+book+'.json')));
   if(!valid())return;
   const byBook={};
   books.forEach((book,i)=>{if(responses[i].status==='fulfilled')
    byBook[book]=responses[i].value;});
   const linked=evidenceLinkedTopics(indexed,matches,byBook,
    root.SOTWUniversalSearchCore,8);
   addTopics(rankTopics(indexed,query,8,linked,root.SOTWUniversalSearchCore));
  }catch(_){/* Only original literal topic results remain when unavailable. */}
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
topicsButton.setAttribute('aria-expanded','false');
topicsButton.setAttribute('aria-controls','sotwVerseTopicsBody');
verseBody.id='sotwVerseTopicsBody';
modernCommentaryMenu.before(verseDiscovery);
let verseSeq=0;
function closeVerseTopics(restoreFocus=false){
 ++verseSeq; // Invalidate any pending historical shard response.
 verseBody.hidden=true;verseBody.replaceChildren();
 topicsButton.setAttribute('aria-expanded','false');
 topicsButton.querySelector('.discovery-launch-meta').textContent='Explore topics ›';
 if(restoreFocus){
  topicsButton.focus({preventScroll:true});
  topicsButton.scrollIntoView({block:'nearest'});
 }
}
async function showVerseTopics(){
 if(!verseBody.hidden){closeVerseTopics();return;}
 const book=state.book,chapter=state.chapter,verse=modernStudyVerse,current=++verseSeq;
 const scope=book+'.'+chapter+'.'+verse;
 verseBody.hidden=false;verseBody.replaceChildren();
 topicsButton.setAttribute('aria-expanded','true');
 topicsButton.querySelector('.discovery-launch-meta').textContent='Hide topics ↑';
 note(verseBody,'Loading topic references…');
 const [indexResult,reverseResult]=await Promise.allSettled([
  topicsIndex(),sourceJson(TOPICS+'index/by-scripture/'+book+'.json')
 ]);
 if(current!==verseSeq||!document.body.classList.contains('study-open')||
    state.book!==book||state.chapter!==chapter||modernStudyVerse!==verse)return;
 verseBody.replaceChildren();
 if(indexResult.status!=='fulfilled'||reverseResult.status!=='fulfilled'){
  note(verseBody,'Historical topics are temporarily unavailable. The Bible text is unaffected.','discovery-error');
  const dismiss=button(verseBody,'Close topics ↑',()=>closeVerseTopics(true),'discovery-close-topics');
  dismiss.setAttribute('aria-label','Close Related Bible Topics');
  return;
 }
 const ids=verseTopicIds(reverseResult.value,scope);
 const named=new Map(indexResult.value.map(t=>[t.id,t]));
 const titles=orderVerseTopics(Array.from(new Set(ids)).map(id=>named.get(id)).filter(Boolean));
 if(titles.length){
  // Let the reader survey all topics before choosing which one to expand.
  const host=el('div','discovery-topic-groups');verseBody.append(host);
  for(const [index,topic] of titles.slice(0,6).entries()){
   const group=el('details','discovery-topic-group discovery-verse-topic');
   group.open=false;host.append(group);
   const summary=el('summary','discovery-topic-summary');
   summary.append(el('span','',readerTopicTitle(topic.title)));
   group.append(summary);
   const content=el('div','discovery-topic-content');group.append(content);
   const loading=note(content,'Loading Scripture references…');
   try{
    const shard=await sourceJson(TOPICS+topic.shard);
    if(current!==verseSeq||!group.isConnected)return;
    const row=shard?.topics?.find(t=>t.id===topic.id);
    if(shard.schema!=='sotw-topics-neuu-shard/1.0.0'||!row)throw Error('Missing topic');
    loading.remove();
    const sections=readerSections(row);
    if(!sections.length){group.remove();continue;}
    const primary=sections.filter(s=>!isAmbiguousSection(s));
    const uncertain=sections.filter(isAmbiguousSection);
    function renderSection(section){
     const sectionBox=el('section','discovery-verse-topic-section');content.append(sectionBox);
     sectionBox.append(el('h5','discovery-section-title',readerSectionTitle(section)));
     if(section.sourceLabel)sectionBox.dataset.originalSourceHeading=section.sourceLabel;
     expandList(sectionBox,section.references,referenceButton,4);
    }
    primary.slice(0,5).forEach(renderSection);
    if(primary.length>5){
     const rest=primary.length-5;
     const more=button(content,'Show '+rest+' more '+(rest===1?'section':'sections'),
      ()=>{const expanded=more.getAttribute('aria-expanded')==='true';
       if(expanded){
        for(const section of Array.from(content.querySelectorAll(':scope > .discovery-verse-topic-section')).slice(5))
         section.remove();
        more.textContent='Show '+rest+' more '+(rest===1?'section':'sections');
        more.setAttribute('aria-expanded','false');
        more.classList.remove('discovery-show-fewer');
       }else{
        primary.slice(5).forEach(renderSection);
        more.textContent='↑ Show fewer sections';more.setAttribute('aria-expanded','true');
        more.classList.add('discovery-show-fewer');
        // Put the collapse control before the extra sections, not after a long list.
        const extra=content.querySelectorAll(':scope > .discovery-verse-topic-section')[5];
        if(extra)content.insertBefore(more,extra);
       }
      },'discovery-more');
     more.setAttribute('aria-expanded','false');
    }
    if(uncertain.length){
     const other=el('details','discovery-uncertain-sections');
     other.append(el('summary','discovery-uncertain-summary',
      'Other indexed references ('+uncertain.length+')'));
     const otherBody=el('div','discovery-uncertain-body');other.append(otherBody);
     for(const section of uncertain){
      const item=el('section','discovery-verse-topic-section');otherBody.append(item);
      item.append(el('h5','discovery-section-title',readerSectionTitle(section)));
      if(section.sourceLabel)item.dataset.originalSourceHeading=section.sourceLabel;
      expandList(item,section.references,referenceButton,4);
     }
     content.append(other);
    }
   }catch{
    if(group.isConnected){loading.textContent='Topic references are unavailable.';loading.className='discovery-error';}
   }
  }
  if(titles.length>6)note(verseBody,'Showing the first six indexed topics for this verse.');
 }else note(verseBody,'No historical topic entry is indexed for this exact verse.');
 sourceLink(verseBody);
 const dismiss=button(verseBody,'Close topics ↑',()=>closeVerseTopics(true),'discovery-close-topics');
 dismiss.setAttribute('aria-label','Close Related Bible Topics');
}
// Reuse exactly the same published reverse-index pathway when returning to a
// verse-study topic. No parallel topic cache or invented association.
root.SOTWDiscoveryCore.openVerseTopics=showVerseTopics;
// Keep the existing study lifecycle; no separate original-order panel, no
// People/Places section. BSB Word-by-Word continues in study-ux-repair.js.
const earlierOpen=betaOpen,earlierClose=betaCloseSheet;
betaOpen=function(){
 closeVerseTopics();earlierOpen();
};
betaCloseSheet=function(){
 closeVerseTopics();earlierClose();
};
})(typeof globalThis==='object'?globalThis:this);
