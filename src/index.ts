import icd10 from "../data/icd10.min.json";
import type { ICD10Dictionary } from "./ICD10Dictionary";

export const ensureICD10DatasetLoaded = (
  data: ICD10Dictionary,
): ICD10Dictionary => {
  const datasetHasEntries = data && Object.keys(data).length > 0;

  if (!datasetHasEntries) {
    throw new Error("ICD-10-CM data failed to load");
  }

  return data;
};

const dataset: ICD10Dictionary = ensureICD10DatasetLoaded(
  icd10 as ICD10Dictionary,
);

export const normalizeICD10Code = (code: string): string =>
  code.trim().replace(/\./g, "").toUpperCase();

export const getICD10Description = (code: string): string | undefined => {
  const normalized = normalizeICD10Code(code);
  return dataset[normalized];
};

export type { ICD10Dictionary };

export default getICD10Description;
