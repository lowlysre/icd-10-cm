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
  const packageRoot = path.join(__dirname, "..");
  const cholera = "Cólera debido a Vibrio cholerae 01, biotipo cholerae";
  let tempDir;
  let packageDir;

  before(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "cie10es-pack-test-"));
    const packOutput = execSync(`npm pack --pack-destination "${tempDir}"`, {
      cwd: packageRoot,
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
    packageDir = path.join(
      tempDir,
      "node_modules",
      "@lowlysre",
      "icd-10-cm-es",
    );
  });

  after(() => {
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("ships each data file exactly once", () => {
    const jsonFiles = fs
      .readdirSync(packageDir, { recursive: true })
      .map((f) => String(f).replaceAll("\\", "/"))
      .filter((f) => f.endsWith(".min.json"))
      .toSorted();
    assert.deepEqual(jsonFiles, [
      "data/cie10es.min.json",
      "data/not-in-icd10cm.min.json",
    ]);
  });

  it("installs nothing else, so it stands alone", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(packageDir, "package.json"), "utf-8"),
    );
    for (const field of [
      "dependencies",
      "peerDependencies",
      "optionalDependencies",
    ]) {
      assert.equal(manifest[field], undefined);
    }
    assert.deepEqual(
      fs.readdirSync(path.join(tempDir, "node_modules")).toSorted(),
      [".package-lock.json", "@lowlysre"],
    );
  });

  it("resolves and works via require()", () => {
    const script =
      'const m = require("@lowlysre/icd-10-cm-es");' +
      `const cholera = ${JSON.stringify(cholera)};` +
      'if (typeof m.default !== "function") throw new Error("no default");' +
      'if (m.getCIE10ESDescription("A00.0") !== cholera) throw new Error("bad lookup");' +
      'if (m.getCIE10ESDescription("B88.0") !== undefined) throw new Error("answered for a code ICD-10-CM lacks");' +
      'if (m.normalizeCIE10ESCode(" a00.1 ") !== "A001") throw new Error("bad normalize");' +
      'if (m.hasCIE10ESDescription("A00.0") !== true || m.hasCIE10ESDescription("Z999") !== false) throw new Error("bad hasCIE10ESDescription");' +
      'if (require("@lowlysre/icd-10-cm-es/data/cie10es.min.json").A000 !== cholera) throw new Error("no data export");' +
      'if (!require("@lowlysre/icd-10-cm-es/data/not-in-icd10cm.min.json").includes("B880")) throw new Error("no code list export");' +
      'if (require("@lowlysre/icd-10-cm-es/package.json").name !== "@lowlysre/icd-10-cm-es") throw new Error("no package.json export");';
    execFileSync(process.execPath, ["-e", script], {
      cwd: tempDir,
      encoding: "utf-8",
    });
  });

  it("resolves and works via import()", () => {
    const script =
      'import("@lowlysre/icd-10-cm-es").then((m) => {' +
      `const cholera = ${JSON.stringify(cholera)};` +
      'if (typeof m.default !== "function") throw new Error("no default");' +
      'if (m.default("A00.0") !== cholera) throw new Error("bad default lookup");' +
      'if (m.getCIE10ESDescription("a000") !== cholera) throw new Error("bad named lookup");' +
      "});";
    execFileSync(process.execPath, ["-e", script], {
      cwd: tempDir,
      encoding: "utf-8",
    });
  });

  it("type-checks a TS consumer against the published types", () => {
    fs.writeFileSync(
      path.join(tempDir, "consumer.ts"),
      'import getCIE10ESDescription, { normalizeCIE10ESCode, hasCIE10ESDescription, CIE10_ES_RELEASE, type CIE10ESDictionary, type CIE10ESRelease } from "@lowlysre/icd-10-cm-es";\n' +
        'const d: string | undefined = getCIE10ESDescription("A00.0");\n' +
        'const n: string = normalizeCIE10ESCode("a00.1");\n' +
        'const h: boolean = hasCIE10ESDescription("A00.0");\n' +
        'const dict: CIE10ESDictionary = { A000: "x" };\n' +
        "const release: CIE10ESRelease = CIE10_ES_RELEASE;\n" +
        "const fy: number = release.icd10cmFiscalYear;\n" +
        "void d;\nvoid n;\nvoid h;\nvoid dict;\nvoid fy;\n",
    );
    execFileSync(
      process.execPath,
      [
        // npm hoists workspace dev dependencies to the repo root.
        path.join(
          packageRoot,
          "..",
          "..",
          "node_modules",
          "typescript",
          "lib",
          "tsc.js",
        ),
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
