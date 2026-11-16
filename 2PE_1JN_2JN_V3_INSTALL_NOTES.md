# SOTW Historical Commentary Library | Manual upload: 2 Peter, 1 John, 2 John

**Books 61–63. Locally validated staging package; NOT INSTALLED and NOT automatically deployed.**
This three-book release follows the owner's explicit request, overriding the previous two-book release cadence for this release only.

## Mandatory baseline checks

- Repository: https://github.com/SOTW-Historical-Commentaries/historical-commentary-resources
- Required `main` commit: `d72102a3fed507f4c738e644e75cd5fd22298cb9`
- Required **Git blob** for `api/v3/navigation-coverage/v1/manifest.json`: `522284bd7bd24e2420621ca0cbbdc38b4126716c`
- Required SHA-256 of that same navigation file: `2b637755ef70697d6e96e99e26ebe783d911df21a45caaffc7d9c301829149f4`
- Expected starting cumulative manifest: **60 books**, ending `JAS, 1PE`.
- If *either* the commit or the navigation file changed: **STOP. Reconcile with the newest GitHub state before uploading.** Do not overwrite newer navigation or accepted records.

## Manual owner installation

1. Extract the OUTER ZIP locally. **Do not upload any ZIP files directly into the repository.**
2. Extract `UPLOAD_BATCH_01_2PE_1JN_2JN_ADD_FILES.zip`. Upload those files/folders into the *repository root*, preserving the exact nested paths. All are new additive files, including 54 source author chapters, 9 chapter indexes, 3 book manifests, 3 book P coverage files, 3 staging readers and the audit/manifest/notes.
3. Verify installed file hashes using `2PE_1JN_2JN_V3_UPLOAD_MANIFEST.json`. Check that earlier 60 books and all existing previous reader files are untouched.
4. **LAST**, extract `UPLOAD_BATCH_02_FINAL_63_BOOK_NAV.zip` and replace only `api/v3/navigation-coverage/v1/manifest.json`. This changes cumulative navigation from 60 to 63 while retaining all previous IDs, snapshots and P counts.
5. Verify current GitHub `main` contains all manifest listed files with matching Git blob SHA values, and that GitHub Pages completes SUCCESS for the *final upload commit*.
6. Check live desktop/mobile readers at:
   - https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-second-peter-v3.html
   - https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-first-john-v3.html
   - https://sotw-historical-commentaries.github.io/historical-commentary-resources/review-second-john-v3.html
7. Spot-check first/middle/last verse, book introductions, chapter/passage P scope, and missing-author displays. Verify shared Adam Clarke Peter-preface navigation resolves from the existing 1 Peter snapshot. Do not consider live UI acceptance complete before this check.

## Source and attribution safety

- The five CrossWire/SWORD digital editions are extracted with their original KJV-native NT binary record keys and original OSIS (byte-identical source string). John Gill is from HelloAO's exact explicit verse anchors.
- No adjacent-anchor verse ranges are inferred. No alternate edition is overlaid on an existing SWORD chapter. KJV is a *navigation coordinate*, not embedded Bible text.
- Keil & Delitzsch has no New Testament work. Calvin has no 2 John source in the provided native and HelloAO archives. Both remain explicitly unavailable. MHC 2 John carries its original John Reynolds completion credit in the native source marker.
- P sections use exact source fragment offsets, fragment SHA-256 and source pointers. The original Clarke preface explicitly addressing First and Second Peter is projected from the *already-installed 1 Peter snapshot* without modifying or copying it.
- The older three held JFB group introductions remain unmapped. No speculative P eligibility, imaginary verse 0, or new rights declaration.
- No changes to CGBC player, SPP, Bible Tools, active source archives or any GitHub repository have been made in preparing this ZIP.

## Release readiness

PASS for local archive SHA-256, SWORD record and HelloAO verse anchor identity, complete verse-route/index pointers, source-backed P fragment boundaries and archive integrity. Simulated in-browser desktop/mobile testing passed for new readers, while direct live Pages testing remains pending manual installation.
