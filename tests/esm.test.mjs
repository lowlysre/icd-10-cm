import { describe, it } from "node:test";
import assert from "node:assert/strict";

import getICD10Description, {
  normalizeICD10Code,
  ensureICD10DatasetLoaded,
} from "../dist/index.mjs";

describe("ESM entry point", () => {
  it("exposes a callable default export", () => {
    assert.equal(typeof getICD10Description, "function");
    assert.equal(
      getICD10Description("A00.0"),
      "Cholera due to Vibrio cholerae 01, biovar cholerae",
    );
  });

  it("exposes named exports", () => {
    assert.equal(normalizeICD10Code(" a00.1 "), "A001");
    assert.equal(typeof ensureICD10DatasetLoaded, "function");
  });
});
