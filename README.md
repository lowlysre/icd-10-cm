# icd-10-cm

![NPM Version](https://img.shields.io/npm/v/%40lowlysre%2Ficd-10-cm)
[![Test](https://github.com/lowlysre/icd-10-cm/actions/workflows/test.yml/badge.svg)](https://github.com/lowlysre/icd-10-cm/actions/workflows/test.yml)
[![sustainable-npm](https://img.shields.io/badge/sustainable--npm-🌱-blue?style=flat)](https://github.com/lowlysre/sustainable-npm)

A data package containing the latest ICD-10 CM codes and descriptions, types included!

- ⚡ Fast, lookups via dictionary of minified json
- 🔒 Secure, a zero dependency package with provenance
- ⚛️ Small, limited to CM (Clinical Modification) data and less than 1MB compressed

## Install

```shell
npm install @lowlysre/icd-10-cm
```

## Usage

```ts
import getICD10Description, { normalizeICD10Code } from "@lowlysre/icd-10-cm";

// Lookups normalize dots, casing, and whitespace automatically
const description = getICD10Description("A00.0");
// "Cholera due to Vibrio cholerae 01, biovar cholerae"

// Handle missing codes by checking for undefined
const maybeDescription = getICD10Description("Z999");
if (!maybeDescription) {
  // fallback logic here
}

// You can normalize a code explicitly if you store normalized keys elsewhere
const normalized = normalizeICD10Code(" a00.1 "); // "A001"
```

## Data Source

[www.cdc.gov/nchs](https://www.cdc.gov/nchs/icd/icd-10-cm/files.html)

## Development

For regenerating `data/icd10.min.json` via `npm run parse-icd`, use Node.js v22+ (required for `--experimental-strip-types`).

### Updating the ICD-10-CM data

CDC/NCHS publishes a new code set annually (effective October 1) and occasionally a mid-year update (effective April 1). Check the [CDC files page](https://www.cdc.gov/nchs/icd/icd-10-cm/files.html) or the [CMS ICD-10 page](https://www.cms.gov/medicare/coding-billing/icd-10-codes) for the latest "Code Descriptions in Tabular Order" archive.

1. Download the latest Code Descriptions in Tabular Order zip
2. Extract `icd10cm_codes_<year>.txt` and save it as `scripts/icd10cm.txt` (format: code, whitespace, description per line)
3. Run `npm run parse-icd` to regenerate `data/icd10.min.json`
4. Run `npm test` and verify the reported code count matches the addenda
5. Bump the package version and publish

## Versions

- v2.0.0 - Data updated to the April 1, 2026 ICD-10-CM release (74,719 codes, from the FY2024 set). TypeScript 7 (native compiler) toolchain, ESLint replaced with oxlint + Prettier, dropped tsup for plain tsc (zero-bundler dual ESM/CJS), dataset shipped once and lazy-loaded (~50% smaller install, faster imports), fixed broken `require()` entry point
- v1.1.5 - Dependency and toolchain maintenance
- v1.1.0 - Migrated tests from Jest to Node's built-in test runner, TypeScript 6 toolchain
- v1.0.3 - Dependency maintenance, CODEOWNERS
- v1.0.1 - README badges, sustainable-npm publishing workflow
- v1.0.0 - Normalized lookups, data load guard, bundled ESM/CJS build, flat ESLint 9 config, 100% tests/coverage
- v0.0.x - Initial releases, April 1, 2024 ICD-10-CM update
