# API

Reference for [@lowlysre/icd-10-cm](../README.md).

- `getICD10Description(code)` (also the default export) returns the description for a code, or `undefined` when the code isn't in the bundled release. Input is normalized first.
- `hasICD10Code(code)` returns `true` when the code is in the bundled release.
- `normalizeICD10Code(code)` strips whitespace and dots and uppercases, matching the dataset keys. Non-string input returns `""`.
- `ICD10_CM_RELEASE` is a frozen object with the bundled release's `fiscalYear`, `effectiveDate`, and `codeCount`.
- `ensureICD10DatasetLoaded(data)` returns `data`, or throws when it's empty or missing.
- Types: `ICD10Dictionary`, `ICD10CMRelease`.

The package supports Node.js 22 or later.
