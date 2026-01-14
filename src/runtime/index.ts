import { tokenize } from "../core/tokenizer.js";
import { parse } from "../core/parser.js";
import { execute } from "./executor.js";
import { Registry } from "./registry.js";

export function run(source: string, options: { glyphs: Registry }) {
  const tokens = tokenize(source);
  const ast = parse(tokens);
  return execute(ast, options.glyphs);
}

export * from "./registry.js";
export * from "./context.js";
export * from "./executor.js";
