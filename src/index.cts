import { readFileSync } from "node:fs";
import { join } from "node:path";

export type ICD10Dictionary = { [code: string]: string };

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

// ICD-10-CM codes are 3-7 alphanumeric characters; the decimal point
// conventionally written after the third character (e.g. "W61.62XD") is
// display-only formatting and is not part of the code itself. The CMS
// source file (icd10cm_codes_*.txt) lists codes without it, uppercase,
// so lookups normalize by stripping dots and uppercasing to match the
// dataset keys.
export const normalizeICD10Code = (code: string): string =>
  code.trim().replace(/\./g, "").toUpperCase();

export const getICD10Description = (code: string): string | undefined =>
  loadDataset()[normalizeICD10Code(code)];

export default getICD10Description;
