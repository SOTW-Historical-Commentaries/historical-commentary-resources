/* Shared chapter-boundary navigation; no new Scripture retrieval path. */
(()=>{
'use strict';
let busy=false;
function neighbor(direction){
 const i=BOOKS.findIndex(b=>b.code===state.book),b=BOOKS[i];
 if(!b)return null;
 const n=state.chapter+direction;
 if(n>=1&&n<=b.chapterCount)return {book:b,chapter:n};
 const other=BOOKS[i+direction];
 return other?{book:other,chapter:direction<0?other.chapterCount:1}:null;
}
async function go(target,origin){
 if(busy||!state.bible||state.bible.book_code!==state.book||Number(state.bible.chapter)!==state.chapter)return;
 if(origin!==state.book+'.'+state.chapter)return;
 busy=true;
 readerView.querySelectorAll('.chapter-boundary button').forEach(b=>b.disabled=true);
 const edition=state.edition;
 const same=state.book===target.book.code;
 try{
  modernStudyVerse=0;betaCloseSheet();modernPendingJump=null;
  state.book=target.book.code;state.chapter=target.chapter;state.verse=1;
  document.getElementById('book').value=state.book;
  if(same){document.getElementById('chapter').value=String(state.chapter);await loadChapter(true);}
  else await loadBook(false);
  if(state.book===target.book.code&&state.chapter===target.chapter&&state.edition===edition&&state.bible?.book_code===state.book&&Number(state.bible.chapter)===state.chapter&&state.bible.edition_id===edition){
   modernStudyVerse=0;betaCloseSheet();
   modernProgrammaticScroll=true;readerView.scrollTop=0;
   requestAnimationFrame(()=>{modernProgrammaticScroll=false;modernGesture.moved=false;modernGesture.scrollTime=0;});
   const first=readerView.querySelector('.reader-verse');first?.focus({preventScroll:true});
  }
 }finally{busy=false;readerView.querySelectorAll('.chapter-boundary button').forEach(b=>b.disabled=false);}
}
function boundary(position){
 const nav=document.createElement('nav');nav.className='chapter-boundary chapter-boundary-'+position;
 nav.setAttribute('aria-label',position==='start'?'Chapter navigation at beginning':'Chapter navigation at end');
 const origin=state.book+'.'+state.chapter;
 for(const direction of [-1,1]){
  const target=neighbor(direction);if(!target)continue;
  const b=document.createElement('button');b.type='button';b.className=direction<0?'chapter-previous':'chapter-next';b.disabled=busy;
  const label=target.book.name+' '+target.chapter;
  b.textContent=direction<0?'‹ '+label:label+' ›';
  b.setAttribute('aria-label',(direction<0?'Previous chapter: ':'Next chapter: ')+label);
  b.addEventListener('click',()=>go(target,origin));nav.append(b);
 }
 return nav;
}
function decorate(){
 if(!state.bible||state.bible.book_code!==state.book||Number(state.bible.chapter)!==state.chapter||!readerView.querySelector('.reader-verse'))return;
 if(readerView.querySelector('.chapter-boundary'))return;
 const top=boundary('start'),bottom=boundary('end');
 readerView.prepend(top);readerView.append(bottom);
}
const previousRender=renderBible;
renderBible=function(...args){const result=previousRender.apply(this,args);decorate();return result;};
decorate();
})();
