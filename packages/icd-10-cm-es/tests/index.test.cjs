const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const {
  default: getCIE10ESDescription,
  getCIE10ESDescription: namedGetCIE10ESDescription,
  hasCIE10ESDescription,
  normalizeCIE10ESCode,
  CIE10_ES_RELEASE,
} = require("../dist/index.cjs");
const cie10es = require("../data/cie10es.min.json");
const notInICD10CM = require("../data/not-in-icd10cm.min.json");

const cholera = "Cólera debido a Vibrio cholerae 01, biotipo cholerae";

describe("getCIE10ESDescription", () => {
  it("returns the Spanish description for a code", () => {
    assert.equal(getCIE10ESDescription("A000"), cholera);
    assert.equal(
      getCIE10ESDescription("E119"),
      "Diabetes mellitus tipo 2 sin complicaciones",
    );
  });

  it("normalizes dots, casing, and whitespace before lookup", () => {
    assert.equal(getCIE10ESDescription("A00.0"), cholera);
    assert.equal(getCIE10ESDescription(" a00. 0 "), cholera);
  });

  it("returns undefined for a code CIE-10-ES has no description for", () => {
    // B88.01 joined ICD-10-CM after the release this edition translates.
    assert.equal(getCIE10ESDescription("B88.01"), undefined);
    assert.equal(getCIE10ESDescription("Z999"), undefined);
    assert.equal(getCIE10ESDescription(""), undefined);
  });

  it("returns undefined for a CIE-10-ES code that ICD-10-CM doesn't have", () => {
    // ICD-10-CM split B88.0 into B88.01 and B88.09. The dataset keeps it.
    assert.equal(typeof cie10es.B880, "string");
    assert.equal(getCIE10ESDescription("B88.0"), undefined);
  });

  it("returns undefined for non-string input instead of throwing", () => {
    for (const value of [null, undefined, 123, {}, ["A000"]]) {
      assert.equal(getCIE10ESDescription(value), undefined);
    }
  });

  it("does not resolve Object.prototype property names", () => {
    for (const key of ["constructor", "toString", "__proto__"]) {
      assert.equal(getCIE10ESDescription(key), undefined);
    }
  });

  it("exposes the same function as default and named export", () => {
    assert.equal(getCIE10ESDescription, namedGetCIE10ESDescription);
  });
});

describe("hasCIE10ESDescription", () => {
  it("is true only for codes the lookup answers for", () => {
    assert.equal(hasCIE10ESDescription("A00.0"), true);
    assert.equal(hasCIE10ESDescription("B88.01"), false);
    assert.equal(hasCIE10ESDescription("B88.0"), false);
    assert.equal(hasCIE10ESDescription(null), false);
  });
});

describe("normalizeCIE10ESCode", () => {
  it("trims, uppercases, and strips dots and internal whitespace", () => {
    assert.equal(normalizeCIE10ESCode(" a00. 1 "), "A001");
  });

  it("returns an empty string for non-string input", () => {
    assert.equal(normalizeCIE10ESCode(null), "");
    assert.equal(normalizeCIE10ESCode(42), "");
  });
});

describe("data integrity", () => {
  it("matches the code count declared in CIE10_ES_RELEASE", () => {
    assert.equal(Object.keys(cie10es).length, CIE10_ES_RELEASE.codeCount);
  });

  it("uses only well-formed normalized codes", () => {
    const malformed = Object.keys(cie10es).filter(
      (code) => !/^[A-Z][0-9A-Z]{2,6}$/.test(code),
    );
    assert.deepEqual(malformed, []);
  });

  it("has trimmed, single-spaced, non-empty descriptions", () => {
    const bad = Object.entries(cie10es).filter(
      ([, description]) =>
        typeof description !== "string" ||
        description === "" ||
        description !== description.replace(/\s+/g, " ").trim(),
    );
    assert.deepEqual(bad, []);
  });

  it("lists only dataset codes as missing from ICD-10-CM", () => {
    const unknown = notInICD10CM.filter(
      (code) => !Object.hasOwn(cie10es, code),
    );
    assert.deepEqual(unknown, []);
    assert.equal(new Set(notInICD10CM).size, notInICD10CM.length);
  });
});
