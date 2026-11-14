# SOTW Historical Commentary Library | Ephesians + Philippians paired release

**Status:** source-locked staging review, not promoted production.
**Baseline:** `main` @ `8d6d9a6cb668b7306e92d2c0f39de624fedb5599`; cumulative navigation Git blob `bdfd07aac43ae688ba39ec88b614764787e81b24`.
**Publisher/provider:** Servants of the Way Commentary Library. Original historical authors retain credit.

## Install steps (owner only)

1. Recheck live `main`: it must still match the baseline commit and cumulative-navigation blob above. **Stop if it changed**, and reconcile before upload.
2. Extract `UPLOAD_BATCH_01_EPH_PHP_ADD_FILES.zip` and add its contents at the repository root. Preserve all nested folders and filenames. Confirm the commit, files and both new readers are present.
3. Only after batch 1 is complete, extract `UPLOAD_BATCH_02_FINAL_CUMULATIVE_NAV.zip` and replace `api/v3/navigation-coverage/v1/manifest.json`. This cumulative manifest includes all 48 existing books plus EPH and PHP. Do not discard older books.
4. Verify the uploaded files against `EPH_PHP_V3_UPLOAD_MANIFEST.json` SHA-256 and Git-blob SHA fields, then verify successful GitHub Pages deployment for the final commit.
5. Visually inspect both readers, verse selection and P scope boundaries in the *public* browser. The local interaction tests passed but live visual acceptance is still owner-pending.

**After installation, not before:**
- Ephesians: https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-ephesians-v3.html
- Philippians: https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-philippians-v3.html

## Source and navigation guarantees

- Original SWORD `zCom`/`zCom4` NT binary verse/range source keys, SHA-256 of exact OSIS payloads, and edition/rights metadata retained for MHC, Calvin, Clarke and JFB.
- Original HelloAO John Gill explicitly numbered verse items used; no false inherited spans.
- Keil & Delitzsch is correctly unavailable for the New Testament. No HelloAO verse-by-verse overlay or fabricated substitute.
- Non-Scripture `P` uses original book/chapter/passage evidence and inclusive source-supported verse ranges only.
- Source P fragments link back to the immutable chapter JSON with exact character spans/hash or HelloAO source object hash.
- Scripture Bible translation text is not embedded or changed by these commentary files.
- No previous snapshots, prior book P files, held-unmapped group intros, author catalog, CGBC SPP, or CGBC player files are changed.
- GitHub Pages deployment success does not substitute for final owner visual checks.

## Counts

| Book | Chapters | Verses | Author chapter records | Exact source entries | Source P sections | Indexed verse-author pointers |
|---|---:|---:|---:|---:|---:|---:|
| Ephesians | 6 | 155 | 36 | 626 | 44 | 764 |
| Philippians | 4 | 104 | 24 | 421 | 36 | 507 |

### Local audits

- **PASS:** 788 native SWORD source record payload byte/hash checks, all 259 John Gill source verse items, 1,271 route pointers, 80 P section hashes, all 60 source chapter files and ten indexes.
- **PASS:** 16 local Chromium interaction checks for the two readers, including source gaps, original P, chapter boundaries and responsive width.
- **PENDING:** public live visual acceptance after owner upload.

No automatic GitHub upload or deployment is authorized or performed by this release.
