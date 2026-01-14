import type { EditorConnection, EditorNode } from "./engine.js";

type RenderNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
};

type RenderConnection = {
  from: { x: number; y: number };
  to: { x: number; y: number };
};

type RenderState = {
  nodes: RenderNode[];
  connections: RenderConnection[];
};

type GraphState = {
  nodes: EditorNode[];
  connections: EditorConnection[];
};

const fallbackColor = "#4c6ef5";

export class NodeGraphRenderer {
  render(state: GraphState): RenderState {
    const nodePositions = new Map(state.nodes.map((node) => [node.id, node.position]));

    return {
      nodes: state.nodes.map((node) => ({
        id: node.id,
        label: node.glyph,
        x: node.position.x,
        y: node.position.y,
        color: node.color ?? fallbackColor,
      })),
      connections: state.connections
        .map((connection) => {
          const from = nodePositions.get(connection.from);
          const to = nodePositions.get(connection.to);

          if (!from || !to) {
            return null;
          }

          return {
            from,
            to,
          };
        })
        .filter((connection): connection is RenderConnection => Boolean(connection)),
    };
  }
}
