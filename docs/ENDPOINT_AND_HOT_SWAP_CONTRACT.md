# Endpoint and hot-swap contract

- **Stable namespace:** `sotw-historical-commentaries` and canonical `BOOK.CHAPTER[.VERSE]` IDs.
- **Author switch:** filter by source ID, not by inferred English rendering.
- **Translation switch:** passage ID unchanged. English Bible text and edition-specific alignments live in their Bible edition foundations.
- **Source snapshot switch:** explicit pinned `source_version` with immutable source ZIP SHA and index. A new version never silently replaces old text.
- **Fast retrieval:** index -> author/chapter checksum -> archive ZIP member (local); remote publication would use static JSON files/release assets and caching. No 6,123-file traversal on every lookup.
- **No invented endpoint:** manifests are logical routes. Local CLI works; HTTP is future work and requires authorized deployment.
- **Fallback:** missing chapter/verse record must report missing; never substitute another author or a different edition without user selection.
- **Future HTTP option:** `GET /v1/manifest.json`, `GET /v1/index/GEN/1.json`, `GET /v1/authors/john-gill/GEN/1.json` are *proposed*, not deployed.
- **Safety:** historical commentary is source witness, distinct from Scripture text and Jake's sermon exposition.
