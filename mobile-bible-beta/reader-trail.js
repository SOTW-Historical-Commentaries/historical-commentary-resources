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
 '.mobile-beta #sotwTrailOpen{min-width:0;max-width:min(280px,73vw);padding:7px 10px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}',
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
 return {kind:'topic',label:heading.textContent.replace(/^Historical Bible Topic\s*·\s*/,'Topic · ').slice(0,65),
   heading:heading.textContent,scroll:panel.scrollTop};
}
function capture(type){return type==='topic'?topicSnapshot():searchSnapshot();}
function paint(){
 group.hidden=!last;
 if(last){open.textContent='↩ Back to '+last.label;
  open.setAttribute('aria-label','Return to previous '+last.label);}
}
function commit(snapshot){
 if(!snapshot)return;
 // Do not save a failed navigation that never left its source context.
 const target=snapshot.kind==='topic'?document.getElementById('sotwDiscoveryDetail'):search;
 if(visible(target))return;
 last=snapshot;paint();
}
function clear(){last=null;paint();}
function restore(){
 if(!last)return false;
 const snap=last;
 const topic=document.getElementById('sotwDiscoveryDetail');
 const panel=topic?.querySelector('.modal-content');
 if(snap.kind==='topic'){
  const heading=panel?.querySelector('.discovery-detail-body .discovery-heading')?.textContent;
  if(!heading||heading!==snap.heading){clear();return false;}
  search.classList.remove('is-open');
  topic.classList.add('is-open');
  requestAnimationFrame(()=>{panel.scrollTop=snap.scroll;});
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
open.addEventListener('click',restore);
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
