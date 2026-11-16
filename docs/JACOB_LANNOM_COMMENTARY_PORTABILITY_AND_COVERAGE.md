# Jacob Lannom Portable Scripture Commentary | Active publication contract

Updated 2026-11-16. Translation-neutral SOTW author collection, with CGBC read-only recovery mirror.

## Current accepted content

- **Accepted occasion:** 2026-11-01, *Why Membership Matters* (`media-daqi89`).
- **Active coverage:** seven scopes: `ACT.2`, `ACT.2.37-41`, `ACT.6.1-6`, `HEB.13.17`, `EPH.4.11-16`, `1CO.5.1-13`, `GAL.6.1`.
- **Retired pending new pipeline rerun:** 2026-11-08 Romans 12:17 (`media-fie2dj`). Its previously generated SOTW source-record file, current commentary entries, coverage entries, and catalog entry were removed at the owner's request. Earlier source bytes remain recoverable in Git history but are not active commentary. The original CGBC sermon, RSS metadata, and recordings were not removed.

## One author collection and a read-only mirror

SOTW `api/jacob-lannom/v1/` is the primary portable author home:
- `source-records/media-daqi89.json` contains the public-safe occasion-level source evidence and commentary sections.
- `current-commentary.json` contains the currently accepted first-person pastoral commentary with translation-neutral OSIS scopes and typed `referenceTargets`.
- `coverage.json` contains dated Scripture scopes and separate original-spoken-cue evidence for spot checks.
- `translation-lookup.json` identifies supported edition keys and current Scripture scopes without duplicating Bible text.
- `api/jake/v1/catalog.json` remains the source-index compatibility entry.

The CGBC `knowledge/author-archive-mirror/sotw-root/api/...` inventory is byte-identical and read-only; SOTW is edited first. The one CGBC canonical sermon record is `knowledge/2026/2026-11-01_why-membership-matters.json`.

## Translation-independent routes

The same OSIS scope IDs apply to **ASV1901, KJV1769, BSB, and Webster1833**. Do not make four rewritten Jacob commentary copies or imply that commentary text belongs to any particular Bible edition. The SOTW reader `review-jake-scripture.html?book=ACT&scope=ACT.2&translation=ASV1901` accepts any supported edition key and shows the same accepted Jacob text. Other editions use the corresponding `translation` parameter. The reader displays typed related-Scripture links and available commentary links but does not reproduce any Bible translation text.

Historical-commentary review pages for Acts, Ephesians, Galatians, Hebrews, and 1 Corinthians link to the shared Jacob reader; the six historic author source collections remain untouched. **Separate translation-reader applications must independently consume this shared route** before claiming their own author selectors are wired. The SOTW-side adapter is available now, but the four external reader integrations have not been verified here.

## Source, rights and revision discipline

Maintain Jacob's evidence-backed first-person voice and typed Scripture relationships. Public commentary viewer pages must not expose sermon audio/video/cue links. The separate coverage/spot-check tool retains exact original SRT cue identities, unverified media clock status, and source provenance. The original private Logos preparation remains unpublished. Accepted future contributions require a fresh verified SPP handoff and a documented revision of the one cumulative author store, preserving the accepted membership teaching. Archive withdrawals are explicit authorizations, not quiet deletions of historical originals.

This contract supersedes the earlier Romans-only prototype description. Do not reinstate the withdrawn Romans draft when assembling a future baseline.
