# API

Reference for [@lowlysre/icd-10-cm-es](../README.md).

- `getCIE10ESDescription(code)` (also the default export) returns the Spanish description for a code, or `undefined` when CIE-10-ES has none or the code isn't in the ICD-10-CM release named by `icd10cmFiscalYear`. Input is normalized first, and non-string input returns `undefined`.
- `hasCIE10ESDescription(code)` returns `true` when the lookup has a description for the code.
- `normalizeCIE10ESCode(code)` strips whitespace and dots and uppercases, matching the dataset keys. Non-string input returns `""`.
- `CIE10_ES_RELEASE` is a frozen object with the bundled edition, its effective date, the source table's date, the dataset's code count, and the ICD-10-CM fiscal year that lookups are checked against.
- Types: `CIE10ESDictionary`, `CIE10ESRelease`.

The package supports Node.js 22 or later.
