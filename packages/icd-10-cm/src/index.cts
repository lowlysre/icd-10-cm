import { readFileSync } from "node:fs";
import { join } from "node:path";

export type ICD10Dictionary = { [code: string]: string };

export type ICD10CMRelease = {
  readonly fiscalYear: number;
  readonly effectiveDate: string;
  readonly codeCount: number;
};

export const ICD10_CM_RELEASE: ICD10CMRelease = Object.freeze({
  fiscalYear: 2027,
  effectiveDate: "2026-10-01",
  codeCount: 74879,
});

export const ensureICD10DatasetLoaded = (
  data: ICD10Dictionary,
): ICD10Dictionary => {
  const datasetHasEntries = data && Object.keys(data).length > 0;

  if (!datasetHasEntries) {
    throw new Error("ICD-10-CM data failed to load");
  }

  return data;
};

let dataset: ICD10Dictionary | undefined;

// Lazily read and parse the dataset on first lookup so importing the
// package costs nothing until it is actually used.
const loadDataset = (): ICD10Dictionary => {
  if (dataset === undefined) {
    const dataPath = join(__dirname, "..", "data", "icd10.min.json");
    dataset = ensureICD10DatasetLoaded(
      JSON.parse(readFileSync(dataPath, "utf-8")) as ICD10Dictionary,
    );
  }

  return dataset;
};

// The dataset keys come from the CMS source file: uppercase, no decimal
// point. Non-string input (untyped JS callers, model-generated tool
// arguments) normalizes to "", which never matches a key.
export const normalizeICD10Code = (code: string): string =>
  typeof code === "string" ? code.replace(/[\s.]/g, "").toUpperCase() : "";

export const getICD10Description = (code: string): string | undefined =>
  loadDataset()[normalizeICD10Code(code)];

export const hasICD10Code = (code: string): boolean =>
  getICD10Description(code) !== undefined;

export default getICD10Description;
