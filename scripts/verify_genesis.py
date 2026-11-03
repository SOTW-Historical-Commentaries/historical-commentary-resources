#!/usr/bin/env python3
"""Read-only six-author Genesis acceptance and range-handling checks."""
import argparse
import hashlib
import json
import sys
from pathlib import Path
from commentary_retrieve import AUTHORS,Source,VERSION,RetrievalError,retrieve


def check(condition,message):
    if not condition:raise AssertionError(message)


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--pilot-zip',type=Path,help='Offline Genesis source, if network unavailable')
    p.add_argument('--base-url',default='https://sotw-historical-commentaries.github.io/historical-commentary-resources/')
    p.add_argument('--output',type=Path,default=None)
    a=p.parse_args();s=Source(a.base_url,a.pilot_zip)
    assertions=[]
    def passed(name,condition):
        check(condition,name);assertions.append(name)
    try:
        manifest=s.get('api/v1/manifest.json')
        passed('manifest_source_version',manifest.get('source_version')==VERSION)
        passed('manifest_six_authors',set(manifest.get('authors',[]))==set(AUTHORS))
        passed('manifest_genesis_pilot',manifest.get('books')==['GEN'])
        idx=s.get(f'api/v1/snapshots/{VERSION}/index/GEN/1.json')
        passed('index_all_six',set(x['author'] for x in idx.get('authors',[]))==set(AUTHORS))
        passed('index_no_missing_authors',idx.get('missing_authors')==[])
        packet=retrieve(s,'GEN.1.1',list(AUTHORS))
        passed('packet_six_authors',len(packet['author_results'])==6 and not packet['missing_authors'])
        passed('independent_author_identifiers',set(a['author_id'] for a in packet['author_results'])==set(AUTHORS))
        passed('same_canonical_chapter',packet['canonical_chapter']=='GEN.1')
        passed('version_pinned',packet['source_version']==VERSION)
        passed('checksums_present',all(len(a.get('source_chapter_sha256',''))==64 for a in packet['author_results']))
        passed('distinct_source_records',len(set(a['source_chapter_sha256'] for a in packet['author_results']))==6)
        passed('explicit_or_empty_not_invented',all(a['match_status'] in ('exact_anchor','no_verse_anchor_or_bounded_context') for a in packet['author_results']))
        # Data-specific acceptance: Matthew Henry has anchor verse 1 followed by 3;
        # verse 2 gets a cautiously inferred context note, never an exact claim.
        henry=retrieve(s,'GEN.1.2',['matthew-henry'])['author_results'][0]
        passed('range_context_not_overclaimed',henry['match_status']=='possible_section_context_only' and all(v['coverage_verified'] is False for v in henry['matching_entries']))
        gill=retrieve(s,'GEN.1.2',['john-gill'])['author_results'][0]
        passed('exact_anchor_preferred',gill['match_status']=='exact_anchor' and gill['matching_entries'][0]['anchor_verse']==2)
        jf=retrieve(s,'GEN.1.1',['jamieson-fausset-brown'])['author_results'][0]
        passed('missing_verse_does_not_fabricate',jf['match_status']=='no_verse_anchor_or_bounded_context')
        multi=retrieve(s,'GEN.1.1-3',['matthew-henry'])['author_results'][0]
        passed('range_keeps_exact_and_context',multi['match_status']=='exact_and_context')
        intros=retrieve(s,'GEN.1.1',['john-gill'],include_intro=True)['author_results'][0]
        passed('intro_is_separate',intros['introductory_context'] is not None)
        # Missing author/path is reported, not synthesized from another source.
        bad=retrieve(s,'GEN.1.1',['matthew-henry'])
        passed('edition_independent',bad['display_edition_id'] is None)
        edition_packet=retrieve(s,'GEN.1.1',['matthew-henry'],display_edition='ASV1901')
        passed('display_edition_context_only',edition_packet['display_edition_id']=='ASV1901' and edition_packet['author_results'][0]['source_chapter_sha256']==bad['author_results'][0]['source_chapter_sha256'])
        outcome={'status':'PASS','mode':'offline_zip' if a.pilot_zip else 'http',
                 'source_version':VERSION,'chapter':'GEN.1','authors_tested':list(AUTHORS),
                 'assertions_passed':len(assertions),'assertions':assertions,
                 'limitations':['Source anchors can group multiple verses without explicit machine-readable spans.',
                                'Inferred spans are marked possible_section_context and never verified coverage.',
                                'Validation is source-structure/retrieval, not independent edition/textual fidelity.',
                                'HTTP mode tests served resources; offline mode does not establish HTTP availability.']}
        text=json.dumps(outcome,indent=2)+'\n'
        if a.output:
            a.output.parent.mkdir(parents=True,exist_ok=True)
            a.output.write_text(text,encoding='utf-8')
        print(text)
        return 0
    except (RetrievalError,AssertionError) as e:
        print(json.dumps({'status':'FAIL','error':str(e),'assertions_passed':len(assertions)},indent=2),file=sys.stderr)
        return 1
    finally:
        s.close()

if __name__=='__main__':sys.exit(main())
