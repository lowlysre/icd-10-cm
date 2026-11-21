import { describe, it } from "node:test";
import assert from "node:assert/strict";

import getCIE10ESDescription, {
  hasCIE10ESDescription,
  normalizeCIE10ESCode,
  CIE10_ES_RELEASE,
} from "../dist/index.mjs";

describe("ESM entry point", () => {
  it("exposes a callable default export", () => {
    assert.equal(typeof getCIE10ESDescription, "function");
    assert.equal(
      getCIE10ESDescription("A00.0"),
      "Cólera debido a Vibrio cholerae 01, biotipo cholerae",
    );
  });

  it("exposes named exports", () => {
    assert.equal(normalizeCIE10ESCode(" a00.1 "), "A001");
    assert.equal(hasCIE10ESDescription("a00.1"), true);
    assert.equal(CIE10_ES_RELEASE.editionYear, 2026);
  });
});
