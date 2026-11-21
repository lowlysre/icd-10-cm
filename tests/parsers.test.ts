import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { codesMissingFrom, parseCIE10ESRows } from "../scripts/parsers.ts";

const header = { A: "Código", B: "Descripción", C: "Nodo_Final" };

describe("parseCIE10ESRows", () => {
  it("keys descriptions by the code without its dot", () => {
    assert.deepEqual(
      parseCIE10ESRows([
        header,
        { A: "A00.0", B: "Cólera debido a Vibrio cholerae 01", C: "1" },
        { A: "B91", B: "Secuelas de poliomielitis", C: "1" },
      ]),
      {
        A000: "Cólera debido a Vibrio cholerae 01",
        B91: "Secuelas de poliomielitis",
      },
    );
  });

  it("collapses stray whitespace and changes nothing else", () => {
    assert.deepEqual(
      parseCIE10ESRows([
        header,
        { A: "D59.31", B: " Síndrome hemolítico-urémico \tasociado [SHU] " },
      ]),
      { D5931: "Síndrome hemolítico-urémico asociado [SHU]" },
    );
  });

  it("rejects a sheet without the code and description header", () => {
    assert.throws(
      () => parseCIE10ESRows([{ A: "A00.0", B: "Cólera" }]),
      /Row 1 is not the "Código", "Descripción" header/,
    );
    assert.throws(() => parseCIE10ESRows([]), /Row 1 is not/);
  });

  it("rejects a malformed code or an empty description", () => {
    assert.throws(
      () => parseCIE10ESRows([header, { A: "A00-A09", B: "Capítulo" }]),
      /Row 2 is not a code and description/,
    );
    assert.throws(
      () => parseCIE10ESRows([header, { A: "A00.0", B: " \t" }]),
      /Row 2 is not a code and description/,
    );
    assert.throws(
      () => parseCIE10ESRows([header, { B: "Cólera" }]),
      /Row 2 is not a code and description/,
    );
  });

  it("rejects a code that repeats once its dot is gone", () => {
    assert.throws(
      () =>
        parseCIE10ESRows([
          header,
          { A: "A00.0", B: "Cólera" },
          { A: "A000", B: "Cólera" },
        ]),
      /Row 3 repeats code A000/,
    );
  });
});

describe("codesMissingFrom", () => {
  it("lists codes absent from the reference set, sorted", () => {
    assert.deepEqual(
      codesMissingFrom({ D71: "x", A000: "x", B880: "x" }, { A000: "y" }),
      ["B880", "D71"],
    );
  });
});
