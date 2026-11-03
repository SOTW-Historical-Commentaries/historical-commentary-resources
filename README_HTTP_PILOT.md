# SOTW Historical Commentaries | Static HTTP Genesis pilot v1

This is an **additive manual-upload package**, built from the immutable HelloAO snapshot `helloao-2026-11-01`. It leaves all existing `config/`, `audit/`, `data/`, `docs/`, `scripts/get_passage.py`, and original GitHub Release untouched. Do not upload the full source ZIP into git history.

## Contents
- `api/v1/manifest.json`: source version, authors, templates, corpus summary.
- `api/v1/snapshots/helloao-2026-11-01/index/GEN/{chapter}.json`: author availability and exact resource paths for all Genesis chapters.
- `api/v1/snapshots/helloao-2026-11-01/authors/{author}/GEN/{chapter}.json`: historical commentary source JSON, wrapped with provenance and source SHA-256. All six authors, 50 chapters each.
- `scripts/build_static_resources.py`: deterministic Python standard-library generator for further books. Run it against the **original ZIP** with `--books EXO LEV`, etc. Generated resources are immutable snapshots.
- `HTTP_PILOT_INSTALL_MANIFEST.json`: file-level bytes and SHA-256 for this package.

## Manual upload
Upload the package **contents** at repository root, preserving folder paths. Do **not** replace entire existing `scripts/` or repository files. This package adds only new `api/`, one new script and a new README/manifest. It does not activate hosting.

## HTTP access (not live until hosting is enabled)
On GitHub Pages for the `historical-commentary-resources` project repository, the public URL prefix would be:
`https://sotw-historical-commentaries.github.io/historical-commentary-resources/`

Example after enabling Pages:
`api/v1/manifest.json`
`api/v1/snapshots/helloao-2026-11-01/index/GEN/1.json`
`api/v1/snapshots/helloao-2026-11-01/authors/john-gill/GEN/1.json`

Request flow: resolve manifest -> check versioned passage index -> select author-specific chapter resource -> filter `commentary.chapter.content` by numbered verse anchor in the consumer, **or retain chapter context when direct verse entry is absent**. This is static JSON delivery; no server-side verse query or dynamic API has been built.

## Hot swap and safety
A Bible display edition (ASV, KJV, BSB, Webster) is **not** encoded into historical commentary paths. A user selects Bible text independently. For a new commentary snapshot version, generate a new `/snapshots/{version}/` tree and a separate version index; never overwrite previous resource bodies. Ensure source version, ZIP hash and manifest are reconciled before changing a default pointer. Source provider has known 15 upstream 404s in audit; they are not recreated here. Distinguish historical commentary text from Scripture and Jake's teaching. Provenance and attribution retained; historical-edition accuracy and rights claims are not independently re-certified by this package.

## Why Genesis pilot first
Even though the entire archive is 94 MB compressed, the v1 pilot limits the number of files added to Git history. After static URL testing and retrieval timing, generate additional books in bounded releases. Avoid unnecessary all-corpus updates.
