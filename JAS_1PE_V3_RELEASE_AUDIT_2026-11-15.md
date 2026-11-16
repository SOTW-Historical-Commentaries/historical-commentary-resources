# SOTW Historical Commentary Library: James + 1 Peter

## Independent source, navigation and packaging audit — 15 November 2026

**Decision:** PASS_SOURCE_SCHEMA_NAVIGATION_AND_ARCHIVE_INTEGRITY_LOCAL_ONLY (locally prepared, not installed).

| Measure | James | 1 Peter |
|---|---:|---:|
| Canonical chapters | 5 | 5 |
| KJV verse coordinates | 108 | 105 |
| Six-author chapter JSON | 30 | 30 |
| Native original commentary entries | 425 | 435 |
| Verified verse-author route pointers | 523 | 518 |
| Source-backed P sections | 32 | 34 |

Source modules: **MHC 2.2, CalvinCommentaries 1.1, Clarke 2.0, JFB 3.0, KD 2.0 (NT unavailable), HelloAO John Gill original**. Six original source archive SHA-256 sums matched the previously installed source roster. Each nonempty original SWORD text/marker was re-read independently from its native block index and hashed; each HelloAO verse was checked against its original JSON explicit anchor. No separate edition text overlaid native SWORD keys.

P sections: Original book introductions, chapter prefaces/headings, and source-titled passage records are separated and checked against exact source fragment offsets/hashes. Passage sections include bounded start/end references. Three older held JFB group sections remain untouched. **The preface shared by the First and Second Epistles of Peter is displayed with its original title, and only 1 Peter is eligible in this new release.**

Current live repository baseline: `7b6657f74b42c396eea19d3cfdf9a77c3f643c25`; navigation Git blob `e5f265abdfc3fbb154eb0cca70e3c45231e9dbb1`. All original 58 book mappings, source/routed P counts, and reader policy are unchanged in the prepared 60-book cumulative manifest.

Local Chromium desktop and mobile simulated-JSON reader checks passed for both books (chapter/verse selection, book prefaces, John Gill and unavailable Keil & Delitzsch). Direct browser navigation was blocked, so these are not live Pages tests.

No GitHub changes made by this package. Installation requires manual owner upload, final Pages deployment, and visual desktop/mobile acceptance.
