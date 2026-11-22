# Raw data via CDN

How to read the [@lowlysre/icd-10-cm-es](../README.md) dataset without the lookup functions.

The package exports two JSON files, and browsers and other runtimes can fetch them straight from jsDelivr:

- `data/cie10es.min.json` is a flat object of normalized code to description. It holds every CIE-10-ES final code, the 58 that ICD-10-CM doesn't have included
- `data/not-in-icd10cm.min.json` is the array of those 58 codes

The lookup functions apply the second file for you. Reading the raw data, apply it yourself:

```js
const base = "https://cdn.jsdelivr.net/npm/@lowlysre/icd-10-cm-es@main/data";
const codes = await (await fetch(`${base}/cie10es.min.json`)).json();
const skip = new Set(
  await (await fetch(`${base}/not-in-icd10cm.min.json`)).json(),
);

const describe = (code) => (skip.has(code) ? undefined : codes[code]);
describe("E119"); // "Diabetes mellitus tipo 2 sin complicaciones"
```

Pin the major version in the URL so the data only changes when you choose to upgrade.

Bundlers, edge runtimes, and other environments without file system access can import the same files:

```js
const codes = require("@lowlysre/icd-10-cm-es/data/cie10es.min.json");
const skip = require("@lowlysre/icd-10-cm-es/data/not-in-icd10cm.min.json");
```
