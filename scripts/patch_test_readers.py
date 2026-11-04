#!/usr/bin/env python3
"""Read-only-source transformation of FOUR disposable SOTW review pages.

Publishes patched test-reader HTML only. Does not edit deployed GitHub or
historical source JSON; uses the new P navigation coverage overlay.
"""
import argparse
import zipfile
from pathlib import Path
FILES={
'GEN': ('SOTW_Structured_Commentary_Genesis_v3_Staging_Pilot.zip','review-v3.html','Genesis'),
'EXO': ('SOTW_Structured_Commentary_Exodus_v3_Staging_Pilot.zip','review-exodus-v3.html','Exodus'),
'LEV': ('SOTW_Structured_Commentary_Leviticus_v3_Staging_Pilot.zip','review-leviticus-v3.html','Leviticus'),
'NUM': ('SOTW_Structured_Commentary_Numbers_v3_Staging_Pilot.zip','review-numbers-v3.html','Numbers'),
}

RENDER_PANE='''async function renderPane(which){
 const author=$(which).value;
 const data=await get(dataPath('authors',author,chapter));
 if(data.canonical_chapter!=='__BOOK__.'+chapter)throw Error('Source chapter mismatch for '+author);
 const sections=(coverage.author_sections[author]||[]).filter(s=>eligibleForCurrentVerse(s));
 const pane=$('pane-'+which);pane.replaceChildren();const head=node('div',null,'panel-head');const name=catalog.authors[author]||{display_name:author,life_dates:'',geographic_association:''};const ar=node('div',null,'author-line');ar.append(node('h2',name.display_name));let caption=name.life_dates+' · '+name.geographic_association;ar.append(node('span',caption,'byline'));const workTitle=author==='john-calvin'?'Calvin’s Collected Commentaries':(name.historical_work||data.source.module_title||data.source.source_work_title||'Historical commentary');head.append(ar);head.append(node('div',workTitle+' · Servants of the Way Commentary Library','edition'));metaMore(head,name);pane.append(head);
 const bar=node('div',null,'mode');const lab=node('label','Content to read');lab.htmlFor=which+'-mode';bar.append(lab);const sel=node('select');sel.id=which+'-mode';sel.setAttribute('aria-label','Select commentary or introduction for '+name.display_name);opt(sel,'verse','Verse commentary · __LABEL__ '+chapter+':'+$('verse').value);const seen=new Set();for(const s of sections){if(seen.has(s.section_id))continue;seen.add(s.section_id);opt(sel,s.section_id,'P · '+s.title+' ('+s.navigation_id+')')}if(modes[which]!=='verse'&&!seen.has(modes[which]))modes[which]='verse';sel.value=modes[which];sel.addEventListener('change',()=>{modes[which]=sel.value;deepLink();renderPane(which).catch(e=>say(e.message,true))});bar.append(sel);pane.append(bar);
 const main=node('div',null,'content');pane.append(main);
 if(modes[which]==='verse'){
   renderEntries(main,data,author);
   addSource(main,data,dataPath('authors',author,chapter));
 }else {
   const selection=sections.find(s=>s.section_id===modes[which]);
   if(!selection){main.append(node('p','P section not applicable to this verse.','plain-note'));return}
   const sourcePath=selection.source.chapter_file;
   const sourceData=await get(sourcePath);
   const section=sourceData.navigation_sections.find(s=>s.section_id===selection.section_id);
   if(!section || section.navigation_id!==selection.navigation_id){throw Error('Original P section is missing or mismatched: '+selection.navigation_id)}
   main.append(node('div',section.navigation_id,'tag nonverse'));
   main.append(node('h3',section.title,'subtitle'));
   main.append(node('div','Non-Scripture '+section.role.replaceAll('_',' ')+' · original source entry '+(section.source_entry_id||'HelloAO introduction field'),'source'));
   moreText(main,section.content_plain);
   if(selection.scope==='passage')main.append(node('p','Source-attested passage scope: '+selection.passage_start+' to '+selection.passage_end+' · this is a P section, not a verse-commentary record.','notice'));
   addSource(main,sourceData,sourcePath);
 }
}
function eligibleForCurrentVerse(s){
 if(s.status!=='active')return false;
 if(s.scope==='work'||s.scope==='book'||s.scope==='book_group')return true;
 if(!s.passage_start||!s.passage_end)return false;
 const a=s.passage_start.split('.'),b=s.passage_end.split('.'),v=Number($('verse').value);
 if(a[0]!=='__BOOK__'||b[0]!=='__BOOK__')return false;
 return (Number(a[1])<chapter||(Number(a[1])===chapter&&Number(a[2])<=v)) &&
        (Number(b[1])>chapter||(Number(b[1])===chapter&&Number(b[2])>=v));
}
'''

def main():
 p=argparse.ArgumentParser();p.add_argument('--input-dir',type=Path,required=True);p.add_argument('--out-dir',type=Path,required=True);a=p.parse_args()
 for book,(zipname,page,label) in FILES.items():
  z=zipfile.ZipFile(a.input_dir/zipname)
  s=z.read(page).decode('utf-8')
  assert "let manifest,catalog,index,chapter=1;" in s,(page,'globals')
  s=s.replace('let manifest,catalog,index,chapter=1;','let manifest,catalog,index,coverage,chapter=1;',1)
  mark='async function renderPane(which)';end='async function render(){'
  start_index=s.index(mark);end_index=s.index(end,start_index)
  s=s[:start_index]+RENDER_PANE.replace('__BOOK__',book).replace('__LABEL__',label)+s[end_index:]
  # Load P overlay before first render; fail closed on missing overlay.
  marker="catalog=await get('api/v3/authors.json');"
  assert s.count(marker)==1,(page,'catalog load')
  s=s.replace(marker,marker+f"coverage=await get('api/v3/navigation-coverage/v1/books/{book}.json');if(coverage.book_id!=='{book}'||coverage.source_snapshot_unchanged!==true)throw Error('P coverage catalog identity mismatch');",1)
  # Old `index.navigation_routes` is intentionally not used.
  assert 'eligibleForCurrentVerse(s)' in s and f'books/{book}.json' in s
  (a.out_dir/page).write_text(s,encoding='utf-8')
  print(page,'bytes',len(s.encode('utf-8')))
if __name__=='__main__':main()
