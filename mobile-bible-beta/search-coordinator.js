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
function weight(type,query,caption){
 const q=normalize(query),s=normalize(caption);
 if(type==="scripture")return 115;
 if(type==="name")return exactName(query,caption)?125:77;
 if(type==="book")return s===q?112:46;
 if(type==="questions")return q.length>=4&&s.includes(q)?99:84;
 if(type==="topic")return s===q?94:s.startsWith(q)?83:66;
 if(type==="jacob")return /\b(jacob|lannom)\b/.test(q)?101:73;
 return 0;
}
function order(groups,query){
 return groups.map((g,i)=>({...g,originalIndex:i,priority:weight(g.type,query,g.caption)}))
  .sort((a,b)=>b.priority-a.priority||a.originalIndex-b.originalIndex);
}
root.SOTWSearchCoordinatorCore={normalize,exactName,weight,order};
if(typeof document==="undefined"||typeof searchInput==="undefined"||
 typeof searchResults==="undefined"||typeof searchModal==="undefined")return;
const css=document.createElement("style");
css.textContent=".mobile-beta .sotw-search-topics-group{display:grid;gap:7px;min-width:0}" +
 ".mobile-beta .sotw-search-scripture{display:grid;gap:4px;text-align:left;width:100%;" +
 "border:1px solid #7b9195;border-radius:10px;padding:10px 13px;background:transparent;" +
 "color:inherit;font:inherit;cursor:pointer}" +
 ".mobile-beta .sotw-search-scripture strong{font-weight:650;font-size:14px}" +
 ".mobile-beta .sotw-search-scripture small{font-size:12px;opacity:.83}";
document.head.append(css);
let pending=false,latest="";
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
 if(!label)return;
 const group=document.createElement("section");group.className="sotw-search-topics-group";
 label.before(group);group.append(label);
 while(group.nextElementSibling?.classList.contains("discovery-hit"))
  group.append(group.nextElementSibling);
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
function sync(){
 if(!searchModal.veil.classList.contains("is-open"))return;
 const query=searchInput.value.trim();
 if(!query||typeof modernParseReference==="function"&&modernParseReference(query))return;
 wrapHistoricalTopics();
 const nodes=Array.from(searchResults.children).filter(n=>!n.classList.contains("sotw-search-scripture"));
 const described=nodes.map(el=>({el,type:groupType(el),caption:caption(el,groupType(el))}));
 const ordered=order(described,query);
 // Source modules may finish in any network order. One stable sort avoids
 // Q&A prepend, historical append and names prepend racing each other.
 const offset=searchResults.querySelector(":scope > .sotw-search-scripture")?1:0;
 ordered.forEach(({el},i)=>{const position=i+offset;if(searchResults.children[position]!==el)searchResults.insertBefore(el,searchResults.children[position]||null)});
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
function schedule(){
 if(pending)return;pending=true;
 queueMicrotask(()=>{pending=false;sync()});
}
searchInput.addEventListener("input",()=>{latest=searchInput.value.trim();schedule()});
const observer=new MutationObserver(schedule);
observer.observe(searchResults,{childList:true});
root.SOTWSearchCoordinator={version:"scripture-first-v1",refresh:schedule};
})(typeof globalThis==="object"?globalThis:this);
