# SOTW BIBLE READER — PROGRESS LEDGER

**Updated:** 2026-11-16 (America/Chicago)  
**Authoritative living ledger:** [Google Doc](https://docs.google.com/document/d/1ziYT4U6SN3nTQXUX5y6YXzrzfLGqQIi7vBeTPJ4GWyE/edit)  
**Repository:** `SOTW-Historical-Commentaries/historical-commentary-resources`  
**Live-route candidate:** https://sotw-historical-commentaries.github.io/historical-commentary-resources/mobile-bible-beta/  
**Implementation folder:** `mobile-bible-beta/`  
**Baseline before additions:** `201ae69e162c22c01f26e73ce7266ef6abfe150b`  
**New code commit:** `10dd81a65063706fd5ac38c1ca04df6b83cd4f50` (fixed JavaScript syntax)  
**PWA last asset commit:** `81fe42971ebdf3d304eed42989cf423212a2fd86`

## Record of actual work
- 2026-11-16: Created a *separate* `mobile-bible-beta/index.html` from the existing working SOTW unified reader, without changing the established `unified-commentary-reader/index.html` or any source data.
- 2026-11-16: Brought in a mobile dark theme, gray text, compact controls, responsive drawer for commentary, display filtering of authors without indexed content, and suppression of unaccepted Jacob locations.
- 2026-11-16: Added local reading state, four translation controls from the existing page, paragraph/verse toggle, pauseable adjustable auto-scroll, local current-chapter search/reference jump, and source-based Strong's word IDs and lexical details.
- 2026-11-16: Added `manifest.webmanifest`, `icon.svg` and `sw.js` for PWA shell install/caching.
- 2026-11-16: Detected and corrected a JavaScript syntax error introduced while publishing; parse gate passed after correction. Earlier invalid commit is retained only as Git history, not the deployed source.
- 2026-11-16: Wrote this ledger and a conspicuous `00_START_HERE.md` within the reader folder.

## What the new reader consumes
- Historical original commentary: current SOTW `api/v3/snapshots` chapter/verse source indexes and author chapters, **not** the original historical repository README's unpublished CLI transport.
- Accepted Jacob: live `api/jacob-lannom/v1/current-commentary.json` with `scopeKey` coverage.
- Translation verse text: published KJV1769, ASV1901, BSB and WEBSTER1833 GitHub source chapter JSON by stable ID.
- Word-study evidence: approved SOTW Original Languages Part 1/2 `study-data/v1/chapters` and Part 1 `study-data/v1/lexicon` shards. Do not imply a KJV/BSB English token offset from ordinal or language row.

## Verification status
- **PASS:** New HTML file and PWA assets committed on GitHub; newest readback of HTML succeeded; JavaScript `new Function` compile/parse syntax gate passed after repair.
- **PASS (indirect host evidence only):** A browser tab in the owner's environment previously opened the same repo's established `unified-commentary-reader/` GitHub Pages site, indicating published Pages hosting for this repository.
- **NOT VERIFIED:** An HTTP GET or visual screenshot from the NEW `mobile-bible-beta/` Pages path; actual Pages publication latency/status; real mobile interactive behavior; Cross-Origin requests to all source endpoints from public Pages; installation/offline behavior; full 66-book route/verse coverage.
- **NOT IMPLEMENTED / intentionally hidden:** Four-volume jackets, Concept Registry collage, Bible-wide full-text search, full morphological popout, Webster 1828 dictionary, persistent synced user notes, cited-Scripture linkified commentary with reversible passage preview, source-specific footnotes and comprehensive commentary preface navigation. Do not claim these features work yet.
- **Known beta risk:** Content source joins and runtime state still require real browser field tests. Some panels may require UI fixes; incorrect author display and missing coverage must be treated as defects, never padded with invented content.

## Required release gates for next iteration
1. Confirm new public URL is HTTP 200 and capture at least one phone-size screenshot.
2. Validate a real Old Testament and New Testament passage in all four available editions.
3. Confirm only available authors appear, including Jacob with truly covered and uncovered verses.
4. Test lexical links and source attributions without forged English token mappings.
5. Test close/restore and internal Scripture links; implement unresolved features in the next beta.
6. Update Google Doc master and this ledger together with current GitHub commit and results.

## Change-control
User authorized deployment to SOTW repositories on 2026-11-16. This deployment adds a segregated directory to an existing public SOTW repository; no CGBC production files, original unified reader source, existing lexicons, Bible texts or curated commentary were altered. Recheck current branch and establish a fresh recoverable fallback before altering shared UI or dependency code.
