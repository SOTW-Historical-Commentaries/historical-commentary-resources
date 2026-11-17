# SOTW BIBLE READER — PROGRESS LEDGER

**Updated:** 2026-11-16 (America/Chicago)  
**Authoritative living ledger:** [Google Doc](https://docs.google.com/document/d/1ziYT4U6SN3nTQXUX5y6YXzrzfLGqQIi7vBeTPJ4GWyE/edit)  
**Repository:** `SOTW-Historical-Commentaries/historical-commentary-resources`  
**Live-route candidate:** https://sotw-historical-commentaries.github.io/historical-commentary-resources/mobile-bible-beta/  
**Implementation folder:** `mobile-bible-beta/`  
**Baseline before additions:** `201ae69e162c22c01f26e73ce7266ef6abfe150b`  
**New code commit:** `10dd81a65063706fd5ac38c1ca04df6b83cd4f50` (fixed JavaScript syntax)  
**PWA last asset commit:** `81fe42971ebdf3d304eed42989cf423212a2fd86`

## 2026-11-16 | Owner decisions: Translation artwork/metadata; RETIRE auto-scroll

**Direction for translation selection (UI design only, not yet implemented):** Owner wants a fresh, contemporary feel with useful historical metadata and imagery. When a reader taps the compact translation label (e.g., KJV), open a tasteful translation profile/selector displaying a genuine, rights-cleared relevant book jacket or title-page image, complete translation and edition title, short historical description and optional source/edition details. Close profile after selection and leave only the short edition label on the Scripture screen. **Distinguish the standardized KJV 1769 text from the original 1611 title page** if a 1611 image is displayed; do not misrepresent the image as the actual source edition. Do not invent a jacket or add a large permanent cover to the reading page. Find and select verified authentic artwork during the consolidated redesign.

**Owner decision:** Auto-scroll is unreliable/not useful and should be **removed**, including Start/Pause, speed slider and background scrolling logic. Normal manual touchscreen scrolling remains the intended reading motion. Do not plan auto-scroll for the redesign unless the owner reverses this decision.

**Actual beta code change:** Commit `e1182d7f7005c046880a8ca14dd5c8104eb9184a`, new mobile reader blob SHA `8f021b03960c0691cb9533111774077b9e099bfd`. Removed the auto-scroll controls and JavaScript from `mobile-bible-beta/index.html`, leaving a three-button temporary toolbar (theme, paragraph/verse, Find). Existing source data, historic unified reader and Scripture foundation code untouched. No translation artwork implemented.

**Verification:** Read back new HTML via GitHub, inline JavaScript syntax PASS, no auto-scroll identifiers found, three-column bar present, original unified reader blob SHA unchanged (`b7cb82e66859a8f8705f390644a706965d0cc265`). Live iPhone refresh/screenshot after change remains pending.

## 2026-11-16 | Owner feedback: modern, reader-first top navigation

**STATUS: UI/UX direction recorded, NOT IMPLEMENTED.** Owner describes the existing compact Book / Chapter / Verse / Translation row as a useful but overly utilitarian “Swiss Army knife.” The public-domain, historical library deserves an inviting, contemporary reading experience, not an administrative control panel.

**Proposed design direction for consolidated redesign:**
- Remove the permanently exposed four-dropdown navigation toolbar from the reading canvas. Make the current **Book + Chapter** the readable, prominent header (e.g. “Romans 12”), tappable to open the fast book/chapter/verse picker. Preserve efficient, few-tap navigation, including direct verse jumps and an optional card/grid mode.
- Keep the **translation** in a small but discoverable adjacent selector; keep **Search** prominent as a simple icon with a future natural-language/phrase/book/reference unified input. Its indexing is a separate implementation phase; current beta search is limited.
- Put typography and Scripture at the top of the page as quickly as possible; use generous whitespace, high-quality type, charcoal with comfortable soft-gray ink, restrained modern accents and tasteful motion. Avoid ornamental antique styling, overcrowded icons or a second bank of tools.
- Reader preferences, auto-scroll/speed, paragraph-vs-verse choice, and deeper features should be contextual/on demand. Do not introduce a mandatory Home/Library/More bar absent real destinations.
- Public-domain content and original author attribution should remain respected; modern design does not require fabricated book headings, illustrative content, author links or unavailable controls.

**Design status:** Direction agreed; exact header arrangement, search entry interaction and icons are illustrative until consolidated with owner's additional feedback. No new UI code changes here. Current mobile reader source still at commit `8bef5b4a26b7e84df18dae670ba7ab446b735235`.

## 2026-11-16 | Owner design decision: word-first, collapsible verse study

**STATUS: Approved UX direction, NOT IMPLEMENTED.** This supersedes the current beta's unusable top-of-panel list of raw Strong's identifiers.

**Problem directly observed:** Tapping a verse opens many raw Strong's numbers at the top. Readers cannot identify the desired English word by number. An endless vertical stream of commentary is not acceptable for quick Scripture following.

**Required compact mobile flow:**
1. Tap a verse to open a compact study panel showing that verse **in readable English**. Visually distinguish only words with genuine, edition-specific supported word-study links; use tasteful accent underline/highlight, not raw identifier chips or dense colored controls. Normal Scripture remains intact in the underlying reader.
2. Tap a marked English word to open **only that word's** detail directly beneath the verse: original Hebrew/Greek spelling, Strong's identifier and concise source definition, transliteration and verified morphology when present. Offer an optional full Strong's expansion; distinct Noah Webster 1828 English dictionary only when available from the separate source.
3. Re-tap selected word, collapse the lexical card, or close the full sheet in one action; preserve the exact Scripture scroll position.
4. At the bottom of the compact sheet, show a **collapsed commentary chooser** listing only authors with matching accepted passage/book/chapter/verse coverage. When chosen, expand one author's commentary as requested, with a separate affordance for full original text. Do not automatically render every author as full-height cards; do not create an endless scroll.
5. Switching to another verse updates this same flow. Reversible cited-Scripture navigation remains a planned feature.

**Critical data-binding constraint:** The approved SOTW language contract does NOT authorize treating KJV tagged USFM ordinals or BSB source original-language row indexes as English text offsets. Direct English word highlighting must be enabled only for proven supported offsets/links per edition. ASV1901 and WEBSTER1833 supported target offsets may be used only according to their accepted contract. Missing reliable word alignment means no fabricated English-word click target. Source-based Strong's listings alone should not masquerade as clickable English tokens.

**Priority:** Incorporate this into the consolidated core mobile UI/UX redesign with owner feedback before writing a new beta. Do not alter curated sources; no application files were changed in this decision.

## 2026-11-16 | Owner priority decision: UI/UX design FIRST
**Current phase:** Mobile Reader UI/UX design and feedback consolidation. Existing SOTW verse, original-language and commentary integration appears to work in owner iPhone tests; do not re-open curated source research or pursue backend additions before the core experience is designed.
**Known search gap:** Current Find is reference-first plus limited current-chapter text search. Owner confirms this is not intuitive or adequate. Design a single natural search interface supporting reference entry, book/chapter navigation, words/phrases, and eventual concepts/questions. **Do not falsely claim Bible-wide indexing/search has been built.** Build full-text/concept matching only after the UI contract is agreed.
**Immediate design targets:** (1) Scripture typography and continuous-vs-verse display, (2) fast navigation/search UX, (3) study drawer placement, open/close/return behavior, (4) visual hierarchy and dark/light controls, (5) auto-scroll and personal preferences. Collect owner's many requested revisions before making more one-off patches; group changes into a coherent redesign. 
**Deferred until approved UI:** deeper commentary features, concept gallery, bookshelf/art, morphological expansion and substantial search infrastructure.
**Implementation state:** No additional application code changes for this priority decision. Last live HTML commit remains `8bef5b4a26b7e84df18dae670ba7ab446b735235`. This entry updates goals only.

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

**Follow-up contrast patch:** Commit `8bef5b4a26b7e84df18dae670ba7ab446b735235`, HTML blob `a96dde66c7395fbfd1e2f5d9bd8b0c94232b715f`; corrected light theme header, app title, subtitle, bottom speed-label, and previous/next controls. This is the latest reader code commit.

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
