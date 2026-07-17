const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync, execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

// Packs the real tarball and installs it into a temp project, then
// exercises the published require/import entry points. This guards the
// exports map, the shipped file list, and runtime data resolution.
describe("packaged package", () => {
  const repoRoot = path.join(__dirname, "..");
  let tempDir;
  let packageDir;

  before(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "icd10-pack-test-"));
    const packOutput = execSync(`npm pack --pack-destination "${tempDir}"`, {
      cwd: repoRoot,
      encoding: "utf-8",
    });
    const tarball = path.join(
      tempDir,
      packOutput.trim().split("\n").pop().trim(),
    );

    fs.writeFileSync(
      path.join(tempDir, "package.json"),
      JSON.stringify({ name: "pack-test", version: "1.0.0", private: true }),
    );
    execSync(`npm install "${tarball}" --no-audit --no-fund`, {
      cwd: tempDir,
      encoding: "utf-8",
    });
    packageDir = path.join(tempDir, "node_modules", "@lowlysre", "icd-10-cm");
  });

  after(() => {
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("ships the data file exactly once", () => {
    assert.ok(fs.existsSync(path.join(packageDir, "data", "icd10.min.json")));
    const jsonFiles = fs
      .readdirSync(packageDir, { recursive: true })
      .filter((f) => String(f).endsWith("icd10.min.json"));
    assert.equal(jsonFiles.length, 1);
  });

  it("resolves and works via require()", () => {
    const script =
      'const m = require("@lowlysre/icd-10-cm");' +
      'if (typeof m.default !== "function") throw new Error("no default");' +
      'if (m.getICD10Description("A00.0") !== "Cholera due to Vibrio cholerae 01, biovar cholerae") throw new Error("bad lookup");' +
      'if (m.normalizeICD10Code(" a00.1 ") !== "A001") throw new Error("bad normalize");';
    execFileSync(process.execPath, ["-e", script], {
      cwd: tempDir,
      encoding: "utf-8",
    });
  });

  it("resolves and works via import()", () => {
    const script =
      'import("@lowlysre/icd-10-cm").then((m) => {' +
      'if (typeof m.default !== "function") throw new Error("no default");' +
      'if (m.default("A00.0") !== "Cholera due to Vibrio cholerae 01, biovar cholerae") throw new Error("bad default lookup");' +
      'if (m.getICD10Description("a000") !== "Cholera due to Vibrio cholerae 01, biovar cholerae") throw new Error("bad named lookup");' +
      "});";
    execFileSync(process.execPath, ["-e", script], {
      cwd: tempDir,
      encoding: "utf-8",
    });
  });

  it("type-checks a TS consumer against the published types", () => {
    fs.writeFileSync(
      path.join(tempDir, "consumer.ts"),
      'import getICD10Description, { normalizeICD10Code, ensureICD10DatasetLoaded, type ICD10Dictionary } from "@lowlysre/icd-10-cm";\n' +
        'const d: string | undefined = getICD10Description("A00.0");\n' +
        'const n: string = normalizeICD10Code("a00.1");\n' +
        'const dict: ICD10Dictionary = ensureICD10DatasetLoaded({ A000: "x" });\n' +
        "void d;\nvoid n;\nvoid dict;\n",
    );
    const tscJs = path.join(
      repoRoot,
      "node_modules",
      "typescript",
      "lib",
      "tsc.js",
    );
    execFileSync(
      process.execPath,
      [
        tscJs,
        "--noEmit",
        "--strict",
        "--module",
        "nodenext",
        "--moduleResolution",
        "nodenext",
        "consumer.ts",
      ],
      { cwd: tempDir, encoding: "utf-8" },
    );
  });
});
