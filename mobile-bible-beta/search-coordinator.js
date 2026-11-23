/* Bible-first result coordinator for the two separately branded readers.
   Existing source adapters own retrieval, source IDs, citations and navigation.
   This layer only orders their already vetted results and provides a reversible
   shortcut to an existing Scripture preview. No inferred verse links. */
(function(root){
"use strict";
const normalize=value=>String(value||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
function exactName(query,title){
 const q=normalize(query).replace(/^(who|what) (is|was|were) /,"").replace(/^tell me about /,"");
 return !!q&&String(title||"").split(/[,()]/).some(part=>normalize(part)===q);
}
function queryIntent(query){
 const q=normalize(query);
 if(/\b(jacob|lannom)\b/.test(q))return "author";
 if(/^(who (is|was|were)|tell me about|which person)\b/.test(q))return "person";
 if(/^(what|why|how|when|where|which|is|does|did|can|should)\b/.test(q)||/\?\s*$/.test(query))return "question";
 return "subject";
}
// Rank published source groups by request, not async completion order.
// A missing Q&A promotes existing Nave results, never an invented answer.
function weight(type,query,caption,hasQuestions=false){
 const q=normalize(query),s=normalize(caption),intent=queryIntent(query);
 if(type==="scripture")return 4;
 if(type==="name")return exactName(query,caption)?135:intent==="person"?116:74;
 if(type==="book")return s===q?128:49;
 if(type==="jacob")return intent==="author"?130:81;
 if(type==="questions")return intent==="question"?122:q.length>=4&&s.includes(q)?105:94;
 if(type==="topic"){
  if(intent==="question"&&!hasQuestions)return 117;
  return s===q?115:s.startsWith(q)?103:intent==="subject"?99:78;
 }
 return 0;
}
function order(groups,query){
 const hasQuestions=groups.some(g=>g.type==="questions");
 return groups.map((g,i)=>({...g,originalIndex:i,
  priority:weight(g.type,query,g.caption,hasQuestions)}))
  .sort((a,b)=>b.priority-a.priority||a.originalIndex-b.originalIndex);
}
// A source must explicitly supply this canonical Scripture destination.
// No topic-name, question-wording, concept-label or author-text inference.
const SOURCE_LABELS={
 question:"Bible Questions · unfoldingWord",
 name:"Approved name article · unfoldingWord",
 topic:"Historical index · Nave/Torrey",
 jacob:"Published Jacob Lannom commentary",
 scripture:"Selected-edition Scripture"
};
const RELATIONS={
 question:"PUBLISHED_QUESTION_CITATION",name:"PUBLISHED_ARTICLE_CITATION",
 topic:"MAPPED_HISTORICAL_INDEX_REFERENCE",
 jacob:"ACCEPTED_AUTHOR_PASSAGE_SCOPE",scripture:"CURRENT_EDITION_VERSE"
};
function canonicalTarget(t,books){
 if(!t||!Array.isArray(books))return null;
 const book=books.find(b=>b.code===t.book),chapter=t.chapter,verse=t.verse;
 if(!book||!Number.isInteger(chapter)||!Number.isInteger(verse)||
    chapter<1||chapter>book.chapterCount||verse<1||verse>176)return null;
 return {key:book.code+"."+chapter+"."+verse,book:book.code,
  chapter,verse,label:book.name+" "+chapter+":"+verse};
}
function groupEvidence(records,books){
 const at=new Map();
 for(const record of records||[]){
  if(!record||!Object.prototype.hasOwnProperty.call(SOURCE_LABELS,record.type)||
     record.relationship!==RELATIONS[record.type]||
     typeof record.id!=="string"||!record.id||
     !Array.isArray(record.targets)||!record.targets.length)continue;
  for(const target of record.targets){
   const c=canonicalTarget(target,books);if(!c)continue;
   if(!at.has(c.key))at.set(c.key,{...c,members:[],seen:new Set()});
   const group=at.get(c.key),id=record.type+"|"+record.id;
   if(group.seen.has(id))continue;
   group.seen.add(id);
   group.members.push({type:record.type,id:record.id,
    relationship:record.relationship,element:record.element||null});
  }
 }
 return [...at.values()].map(g=>({
  key:g.key,book:g.book,chapter:g.chapter,verse:g.verse,label:g.label,
  sources:[...new Set(g.members.map(m=>m.type))],members:g.members
 })).filter(g=>g.sources.length>=2)
 .sort((a,b)=>b.sources.length-a.sources.length||
   b.members.length-a.members.length||a.key.localeCompare(b.key));
}
root.SOTWSearchCoordinatorCore={normalize,exactName,queryIntent,weight,order,canonicalTarget,groupEvidence,RELATIONS};
if(typeof document==="undefined"||typeof searchInput==="undefined"||
 typeof searchResults==="undefined"||typeof searchModal==="undefined")return;
const css=document.createElement("style");
css.textContent=".mobile-beta .sotw-search-topics-group{display:grid;gap:7px;min-width:0}" +
 ".mobile-beta .sotw-search-scripture{display:grid;gap:4px;text-align:left;width:100%;" +
 "border:1px solid #7b9195;border-radius:10px;padding:10px 13px;background:transparent;" +
 "color:inherit;font:inherit;cursor:pointer}" +
 ".mobile-beta .sotw-search-scripture strong{font-weight:650;font-size:14px}" +
 ".mobile-beta .sotw-search-scripture small{font-size:12px;opacity:.83}" +
 ".mobile-beta .sotw-passage-evidence{border:1px solid #657d83;border-radius:10px;padding:10px;display:grid;gap:8px}" +
 ".mobile-beta .sotw-passage-evidence details{border-top:1px solid #657d83;padding-top:7px}" +
 ".mobile-beta .sotw-passage-evidence summary{cursor:pointer;font-size:14px;font-weight:600}" +
 ".mobile-beta .sotw-passage-evidence p{font-size:12px;line-height:1.45;margin:2px 0;opacity:.86}" +
 ".mobile-beta .sotw-passage-actions{display:grid;gap:5px;margin-top:8px}" +
 ".mobile-beta .sotw-passage-actions button{min-height:40px;border:1px solid #829ba1;background:transparent;color:inherit;border-radius:8px;text-align:left;padding:8px;font:inherit;font-size:13px}" +
 ".mobile-beta .sotw-search-expandable{border:1px solid #647d86;border-radius:10px;padding:0 9px;min-width:0}" +
 ".mobile-beta .sotw-search-expandable>summary{cursor:pointer;padding:12px 4px;font-size:13px;font-weight:650;line-height:1.4}" +
 ".mobile-beta .sotw-search-expandable[open]{padding-bottom:9px}" +
 ".mobile-beta.beta-light .sotw-search-expandable{border-color:#b2c6c7}";
document.head.append(css);
let pending=false,observer=null;
function groupType(el){
 if(el.classList.contains("reader-current-chapter-search"))return "scripture";
 if(el.classList.contains("universal-name-section"))return "name";
 if(el.classList.contains("universal-qa-section"))return "questions";
 if(el.classList.contains("sotw-search-topics-group"))return "topic";
 if(el.classList.contains("jacob-search-results"))return "jacob";
 if(el.matches("button.search-hit")&&!el.classList.contains("discovery-hit"))return "book";
 return "";
}
function caption(el,type){
 if(type==="name")return el.querySelector(".universal-name-title")?.textContent||"";
 if(type==="questions")return el.querySelector(".universal-qa-question")?.textContent||"";
 if(type==="topic")return el.querySelector(".discovery-hit")?.textContent||"";
 if(type==="jacob")return el.querySelector(".jacob-search-hit strong")?.textContent||"";
 if(type==="book")return el.textContent||"";
 return "";
}
function wrapHistoricalTopics(){
 const label=Array.from(searchResults.children).find(n=>n.classList.contains("discovery-search-label"));
 let group=Array.from(searchResults.children).find(n=>n.classList.contains("sotw-search-topics-group"));
 if(label&&!group){
  group=document.createElement("section");group.className="sotw-search-topics-group";
  label.before(group);group.append(label);
 }
 if(!group)return;
 // A late topic response must join the same expandable source section.
 const target=group.querySelector(":scope > .sotw-search-expandable")||group;
 for(const hit of Array.from(searchResults.children).filter(n=>n.classList.contains("discovery-hit")))
  target.append(hit);
}
function makeExpandable(section,type,query){
 if(!["name","questions","topic","scripture"].includes(type)||
    section.querySelector(":scope > .sotw-search-expandable"))return;
 const heading=section.querySelector(":scope > h4");
 if(!heading)return;
 const details=document.createElement("details");
 details.className="sotw-search-expandable";
 // Keep existing Q&A and topic navigation visible until the reader folds it.
 // Incidental current-chapter hits begin folded and always rank last.
 details.open=type==="questions"||type==="topic"||
  type==="name"&&exactName(query,caption(section,type));
 const summary=document.createElement("summary");
 summary.textContent=heading.textContent;details.append(summary);
 heading.replaceWith(details);
 while(details.nextSibling)details.append(details.nextSibling);
}
function sourceCitation(){
 // These controls are made by the existing source-validated Q&A adapter.
 // Forward to its in-search preview, which checks the chosen translation.
 const question=searchResults.querySelector(".universal-qa-section .universal-qa-card .universal-qa-ref");
 if(!question)return null;
 const raw=question.textContent||"";
 if(!raw.startsWith("Read cited Scripture:"))return null;
 const citation=raw.slice("Read cited Scripture:".length).trim();
 return citation?{citation,button:question}:null;
}
function readEvidence(){
 const candidates=[];
 for(const el of searchResults.querySelectorAll("[data-search-evidence]")){
  let source;try{source=JSON.parse(el.dataset.searchEvidence)}catch{continue}
  if(!Array.isArray(source))continue;
  for(const candidate of source)candidates.push({...candidate,element:el});
 }
 return candidates;
}
function passageSummary(query){
 let old=searchResults.querySelector(":scope > .sotw-passage-evidence");
 // Current-chapter incidental word hits are ranked last, not used to
 // elevate an otherwise unrelated passage into the shared-evidence section.
 const groups=groupEvidence(readEvidence().filter(r=>r.type!=="scripture"),
  typeof BOOKS!=="undefined"?BOOKS:[]).slice(0,6);
 if(!groups.length){old?.remove();return}
 // Rebuild only on a semantic group identity change, not each sort mutation.
 const signature=JSON.stringify(groups.map(g=>[g.key,g.members.map(m=>m.type+"|"+m.id)]))+"|"+state.edition;
 if(old?.dataset.signature===signature&&old._sources?.every(el=>el.isConnected))return;
 const host=document.createElement("section");
 host.className="sotw-passage-evidence";host.dataset.signature=signature;
 const heading=document.createElement("h4");
 heading.className="universal-qa-heading";heading.textContent="Shared Scripture citations";
 host.append(heading);
 const note=document.createElement("p");
 note.textContent="These published sources cite the same verse. A shared reference does not establish agreement or doctrinal proof.";
 host.append(note);
 for(const group of groups){
  const details=document.createElement("details");
  const summary=document.createElement("summary");
  summary.textContent=group.label+" · "+group.sources.length+" source types";
  details.append(summary);
  const actions=document.createElement("div");actions.className="sotw-passage-actions";
  const open=document.createElement("button");open.type="button";
  open.textContent="Open "+group.label+" in "+state.edition;
  open.addEventListener("click",()=>{
   root.SOTWUniversalSearch?.navigateToTarget([group.book,group.chapter,group.verse,null],open);
  });
  actions.append(open);
  for(const member of group.members){
   const btn=document.createElement("button");btn.type="button";
   btn.textContent="View "+SOURCE_LABELS[member.type];
   btn.addEventListener("click",()=>{
    const el=member.element;
    if(!el?.isConnected)return;
    for(let ancestor=el.parentElement;ancestor&&ancestor!==searchResults;ancestor=ancestor.parentElement){
     if(ancestor.tagName==="DETAILS")ancestor.open=true;
    }
    el.scrollIntoView({block:"nearest"});
    const focus=el.querySelector("button,summary")||el;
    focus.focus({preventScroll:true});
   });
   actions.append(btn);
  }
  details.append(actions);host.append(details);
 }
 host._sources=groups.flatMap(g=>g.members.map(m=>m.element)).filter(Boolean);
 if(old)old.replaceWith(host);
 else {
  // Exact approved name profiles remain the first result for name queries.
  const nameSection=searchResults.querySelector(":scope > .universal-name-section");
  const exact=nameSection&&[...nameSection.querySelectorAll(".universal-name-title")]
   .some(title=>exactName(query,title.textContent));
  if(exact)nameSection.after(host);else searchResults.prepend(host);
 }
}
function sync(){
 if(!searchModal.veil.classList.contains("is-open"))return;
 const query=searchInput.value.trim();
 if(!query||typeof modernParseReference==="function"&&modernParseReference(query))return;
 wrapHistoricalTopics();
 const nodes=Array.from(searchResults.children).filter(n=>!n.classList.contains("sotw-search-scripture")&&!n.classList.contains("sotw-passage-evidence"));
 const described=nodes.map(el=>({el,type:groupType(el),caption:caption(el,groupType(el))}));
 for(const {el,type} of described)makeExpandable(el,type,query);
 const ordered=order(described,query);
 // Source modules may finish in any network order. One stable sort avoids
 // Q&A prepend, historical append and names prepend racing each other.
 // Sort only source-owned results; never move the coordinator's own cards.
 // A fixed numeric offset was unstable when the exact Noah profile sat
 // ahead of its shared-citations section, causing repeated DOM mutations.
 const auxiliary=el=>el.classList.contains("sotw-search-scripture")||
  el.classList.contains("sotw-passage-evidence");
 ordered.forEach(({el},i)=>{
  const at=Array.from(searchResults.children).filter(node=>!auxiliary(node))[i];
  if(at!==el)searchResults.insertBefore(el,at||null);
 });
 passageSummary(query);
 // Keep one stable placement: exact reviewed person first, then citations;
 // otherwise a Scripture citation shortcut or shared passage comes first.
 const shared=searchResults.querySelector(":scope > .sotw-passage-evidence");
 const exactSection=Array.from(searchResults.children).find(el=>
  el.classList.contains("universal-name-section")&&
  Array.from(el.querySelectorAll(".universal-name-title")).some(title=>exactName(query,title.textContent)));
 if(shared){
  const first=searchResults.firstElementChild;
  const target=exactSection?exactSection.nextElementSibling:
   first?.classList.contains("sotw-search-scripture")?first.nextElementSibling:first;
  if(shared!==target)searchResults.insertBefore(shared,target||null);
 }
 const exactProfile=described.some(({el,type,caption})=>type==="name"&&exactName(query,caption));
 const chapter=described.some(({type})=>type==="scripture");
 const bookExact=described.some(({type,caption})=>type==="book"&&normalize(caption)===normalize(query));
 const source=!exactProfile&&!chapter&&!bookExact?sourceCitation():null;
 let link=searchResults.querySelector(":scope > .sotw-search-scripture");
 if(!source){if(link)link.remove();return}
 if(!link){
  link=document.createElement("button");link.type="button";link.className="sotw-search-scripture";
  const head=document.createElement("strong"),sub=document.createElement("small");
  link.append(head,sub);
  searchResults.prepend(link);
 }
 const label="Preview Scripture cited by Bible Questions";
 if(link.firstElementChild.textContent!==label)link.firstElementChild.textContent=label;
 if(link.lastElementChild.textContent!==source.citation)link.lastElementChild.textContent=source.citation;
 link.onclick=()=>{
  const current=sourceCitation();
  if(current&&current.citation===source.citation&&current.button.isConnected)current.button.click();
 };
 if(searchResults.firstElementChild!==link)searchResults.prepend(link);
}
// On iPhone Safari, search adapter and coordinator mutations can arrive
// together. Coalesce them into one task and discard records generated by
// our own reorder/rebuild. This prevents an observer feedback loop while
// leaving the source adapters free to complete their normal async work.
function schedule(){
 if(pending)return;
 pending=true;
 setTimeout(()=>{
  pending=false;
  try{sync()}finally{observer?.takeRecords()}
 },65);
}
searchInput.addEventListener("input",schedule);
observer=new MutationObserver(schedule);
observer.observe(searchResults,{childList:true});
root.SOTWSearchCoordinator={version:"unified-intent-groups-v3",refresh:schedule};
})(typeof globalThis==="object"?globalThis:this);
