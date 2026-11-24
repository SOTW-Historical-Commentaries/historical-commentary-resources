/* Universal Search v1: evidence-linked unfoldingWord v91 Bible Questions.
   Source is precomputed from pinned published en_tq, not a web crawler.
   Existing Scripture, Bible Topics and Jacob search remain independent.
   Historical people/place master stays excluded; the approved subset is indexed separately. */
(function(root){
"use strict";
const STOP=new Set(["a","an","and","are","as","at","be","by","did","do","does","for","from","how","i","in","is","it","of","on","or","the","to","was","were","what","when","where","which","who","why","with","would","you"]);
const ALIASES={snake:["serpent"],serpent:["snake"],stick:["pole","staff","rod"],pole:["stick","staff"],bronze:["brass","brazen"],brass:["bronze","brazen"],raised:["lifted","lift"],lifted:["raised","lift"],cross:["crucified"],jesus:["christ"],christ:["jesus"],forgive:["forgiveness"],forgiveness:["forgive"],resurrection:["raised","rise"]};
 // Make existing lexicon bidirectional for all source types; do not add
 // person/event-specific aliases or infer new Scripture destinations.
const EXPANDED_ALIASES=new Map();
for(const [term,related] of Object.entries(ALIASES)){
 if(!EXPANDED_ALIASES.has(term))EXPANDED_ALIASES.set(term,new Set());
 for(const alias of related){
  EXPANDED_ALIASES.get(term).add(alias);
  if(!EXPANDED_ALIASES.has(alias))EXPANDED_ALIASES.set(alias,new Set());
  EXPANDED_ALIASES.get(alias).add(term);
 }
}
function normalize(value){return String(value||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g," ").trim()}
function words(value){return [...new Set(normalize(value).split(" ").filter(t=>t.length>1&&!STOP.has(t)))]}
function near(a,b){if(a===b)return true;if(Math.abs(a.length-b.length)>1||a.length<4||b.length<4)return false;let i=0,j=0,m=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue}if(++m>1)return false;if(a.length>b.length)i++;else if(b.length>a.length)j++;else{i++;j++}}return m+(a.length-i)+(b.length-j)<=1}
function tokenMatch(term,set){
 if(set.has(term))return 1;
 for(const alias of EXPANDED_ALIASES.get(term)||[])if(set.has(alias))return .75;
 if(term.length>=4)for(const w of set)if(w.startsWith(term)&&w.length-term.length<=3)return .55;
 if(term.length>=5)for(const w of set)if(near(term,w))return .4;
 return 0;
}
function score(row,queryTerms,phrase){
 if(!Array.isArray(row)||!Array.isArray(row[3])||!row[3].length)return 0;
 const q=normalize(row[1]),a=normalize(row[2]),qw=new Set(words(q)),aw=new Set(words(a));
 let matched=0,total=0;
 for(const term of queryTerms){
  const qm=tokenMatch(term,qw),am=tokenMatch(term,aw),best=Math.max(qm,am);
  if(best){matched++;total+=Math.max(qm*9,am*4);}
 }
 const minimum=queryTerms.length<=2?1:Math.ceil(queryTerms.length*.5);
 if(matched<minimum)return 0;
 if(phrase.length>=4&&q.includes(phrase))total+=26;
 else if(phrase.length>=4&&a.includes(phrase))total+=10;
 total+=matched*3;
 if(queryTerms.length>1&&matched===queryTerms.length)total+=14;
 // Phrase intent matters: a snake placed ON a stick or pole is a
 // different search from a STAFF BECOMING a snake. Promote the already
 // published "bronze serpent Moses had made" question when its wording
 // explicitly supports the event, without creating an inferred verse link.
 // The original Q&A citation (2KI 18:4) remains the only destination.
 const raisedSerpentIntent=/\b(?:snake|serpent)\s+(?:on|upon)\s+(?:(?:a|the)\s+)?(?:stick|pole)\b/.test(phrase);
 if(raisedSerpentIntent&&/\bbronze serpent\b/.test(q+" "+a)&&
    /\bmoses\b/.test(q+" "+a))total+=28;
 return Math.round(total*100)/100;
}
function rank(records,query,limit=20){
 const terms=words(query),phrase=normalize(query);
 if(!terms.length||!Array.isArray(records))return [];
 const scored=[];
 for(const row of records){const value=score(row,terms,phrase);if(value>0)scored.push({row,score:value})}
 scored.sort((a,b)=>b.score-a.score||String(a.row[0]).localeCompare(String(b.row[0])));
 return scored.slice(0,limit);
}

/* Source-backed verse-to-question lookup: no new sources or inferred links. */
function verseQuestions(reverse,records,book,chapter,verse){
 if(reverse?.schema!=="sotw-qa-verse-index/1.0.0"||reverse.book!==book||
    !reverse.verses||typeof reverse.verses!=="object"||Array.isArray(reverse.verses))
   throw Error("Unverified Bible Questions reverse index");
 const ids=reverse.verses[chapter+"."+verse]||[];
 if(!Array.isArray(ids))throw Error("Invalid verse-to-question IDs");
 if(!ids.length)return [];
 const lookup=new Map(records.map(r=>[r[0],r])),seen=new Set(),found=[];
 for(const id of ids){
  if(typeof id!=="string"||!id.startsWith("utq:v91:"+book+":"))throw Error("Invalid question ID");
  if(seen.has(id))continue;
  seen.add(id);
  const row=lookup.get(id);
  if(!row||!Array.isArray(row[3])||!row[3].some(t=>Array.isArray(t)&&
     t[0]===book&&t[1]===chapter&&t[2]<=verse&&
     (Number.isInteger(t[3])&&t[3]>=t[2]?t[3]:t[2])>=verse))
    throw Error("Verse-to-question citation mismatch");
  found.push(row);
 }
 return found;
}
root.SOTWUniversalSearchCore={normalize,words,near,tokenMatch,score,rank,verseQuestions};
if(typeof document==="undefined"||typeof searchInput==="undefined"||typeof searchResults==="undefined"||typeof state==="undefined")return;
const base=new URL(".",document.currentScript?.src||location.href);
const path=new URL("./data/universal-search/v1/",base);
let loading=null,rows=null,request=0,timer=null;
const bookOf=code=>BOOKS.find(x=>x.code===code);
function textNode(tag,cls,value){const el=document.createElement(tag);if(cls)el.className=cls;el.textContent=value;return el}
async function json(url){const response=await fetch(url,{cache:"force-cache"});if(!response.ok)throw Error("Index HTTP "+response.status);return response.json()}
async function index(){
 if(rows)return rows;
 if(loading)return loading;
 loading=(async()=>{
  const manifest=await json(new URL("manifest.json",path));
  if(manifest.schema!=="sotw-reader-universal-search-manifest/1.0.0"||
    manifest.source?.commit!=="b4a7702a8bb1f7410514b7f44663c49ecfd25d33"||
    manifest.source?.reviewStatus!=="SOURCE_RECORD_UNALTERED_NOT_INDEPENDENTLY_FACT_CHECKED"||
    manifest.indexedRecords!==12139||!Array.isArray(manifest.shards)||manifest.shards.length!==8)
    throw Error("Unexpected published Q&A search manifest");
  const loaded=await Promise.all(manifest.shards.map(async shard=>{
   const part=await json(new URL(shard.path,path));
   if(part.schema!=="sotw-reader-qa-search-shard/1.0.0"||part.version!=="91"||
      !Array.isArray(part.records)||part.records.length!==shard.count)
     throw Error("Q&A shard integrity mismatch");
   return part.records;
  }));
  const all=loaded.flat(),ids=new Set();
  for(const row of all){
   if(!Array.isArray(row)||row.length<6||typeof row[0]!=="string"||
     typeof row[1]!=="string"||typeof row[2]!=="string"||!Array.isArray(row[3])||
     !row[3].some(t=>Array.isArray(t)&&bookOf(t[0])&&Number.isInteger(t[1])&&Number.isInteger(t[2])&&t[1]>0&&t[2]>0)||
     ids.has(row[0]))throw Error("Invalid or duplicate published question");
   ids.add(row[0]);
  }
  if(all.length!==manifest.indexedRecords)throw Error("Incomplete published Q&A search");
  rows=all;return all;
 })().catch(error=>{loading=null;throw error});
 return loading;
}
function reference(target){
 const b=bookOf(target?.[0]);if(!b)return "";
 return b.name+" "+target[1]+":"+target[2]+(target[3]&&target[3]>target[2]?"–"+target[3]:"");
}
async function navigate(row,button){
 if(button.disabled)return;
 const target=(row[3]||[]).find(t=>Array.isArray(t)&&bookOf(t[0])&&t[1]>0&&t[2]>0);
 if(!target)return;
 const book=bookOf(target[0]),chapter=target[1],verse=target[2];
 button.disabled=true;
 try{
  if(!Number.isInteger(chapter)||chapter>book.chapterCount||!Number.isInteger(verse)||verse>176)
   throw Error("Invalid source target");
  const chapterIndex=await getJson(snapshotRoot(book)+"index/"+book.code+"/"+chapter+".json");
  if(chapterIndex?.canonical_chapter!==book.code+"."+chapter||Number(chapterIndex.verse_count)<verse)
   throw Error("Target not in canonical published chapter");
  const trail=root.SOTWReaderTrail?.capture("search");
  const wasSame=state.book===book.code&&state.chapter===chapter;
  const before={book:state.book,chapter:state.chapter,verse:state.verse};
  state.book=book.code;state.chapter=chapter;state.verse=verse;
  document.getElementById("book").value=book.code;
  betaCloseSheet();
  if(wasSame&&state.bible)chooseVerse(verse);else await loadBook(false);
  if(!state.bible||state.book!==book.code||state.chapter!==chapter||
     !state.bible.verses?.some(v=>Number(v.verse)===verse))
   throw Error("Selected edition has no verified target");
  chooseVerse(verse);
  searchInput.blur();searchModal.veil.classList.remove("is-open");
  modernJumpToVerse(verse);
  root.SOTWReaderTrail?.commit(trail);
  button.disabled=false; // Returning to search must allow reopening the same citation.
 }catch(error){
  button.disabled=false;
  button.textContent="Unable to open this passage in "+state.edition+". Try again.";
 }
}
const sourceDisclosure=document.createElement("details");sourceDisclosure.className="more-resource";sourceDisclosure.id="universalSearchAttribution";
sourceDisclosure.append(textNode("summary","","Bible Questions · unfoldingWord v91"));
sourceDisclosure.append(textNode("p","","unfoldingWord Translation Questions (en_tq), version 91, licensed CC BY-SA 4.0. Original published question and answer text is shown without fact-checking or theological endorsement. Search rankings are retrieval aids, not proof of an interpretation."));
const urls=[
 ["Original source (v91)","https://git.door43.org/unfoldingWord/en_tq/releases/tag/v91"],
 ["License · CC BY-SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/"],
 ["SOTW source attribution","https://github.com/Stewards-of-the-Way/bible-foundation/blob/b4a7702a8bb1f7410514b7f44663c49ecfd25d33/data/unfoldingword/v91/attribution.json"]];
const linkbox=document.createElement("div");linkbox.className="more-resource-links";
for(const [label,url] of urls){const a=textNode("a","",label);a.href=url;a.target="_blank";a.rel="noopener noreferrer";linkbox.append(a)}
sourceDisclosure.append(linkbox);
sourcesHeading.after(sourceDisclosure);
const shared=root.SOTWDiscoveryCore;
function questionCitations(parent,row){
 for(const target of row[3]||[]){
  const [code,chapter,first,end]=target;
  const book=bookOf(code),last=end==null||end===0?first:Number(end);
  if(!book||!Number.isInteger(chapter)||chapter<1||chapter>book.chapterCount||!Number.isInteger(first)||first<1||!Number.isInteger(last)||last<first||last>176)continue;
  const scopes=Array.from({length:last-first+1},(_,i)=>code+'.'+chapter+'.'+(first+i));
  const before=parent.children.length;
  if(shared.renderCitation(parent,{raw:reference(target),scopes})){
   parent.children[before]?.querySelector('.discovery-inline-trigger')?.classList.add('universal-qa-ref');
  }
 }
}
function questionRow(cluster){
 const row=cluster[0],card=textNode('details','universal-qa-card shared-qa-row','');
 card.dataset.qaId=row[0];
 card.dataset.searchEvidence=JSON.stringify(cluster.map(q=>({type:'question',id:q[0],relationship:'PUBLISHED_QUESTION_CITATION',targets:q[3].map(t=>({book:t[0],chapter:t[1],verse:t[2]}))})));
 card.append(textNode('summary','universal-qa-question',row[1]));
 const content=textNode('div','shared-qa-content','');
 content.append(textNode('p','universal-qa-answer',row[2]));
 questionCitations(content,row);
 if(cluster.length>1){
  const more=textNode('details','universal-qa-variants','');
  more.append(textNode('summary','',cluster.length-1+' more questions with this same published answer'));
  for(const variant of cluster.slice(1)){
   const item=textNode('div','universal-qa-variant','');
   item.append(textNode('p','',variant[1]));questionCitations(item,variant);more.append(item);
  }
  shared.resetDisclosure(more);content.append(more);
 }
 card.append(content);shared.resetDisclosure(card);return card;
}
function questionList(parent,groups,initial){
 const listings=textNode('div','universal-qa-results','');parent.append(listings);
 groups.forEach((cluster,i)=>{const row=questionRow(cluster);row.hidden=i>=initial;listings.append(row);});
 if(groups.length>initial){
  const more=textNode('button','universal-qa-show-more shared-qa-more','Show '+(groups.length-initial)+' more questions ↓');
  more.type='button';more.setAttribute('aria-expanded','false');
  more.addEventListener('click',()=>{
   const expand=more.getAttribute('aria-expanded')!=='true';
   Array.from(listings.children).slice(initial).forEach(row=>{
    row.hidden=!expand;if(!expand){row.querySelectorAll('.discovery-inline-close').forEach(b=>b.click());row.querySelectorAll('details[open]').forEach(x=>x.open=false);row.open=false;}
   });
   more.setAttribute('aria-expanded',String(expand));more.textContent=expand?'Show fewer questions ↑':'Show '+(groups.length-initial)+' more questions ↓';
  });
  parent.append(more);
 }
}

function render(matches){
 document.querySelectorAll('.universal-qa-section').forEach(e=>e.remove());
 if(!matches.length)return;
 const clusters=new Map();
 for(const {row} of matches){
  const key=normalize(row[2]);if(!clusters.has(key))clusters.set(key,[]);clusters.get(key).push(row);
 }
 const groups=[...clusters.values()];
 const host=textNode('section','universal-qa-section','');
 host.append(textNode('h4','universal-qa-heading','Bible Questions'));
 questionList(host,groups,5);
 shared.sourceLink(host,sourceDisclosure,'About the unfoldingWord source');
 const chapter=searchResults.querySelector('.reader-current-chapter-search');
 if(chapter)searchResults.insertBefore(host,chapter);else searchResults.append(host);
}
function stillCurrent(n,q){return n===request&&searchInput.value.trim()===q&&searchModal.veil.classList.contains("is-open")}
searchInput.addEventListener("input",()=>{
 const n=++request,q=searchInput.value.trim();clearTimeout(timer);
 document.querySelectorAll(".universal-qa-section,.universal-qa-status").forEach(e=>e.remove());
 if(q.length<3||typeof modernParseReference==="function"&&modernParseReference(q))return;
 timer=setTimeout(async()=>{
  if(!stillCurrent(n,q))return;
  const status=textNode("p","universal-qa-status","Searching published Bible Questions…");searchResults.append(status);
  try{
   const records=await index();
   if(!stillCurrent(n,q))return;
   status.remove();render(rank(records,q,15));
  }catch(_){
   if(stillCurrent(n,q))status.textContent="Bible Questions are temporarily unavailable. Scripture and other sources remain accessible.";
  }
 },240);
});
searchNote.textContent="Find a Scripture address, Historical Bible Topic, Bible Question, or Jacob Lannom commentary.";
searchInput.placeholder="John 3:16, Abraham, Moses snake on stick, or Topics";

/* Optional source-linked questions while studying a verse. Scripture stays primary. */
const qaVerseSection=textNode("section","discovery-study","");
qaVerseSection.id="sotwVerseQuestions";
const qaVerseButton=textNode("button","discovery-launch","");
qaVerseButton.type="button";
qaVerseButton.replaceChildren(textNode("span","discovery-launch-label","Bible Questions"),
 textNode("small","discovery-launch-meta","For this Scripture verse ›"));
qaVerseSection.append(qaVerseButton);
const qaVerseBody=textNode("div","discovery-verse-body","");
qaVerseBody.hidden=true;qaVerseSection.append(qaVerseBody);
modernCommentaryMenu.before(qaVerseSection);

const verseSource="https://raw.githubusercontent.com/Stewards-of-the-Way/bible-foundation/"+
 "b4a7702a8bb1f7410514b7f44663c49ecfd25d33/data/unfoldingword/v91/qa/by-verse/";
let qaVerseGeneration=0;
const validStudy=(n,book,chapter,verse,edition)=>n===qaVerseGeneration&&
 document.body.classList.contains("study-open")&&state.book===book&&
 state.chapter===chapter&&modernStudyVerse===verse&&state.edition===edition&&qaVerseBody.isConnected;
async function openVerseQuestions(){
 if(!qaVerseBody.hidden){++qaVerseGeneration;qaVerseBody.hidden=true;qaVerseBody.replaceChildren();qaVerseButton.setAttribute("aria-expanded","false");return}
 const book=state.book,chapter=state.chapter,verse=modernStudyVerse,edition=state.edition,n=++qaVerseGeneration;
 if(!Number.isInteger(verse)||verse<1||!BOOKS.some(x=>x.code===book&&chapter>=1&&chapter<=x.chapterCount))return;
 qaVerseBody.hidden=false;qaVerseButton.setAttribute("aria-expanded","true");qaVerseBody.replaceChildren(textNode("p","discovery-note","Loading questions indexed to this verse…"));
 try{
  const [reverse,records]=await Promise.all([json(verseSource+book+".json"),index()]);
  if(!validStudy(n,book,chapter,verse,edition))return;
  if(state.bible?.book_code!==book||Number(state.bible.chapter)!==chapter||
   state.bible.edition_id!==edition||!state.bible.verses?.some(v=>Number(v.verse)===verse))
   throw Error("Selected edition verse not verified");
  const rows=verseQuestions(reverse,records,book,chapter,verse);
  qaVerseBody.replaceChildren();
  if(!rows.length){qaVerseBody.append(textNode("p","discovery-note","No published Bible Questions are indexed to this exact verse."));return}
  questionList(qaVerseBody,rows.map(row=>[row]),5);
  shared.sourceLink(qaVerseBody,sourceDisclosure,'About the unfoldingWord source');
 }catch(_){if(validStudy(n,book,chapter,verse,edition))qaVerseBody.replaceChildren(
   textNode("p","discovery-error","Verse-linked questions could not be verified. Scripture and other tools are unaffected."))}
}
qaVerseButton.setAttribute("aria-expanded","false");qaVerseButton.addEventListener("click",openVerseQuestions);
const priorQAOpen=betaOpen,priorQAClose=betaCloseSheet;
betaOpen=function(...args){++qaVerseGeneration;qaVerseBody.hidden=true;qaVerseBody.replaceChildren();qaVerseButton.setAttribute("aria-expanded","false");return priorQAOpen(...args)};
betaCloseSheet=function(...args){++qaVerseGeneration;qaVerseBody.hidden=true;qaVerseBody.replaceChildren();qaVerseButton.setAttribute("aria-expanded","false");return priorQAClose(...args)};
root.SOTWUniversalSearch={
 openVerseQuestions,
 reload:()=>{rows=null;loading=null},
 sourceStatus:"SOURCE_RECORD_UNALTERED_NOT_INDEPENDENTLY_FACT_CHECKED",
 questionsByIds:()=>index(),
 searchCandidates:async(query,limit=8)=>rank(await index(),query,Math.min(12,Math.max(1,limit))),
 navigateToTarget:(target,button)=>navigate([null,null,null,[target]],button)
};
})(typeof globalThis==="object"?globalThis:this);
