# Contributing

Issues and pull requests are welcome.

## Setup

Use Node.js 22 or later.

```shell
npm ci
npm test
npm run lint
```

`npm test` builds the package, runs the unit tests, and installs the packed tarball into a temp project to check the published entry points. `npm run test:coverage` enforces 100% line, branch, and function coverage.

## Data changes

`data/icd10.min.json` is generated, so don't edit it by hand.

If a description looks wrong, check it against the [CDC source files](https://www.cdc.gov/nchs/icd/icd-10-cm/files.html) first. This package copies the official text without edits.

### Updating the ICD-10-CM data

CDC/NCHS publishes a new code set annually (effective October 1) and occasionally a mid-year update (effective April 1). Check the [CDC files page](https://www.cdc.gov/nchs/icd/icd-10-cm/files.html) or the [CMS ICD-10 page](https://www.cms.gov/medicare/coding-billing/icd-10-codes) for the latest "Code Descriptions in Tabular Order" archive.

1. Download the latest Code Descriptions in Tabular Order zip
2. Extract `icd10cm_codes_<year>.txt` and save it as `scripts/icd10cm.txt` (format: code, whitespace, description per line)
3. Run `npm run parse-icd` to regenerate `data/icd10.min.json`; the script needs Node.js 22 or later for `--experimental-strip-types`
4. Update `ICD10_CM_RELEASE` in `src/index.cts` with the new fiscal year, effective date, and code count; `npm test` fails until the code count matches the regenerated data
5. Update the release in the `description` and `keywords` fields of `package.json` and in the [README](../README.md) intro
6. Run `npm test`
7. Bump the major version and publish

## Pull requests

- Keep the package dependency-free at runtime
- Add or update tests for any behavior change
- Run `npm run lint` before pushing; Prettier and oxlint both run in CI
