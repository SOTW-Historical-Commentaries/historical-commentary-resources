# 00 START HERE — SERVANTS OF THE WAY BIBLE READER

**Project:** Public mobile-first SOTW Bible web app / PWA beta  
**Living handoff master:** [SOTW BIBLE READER — GOALS, DECISIONS & PROGRESS](https://docs.google.com/document/d/1ziYT4U6SN3nTQXUX5y6YXzrzfLGqQIi7vBeTPJ4GWyE/edit)  
**This repository's current reader:** [mobile-bible-beta/index.html](./index.html)  
**Beta address to test:** https://sotw-historical-commentaries.github.io/historical-commentary-resources/mobile-bible-beta/  
**Status:** Code committed to GitHub main on 2026-11-16; public Pages route is based on this same repository's already-operating unified-commentary-reader route. A direct independent browser HTTP check of this *new* URL was unavailable in the deployment session. Do not record HTTP VERIFIED until checked on a real browser.  
**Read next:** [PROGRESS_LEDGER.md](./PROGRESS_LEDGER.md)

## CURRENT BUG FIX: v0.8, Webster 1828 words require real dictionary coverage

**Latest reader source:** `mobile-bible-beta/index.html` commit `fef737aed247164fcda784835e9f43beb176c5ac` (blob `53b02ef1fc0a7342b84b731920681713ffef9375`). Pre-fix fallback: `cc2916ec7dec45cec2d2e034819f4988badf1efc`. See `PROGRESS_LEDGER.md` for the full chronology.

**Owner screenshot demonstrated a defect:** Tapping the Noah Webster 1828 option for *disciples* opened “No exact 1828 dictionary entry” with a leftover loading message. **No-empty-controls rule applies to English dictionary entries too.** Current app checks the true published `webster1828.json` exact headword before making a word tappable for Webster or offering the dictionary. It does not invent word stems, display empty dictionary panels, or keep stale Loading text. Source-supported Strong's words remain independent and tappable where verified. A dictionary download may delay English dictionary highlighting until loaded.

**QA status:** GitHub readback and JS syntax PASS. Extracted membership function passed six controlled fixture cases. Real dictionary data loading and updated UI on iPhone **NOT YET VERIFIED**. Ask owner to refresh and retry the previously failing *disciples* example, then a documented positive-entry word. Do not call the issue closed until the phone behavior is inspected. No SOTW authoritative dictionary, Scripture text or unified commentary source files changed.

## LATEST v0.7 VISUAL CHANGE: translation selector now opens at upper right

**Latest reader app code:** commit `cc2916ec7dec45cec2d2e034819f4988badf1efc`, blob `d0cd85270d9a8d7651ec5de07de9806705b77085` in `mobile-bible-beta/index.html`. Pre-v0.7 fallback: `7cea41e75332c69454ec625753a1860119f52084`. Only this reader HTML changed; source foundations and original unified commentary reader untouched.

**Owner UI decision implemented:** Translation chooser now behaves as a mirror of the book navigator: tap KJV/ASV/etc in the upper-right header to open a drop-down panel immediately beneath it, with a dimmed reader background, responsive width/position, original edition names and metadata, and Close/selection behavior. Book dropdown remains upper-left. This replaces the old bottom-opening translation sheet.

**QA:** GitHub readback/JavaScript syntax and internal source checks passed. Owner iPhone screenshot/browser layout check is **PENDING**. Public beta: https://sotw-historical-commentaries.github.io/historical-commentary-resources/mobile-bible-beta/ . See `PROGRESS_LEDGER.md` for release details and v0.6 ASV scan/doctrine scope.

## LATEST v0.6 RELEASE / NEXT PHONE INSPECTION — 2026-11-16

**Current reader:** `mobile-bible-beta/index.html` commit `7cea41e75332c69454ec625753a1860119f52084`, blob `1934c3bccfb16bf4f9669dc16d8da0d817fa4ca7`. Separate new assets: `asv-facsimile.js` and `asv-facsimile.css`. Pre-change fallback reader commit `4868e34a216dd2b623dec4c9b26b2c726cd0203f`. Unrelated source repos and original unified reader remain unchanged. Read newest `PROGRESS_LEDGER.md` below for detailed changes and tests.

**Changes:** Passage chooser says Book/Chapter/Verse only (no explanatory sentence; no “Bible book”). Webster dictionary credit is reduced to short CC BY-SA 4.0 attribution + source/license link, with technical caveat removed from public UI. ASV1901 verses NOW have a conditional original full-page PDF scan launcher when an accepted SOTW `page-index.json` maps the selected verse, with embedded PDF preview, physical page navigation and a direct “Open full page · pinch to zoom” link; no scan button for KJV, BSB or Webster 1833. All 66 ASV book-specific original-page maps and 97 PDF volumes were observed in its existing repository tree. **Genuine iPhone Safari PDF and page preview behavior still needs inspection.**

**Doctrinal tags:** The tags were implemented in v0.5 for ONLY six evidence-backed Ecclesiology passages. They are not an all-Bible doctrinal search. Test Acts 2:41 after tapping the verse, where the mapped `ACT.2.37-41` record should show The Church / Ecclesiology and aliases at the top. Philippians 1:8 has no approved verse doctrine mapping and correctly shows nothing. If Acts 2:41 also shows nothing, treat as a genuine fetch/visibility bug to investigate next. No invented tags allowed.

**Recommended test:** Refresh https://sotw-historical-commentaries.github.io/historical-commentary-resources/mobile-bible-beta/ ; choose ASV; tap Micah 1:1 and open printed page 895 (full-page scan); then Acts 2:41 to inspect the doctrine tags. Provide screenshots of any missing control. GitHub source/JS syntax checks passed, but the new browser/iPhone output remains **NOT VERIFIED**.

## LATEST VISUAL REVIEW: v0.5 — anchored passage dropdown and source-backed doctrine chips

**CURRENT APP COMMIT:** `4868e34a216dd2b623dec4c9b26b2c726cd0203f` (`mobile-bible-beta/index.html` blob `41d7fb4ad9b989b8700bcd7c61cc3a9365c74996`). New **limited doctrine index**: `mobile-bible-beta/data/verse-doctrine-tags.v1.json`, commit `562abb268bf89caebc99732c2c3d5a21dc15c2f0`. Base before v0.5: `3d1a8e99e3ca74aab554f91917af5674e0506bb6`. Existing original `unified-commentary-reader/` and authority data untouched.

**What's new:** Book/Chapter/Verse selector now drops *from directly beneath the book/chapter title* with a dimmed background and remains open until Read Passage or Close. The rest of the reader remains readable after dismissal. Full-screen verse study now shows doctrinal label, formal category and aliases at top **only on passages with real evidence**. Initial supported group is Ecclesiology / The Church on six exact SOTW portable-commentary passages (Acts 2:37–41; Acts 6:1–7; Hebrews 13:17; Ephesians 4:11–16; 1 Corinthians 5:1–13; Galatians 6:1). No generic automatic verse tagging is authorized; a taxonomy match alone does not establish the doctrine of a verse. The app hides doctrine chips when no verified mapping is available. Philippians 1:8 has no tag in this first mapping.

**READ THIS FOR NEXT THREAD:** The owner-provided CGBC Biblical Doctrine aliased taxonomy supplies public plain labels, formal doctrinal terms, and aliases, but **not** verse membership. CGBC Concept Registry v2 is sermon-meaning evidence, not an all-verse mapping. Expand only from audited accepted passage evidence; preserve provenance. Never guess by matching a keyword. `PROGRESS_LEDGER.md` has complete source and QA status.

**QA:** GitHub code/JSON readback and inline JS syntax passed. New v0.5 GitHub Pages visual / iPhone gestures **NOT YET VERIFIED** because external Pages URL was unavailable through the checking browser. First test: open Bible, tap heading; dropdown anchors under it, page dims, Book/Chapter/Verse only. Select Acts 2:41, tap verse; see The Church / Ecclesiology plus aliases above text. Test Phil 1:8 to confirm no fabricated doctrinal chip. Report screenshots, especially full-screen drawer scroll and nav placement.

## CURRENT CORRECTION: Noah Webster 1828 dictionary is already in SOTW and now wired into beta

**LATEST APP SOURCE:** `mobile-bible-beta/index.html` commit `3d1a8e99e3ca74aab554f91917af5674e0506bb6`, blob `62374d76891586859644f0c892e4f3725abb3050`. Reader reused the already-published `SOTW-Original-Languages/original-language-resources/webster1828.json`, plus existing `demo/word-study/app.js` lookup contract. The older handoff statement that no SOTW 1828 resource existed was incorrect and is **superseded**. The historical source/digital transcription license is CC BY-SA 4.0 and is attributed inside the dictionary view.

On a verse, English words can open **Noah Webster’s Dictionary (1828)** via an explicit tap. Words having safe source-supported Strong's alignments also show their original-language short/full entry separately. 1828 dictionary data loads lazily (15.4 MB) on explicit request, with exact-normalized headword lookup, no fabricated contextual sense. GitHub commit/readback and JS syntax PASS; new iPhone dictionary behavior and public Pages render **NOT YET VERIFIED**.

**Next step:** Open the beta on phone, tap a word in Philippians 1:8 and open Noah Webster’s Dictionary, check definitions, Back, full Strong's and commentary, plus manual scroll restoration. Record actual browser evidence and any network failure in this ledger and the living Google Doc. Do not conflate the 1833 Webster Bible with this 1828 English dictionary.

## CURRENT VISUAL INSPECTION: v0.3, November 16, 2026, 9:29 PM CST

**LATEST APP SOURCE:** `mobile-bible-beta/index.html` commit `53b2a0187ebc5ad44e30a009dd4202a38fc8ae18`, Git blob `c4589d46cf7c97d6111f25e9cc1b16fc20398d2c`. GitHub readback/JS syntax PASS; public v0.3 iPhone UX QA **PENDING**. Existing `unified-commentary-reader/` source unchanged. Backup baseline for last beta: `189a3bc1243f0bb8ea62d33cdf5961093836df17`.

**Owner screenshot-driven changes:** Navigation chevron adjacent to passage, *only Book/Chapter/Verse* in its modal, separate translation chooser upper-right; fullscreen verse study; tap one supported word for original spelling/Strong's short definition, tap for full entry in reverse slide covering verse, Back closes layer; Commentary shows one collapsed launcher, tapping reveals available authors, tapping author reveals just its commentary; internal original source/JSON metadata hidden; Jacob source type labelled “Pastoral Commentary,” not “Accepted.” Unavailable content remains hidden.

**NOAH WEBSTER 1828:** Desired as a tap-to-view historical English definition, but no authorized published SOTW dictionary data endpoint found. Do not invent entries or confuse it with Webster's 1833 Bible. Mark as pending source integration, not completed.

**NEXT THREAD MUST:** Open latest progress ledger and owner screenshots from this conversation; ask owner to test refreshed v0.3 on iPhone (or inspect their next screenshots). Confirm fullscreen height, nested lexical/author sliding, safe close/return, available-only author list and source visibility; repair concrete faults first. Synchronize GitHub ledger and Google Doc after actual changes, preserving source foundations and recoverable baseline.

## CURRENT VISUAL REVIEW: v0.2, November 16, 2026

**Read this section first.** The current mobile reader is the owner's *first consolidated UI redesign*, not the earlier functional beta. Use the same GitHub Pages URL above and review on an iPhone.

**Exact deployed source state:** `mobile-bible-beta/index.html` commit `189a3bc1243f0bb8ea62d33cdf5961093836df17`, blob `57943843affb9065e147c40245f6c003ce024a2b`. The original v0.2 commit `f6bfcd29` needed a chapter-rendering correction, now fixed. Rollback baseline commit `e1182d7f7005c046880a8ca14dd5c8104eb9184a`. The `PROGRESS_LEDGER.md` in this folder is the fuller chronological record; living Google Doc is the owner-facing summary. The original unified commentary reader remains unchanged.

**Included in v0.2:** paragraph-first Scripture, no initial selection, deliberate tap to open compact single-verse sheet, no raw Strong's bank, source-supported English word links (ASV/Webster only), collapsed one-at-a-time commentary, modern header, translation profile picker, compact passage picker, reference/current-chapter search, light/dark toggle. Auto-scroll intentionally retired.

**Not yet included:** book-cover images, ASV original facsimile page viewer, entire-Bible natural text search, concept collage, full commentary cross-reference navigation and KJV/BSB direct English-word alignment. Do not mislabel these as tested features. Public render and iPhone gesture tests of v0.2 are PENDING; JavaScript syntax and GitHub file readback passed.

**Next thread:** Review owner screenshots/feedback from the v0.2 visual inspection. Fix actual usability issues in a coordinated pass, not speculative features. Update both `PROGRESS_LEDGER.md` and the linked living Google Doc with source commit and QA status. Maintain no-empty-items and no fabricated Scripture/lexical links. Preserve original user reading position when leaving tools.

## Do not confuse these two readers
- **Existing working reader**: `unified-commentary-reader/` (original preserved, unchanged).
- **New beta**: `mobile-bible-beta/` (dark/mobile-focused extension of original read-only SOTW source resolver).
The older uploaded `SOTW_Bible_Reader_Beta_Starter_2026-11-16.zip` is an independent prototype, **not** byte-identical to this deployed beta. The deployed beta deliberately reuses the current live SOTW unified commentary viewer so real historical/Jacob data can be consumed immediately. Do not overwrite either with the older ZIP.

## How the next ChatGPT development thread begins
1. Open this file and the linked living handoff Google Doc.
2. Read the newest `mobile-bible-beta/PROGRESS_LEDGER.md`, current `mobile-bible-beta/index.html`, and original `unified-commentary-reader/index.html`.
3. Inspect current GitHub main before making changes; preserve the existing working unified reader and SOTW data.
4. Test the **public Pages URL** (not just GitHub source) on phone and desktop; capture screenshots, browser console/network errors and exact routes.
5. Fix the highest-impact beta issue and update **both** living Google Doc and this repo ledger with exact commits, tests, blockers and next step.
6. Do not reharvest/recertify Scripture research or alter CGBC player/authoritative SOTW data foundations as part of ordinary reader UI work.

## Locked experience
Dark charcoal/soft gray by default, optional light mode; verse-by-verse and flowing paragraph modes, quick Book → Chapter → Verse; tap verse opens bottom study panel, X/outside tap returns to Scripture. Data-based visibility only: hide unavailable author and empty sections. Four translations switch independently of commentary. Historical authors are original attributed voices; Jacob only if actual accepted coverage. Scripture citations in commentary should ultimately be tappable with easy Back. Strong's and morphology only when source-supported. Local resume/preferences and adjustable auto-scroll/pause. Volumes and concept collage only once genuinely indexed contents are present. Minimal source citations in visible reader.

## First task for the next thread
Open the new public URL and verify chapter/verse, KJV/ASV/BSB/Webster switches, actual Jacob/historical coverage, drawer close, dark/light, scroll and PWA install. Then implement Scripture-reference links with a reversible in-reader passage overlay and full passage-scope commentary without regressions. 
