# icd-10-cm

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

* v0.x.x - April 1, 2024, ICD-10-CM update
