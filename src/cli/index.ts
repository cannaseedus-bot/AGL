#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { run } from "../runtime/index.js";
import { glyphs } from "../glyphs/index.js";
import { tokenize } from "../core/tokenizer.js";
import { parse } from "../core/parser.js";

const args = process.argv.slice(2);
const command = args[0];
const file = args[1];

if (!command || !file) {
  console.log("Usage:");
  console.log("  agl run <file>");
  console.log("  agl compile <file>");
  console.log("  agl inspect <file>");
  process.exit(1);
}

const source = readFileSync(file, "utf8");

switch (command) {
  case "run": {
    const result = run(source, { glyphs });
    console.log(result);
    break;
  }

  case "compile": {
    const tokens = tokenize(source);
    const ast = parse(tokens);
    const out = JSON.stringify(ast, null, 2);
    const outFile = file.replace(/\.agl$/, ".json");
    writeFileSync(outFile, out);
    console.log(`Compiled → ${outFile}`);
    break;
  }

  case "inspect": {
    const tokens = tokenize(source);
    const ast = parse(tokens);
    console.log("Tokens:", tokens);
    console.log("AST:", ast);
    break;
  }

  default:
    console.log(`Unknown command: ${command}`);
}
