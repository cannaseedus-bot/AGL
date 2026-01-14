import { AST, ASTNode } from "./ast.js";

export function parse(tokens: { value: string }[]): AST {
  const ast: AST = [];

  for (const t of tokens) {
    const match = t.value.match(/^(\w+)\((.*)\)$/);
    if (!match) continue;

    const [, name, rawArgs] = match;
    const args = rawArgs ? rawArgs.split(",").map((s) => s.trim()) : [];

    const node: ASTNode = { type: "call", name, args };
    ast.push(node);
  }

  return ast;
}
