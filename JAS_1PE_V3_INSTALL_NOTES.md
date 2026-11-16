# SOTW manual installation: James and 1 Peter (v3)

**New canonical books 59-60. STAGING, NOT PRODUCTION.** Prepared from SHA-verified original SWORD modules + HelloAO John Gill, source-indexed and unedited.

## Pre-install compare (REQUIRED)
- Pinned GitHub main: `7b6657f74b42c396eea19d3cfdf9a77c3f643c25`
- Pinned `api/v3/navigation-coverage/v1/manifest.json` Git blob: `e5f265abdfc3fbb154eb0cca70e3c45231e9dbb1`
- Correct current cumulative manifest: 58 canonical books, ending in HEB.
- If either changed since this package was built: **STOP and reconcile first**. Do not overwrite newer books or schema changes.

## Manual owner upload
1. Unzip the outer package locally, then extract `UPLOAD_BATCH_01_JAS_1PE_ADD_FILES.zip`. Upload its file/folder contents to the **repository root**, preserving nested relative paths. Do **NOT** upload the ZIP file itself.
2. Compare all uploaded files with `JAS_1PE_V3_UPLOAD_MANIFEST.json` SHA-256 and/or Git blob hashes. Verify 10 chapter indexes, 60 author-chapter files and both independent book snapshots; keep earlier 58 immutable.
3. **LAST**, extract `UPLOAD_BATCH_02_FINAL_60_BOOK_NAV.zip` and replace only `api/v3/navigation-coverage/v1/manifest.json`. This must advance 58 to 60 books without changing prior hashes, IDs or counts.
4. Verify the final GitHub main commit, file integrity and successful Pages workflow for that **same** commit. Check the two readers on desktop and mobile, with verse and P deep links and all six author choices.

## Readers
- James: https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-james-v3.html
- 1 Peter: https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-first-peter-v3.html

Notes: KJV is the coordinate/versification key, **not** embedded Bible text. Keil & Delitzsch original OT-only work is explicitly unavailable here. No neighbor-range fabrication, no HelloAO text grafted on existing SWORD chapters. Original historical source texts are preserved, all P sections are source fragments. Author claims are historical opinions, not modern SOTW theological endorsement. This release does not edit CGBC or GitHub.
