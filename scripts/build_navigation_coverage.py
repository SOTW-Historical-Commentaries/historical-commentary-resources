#!/usr/bin/env python3
"""Build source-backed SOTW P-navigation coverage over immutable v3 books.

Does not modify original chapter JSON, scripture verse indexes or historical text.
No gap inference; JFB passage headings and selected explicit cross-chapter spans
are extracted from source P sections. Unknown coverage is NOT activated.
"""
import argparse
import hashlib
import json
import re
import zipfile
from collections import Counter, defaultdict
from pathlib import Path

BOOKS = {"GEN": ("Genesis", 50), "EXO": ("Exodus", 40), "LEV": ("Leviticus", 27), "NUM": ("Numbers", 36)}
ORIGINS = {
    "GEN": "structured-genesis-2026-11-03",
    "EXO": "structured-exodus-2026-11-03",
    "LEV": "structured-leviticus-2026-11-03",
    "NUM": "structured-numbers-2026-11-03",
}
RAW_SNAPSHOTS = {
    "GEN": "SOTW_Structured_Commentary_Genesis_v3_Staging_Pilot.zip",
    "EXO": "SOTW_Structured_Commentary_Exodus_v3_Staging_Pilot.zip",
    "LEV": "SOTW_Structured_Commentary_Leviticus_v3_Staging_Pilot.zip",
    "NUM": "SOTW_Structured_Commentary_Numbers_v3_Staging_Pilot.zip",
}
PENTATEUCH = ["GEN", "EXO", "LEV", "NUM", "DEU"]
# Source explicitly identifies the Pentateuch in its introduction. The wider
# "historical books" membership will be handled when those books are added.
GROUP_MEMBERS = {
    "GROUP:GEN-DEU:P:five-books": PENTATEUCH,
    "GROUP:GEN-DEU:P:pentateuch-volume": PENTATEUCH,
    "GROUP:GEN-HISTORICAL:P:gen-historical": PENTATEUCH,
}
# These titles were inspected in their original P sections. Do not infer from
# earlier/later verse anchors, or from a text-only supporting cross reference.
EXPLICIT_SCOPE = {
    "GEN.1:P:creation-overview": ("GEN",1,1,"GEN",2,3,"The Creation of the World - Genesis 1:1-2:3"),
    "LEV:P:sacrificial-laws-overview": ("LEV",1,1,"LEV",7,None,"The Laws of Sacrifice - Leviticus 1-7"),
    "LEV:P:general-sacrifice-rules": ("LEV",1,1,"LEV",5,None,"General Rules for the Sacrifices - Leviticus 1-5"),
    "NUM:P:preparations-at-sinai": ("NUM",1,1,"NUM",10,10,"Numbers 1:1-10:10"),
}
PREFIX = {"EXO":"Ex", "LEV":"Le", "NUM":"Nu"}


def canonical(book,chapter,verse): return f"{book}.{chapter}.{verse}"

def json_bytes(obj): return (json.dumps(obj,indent=2,ensure_ascii=False,sort_keys=False)+"\n").encode("utf-8")

def sha(raw): return hashlib.sha256(raw).hexdigest()

def parse_jfb(book,chapter,text):
    # Only parse the record's LEADING passage heading, not citations in its prose.
    head=text.strip().splitlines()[0].strip()
    pat=rf"^{PREFIX[book]}\s+({chapter}):(\d+)(?:\s*[-–]\s*(\d+)|\s*,\s*(\d+))?\s*[.]"
    m=re.search(pat,head,re.IGNORECASE)
    if not m:
        raise ValueError(f"Unparseable explicit JFB heading: {book}.{chapter} {head!r}")
    st=int(m.group(2));en=int(m.group(3) or m.group(4) or st)
    return st,en,head


def normalize_source(zips,section,book,chapter,author,source_file,source_sha,chapter_verses):
    role=section['role'];s_id=section['navigation_id'];old_scope=section['scope']
    text=section['content_plain'];basis='';status='active';book_ids=[];start=end=None
    if s_id in EXPLICIT_SCOPE:
        b,c,v,eb,ec,ev,heading=EXPLICIT_SCOPE[s_id]
        if heading.lower() not in text.lower() and heading.lower() not in section['title'].lower():
            raise ValueError('Source evidence missing for special range: '+s_id)
        if ev is None: ev=chapter_verses[eb][ec]
        scope='passage';book_ids=[b];start=canonical(b,c,v);end=canonical(eb,ec,ev)
        basis='explicit_source_range_heading';evidence=heading
    elif role=='passage_overview':
        st,en,heading=parse_jfb(book,chapter,text)
        scope='passage';book_ids=[book];start=canonical(book,chapter,st);end=canonical(book,chapter,en)
        basis='explicit_source_heading';evidence=heading
    elif old_scope=='passage':
        # A future passage overview without explicit boundaries must not become
        # book- or chapter-wide by default.
        scope='unresolved';book_ids=[];status='held_unmapped';basis='no_source_supported_bounds';evidence=''
    elif role in ('chapter_heading','chapter_introduction'):
        scope='chapter';book_ids=[book];start=canonical(book,chapter,1);end=canonical(book,chapter,chapter_verses[book][chapter]);basis='source_chapter_heading_or_introduction';evidence=section['title']
    elif role in ('group_introduction','volume_preface') and old_scope=='book_group':
        scope='book_group'
        if s_id in GROUP_MEMBERS:
            book_ids=GROUP_MEMBERS[s_id];basis='explicit_book_group_title';evidence=section['title']
        else:
            status='held_unmapped';book_ids=[];basis='group_membership_not_assigned';evidence=section['title']
    elif role in ('book_introduction','book_preface','book_heading','title_page','translator_preface','historical_dedication','author_dedication'):
        scope='book';book_ids=[book];basis='source_book_front_matter';evidence=section['title']
    elif old_scope=='work' and role=='editorial_edition_notes':
        scope='work';book_ids=list(BOOKS);basis='source_work_edition_notes';evidence=section['title']
    else:
        raise ValueError(f'Undeclared P role/scope: {book} {author} {role}/{old_scope} {s_id}')
    if scope=='passage':
        a,b=parse_canon(start),parse_canon(end)
        if a>b:raise ValueError('Reverse range: '+s_id)
        if a[0]!=b[0] and (a[0],b[0])!=('GEN','GEN'):
            raise ValueError('Multi-book P range not supported: '+s_id)
        for pt in (a,b):
            if pt[0] not in chapter_verses or pt[1] not in chapter_verses[pt[0]] or pt[2]<1 or pt[2]>chapter_verses[pt[0]][pt[1]]:
                raise ValueError('Invalid verse in heading: '+s_id+' '+repr(pt))
    return {
        'section_id':section['section_id'], 'navigation_id':s_id, 'author_id':author,
        'title':section['title'], 'role':role, 'scope':scope,
        'original_scope':old_scope, 'status':status,
        'eligible_books':book_ids,
        'passage_start':start,'passage_end':end,
        'applicability_basis':basis,'source_evidence':evidence,
        'source':{
            'chapter_file':source_file,'chapter_file_sha256':source_sha,
            'section_id':section['section_id'],
            'source_entry_id':section.get('source_entry_id'),
            'fragment_sha256':section.get('source_fragment_sha256'),
            'character_span':section.get('source_character_span'),
        },
        'content_preserved_in_original_json':True,
    }


def parse_canon(s):
    b,c,v=s.split('.');return b,int(c),int(v)


def applies(section,book,chapter,verse):
    if section['status']!='active' or book not in section['eligible_books']:
        return False
    if section['scope'] in ('work','book_group','book'):return True
    if section['scope'] in ('chapter','passage'):
        start=parse_canon(section['passage_start']);end=parse_canon(section['passage_end']);
        if start[0]!=book or end[0]!=book: return False
        return (start[1],start[2]) <= (chapter,verse) <= (end[1],end[2])
    return False


def build(input_dir,out_dir):
    zips={b:zipfile.ZipFile(input_dir/RAW_SNAPSHOTS[b]) for b in BOOKS}
    chapter_verses={}; original_record_counts={}; snapshot_file_hashes={}
    for b,z in zips.items():
        snap=ORIGINS[b];ch={}; recs=0;source_hashes={}
        for i in range(1,BOOKS[b][1]+1):
            path=f'api/v3/snapshots/{snap}/index/{b}/{i}.json'
            d=json.loads(z.read(path));ch[i]=d['verse_count']
            assert d['canonical_chapter']==f'{b}.{i}'
        chapter_verses[b]=ch
    records=[]; present_nav=set();source_sizes=defaultdict(int)
    for b,z in zips.items():
        snap=ORIGINS[b]
        for path in sorted(z.namelist()):
            m=re.fullmatch(rf'api/v3/snapshots/{snap}/authors/([^/]+)/{b}/(\d+)\.json',path)
            if not m:continue
            author,chapter=m.group(1),int(m.group(2));raw=z.read(path);d=json.loads(raw)
            for section in d['navigation_sections']:
                key=(author,section['section_id']);
                if key in present_nav:raise ValueError('Duplicate source section '+str(key))
                present_nav.add(key)
                record=normalize_source(zips,section,b,chapter,author,path,sha(raw),chapter_verses)
                records.append(record);source_sizes[b]+=1
    if len(records)!=455:raise ValueError('Unexpected base section count '+str(len(records)))
    reports=[]; book_files=[]
    root=out_dir/'api/v3/navigation-coverage/v1';(root/'books').mkdir(parents=True,exist_ok=True)
    priority={'work':0,'book_group':1,'book':2,'chapter':3,'passage':4}
    for b in BOOKS:
        included=[s for s in records if s['status']=='active' and b in s['eligible_books']]
        included.sort(key=lambda x:(x['author_id'],priority[x['scope']],x['passage_start'] or '',x['navigation_id']))
        by_author={};
        for s in included:by_author.setdefault(s['author_id'],[]).append(s)
        obj={
            'schema_version':'1.0.0',
            'kind':'sotw_authoritative_nonverse_navigation_coverage',
            'provider':'Servants of the Way Commentary Library',
            'book_id':b, 'snapshot_id':ORIGINS[b], 'source_snapshot_unchanged':True,
            'contract':'This file is authoritative for P navigation in this book; source snapshot navigation_routes are unscoped legacy discovery only.',
            'default_reader_mode':'verse',
            'author_sections':by_author,
        }
        dest=root/'books'/f'{b}.json';dest.write_bytes(json_bytes(obj));book_files.append(dest)
        reports.append({
            'book':b,'navigation_sections_in_source':source_sizes[b],
            'routed_P_sections':len(included),
            'routed_by_role':dict(Counter(x['role'] for x in included)),
        })
    held=[s for s in records if s['status']!='active']
    (root/'held-unmapped.json').write_bytes(json_bytes({'kind':'sotw_nonverse_navigation_held_unmapped','status':'DO_NOT_ROUTE','sections':held}))
    manifest={
        'schema_version':'1.0.0','kind':'sotw_navigation_coverage_overlay',
        'status':'STAGING_NAVIGATION_CORRECTION','version':'navigation-coverage-v1',
        'provider':'Servants of the Way Commentary Library',
        'books':list(BOOKS),
        'chapter_snapshots':ORIGINS,
        'publication_rule':'Use books/{BOOK}.json for P navigation. Legacy source navigation_sections remain evidence, not scope-authoritative routing. Original verse_routes remain authoritative for verse commentary.',
        'reader_policy':{'default':'verse', 'preface_chapter_intro':'book_or_chapter_only','passage_overview':'explicit_bounded_passage_only','group_intro':'explicit_eligible_books_only','book_group_intro_not_assigned':'hidden_until_mapped','out_of_range_deep_link':'fall_back_to_verse'},
        'source_text_changed':False,'verse_index_changed':False,
        'section_counts':{'original_P_sections':len(records),'unassigned_P_sections':len(held),'source_by_book':source_sizes,'routed_by_book':{x['book']:x['routed_P_sections'] for x in reports}},
    }
    (root/'manifest.json').write_bytes(json_bytes(manifest))
    return records,held,reports,manifest


def main():
    p=argparse.ArgumentParser();p.add_argument('--input-dir',type=Path,required=True);p.add_argument('--out-dir',type=Path,required=True)
    x=p.parse_args();rec,held,reports,m=build(x.input_dir,x.out_dir)
    print(json.dumps({'total_source_sections':len(rec),'held_unmapped':len(held),'held_labels':[v['navigation_id'] for v in held], 'books':reports},indent=2))
if __name__=='__main__':main()
