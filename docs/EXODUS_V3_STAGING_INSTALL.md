# Servants of the Way | Exodus structured historical commentary v3

**Status: additive staging, manual owner upload only.** This publication does not change Genesis, the v1/v2 APIs, the repository homepage, ASV Bible source files, the CGBC player, or the SPP.

## Package layout

- `api/v3/snapshots/structured-exodus-2026-11-03/manifest.json`: Exodus-only pinned snapshot descriptor. The existing root `api/v3/manifest.json` stays the accepted Genesis v3 pilot; **do not overwrite it**.
- `api/v3/snapshots/structured-exodus-2026-11-03/index/EXO/1.json` through `40.json`: verse routes and separate non-Scripture `P` navigation for all six authors.
- `api/v3/snapshots/structured-exodus-2026-11-03/authors/{author}/EXO/{chapter}.json`: immutable source contents and display projections.
- `review-exodus-v3.html`: standalone staging reader, with historical author metadata read from the existing `api/v3/authors.json`.
- `reports/EXODUS_V3_NAVIGATION_AUDIT.json` and `reports/EXODUS_V3_INDEPENDENT_VERIFICATION.json`: local audit evidence.
- `EXODUS_UPLOAD_MANIFEST.json`: SHA-256 inventory of files in this upload.

## Installation

Unzip the numbered batch archive. For each batch, upload its *contents* at the GitHub repository root, preserving `api/v3/snapshots/...`, `docs/...`, `reports/...` and `review-exodus-v3.html`. **Do not upload ZIPs themselves to Git history.** Each batch stays below the GitHub 100-file upload limit. Do not delete or replace `review-v3.html`, `index.html`, `api/v3/manifest.json`, `api/v3/authors.json`, or any existing Genesis files.

After GitHub Pages successfully deploys, the review page should be:

`https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-exodus-v3.html`

Example additive JSON path:

`api/v3/snapshots/structured-exodus-2026-11-03/index/EXO/1.json`

The public browser/HTTP deployment is unverified until owner installs the files and checks the rendered page.

## Source and display policy

Use original CrossWire/SWORD text + its own binary-index verse links for Matthew Henry, Calvin, Adam Clarke, Jamieson-Fausset-Brown and Keil & Delitzsch. Use HelloAO for John Gill or whole chapters absent in SWORD. No adjacent-entry verse inference or silent cross-edition mixing. Six introduction-only source records are excluded *only from verse display*, while their original complete text remains intact and visible under `P` navigation.

SOTW is the current public resource provider, not the historical author or copyright owner. The display leads with the historical creator and work. SWORD/HelloAO acquisition metadata, module/edition notices and hashes remain in the original source entries for technical tracing. Dates from the shared author catalog describing specifically **Genesis** are not displayed as publication years for Exodus.

`P` is a non-Scripture namespace (book preface `EXO:P:book-preface`, chapter introductions `EXO.2:P:chapter-introduction`). It is not verse 0. Scriptural verse/range IDs remain `EXO.1.2`, `EXO.1.1-7` etc. The same source-neutral identity contract may later be used for separately authorized contemporary commentary; none is added here.

## Validation

The local independent audit passed 52,404 checks across all 40 Exodus chapters, six authors, 3,122 original records, 124 `P` sections and 5,347 verse-author routes. A browser DOM exercise ran with the generated JSON and a mocked static fetch, including Exodus 1:2 range comparison, book introduction selection, and Exodus 2 navigation. That is **not** a live GitHub Pages HTTP test. No source ZIPs were modified.

## Important limitations

- A SWORD index shared-record range is a native record link, not a claim that its prose discusses every verse with equal depth.
- Original editorial headings and modern printed edition features are preserved as evidence of the selected digital edition, not silently assigned to the historical author.
- Page/reader does not bundle Scripture translation text, does not modify CGBC/ASV, and is not a production cutover.
- This is a second *book-scoped immutable snapshot*. Publishing a future global catalog for multiple books should refer to both the Genesis and Exodus snapshots, rather than rewriting the Genesis snapshot or conflating version IDs.
