# CGBC Pastor Jake commentary source-linked integration
Date: 2026-11-13

## Authority and scope
The authoritative native Info Map 3.0 sermon meaning stays in the CGBC Sermon Player repository. SOTW does **not** copy or create a competing sermon-meaning JSON. `api/jake/v1/catalog.json` lists public, owner-authorized canonical CGBC records by stable sermon ID and repository-root path. Both SOTW readers fetch that canonical JSON and project `structure.commentaryIndex` for display.

The November 8, 2026 Romans 12:17 sermon is the first source. The draft's status is **JAKE DRAFT SYNTHESIS**, not approval, publication, or verbatim Jake speech. Historical public-domain commentators remain independently attributed and their source records, readers, and v3 navigation are untouched.

## Readers
- `review-romans-v3.html?ch=12&verse=17&author=pastor-jake`: existing six historical authors plus Pastor Jake source selection; all original historical-source code paths remain available. The P mode displays book and chapter introductions and the Romans 9–11 multi-chapter preface.
- `review-jake-scripture.html?book=ROM&scope=ROM.12.17`: separate cross-book Jake view for all twenty scoped items (including Ephesians, Exodus, Proverbs, 2 Corinthians, and 1 Thessalonians).

A Jake passage appears only if CGBC supplies an explicitly scoped commentaryIndex item. Do not infer verse exposition from a chapter introduction. Citation/provenance and links use the original `sourceSermonStableId`, `teachingOccasionId`, `startSeconds`, `sermon.youtubeId`, and `structure.chapterNavigation[].sourceAudio`; SRT positions are **not** verified media seek offsets.

## Subsequent sermons
1. Install each newly validated, original canonical Info Map record in CGBC first. Verify current CGBC commit and target path before changes.
2. Append its stable sermon ID and path to `api/jake/v1/catalog.json` after reading current catalog (no duplicate IDs). Do not upload weekly staging prototypes to SOTW.
3. Retain the historical teaching-occasion IDs and watch/listen sources. Cumulative commentary reconciliation must use the active SPP's evidence-backed, versioned procedure. This pilot lists separate teaching occasions when more than one source covers the same scope. It **does not** automatically semantically reconcile or publish an approved cumulative manuscript. Do not represent such a reconciliation as already installed.
4. Preserve previous CGBC and SOTW commits as recovery points. Changes to protected working player UI, shared schema, and historical commentary source data require specific owner authorization.

## Fallback and verification
SOTW initial baseline before integration: `8d6d9a6cb668b7306e92d2c0f39de624fedb5599`; existing Romans reader original Git blob `fac40d430545f1e6abf39568a583ae29af069b43`.
CGBC initial baseline: `a24f9a8af239f7293e9db053814c42a9263d7618`.
The added code does not change original historical commentary payloads or the CGBC Player runtime. If Jake source fetch fails, its source displays a clear error while other historical-author routing stays in place. A live browser and deployment check is still needed before calling cross-origin functionality production-verified.


## 2026-11-13 authorized first-person voice correction
The CGBC owner commissions and authorizes first-person Jake pastoral-expository synthesis from original sermons. Public reader labels must not impose another Jake approval gate. The SOTW reader consumes the corrected canonical CGBC JSON; no duplicate Jake sermon-meaning JSON is stored in SOTW. Synthesis must not be presented as verbatim recorded speech. Existing cue, timestamp and teaching-occasion provenance is preserved.
