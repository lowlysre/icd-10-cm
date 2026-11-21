# icd-10-cm-es

[![NPM Version](https://img.shields.io/npm/v/%40lowlysre%2Ficd-10-cm-es)](https://www.npmjs.com/package/@lowlysre/icd-10-cm-es)
[![Test](https://github.com/lowlysre/icd-10-cm/actions/workflows/test.yml/badge.svg)](https://github.com/lowlysre/icd-10-cm/actions/workflows/test.yml)
[![sustainable-npm](https://img.shields.io/badge/sustainable--npm-🌱-blue?style=flat)](https://github.com/lowlysre/sustainable-npm)

A data package containing the CIE-10-ES Spanish descriptions for ICD-10-CM diagnosis codes, from the 6th edition (2026) of the Spanish Ministry of Health's translation, types included!

- 🇪🇸 Official text, copied from the Ministerio de Sanidad's reference table
- 🔒 Secure, a zero dependency package with provenance. Use it alone, or next to [@lowlysre/icd-10-cm](https://www.npmjs.com/package/@lowlysre/icd-10-cm) for the English descriptions
- ✅ Checked against ICD-10-CM FY2027, a lookup answers only for codes in that release
- 🔌 Offline, the full code set ships inside the package: no API keys, no rate limits, and no network calls at runtime

> [!IMPORTANT]
> CIE-10-ES is Spain's national code set. The descriptions here are for display. US claims and reporting use the English ICD-10-CM release.

## Install

```shell
npm install @lowlysre/icd-10-cm-es
```

## Usage

```ts
import getCIE10ESDescription, {
  hasCIE10ESDescription,
} from "@lowlysre/icd-10-cm-es";

// Lookups normalize dots, casing, and whitespace automatically
getCIE10ESDescription("E11.9");
// "Diabetes mellitus tipo 2 sin complicaciones"

// A code with no Spanish description returns undefined
getCIE10ESDescription("B88.01"); // undefined

hasCIE10ESDescription("E11.9"); // true
hasCIE10ESDescription("B88.01"); // false
```

CommonJS works too:

```js
const { getCIE10ESDescription } = require("@lowlysre/icd-10-cm-es");
```

### Falling back to English

The two packages don't depend on each other. Install both and chain the lookups to show Spanish where it exists and English everywhere else:

```ts
import { getICD10Description } from "@lowlysre/icd-10-cm";
import { getCIE10ESDescription } from "@lowlysre/icd-10-cm-es";

const describe = (code: string) =>
  getCIE10ESDescription(code) ?? getICD10Description(code);

describe("E11.9"); // "Diabetes mellitus tipo 2 sin complicaciones"
describe("B88.01"); // "Infestation by Demodex mites"
```

## Coverage

CIE-10-ES trails ICD-10-CM. The 6th edition translates ICD-10-CM through the October 1, 2024 update (FY2025), and this package checks codes against FY2027:

- 74,202 of FY2027's 74,879 codes have a Spanish description
- 677 codes have none, because they joined ICD-10-CM after the October 2024 update. A lookup returns `undefined` for them
- 58 CIE-10-ES codes aren't in FY2027, because ICD-10-CM has since deleted or split them. `B88.0` is one, now `B88.01` and `B88.09`. They stay in the data file, and a lookup returns `undefined` for them
- A category header that has child codes, such as `A00` or `E11`, isn't in the dataset. `E11.9` is

A code in both sets keeps its 6th edition wording even where the CDC has reworded the English description since FY2025.

### Checking which edition is bundled

`CIE10_ES_RELEASE` describes the data shipped in the installed version:

```ts
import { CIE10_ES_RELEASE } from "@lowlysre/icd-10-cm-es";

CIE10_ES_RELEASE.edition; // 6
CIE10_ES_RELEASE.editionYear; // 2026
CIE10_ES_RELEASE.effectiveDate; // "2026-01-01"
CIE10_ES_RELEASE.sourceDate; // "2025-05-22"
CIE10_ES_RELEASE.codeCount; // 74260
CIE10_ES_RELEASE.icd10cmFiscalYear; // 2027
```

## API

- `getCIE10ESDescription(code)` (also the default export) returns the Spanish description for a code, or `undefined` when CIE-10-ES has none or the code isn't in the ICD-10-CM release named by `icd10cmFiscalYear`. Input is normalized first, and non-string input returns `undefined`.
- `hasCIE10ESDescription(code)` returns `true` when the lookup has a description for the code.
- `normalizeCIE10ESCode(code)` strips whitespace and dots and uppercases, matching the dataset keys. Non-string input returns `""`.
- `CIE10_ES_RELEASE` is a frozen object with the bundled edition, its effective date, the source table's date, the dataset's code count, and the ICD-10-CM fiscal year that lookups are checked against.
- Types: `CIE10ESDictionary`, `CIE10ESRelease`.

The package supports Node.js 22 or later.

## Raw data via CDN

The package exports two JSON files, and browsers and other runtimes can fetch them straight from jsDelivr:

- `data/cie10es.min.json` is a flat object of normalized code to description. It holds every CIE-10-ES final code, the 58 that ICD-10-CM doesn't have included
- `data/not-in-icd10cm.min.json` is the array of those 58 codes

The lookup functions apply the second file for you. Reading the raw data, apply it yourself:

```js
const base = "https://cdn.jsdelivr.net/npm/@lowlysre/icd-10-cm-es@1/data";
const codes = await (await fetch(`${base}/cie10es.min.json`)).json();
const skip = new Set(
  await (await fetch(`${base}/not-in-icd10cm.min.json`)).json(),
);

const describe = (code) => (skip.has(code) ? undefined : codes[code]);
describe("E119"); // "Diabetes mellitus tipo 2 sin complicaciones"
```

Pin the major version in the URL so the data only changes when you choose to upgrade.

## Versioning

This package has its own version line, separate from `@lowlysre/icd-10-cm`. A change to its data ships as a new major version. That happens when a new CIE-10-ES edition lands, which has been every two years, and when a new ICD-10-CM release changes which codes a lookup answers for.

Minor and patch versions contain code and tooling changes only; the data stays the same.

## Data Source

The descriptions come from the `ES2026 Finales` sheet of the [Diagnósticos Tabla de Referencia CIE-10-ES 2026](https://www.sanidad.gob.es/estadEstudios/estadisticas/normalizacion/CIE10/2026/Diagnosticos_Tabla_Referencia_CIE10ES_2026.xlsx), version 1.0, dated May 22, 2025. The Ministerio de Sanidad publishes it on its [classifications page](https://www.sanidad.gob.es/estadEstudios/estadisticas/normalizacion/home.htm) as the Spanish translation of ICD-10-CM, a work of the CDC's National Center for Health Statistics (NCHS).

The text is copied as published. The only change is that a run of whitespace inside a description becomes one space, which affects two descriptions that carry a stray tab.

The Ministry's [legal notice](https://www.sanidad.gob.es/avisoLegal/home.htm) allows reuse: "quedando autorizada su reproducción total o parcial, modificación, distribución y comunicación, para usos comerciales y no comerciales". It asks reusers to cite the source, give the date of its last update, and keep the content's meaning intact. The MIT license covers this package's code.

This package is not affiliated with or endorsed by the Ministerio de Sanidad, the CDC, NCHS, or CMS.

## Contributing

See [CONTRIBUTING.md](https://github.com/lowlysre/icd-10-cm/blob/main/.github/CONTRIBUTING.md) for setup and the data update steps.
