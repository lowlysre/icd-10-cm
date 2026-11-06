import fs from "fs";
import path from "path";

interface ICD10Dictionary {
  [code: string]: string;
}

const filePath = path.join(import.meta.dirname, "icd10cm.txt");
const fileContent = fs.readFileSync(filePath, "utf-8");
const outputFilePath = path.join(
  import.meta.dirname,
  "..",
  "data",
  "icd10.min.json",
);

const codePattern = /^[A-Z][0-9A-Z]{2,6}$/;
const linePattern = /^(\S+)\s+(\S.*?)\s*$/;

const parseICDFile = (content: string): ICD10Dictionary => {
  const dictionary: ICD10Dictionary = {};

  for (const [index, line] of content.split(/\r?\n/).entries()) {
    if (line.trim() === "") {
      continue;
    }

    const match = linePattern.exec(line);
    const [, code, description] = match ?? [];

    if (!code || !description || !codePattern.test(code)) {
      throw new Error(
        `Line ${index + 1} is not "<code> <description>": ${line}`,
      );
    }

    if (Object.hasOwn(dictionary, code)) {
      throw new Error(`Line ${index + 1} repeats code ${code}`);
    }

    dictionary[code] = description;
  }

  return dictionary;
};

// Output
const icdDictionary = parseICDFile(fileContent);
fs.writeFileSync(outputFilePath, JSON.stringify(icdDictionary), "utf-8");
console.log(
  `Wrote ${Object.keys(icdDictionary).length} codes to ${outputFilePath}`,
);
