import { EditorEngine } from "../editor/engine.js";

type GlyphMatch = {
  name: string;
};

type GlyphMeta = {
  search: (query: string) => GlyphMatch[];
};

export function aiToGraph(text: string, glyphMeta: GlyphMeta, engine = new EditorEngine()) {
  const lines = text.split("\n").filter(Boolean);

  lines.forEach((line, i) => {
    const glyph = glyphMeta.search(line)[0];
    if (!glyph) return;

    engine.addNode({
      id: "n" + i,
      glyph: glyph.name,
      inputs: [],
      position: { x: 100, y: i * 80 },
    });

    if (i > 0) engine.connect("n" + (i - 1), "n" + i);
  });

  return engine;
}
