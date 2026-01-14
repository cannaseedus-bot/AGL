import { Context } from "./context.js";
import { Registry } from "./registry.js";
import { AST } from "../core/ast.js";

export function execute(ast: AST, registry: Registry) {
  const ctx = new Context();

  for (const node of ast) {
    const fn = registry.get(node.name);
    const args = node.args.map((a) => (a === "_" ? ctx.value : a));
    const result = fn(...args);
    ctx.update(result);
  }

  return ctx.value;
}
