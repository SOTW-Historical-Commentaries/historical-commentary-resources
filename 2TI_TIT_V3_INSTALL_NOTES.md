# Manual install: 2 Timothy + Titus (SOTW v3)

**This is a new two-book, owner-upload-only staging package. It does not edit GitHub.**

## Baseline guard (check this immediately before uploading)
- GitHub repository: `SOTW-Historical-Commentaries/historical-commentary-resources`
- Main commit verified during preparation: `b9bdb2d9d830e70868aed8a9b3607235ab3f224e`
- Cumulative navigation manifest Git blob: `60b4fce758907627408659b8a6db9b5ac7f2e3ae`
- Existing 54 books must remain unchanged. If either GitHub marker has advanced, **STOP and reconcile rather than overwriting newer data**.

## Install in order
1. Unzip the outer archive locally.
2. Extract `UPLOAD_BATCH_01_2TI_TIT_ADD_FILES.zip` and upload its **contents at repository root**, retaining folders. Do not upload the ZIP file itself. The first batch is additive only.
3. Compare the uploaded paths and Git blob hashes against `2TI_TIT_V3_UPLOAD_MANIFEST.json`.
4. Only after the entire first batch is installed and verified, extract `UPLOAD_BATCH_02_FINAL_CUMULATIVE_NAV.zip` and upload `api/v3/navigation-coverage/v1/manifest.json` LAST. This is the one existing file deliberately updated.
5. Confirm the cumulative navigation manifest lists **56** books, ending with `2TI`, `TIT`. Confirm the latest GitHub Pages deployment for the final commit succeeds.
6. Open and visually test both new readers, a shared long-record range, Gill verse anchors, original P introductions, chapter/verse switching, a source gap, missing K&D coverage, mobile layout, and deep links.

## Reader URLs after installation
- 2 Timothy: https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-second-timothy-v3.html
- Titus: https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-titus-v3.html

## Scope and protections
- Six original historical author lanes; Keil & Delitzsch explicitly unavailable in the New Testament.
- Five SWORD authors retain original OSIS and native zCom/zCom4 record boundaries/verse index. John Gill retains explicit HelloAO anchors.
- Separate book/chapter P sections are source-anchored; verse zero is never fabricated.
- Existing 54 snapshot books and their previous navigation counts are retained. No CGBC media player or CGBC sermon SPP changes.
- Release status: **PREPARED / NOT INSTALLED / STAGING**, with live visual acceptance pending.
