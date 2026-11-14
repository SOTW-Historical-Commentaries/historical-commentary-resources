# Manual install: Colossians + 1 Thessalonians (SOTW v3)

Two numbered ZIP batches hold repository-root-relative files. **This package does not write to GitHub.**

**Before uploading** verify main commit `bdadbef0e25f1d50d0604fdad079eb0166ea26b4` and `api/v3/navigation-coverage/v1/manifest.json` Git blob `51e7264b59540cab471277b7513639cd71a4051f`. If either has advanced, STOP and reconcile to avoid overwriting newer books.

1. Extract outer ZIP, then extract `UPLOAD_BATCH_01_COL_1TH_ADD_FILES.zip`. Upload all contained paths and nested folders to repository ROOT, preserving paths. Do not upload the ZIP itself.
2. Confirm files are installed and match `COL_1TH_V3_UPLOAD_MANIFEST.json` Git blob hashes (or SHA-256 local hashes).
3. ONLY AFTER all first-batch uploads, extract `UPLOAD_BATCH_02_FINAL_CUMULATIVE_NAV.zip` and replace `api/v3/navigation-coverage/v1/manifest.json`. Keep all prior 50 books and pointers untouched.
4. Verify latest GitHub Pages build success at final upload commit, confirm the cumulative manifest now lists 52 books, then open both readers and inspect a few verses, P prefaces, unavailable Keil & Delitzsch, deep links, and mobile controls.

**Colossians reader:** https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-colossians-v3.html

**1 Thessalonians reader:** https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-first-thessalonians-v3.html

STATUS: STAGING_NOT_PRODUCTION; owner visual acceptance and repository publication pending. No CGBC player change, no automatic deployment, no SPP adjustment.
