# SOTW BIBLE READER — PROGRESS LEDGER

**Updated:** 2026-11-16 (America/Chicago)  
**Authoritative living ledger:** [Google Doc](https://docs.google.com/document/d/1ziYT4U6SN3nTQXUX5y6YXzrzfLGqQIi7vBeTPJ4GWyE/edit)  
**Repository:** `SOTW-Historical-Commentaries/historical-commentary-resources`  
**Live-route candidate:** https://sotw-historical-commentaries.github.io/historical-commentary-resources/mobile-bible-beta/  
**Implementation folder:** `mobile-bible-beta/`  
**Baseline before additions:** `201ae69e162c22c01f26e73ce7266ef6abfe150b`  
**New code commit:** `10dd81a65063706fd5ac38c1ca04df6b83cd4f50` (fixed JavaScript syntax)  
**PWA last asset commit:** `81fe42971ebdf3d304eed42989cf423212a2fd86`

## 2026-11-16 | First owner iPhone field-test screenshots and UI correction

**Owner evidence:** Three screenshots captured on iPhone after opening the public beta (approximately 7:13–7:15 PM America/Chicago). They establish that the public beta URL was reachable and that real content resolved in the owner's environment; this is **user screenshot evidence**, not an independent HTTP browser automation result.

- **Acts 2:37, ASV 1901:** Scripture-linked Greek Strong's IDs (including G1161) and a Greek lexicon short definition appeared; a real accepted Jacob Lannom commentary section for Acts 2:37–41 appeared. Do not infer exact data completeness from the screenshot.
- **Acts 2:41, ASV 1901:** verse-by-verse Scripture reading and neighboring verses were visible. The selected verse was below a clipped tail of earlier text; the legacy original-source “P sections” label was still visible, and the bottom control bar wrapped to a second line.
- **Micah 1:1, ASV 1901, light mode:** Hebrew Strong's IDs and historical Matthew Henry commentary appeared. The light theme rendered study headings, author name, and study controls too pale. The study Close affordance was not apparent at the displayed scroll position.

**UI remedy (new beta only):** Commit `f09a63fa4136164aebbc1b33558fe7bf04efe44c`, HTML blob `eabcec748a2049a80eee89c1e7d27a5690cfbfba`.
- Add contrast-safe light-mode study cards, headings, buttons, metadata and word-definition surfaces.
- Keep a clear Close button in a sticky study-sheet toolbar, reset sheet scroll on each opening.
- Hide the original review-interface checkbox *and its label* for P sections, without modifying the historical source feature or underlying records.
- Keep mobile reading controls in one row, adjust selected-verse top alignment.

**Validation:** Post-write GitHub file readback PASS; JavaScript parse gate PASS; targeted source markers PASS. **Still requires real iPhone visual verification after refreshing.** Existing `unified-commentary-reader/index.html` and all original SOTW data files remain untouched.

**Next test:** Reload beta on iPhone, try Micah 1:1 in light mode and Acts 2:37 in dark mode, check Close button stays visible while scrolling full commentary, tap outside and reopen, check toolbar no longer wraps, and verify no P-sections label. Send any further screenshots. Next development milestone after usability is reversible tappable commentary Scripture references, then faithful scope-aware prefaces and available-only selectors.

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
