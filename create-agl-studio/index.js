#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prompts from "prompts";
import { cyan, green } from "kolorist";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const { name } = await prompts({
    type: "text",
    name: "name",
    message: "Project name",
    initial: "agl-studio-app"
  });

  const target = path.resolve(process.cwd(), name);
  fs.mkdirSync(target, { recursive: true });

  const templateDir = path.join(__dirname, "template");

  copy(templateDir, target);

  console.log(green(`\n✔ Project created at ${target}`));
  console.log(cyan("\nNext steps:"));
  console.log(`  cd ${name}`);
  console.log("  npm install");
  console.log("  npm run dev\n");
}

function copy(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const source = path.join(src, entry.name);
    const target = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(target, { recursive: true });
      copy(source, target);
    } else {
      fs.copyFileSync(source, target);
    }
  }
}

main();
