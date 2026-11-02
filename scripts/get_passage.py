#!/usr/bin/env python3
"""Extract requested commentary chapters from an immutable HelloAO source ZIP.

Uses only Python stdlib. No network, no GitHub writes. Input paths are relative to repo root.
"""
import argparse,hashlib,json,re,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
AUTHORS=('adam-clarke','jamieson-fausset-brown','john-calvin','john-gill','keil-delitzsch','matthew-henry')
PATTERN=re.compile(r'^([1-3]?[A-Z]{2,3})\.(\d+)(?:\.(\d+))?$')
def run(args):
    index=json.loads((ROOT/'data/index/passage-chapters.v1.json').read_text())['records']
    manifest=json.loads((ROOT/'config/library-manifest.v1.json').read_text())
    src=next((s for s in manifest['source_versions'] if s['version']==args.source_version),None)
    if src is None: raise SystemExit(f'Unknown source version: {args.source_version}')
    archive=Path(args.archive).expanduser().resolve()
    if not archive.is_file(): raise SystemExit(f'Archive not found: {archive}')
    digest=hashlib.file_digest(open(archive,'rb'),'sha256').hexdigest()
    if digest!=src['archive_sha256']: raise SystemExit('Archive SHA-256 mismatch: refusing to read unrecognized data')
    authors=args.authors or list(AUTHORS)
    unknown=set(authors)-set(AUTHORS)
    if unknown: raise SystemExit('Unknown author(s): '+', '.join(sorted(unknown)))
    passages={}
    with zipfile.ZipFile(archive) as z:
        for passage in args.passages:
            match=PATTERN.fullmatch(passage.upper())
            if not match: raise SystemExit(f'Invalid canonical passage ID: {passage}')
            book,chapter,verse=match.group(1),int(match.group(2)),int(match.group(3)) if match.group(3) else None
            key=f'{book}.{chapter}'
            records={v['author']:v for v in index.get(key,[])}
            entries=[];missing=[]
            for author in authors:
                rec=records.get(author)
                if not rec: missing.append({'author':author,'reason':'chapter_not_indexed'}); continue
                raw=z.read(rec['source_path'])
                if hashlib.sha256(raw).hexdigest()!=rec['sha256']: raise SystemExit('Checksum mismatch for '+rec['source_path'])
                obj=json.loads(raw)
                if verse is None or args.include_chapter_context:
                    content=obj.get('chapter',{}).get('content',[])
                else:
                    content=[item for item in obj.get('chapter',{}).get('content',[]) if item.get('type')=='verse' and item.get('number')==verse]
                if verse is not None and not content:
                    missing.append({'author':author,'reason':'no_direct_verse_anchor','chapter_available':True});continue
                entries.append({'author':author,'source_path':rec['source_path'],'source_sha256':rec['sha256'],'commentary_title':obj.get('commentary',{}).get('name'),'content':content,'chapter_introduction':obj.get('book',{}).get('introduction') if args.include_chapter_context else None,'scope':'chapter_context' if verse is None or args.include_chapter_context else 'direct_verse_anchor_only','source_url':f'https://bible.helloao.org/api/c/{author}/{book}/{chapter}.json'})
            passages[passage]={'canonical_passage':passage,'chapter_key':key,'entries':entries,'missing_authors':missing}
    return {'schema_version':'1.0.0','library':'sotw-historical-commentaries','source_version':src['version'],'source_zip_sha256':digest,'display_edition_id':args.display_edition,'important':'Display translation is viewer context only; commentary text is never rewritten or implicitly tied to that translation. Chapter/section commentary may not have direct verse anchor.','passages':passages}
if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('passages',nargs='+',help='Canonical IDs e.g. GEN.1.1 GEN.1.2 or ROM.8')
    ap.add_argument('--authors',nargs='+',choices=AUTHORS)
    ap.add_argument('--source-version',default='helloao-2026-11-01')
    ap.add_argument('--display-edition',default='ASV1901',help='Context only, no commentary remapping')
    ap.add_argument('--archive',default=str(ROOT.parent/'helloao-historical-commentaries.zip'))
    ap.add_argument('--include-chapter-context',action='store_true')
    ap.add_argument('--out',default='-',help='Output JSON path or - for stdout')
    a=ap.parse_args();value=run(a)
    if a.out=='-': print(json.dumps(value,ensure_ascii=False,indent=2))
    else:
        path=Path(a.out);path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n');print('Wrote',path)
