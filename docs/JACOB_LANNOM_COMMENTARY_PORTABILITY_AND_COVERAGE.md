# Jacob Lannom Portable Commentary | Source and Coverage Contract

Current version: 2026-11-13. This supersedes the older CGBC-source-linked integration instructions.

## Author and storage

The portable author library lives within SOTW in `api/jacob-lannom/v1/`; no dedicated GitHub repository has been created. This namespace may be moved into a Jacob-controlled repository later without changing stable Scripture or teaching-occasion identifiers.

- `source-records/media-fie2dj.json`: complete original new-SPP Info Map 3.0 source snapshot migrated from CGBC; exact Git blob SHA `a0ab352d4597bdddced3ee376f78b164cbcd781c`.
- `current-commentary.json`: one current exposition per Scripture scope, source occasion links, and typed Scripture relationships. Version history records amendments.
- `coverage.json`: every covered book, chapter and passage with original sermon date, title, teaching occasion and reviewer route.
- `review-jacob-coverage.html`: human-facing dated spot-check page.
- `api/jake/v1/catalog.json`: compatibility catalog for existing SOTW Romans and Scripture-wide readers; now points only to local SOTW author source records.

## Translation-independent contract

Commentary selection is independent from selected Bible translation. All keys use canonical scope IDs like `ROM.12.17`, `EXO.21.24`, `PRO.20.22`. Do not store a translation code in commentator IDs or rewrite commentary when switching KJV, ASV or later translations. Each Bible reader may map the same canonical Scripture scope to the chosen translation's verse text.

`current-commentary.json` has `scriptureLinks` with relationship, source and target scopes and optional commentary node references. A downstream UI may turn inline prose references into links, but the stored link relations are the source of truth and must remain intact.

## Cumulative updates

When later sermons add meaning, reconcile semantically into the single `current-commentary.json` entry for the Scripture scope. Keep all individual teaching occasions and their sermon dates, original cue/time boundaries and watch/listen links. Update `coverage.json` and the current commentary revision history atomically with the newly accepted source. Avoid duplicate verse commentary. Do not silently elevate the old Good Gifts AI record into accepted author commentary; it has been excluded from this store.

## Previous CGBC knowledge

The CGBC `knowledge/2026` sermon JSON records are retired from current main. Their historic Git commits remain recoverable, but neither should be used as live author commentary after this migration. CGBC retains shared schemas, registries, licensed-text ledger and other unrelated assets. The older beta knowledge-lab pages may reference the retired paths and should be treated as archival demos, not active commentary UIs.

## Limitations

The new SOTW store has a current projection but does not yet automatically reconcile future sermon contributions. The generic Bible translation UI is not wired to this commentator selection here; SOTW already offers author selection on its Romans and Jake readers. A separate translation-integration task must hot-swap Bible text without changing commentary scope. Timestamp seeking remains unverified; retain exact original cue evidence.
