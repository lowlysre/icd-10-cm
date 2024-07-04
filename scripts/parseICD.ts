import fs from 'fs';
import path from 'path';

interface ICD10Dictionary {
  [code: string]: string;
}

const filePath = path.join(__dirname, 'icd10cm.txt');
const fileContent = fs.readFileSync(filePath, 'utf-8');
const outputFilePath = path.join('./data/icd10.min.json');

// Function to parse the ICD file content
const parseICDFile = (content: string): ICD10Dictionary => {
  const lines = content.split('\n'); // Split content into lines
  const dictionary: ICD10Dictionary = {};

  for (const line of lines) {
    const [code, ...descriptionParts] = line.split(/\s+/); // Split by whitespace (tab or spaces)
    const description = descriptionParts.join(' '); // Rejoin the description parts

    if (code && description) {
      dictionary[code] = description.trim(); // Add to dictionary
    }
  }

  return dictionary;
};

// Output
const icdDictionary = parseICDFile(fileContent);
console.debug(icdDictionary);
fs.writeFileSync(outputFilePath, JSON.stringify(icdDictionary), 'utf-8');
