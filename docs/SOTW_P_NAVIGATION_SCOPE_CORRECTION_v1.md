# SOTW Commentary Library | P-navigation scope correction v1

**Applies to:** Genesis, Exodus, Leviticus and Numbers, accepted `structured-*-2026-11-03` v3 staging snapshots. **Status:** additive authoritative navigation coverage overlay plus four replaceable testing readers. Original SWORD/HelloAO text, verse-to-entry indexes and snapshot files stay unchanged.

## Why

The old `navigation_sections[].scope` and `index/BOOK/chapter.json.navigation_routes` identify where sections were extracted, but not necessarily where they apply. A book-root `P` section about Numbers 1:1–10:10 was surfaced in Numbers 31; a Genesis record contained introductions to poetic and prophetic books; some JFB passage headings explicitly covered only part of a chapter. This is an *applicability* defect, not an invented-text or verse-index defect.

## Authoritative consumer contract

**For verse commentary:** Continue using the original `api/v3/snapshots/{snapshot}/index/{BOOK}/{CHAPTER}.json` `verse_routes` plus original author files. Do not substitute `P` links into verse routes.

**For non-Scripture material (`P`):** Load `api/v3/navigation-coverage/v1/books/{BOOK}.json`, inspect `author_sections[author_id]`, and filter on `scope`:

- `work` and `book_group`: only present for explicitly eligible books; work-group sections not mapped yet are held separately, never shown in Genesis by default.
- `book`: available throughout only that book, for genuine book introductions, prefaces, title/dedication or book headings.
- `chapter`: available only in its own chapter, for actual chapter headings/introduction.
- `passage`: available only from `passage_start` through `passage_end`, inclusive, within that book. Bounds are taken from the original section's heading or clearly stated source range, not neighbor-verse inference.

To display a selected section, fetch the original file at `source.chapter_file`, locate `navigation_sections[].section_id === selected.section_id`, and render its original `content_plain`. The separate index stores **navigation metadata, not another copy of commentary text**. For a `P` section originally in Genesis 1, a valid group intro can be referenced from Numbers via its original Genesis source path. This is an intentional cross-book reference.

Original `navigation_sections` remain archival evidence. **Use the new coverage book file as the authoritative P-route list.** Old `index.navigation_routes` are *not* sufficient to determine range-limited P applicability. Reader default is verse commentary; when a deep-linked P selection is out of scope, fall back to verse mode.

### Source-backed corrections

| P navigation ID | Corrected applicability | Original source |
| --- | --- | --- |
| `NUM:P:preparations-at-sinai` | Numbers **1:1–10:10**, not the whole book | K&D section heading identifies `Numbers 1:1-10:10` |
| `LEV:P:general-sacrifice-rules` | Leviticus **1:1–5:19** | K&D heading `Leviticus 1-5` |
| `LEV:P:sacrificial-laws-overview` | Leviticus **1:1–7:38** | K&D heading `Leviticus 1-7` |
| `GEN.1:P:creation-overview` | Genesis **1:1–2:3** | K&D heading `Genesis 1:1-2:3`; now routable in Genesis 2 |
| JFB `EXO.13:P:passage-overview` | Exodus **13:1–2**, not every verse of the chapter | JFB heading `Ex 13:1, 2.` |
| JFB `NUM.31:P:passage-overview` | Numbers **31:1–54** | JFB heading `Nu 31:1-54.` |

JFB's Pentateuch/historical group introduction is made available in the Pentateuch books via an explicit conservative membership list (Genesis–Deuteronomy). Its introductions to poetic, prophetic and restoration books are retained as `held-unmapped.json` and **are not** made eligible in Genesis, Exodus, Leviticus or Numbers. Later canonical book-group membership can be added explicitly when those books are processed. This is not a claim that those source sections should be deleted.

## Independent review and safeguards

- Original six-author commentary chapter JSON untouched.
- Existing canonical verse routes untouched.
- The overlay records exact source file path, SHA-256, original section ID, original source entry identifier, source fragment fingerprint and character-span locator.
- 455 original P sections accounted for; 452 active, 3 held for future group membership. Because shared introductions are exposed in multiple Pentateuch books, the count of *routed references* is larger than 452.
- 26,772 independent integrity, source and route checks passed, including source-backed heading bounds and existing verse-route referential integrity.
- 12 actual JavaScript P-scope filtering checks passed against the updated reader code.
- Chromium browser-level HTTP testing was blocked by the environment; **do not claim a live browser pass before the owner views the deployed pages**.

## Installation: two small manual batches

1. **Batch 1:** Add new `api/v3/navigation-coverage/v1/` and documentation/test evidence. This does not replace existing reader files or snapshots.
2. **Batch 2:** Replace only `review-v3.html`, `review-exodus-v3.html`, `review-leviticus-v3.html`, and `review-numbers-v3.html` at repository root. These are *test readers* and now use the authoritative coverage layer. Do **not** replace `/api/v3/snapshots/` or edit original SWORD/HelloAO texts.

Upload repository-root-relative folder contents, not ZIP files. Before replacing any test reader, confirm its GitHub blob SHA matches `NAVIGATION_SCOPE_PATCH_MANIFEST.json.expected_old_git_blob_sha1`. If the live reader has changed, stop and merge that newer version rather than blindly overwrite.

After Pages deploys, check Numbers 31:31 (K&D Sinai overview absent, book intro still selectable); Numbers 5:1 (Sinai overview selectable); Leviticus 6:1 (general rules no longer available but Laws of Sacrifice still available); Exodus 13:3 (JFB 13:1–2 heading absent); Genesis 2:3 (K&D creation overview visible, sourced from Genesis 1); Genesis 1 (JFB poetic/prophetic group introductions absent).

## Future books and Jake commentary

All public-domain historical commentaries and authorized published Jake commentary use these same `P` role/scope/range semantics and preserve their own authorship, work titles, provenance and publication state. This is shared **navigation metadata**, not a new theology or Jake-alignment process. New book conversion must generate the authoritative P applicability catalog as part of its initial package, rather than relying on the legacy `navigation_routes`. The same `P` schema is future extensible without reprocessing accepted verse commentary or modifying locked CGBC content.
