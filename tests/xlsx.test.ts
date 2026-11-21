import { describe, it } from "node:test";
import assert from "node:assert/strict";
import zlib from "node:zlib";

import { listXlsxSheets, readXlsxSheet } from "../scripts/xlsx.ts";

// Builds a zip the way Excel lays one out, minus the checksums the reader
// doesn't use.
const zip = (files: { [name: string]: string }, deflate: boolean): Buffer => {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;

  for (const [name, text] of Object.entries(files)) {
    const raw = Buffer.from(text, "utf8");
    const data = deflate ? zlib.deflateRawSync(raw) : raw;
    const fileName = Buffer.from(name, "utf8");

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(deflate ? 8 : 0, 8);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(fileName.length, 26);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(deflate ? 8 : 0, 10);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(fileName.length, 28);
    central.writeUInt32LE(offset, 42);

    locals.push(local, fileName, data);
    centrals.push(central, fileName);
    offset += local.length + fileName.length + data.length;
  }

  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(Object.keys(files).length, 10);
  end.writeUInt32LE(Buffer.concat(centrals).length, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat([...locals, ...centrals, end]);
};

const workbook = {
  "xl/workbook.xml":
    '<workbook><sheets><sheet name="Intro" sheetId="8" r:id="rId1"/>' +
    '<sheet name="ES2026 Finales" sheetId="2" r:id="rId3"/></sheets></workbook>',
  // Listed out of order, with one absolute and one relative target.
  "xl/_rels/workbook.xml.rels":
    '<Relationships><Relationship Id="rId3" Target="worksheets/sheet3.xml"/>' +
    '<Relationship Id="rId1" Target="/xl/worksheets/sheet1.xml"/></Relationships>',
  "xl/sharedStrings.xml":
    "<sst><si><t>Código</t></si><si/>" +
    '<si><r><t>Fiebre </t></r><r><t xml:space="preserve">Q &amp; A &#225;&#xE9;</t></r>' +
    "<rPh><t>phonetic</t></rPh></si></sst>",
  "xl/worksheets/sheet1.xml":
    '<worksheet><sheetData><row r="1"><c r="C1" t="s"><v>0</v></c></row></sheetData></worksheet>',
  "xl/worksheets/sheet3.xml":
    '<worksheet><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c>' +
    '<c r="B1" t="inlineStr"><is><t>Descripción</t></is></c></row><row r="2"/>' +
    '<row r="3"><c r="A3" t="s"><v>2</v></c><c r="B3"><v>45799</v></c>' +
    '<c r="C3" t="s"><v>1</v></c><c r="D3"/></row></sheetData></worksheet>',
};

const expectedRows = [
  { A: "Código", B: "Descripción" },
  {},
  { A: "Fiebre Q & A áé", B: "45799", C: "" },
];

describe("readXlsxSheet", () => {
  it("reads shared, rich-text, inline, and numeric cells by sheet name", () => {
    assert.deepEqual(
      readXlsxSheet(zip(workbook, true), "ES2026 Finales"),
      expectedRows,
    );
  });

  it("reads stored entries as well as deflated ones", () => {
    assert.deepEqual(
      readXlsxSheet(zip(workbook, false), "ES2026 Finales"),
      expectedRows,
    );
    assert.deepEqual(readXlsxSheet(zip(workbook, false), "Intro"), [
      { C: "Código" },
    ]);
  });

  it("names the sheet it can't find", () => {
    assert.throws(
      () => readXlsxSheet(zip(workbook, true), "Finales"),
      /no sheet named "Finales"/,
    );
  });

  it("rejects a file that isn't a zip", () => {
    assert.throws(
      () => readXlsxSheet(Buffer.from("code,description\n"), "Finales"),
      /no zip central directory/,
    );
  });
});

describe("listXlsxSheets", () => {
  it("lists sheets in workbook order", () => {
    assert.deepEqual(listXlsxSheets(zip(workbook, true)), [
      "Intro",
      "ES2026 Finales",
    ]);
  });
});
