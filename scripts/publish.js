#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

function run(cmd, options = {}) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", ...options });
}

function runQuiet(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

function requireConfirm(args) {
  if (args.includes("--confirm")) {
    return;
  }

  console.error("\n❌ Publish aborted. Re-run with --confirm to proceed.");
  process.exit(1);
}

function ensureCleanWorkingTree() {
  const status = runQuiet("git status --porcelain");
  if (status.length > 0) {
    console.error("\n❌ Working tree is not clean. Commit or stash changes first.");
    process.exit(1);
  }
}

function ensureDistOutput() {
  const requiredFiles = [
    "dist/index.js",
    "dist/index.d.ts",
    "dist/glyphs/index.js",
    "dist/runtime/index.js",
    "dist/cli/index.js",
    "dist/vite.js",
  ];

  if (!fs.existsSync("dist")) {
    console.error("\n❌ No dist/ folder found. Build output missing.");
    process.exit(1);
  }

  const missing = requiredFiles.filter((file) => !fs.existsSync(file));
  if (missing.length > 0) {
    console.error(`\n❌ Build output incomplete. Missing: ${missing.join(", ")}`);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const releaseType = args[0] ?? "stable";
const allowedReleaseTypes = ["alpha", "beta", "stable"];

if (!allowedReleaseTypes.includes(releaseType)) {
  console.error(
    `\n❌ Unknown release type: ${releaseType}. Use alpha, beta, or stable.`
  );
  process.exit(1);
}

requireConfirm(args);
ensureCleanWorkingTree();

const pkgPath = path.resolve("package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

console.log(`\nPublishing agl-es (current ${pkg.version})...`);

if (releaseType === "alpha" || releaseType === "beta") {
  run(`npm version prerelease --preid ${releaseType}`);
} else {
  run("npm version patch");
}

const updatedPkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const version = updatedPkg.version;

run("npm run build");
ensureDistOutput();

const tag = version.includes("alpha")
  ? "alpha"
  : version.includes("beta")
    ? "beta"
    : "latest";

console.log(`\nPublishing ${updatedPkg.name} v${version} with tag: ${tag}`);

run(`npm publish --access public --tag ${tag}`);
run("git push --follow-tags");

console.log(`\n✔ Published ${updatedPkg.name} v${version} to npm`);
