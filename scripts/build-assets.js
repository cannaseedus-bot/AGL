import { mkdirSync, cpSync, existsSync } from "fs";
import { join } from "path";

const src = join(process.cwd(), "assets");
const dest = join(process.cwd(), "dist", "assets");

if (!existsSync(src)) {
  console.log("No assets/ directory found. Skipping asset build.");
  process.exit(0);
}

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });

console.log("Assets copied to dist/assets");
