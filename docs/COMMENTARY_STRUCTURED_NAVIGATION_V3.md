# SOTW Public Historical Commentaries | Structured Navigation v3 (Genesis staging)

## Scope and change control

This is an additive **Genesis-only staging pilot**. It introduces `api/v3` and a separate `review-v3.html`. **It does not replace** `index.html`, `review-v2.html`, `api/v1`, `api/v2`, SOTW ASV resources, a Bible translation, CGBC player code, Jake's passage commentary registry, or the SPP. No production deployment or live player integration is performed by these files.

All 4,370 original source entry records are preserved within the v3 author/chapter records, including SWORD `content_osis`, original `content_plain`, entry IDs, SHA-256 fields and source provenance. Nonverse display projections are linked back to their original source entry and exact 0-based Python character spans within the saved OSIS string. In view mode, use `reader_content_plain`; researchers can inspect the original record for verification. Raw provenance is not silently shortened or removed.

## Unified public navigation contract

Canonical Scripture verse and passage IDs never change when readers switch Bible translation or commentator. The new `P` namespace is non-Scripture. It is **not** Genesis 1:0. A `navigation_id` is used along with the source `author_id` and original source record ID for uniqueness.

| Content | Example navigation ID | Scope | What the reader shows |
|---|---|---|---|
| Work preface | `WORK:P` | Work | Prefatory material for a complete work |
| Volume or book-group preface | `GROUP:GEN-DEU:P:pentateuch-volume` | Book group | Preface spanning Genesis–Deuteronomy |
| Book introduction | `GEN:P` | Book | Introduction specifically to Genesis |
| Chapter introduction | `GEN.1:P` | Chapter | Nonverse introduction to Genesis 1 |
| Passage overview | `GEN.1:P:creation-overview` | Passage | A distinct section on Genesis 1:1–2:3, not a verse entry |
| Single verse | `GEN.1.2` | Verse | Source-indexed verse commentary |
| Verse range | `GEN.1.2-5` | Passage | One SWORD entry shared by verses 2–5 |

Also supported: translator preface, author dedication, editorial edition notes, historical dedication, title page, group introductions, chapter heading, book heading and generic nonverse navigation. These roles are enumerated in `api/v3/navigation-schema.json`. The reader offers all available nonverse sections in a source-specific dropdown; absent sections are never fabricated.

## The separate reader projections

- `entries[]` preserves the original full source records and all v2 fields. New fields include `reader_visible`, `reader_content_plain`, `navigation_id`, `commentary_kind`, `separate_navigation_section_ids`, and `reader_source_character_span` for entries whose embedded prefatory material can be separated using a documented boundary.
- `navigation_sections[]` contains separate P entries with role/scope, explanatory title, plain-text projection, original record pointer and exact source span for SWORD, or original HelloAO introduction field for Gill.
- `index/GEN/<chapter>.json` exposes both `verse_routes` (source-provided verse/range links) and `navigation_routes` (P sections). Selecting a P section does not alter the Bible verse being studied.
- `api/v3/authors.json` is a reusable catalog for compact labels. It separates author lifespan, geographic association and historical **work** publication date, with a source URL for each. A work publication year must not be represented as the date of an English translation or digitization.

## Genesis-specific source findings

1. **Matthew Henry:** A Genesis–Deuteronomy volume preface and a Genesis 1 chapter introduction precede a native SWORD Genesis 1:1–2 commentary record. The reader now displays those as separate material.
2. **Calvin:** His SWORD Genesis 1:1 record is an introductory compilation (title page, translator preface, historical translator dedication, author dedication) without a discrete verse exposition. It remains intact as a source entry but is removed from Genesis 1:1 verse results. The original source key is preserved with provenance.
3. **Adam Clarke:** Genesis book preface and separate chapter introductions were extracted where explicit `Introduction`/`Verse 1` markup provides a reliable boundary. In chapters 43, 44 and 47, the SWORD verse-1 record contains a chapter synopsis only and is navigated by `GEN.<ch>:P` rather than shown as verse commentary.
4. **Jamieson–Fausset–Brown:** The source includes multiple book-group introductions, later digital editorial notes, and Genesis/chapter headings. Those are navigable independently of Genesis 1:1 commentary.
5. **Keil & Delitzsch:** Five Books of Moses general introduction, Genesis book introduction and a creation passage overview are separate from the Genesis 1:1 explanation. Genesis 1:2–5 remains one native SWORD record.
6. **John Gill:** Original HelloAO Genesis book introduction is separately accessible, and individually numbered verse entries remain unchanged.

The source text may still contain inline editorial annotations or quotations from Scripture. Only clearly delimited initial sections are separated. Headings without trustworthy boundaries are not aggressively split; this converter is **not** a theological evaluator or commentary-authority grader.

## Future sources including Jake

The **navigation labels and source-neutral metadata shape** are intended to be reused for later public-domain commentary and, if specifically authorized, Jake's independent commentary. Source provenance and publication/adoption status stay specific to each actual author and work. A commissioned Jake draft is never represented as historical speech or published commentary, and this pilot neither reads nor modifies any Jake sermon or CGBC registry.

## Rights and provenance

The five original CrossWire module ZIPs declare their contents Public Domain in their module configuration, while Gill's HelloAO payload identifies its own license field. The original modules/HelloAO archive are not reissued in this package. Each generated chapter retains the declared module/edition license, original source archive hash and links. Author names and historical work titles are primary displayed attribution; digital transcribers and distributors remain in provenance.

## Validation and installation

The independent verification compared all 300 author/chapter JSON files with the original v2 staging ZIP and passed 66,263 structural assertions. It verified raw OSIS fields, source SHA metadata consistency with v2, section spans, navigation links and verse routes. A Chromium DOM smoke test with local JSON fixtures also passed. The preview's *public* GitHub Pages rendering remains to be verified after manual installation.

Install these files at repository root under **their exact paths**, uploading no more than 75 items per GitHub web upload batch. Five separate ZIP files are supplied for that purpose. Unzip each batch and preserve the internal `api/`, `docs/`, `reports/` directories; do not upload ZIP files into the repo as opaque blobs. Nothing in v1/v2 needs replacing. Once the successful GitHub Pages deployment completes, open the new standalone page at `/review-v3.html` (not the repository homepage).
