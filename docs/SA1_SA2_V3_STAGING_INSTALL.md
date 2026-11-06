# SOTW structured historical commentaries v3: 1 Samuel + 2 Samuel

## Installation gate: one complete, additive, staging release

- Repository: `SOTW-Historical-Commentaries/historical-commentary-resources`, target branch `main`.
- GitHub head verified before package creation: `4c68eaac7f62243fa785374f1b97dd69f20cdac3` (Judges/Ruth second upload commit).
- Current, eight-book authoritative P coverage file `api/v3/navigation-coverage/v1/manifest.json` must be Git blob `0afd502e35852d42828cc5344af6a3345c254f33` before it is replaced. **If head/manifest changed, do not overwrite or upload yet; reconcile newer files.**
- Existing source chapter snapshots for Genesis, Exodus, Leviticus, Numbers, Deuteronomy, Joshua, Judges, Ruth and their reader pages must remain untouched.
- New canonical identifiers: `1SA` and `2SA`, KJV original SWORD versification; `P` denotes non-verse navigation, never Bible verse zero.
- New snapshot locations: `api/v3/snapshots/structured-first-samuel-2026-11-05/` and `api/v3/snapshots/structured-second-samuel-2026-11-05/`.
- Five CrossWire/SWORD authors retain their own exact original zCom/zCom4 native verse indexes. HelloAO is the only John Gill source and a fallback **only if an entire SWORD chapter is missing**. Calvin has no native source or HelloAO supplement for these books and is marked unavailable for all 55 chapters.
- Original historical author/work and exact edition/rights appear in the records; SOTW is only the modern provider. No Bible translation text is included.

## Manual upload, repository root

1. Download and extract the **outer** `SOTW_First_Second_Samuel_v3_Manual_Upload_Batches.zip` on your computer.
2. Open and extract each `Batch_NN_UPLOAD_TO_REPOSITORY_ROOT.zip` in order. **Do not upload an inner ZIP file as an ordinary repository file.**
3. Upload the *contents* of each extracted inner ZIP into the **GitHub repository root**, retaining every nested `api/v3/`, `docs/`, `reports/` and `review-...html` path exactly. Every inner batch contains at most **99 files**; no path appears in two batches.
4. The **one deliberate update** to existing repository files is `api/v3/navigation-coverage/v1/manifest.json`; compare its pinned prior Git blob as above before uploading. All other release files are additive.
5. Wait for GitHub Pages to report a **successful** deployment for the final upload commit. This package does not edit GitHub automatically or claim that GitHub Pages has deployed.
6. Check uploaded path inventory against `SA1_SA2_V3_UPLOAD_MANIFEST.json` and verify the listed SHA-256 file hashes.
7. Review both new pages in a real browser after deployment:
   - `https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-1-samuel-v3.html`
   - `https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-2-samuel-v3.html`

## Recommended live checks

- In each reader choose chapter 1 verse 1: six named author cards; source-attributed original commentary for authors present and an explicit unavailable state for Calvin. Verse mode must be the default.
- At 1 Samuel 1:1, select P and inspect Matthew Henry's book introduction, Adam Clarke's book preface, Gill's book introduction, and Keil & Delitzsch's **Books of Samuel** source-backed introduction.
- At 2 Samuel 1:1, select P and inspect Matthew Henry's 2 Samuel introduction, Clarke's 2 Samuel introduction, Gill's 2 Samuel introduction, and KD's own second-book introduction. Confirm KD's earlier **Books of Samuel** source introduction links back to the original 1 Samuel chapter JSON rather than duplicating a new translation.
- In both books verify that JFB's historically sourced **Prophetical Books** introduction and MHC's **Joshua to Esther** historical-volume introduction appear in P, with source credit intact.
- Check chapter and verse selector upper bounds: 1 Samuel 31:13 and 2 Samuel 24:25. Beyond-verse requests clamp to the last verse; invalid P IDs or P IDs outside their supported passage range revert to verse mode.
- Check a JFB headed passage at 1 Samuel 1:1-8 and an out-of-range verse at 1 Samuel 1:9; the bounded heading must not be offered outside its explicit scope.
- At 2 Samuel 22, JFB's **entire SWORD chapter is absent** and the one-chapter HelloAO fallback must be transparently identified; no per-verse SWORD/HelloAO mixing.
- No visual test of public pages has been certified by this package. The available Chromium local test was blocked (`ERR_BLOCKED_BY_ADMINISTRATOR`). The separate Node JS reader audit passed.

## Scope, fidelity and preservation

Source text is never rewritten. Each byte-preserved SWORD original OSIS string has a record SHA-256, native block/offset/length locator, and exact (possibly shared) indexed passage. Source commentary anchored to a multi-verse passage **does not prove separate commentary for every verse**. HelloAO items and introductions retain their original content, provenance and rights. Navigation P sections have source fragment SHA-256, character spans, and bounded applicability; historical prefaces are independent from Scripture verse text.

The following remain unchanged: all previously accepted eight books, existing v1/v2 data, `api/v3/authors.json`, `api/v3/navigation-schema.json`, the three held-unmapped JFB items, reader homepage, Bible Tools, CGBC player, shared schema, scripts and deployment configuration. Luther remains deferred in a separate research lane, not an added seventh author.

## Audit evidence

- `reports/SA1_SA2_INDEPENDENT_VERIFICATION.json`: original ZIP checksums and 55-chapter independent source/index/P checks.
- `reports/SA1_SA2_ACTUAL_READER_JS_TESTS.json`: compiled and executed the exact staged readers with actual new records and P coverage.
- `reports/SA1_SA2_BROWSER_SMOKE_TEST.json`: limitations and environment block, not a claim of browser rendering success.
- `SA1_SA2_V3_UPLOAD_MANIFEST.json`: every repository-root file SHA-256 and size, plus the pinned baseline.

## Next book pair

After owner installs and visually checks both Samuel pages, the next canonical pair is **1 Kings + 2 Kings**, with the same six archive source locks and evidence-first staging discipline.
