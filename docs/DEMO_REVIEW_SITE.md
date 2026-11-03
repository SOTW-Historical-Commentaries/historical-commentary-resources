# SOTW Historical Commentary Review · Genesis Pilot v1

## Purpose
A **read-only visual verification site** for the SOTW Historical Commentaries source library. It is not a new commentary dataset or a CGBC player integration.

## Installation (manual, additive)
1. Open https://github.com/SOTW-Historical-Commentaries/historical-commentary-resources on `main`.
2. Use **Add file → Upload files** at the repository root.
3. Drag the `index.html` file and the `docs` folder from this ZIP, preserving `docs/DEMO_REVIEW_SITE.md`. The package contains just three files including its install manifest.
4. Confirm upload paths are exactly `index.html`, `docs/DEMO_REVIEW_SITE.md`, and `DEMO_SITE_INSTALL_MANIFEST.json`, **without** an outer ZIP directory name.
5. Commit to `main` using `Add read-only historical commentary review site v1`.
6. After Pages deploys, open https://sotw-historical-commentaries.github.io/historical-commentary-resources/ .
7. Begin with Genesis 1:2, left John Gill, right Matthew Henry. John Gill should be labeled **Explicit anchor**; Matthew Henry **Possible section context · unverified**.

Do NOT upload the 94 MB source archive again. Do NOT delete or replace `api/`, `config/`, `scripts/`, `audit/`, existing data, or the GitHub release. The new root `index.html` enables a normal GitHub Pages landing page; it does not modify underlying JSON.

## Design and data contract
- Page uses relative same-origin URLs beginning `./api/v1/`; this works for GitHub Pages project sites under `/historical-commentary-resources/`.
- Manifest source: `api/v1/manifest.json`. Pinned source snapshot: `helloao-2026-11-01`.
- Index lookup: `api/v1/snapshots/helloao-2026-11-01/index/GEN/{chapter}.json`.
- Data lookup: `api/v1/snapshots/helloao-2026-11-01/authors/{author}/GEN/{chapter}.json`.
- `index.authors[].source_sha256` must match `author.source_chapter_sha256`; this checks source checksum **metadata consistency**, not rehashing of raw bytes.
- The site supports all six published Genesis authors and Genesis 1–50.
- Browser downloads only the chapter index and one or two selected author chapter files. No full archive transfer, and no server, token, or third-party JS dependency.
- Authors are selectable independently of Bible editions. Bible translation switch is NOT implemented here because no Bible edition text is bundled.
- URLs update with `chapter`, `verse`, `left`, `right`, and `mode`, making a specific comparison shareable.

## Evidence rules
- `Exact anchor` means the original HelloAO chapter contains a numbered entry anchored at the requested verse, not that the interpretation is independently verified.
- `Possible section context` is a **cautious inference only** where the requested verse falls between two explicit anchors. It is not verified commentary coverage.
- No extrapolation is made before the first or after the final explicit anchor. Book/chapter introductions remain separate and opt-in.
- `Full chapter anchors` lists the source's numbered commentary items; the full underlying chapter JSON can be viewed for verification.
- The displayed historical writings are source witnesses, distinct from Scripture and Jake's original preaching.

## Validation performed during construction
- JavaScript syntax checked with Node.js v22 (`node --check`).
- Browser interaction tested with Chromium/Playwright against the **actual bundled Genesis pilot JSON fixtures** using an in-memory fetch override: verified ready state, John Gill Genesis 1:2 explicit anchor, Matthew Henry Genesis 1:2 possible context, Genesis chapter selection, full-chapter view, and no page errors.
- Public GitHub Pages deployment of this *new* HTML page has not occurred and must be verified after manual upload.
- The browser test did **not** establish a live external-network HTTP run.
