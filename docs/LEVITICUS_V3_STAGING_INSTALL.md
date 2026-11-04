# Servants of the Way | Structured Historical Commentary Library | Leviticus v3

**Status: STAGING, manual installation only.** The existing Genesis and Exodus snapshots and their review readers are unchanged. This package adds a Leviticus snapshot and a separate page `review-leviticus-v3.html`.

## Install by GitHub browser upload

Download the separately provided three-batch ZIP, extract the outer ZIP, and open each numbered batch ZIP in order. For each batch, upload **its contents** to the root of `SOTW-Historical-Commentaries/historical-commentary-resources` while preserving paths. Do **not** upload the batch ZIP files themselves. Each batch contains fewer than 99 files. After committing all three, the page is expected at:

https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-leviticus-v3.html

The source API is versioned and immutable under `api/v3/snapshots/structured-leviticus-2026-11-03`. This package does not replace `api/v3/authors.json`, `api/v3/navigation-schema.json`, `api/v3/manifest.json`, the root index or any prior snapshots. The review page uses the already-installed shared `api/v3/authors.json` and the new Leviticus snapshot manifest.

## Inventory and behavior

- 27 chapters × 6 authors = 162 chapter-author records; 27 chapter indexes; one book snapshot manifest.
- Five SWORD source modules supply commentary text together with their original binary passage index; original HelloAO John Gill JSON supplies explicit verse anchors. No cross-edition text mixing and no adjoining-verse inference.
- All 1,961 original source entries remain intact; 115 separately identified source-based nonverse P navigation sections; 17 introduction-only entries not shown as verse commentary. Source-backed verse routes: 3,673.
- Keil & Delitzsch Leviticus 1 introductory survey is separated into book-level P sections by its source title boundaries; the original indexed record is preserved unchanged. The P sections are not misrepresented as direct commentary on verses 1–2.
- Adam Clarke's numbered verse entries appear separately from his chapter summaries where a source Verse 1 boundary exists; summary-only records become P entries.
- Matthew Henry and JFB retain their actual verse ranges with section headings and P material separated when explicit source markup supports it.
- Public author and work attribution uses Servants of the Way as distributor/provider. Original digital acquisition, module version, archive hash, rights and exact source record IDs remain in source JSON; no claim of text ownership.
- `P` is a non-Scripture navigation namespace, not verse 0, and is shared with the Genesis and Exodus scheme and future appropriately authorized commentators. No Jake material was added.

## Independent verification

`reports/LEVITICUS_V3_INDEPENDENT_VERIFICATION.json` cross-checks each generated Leviticus record against the unchanged source-consistent v2 intermediate, preserving every original entry field, source identity, source spans, hashes, verse routes and P links. `reports/LEVITICUS_V3_BROWSER_SMOKE_TEST.json` documents local Chromium tests with actual generated chapter JSON injected through a test-only fetch mock, not a live GitHub Pages HTTP test. Independent verification of the public Pages URL must follow installation.

## Book/edition caveats

- KJV in the source metadata is a **versification coordinate system**, not bundled KJV Scripture text. Bible translations remain independently fetched by Bible Tools.
- Shared SWORD record links are authentic navigation associations, not proof every verse has independent analysis.
- Source title boundaries are useful for P separation but might contain editorial context. Original text remains stored and recoverable.
- The shared author catalog's Calvin Genesis-specific publication year must not be presented as the Leviticus commentary's publication year.
- Do not merge this staging snapshot into the root website or replace existing API manifests without a separate validated approval.
