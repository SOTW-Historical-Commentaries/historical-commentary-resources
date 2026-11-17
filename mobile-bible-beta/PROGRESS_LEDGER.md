# SOTW BIBLE READER — PROGRESS LEDGER

**Updated:** 2026-11-16 (America/Chicago)  
**Authoritative living ledger:** [Google Doc](https://docs.google.com/document/d/1ziYT4U6SN3nTQXUX5y6YXzrzfLGqQIi7vBeTPJ4GWyE/edit)  
**Repository:** `SOTW-Historical-Commentaries/historical-commentary-resources`  
**Live-route candidate:** https://sotw-historical-commentaries.github.io/historical-commentary-resources/mobile-bible-beta/  
**Implementation folder:** `mobile-bible-beta/`  
**Baseline before additions:** `201ae69e162c22c01f26e73ce7266ef6abfe150b`  
**New code commit:** `10dd81a65063706fd5ac38c1ca04df6b83cd4f50` (fixed JavaScript syntax)  
**PWA last asset commit:** `81fe42971ebdf3d304eed42989cf423212a2fd86`

## 2026-11-16 | v0.5: anchored navigation and verse doctrine labels/aliases (limited evidence coverage)

**User request:** Change the passage selector from a bottom sheet into a dropdown anchored below the selected book/chapter heading, dimming the rest of the reader until Read Passage or explicit Close. In full-screen study, show doctrinal labels and aliases **above** the selected verse.

**IMPLEMENTED in isolated reader:** HTML release commit `4868e34a216dd2b623dec4c9b26b2c726cd0203f`, blob `41d7fb4ad9b989b8700bcd7c61cc3a9365c74996`. The passage picker remains Book / Chapter / Verse only. A dimming scrim overlays the main reader while the panel appears immediately below its header trigger, with a responsive top/left position, height guard and reduced-motion support. Outside tapping the scrim doesn't silently discard selection; the user presses Read Passage or Close. Translation remains at upper right.

**Doctrine presentation:** New reader-only data index `mobile-bible-beta/data/verse-doctrine-tags.v1.json`, created in commit `562abb268bf89caebc99732c2c3d5a21dc15c2f0`, six deliberately bounded SOTW-supported passages: `ACT.2.37-41`, `ACT.6.1-7`, `HEB.13.17`, `EPH.4.11-16`, `1CO.5.1-13`, `GAL.6.1`. These passages have actual portable Jacob Lannom commentary in `api/jacob-lannom/v1/current-commentary.json`. Their public plain-language doctrine label is **The Church**, formal doctrinal classification **Ecclesiology**, and narrow passage-relevant aliases taken from owner-provided `CGBC_Biblical_Doctrine_Taxonomy_Aliased.json`. The app verifies a matching active public SOTW commentary `scopeKey` before showing a scoped label. The chips, formal category and alias terms are displayed at the very top of the selected verse study. Empty/not-evidenced cases show no doctrine UI.

**Important provenance boundary:** The owner taxonomy is a classification-and-alias vocabulary, NOT a verse-level proof ledger. CGBC Concept Registry v2 records semantic **sermon** concepts with node evidence, not generally accepted verse-classification facts. Therefore no naive term matching or blanket assigning Christology for the word “Christ,” etc. The six tags are only a limited initial SOTW portable-commentary-backed display projection, not all-Bible doctrinal coverage and not a new authoritative doctrine registry. The original source/mirror/registries were not modified. Do not extend tags to passages without actual evidence. Current examples do NOT include Philippians 1:8.

**Checks:** GitHub readback of HTML and new JSON PASS; inline JS syntax PASS; index parsed and contains exactly six narrow ranges; original unified reader blob unchanged (`b7cb82e66859a8f8705f390644a706965d0cc265`). Direct external GitHub Pages URL was inaccessible from the browsing environment, so the anchored position and iPhone visual stacking remain **NOT VERIFIED**. The next owner iPhone test should inspect header dropdown behavior, dimming, selection, and a tagged passage such as Acts 2:41 or Ephesians 4:12. Test an untagged verse too, verifying no invented tags.

**NEXT:** Evaluate phone screenshots and design feedback, then expand doctrinal coverage only from accepted verse-anchored SOTW/CGBC evidence, with provenance; link other accepted doctrine classes (e.g. Soteriology, Christology) as source support is established. Update both ledgers and do not modify original biblical datasets.

## 2026-11-16, late evening | Correction: Webster 1828 already published in SOTW, now connected to Bible reader

**Owner correction upheld:** Prior v0.3 note claiming no verified/published SOTW Webster 1828 endpoint was **WRONG**. The source has long been available in `SOTW-Original-Languages/original-language-resources/webster1828.json` (15,432,595-byte Git blob `95d67367804509c3faa039d1e1f5d685c92a69a7`). Source license is `LICENSE_WEBSTER_SOURCE.txt` (digital transcription CC BY-SA 4.0). The pre-existing accepted `demo/word-study/app.js` has the exact working contract: `fetch('../../webster1828.json')`, dictionary index `dictionary[normalizedEnglishWord]`, entry rows `[?, definitionText, sourceRowNumber]`, and displays definition as plain text. Its README documents this feature and source provenance. This did **not** require a new upstream dataset, additional independent source research, or modifying authoritative SOTW data.

**Actual isolated-reader integration:** New app commit `79f023f3e206e4fdfea4171e5e7fcdcc3ca8ad44`, corrected by `3d1a8e99e3ca74aab554f91917af5674e0506bb6` (LATEST app blob `62374d76891586859644f0c892e4f3725abb3050`). `mobile-bible-beta/index.html` now links to the unchanged published read-only dictionary at `https://raw.githubusercontent.com/SOTW-Original-Languages/original-language-resources/main/webster1828.json`.
- In full-screen verse study, every displayed English word is an optional, discreet English-dictionary tap target, even if no valid Strong's-to-English link exists; truly source-supported Strong's targets retain the distinct accented word styling.
- Tap an English word and select “Noah Webster’s Dictionary 1828” to reveal its exact headword entries in a nested drawer. The dictionary loads **only when requested**, once per browser session, and is reused in memory. No invented stemming or word-context Greek/Hebrew semantics; missing exact entry receives a truthful notice.
- Tapping a supported original-language word first shows Strong's short definition; the same Webster lookup is also available as a separate secondary control.
- Existing CC BY-SA 4.0 attribution and source-license link are included in the dictionary view, not in the public commentary reader. External definition content is inserted with `textContent`, never executed as HTML. Webster 1828 remains explicitly separate from the `WEBSTER1833` Bible edition.
- Corrected nested dictionary overlay to preserve the permanent commentary DOM container so closing the dictionary can still return to the verse and other study tools.

**QA:** Connected GitHub source readback PASS; inline JavaScript syntax PASS; release application blob SHA above confirmed. **Actual iPhone dictionary download/lookup/render and network/browser cache behavior remain untested**; 15.4 MB download may be noticeable on a slow connection. Public Pages visual test still needs owner inspection. No changes made to SOTW dictionary, Strong's source, canonical Bible text, or the original unified commentary reader.

**Documentation supersession:** Earlier “Webster 1828 not published/connection missing” language in historical v0.3 ledger entries and Google Doc is superseded by this verified correction. Do not repeat it in future threads.

## 2026-11-16, 9:29 PM CST | v0.3 owner screenshot corrections: full-screen nested study

**STATE:** Published to same GitHub Pages repository in isolated `mobile-bible-beta/index.html`. Current app commit `53b2a0187ebc5ad44e30a009dd4202a38fc8ae18`, HTML blob `c4589d46cf7c97d6111f25e9cc1b16fc20398d2c`; functional base commit `fc0b7290fc484e1a525bff7f56f6c22484edecba`. Original `unified-commentary-reader/index.html` remains unchanged (blob `b7cb82e66859a8f8705f390644a706965d0cc265`).

**Owner evidence:** Three screenshots of Philippians 1:1 and 1:8 on iPhone showed (a) a passage chooser repeating Bible translation, (b) a lengthy commentary view with original-source metadata and JSON links, and (c) a half-screen verse sheet with a large immediately visible five-author selection list and a short Greek definition. The screenshots are evidence for the previous release, not proof that this v0.3 correction renders correctly.

**Owner's required interaction contract now implemented in code:**
1. Passage navigation chevron appears immediately adjacent to the book/chapter heading; its picker exposes *only Book, Chapter, Verse*, leaving translation exclusively in its own upper-right chooser.
2. Deliberate verse tap opens the entire viewport study surface, not a half-height pane. Scripture reader stays mounted behind it for exact return.
3. A source-verified English linked word displays *only that word's* Strong's identifier, original Hebrew/Greek headword, transliteration and concise definition. Optional “Read full Strong's entry” slides a second layer over the verse while leaving the Commentary entry accessible at the bottom. It uses available original lexical derivations, renderings and expanded source text, without inventing morphology or external definitions.
4. Commentary displays **one collapsed button initially**. Tapping opens an availability-only list of real authors; tapping one opens that author's commentary in the layered view, with Back to chooser, then Back to verse. Historical content comes from existing typed index routes; Jacob from accepted SOTW entries only.
5. Public commentary hides source JSON and internal metadata. Jacob remains identified by name but source-type chip is **Pastoral Commentary**, not “Accepted Pastoral Commentary.” Text and author/source records themselves remain unchanged.
6. Nested layers animate gently; reduce-motion preference disables animation. Light and dark styles exist for the fullscreen layout.

**Partial/pending:** The owner also requested a tappable **Noah Webster 1828 dictionary** for each supported English word. No verified, published SOTW Webster 1828 dictionary endpoint/data contract was discovered in the installed repositories; older source register treats its public-display integration as conditional upon an approved, checksum-locked transcription. Therefore no misleading Webster button was added. The Webster 1833 Bible must **not** be substituted. Add the correct dictionary lookup once separately verified and approved.

**QA / truthfulness:** The current v0.3 GitHub HTML readback passed, JavaScript parse/syntax passed and code markers for nav, full screen, nested word/author layers, suppressed JSON and accepted Jacob label were checked. Not proven yet: public Pages cache/propagation, real iPhone drawer stacking, author response loading, cross-browser gestures, true Webster dictionary integration, source semantic/rights audit. No live browser screenshot of v0.3 was produced here. Source/scheme compatibility should be tested on owner's iPhone before accepting.

**Next visual QA:** Reload https://sotw-historical-commentaries.github.io/historical-commentary-resources/mobile-bible-beta/ on iPhone. Check navigation only Book/Chapter/Verse, ASV upper-right, verse tap fullscreen, short word card, full word overlay Back, Commentary button -> authors -> one author -> Back, and no JSON/source labels. Check close returns to exact paragraph. Note any discrepancy with screenshots before further enhancements.

## 2026-11-16 | VISUAL BETA v0.2: consolidated reader redesign published

### v0.2 chapter-loader correction, same release — 2026-11-16
**LATEST v0.2 application commit:** `189a3bc1243f0bb8ea62d33cdf5961093836df17`, HTML blob `57943843affb9065e147c40245f6c003ce024a2b`. The post-redesign source review found that the original chapter load routine depended on `chooseVerse` to call `renderBible`; the first v0.2 override omitted that call, risking a blank chapter. Correction now renders new Scripture chapter data once on load while keeping ordinary study taps from rerendering/scrolling the reader. GitHub readback and inline JS syntax PASS. Genuine phone render, scroll and click behavior still require owner inspection. Previous in-section commit `f6bfcd29` is an intermediate, not the final review release.



**STATUS:** New mobile reader HTML committed to the existing public SOTW GitHub Pages repository for owner visual inspection. Exact code commit: `f6bfcd29e8666607f3819331c70e18cce951ec85` (corrected release), file blob `b40540ec5365c0e28af0a3ab03b02f702cb51778`; main redesign commit `d218ee8c6cd79cd7f0ce8a3a9ec0844811c8fff9`. The only changed app file was `mobile-bible-beta/index.html`. Existing curated repositories and `unified-commentary-reader/index.html` are unchanged.

**Public beta to inspect:** https://sotw-historical-commentaries.github.io/historical-commentary-resources/mobile-bible-beta/

**Implemented from owner-approved design:**
- Scripture is now *paragraph-first*, respecting each translation's existing `paragraph_start` records. Single verses no longer form the default tall list.
- No verse highlight/study selection is produced at initial chapter load. Scrolling by swipe does not select a verse. Separate tap gesture discriminator limits click activation during drag/momentum; actual phone verification still needed.
- A deliberate tap opens a compact single-verse sheet. Closing clears transient study highlighting and returns to the existing reader DOM/scroll position.
- Strong's-number bank is suppressed in the new sheet. For ASV1901/WEBSTER1833 only, supported exact English token indices and surface match are used to mark tappable English words. Selecting one displays its actual Strong's record. For KJV1769/BSB no false English-token alignment is asserted, so unsupported words are unmarked.
- Commentary displays a *collapsed chooser*, generated only from actual Jacob accepted coverage or historical `verse_routes`. Choosing a single author loads that content on demand; selecting again collapses it. No automatic endless six-author exposition.
- Modern unobtrusive Scripture header with prominent book/chapter, compact translation chooser and separate search/theme icons; original 4-dropdown navigation is preserved inside a quickly opened passage picker. Translation profile selector has verified text/edition labels, no fabricated cover art.
- Search dialog accepts direct book/chapter/verse references and text phrases in the current chapter, with early suggestions. **Whole-Bible full-text and concept search are not built** and are not represented as available. No auto-scroll.
- Separate state tracks reading location vs transient verse selected for study. Chapter/edition changes reset reader scroll to beginning; drawer close does not rebuild Scripture.

**QA and truthfulness:** GitHub file readback PASS; JavaScript syntax gate PASS; main original unified reader Git blob `b7cb82e66859a8f8705f390644a706965d0cc265` unchanged. An independent live site HTTP/browser render and genuine iPhone gesture/visual inspection could not be performed in this session; `web` could not access the Pages URL although prior owner screenshots established the earlier beta loaded. DO NOT CLAIM THIS REDESIGN HAS PASSED MOBILE QA.

**Rollback:** previous working HTML beta commit `e1182d7f7005c046880a8ca14dd5c8104eb9184a`, old blob `8f021b03960c0691cb9533111774077b9e099bfd`. Use a normal forward revert/recovery after confirming current GitHub branch SHA, not a force-reset that risks newer files.

**Pending beyond this inspection:** Authentic KJV and other translation cover/title-page imagery, ASV-only original-page viewer from existing verse-page indexes, full Bible search and Concept Registry collage, cross-reference back-stack, source-specific word alignment for KJV/BSB, full UI accessibility/performance/mobile gestures. No fabricated facsimile thumbnails, claims or lexical mappings.

**Owner visual QA checklist:** Refresh the public beta on iPhone. Verify clean modern book/chapter header, paragraph reading with no default highlight, scrolling without opening tools, intentional verse tap opens single-verse sheet, Close returns to same scroll, ASV English word tap shows one Strong's definition, commentary remains collapsed until selecting a real available author, theme light/dark, passage picker and search. Screenshot any flaws. Once reviewed, revise the consolidated UI, not a succession of unrelated micro-fixes.

## 2026-11-16 | Owner design decision: Paragraph reader as default; zero auto-selection

**STATUS: Approved core reading UX direction, NOT IMPLEMENTED in current mobile beta.** Supersedes earlier experimentation with line-separated verse layout as the normal reading view, and overrides current beta logic that selects/highlights verse 1 on chapter load.

**Locked behavior:**
1. **Default chapter presentation is flowing Scripture paragraphs**, honoring actual paragraph boundaries and poetic formatting from the selected translation's source where available. Small but readable verse numbers mark verse starts. Separate single-verse presentation belongs **inside the study sheet after a deliberate tap**, not as the normal page display.
2. **Initial load has no selected verse.** Do not automatically select verse 1, open a study panel, or highlight a verse simply because a chapter loads. Restored Continue Reading location or deep-linked verse may position the viewport but must not be confused with selecting a verse for study.
3. **Scrolling never selects.** Ordinary vertical swipes, touch drags, kinetic/momentum scrolling and programmatic restoration do not activate any word-study or commentary panel. Do not make the visible/centered verse a forced selected state.
4. **Only an intentional tap on a verse** changes explicit study selection and opens its compact single-verse study sheet. Design reliable mobile gesture discrimination so tapping is distinct from dragging/sliding, including on iOS Safari.
5. **Closing study** clears the transient selection highlight and restores the reader's exact paragraph scroll position, translation, chapter and reading context. Reading-position state and study-selection state are separate.
6. Changing chapters or translations keeps a readable Scripture page, with no new auto-selected verse. If reader follows a commentary Scripture reference, back navigation restores the exact study/reader context; cited-verse deep links need not automatically invoke the study sheet.
7. Selected single-verse study displays verified clickable English words and a collapsed available-only commentary chooser, as previously recorded. Do not reintroduce a top bank of raw Strong's number chips.

**Regression checks for the redesign:** Initial open has no selected styles; passive scroll doesn't activate study; momentum scroll doesn't activate; short tap does; close returns to precisely the same reader scroll; changing chapter/edition doesn't select a verse; long paragraph reading remains readable. No app code changed for this design decision. Current deployed app still uses legacy selection behavior until the consolidated redesign.

## 2026-11-16 | ASV-only historical facsimile access: owner design requirement

**STATUS: Approved direction for upcoming consolidated UI redesign. NOT IMPLEMENTED in mobile-bible-beta.** The owner has already curated/corroborated the original print scans, and mapped Scripture verses to full scanned physical pages in the independent SOTW ASV foundation. Do not rerun this original source research.

**Source inspection:** `SOTW-ASV-1901/asv-1901-resources`
- `data/asv1901/<book-slug>/page-index.json` provides `edition_id: ASV1901`, original print-PDF SHA, page coverage `first_verse`/`last_verse`, `source_pdf_page`, `printed_page`, `volume`, `volume_pdf_page`, physical page overlap/continuation data.
- `data/asv1901/micah/page-index.json`: MIC.1.1 resolves to source PDF page 939, printed page 895, volume `asv1901-micah-pages-939-943.pdf`, volume page 1. ROM has its own `romans/page-index.json`.
- `books/romans/site/index.html` already demonstrates PDF navigation by mapping the verse to the page and loading `data/asv1901/romans/facsimile/<volume>.pdf#page=<volume_pdf_page>`; its continuation control handles cases when a verse spans two source pages.
- `data/asv1901/catalog-romans.json` includes `facsimile_index: romans/page-index.json`. `books/romans/SOURCE_INVENTORY.json` identifies the print as **1901**, not 1801, and records source/provenance/hashes. The existing Princeton confirmation is owner-supplied project history, not independently re-proven in this UI-design pass.

**Placement requirements:**
1. The normal Bible reader remains uncluttered. When ASV1901 is the active translation, its translation-details profile may include a quiet **Explore original 1901 printed edition** entry, with authentic artwork and provenance.
2. Within the compact verse study sheet, conditionally show **View original printed page** only for ASV1901 verses whose page-index mapping resolves to an existing facsimile PDF. No such option for KJV, BSB, or Webster Bible 1833. No broken/empty placeholder.
3. Open in an easy-to-close image/PDF viewer showing the complete original physical page, preserving the original scan and page boundaries. Allow natural pinch zoom/pan on a phone, optional adjacent physical page/verse continuation navigation. Do not crop or pretend to map the verse to precise coordinates within the page: mapping is verse-to-**page**, not a bounding box.
4. A visible **Back to [original verse]** closes the viewer and restores the exact Scripture/study-sheet scroll position and current commentary context, preserving Continue Reading. Clicking adjacent original pages is investigation, not a reading-position change.
5. Preserve the print-page number and source page/volume metadata in the viewer without overwhelming the reading interface. Keep rights attribution in translation details, minimal in the reader.

**Release scope:** Record now; implement during core UI redesign after owner feedback consolidation, not as an independent large feature or an excuse to alter curated source datasets. No Bible Reader code was changed for this design decision.

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
