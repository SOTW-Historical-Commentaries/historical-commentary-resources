/* SOTW reader contextual passage return: UI-only, no source-data mutations. */
(function(){
'use strict';
const header=document.querySelector('#modernReaderHeader .modern-inner');
const reader=document.getElementById('verses');
const line=header?.querySelector('.location-line');
if(!line||!reader||typeof chooseVerse!=='function'||typeof loadBook!=='function')return;
const css=document.createElement('style');
css.textContent=[
 '.mobile-beta #sotwReturnGroup{display:inline-flex;align-items:stretch;max-width:100%;min-height:29px;margin-top:5px;border:1px solid #536b72;border-radius:999px;background:#24343c;color:#d9e8ec;overflow:hidden}',
 '.mobile-beta #sotwReturnGroup[hidden]{display:none!important}',
 '.mobile-beta #sotwReturnToPassage{display:inline-flex;align-items:center;gap:6px;max-width:min(280px,70vw);min-width:0;padding:5px 10px;border:0;background:transparent;color:inherit;font:600 12px/1.25 system-ui;cursor:pointer}',
 '.mobile-beta #sotwReturnToPassage[hidden],.mobile-beta #sotwReturnStatus[hidden]{display:none!important}',
 '.mobile-beta #sotwReturnToPassage span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
 '.mobile-beta #sotwReturnToPassage svg{width:13px;height:13px;flex:none}',
 '.mobile-beta #sotwReturnDismiss{min-width:34px;padding:4px 10px;border:0;border-left:1px solid #536b72;background:transparent;color:inherit;font:600 16px/1.25 system-ui;cursor:pointer}',
 '.mobile-beta #sotwReturnGroup button:hover{background:#304751}',
 '.mobile-beta #sotwReturnGroup button:focus-visible{outline:3px solid #dfa94f;outline-offset:-3px}',
 '.mobile-beta #sotwReturnToPassage:disabled{opacity:.65;cursor:wait}',
 '.mobile-beta.beta-light #sotwReturnGroup{background:#edf4f2;color:#304a50;border-color:#b7c9c8}',
 '.mobile-beta.beta-light #sotwReturnGroup button:hover{background:#e0edeb}',
 '.mobile-beta.beta-light #sotwReturnDismiss{border-left-color:#b7c9c8}',
 '.mobile-beta #sotwReturnStatus{margin:5px 0 0;font:12px/1.4 system-ui;color:#fac8a8}'
].join('');document.head.append(css);
const returnGroup=document.createElement('div');returnGroup.id='sotwReturnGroup';returnGroup.hidden=true;
const button=document.createElement('button');button.id='sotwReturnToPassage';button.type='button';button.hidden=true;
button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m15 18-6-6 6-6"/></svg>';
const label=document.createElement('span');button.append(label);
const dismiss=document.createElement('button');dismiss.id='sotwReturnDismiss';dismiss.type='button';
dismiss.textContent='×';dismiss.setAttribute('aria-label','Dismiss original verse return');
returnGroup.append(button,dismiss);
const status=document.createElement('p');status.id='sotwReturnStatus';status.hidden=true;status.setAttribute('role','status');
line.after(returnGroup,status);
let origin=null,pending=null,busy=false,pendingTimer=0,statusTimer=0;
function same(a,b){return !!a&&!!b&&a.book===b.book&&a.chapter===b.chapter&&a.verse===b.verse&&a.edition===b.edition;}
function snapshot(){
 if(!state.bible||!state.index)return null;
 let verse=Number(state.verse)||1;
 if(document.body.classList.contains('study-open')&&Number(modernStudyVerse)>0)verse=Number(modernStudyVerse);
 else{
  const view=reader.getBoundingClientRect();
  const first=[...reader.querySelectorAll('button.reader-verse[data-verse]')].find(el=>el.getBoundingClientRect().bottom>view.top+7);
  if(first)verse=Number(first.dataset.verse)||verse;
 }
 return {book:state.book,chapter:state.chapter,verse,edition:state.edition,scrollTop:reader.scrollTop};
}
function passage(p){const b=BOOKS.find(x=>x.code===p.book);return (b?.name||p.book)+' '+p.chapter+':'+p.verse;}
function display(){
 if(origin&&same(origin,{book:state.book,chapter:state.chapter,verse:state.verse,edition:state.edition}))origin=null;
 returnGroup.hidden=!origin;button.hidden=!origin;
 if(origin){label.textContent='Back to '+passage(origin);button.setAttribute('aria-label','Return to original reading: '+passage(origin));}
}
function failure(text){clearTimeout(statusTimer);status.textContent=text;status.hidden=false;statusTimer=setTimeout(()=>status.hidden=true,6500);}
function arm(){
 if(origin||pending||busy)return;
 pending=snapshot();
 if(pending){clearTimeout(pendingTimer);pendingTimer=setTimeout(()=>{pending=null;},30000);}
}
const oldChooseVerse=chooseVerse;
chooseVerse=function(n){
 const result=oldChooseVerse.call(this,n);
 if(state.bible?.verses?.some(v=>Number(v.verse)===Number(n))){
  if(pending){
   if(!same(pending,{book:state.book,chapter:state.chapter,verse:state.verse,edition:state.edition}))origin=origin||pending;
   pending=null;clearTimeout(pendingTimer);
  }
  display();
 }
 return result;
};
async function verified(book,chapter,verse){
 const b=BOOKS.find(x=>x.code===book);
 if(!b||!Number.isInteger(chapter)||chapter<1||chapter>b.chapterCount||!Number.isInteger(verse)||verse<1)return false;
 const idx=await getJson(snapshotRoot(b)+'index/'+b.code+'/'+chapter+'.json');
 return idx?.canonical_chapter===b.code+'.'+chapter&&Number(idx.verse_count)>=verse;
}
function loadedSnapshot(){
 if(!state.index||!state.bible)return null;
 return {book:state.book,chapter:state.chapter,verse:state.verse,
  edition:state.edition,index:state.index,bible:state.bible,scrollTop:reader.scrollTop};
}
function restoreLoaded(previous){
 if(!previous)return;
 state.book=previous.book;state.chapter=previous.chapter;state.verse=previous.verse;
 state.edition=previous.edition;state.index=previous.index;state.bible=previous.bible;
 document.getElementById('book').value=previous.book;
 document.getElementById('edition').value=previous.edition;
 fillNumbers(document.getElementById('chapter'),
  BOOKS.find(b=>b.code===previous.book).chapterCount,previous.chapter);
 fillNumbers(document.getElementById('verse'),Number(previous.index.verse_count),previous.verse);
 chooseVerse(previous.verse);
 reader.scrollTop=previous.scrollTop;
}
function chapterMatches(book,chapter,verse){
 return state.book===book&&state.chapter===chapter&&state.verse===verse&&
  state.index?.canonical_chapter===book+'.'+chapter&&
  state.bible?.book_code===book&&Number(state.bible?.chapter)===chapter&&
  state.bible?.edition_id===state.edition&&
  state.bible?.verses?.some(v=>Number(v.verse)===verse);
}
async function navigate(book,chapter,verse){
 const sameChapter=state.book===book&&state.chapter===chapter;
 state.book=book;state.chapter=chapter;state.verse=verse;
 document.getElementById('book').value=book;
 if(sameChapter&&chapterMatches(book,chapter,verse))chooseVerse(verse);
 else await loadBook(false);
 // A failed remote request must NEVER make old Matthew text appear
 // beneath a changed Genesis book selector or create a false return.
 if(!chapterMatches(book,chapter,verse))return false;
 modernJumpToVerse(verse);return true;
}
async function follow(anchor){
 if(busy)return;
 const url=new URL(anchor.href,location.href),book=url.searchParams.get('book'),chapter=Number(url.searchParams.get('chapter')),verse=Number(url.searchParams.get('verse'));
 const saved=origin||snapshot();if(!saved)return;
 const prior=loadedSnapshot();
 const trail=anchor.classList.contains('discovery-citation')?
 SOTWReaderTrail.capture(anchor.closest('#sotwVerseTopicsBody')?'study-topic':'topic',anchor):null;
 busy=true;
 try{
  if(!await verified(book,chapter,verse))throw Error('Invalid Scripture reference');
  betaCloseSheet();document.querySelector('#sotwDiscoveryDetail')?.classList.remove('is-open');
  if(!await navigate(book,chapter,verse))throw Error('Could not load passage');
  if(!origin&&!same(saved,{book,chapter,verse,edition:state.edition}))origin=saved;
  if(trail)SOTWReaderTrail.commit(trail);
  display();
 }catch(_){
  restoreLoaded(prior);
  failure('This Scripture passage could not be opened. The previous passage was restored.');
 }
 finally{busy=false;}
}
async function goBack(){
 if(!origin||busy)return false;
 const saved={...origin},prior=loadedSnapshot();busy=true;button.disabled=true;
 try{
  if(!await verified(saved.book,saved.chapter,saved.verse))throw Error('Original passage unavailable');
  betaCloseSheet();document.querySelector('#sotwDiscoveryDetail')?.classList.remove('is-open');
  document.querySelector('#readerSearchModal')?.classList.remove('is-open');
  state.edition=saved.edition;document.getElementById('edition').value=saved.edition;
  if(!await navigate(saved.book,saved.chapter,saved.verse))throw Error('Original passage unavailable');
  reader.scrollTop=saved.scrollTop;
  origin=null;pending=null;clearTimeout(pendingTimer);display();
  return true;
 }catch(_){
  restoreLoaded(prior);
  failure('Could not return to the saved passage. The return link remains available.');
  return false;
 }
 finally{busy=false;button.disabled=false;}
}
window.SOTWReaderReturn={
 async returnToStudySource(snapshot){
  const matches=()=>state.book===snapshot.book&&state.chapter===snapshot.chapter&&
   state.verse===snapshot.verse&&state.edition===snapshot.edition&&
   state.index?.canonical_chapter===snapshot.book+'.'+snapshot.chapter&&
   Number(state.index?.verse_count)>=snapshot.verse&&
   state.bible?.book_code===snapshot.book&&
   Number(state.bible?.chapter)===snapshot.chapter&&
   state.bible?.edition_id===snapshot.edition;
  if(matches())return true;
  // Reuse the source-verified original-verse return when it is active.
  if(origin&&same(origin,snapshot))return !!await goBack()&&matches();
  if(origin||busy)return false;
  // Dismissing the Scripture chip must not disable its separate Topic return.
  // Verify the published source independently; never resurrect an unverified passage.
  const prior=loadedSnapshot();busy=true;
  try{
   if(!await verified(snapshot.book,snapshot.chapter,snapshot.verse))throw Error('Topic source unavailable');
   betaCloseSheet();document.querySelector('#sotwDiscoveryDetail')?.classList.remove('is-open');
   document.querySelector('#readerSearchModal')?.classList.remove('is-open');
   state.edition=snapshot.edition;document.getElementById('edition').value=snapshot.edition;
   if(!await navigate(snapshot.book,snapshot.chapter,snapshot.verse))throw Error('Topic source unavailable');
   return matches();
  }catch(_){
   restoreLoaded(prior);
   failure('Could not return to the saved topic Scripture. The topic link remains available.');
   return false;
  }finally{busy=false;}
 }
};
dismiss.addEventListener('click',()=>{
 // Dismiss only the optional return destination; leave the currently viewed Scripture in place.
 origin=null;pending=null;clearTimeout(pendingTimer);clearTimeout(statusTimer);
 status.hidden=true;display();
});
button.addEventListener('click',goBack);
document.addEventListener('click',event=>{
 if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey)return;
 const node=event.target instanceof Element?event.target:null;
 const anchor=node?.closest('a.jacob-passage-link');
 if(anchor){
  const url=new URL(anchor.href,location.href);
  if(url.origin!==location.origin||!url.pathname.startsWith(location.pathname.replace(/index\.html$/,'')))return;
  event.preventDefault();follow(anchor);return;
 }
 const hit=node?.closest('button.search-hit,button.discovery-citation');
 if(hit&&!hit.classList.contains('discovery-hit'))arm();
},true);
/* Per-tab origin only. Incoming deep links have no fabricated return target. */
display();
})();