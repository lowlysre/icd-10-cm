import icd10 from "../data/icd10.min.json";
import type { ICD10Dictionary } from "./ICD10Dictionary";

/**
 * Retrieves the description for a given ICD-10-CM code.
 *
 * @param {string} code - The ICD-10-CM code for which to get the description.
 * @returns {string | undefined} The description of the ICD-10-CM code, or `undefined` if the code is not found.
 *
 * @example
 * // Example usage with valid code:
 * const description = getICD10Description('A000');
 * console.log(description); // Outputs: 'Cholera due to Vibrio cholerae 01, biovar cholerae'
 *
 * // Example usage with invalid code:
 * const unknownDescription = getICD10Description('Z999');
 * console.log(unknownDescription); // Outputs: undefined (if the code does not exist)
 */
export const getICD10Description = (code: string): string | undefined => {
  const icd10Data = icd10 as ICD10Dictionary;
  const icd10Dictionary: ICD10Dictionary = icd10Data;
  return icd10Dictionary[code];
};

export default getICD10Description;
