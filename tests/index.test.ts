import getICD10Description, { normalizeICD10Code } from "../src/index";
import icd10 from "../data/icd10.min.json";
import type { ICD10Dictionary } from "../src/ICD10Dictionary";

describe("getICD10Description", () => {
  it("should return the correct description for a valid ICD-10 code", () => {
    const code = "A000";
    const expectedDescription =
      "Cholera due to Vibrio cholerae 01, biovar cholerae";
    const description = getICD10Description(code);
    expect(description).toBe(expectedDescription);
  });

  it("should return undefined for an invalid ICD-10 code", () => {
    const code = "Z999";
    const description = getICD10Description(code);
    expect(description).toBeUndefined();
  });

  it("should return the correct description for another valid ICD-10 code", () => {
    const code = "A001";
    const expectedDescription =
      "Cholera due to Vibrio cholerae 01, biovar eltor";
    const description = getICD10Description(code);
    expect(description).toBe(expectedDescription);
  });

  it("normalizes codes with dots before lookup", () => {
    const codeWithDot = "A00.0";
    const expectedDescription =
      "Cholera due to Vibrio cholerae 01, biovar cholerae";
    const description = getICD10Description(codeWithDot);
    expect(description).toBe(expectedDescription);
  });

  it("normalizes lowercase codes", () => {
    const lowercaseCode = "a001";
    const expectedDescription =
      "Cholera due to Vibrio cholerae 01, biovar eltor";
    const description = getICD10Description(lowercaseCode);
    expect(description).toBe(expectedDescription);
  });
});

describe("normalizeICD10Code", () => {
  it("trims, uppercases, and strips dots", () => {
    expect(normalizeICD10Code(" a00.1 ")).toBe("A001");
  });
});

describe("data integrity", () => {
  it("loads a non-empty dataset", () => {
    const dict = icd10 as ICD10Dictionary;
    expect(Object.keys(dict).length).toBeGreaterThan(0);
  });
});

describe("data load guard", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("throws when the dataset is empty", () => {
    jest.isolateModules(() => {
      jest.doMock("../data/icd10.min.json", () => ({}), { virtual: true });

      // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
      expect(() => require("../src/index")).toThrow("ICD-10-CM data failed to load");
    });
  });
});
