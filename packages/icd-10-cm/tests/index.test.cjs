const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const {
  default: getICD10Description,
  ensureICD10DatasetLoaded,
  normalizeICD10Code,
  hasICD10Code,
  getICD10Description: namedGetICD10Description,
  ICD10_CM_RELEASE,
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

  it("returns undefined for non-string input instead of throwing", () => {
    for (const value of [null, undefined, 123, {}, ["A000"]]) {
      assert.equal(getICD10Description(value), undefined);
    }
  });

  it("returns undefined for category headers that have child codes", () => {
    assert.equal(getICD10Description("A00"), undefined);
    assert.equal(getICD10Description("E11"), undefined);
  });

  it("does not resolve Object.prototype property names", () => {
    for (const key of ["constructor", "toString", "__proto__"]) {
      assert.equal(getICD10Description(key), undefined);
    }
  });
});

describe("hasICD10Code", () => {
  it("is true for real codes in any supported format", () => {
    assert.equal(hasICD10Code("A00.0"), true);
    assert.equal(hasICD10Code(" a000 "), true);
  });

  it("is false for unknown codes, categories, and non-string input", () => {
    assert.equal(hasICD10Code("Z999"), false);
    assert.equal(hasICD10Code("E11"), false);
    assert.equal(hasICD10Code(""), false);
    assert.equal(hasICD10Code(null), false);
  });
});

describe("normalizeICD10Code", () => {
  it("trims, uppercases, and strips dots", () => {
    assert.equal(normalizeICD10Code(" a00.1 "), "A001");
  });

  it("strips multiple dots", () => {
    assert.equal(normalizeICD10Code("a.0.0.1"), "A001");
  });

  it("strips internal whitespace from pasted codes", () => {
    assert.equal(normalizeICD10Code("A00. 1"), "A001");
    assert.equal(normalizeICD10Code("A00\u00a0.1"), "A001");
    assert.equal(getICD10Description("A00. 1"), getICD10Description("A001"));
  });

  it("handles empty strings", () => {
    assert.equal(normalizeICD10Code(""), "");
    assert.equal(normalizeICD10Code("  "), "");
  });

  it("returns an empty string for non-string input", () => {
    assert.equal(normalizeICD10Code(null), "");
    assert.equal(normalizeICD10Code(undefined), "");
    assert.equal(normalizeICD10Code(42), "");
  });
});

describe("data integrity", () => {
  it("loads a non-empty dataset", () => {
    assert.ok(Object.keys(icd10).length > 0);
  });

  it("matches the code count declared in ICD10_CM_RELEASE", () => {
    assert.equal(Object.keys(icd10).length, ICD10_CM_RELEASE.codeCount);
  });

  it("uses only well-formed normalized codes", () => {
    const malformed = Object.keys(icd10).filter(
      (code) => !/^[A-Z][0-9A-Z]{2,6}$/.test(code),
    );
    assert.deepEqual(malformed, []);
  });

  it("has trimmed, non-empty descriptions", () => {
    const bad = Object.entries(icd10).filter(
      ([, description]) =>
        typeof description !== "string" ||
        description === "" ||
        description !== description.trim(),
    );
    assert.deepEqual(bad, []);
  });
});

describe("ICD10_CM_RELEASE", () => {
  it("describes the bundled release", () => {
    assert.equal(ICD10_CM_RELEASE.fiscalYear, 2027);
    assert.equal(ICD10_CM_RELEASE.effectiveDate, "2026-10-01");
  });

  it("is frozen", () => {
    assert.ok(Object.isFrozen(ICD10_CM_RELEASE));
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
