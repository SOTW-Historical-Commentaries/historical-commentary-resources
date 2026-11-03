# SOTW Historical Commentaries | Verse retrieval adapter v1

**Status:** additive, read-only local/HTTP client and six-author acceptance suite. Does not modify the underlying commentary snapshots, `api/v1/manifest.json`, existing `config/`, CGBC Info Map 3.0, SPP, or any live player. Does not create a dynamic server API. This is a *consumer* for the static GitHub Pages JSON endpoints.

## Purpose and provenance

The deployed Genesis pilot contains six author-specific JSON files per chapter under `api/v1/snapshots/helloao-2026-11-01/authors/{author}/GEN/{chapter}.json`, plus an author-availability index at `.../index/GEN/{chapter}.json`. The client first requests the index, then only the selected author files. In the absence of network it can read the identical paths from the original Genesis pilot ZIP using `--pilot-zip`.

The `source_version` is explicitly pinned (`helloao-2026-11-01`). Each retrieved author file is checked against the index for chapter/author/version identity, path, and recorded **source** SHA-256 consistency. That check tests metadata coherence; it does not independently reverify the exact upstream text bytes or prove the archived historical editions' fidelity. The existing publication manifest records the source archive SHA-256 `f8746a5553fdadd12cfee5004eca1c36bf3065b19cd7a5b3ab278fc188e7efbb`.

## Commands (Python 3.9+, standard library only)

From the repository root, fetch two authors' Genesis 1:2 information over the public GitHub Pages site:

```sh
python3 scripts/commentary_retrieve.py --passage GEN.1.2 --authors matthew-henry john-gill --display-edition ASV1901 --output genesis-1-2.packet.json
```

Request all six authors for a range:

```sh
python3 scripts/commentary_retrieve.py --passage GEN.1.1-5 --authors all --include-introductions --output genesis-1-1-5.packet.json
```

Run the live six-author acceptance suite:

```sh
python3 scripts/verify_genesis.py --output genesis-http-test-report.json
```

For offline testing with the original pilot ZIP, add `--pilot-zip /path/to/SOTW_Historical_Commentaries_HTTP_Genesis_Pilot_v1.zip`. Unlike HTTP mode, this tests the archive rather than public hosting.

## Verse/section semantics

The HelloAO structures contain `commentary.chapter.content` entries with `type:"verse"` and an integer `number` anchor. An anchor identifies the location of an entry, **not necessarily the extent** of every Bible verse discussed in that entry. Thus:

- `exact_anchor`: a source entry is explicitly anchored to the requested verse. This does **not** guarantee word-for-word coverage of that verse.
- `possible_section_context`: the requested unanchored verse falls between two explicit anchors and the preceding entry **might** cover it. `coverage_verified:false`, with bounded `contextual_range_hint`. This is an inference made by the adapter, **not a verified source range**.
- `exact_and_context`: the request includes explicit anchors plus potentially covered unanchored verses.
- `no_verse_anchor_or_bounded_context`: no exact note or safely bounded context identified. This does **not** prove the author never discusses that verse in an introduction or elsewhere.

The adapter intentionally **does not infer beyond the final anchor, before the first anchor, or across chapter boundaries**. Book and chapter introductions can be included only by explicit option and remain separately labeled. The tool does not parse unstructured prose references to infer additional ranges. Human/AI research must read and validate the actual commentary passage before asserting coverage or agreement with Jake.

Example from actual Genesis pilot:

- Matthew Henry on GEN.1.2 has no exact verse-2 anchor but a preceding verse-1 note and next explicit verse-3 anchor; output is `possible_section_context_only` with `[2,2]`, not exact coverage.
- John Gill on GEN.1.2 has a numbered verse-2 anchor, so output is `exact_anchor`.
- Jamieson-Fausset-Brown on GEN.1.1 has no explicit verse-1 anchor or safely bounded preceding section; the tool returns `no_verse_anchor_or_bounded_context` rather than inventing a note.

## Translation & commentary hot-swapping

`--authors` selects any subset of six authors without changing the canonical passage ID. `--version` selects a **specific immutable snapshot**; requesting an unpublished snapshot fails rather than silently substituting another. `--display-edition` is **only display context** (ASV1901, KJV1769, BSB, WEBSTER1833) and does not load any Bible text, perform word alignments, or change the historical commentary returned. Any future Bible player retrieves its own edition text independently. Output is a temporary SPP research packet, not a second authoritative sermon meaning JSON.

## Scripted SPP use

1. Script identifies relevant Scripture passage from original sermon evidence.
2. Client requests *only* selected authors and chapters, and emits a self-contained JSON research packet with provenance and match status.
3. SPP performs independent Scripture-first research, verifies historical commentary relevance, and compares with Jake's preserved SRT speech and genuine exposition.
4. Preserve exact cue/time/source evidence; never equate commentary with Jake's actual words or treat suggestions as verified.

## Known limits

- The project hosts Genesis pilot only. Other books require their own independently published static resources.
- A live HTTP acceptance run requires network access; the included `tests/OFFLINE_ACCEPTANCE_REPORT.json` is an offline run against the original packaged Genesis pilot, not proof that HTTP retrieval itself passed.
- Sparse verse anchors in some historical authors require manual/AI verification of the passages; no machine can infer every range from numbered anchors alone.
- No auto-updates, authentication layer, runtime UI, dynamic API, SPP change, GitHub production edits, or player integration is included.
- Preserve upstream rights and provenance. This tool introduces no new claim about the accuracy of historic editions.

## Installation

The accompanying ZIP is **repository-root relative**. Extract it and upload its `scripts/`, `docs/`, and `tests/` contents while preserving paths. This package adds two new scripts, one documentation file, one offline acceptance report, and one small example packet. It does not replace any existing named repository file. There are fewer than 99 files in this package. Do not upload the original 94 MB source ZIP into Git history.
