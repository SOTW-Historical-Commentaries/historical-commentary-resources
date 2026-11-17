# 00 START HERE — SERVANTS OF THE WAY BIBLE READER

**Project:** Public mobile-first SOTW Bible web app / PWA beta  
**Living handoff master:** [SOTW BIBLE READER — GOALS, DECISIONS & PROGRESS](https://docs.google.com/document/d/1ziYT4U6SN3nTQXUX5y6YXzrzfLGqQIi7vBeTPJ4GWyE/edit)  
**This repository's current reader:** [mobile-bible-beta/index.html](./index.html)  
**Beta address to test:** https://sotw-historical-commentaries.github.io/historical-commentary-resources/mobile-bible-beta/  
**Status:** Code committed to GitHub main on 2026-11-16; public Pages route is based on this same repository's already-operating unified-commentary-reader route. A direct independent browser HTTP check of this *new* URL was unavailable in the deployment session. Do not record HTTP VERIFIED until checked on a real browser.  
**Read next:** [PROGRESS_LEDGER.md](./PROGRESS_LEDGER.md)

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
