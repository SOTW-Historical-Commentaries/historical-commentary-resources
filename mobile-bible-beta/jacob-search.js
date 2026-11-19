/* Published Jacob Lannom commentary discovery in the SOTW mobile reader.
   Searches only reconciled current-commentary.json. No synthetic concepts,
   draft SPP records, doctrine tags or commentary source mutations. */
(function(root){
'use strict';
const normalize=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,' ').trim();
const tokenize=s=>normalize(s).split(/\s+/).filter(Boolean);
const ignored=new Set(['lannom','jacob','pastor','commentary','comments','commentaries','by','from','of','in','on','the','all','show','see','find','about','book']);
function bookHint(tokens,books){
 const hits=[];
 for(const term of tokens){
  if(term.length<3)continue;
  const found=books.filter(b=>normalize(b.name)===term||
    normalize(b.code)===term||normalize(b.name).startsWith(term));
  if(found.length===1)hits.push(found[0].code);
 }
 return new Set(hits).size===1?hits[0]:null;
}
function search(entries,query,books){
 const words=tokenize(query),authorNamed=words.some(w=>w==='lannom'||w==='jacob');
 const matchedBook=bookHint(words,books);
 const tokens=words.filter(w=>!ignored.has(w)&&w.length>=3&&
   !(matchedBook&&books.some(b=>b.code===matchedBook&&
      (normalize(b.name)===w||normalize(b.code)===w||normalize(b.name).startsWith(w)))));
 if(!authorNamed&&!matchedBook&&!tokens.length)return [];
 // An explicit author request can list the full accepted catalog.
 if(!authorNamed&&!matchedBook&&tokens.every(t=>t.length<4))return [];
 const found=[];
 for(const entry of entries||[]){
  if(!entry||typeof entry.scopeKey!=='string'||!String(entry.commentary||'').trim())continue;
  const code=entry.scopeKey.split('.')[0];
  if(matchedBook&&code!==matchedBook)continue;
  const book=books.find(b=>b.code===code);
  if(!book)continue;
  const title=normalize(entry.title),text=normalize(entry.commentary);
  const scope=normalize(entry.scopeKey),bookWords=normalize(book.name);
  if(!tokens.every(t=>title.includes(t)||text.includes(t)||scope.includes(t)||bookWords.includes(t)))continue;
  const score=tokens.reduce((n,t)=>n+(title.includes(t)?8:0)+(scope.includes(t)?5:0)+(text.includes(t)?1:0),0);
  found.push({entry,book,score});
 }
 found.sort((a,b)=>b.score-a.score);
 return found;
}
root.SOTWJacobSearchCore={search,normalize,tokenize,bookHint};
if(typeof document==='undefined'||typeof searchInput==='undefined'||
 typeof searchResults==='undefined'||typeof searchModal==='undefined'||
 typeof BOOKS==='undefined'||typeof getJson!=='function')return;
const css=document.createElement('style');
css.textContent=[
 '.mobile-beta .jacob-search-results{border:1px solid #48616c;border-radius:11px;padding:0 9px 9px;min-width:0}',
 '.mobile-beta .jacob-search-results:not([open]){padding-bottom:0}',
 '.mobile-beta .jacob-search-section{display:list-item;cursor:pointer;font:600 13px/1.4 system-ui;margin:0;padding:13px 6px;color:#b9d9e0}',
 '.mobile-beta .jacob-search-section:focus-visible{outline:2px solid #a6d0d8;outline-offset:-2px}',
 '.mobile-beta .jacob-search-list{display:grid;gap:7px;max-width:100%;min-width:0}',
 '.mobile-beta .jacob-search-hit strong{display:block;font:650 14px/1.35 system-ui;margin-bottom:3px}',
 '.mobile-beta .jacob-search-hit small{font-size:12px;line-height:1.45}',
 '.mobile-beta .jacob-search-more{border:1px solid #5b7780;background:#263b44;color:#ddecf0;border-radius:9px;padding:9px 12px;font:600 13px system-ui;text-align:left}',
 '.mobile-beta.beta-light .jacob-search-results{border-color:#bacfce}',
 '.mobile-beta.beta-light .jacob-search-section{color:#3e6370}',
 '.mobile-beta.beta-light .jacob-search-more{background:#e3edec;color:#314f56;border-color:#a5baba}'
].join('');
document.head.append(css);
let generation=0,loading=null;
async function published(){
 if(!loading)loading=getJson('../api/jacob-lannom/v1/current-commentary.json').then(data=>{
  if(data?.authorId!=='jacob-lannom'||!Array.isArray(data.entries)||
     !data.entries.every(e=>e&&typeof e.scopeKey==='string'&&typeof e.commentary==='string'))
   throw Error('Invalid published Jacob commentary');
  return data.entries;
 }).catch(e=>{loading=null;throw e;});
 return loading;
}
function entryReference(entry,book){
 const p=typeof parseScope==='function'?parseScope(entry.scopeKey):null;
 const chapter=p?.chapter||1,verse=p?.from||1;
 return {book:book.code,chapter,verse,scope:entry.scopeKey,
  display:book.name+(p?.chapter?' '+chapter+(p?.from?':'+p.from:''):' · Book overview')};
}
async function openEntry(item,button){
 const entry=item.entry,p=entryReference(entry,item.book);
 if(!Number.isInteger(p.chapter)||p.chapter<1||p.chapter>item.book.chapterCount||
    !Number.isInteger(p.verse)||p.verse<1)return;
 button.disabled=true;
 try{
  const index=await getJson(snapshotRoot(item.book)+'index/'+p.book+'/'+p.chapter+'.json');
  if(index?.canonical_chapter!==p.book+'.'+p.chapter||Number(index.verse_count)<p.verse)
   throw Error('Published chapter/verse not verified');
  const trail=SOTWReaderTrail.capture('search');
  searchInput.blur();searchModal.veil.classList.remove('is-open');
  betaCloseSheet();
  const same=state.book===p.book&&state.chapter===p.chapter;
  state.book=p.book;state.chapter=p.chapter;state.verse=p.verse;
  document.getElementById('book').value=p.book;
  if(same&&state.bible)chooseVerse(p.verse);else await loadBook(false);
  if(!state.bible||state.book!==p.book||state.chapter!==p.chapter||
     state.verse!==p.verse||state.bible.book_code!==p.book)return;
  modernJumpToVerse(p.verse);
  // Use the published, exact author scope even for a chapter introduction
  // or a book overview, which need not have a verse-level Jacob marker.
  modernStudyVerse=p.verse;betaOpen();
  openAuthorCommentary({id:'jacob-lannom',name:'Jacob Lannom',
   kind:'Pastoral Commentary',scopeKey:entry.scopeKey});
  SOTWReaderTrail.commit(trail);
 }catch(_){
  button.disabled=false;
  button.textContent='Unable to open this published passage. Try again.';
 }
}
function render(results,query){
 if(!results.length)return;
 const words=tokenize(query);
 const expandAll=words.includes('all')&&words.some(w=>w==='lannom'||w==='jacob');
 // One collapsible author section, regardless of the number of results.
 // Explicit "Lannom all" opens the full list; ordinary author/book/topic
 // searches show a compact count until the reader chooses to expand.
 const host=document.createElement('details');host.className='jacob-search-results';
 host.open=expandAll;
 const title=document.createElement('summary');title.className='jacob-search-section';
 title.textContent='Jacob Lannom · Published pastoral commentary ('+results.length+')';
 title.setAttribute('aria-label','Toggle '+results.length+' published Jacob Lannom commentary results');
 host.append(title);
 const list=document.createElement('div');list.className='jacob-search-list';host.append(list);
 for(const item of results){
  const b=document.createElement('button');b.type='button';b.className='search-hit jacob-search-hit';
  b.dataset.jacobScope=item.entry.scopeKey;
  const name=document.createElement('strong');name.textContent=item.entry.title;
  const caption=document.createElement('small');
  const p=entryReference(item.entry,item.book);
  caption.textContent=p.display+' · '+(item.entry.scopeType==='BOOK_OVERVIEW'?'Book overview':
   item.entry.scopeType==='CHAPTER_INTRODUCTION'?'Chapter introduction':'Passage commentary');
  b.append(name,caption);
  b.addEventListener('click',()=>openEntry(item,b));list.append(b);
 }
 searchResults.append(host);
}
searchInput.addEventListener('input',async()=>{
 const current=++generation;
 const raw=searchInput.value.trim();
 if(!raw||typeof modernParseReference==='function'&&modernParseReference(raw))return;
 try{
  const entries=await published();
  if(current!==generation||raw!==searchInput.value.trim()||
     !searchModal.veil.classList.contains('is-open'))return;
  const results=search(entries,raw,BOOKS);
  render(results,raw);
 }catch(_){/* Search remains usable when the author catalog cannot be loaded. */}
});
})(typeof globalThis==='object'?globalThis:this);
