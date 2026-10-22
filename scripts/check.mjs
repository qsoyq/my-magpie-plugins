import assert from "node:assert/strict";
import { readdir, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = await realpath(fileURLToPath(new URL("../", import.meta.url)));
const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));
const rootManifest = await readJson(path.join(root, "package.json"));
assert.equal(rootManifest.private, true, "The workspace root must remain private");
assert.deepEqual(rootManifest.workspaces, ["packages/*"]);
assert.ok(
  (await readFile(path.join(root, "AGENTS.md"), "utf8")).trim(),
  "AGENTS.md must contain the shared project instructions",
);
assert.match(
  await readFile(path.join(root, "CLAUDE.md"), "utf8"),
  /^@AGENTS\.md\r?$/m,
  "CLAUDE.md must import @AGENTS.md on its own line",
);
const names = new Set([rootManifest.name]);
let packages = 0;
let sources = 0;

async function checkPackage(dir) {
  const manifest = await readJson(path.join(dir, "package.json"));
  assert.equal(typeof manifest.name, "string", dir + ": missing name");
  assert.ok(manifest.name.trim(), dir + ": empty name");
  assert.ok(!names.has(manifest.name), "Duplicate package name: " + manifest.name);
  names.add(manifest.name);
  assert.equal(typeof manifest.version, "string", dir + ": missing version");
  assert.ok(manifest.version.trim(), dir + ": empty version");
  assert.equal(manifest.private, true, dir + ": personal packages must be private");
  assert.ok((await readFile(path.join(dir, "README.md"), "utf8")).trim());
  // Validate current file-entry conventions without pretending to implement the full magpie schema.
  for (const entry of [manifest.main, manifest.magpie?.hooks]) {
    if (entry === undefined) continue;
    assert.equal(typeof entry, "string", dir + ": entry must be a file path");
    const target = await realpath(path.resolve(dir, entry));
    const relative = path.relative(dir, target);
    assert.ok(relative && relative !== ".." && !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative), "Entry must stay inside its package: " + entry);
    assert.ok((await stat(target)).isFile(), "Entry is not a file: " + entry);
  }
  packages++;
}

async function checkSources(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", "coverage", "dist"].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    assert.ok(!entry.isSymbolicLink(), "Source symlinks are not checked: " + file);
    if (entry.isDirectory()) await checkSources(file);
    else if (/\.(?:js|mjs|cjs)$/.test(entry.name)) {
      execFileSync(process.execPath, ["--check", file], { stdio: "inherit" });
      sources++;
    }
  }
}

for (const group of ["packages", "templates"]) {
  const dir = path.join(root, group);
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    assert.ok(!entry.isSymbolicLink(), "Package symlink is not supported: " + entry.name);
    if (entry.isDirectory()) await checkPackage(path.join(dir, entry.name));
  }
  await checkSources(dir);
}
await checkSources(path.join(root, "scripts"));
console.log("Checked Agent entry files, " + packages + " package(s) and " + sources + " JavaScript file(s).");
