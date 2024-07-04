import getICD10Description from "../src/index";

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
});
