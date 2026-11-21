import { readFileSync } from "node:fs";
import { join } from "node:path";

export type CIE10ESDictionary = { [code: string]: string };

export type CIE10ESRelease = {
  readonly edition: number;
  readonly editionYear: number;
  readonly effectiveDate: string;
  readonly sourceDate: string;
  readonly codeCount: number;
  readonly icd10cmFiscalYear: number;
};

export const CIE10_ES_RELEASE: CIE10ESRelease = Object.freeze({
  edition: 6,
  editionYear: 2026,
  effectiveDate: "2026-01-01",
  sourceDate: "2025-05-22",
  codeCount: 74260,
  icd10cmFiscalYear: 2027,
});

type Datasets = {
  descriptions: CIE10ESDictionary;
  notInICD10CM: ReadonlySet<string>;
};

const readData = (file: string): unknown =>
  JSON.parse(readFileSync(join(__dirname, "..", "data", file), "utf-8"));

let datasets: Datasets | undefined;

// Lazily read and parse the data on first lookup so importing the package
// costs nothing until it is actually used.
const loadDatasets = (): Datasets => {
  if (datasets === undefined) {
    datasets = {
      descriptions: readData("cie10es.min.json") as CIE10ESDictionary,
      notInICD10CM: new Set(readData("not-in-icd10cm.min.json") as string[]),
    };
  }

  return datasets;
};

// The dataset keys are uppercase with no decimal point, the same form the
// ICD-10-CM package uses. Non-string input (untyped JS callers,
// model-generated tool arguments) normalizes to "", which never matches a key.
export const normalizeCIE10ESCode = (code: string): string =>
  typeof code === "string" ? code.replace(/[\s.]/g, "").toUpperCase() : "";

// The dataset holds every CIE-10-ES final code, including codes that
// ICD-10-CM has since deleted or split. A lookup answers only for codes in
// the ICD-10-CM release named by CIE10_ES_RELEASE.icd10cmFiscalYear.
export const getCIE10ESDescription = (code: string): string | undefined => {
  const { descriptions, notInICD10CM } = loadDatasets();
  const key = normalizeCIE10ESCode(code);

  return notInICD10CM.has(key) ? undefined : descriptions[key];
};

export const hasCIE10ESDescription = (code: string): boolean =>
  getCIE10ESDescription(code) !== undefined;

export default getCIE10ESDescription;
