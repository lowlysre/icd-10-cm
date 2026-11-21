import fs from "fs";
import path from "path";
import { codesMissingFrom, parseCIE10ESRows, parseICDFile } from "./parsers.ts";
import { listXlsxSheets, readXlsxSheet } from "./xlsx.ts";

const packagesDir = path.join(import.meta.dirname, "..", "packages");

const writeJson = (file: string, value: unknown): void => {
  fs.writeFileSync(file, JSON.stringify(value), "utf-8");
};

// ICD-10-CM, from the CDC text file
const icdDictionary = parseICDFile(
  fs.readFileSync(path.join(import.meta.dirname, "icd10cm.txt"), "utf-8"),
);
const icdOutputPath = path.join(
  packagesDir,
  "icd-10-cm",
  "data",
  "icd10.min.json",
);
writeJson(icdOutputPath, icdDictionary);
console.log(
  `Wrote ${Object.keys(icdDictionary).length} codes to ${icdOutputPath}`,
);

// CIE-10-ES, from the Ministerio de Sanidad reference table
const workbook = fs.readFileSync(
  path.join(import.meta.dirname, "cie10es.xlsx"),
);
const sheetNames = listXlsxSheets(workbook);
const finalCodesSheet = sheetNames.find((name) => /\bFinales$/.test(name));

if (!finalCodesSheet) {
  throw new Error(
    `cie10es.xlsx has no final-codes sheet, found: ${sheetNames.join(", ")}`,
  );
}

const cieDictionary = parseCIE10ESRows(
  readXlsxSheet(workbook, finalCodesSheet),
);
const cieDataDir = path.join(packagesDir, "icd-10-cm-es", "data");
const cieOutputPath = path.join(cieDataDir, "cie10es.min.json");
writeJson(cieOutputPath, cieDictionary);
console.log(
  `Wrote ${Object.keys(cieDictionary).length} codes to ${cieOutputPath}`,
);

// The CIE-10-ES codes that the bundled ICD-10-CM release doesn't have. The
// Spanish lookup answers for none of them.
const notInICD10CM = codesMissingFrom(cieDictionary, icdDictionary);
const notInICD10CMPath = path.join(cieDataDir, "not-in-icd10cm.min.json");
writeJson(notInICD10CMPath, notInICD10CM);
console.log(`Wrote ${notInICD10CM.length} codes to ${notInICD10CMPath}`);

// The intro sheet carries the table's date as an Excel serial day number.
const intro = readXlsxSheet(workbook, sheetNames[0] as string);
const serial = Number(intro.find((row) => row.C?.startsWith("Fecha"))?.E);
const sourceDate = new Date(Date.UTC(1899, 11, 30 + serial))
  .toISOString()
  .slice(0, 10);
console.log(
  `CIE-10-ES source sheet "${finalCodesSheet}", dated ${sourceDate}: ` +
    `${codesMissingFrom(icdDictionary, cieDictionary).length} ICD-10-CM codes have no Spanish description`,
);
