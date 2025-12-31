# icd-10-cm

[![Test](https://github.com/lowlysre/icd-10-cm/actions/workflows/test.yml/badge.svg)](https://github.com/lowlysre/icd-10-cm/actions/workflows/test.yml)
[![sustainable-npm](https://img.shields.io/badge/sustainable--npm-🌱-blue?style=flat)](https://github.com/lowlysre/sustainable-npm)


A data package containing the latest ICD-10 CM codes and descriptions, types included!

* ⚡ Fast, lookups via dictionary of minified json
* 🔒 Secure, a zero dependency package with provenance
* ⚛️ Small, limited to CM (Clinical Modification) data and less than 1MB compressed


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

## Versions

* v1.0.0 - Normalized lookups, data load guard, bundled ESM/CJS build, flat ESLint 9 config, 100% tests/coverage
* v0.x.x - April 1, 2024, ICD-10-CM update
