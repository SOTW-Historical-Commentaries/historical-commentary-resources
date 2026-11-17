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

/* PDF.js renders a single existing source page to canvas on iPhone, where
   WebKit otherwise leaves an iframe completely white. The original PDF remains
   the authoritative asset and can always be opened directly. */
const SOTW_PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
let asvPdfLibPromise=null;
const asvPdfDocuments=new Map();
let asvRenderSerial=0;
function ensureAsvPdfLib(){
 if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
 if(asvPdfLibPromise)return asvPdfLibPromise;
 asvPdfLibPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src=SOTW_PDFJS+'pdf.min.js';
  script.async=true;
  script.onload=()=>{
   if(!window.pdfjsLib)return reject(Error('PDF renderer unavailable'));
   window.pdfjsLib.GlobalWorkerOptions.workerSrc=SOTW_PDFJS+'pdf.worker.min.js';
   resolve(window.pdfjsLib);
  };
  script.onerror=()=>reject(Error('PDF renderer could not load'));
  document.head.append(script);
 }).catch(e=>{asvPdfLibPromise=null;throw e});
 return asvPdfLibPromise;
}
async function renderAsvCanvas(ctx,p,holder,status,scale,serial,fallback){
 try{
  const lib=await ensureAsvPdfLib();
  const pdfUrl=asvScanUrl(ctx,p).split('#')[0];
  if(!asvPdfDocuments.has(pdfUrl)){
   const task=lib.getDocument({url:pdfUrl,withCredentials:false});
   asvPdfDocuments.set(pdfUrl,task.promise.catch(e=>{asvPdfDocuments.delete(pdfUrl);throw e}));
  }
  const pdf=await asvPdfDocuments.get(pdfUrl);
  if(serial!==asvRenderSerial||!holder.isConnected)return;
  const number=p.volume_pdf_page;
  if(number<1||number>pdf.numPages)throw Error('Page outside scanned volume');
  const page=await pdf.getPage(number);
  if(serial!==asvRenderSerial||!holder.isConnected)return;
  const natural=page.getViewport({scale:1});
  const baseWidth=Math.max(230,Math.min(window.innerWidth-58,680));
  const factor=Math.min(1.8,window.devicePixelRatio||1);
  const viewport=page.getViewport({scale:baseWidth/natural.width*scale*factor});
  const canvas=document.createElement('canvas');
  canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
  canvas.style.width=(viewport.width/factor)+'px';
  canvas.style.height=(viewport.height/factor)+'px';
  canvas.setAttribute('aria-label','Facsimile scan, original printed page '+p.printed_page);
  const context=canvas.getContext('2d',{alpha:false});
  if(!context)throw Error('Canvas unavailable');
  await page.render({canvasContext:context,viewport}).promise;
  if(serial!==asvRenderSerial||!holder.isConnected)return;
  holder.replaceChildren(canvas);
  status.textContent='Original scan ready';
  if(fallback)fallback.hidden=true;
 }catch(err){
  if(serial!==asvRenderSerial||!holder.isConnected)return;
  holder.replaceChildren();
  status.textContent='Inline scan unavailable on this device.';
  if(fallback)fallback.hidden=false;
 }
}
function asvHumanRange(from,to){
 const read=key=>{
  const m=/^([1-3]?[A-Z]{2,3})\.(\d+)\.(\d+)$/.exec(String(key||''));
  if(!m)return null;
  const book=BOOKS.find(b=>b.code===m[1]);if(!book)return null;
  return {name:book.name,chapter:Number(m[2]),verse:Number(m[3])};
 };
 const a=read(from),b=read(to);
 if(!a||!b)return 'Scripture page';
 if(a.name===b.name&&a.chapter===b.chapter)return a.name+' '+a.chapter+':'+a.verse+'–'+b.verse;
 if(a.name===b.name)return a.name+' '+a.chapter+':'+a.verse+' – '+b.chapter+':'+b.verse;
 return a.name+' '+a.chapter+':'+a.verse+' – '+b.name+' '+b.chapter+':'+b.verse;
}
function renderAsvScanPage(ctx,i){
 const p=ctx.index.pages[i];
 if(!p||p.type!=='scripture'||!p.volume||!Number.isInteger(p.volume_pdf_page))return;
 const serial=++asvRenderSerial;
 for(const child of Array.from(studyOverlayBody.children)){
  if(child.id!=='voices')child.remove();
 }
 const root=document.createElement('div');root.id='asvScanContent';
 const meta=document.createElement('p');meta.className='asv-metadata';
 meta.textContent='ASV 1901 · Printed p. '+(p.printed_page??'unmarked')+
  ' · '+asvHumanRange(p.first_verse,p.last_verse);
 const nav=document.createElement('div');nav.className='asv-page-controls';
 const prev=document.createElement('button'),next=document.createElement('button');
 prev.type='button';next.type='button';
 prev.textContent='← Previous page';next.textContent='Next page →';
 const valid=i=>ctx.index.pages[i]?.type==='scripture';
 let before=i-1,after=i+1;
 while(before>=0&&!valid(before))before--;
 while(after<ctx.index.pages.length&&!valid(after))after++;
 prev.disabled=before<0;next.disabled=after>=ctx.index.pages.length;
 prev.addEventListener('click',()=>renderAsvScanPage(ctx,before));
 next.addEventListener('click',()=>renderAsvScanPage(ctx,after));
 const pageCount=document.createElement('span');pageCount.className='asv-metadata';
 pageCount.textContent='Printed '+(p.printed_page??'?');
 nav.append(prev,pageCount,next);
 const direct=document.createElement('a');direct.className='asv-native-link';
 direct.href=asvScanUrl(ctx,p);direct.target='_blank';direct.rel='noopener noreferrer';
 direct.textContent='Open original PDF if the scan cannot be displayed';
 direct.hidden=true; // Keep the source fallback without an oversized top banner.
 const status=document.createElement('p');status.className='asv-metadata asv-render-status';
 status.textContent='Loading original scanned page…';
 const canvasArea=document.createElement('div');canvasArea.className='asv-canvas-area';
 const serialRun=++asvRenderSerial;
 root.append(meta,nav,canvasArea,status,direct);
 studyOverlayBody.append(root);
 ctx.pageIndex=i;
 renderAsvCanvas(ctx,p,canvasArea,status,1,serialRun,direct);
}
asvScanButton.addEventListener('click',()=>{
 if(state.edition!=='ASV1901'||!activeAsvScan)return;
 openStudyLayer('facsimile','Original ASV · 1901');
 renderAsvScanPage(activeAsvScan,activeAsvScan.pageIndex);
});
const beforeAsvStudyOpen=betaOpen;
betaOpen=function(){beforeAsvStudyOpen();offerAsvScan();};
const beforeAsvStudyClose=betaCloseSheet;
betaCloseSheet=function(){++asvRenderSerial;asvScanButton.hidden=true;activeAsvScan=null;beforeAsvStudyClose();};
