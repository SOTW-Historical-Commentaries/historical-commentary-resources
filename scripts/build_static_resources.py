#!/usr/bin/env python3
"""Build immutable author/chapter HTTP resources from a verified HelloAO ZIP.
Requires only Python 3 standard library. Never writes to GitHub.
"""
import argparse,hashlib,json,zipfile
from pathlib import Path
EXPECTED='f8746a5553fdadd12cfee5004eca1c36bf3065b19cd7a5b3ab278fc188e7efbb'
AUTHORS=['adam-clarke','jamieson-fausset-brown','john-calvin','john-gill','keil-delitzsch','matthew-henry']
VERSION='helloao-2026-11-01'
def write(path,obj):
 path.parent.mkdir(parents=True,exist_ok=True)
 path.write_text(json.dumps(obj,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
def build(src,out,books):
 got=hashlib.file_digest(open(src,'rb'),'sha256').hexdigest()
 if got!=EXPECTED:raise ValueError('Source archive SHA mismatch: '+got)
 inventory={};counts={a:0 for a in AUTHORS};chapter_count=0
 with zipfile.ZipFile(src) as z:
  members={p for p in z.namelist() if p.endswith('.json')}
  for name in sorted(members):
   parts=name.split('/')
   if len(parts)!=4 or parts[1] not in AUTHORS or parts[2] not in books or not parts[3][:-5].isdigit():continue
   author,book,filename=parts[1:];chapter=int(filename[:-5]);raw=z.read(name)
   obj=json.loads(raw)
   if obj.get('commentary',{}).get('id')!=author or obj.get('book',{}).get('id')!=book or obj.get('chapter',{}).get('number')!=chapter:raise ValueError('Mismatched source metadata '+name)
   path=out/'api/v1/snapshots'/VERSION/'authors'/author/book/(str(chapter)+'.json')
   payload={'schema_version':'1.0.0','library':'sotw-historical-commentaries','source_version':VERSION,'canonical_chapter':f'{book}.{chapter}','author_id':author,'display_edition_id':None,'source_chapter_sha256':hashlib.sha256(raw).hexdigest(),'source_api_url':f'https://bible.helloao.org/api/c/{author}/{book}/{chapter}.json','commentary':obj}
   write(path,payload);counts[author]+=1
   inventory.setdefault(f'{book}.{chapter}',[]).append({'author':author,'path':'/'+path.relative_to(out).as_posix(),'source_sha256':hashlib.sha256(raw).hexdigest(),'bytes':path.stat().st_size})
 for key,entries in sorted(inventory.items()):
  book,chap=key.split('.')
  write(out/'api/v1/snapshots'/VERSION/'index'/book/(chap+'.json'),{'schema_version':'1.0.0','canonical_chapter':key,'source_version':VERSION,'authors':entries,'missing_authors':[a for a in AUTHORS if a not in [x['author'] for x in entries]]})
 manifest={'schema_version':'1.0.0','library':'sotw-historical-commentaries','source_version':VERSION,'source_archive_sha256':EXPECTED,'status':'genesis_pilot' if books=={'GEN'} else 'generated_selected_books','authors':AUTHORS,'books':sorted(books),'chapter_resources':sum(counts.values()),'distinct_chapters':len(inventory),'authors_count':counts,'url_templates':{'passage_chapter_index':'/api/v1/snapshots/{SOURCE_VERSION}/index/{BOOK}/{CHAPTER}.json','author_chapter':'/api/v1/snapshots/{SOURCE_VERSION}/authors/{AUTHOR}/{BOOK}/{CHAPTER}.json'},'note':'Static paths become HTTP endpoints only after enabling a compatible static host. For GitHub Pages project sites prepend the repo path.'}
 write(out/'api/v1/manifest.json',manifest)
 return manifest
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--archive',required=True,type=Path);p.add_argument('--output',required=True,type=Path);p.add_argument('--books',nargs='+',default=['GEN']);a=p.parse_args();print(json.dumps(build(a.archive,a.output,set(a.books)),indent=2))
