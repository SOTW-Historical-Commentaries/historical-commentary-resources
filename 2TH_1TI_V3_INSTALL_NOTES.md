# Manual install: 2 Thessalonians + 1 Timothy (SOTW v3)

Two numbered ZIP batches hold repository-root-relative files. **This package does not write to GitHub.**

**Before uploading** verify main commit `f56c7c94165009808d88ca8feb1e3550fbe7c080` and `api/v3/navigation-coverage/v1/manifest.json` Git blob `c65f7343698f72a66d91ee2d209ad7cbc6a22a69`. If either has advanced, STOP and reconcile to avoid overwriting newer books.

1. Extract outer ZIP, then extract `UPLOAD_BATCH_01_2TH_1TI_ADD_FILES.zip`. Upload all contained paths and nested folders to repository ROOT, preserving paths. Do not upload the ZIP itself.
2. Confirm files are installed and match `2TH_1TI_V3_UPLOAD_MANIFEST.json` Git blob hashes (or SHA-256 local hashes).
3. ONLY AFTER all first-batch uploads, extract `UPLOAD_BATCH_02_FINAL_CUMULATIVE_NAV.zip` and replace `api/v3/navigation-coverage/v1/manifest.json`. Keep all prior 52 books and pointers untouched.
4. Verify latest GitHub Pages build success at final upload commit, confirm the cumulative manifest now lists 54 books, then open both readers and inspect a few verses, P prefaces, unavailable Keil & Delitzsch, deep links, and mobile controls.

**2 Thessalonians reader:** https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-second-thessalonians-v3.html

**1 Timothy reader:** https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-first-timothy-v3.html

STATUS: STAGING_NOT_PRODUCTION; owner visual acceptance and repository publication pending. No CGBC player change, no automatic deployment, no SPP adjustment.
