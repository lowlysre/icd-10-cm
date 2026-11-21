# Contributing

Issues and pull requests are welcome.

## Setup

Use Node.js 22 or later. The repo is an npm workspace with one package per folder under `packages/`.

```shell
npm ci
npm test
npm run lint
```

`npm test` builds both packages, runs each package's unit tests, and installs each packed tarball into a temp project to check the published entry points. It then runs the repo-level tests in `tests/`, which cover the parse script and the checks that span both packages. `npm run test:coverage` enforces 100% line, branch, and function coverage for each package.

## Data changes

The `data` folder in each package is generated, so don't edit it by hand.

If a description looks wrong, check it against the source first: the [CDC source files](https://www.cdc.gov/nchs/icd/icd-10-cm/files.html) for English, and the Ministerio de Sanidad's reference table on its [classifications page](https://www.sanidad.gob.es/estadEstudios/estadisticas/normalizacion/home.htm) for Spanish. Both packages copy the official text. The only edit is that a run of whitespace inside a Spanish description becomes one space.

### Updating the ICD-10-CM data

CDC/NCHS publishes a new code set annually (effective October 1) and occasionally a mid-year update (effective April 1). Check the [CDC files page](https://www.cdc.gov/nchs/icd/icd-10-cm/files.html) or the [CMS ICD-10 page](https://www.cms.gov/medicare/coding-billing/icd-10-codes) for the latest "Code Descriptions in Tabular Order" archive.

1. Download the latest Code Descriptions in Tabular Order zip
2. Extract `icd10cm_codes_<year>.txt` and save it as `scripts/icd10cm.txt` (format: code, whitespace, description per line)
3. Run `npm run parse-icd` to regenerate the data in both packages; the script needs Node.js 22 or later for `--experimental-strip-types`. A new ICD-10-CM release changes `packages/icd-10-cm-es/data/not-in-icd10cm.min.json`, the list of CIE-10-ES codes the release doesn't have
4. Update `ICD10_CM_RELEASE` in `packages/icd-10-cm/src/index.cts` with the new fiscal year, effective date, and code count, and `icd10cmFiscalYear` in `CIE10_ES_RELEASE` in `packages/icd-10-cm-es/src/index.cts`; `npm test` fails until they match the regenerated data
5. Update the release in the `description` and `keywords` fields of `packages/icd-10-cm/package.json` and in both package READMEs. The parse script prints the coverage numbers for the Spanish README
6. Check the Ministerio de Sanidad's [classifications page](https://www.sanidad.gob.es/estadEstudios/estadisticas/normalizacion/home.htm) for a newer CIE-10-ES edition or reference table, and follow the steps below if there is one
7. Run `npm test`
8. Mark the commit as a breaking change, as described under [Releases](#releases)

### Updating the CIE-10-ES data

The Ministerio de Sanidad has published a new CIE-10-ES edition every two years, in effect each January 1, and has reissued a reference table between editions once.

1. Download the Diagnósticos "Tabla de Referencia" workbook for the edition from the [classifications page](https://www.sanidad.gob.es/estadEstudios/estadisticas/normalizacion/home.htm)
2. Save it as `scripts/cie10es.xlsx`
3. Run `npm run parse-icd`. It reads the sheet whose name ends in "Finales" and prints the table's date
4. Update `CIE10_ES_RELEASE` in `packages/icd-10-cm-es/src/index.cts` with the edition, its year and effective date, the table's date, and the code count
5. Update the edition in the `description` field of `packages/icd-10-cm-es/package.json` and in the package's README
6. Run `npm test`
7. Mark the commit as a breaking change, as described under [Releases](#releases)

## Releases

The publish workflow runs by hand from the Actions tab. It uses [semantic-release](https://semantic-release.gitbook.io/semantic-release/) with [@anolilab/multi-semantic-release](https://github.com/anolilab/semantic-release/tree/main/packages/multi-semantic-release) to version and publish each package on its own.

- A package is released from the commits that touched its folder since its last release. A commit that touches only files outside `packages/` releases nothing
- The commit message sets the version bump, following [Conventional Commits](https://www.conventionalcommits.org/): `fix:` is a patch, `feat:` is a minor, and a `!` after the type or a `BREAKING CHANGE:` footer is a major. Pull requests are squash-merged, so the pull request title is the commit message
- A commit that regenerates a dataset is a breaking change: title it `feat!: ...`. A release can delete or redefine codes, so data only ever changes in a major version. One commit that regenerates both packages' data releases a major of both
- Each release gets a git tag in the form `@lowlysre/icd-10-cm@3.3.0` and its own GitHub release
- The release tooling lives in `.github/release` with its own lockfile, so `npm ci` at the repo root doesn't install it

## Pull requests

- Keep the package dependency-free at runtime
- Add or update tests for any behavior change
- Run `npm run lint` before pushing; Prettier and oxlint both run in CI
