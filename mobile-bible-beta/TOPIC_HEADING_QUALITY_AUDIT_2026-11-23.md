# Historical topic heading quality audit | 2026-11-23

## Scope and evidence
Published source: `Stewards-of-the-Way/bible-foundation/data/topics/nave-torrey/v1/topics/<letter>.json`. This audit inspects **referenced aspect captions**, not topic titles, and does not modify the publisher source.

Twenty-four letter shards were fully parsed: A–R except S, and T–W, Y, Z. X has no published shard at that path. S was too large for the available file retrieval and **was not counted**. The 24 parsed shards contain **5,138 topics**, **33,423 referenced aspect entries**, and **1,214 referenced captions whose trimmed label is three characters or fewer**. This is a heuristic candidate count, **not** a count of confirmed errors. Some captions are intentionally numbered, punctuation, or abbreviated index conventions. It excludes S and does not assert whole-collection completeness.

J shard: 297 topics, 1,572 referenced aspects, 133 labels of three characters or fewer. The JEPHTHAH source record contains adjacent fragments `(A`, `Illegitimate, and therefore not entitled to inherit his father’s`, `property`, `Es`, `of Tob`, `Re`, `Ma`, `Ma`, followed by descriptive captions. The exact source also contains `His rash vow concerning bis daughter`. These are **upstream published labels**, not text invented by the reader. The available evidence does not determine whether the original error arose from OCR, transcription, conversion, or an earlier edition.

## Reader policy
- Preserve original labels, source IDs, mapped references, verse scopes, and provenance.
- Prefer complete descriptive headings. Do not use word length alone to infer theological relevance.
- Exclude high-confidence fragments and incomplete captions from the curated reader; preserve their references and original captions in the full source repository. Allow contextual short geographic labels such as “of Tob.”
- Never silently invent a completion or correct the source's spelling in a purported original quotation. Apply a three-state ingestion decision (DISPLAY / REVIEW / EXCLUDE FROM READER); the current reader gate is a conservative first-pass heuristic, not a complete manually adjudicated quality certification.
- Audit publisher ingestion separately: inspect source scans/transcription where available, identify the first stage where fragments and typos appeared, document corrections with evidence, and rerun a collection-wide quality check before any source-data replacement.
- Treat this as a conservative display-quality gate, not a permanent verdict that every one-word historical caption is erroneous. Review legitimate single-word headings for exceptions before a final beta release.

## Remaining gates
1. Complete the S-shard count using a reliable large-file retrieval and validate any additional unlettered shards.
2. Review a stratified sample of the 1,214 short captions against actual source context and confirm false positives.
3. Introduce a versioned source-ingestion QA report with suspicious truncations, spelling candidates, duplicate labels, citation mapping and review dispositions. Do not auto-correct publisher text.
4. Verify iPhone behavior of the streamlined meaningful-only topic list after reader deployment; inspect source repository for full excluded material.
