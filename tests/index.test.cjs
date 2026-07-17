const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const {
  default: getICD10Description,
  ensureICD10DatasetLoaded,
  normalizeICD10Code,
} = require("../dist/index.js");
const icd10 = require("../data/icd10.min.json");

describe("getICD10Description", () => {
  it("returns the correct description for a valid ICD-10 code", () => {
    const code = "A000";
    const expectedDescription =
      "Cholera due to Vibrio cholerae 01, biovar cholerae";
    const description = getICD10Description(code);
    assert.equal(description, expectedDescription);
  });

  it("returns undefined for an invalid ICD-10 code", () => {
    const code = "Z999";
    const description = getICD10Description(code);
    assert.equal(description, undefined);
  });

  it("returns the correct description for another valid ICD-10 code", () => {
    const code = "A001";
    const expectedDescription =
      "Cholera due to Vibrio cholerae 01, biovar eltor";
    const description = getICD10Description(code);
    assert.equal(description, expectedDescription);
  });

  it("normalizes codes with dots before lookup", () => {
    const codeWithDot = "A00.0";
    const expectedDescription =
      "Cholera due to Vibrio cholerae 01, biovar cholerae";
    const description = getICD10Description(codeWithDot);
    assert.equal(description, expectedDescription);
  });

  it("normalizes lowercase codes", () => {
    const lowercaseCode = "a001";
    const expectedDescription =
      "Cholera due to Vibrio cholerae 01, biovar eltor";
    const description = getICD10Description(lowercaseCode);
    assert.equal(description, expectedDescription);
  });
});

describe("normalizeICD10Code", () => {
  it("trims, uppercases, and strips dots", () => {
    assert.equal(normalizeICD10Code(" a00.1 "), "A001");
  });
});

describe("data integrity", () => {
  it("loads a non-empty dataset", () => {
    assert.ok(Object.keys(icd10).length > 0);
  });
});

describe("data load guard", () => {
  it("throws when the dataset is empty", () => {
    assert.throws(
      () => ensureICD10DatasetLoaded({}),
      /ICD-10-CM data failed to load/,
    );
  });
});
