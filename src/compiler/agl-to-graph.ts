import { tokenize } from "../core/tokenizer.js";
import { parse } from "../core/parser.js";
import { EditorEngine } from "../editor/engine.js";

type ParsedNode = {
  name: string;
  args: string[];
};

export function aglToGraph(source: string) {
  const tokens = tokenize(source);
  const ast = parse(tokens) as ParsedNode[];
  const engine = new EditorEngine();

  ast.forEach((node, i) => {
    engine.addNode({
      id: "n" + i,
      glyph: node.name,
      inputs: node.args,
      position: { x: 100, y: i * 80 },
    });

    if (i > 0) engine.connect("n" + (i - 1), "n" + i);
  });

  return engine;
}
