#!/usr/bin/env python3
"""Read-only SOTW historical commentary verse/section retrieval.

Reads the public immutable chapter snapshots or the published Genesis pilot ZIP.
Never alters GitHub; never pretends an inferred span is an explicit source span.
Python 3.9+ standard library only.
"""
import argparse
import hashlib
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from pathlib import Path

DEFAULT_BASE = 'https://sotw-historical-commentaries.github.io/historical-commentary-resources/'
VERSION = 'helloao-2026-11-01'
AUTHORS = ('adam-clarke','jamieson-fausset-brown','john-calvin','john-gill','keil-delitzsch','matthew-henry')
PASSAGE = re.compile(r'^([1-3]?[A-Z]{2,4})\.(\d{1,3})\.(\d{1,3})(?:-(\d{1,3}))?$')

class RetrievalError(Exception):
    pass


def digest(data):
    return hashlib.sha256(data).hexdigest()


def canonical_path(v, kind, author, book, chapter):
    root = f'api/v1/snapshots/{v}'
    if kind == 'index':
        return f'{root}/index/{book}/{chapter}.json'
    return f'{root}/authors/{author}/{book}/{chapter}.json'


class Source:
    def __init__(self, base_url=DEFAULT_BASE, pilot_zip=None, timeout=15):
        self.base_url = base_url.rstrip('/')+'/'
        self.pilot_zip = zipfile.ZipFile(pilot_zip) if pilot_zip else None
        self.timeout = timeout

    def close(self):
        if self.pilot_zip:
            self.pilot_zip.close()

    def get(self, path):
        if path.startswith('/') or '..' in path.split('/') or not path.startswith('api/v1/'):
            raise RetrievalError(f'Unsafe resource path: {path}')
        if self.pilot_zip:
            try:
                raw = self.pilot_zip.read(path)
            except KeyError:
                raise RetrievalError(f'Not published: {path}')
        else:
            url = urllib.parse.urljoin(self.base_url, path)
            try:
                req=urllib.request.Request(url,headers={'User-Agent':'SOTW-Commentary-Research-Client/1.0','Accept':'application/json'})
                with urllib.request.urlopen(req,timeout=self.timeout) as resp:
                    raw=resp.read()
            except (urllib.error.URLError,TimeoutError) as e:
                raise RetrievalError(f'Could not fetch {url}: {e}')
        try:
            obj=json.loads(raw)
        except (UnicodeDecodeError,json.JSONDecodeError) as e:
            raise RetrievalError(f'Invalid JSON for {path}: {e}')
        return obj


def read_passage(s):
    m=PASSAGE.fullmatch(s.upper().strip())
    if not m:
        raise RetrievalError('Passage must resemble GEN.1.1 or GEN.1.1-5 (one chapter).')
    book, ch, start, end=m.groups()
    ch, start, end=int(ch),int(start),int(end or start)
    if min(ch,start,end)<1 or end<start or end>176:
        raise RetrievalError('Invalid chapter or verse range.')
    return book,ch,start,end


def select_entries(payload, start, end, include_intro=False):
    """Do NOT equate sparse verse anchors with source-attested verse ranges.

    Exact anchors are definitive. Between anchors, previous section is candidate
    context only, never claimed as complete commentary on an unanchored verse.
    No extrapolation after final anchor or before first anchor.
    """
    src=payload.get('commentary',{})
    ch=src.get('chapter',{})
    content=ch.get('content',[])
    if not isinstance(content,list):
        raise RetrievalError('Unexpected source chapter.content type')
    numbered=[]
    for pos,item in enumerate(content):
        if isinstance(item,dict) and item.get('type')=='verse' and isinstance(item.get('number'),int) and item['number']>0:
            numbered.append((pos,item['number'],item))
    numbered.sort(key=lambda x:(x[1],x[0]))
    results=[]
    for i,(pos,anchor,item) in enumerate(numbered):
        following=next((a for _,a,_ in numbered[i+1:] if a>anchor),None)
        # Gap between adjacent anchors is a *candidate* context interval, never a verified span.
        lo=max(anchor+1,start)
        hi=min(following-1,end) if following is not None else lo-1
        gap=[lo,hi] if lo<=hi else None
        if start<=anchor<=end:
            row={'anchor_verse':anchor,'match_type':'exact_anchor',
                 'contextual_range_hint':gap,'coverage_verified':True,
                 'content':item.get('content',[]),'source_item':item}
            if gap:
                row['contextual_coverage_verified']=False
                row['contextual_explanation']='Possible section continuation only; text may not address every intervening verse.'
            results.append(row)
        elif gap:
            results.append({'anchor_verse':anchor,'match_type':'possible_section_context',
                            'contextual_range_hint':gap,'coverage_verified':False,
                            'explanation':'Inferred only from adjacent numbered anchors; text may not discuss every verse in this interval.',
                            'content':item.get('content',[]),'source_item':item})
    introduction=None
    if include_intro:
        introduction={'book':src.get('book',{}).get('introduction'), 'chapter':ch.get('introduction')}
    return results,introduction, len(numbered)


def retrieve(source, passage, authors, version=VERSION, include_intro=False, display_edition=None):
    book,ch,start,end=read_passage(passage)
    if not re.fullmatch(r'[a-z0-9-]+',version):
        raise RetrievalError('Invalid version format')
    indexpath=canonical_path(version,'index',None,book,ch)
    idx=source.get(indexpath)
    if idx.get('canonical_chapter')!=f'{book}.{ch}' or idx.get('source_version')!=version:
        raise RetrievalError('Index does not match selected passage/version')
    rows=idx.get('authors',[])
    known={a.get('author'):a for a in rows if isinstance(a,dict)}
    results=[]
    missing=[]
    for author in authors:
        if author not in known:
            missing.append({'author':author,'reason':'not_listed_in_chapter_index'})
            continue
        expected=canonical_path(version,'author',author,book,ch)
        entry=known[author]
        if entry.get('path','').lstrip('/')!=expected:
            raise RetrievalError(f'Index path mismatch for {author}')
        payload=source.get(expected)
        if payload.get('author_id')!=author or payload.get('canonical_chapter')!=f'{book}.{ch}' or payload.get('source_version')!=version:
            raise RetrievalError(f'Author payload identity mismatch for {author}')
        if entry.get('source_sha256')!=payload.get('source_chapter_sha256'):
            raise RetrievalError(f'Source checksum disagreeing between index and wrapper for {author}')
        entries,intro,anchors=select_entries(payload,start,end,include_intro)
        results.append({'author_id':author,'source_chapter_sha256':payload['source_chapter_sha256'],
                        'source_api_url':payload.get('source_api_url'),'chapter_resource':expected,
                        'number_of_explicit_anchors':anchors,'matching_entries':entries,
                        'match_status':('exact_and_context' if any(x['match_type']=='exact_anchor' for x in entries) and any(x['match_type']=='possible_section_context' or x.get('contextual_range_hint') for x in entries)
                                        else 'exact_anchor' if any(x['match_type']=='exact_anchor' for x in entries)
                                        else 'possible_section_context_only' if entries else 'no_verse_anchor_or_bounded_context'),
                        'introductory_context':intro})
    return {'schema_version':'1.0.0','kind':'sotw_historical_commentary_research_packet',
            'canonical_passage':f'{book}.{ch}.{start}'+(f'-{end}' if end!=start else ''),
            'canonical_chapter':f'{book}.{ch}','source_version':version,
            'display_edition_id':display_edition,'translation_independent':True,
            'author_results':results,'missing_authors':missing,
            'retrieval_policy':{'explicit_anchor_is_not_proof_of_word_level_alignment':True,
                                'possible_section_context_is_not_verified_verse_coverage':True,
                                'no_implied_range_after_final_anchor':True,
                                'chapter_introductions_separate_from_verse_commentary':True}}


def main(argv=None):
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--passage',required=True,help='GEN.1.1 or GEN.1.1-5')
    ap.add_argument('--authors',nargs='+',default=['all'],choices=[*AUTHORS,'all'])
    ap.add_argument('--version',default=VERSION)
    ap.add_argument('--display-edition',choices=['ASV1901','KJV1769','BSB','WEBSTER1833'],help='Context only; no Bible text or word-level alignments loaded')
    ap.add_argument('--pilot-zip',type=Path,help='Offline Genesis pilot ZIP (no HTTP required)')
    ap.add_argument('--base-url',default=DEFAULT_BASE,help='GitHub Pages project site root')
    ap.add_argument('--include-introductions',action='store_true')
    ap.add_argument('--output',type=Path,help='Write one JSON packet; stdout if omitted')
    args=ap.parse_args(argv)
    author_list=list(AUTHORS) if 'all' in args.authors else list(dict.fromkeys(args.authors))
    source=Source(args.base_url,args.pilot_zip)
    try:
        packet=retrieve(source,args.passage,author_list,args.version,args.include_introductions,args.display_edition)
        output=json.dumps(packet,ensure_ascii=False,indent=2)+'\n'
        if args.output:
            args.output.parent.mkdir(parents=True,exist_ok=True)
            args.output.write_text(output,encoding='utf-8')
            print(f'Wrote: {args.output} ({len(packet["author_results"])} authors, {len(packet["missing_authors"])} unavailable)')
        else:
            sys.stdout.write(output)
    except RetrievalError as e:
        print('RETRIEVAL ERROR:',e,file=sys.stderr)
        return 2
    finally:
        source.close()
    return 0

if __name__=='__main__':
    sys.exit(main())
