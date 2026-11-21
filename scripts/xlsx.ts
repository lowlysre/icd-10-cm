import zlib from "node:zlib";

// Reads worksheet cells from an .xlsx workbook using only node:zlib, so the
// parse script stays dependency-free. It covers what a reference table needs:
// stored or deflated zip entries, shared and inline strings.

export type SheetRow = { [column: string]: string };

type ZipEntry = {
  method: number;
  compressedSize: number;
  localHeaderOffset: number;
};

const END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const CENTRAL_DIRECTORY_ENTRY = 0x02014b50;

const readZipEntries = (zip: Buffer): Map<string, ZipEntry> => {
  let end = zip.length - 22;
  while (end >= 0 && zip.readUInt32LE(end) !== END_OF_CENTRAL_DIRECTORY) {
    end--;
  }

  if (end < 0) {
    throw new Error("Not an .xlsx file: no zip central directory");
  }

  const entries = new Map<string, ZipEntry>();
  const count = zip.readUInt16LE(end + 10);
  let offset = zip.readUInt32LE(end + 16);

  for (let i = 0; i < count; i++) {
    if (zip.readUInt32LE(offset) !== CENTRAL_DIRECTORY_ENTRY) {
      throw new Error("Corrupt .xlsx file: bad zip central directory entry");
    }

    const nameLength = zip.readUInt16LE(offset + 28);
    const name = zip.toString("utf8", offset + 46, offset + 46 + nameLength);
    entries.set(name, {
      method: zip.readUInt16LE(offset + 10),
      compressedSize: zip.readUInt32LE(offset + 20),
      localHeaderOffset: zip.readUInt32LE(offset + 42),
    });
    offset +=
      46 +
      nameLength +
      zip.readUInt16LE(offset + 30) +
      zip.readUInt16LE(offset + 32);
  }

  return entries;
};

const readZipText = (
  zip: Buffer,
  entries: Map<string, ZipEntry>,
  name: string,
): string => {
  const entry = entries.get(name);

  if (!entry) {
    throw new Error(`Workbook has no ${name}`);
  }

  const header = entry.localHeaderOffset;
  const start =
    header + 30 + zip.readUInt16LE(header + 26) + zip.readUInt16LE(header + 28);
  const data = zip.subarray(start, start + entry.compressedSize);

  if (entry.method === 0) {
    return data.toString("utf8");
  }

  if (entry.method === 8) {
    return zlib.inflateRawSync(data).toString("utf8");
  }

  throw new Error(`Unsupported zip compression ${entry.method} in ${name}`);
};

const namedEntities: { [name: string]: string } = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

const decodeXml = (text: string): string =>
  text.replace(
    /&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi,
    (_, entity: string) => {
      if (entity.startsWith("#")) {
        const hex = entity[1]?.toLowerCase() === "x";
        return String.fromCodePoint(
          parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10),
        );
      }

      return namedEntities[entity.toLowerCase()] as string;
    },
  );

const attributes = (tag: string): { [name: string]: string } =>
  Object.fromEntries(
    [...tag.matchAll(/([\w:]+)="([^"]*)"/g)].map(([, name, value]) => [
      name,
      decodeXml(value as string),
    ]),
  );

// A string item holds one <t>, or several when the cell has rich text runs.
const textOf = (xml: string): string =>
  [
    ...xml
      .replace(/<rPh\b[\s\S]*?<\/rPh>/g, "")
      .matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g),
  ]
    .map(([, text]) => decodeXml(text as string))
    .join("");

const readSharedStrings = (
  zip: Buffer,
  entries: Map<string, ZipEntry>,
): string[] =>
  entries.has("xl/sharedStrings.xml")
    ? [
        ...readZipText(zip, entries, "xl/sharedStrings.xml").matchAll(
          /<si\/>|<si>([\s\S]*?)<\/si>/g,
        ),
      ].map(([, item]) => textOf(item ?? ""))
    : [];

const sheetPaths = (
  zip: Buffer,
  entries: Map<string, ZipEntry>,
): Map<string, string> => {
  const targets = new Map(
    [
      ...readZipText(zip, entries, "xl/_rels/workbook.xml.rels").matchAll(
        /<Relationship\b[^>]*>/g,
      ),
    ].map(([tag]) => {
      const { Id, Target } = attributes(tag);
      return [Id, Target] as const;
    }),
  );

  return new Map(
    [
      ...readZipText(zip, entries, "xl/workbook.xml").matchAll(
        /<sheet\b[^>]*>/g,
      ),
    ].map(([tag]) => {
      const sheet = attributes(tag);
      const target = targets.get(sheet["r:id"]) as string;
      return [
        sheet.name as string,
        target.startsWith("/") ? target.slice(1) : `xl/${target}`,
      ];
    }),
  );
};

export const listXlsxSheets = (zip: Buffer): string[] => [
  ...sheetPaths(zip, readZipEntries(zip)).keys(),
];

// Returns the sheet's rows in order, each keyed by column letter.
export const readXlsxSheet = (zip: Buffer, sheetName: string): SheetRow[] => {
  const entries = readZipEntries(zip);
  const path = sheetPaths(zip, entries).get(sheetName);

  if (!path) {
    throw new Error(`Workbook has no sheet named "${sheetName}"`);
  }

  const strings = readSharedStrings(zip, entries);
  const sheet = readZipText(zip, entries, path);

  return [...sheet.matchAll(/<row\b[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g)].map(
    ([, cells]) => {
      const row: SheetRow = {};

      for (const [, tag, body] of (cells ?? "").matchAll(
        /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g,
      )) {
        const { r, t } = attributes(tag as string);
        const column = (r as string).replace(/\d+$/, "");
        const value = /<v>([\s\S]*?)<\/v>/.exec(body ?? "")?.[1];

        if (t === "inlineStr") {
          row[column] = textOf(body ?? "");
        } else if (value !== undefined) {
          row[column] =
            t === "s" ? (strings[Number(value)] as string) : decodeXml(value);
        }
      }

      return row;
    },
  );
};
