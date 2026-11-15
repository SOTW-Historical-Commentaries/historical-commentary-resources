# Manual install: Philemon + Hebrews (SOTW historical commentary v3)

**STATUS: STAGING_NOT_PRODUCTION / LOCAL PACKAGE ONLY.** No GitHub or CGBC files were changed.

## Mandatory predecessor gate

At creation the LIVE repository has **54 books**, ending in 2 Thessalonians + 1 Timothy, at main commit `b9bdb2d9d830e70868aed8a9b3607235ab3f224e` and navigation Git blob `60b4fce758907627408659b8a6db9b5ac7f2e3ae`.

**FIRST install the separately delivered 2 Timothy + Titus package.** It must make 56 book IDs ending `2TI,TIT` and set navigation Git blob `c1c4d7bb2a1e13a35b945134211dad7189cacca4` (SHA-256 `e455ca5ab5212c4d47471719ad70a177e37a8f105f17e3244fde9a8295cbdf1d`), with all those files installed and GitHub Pages successful. If the live repo differs from that expected exact predecessor manifest, **STOP and reconcile**. Do not overwrite a newer navigation manifest.

## Installation

1. Extract this outer package. **Do not upload ZIP files themselves.** Preserve every nested path from repository root.
2. Upload `UPLOAD_BATCH_01_PHM_HEB_ADD_FILES.zip` files. Confirm all destination paths, hashes, and no overwrite of older snapshots.
3. Upload `UPLOAD_BATCH_02_PHM_HEB_ADD_FILES.zip` files. Confirm all destination paths, hashes and reader pages.
4. After both additive batches are fully installed, upload `UPLOAD_BATCH_03_FINAL_CUMULATIVE_NAV.zip` **LAST**, replacing only `api/v3/navigation-coverage/v1/manifest.json`.
5. Check latest live GitHub Pages action for final commit. Verify 58/66 books in exact canon order and preserved old 56 snapshot IDs and source counts.
6. Open `https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-philemon-v3.html` and `https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-hebrews-v3.html`. Check verse and P modes, missing Keil & Delitzsch, deep links, chapter boundaries and phone layout.

## SOTW integrity / source rules

* The original historical author retains authorship. CrossWire and HelloAO remain digital provenance. Translation selection is independent.
* The five SWORD archives are checked against their original ZIP SHA-256 and indexed using the **same source's native NT binary keys**. HelloAO is Gill's native original anchor set and only an entire-chapter fallback otherwise. No fabricated text or neighboring-verse infill.
* Non-verse P material is original source bounded; eligibility is in the book-specific coverage overlays, not in legacy navigation_routes.
* Preserve all existing book snapshots. This release only adds the two books and replaces the cumulative navigation manifest **last**.
* Reader JavaScript syntax and local headless Chromium button/P interaction tests passed with original generated JSON supplied via mocked fetch. Real deployed GitHub Pages/URL acceptance is **not tested** and this remains STAGING.
