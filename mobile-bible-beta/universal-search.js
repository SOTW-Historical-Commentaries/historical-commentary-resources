/* Universal Search v1: evidence-linked unfoldingWord v91 Bible Questions.
   Source is precomputed from pinned published en_tq, not a web crawler.
   Existing Scripture, Bible Topics and Jacob search remain independent.
   Historical people/place master stays excluded; the approved subset is indexed separately. */
(function(root){
"use strict";
const STOP=new Set(["a","an","and","are","as","at","be","by","did","do","does","for","from","how","i","in","is","it","of","on","or","the","to","was","were","what","when","where","which","who","why","with","would","you"]);
const ALIASES={snake:["serpent"],serpent:["snake"],stick:["pole","staff","rod"],pole:["stick","staff"],bronze:["brass","brazen"],brass:["bronze","brazen"],raised:["lifted","lift"],lifted:["raised","lift"],cross:["crucified"],jesus:["christ"],christ:["jesus"],forgive:["forgiveness"],forgiveness:["forgive"],resurrection:["raised","rise"]};
function normalize(value){return String(value||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g," ").trim()}
function words(value){return [...new Set(normalize(value).split(" ").filter(t=>t.length>1&&!STOP.has(t)))]}
function near(a,b){if(a===b)return true;if(Math.abs(a.length-b.length)>1||a.length<4||b.length<4)return false;let i=0,j=0,m=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue}if(++m>1)return false;if(a.length>b.length)i++;else if(b.length>a.length)j++;else{i++;j++}}return m+(a.length-i)+(b.length-j)<=1}
function tokenMatch(term,set){
 if(set.has(term))return 1;
 for(const alias of ALIASES[term]||[])if(set.has(alias))return .75;
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
root.SOTWUniversalSearchCore={normalize,words,near,score,rank};
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
 }catch(error){
  button.disabled=false;
  button.textContent="Unable to open this passage in "+state.edition+". Try again.";
 }
}
function openSource(event){
 event.stopPropagation();
 searchModal.veil.classList.remove("is-open");
 moreModal.veil.classList.add("is-open");
 sourceDisclosure.open=true;
 // Open the existing Sources & Attribution section, not an orphan menu item.
 sourceDisclosure.scrollIntoView({block:"nearest"});
 sourceDisclosure.querySelector("summary")?.focus({preventScroll:true});
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
function render(matches){
 document.querySelectorAll(".universal-qa-section").forEach(e=>e.remove());
 if(!matches.length)return;
 // Identical published answers are grouped, never discarded or recast as
 // a new authored answer. Each source question and distinct verse stays available.
 const clusters=new Map();
 for(const {row} of matches){
  const key=normalize(row[2]);
  if(!clusters.has(key))clusters.set(key,[]);
  clusters.get(key).push(row);
 }
 const groups=[...clusters.values()];
 const host=document.createElement("section");host.className="universal-qa-section";
 host.append(textNode("h4","universal-qa-heading",
   "Bible Questions · unfoldingWord ("+matches.length+" matches · "+groups.length+" answers)"));
 const listings=document.createElement("div");listings.className="universal-qa-results";
 function scriptureButton(row,label){
  const ref=textNode("button","search-hit universal-qa-ref",label+" "+row[3].map(reference).filter(Boolean).join(" · ")+" · "+state.edition);
  ref.type="button";ref.addEventListener("click",()=>navigate(row,ref));return ref;
 }
 function cardFor(cluster){
  const row=cluster[0],card=document.createElement("article");
  card.className="universal-qa-card";card.dataset.qaId=row[0];
  const top=document.createElement("div");top.className="universal-qa-top";
  top.append(textNode("span","","Bible Questions · publisher Q&A"));
  const source=textNode("button","universal-qa-source","Source ↗");
  source.type="button";source.addEventListener("click",openSource);top.append(source);
  card.append(top);
  card.append(textNode("h5","universal-qa-question",row[1]));
  card.append(textNode("span","universal-qa-answer-label","Published answer"));
  card.append(textNode("p","universal-qa-answer",row[2]));
  card.append(scriptureButton(row,"Open cited passage:"));
  if(cluster.length>1){
   const more=document.createElement("details");more.className="universal-qa-variants";
   more.append(textNode("summary","",cluster.length-1+" more questions with this same published answer"));
   for(const variant of cluster.slice(1)){
    const item=document.createElement("div");item.className="universal-qa-variant";
    item.append(textNode("p","",variant[1]));
    item.append(scriptureButton(variant,"Open cited passage:"));
    more.append(item);
   }
   card.append(more);
  }
  return card;
 }
 groups.slice(0,5).forEach(cluster=>listings.append(cardFor(cluster)));
 host.append(listings);
 if(groups.length>5){
  const more=document.createElement("button");more.type="button";
  more.className="universal-qa-show-more";
  more.textContent="Show "+(groups.length-5)+" more Bible Questions answers";
  more.addEventListener("click",()=>{
   groups.slice(5).forEach(cluster=>listings.append(cardFor(cluster)));
   more.remove();
  });
  host.append(more);
 }
 // Specific profile first, then Q&A, with incidental current-chapter hits last.
 const chapter=searchResults.querySelector(".reader-current-chapter-search");
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
searchNote.textContent="Find a Bible passage, approved person/place profile, Bible Question, Topic, or Jacob commentary. Scripture-word search currently covers this chapter.";
searchInput.placeholder="John 3:16, Abraham, Moses snake on stick, or Topics";
root.SOTWUniversalSearch={
 reload:()=>{rows=null;loading=null},
 sourceStatus:"SOURCE_RECORD_UNALTERED_NOT_INDEPENDENTLY_FACT_CHECKED",
 questionsByIds:()=>index(),
 navigateToTarget:(target,button)=>navigate([null,null,null,[target]],button)
};
})(typeof globalThis==="object"?globalThis:this);
