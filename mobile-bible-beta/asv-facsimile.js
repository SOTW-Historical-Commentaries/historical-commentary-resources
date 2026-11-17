/* SOTW ASV 1901: original full-page scans from the accepted ASV page-index contract. */
const ASV_SCAN_ROOT='https://raw.githubusercontent.com/SOTW-ASV-1901/asv-1901-resources/main/data/asv1901/';
const asvScanButton=document.createElement('button');asvScanButton.id='asvSourceEntry';
asvScanButton.type='button';asvScanButton.hidden=true;
const asvButtonName=document.createElement('span');asvButtonName.textContent='View original 1901 printed page';
const asvButtonPage=document.createElement('small');asvButtonPage.textContent='›';
asvScanButton.append(asvButtonName,asvButtonPage);
modernStudyCard.after(asvScanButton);
let activeAsvScan=null;
function compareAsvRef(a,b){
 const A=String(a||'').split('.'),B=String(b||'').split('.');
 if(A.length!==3||B.length!==3||A[0]!==B[0])return null;
 const x=[Number(A[1]),Number(A[2])],y=[Number(B[1]),Number(B[2])];
 if([...x,...y].some(n=>!Number.isInteger(n)))return null;
 return x[0]===y[0]?(x[1]===y[1]?0:x[1]<y[1]?-1:1):x[0]<y[0]?-1:1;
}
function scanCovers(page,ref){
 const left=compareAsvRef(page.first_verse,ref),right=compareAsvRef(page.last_verse,ref);
 return page.type==='scripture'&&left!==null&&right!==null&&left<=0&&right>=0&&
 typeof page.volume==='string'&&Number.isInteger(page.volume_pdf_page);
}
function asvScanUrl(ctx,p){
 return ASV_SCAN_ROOT+encodeURIComponent(ctx.slug)+'/facsimile/'+encodeURIComponent(p.volume)+'#page='+p.volume_pdf_page;
}
async function offerAsvScan(){
 asvScanButton.hidden=true;activeAsvScan=null;
 if(state.edition!=='ASV1901'||!modernStudyVerse)return;
 const request=modernStudyRequest,book=state.book,ch=state.chapter,v=modernStudyVerse,slug=bookInfo().slug;
 try{
  const index=await getJson(ASV_SCAN_ROOT+encodeURIComponent(slug)+'/page-index.json');
  if(request!==modernStudyRequest||!document.body.classList.contains('study-open')||
     state.book!==book||state.chapter!==ch||modernStudyVerse!==v||state.edition!=='ASV1901')return;
  if(index.edition_id!=='ASV1901'||index.book_code!==book||!Array.isArray(index.pages))return;
  const ref=book+'.'+ch+'.'+v;
  const found=index.pages.findIndex(p=>scanCovers(p,ref));
  if(found<0)return;
  activeAsvScan={slug,index,pageIndex:found};
  asvScanButton.hidden=false;
  asvButtonPage.textContent='Printed p. '+(index.pages[found].printed_page??'?')+' ›';
 }catch{/* Never display an unverified scan link. */}
}
function renderAsvScanPage(ctx,i){
 const p=ctx.index.pages[i];
 if(!p||p.type!=='scripture'||!p.volume||!Number.isInteger(p.volume_pdf_page))return;
 const previous=studyOverlayBody.querySelector('#asvScanContent');if(previous)previous.remove();
 const root=document.createElement('div');root.id='asvScanContent';
 const meta=document.createElement('p');meta.className='asv-metadata';
 meta.textContent='ASV 1901 · Printed page '+(p.printed_page??'unmarked')+' · Original scan '+p.source_pdf_page+' · '+p.first_verse+' to '+p.last_verse;
 const buttons=document.createElement('div');buttons.className='asv-page-controls';
 const prev=document.createElement('button'),next=document.createElement('button');
 prev.type='button';next.type='button';prev.textContent='← Previous';next.textContent='Next →';
 prev.disabled=i===0;next.disabled=i===ctx.index.pages.length-1;
 prev.addEventListener('click',()=>renderAsvScanPage(ctx,i-1));
 next.addEventListener('click',()=>renderAsvScanPage(ctx,i+1));
 const counter=document.createElement('span');counter.textContent=(i+1)+' / '+ctx.index.pages.length;
 buttons.append(prev,counter,next);
 const link=document.createElement('a');link.className='asv-native-link';
 link.href=asvScanUrl(ctx,p);link.target='_blank';link.rel='noopener noreferrer';
 link.textContent='Open full page · pinch to zoom';
 const tip=document.createElement('p');tip.className='asv-help';
 tip.textContent='This is the complete physical page, not a verse crop. Returning preserves your Scripture location.';
 const preview=document.createElement('iframe');preview.className='asv-pdf-preview';
 preview.title='ASV 1901 scanned page '+(p.printed_page??'');preview.loading='lazy';preview.src=asvScanUrl(ctx,p);
 root.append(meta,buttons,link,tip,preview);studyOverlayBody.append(root);ctx.pageIndex=i;
}
asvScanButton.addEventListener('click',()=>{
 if(state.edition!=='ASV1901'||!activeAsvScan)return;
 openStudyLayer('facsimile','Original ASV · 1901');
 renderAsvScanPage(activeAsvScan,activeAsvScan.pageIndex);
});
const beforeAsvStudyOpen=betaOpen;
betaOpen=function(){beforeAsvStudyOpen();offerAsvScan();};
const beforeAsvStudyClose=betaCloseSheet;
betaCloseSheet=function(){asvScanButton.hidden=true;activeAsvScan=null;beforeAsvStudyClose();};
