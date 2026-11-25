/* Desktop presentation only. Mobile study and navigation functions remain authoritative. */
(()=>{
"use strict";
const media=matchMedia('(min-width:1100px) and (pointer:fine)');
const line=document.querySelector('#modernReaderHeader .location-line');
const edition=document.getElementById('readerEdition');
const panel=document.querySelector('section[aria-label="Commentary comparison"]');
if(!line||!edition||!panel)return;
const nav=document.createElement('div');nav.id='desktopPassage';nav.hidden=true;nav.style.display='none';
const empty=document.createElement('p');empty.id='desktopStudyEmpty';empty.hidden=true;empty.textContent='Select a verse to explore available study tools.';
const keys=['book','chapter','verse'];
const controls=keys.map(key=>{const s=document.createElement('select');s.setAttribute('aria-label',key[0].toUpperCase()+key.slice(1));s.id='desktop-'+key;nav.append(s);return s});
const anchors=['sotwReturnGroup','sotwTrail'].map(id=>document.getElementById(id)).filter(Boolean).map(node=>({node,marker:document.createComment('desktop return anchor')}));
let active=false;
function sync(){
 if(!active)return;
 keys.forEach((key,i)=>{const source=document.getElementById(key),target=controls[i];if(!source)return;
 const signature=Array.from(source.options).map(o=>o.value+':'+o.textContent).join('|');
 if(target.dataset.signature!==signature){target.replaceChildren(...Array.from(source.options,o=>new Option(o.textContent,o.value)));target.dataset.signature=signature}
 target.value=source.value;target.disabled=source.disabled||!source.options.length;
 });
}
const update=modernUpdateHeader;modernUpdateHeader=function(...args){const result=update.apply(this,args);sync();return result};
const open=betaOpen;betaOpen=function(...args){if(active)readerView.querySelectorAll('.is-studying').forEach(el=>el.classList.remove('is-studying'));const result=open.apply(this,args);sync();return result};
const close=betaCloseSheet;betaCloseSheet=function(...args){const result=close.apply(this,args);sync();return result};
controls.forEach((control,i)=>control.addEventListener('change',()=>{
 if(!active)return;const source=document.getElementById(keys[i]);if(!source)return;
 if(i===2){const n=Number(control.value);if(!modernSourceVerse(n))return;modernJumpToVerse(n);modernStudyVerse=n;chooseVerse(n);betaOpen();}
 else{betaCloseSheet();source.value=control.value;source.dispatchEvent(new Event('change',{bubbles:true}));}
}));
const observer=new MutationObserver(sync);
function apply(){
 if(media.matches===active)return;
 active=media.matches;document.body.classList.toggle('desktop-workspace',active);
 if(active){
 line.insertBefore(nav,line.firstChild);nav.hidden=false;nav.style.removeProperty('display');
 panel.append(empty);empty.hidden=false;
 anchors.forEach(({node,marker})=>{node.before(marker);edition.before(node)});
 keys.forEach(key=>{const node=document.getElementById(key);if(node)observer.observe(node,{childList:true,subtree:true,attributes:true})});
 sync();
 }else{
 observer.disconnect();nav.remove();empty.remove();anchors.forEach(({node,marker})=>{if(marker.parentNode)marker.replaceWith(node)});
 }
}
media.addEventListener('change',apply);apply();
})();