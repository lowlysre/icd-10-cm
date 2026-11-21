# Raw data via CDN

How to read the [@lowlysre/icd-10-cm](../README.md) dataset without the lookup functions.

The dataset is a flat JSON object of normalized code to description. Browsers and other runtimes can fetch it straight from jsDelivr without installing anything:

```js
const res = await fetch(
  "https://cdn.jsdelivr.net/npm/@lowlysre/icd-10-cm@3/data/icd10.min.json",
);
const codes = await res.json();
codes["A000"]; // "Cholera due to Vibrio cholerae 01, biovar cholerae"
```

Pin the major version in the URL so the code set only changes when you choose to upgrade.

Bundlers, edge runtimes, and other environments without file system access can import the same file instead of using the lookup functions. The JSON file is exported from the package:

```js
const codes = require("@lowlysre/icd-10-cm/data/icd10.min.json");
```
