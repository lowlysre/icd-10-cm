import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

import {
  codesMissingFrom,
  parseCIE10ESRows,
  parseICDFile,
} from "../scripts/parsers.ts";
import { listXlsxSheets, readXlsxSheet } from "../scripts/xlsx.ts";

// Checks that span both packages. Neither package depends on the other, so
// the repo is the only place these can run.
const require = createRequire(import.meta.url);
const root = path.join(import.meta.dirname, "..");
const read = (...segments: string[]): string =>
  fs.readFileSync(path.join(root, ...segments), "utf-8");

const icd = require("../packages/icd-10-cm/dist/index.cjs");
const es = require("../packages/icd-10-cm-es/dist/index.cjs");

const icdJson = read("packages", "icd-10-cm", "data", "icd10.min.json");
const cieJson = read("packages", "icd-10-cm-es", "data", "cie10es.min.json");
const icdData = JSON.parse(icdJson);
const cieData = JSON.parse(cieJson);

describe("generated datasets", () => {
  it("ICD-10-CM matches what the parse script produces from the CDC file", () => {
    assert.equal(
      icdJson,
      JSON.stringify(parseICDFile(read("scripts", "icd10cm.txt"))),
    );
  });

  it("CIE-10-ES matches what the parse script produces from the reference table", () => {
    const workbook = fs.readFileSync(
      path.join(root, "scripts", "cie10es.xlsx"),
    );
    const finalCodesSheet = listXlsxSheets(workbook).find((name) =>
      /\bFinales$/.test(name),
    ) as string;
    assert.equal(
      cieJson,
      JSON.stringify(
        parseCIE10ESRows(readXlsxSheet(workbook, finalCodesSheet)),
      ),
    );
  });

  it("list every CIE-10-ES code that ICD-10-CM doesn't have", () => {
    assert.equal(
      read("packages", "icd-10-cm-es", "data", "not-in-icd10cm.min.json"),
      JSON.stringify(codesMissingFrom(cieData, icdData)),
    );
  });
});

describe("the two packages", () => {
  it("name the same ICD-10-CM release", () => {
    assert.equal(
      es.CIE10_ES_RELEASE.icd10cmFiscalYear,
      icd.ICD10_CM_RELEASE.fiscalYear,
    );
  });

  it("normalize a code to the same key", () => {
    for (const code of [" a00.1 ", "A00. 1", "e11.9", "", null, 42]) {
      assert.equal(es.normalizeCIE10ESCode(code), icd.normalizeICD10Code(code));
    }
  });

  it("agree that every code with a Spanish description is in ICD-10-CM", () => {
    const answered = Object.keys(cieData).filter(es.hasCIE10ESDescription);
    assert.deepEqual(
      answered.filter((code) => !icd.hasICD10Code(code)),
      [],
    );
    assert.equal(
      answered.length,
      Object.keys(cieData).length - codesMissingFrom(cieData, icdData).length,
    );
  });
});
