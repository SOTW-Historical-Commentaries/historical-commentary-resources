# SOTW Structured Commentary v3, Deuteronomy + Joshua: manual install

## Install gate

This is one additive **two-book** staging package, not a live deployment.
Repository: `SOTW-Historical-Commentaries/historical-commentary-resources`, branch `main`.
Baseline inspected: `6b45ce1ce65c351f275a908e2fa446a8eff684b6`. Verify the current GitHub tree before uploading.
The preexisting authoritative coverage manifest at `api/v3/navigation-coverage/v1/manifest.json`
was Git blob `2f843832bbe06fc0496e4b24b87fe78034919e46`; compare before replacing it. If modified since baseline,
reconcile its newer data instead of overwriting with this revision.

## Installation

1. Download and unzip the outer *Manual_Upload_Batches.zip* locally.
2. Open and extract **Batch 01**, then **Batch 02**, continuing in numerical order.
3. Upload the extracted contents of each batch into the GitHub repository **root**;
   preserve the `api/v3/...`, `docs/...`, `reports/...` paths. Do not upload the child ZIP itself.
4. Each batch contains at most **99 files**. All file paths are unique; there are no duplicates between batches.
5. Do not delete or replace any original v1/v2 files, Genesis–Numbers v3 chapter snapshots,
   four existing P coverage files, author metadata, Bible Tools, media player, or other features.
6. Allow the GitHub Pages deployment for the final upload commit to finish and report **success**.
7. Verify file hashes against `DEU_JOS_V3_UPLOAD_MANIFEST.json` and perform public reader checks.

## Live test pages after deployment

- Deuteronomy: https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-deuteronomy-v3.html
- Joshua: https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-joshua-v3.html

For Deuteronomy 14:1–2 JFB should show a bounded heading; 14:3 should not.
For Joshua 19:10 JFB should show *Of Zebulun* but not *Of Dan*; at 19:40 the reverse.
For Joshua 23:1–2 JFB's unstyled passage heading should display; at 23:3 it should not.
At Joshua 1:1 MHC's **Joshua to Esther** preface, KD's **Prophetical Histories** introduction,
and JFB's **Pentateuch and Historical Books** introduction should be selectable via P.
For both books default display mode is verse commentary and invalid/out-of-range P deep links must fall back to verse.

## Author attribution and source fidelity

- Six authors remain unchanged: Matthew Henry, John Calvin, Adam Clarke, JFB, Keil & Delitzsch, John Gill.
- Historical author and work as reader-facing provenance, SOTW as current provider. Do not treat digital acquisition
  provider as historical author or as historical publisher.
- Five original public-domain CrossWire/SWORD modules with native KJV passage binary indexes, HelloAO Gill.
- P headings are non-Scripture and strictly source-bounded. Source-linked indexes cannot prove every verse
  received distinct original analysis. Never infer neighboring verse coverage.
- No Bible translation text is bundled. No new author catalog or modern edition data is overwritten.
- Source entry bytes/fields remain preserved; reader-only projections and P sections are derived views.
- Read the source/provenance audit before adding any new author or expanding a group-introduction scope.

## Explicit limitations

Source preservation and JS filtering tests **passed**. Standalone Chromium could not load even local pages
(`ERR_BLOCKED_BY_ADMINISTRATOR`), so browser rendering was **not independently verified**.
The reader pages must be visually checked after public deployment.

## Source group navigation

JFB's earlier 'Introduction to Pentateuch and historical books' was saved with Genesis source data.
It is now also linked into Joshua via a source-preserving navigation record, with historical-book applicability.
The held-unmapped JFB Poetical, Prophetical, and Restoration introductions remain excluded.
Do not let source storage under Genesis 1:1 dictate their destination. Keil's Joshua opening likewise contains
historical-book group material before the Joshua book introduction and actual Joshua 1:1 exposition.

## Deliverable structure

The complete snapshot ZIP contains all uploadable repo-root files. The independent converter/audit ZIP
contains reproducible scripts and reports, not files to install in production.
All package ZIPs and all payload files are SHA-256 audited. Individual five upload batches are <=99 files.
