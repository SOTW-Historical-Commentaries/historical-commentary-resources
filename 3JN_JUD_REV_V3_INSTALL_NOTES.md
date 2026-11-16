# SOTW Historical Commentary Library | FINAL THREE BOOKS (64–66)

**3 John · Jude · Revelation | 66-book staging completeness package.**
**Local source/index/P audit PASS; local desktop/mobile simulated reader checks PASS.**
**NOT UPLOADED. GitHub Pages and live visual acceptance are NOT VERIFIED for these three books.**

## Baseline precheck (mandatory before owner upload)

Repository: https://github.com/SOTW-Historical-Commentaries/historical-commentary-resources
- Required `main` at packaging: `d007cb8a34aa8a4709b06903cb3cb204e3d7f0d9`
- Required `api/v3/navigation-coverage/v1/manifest.json` **Git blob**: `68959d9b885405d42331a296c253c302fafe5867`
- Required corresponding SHA-256: `fbe11e5fb75042a45eca6dd3d87fabc956e8631c849b0593cb6ecbfbc5601202`
- Expected starting navigation: exactly 63 books ending `2PE`, `1JN`, `2JN`.

If `main` or its cumulative NAV file has advanced after this build, **STOP AND RECONCILE** against newer changes before applying the final NAV. Do not overwrite newer material.

## Exact owner upload sequence

1. Extract the OUTER archive. Upload **the unzipped file/folder contents** of `UPLOAD_BATCH_01_3JN_JUD_REV_ADD.zip` to the GitHub **repository root**, preserving all relative paths. Do NOT upload the batch ZIP itself into the repository.
2. Upload **the unzipped contents** of `UPLOAD_BATCH_02_3JN_JUD_REV_ADD.zip`, also at the repository root. Both of these batches contain NEW additive files only, no original snapshot or reader replacements.
3. Verify GitHub files against `3JN_JUD_REV_V3_UPLOAD_MANIFEST.json` SHA-256 or Git blob hashes; verify `3JN` and `JUD` 1 chapter each, `REV` 22 chapters, all 6 historical author lanes, and 24 chapter indexes.
4. Upload `UPLOAD_BATCH_03_FINAL_66_BOOK_NAV.zip` contents **LAST**, replacing only `api/v3/navigation-coverage/v1/manifest.json` once the earlier 63 identities/section counts are preserved. This is the sole existing-file replacement.
5. Verify after the FINAL commit: all 66 book keys and snapshot IDs, all manifest-listed file SHA/Git blobs, preserved prior 63 tree hashes and successful GitHub Pages deployment **for that final commit**.
6. Visually inspect all three review readers on desktop and mobile, with author selection, first/last chapter/verse, P-introduction mode, unavailable historical sources and navigation deep links. Do not call live visual acceptance passed until this check.

## Readers (will be live after owner installation + successful Pages)

- https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-third-john-v3.html
- https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-jude-v3.html
- https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-revelation-v3.html

## Evidence boundaries and author accuracy

- Native CrossWire/SWORD five-source edition indexes and OSIS original text were extracted with immutable block, byte offset, length and entry hash. John Gill is HelloAO original, with only explicit per-verse source anchors. No inferred neighbor verse ranges.
- Matthew Henry's source-completion credits are part of the ORIGINAL digital work and not silently attributed to Henry personally: 3 John credits **John Reynolds**, Jude credits **John Billingsley**. Review reader author buttons disclose these contributor credits.
- The original JFB source's preceding Second and Third John shared heading/introduction is preserved in the immutable 2 John snapshot, and two new 3 John P routes point back to the original source, with its original section IDs, pointer and SHA-256. The 2 John source file is not replaced.
- Calvin has no source coverage for 3 John or Revelation in these accepted original datasets; Keil & Delitzsch is Old-Testament only. Their unavailability stays explicit. Calvin's actual Jude commentary is preserved without neighboring verse infill.
- Some original SWORD chapters have fewer unique verse records than KJV coordinates. The original shared-record mappings are honored, and unindexed verses do NOT receive fabricated commentary.
- P sections are exclusively non-Scripture front matter, bounded chapter intros or source-attested passage headings. Every new fragment carries exact original substring offsets, SHA-256 and source pointer. No verse 0. The three old held JFB group sections remain unmapped.
- The KJV is the **versification coordinate system** here, not an imported or embedded Bible translation. Historical commentary text stays attached to its actual author/work/digital edition. Rights and source archives are unchanged.
- No automatic GitHub changes, CGBC player integration, SPP modifications, or public-source editorial rewriting.

## Acceptance checkpoints

| Check | Result |
|---|---|
| Original supplied source ZIP SHA-256 | 6 of 6 PASS |
| All native SWORD source records and original HelloAO anchors | PASS |
| Verse→author→source entry pointers | 1,777 PASS |
| New source P fragments | 123 PASS |
| Inherited JFB Second/Third John original P routes | 2 PASS |
| Completed author chapter JSON | 144 |
| Chapter indexes | 24 |
| KJV canonical verses | 443 |
| Reader simulations (desktop/mobile × 3) | 6 PASS |
| Previous 63 snapshots, P counts and reader policy | PRESERVED |
| Cumulative library after owner upload | 66 / 66 |
| GitHub installed + Pages + visual user acceptance | PENDING OWNER INSTALL |
