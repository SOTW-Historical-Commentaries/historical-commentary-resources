# SOTW v3, Judges + Ruth: complete two-book staging manual upload

## Release identity and gate

- Repository: `SOTW-Historical-Commentaries/historical-commentary-resources`; target branch `main`.
- Baseline GitHub main: `74598e23df53271f6eb788a7969e7387bca4d8eb`.
- Existing navigation manifest: `api/v3/navigation-coverage/v1/manifest.json`, Git blob `0f0b97b6d22f67a12346646b40dc8825067f0c25`.
- New snapshots: `structured-judges-2026-11-05` (JDG; 21 chapters), `structured-ruth-2026-11-05` (RUT; 4 chapters).
- Books release together only, with Matthew Henry, John Calvin, Adam Clarke, Jamieson–Fausset–Brown, Keil & Delitzsch and John Gill each represented in every chapter. Absent original records are **explicitly unavailable**, not synthesized or supplemented from adjacent anchors.
- Publication state: `STAGING_NOT_PRODUCTION`. Upload is an owner action, not permission for AI direct repository changes.

## How to install

1. Download the outer **SOTW_Judges_Ruth_v3_Manual_Upload_Batches.zip**, then extract the outer ZIP locally.
2. Extract `Batch_01_UPLOAD_TO_REPOSITORY_ROOT.zip`. Open the extracted folder and upload its **contents** (the `api/`, `docs/`, `reports/`, `review-*.html`, and root manifest paths) into the GitHub repository **root**. Do not upload a child ZIP file directly.
3. Repeat for `Batch_02_...zip` and any other numbered batches, in ascending order. Every child archive has at most 99 files. Preserve nested paths exactly; allow the single existing `api/v3/navigation-coverage/v1/manifest.json` to be updated only after confirming the live baseline matches.
4. Do **not** delete or replace old `GEN`, `EXO`, `LEV`, `NUM`, `DEU`, `JOS` chapters, existing per-book P coverage, original author catalogs, quote data, media player, Bible Tools, or other production files.
5. Confirm every file against the uploaded `JDG_RUT_V3_UPLOAD_MANIFEST.json` SHA-256 table. Compare new branch state to the baseline for only the intended additive changes.
6. Wait for the last uploaded commit's GitHub Pages workflow to report **success**; check reader HTML visually on desktop and mobile. Static QA **cannot** establish a successful deployment or live browser appearance.

If the `main` head or installed coverage-manifest Git blob has changed, **stop and reconcile** newer changes before overwriting any file.

## Live reader paths after owner upload and Pages success

- Judges: https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-judges-v3.html
- Ruth: https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-ruth-v3.html

Test chapter first and last verses, all six author selections, All commentators, verse mode by default, and meaningful P scopes. Test invalid or out-of-bounds P links resetting to verse mode. Specifically inspect:

- **Judges 3:7 through Judges 5:31** Keil & Delitzsch source-bounded passage overview, including a Judges 4 middle-verse and exclusion of 3:6 and 6:1.
- **JFB Prophetical Books** group introduction eligible in Judges only from JFB's explicit former-prophets discussion; do **not** offer it in Ruth. The original source stays at the immutable Genesis 1 record.
- **JFB Historical Books** introduction and Matthew Henry's **Joshua–Esther volume preface** in both books; Keil & Delitzsch's **Prophetical Histories** intro is eligible in Judges but not Ruth, consistent with its own source.
- **John Calvin** unavailable for both books in the selected source archives. This is a source-coverage disclosure, not a failure to harvest.
- Source-backed P titles only, no Scripture `verse zero`; a book introduction is not automatically verse commentary, nor is a SWORD shared-record range proof of individual exposition at every verse.

## Source and verification record

- The five exact original CrossWire/SWORD module ZIPs were SHA-256 checked against the accepted Joshua book source identities and decoded with their **native** KJV OT zCom/zCom4 binary verse indexes. Those original text and index records remain source-coupled.
- Original HelloAO John Gill per-verse anchors and introductory sections remain separate from SWORD; alternate HelloAO content is used only for entire source-empty SWORD chapters, never as an overlay on existing SWORD commentary.
- Six archive fingerprints, exact source record bytes, indexed routes, per-book verse counts, P fragment spans and source hashes were independently audited: see `reports/JDG_RUT_INDEPENDENT_VERIFICATION.json`.
- Browser-compatible JavaScript was syntax-checked and executed against actual staging JSON with simulated DOM/fetch: see `reports/JDG_RUT_ACTUAL_READER_JS_TESTS.json`. This is not a claim of independent browser verification.
- Chromium could not load the local staging URL due to `ERR_BLOCKED_BY_ADMINISTRATOR`, documented in `reports/JDG_RUT_BROWSER_SMOKE_TEST.json`. Owner public visual tests are still required after upload.
- No Bible translation verse text has been bundled. Historical source editions and their original rights declarations remain attached to each record.
- SOTW is the current serving provider, not the historical author or publisher. Original author/work attribution leads. No direct changes to CGBC REV6/SPP, media player, or Bible Tools production UI.

## Source transparency and content limitations

The package is **content and source-audit complete as a staging manual-upload artifact**; live browser verification and Pages success necessarily occur *after* the owner uploads it. A CrossWire verse-index range identifies a shared original source record, **not** independent exposition of each verse. Original source text remains unaltered in chapter JSON; any display-only P extraction is a versioned projection. When the selected original edition has no entry, the chapter/index states that transparently.
