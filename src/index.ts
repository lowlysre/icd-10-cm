import icd10 from "../data/icd10.min.json";
import type { ICD10Dictionary } from "./ICD10Dictionary";

const dataset: ICD10Dictionary = icd10 as ICD10Dictionary;
const datasetHasEntries = dataset && Object.keys(dataset).length > 0;

export const normalizeICD10Code = (code: string): string =>
  code.trim().replace(/\./g, "").toUpperCase();

export const getICD10Description = (code: string): string | undefined => {
  if (!datasetHasEntries) {
    throw new Error("ICD-10-CM data failed to load");
  }
  const normalized = normalizeICD10Code(code);
  return dataset[normalized];
};

export type { ICD10Dictionary };

export default getICD10Description;
