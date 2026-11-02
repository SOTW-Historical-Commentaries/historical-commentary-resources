# Servants of the Way | Historical Commentary Resources

This repository-root package provides a **versioned retrieval manifest, passage index, and working local lookup tool** for six original HelloAO commentary JSON collections. It is designed for a separate `SOTW-Historical-Commentaries/historical-commentary-resources` repository, but **does not contain the 94 MB source archive**. No remote deployment, live web API, or GitHub Release has been performed.

## Installation (manual)

Merge `config/`, `data/`, `scripts/`, `audit/`, and `docs/` into the repository root. The provided `README.md` may replace the initial placeholder README **only if you choose**. Keep the existing repository history. Do not upload the raw source ZIP into ordinary Git history. Retain it in your private source archive; publishing an immutable GitHub Release asset is a future option subject to owner authorization, data rights review and SHA verification.

## Local passage retrieval

Put original `helloao-historical-commentaries.zip` in the parent folder of this checkout, or supply `--archive /path/to/helloao-historical-commentaries.zip`.

```bash
python3 scripts/get_passage.py GEN.1.1 --authors john-gill matthew-henry --display-edition KJV1769 --out sample.json
python3 scripts/get_passage.py ROM.8 --authors john-calvin --include-chapter-context --out sample-romans.json
```

`--display-edition` changes viewing context only. It does not fabricate an alignment between an author's original commentary and any English Bible version. To switch commentary authors, change `--authors`. To switch a verified source snapshot later, add a separate manifest entry with its actual archive hash/index, then use `--source-version`.

### Passage semantics

`GEN.1.1` is a shared Scripture reference, not an ASV/KJV-specific verse text. Chapter-level research is `GEN.1`. Verse filtering returns only **directly verse-anchored** content. Some commentary spans multiple verses or includes unnumbered introductions; request `--include-chapter-context` for full context. Missing direct commentary does not mean no commentary exists for the passage.

## SPP contract

Keep historical author text separate from verified Jake commentary. This library is an evidence source, not a sermon meaning record, SPP execution, or theological authority. Caller performs Scripture-first analysis, validates sources, preserves exact attribution, and writes the one canonical Info Map 3.0 sermon JSON. A future coordinator maps SPP passage IDs to this library and keeps Jake commentary in its existing passage registry.

## Publication and endpoints

`config/resource-map.v1.json` defines a **logical** interface, not a deployed HTTP endpoint. The CLI is executable locally now. A future static hosting adapter can publish paths such as `/v1/manifest.json`, `/v1/index/GEN/1.json` and immutable author/chapter JSON; a remote dynamic `/v1/passages/GEN.1.1?authors=...` endpoint would need server infrastructure. Do not claim any of these URLs currently work. The recommended SPP script reads compact indexes, fetches only selected chapters, and caches by version plus content SHA.

## Audit and limits

See `audit/SOURCE_AUDIT.json` and `audit/UPSTREAM_404_EXCEPTIONS.json`. The existing 6,123 chapters match the catalog's reported chapter totals; the 15 additional upstream 404 requests remain documented. Data can contain source inaccuracies or commentary anchored only to selected verses. The source's public-domain metadata is not independent edition-rights verification.
