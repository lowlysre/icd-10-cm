const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const {
  default: getICD10Description,
  ensureICD10DatasetLoaded,
  normalizeICD10Code,
  getICD10Description: namedGetICD10Description,
} = require("../dist/index.cjs");
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

  it("returns undefined for empty and whitespace-only input", () => {
    assert.equal(getICD10Description(""), undefined);
    assert.equal(getICD10Description("   "), undefined);
  });

  it("exposes the same function as default and named export", () => {
    assert.equal(getICD10Description, namedGetICD10Description);
  });

  it("returns consistent results across repeated lookups", () => {
    const first = getICD10Description("A00.0");
    const second = getICD10Description("A00.0");
    assert.equal(first, second);
    assert.equal(typeof first, "string");
  });
});

describe("normalizeICD10Code", () => {
  it("trims, uppercases, and strips dots", () => {
    assert.equal(normalizeICD10Code(" a00.1 "), "A001");
  });

  it("strips multiple dots", () => {
    assert.equal(normalizeICD10Code("a.0.0.1"), "A001");
  });

  it("handles empty strings", () => {
    assert.equal(normalizeICD10Code(""), "");
    assert.equal(normalizeICD10Code("  "), "");
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

  it("throws for null or undefined datasets", () => {
    assert.throws(() => ensureICD10DatasetLoaded(null), /failed to load/);
    assert.throws(() => ensureICD10DatasetLoaded(undefined), /failed to load/);
  });

  it("returns the dataset when it has entries", () => {
    const data = { A000: "test" };
    assert.equal(ensureICD10DatasetLoaded(data), data);
  });
});
