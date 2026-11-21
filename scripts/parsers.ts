import type { SheetRow } from "./xlsx.ts";

export type CodeDictionary = { [code: string]: string };

const codePattern = /^[A-Z][0-9A-Z]{2,6}$/;
const linePattern = /^(\S+)\s+(\S.*?)\s*$/;

// CDC "Code Descriptions in Tabular Order" text: one "<code> <description>"
// per line.
export const parseICDFile = (content: string): CodeDictionary => {
  const dictionary: CodeDictionary = {};

  for (const [index, line] of content.split(/\r?\n/).entries()) {
    if (line.trim() === "") {
      continue;
    }

    const match = linePattern.exec(line);
    const [, code, description] = match ?? [];

    if (!code || !description || !codePattern.test(code)) {
      throw new Error(
        `Line ${index + 1} is not "<code> <description>": ${line}`,
      );
    }

    if (Object.hasOwn(dictionary, code)) {
      throw new Error(`Line ${index + 1} repeats code ${code}`);
    }

    dictionary[code] = description;
  }

  return dictionary;
};

// Rows of the final-codes sheet in the Ministerio de Sanidad's CIE-10-ES
// reference table: a header, then code in column A and description in B.
// Codes lose their dot to match the ICD-10-CM keys. Whitespace runs collapse
// to one space, because the source has stray tabs inside a few descriptions.
export const parseCIE10ESRows = (rows: SheetRow[]): CodeDictionary => {
  const [header, ...codeRows] = rows;

  if (header?.A !== "Código" || header.B !== "Descripción") {
    throw new Error(
      'Row 1 is not the "Código", "Descripción" header of a final-codes sheet',
    );
  }

  const dictionary: CodeDictionary = {};

  for (const [index, row] of codeRows.entries()) {
    const code = (row.A ?? "").replace(/\./g, "").trim().toUpperCase();
    const description = (row.B ?? "").replace(/\s+/g, " ").trim();

    if (!codePattern.test(code) || description === "") {
      throw new Error(
        `Row ${index + 2} is not a code and description: ${JSON.stringify(row)}`,
      );
    }

    if (Object.hasOwn(dictionary, code)) {
      throw new Error(`Row ${index + 2} repeats code ${code}`);
    }

    dictionary[code] = description;
  }

  return dictionary;
};

export const codesMissingFrom = (
  codes: CodeDictionary,
  reference: CodeDictionary,
): string[] =>
  Object.keys(codes)
    .filter((code) => !Object.hasOwn(reference, code))
    .toSorted();
