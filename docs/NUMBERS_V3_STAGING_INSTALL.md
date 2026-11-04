# Numbers v3 | Structured Historical Commentary Library | Additive Staging

**Status:** ready for manual GitHub installation, not deployed and not promoted to the primary library manifest.

## Install paths and guarantees

Only add `api/v3/snapshots/structured-numbers-2026-11-03/`, `review-numbers-v3.html`, `docs/NUMBERS_V3_STAGING_INSTALL.md`, `reports/NUMBERS_*.json`, and `NUMBERS_V3_UPLOAD_MANIFEST.json`. Do not overwrite the root website, the shared `api/v3/authors.json` or `api/v3/navigation-schema.json`, the top-level `api/v3/manifest.json`, or any Genesis, Exodus, Leviticus, v1/v2 file. The new review page fetches the installed shared author catalog.

## Content and index

- Numbers 1–36: **36 chapter indexes** and **216 six-author chapter records**.
- CrossWire/SWORD original commentaries and their own native KJV-coordinate passage indexes for Henry, Calvin, Clarke, Jamieson-Fausset-Brown, and Keil & Delitzsch.
- HelloAO John Gill's original entry text and explicit verse anchors.
- **2,695** original entries, **2,675** reader-visible verse entries, **5,391** indexed verse/author routes, **149** non-Scripture P navigation sections. No missing chapter-author records.
- **20** introduction-only records not displayed as verse commentary; **90** records with source-boundary display projections. Original raw SWORD OSIS, HelloAO text, stable IDs, rights and source hashes remain intact.
- Book intro and preparatory overview in Keil & Delitzsch NUM.1 are independently selectable under P navigation; native Num 1:1 commentary remains a verse entry. The overview includes broad Numbers 1–10 material and is not asserted to cover every verse.
- `NUM:P`, `NUM.<chapter>:P`, and `NUM.<chapter>.<verse>` remain distinct. No fictitious verse 0, no adjacent-verse inference, no theological interpretation/ranking, no modification to CGBC or Jake commentary.
- Keep historical author, work and supported dates visible; Servants of the Way is the current publisher/provider. Digital acquisition details remain traceable as supporting metadata, not public headline attribution.

## Verification

- Independent original-field and verse-route audit: **46,117 passed**, zero failures.
- Independent fragment/source span audit: **2,933 checks**, zero failures (see `reports/NUMBERS_EXTRACTION_SPAN_AUDIT.json`).
- Chromium test with real generated local JSON injected by a test-only fetch mock: **15 passed**. This is not proof that GitHub Pages HTTP deployed.
- Original source archives and earlier book snapshots are left untouched. Full package byte checks and ZIP integrity are recorded separately.

## Manual installation

1. Extract `SOTW_Structured_Numbers_v3_Manual_Upload_Batches.zip`.
2. Open each numbered ZIP, and upload its **contents** to the repository root, maintaining exact paths. Never upload an unexpanded batch ZIP as repository content.
3. Commit each batch in numerical order. GitHub's web uploader may require using a local directory preserving `api/v3/...` nesting.
4. Check GitHub Pages has successfully deployed the last commit, then open:
   `https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-numbers-v3.html`
5. Compare Numbers 1:1 in Matthew Henry, John Gill and Keil & Delitzsch, and select Keil's separate `P` introduction and overview.

## Reproducibility

Run the packaged Python scripts against the six unchanged local source archives:

```bash
python3 scripts/build_unified_commentaries.py --inputs /path/to/original-archives --versification config/KJV_BOOK_CHAPTER_VERSE_COUNTS.json --books NUM --output /tmp/numbers-v2
python3 scripts/build_numbers_v3.py --v2-output /tmp/numbers-v2 --output /tmp/numbers-v3
python3 scripts/verify_numbers_v3.py --v2-output /tmp/numbers-v2 --output /tmp/numbers-v3
```

Python 3.9+ standard library only for converter. The supplied source ZIPs are not redistributed in the converter package. KJV refers to passage numbering, not bundled Bible Scripture text.
