type GraphNode = {
  glyph: string;
  inputs: string[];
  position: { x: number; y: number };
};

type GraphState = {
  nodes: GraphNode[];
};

export function graphToAGL(state: GraphState) {
  const sorted = [...state.nodes].sort((a, b) => a.position.y - b.position.y);

  return sorted
    .map((n) => {
      const args = n.inputs.join(", ");
      return `${n.glyph}(${args})`;
    })
    .join("\n");
}
