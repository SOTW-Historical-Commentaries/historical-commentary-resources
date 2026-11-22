/* Reader search adapter for the owner-reviewed unfoldingWord v91 names subset.
   No independent historical master, no retired People/Places directory.
   The published overlay is the sole eligibility authority; fail closed. */
(function(root){
"use strict";
const COMMIT="d6152251b3073a718c6cbe9e6f3d285f0b7da3f3";
const INDEX_BLOB="e8aba2eb47739f26c02f1f7b7bd4e7098ce7481a";
const ELIGIBILITY_BLOB="0dc471653bc005fd4713f5b7c586f0195e672c08";
const RELATION_BLOB="83bee8b4cdc5af57e10c23403a48ed965786cbdb";
const ORIGIN="https://raw.githubusercontent.com/Stewards-of-the-Way/bible-foundation/"+COMMIT+"/data/unfoldingword/v91/names/";
function normalize(v){return String(v||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
function oneEdit(a,b){
 if(a===b)return true;
 if(Math.abs(a.length-b.length)>1)return false;
 let i=0,j=0,errors=0;
 while(i<a.length&&j<b.length){
  if(a[i]===b[j]){i++;j++;continue}
  if(++errors>1)return false;
  if(a.length>b.length)i++;else if(b.length>a.length)j++;else{i++;j++}
 }
 return errors+(a.length-i)+(b.length-j)<=1;
}
function match(entries,query,limit=8){
 const q=normalize(query).replace(/^(who|what) (is|was|were) /,"").replace(/^tell me about /,"");
 if(q.length<3||q.split(" ").length>4||!Array.isArray(entries))return [];
 const found=[];
 for(const e of entries){
  if(!Array.isArray(e)||e.length!==5)continue;
  const title=normalize(e[2]),forms=String(e[2]).split(/[,()]/).map(normalize).filter(Boolean);
  let score=title===q?100:forms.some(t=>t===q)?95:forms.some(t=>t.startsWith(q+" "))?80:0;
  if(!score&&q.length>3&&title.startsWith(q))score=62;
  // One insertion, omission or substitution (Oah -> Noah), only for a
  // single name query; never use fuzzy matching to reinstate excluded IDs.
  if(!score&&q.split(" ").length===1&&q.length>=3&&
    forms.some(t=>t.length>=4&&oneEdit(t,q)))score=42;
  if(score>0)found.push({entry:e,score});
 }
 found.sort((a,b)=>b.score-a.score||String(a.entry[2]).localeCompare(String(b.entry[2])));
 return found.slice(0,limit).map(x=>x.entry);
}
root.SOTWNameSearchCore={normalize,match};
if(typeof document==="undefined"||typeof searchInput==="undefined"||
 typeof searchResults==="undefined"||typeof sourcesSection==="undefined")return;
const rootPath=new URL("./data/universal-search/v1/",new URL(".",document.currentScript?.src||location.href));
let nameIndex=null,pending=null,request=0,timeout=null;
const articleCache=new Map(),linkCache=new Map();
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n}
function publishedUrl(path){return ORIGIN+path}
async function read(url){
 const response=await fetch(url,{cache:"force-cache"});
 if(!response.ok)throw Error("Unavailable approved name source ("+response.status+")");
 return response.json();
}
async function getIndex(){
 if(nameIndex)return nameIndex;
 if(pending)return pending;
 pending=(async()=>{
  const m=await read(new URL("approved-names.json",rootPath));
  if(m.schema!=="sotw-reader-approved-names/1.0.0"||m.foundationCommit!==COMMIT||
     m.nameIndexGitBlob!==INDEX_BLOB||m.eligibilityGitBlob!==ELIGIBILITY_BLOB||
     m.qaLinkIndexGitBlob!==RELATION_BLOB||m.displayEligible!==332||
     m.excludedCount!==23||m.qaLinkedEligible!==304||m.qaRelationshipCount!==9303||
     !Array.isArray(m.entries)||m.entries.length!==332||
     !Array.isArray(m.excludedIds)||m.excludedIds.length!==23)
   throw Error("Name visibility review/source pin mismatch");
  const excluded=new Set(m.excludedIds),ids=new Set();
  for(const row of m.entries){
   if(!Array.isArray(row)||row.length!==5||typeof row[0]!=="string"||
     !/^utw:v91:names:[a-z0-9]+$/.test(row[0])||excluded.has(row[0])||ids.has(row[0])||
     typeof row[1]!=="string"||! /^[a-z0-9]+$/.test(row[1])||
     row[0]!=="utw:v91:names:"+row[1]||
     typeof row[2]!=="string"||!row[2]||!Number.isInteger(row[3])||row[3]<0||
     !Number.isInteger(row[4])||row[4]<0)
    throw Error("Blocked or duplicate name source");
   ids.add(row[0]);
  }
  if(new Set(m.excludedIds).size!==23||m.entries.filter(x=>x[4]>0).length!==304)
   throw Error("Invalid name exclusion/relationship inventory");
  nameIndex=m;return m;
 })().catch(err=>{pending=null;throw err});
 return pending;
}
function validTarget(t){
 const b=BOOKS.find(x=>x.code===t?.book);
 return b&&Number.isInteger(t.chapter)&&t.chapter>=1&&t.chapter<=b.chapterCount&&
  Number.isInteger(t.verse)&&t.verse>=1&&t.verse<=176;
}
async function article(entry){
 const key=entry[0];if(articleCache.has(key))return articleCache.get(key);
 const p=read(publishedUrl("entries/"+entry[1]+".json")).then(async a=>{
  if(a?.id!==key||a.slug!==entry[1]||a.title!==entry[2]||
     a.collection!=="bible/names"||a.source?.resource!=="en_tw"||
     a.source?.version!=="91"||a.source?.publisher!=="unfoldingWord"||
     !Array.isArray(a.bibleReferences))throw Error("Unverified name article");
  const refs=a.bibleReferences.filter(r=>r.resolutionStatus==="READER_ANCHOR_AVAILABLE"&&
    validTarget(r.scriptureTarget));
  // Ten eligible articles have no direct article citations. The publisher's
  // explicitly matched Q&A may provide a valid Scripture anchor, not a
  // manufactured article citation or identity claim.
  if(!refs.length&&entry[4]){
   const links=await relationships(entry);
   const found=links.flatMap(l=>l.scriptureTargets||[]).find(validTarget);
   if(found){
    const book=BOOKS.find(x=>x.code===found.book);
    refs.push({label:"Q&A mention · "+book.name+" "+found.chapter+":"+found.verse,
      scriptureTarget:found,fromAssociation:true});
   }
  }
  if(!refs.length)throw Error("Name article has no published Scripture target");
  return {source:a,refs};
 }).catch(err=>{articleCache.delete(key);throw err});
 articleCache.set(key,p);return p;
}
function firstDefinition(a){
 return String(a.sections?.Definition||"").split("\n\n")[0].trim();
}
function citation(e){
 const t=e.scriptureTarget;
 const book=BOOKS.find(b=>b.code===t.book);
 return e.label||book.name+" "+t.chapter+":"+t.verse;
}
function toTuple(t){return [t.book,t.chapter,t.verse,null]}
async function openPassage(t,button){
 return root.SOTWUniversalSearch?.navigateToTarget(toTuple(t),button);
}
const disclosure=el("details","more-resource");disclosure.id="approvedNameSourceAttribution";
disclosure.append(el("summary","","People & Places · unfoldingWord v91"));
disclosure.append(el("p","","unfoldingWord Translation Words, en_tw v91, bible/names. CC BY-SA 4.0. The 2026-11-21 reader eligibility review approves 332 of 355 source articles for display and excludes 23. Descriptions are attributed to their original publisher, not presented as independently established history. Q&A associations identify explicit name mentions, not historical proof."));
const links=el("div","more-resource-links");
for(const [label,url] of [
 ["Original name source (v91)","https://git.door43.org/unfoldingWord/en_tw/releases/tag/v91"],
 ["License · CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/"],
 ["Approved display overlay","https://github.com/Stewards-of-the-Way/bible-foundation/blob/"+COMMIT+"/data/unfoldingword/v91/names/review/v1/reader-eligibility.json"],
 ["Explicit Q&A relationship audit","https://github.com/Stewards-of-the-Way/bible-foundation/blob/"+COMMIT+"/data/unfoldingword/v91/names/qa-links/v1/audit.json"]]){
 const a=el("a","",label);a.href=url;a.target="_blank";a.rel="noopener noreferrer";links.append(a);
}
disclosure.append(links);sourcesSection.append(disclosure);
function sourceMenu(event){
 event.stopPropagation();searchModal.veil.classList.remove("is-open");
 moreModal.veil.classList.add("is-open");disclosure.open=true;
 disclosure.scrollIntoView({block:"nearest"});
 disclosure.querySelector("summary")?.focus({preventScroll:true});
}
async function relationships(entry){
 if(!entry[4])return [];
 if(linkCache.has(entry[0]))return linkCache.get(entry[0]);
 const p=read(publishedUrl("qa-links/v1/by-name/"+entry[1]+".json")).then(data=>{
  if(data.schema!=="sotw-name-qa-links/1.0.0"||data.sourceNameId!==entry[0]||
     data.qaCount!==entry[4]||!Array.isArray(data.links)||data.links.length!==entry[4])
   throw Error("Explicit Q&A relationship validation failed");
  return data.links.filter(l=>l.matchType==="QUESTION_EXPLICIT"||
   l.matchType==="ANSWER_EXPLICIT");
 }).catch(e=>{linkCache.delete(entry[0]);throw e});
 linkCache.set(entry[0],p);return p;
}
async function showDetail(entry,a,card,button){
 const prev=card.querySelector(".universal-name-detail");
 if(prev){prev.remove();button.textContent="View profile";return}
 const area=el("div","universal-name-detail");area.append(el("h5","","Source article"));
 area.append(el("p","universal-name-full-definition",String(a.source.sections?.Definition||"")));
 area.append(el("h5","","Published Scripture references"));
 const refs=el("div","universal-name-references");
 for(const e of a.refs.slice(0,12)){
  const b=el("button","universal-qa-ref","Read "+citation(e)+" in "+state.edition);
  b.type="button";b.addEventListener("click",()=>openPassage(e.scriptureTarget,b));refs.append(b);
 }
 area.append(refs);
 if(a.refs.length>12)area.append(el("p","universal-name-note",a.refs.length-12+" additional source references are not shown here."));
 const related=el("section","universal-name-related");
 if(entry[4]){
  related.append(el("h5","","Explicit Bible Questions mentions ("+entry[4]+")"));
  related.append(el("p","universal-name-note","A name mentioned in a question or answer is not, by itself, a historical relationship claim."));
  const status=el("p","universal-name-note","Loading published matches…");related.append(status);
  Promise.all([relationships(entry),root.SOTWUniversalSearch?.questionsByIds()]).then(([associations,qaRows])=>{
   if(!area.isConnected)return;
   status.remove();
   const lookup=new Map((qaRows||[]).map(q=>[q[0],q]));
   let shown=0;
   for(const link of associations){
    const q=lookup.get(link.qaId);
    const t=link.scriptureTargets?.find(validTarget);
    if(!q||!t)continue;
    const item=el("article","universal-name-qa-detail");
    item.append(el("strong","",q[1]));
    item.append(el("p","universal-qa-answer",q[2]));
    const b=el("button","universal-qa-ref","Open "+BOOKS.find(x=>x.code===t.book).name+" "+t.chapter+":"+t.verse+" · "+state.edition);
    b.type="button";b.addEventListener("click",()=>openPassage(t,b));item.append(b);related.append(item);
    if(++shown===8)break;
   }
   if(!shown)related.append(el("p","universal-name-note","No verified Q&A target available in this edition."));
  }).catch(()=>{if(area.isConnected)status.textContent="Related questions could not be loaded. Published Scripture references remain available."});
 }else{
  related.append(el("p","universal-name-note","No explicit Q&A name mentions are published for this article."));
 }
 area.append(related);card.append(area);button.textContent="Hide profile";
}
function render(rows){
 document.querySelectorAll(".universal-name-section").forEach(n=>n.remove());
 if(!rows.length)return;
 const section=el("section","universal-name-section");
 section.append(el("h4","universal-qa-heading","People & Places profiles ("+rows.length+" matching)"));
 const entered=normalize(searchInput.value).replace(/^(who|what) (is|was|were) /,"");
 for(const [entry,a] of rows){
  const card=el("article","universal-qa-card universal-name-card");card.dataset.nameId=entry[0];
  const top=el("div","universal-qa-top");top.append(el("span","","Approved name article · unfoldingWord"));
  const source=el("button","universal-qa-source","Source ↗");source.type="button";
  source.addEventListener("click",sourceMenu);top.append(source);card.append(top);
  card.append(el("h5","universal-name-title",entry[2]));
  if(!String(entry[2]).split(/[,()]/).map(normalize).includes(entered)&&
     !normalize(entry[2]).startsWith(entered+" ")&&entered.split(" ").length===1)
   card.append(el("p","universal-name-note","Closest matching name for “"+searchInput.value.trim()+"”"));
  if(a?.source){
   card.append(el("p","universal-qa-answer",firstDefinition(a.source)));
   const ref=a.refs[0],row=el("div","universal-name-actions");
   const view=el("button","universal-name-open","Read profile & references");view.type="button";
   view.addEventListener("click",()=>showDetail(entry,a,card,view));row.append(view);
   const jump=el("button","universal-qa-ref","Open "+citation(ref)+" · "+state.edition);
   jump.type="button";jump.addEventListener("click",()=>openPassage(ref.scriptureTarget,jump));row.append(jump);
   card.append(row);
  }else{
   card.append(el("p","universal-name-note",a===null?
    "Publisher profile temporarily unavailable. Try searching again later.":
    "Loading approved publisher profile…"));
  }
  section.append(card);
 }
 // Name matches are the primary answer to an exact or near-exact name query.
 // Do not let chapter hits, questions or network order bury the profile.
 searchResults.prepend(section);
}
function current(n,q){return n===request&&searchInput.value.trim()===q&&searchModal.veil.classList.contains("is-open")}
searchInput.addEventListener("input",()=>{
 const n=++request,q=searchInput.value.trim();clearTimeout(timeout);
 document.querySelectorAll(".universal-name-section,.universal-name-status").forEach(x=>x.remove());
 if(q.length<3||typeof modernParseReference==="function"&&modernParseReference(q))return;
 timeout=setTimeout(async()=>{
  if(!current(n,q))return;
  const status=el("p","universal-name-status","Checking eligible people and place references…");
  try{
   const idx=await getIndex();if(!current(n,q))return;
   const matches=match(idx.entries,q);
   if(!matches.length)return;
   // Show the allowed name immediately, even when the remote publisher
   // article is slow or temporarily blocked on mobile networks.
   render(matches.map(e=>[e,undefined]));
   const details=await Promise.all(matches.map(e=>article(e).then(a=>[e,a]).catch(()=>[e,null])));
   if(current(n,q))render(details);
  }catch(_){if(current(n,q))status.textContent="Published name profiles are temporarily unavailable. Scripture and Bible Questions are still available."}
  finally{if(status.isConnected)status.remove()}
 },310);
});
root.SOTWApprovedNameSearch={status:"REVIEW_ELIGIBLE_SOURCE_SUBSET",count:332};
})(typeof globalThis==="object"?globalThis:this);
