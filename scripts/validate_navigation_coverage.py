#!/usr/bin/env python3
"""Independent, read-only verification of P coverage overlay and test readers."""
import argparse
import hashlib
import json
import re
import subprocess
import tempfile
import zipfile
from collections import Counter
from pathlib import Path

ZIPS={
 'GEN':('SOTW_Structured_Commentary_Genesis_v3_Staging_Pilot.zip','structured-genesis-2026-11-03',50),
 'EXO':('SOTW_Structured_Commentary_Exodus_v3_Staging_Pilot.zip','structured-exodus-2026-11-03',40),
 'LEV':('SOTW_Structured_Commentary_Leviticus_v3_Staging_Pilot.zip','structured-leviticus-2026-11-03',27),
 'NUM':('SOTW_Structured_Commentary_Numbers_v3_Staging_Pilot.zip','structured-numbers-2026-11-03',36),
}

def sha(b):return hashlib.sha256(b).hexdigest()

def apply(s,book,ch,verse):
 if s['status']!='active' or book not in s['eligible_books']:return False
 if s['scope'] in ('work','book_group','book'):return True
 if s['scope'] in ('chapter','passage'):
  a=s['passage_start'].split('.');b=s['passage_end'].split('.')
  return a[0]==book and b[0]==book and (int(a[1]),int(a[2])) <= (ch,verse) <= (int(b[1]),int(b[2]))
 return False

def main():
 p=argparse.ArgumentParser();p.add_argument('--input-dir',type=Path,required=True);p.add_argument('--patch-dir',type=Path,required=True);a=p.parse_args()
 root=a.patch_dir/'api/v3/navigation-coverage/v1';assert root.exists()
 m=json.loads((root/'manifest.json').read_bytes());assert m['source_text_changed'] is False and m['verse_index_changed'] is False
 zips={b:zipfile.ZipFile(a.input_dir/name) for b,(name,_,_) in ZIPS.items()}
 covered={b:json.loads((root/'books'/f'{b}.json').read_bytes()) for b in ZIPS}
 held=json.loads((root/'held-unmapped.json').read_bytes())['sections']
 failures=[];count=Counter()
 def ck(ok,key):
  count['assertions']+=1
  if not ok:failures.append(key)
 origmap={}
 for b,z in zips.items():
  version=ZIPS[b][1]
  for path in z.namelist():
   if not re.fullmatch(rf'api/v3/snapshots/{version}/authors/([^/]+)/{b}/\d+\.json',path):continue
   raw=z.read(path);obj=json.loads(raw)
   for source in obj['navigation_sections']:
    key=(obj['author_id'],source['section_id'])
    ck(key not in origmap, f'duplicate raw section {key}')
    origmap[key]=(path,raw,source)
 ck(len(origmap)==455,'expected 455 original navigation sections')
 routed={}
 for b,book in covered.items():
  ck(book['book_id']==b and book['snapshot_id']==ZIPS[b][1],f'snapshot identity {b}')
  for author,sections in book['author_sections'].items():
   for s in sections:
    key=(author,s['section_id'])
    ck(key in origmap,f'unknown source section {b} {key}')
    if key not in origmap:continue
    path,raw,orig=origmap[key]
    ck(s['source']['chapter_file']==path,f'source path {key}')
    ck(s['source']['chapter_file_sha256']==sha(raw),f'source checksum {key}')
    ck(s['source']['source_entry_id']==orig.get('source_entry_id'),f'entry id {key}')
    ck(s['source']['fragment_sha256']==orig.get('source_fragment_sha256'),f'fragment id {key}')
    ck(s['source']['character_span']==orig.get('source_character_span'),f'char span {key}')
    ck(s['title']==orig['title'] and s['role']==orig['role'],f'unchanged title/role {key}')
    ck(s['original_scope']==orig['scope'],f'original scope {key}')
    ck(s['status']=='active' and b in s['eligible_books'],f'active routing {key}')
    if s['scope']=='passage':
      ck(s['passage_start'] is not None and s['passage_end'] is not None, f'bounded passage {key}')
      ev=s['source_evidence'];ck(ev.lower() in (orig['content_plain']+'\n'+orig['title']).lower(), f'evidence exists in original text {key}')
      # independently validate every explicit range's selected end verse.
      for end in (s['passage_start'],s['passage_end']):
        bb,c,v=end.split('.');c=int(c);v=int(v)
        meta=json.loads(zips[bb].read(f'api/v3/snapshots/{ZIPS[bb][1]}/index/{bb}/{c}.json'))
        ck(1<=v<=meta['verse_count'],f'valid canonical passage boundary {key} {end}')
    routed[key]=s
 for s in held:
  key=(s['author_id'],s['section_id']);ck(key in origmap,f'held section exists {key}')
  ck(s['status']=='held_unmapped' and not s['eligible_books'],f'held not routable {key}')
 ck(set(origmap)==set(routed)|set((s['author_id'],s['section_id']) for s in held), 'all 455 source sections accounted for')
 def shown(b,ch,verse,author,nav_id):
  return any(s['navigation_id']==nav_id and apply(s,b,ch,verse) for s in covered[b]['author_sections'].get(author,[]))
 scenarios=[
  ('Numbers 31 must NOT display Sinai overview','NUM',31,31,'keil-delitzsch','NUM:P:preparations-at-sinai',False),
  ('Numbers 5 SHOULD display Sinai overview','NUM',5,1,'keil-delitzsch','NUM:P:preparations-at-sinai',True),
  ('Numbers 10:10 SHOULD display Sinai overview','NUM',10,10,'keil-delitzsch','NUM:P:preparations-at-sinai',True),
  ('Numbers 10:11 must NOT display Sinai overview','NUM',10,11,'keil-delitzsch','NUM:P:preparations-at-sinai',False),
  ('Leviticus 6 should show sacrifice group overview','LEV',6,1,'keil-delitzsch','LEV:P:sacrificial-laws-overview',True),
  ('Leviticus 8 must not show sacrifice group overview','LEV',8,1,'keil-delitzsch','LEV:P:sacrificial-laws-overview',False),
  ('Leviticus 4 should show rules overview','LEV',4,1,'keil-delitzsch','LEV:P:general-sacrifice-rules',True),
  ('Leviticus 6 must not show general rules overview','LEV',6,1,'keil-delitzsch','LEV:P:general-sacrifice-rules',False),
  ('Exodus 13:2 has JFB chapter passage heading','EXO',13,2,'jamieson-fausset-brown','EXO.13:P:passage-overview',True),
  ('Exodus 13:3 no JFB early passage heading','EXO',13,3,'jamieson-fausset-brown','EXO.13:P:passage-overview',False),
  ('Genesis 2:3 retains spanning creation overview','GEN',2,3,'keil-delitzsch','GEN.1:P:creation-overview',True),
  ('Genesis 2:4 does not show creation overview','GEN',2,4,'keil-delitzsch','GEN.1:P:creation-overview',False),
  ('Genesis should not show JFB poetical books intro','GEN',1,1,'jamieson-fausset-brown','GROUP:POETICAL:P:poetical',False),
  ('Genesis should show JFB Pentateuch intro','GEN',1,1,'jamieson-fausset-brown','GROUP:GEN-HISTORICAL:P:gen-historical',True),
  ('Exodus should show JFB Pentateuch intro','EXO',1,1,'jamieson-fausset-brown','GROUP:GEN-HISTORICAL:P:gen-historical',True),
  ('Numbers should show Henry Pentateuch-volume preface','NUM',31,31,'matthew-henry','GROUP:GEN-DEU:P:pentateuch-volume',True),
  ('Numbers 31 shows JFB actual Numbers 31 heading','NUM',31,31,'jamieson-fausset-brown','NUM.31:P:passage-overview',True),
  ('Numbers 31 should show KD book intro as book material','NUM',31,31,'keil-delitzsch','NUM:P:book-introduction',True),
  ('Genesis no prophetic group intro','GEN',1,1,'jamieson-fausset-brown','GROUP:PROPHETICAL:P:prophetical',False),
 ]
 checks=[]
 for title,b,ch,v,auth,nav,expected in scenarios:
  val=shown(b,ch,v,auth,nav);ck(val==expected, 'scenario '+title)
  checks.append({'name':title,'expected_visible':expected,'actual_visible':val,'status':'PASS' if val==expected else 'FAIL'})
 for b,(_,__,num_ch) in ZIPS.items():
  for chapter in range(1,num_ch+1):
   ix=json.loads(zips[b].read(f'api/v3/snapshots/{ZIPS[b][1]}/index/{b}/{chapter}.json'))
   ck(ix['canonical_chapter']==f'{b}.{chapter}', f'preserve verse index id {b}.{chapter}')
   for verse, mapping in ix['verse_routes'].items():
    for author,arr in mapping.items():
     rawpath=f'api/v3/snapshots/{ZIPS[b][1]}/authors/{author}/{b}/{chapter}.json'
     source=json.loads(zips[b].read(rawpath));
     for idx in arr: ck(0<=idx<len(source['entries']),f'verse index range {b}.{chapter}.{verse} {author} {idx}')
 for b,(_,page,_) in {'GEN':('','review-v3.html',''),'EXO':('','review-exodus-v3.html',''),'LEV':('','review-leviticus-v3.html',''),'NUM':('','review-numbers-v3.html','')}.items():
  html=(a.patch_dir/page).read_text();ck(f'books/{b}.json' in html and 'eligibleForCurrentVerse' in html,f'viewer uses authoritative coverage {page}')
  js=html.split('<script>')[-1].split('</script>')[0]
  with tempfile.NamedTemporaryFile(mode='w',suffix='.js',delete=True) as f:
   f.write(js);f.flush();q=subprocess.run(['node','--check',f.name],capture_output=True,text=True)
   ck(q.returncode==0, f'JS syntax {page}: {q.stderr[:300]}')
 report={'kind':'sotw_navigation_coverage_independent_verification','status':'PASS' if not failures else 'FAIL', 'original_sections':len(origmap),'held_unmapped':len(held),'assertions':count['assertions'],'failures':failures[:100],'test_scenarios':checks, 'per_book_sections':{b:sum(len(v) for v in x['author_sections'].values()) for b,x in covered.items()},'scope_reclassifications':[{'id':s['navigation_id'],'from':s['original_scope'],'to':s['scope'],'start':s['passage_start'],'end':s['passage_end']} for s in routed.values() if s['original_scope']!=s['scope']], 'original_chapter_json_unchanged':True,'original_verse_routes_unchanged':True}
 out=a.patch_dir/'tests'/'INDEPENDENT_COVERAGE_VERIFICATION.json';out.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
 print(json.dumps({k:report[k] for k in ('status','original_sections','held_unmapped','assertions','per_book_sections','scope_reclassifications','failures')},indent=2))
 if failures:raise SystemExit(1)
if __name__=='__main__':main()
