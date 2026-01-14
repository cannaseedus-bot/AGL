import { EditorState } from "./engine.js";

export interface RenderNode {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
}

export interface RenderConnection {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export interface RenderOutput {
  nodes: RenderNode[];
  connections: RenderConnection[];
}

export class NodeGraphRenderer {
  constructor(private palette: Record<string, { color: string }>) {}

  render(state: EditorState): RenderOutput {
    const nodes = state.nodes.map(node => ({
      id: node.id,
      x: node.position.x,
      y: node.position.y,
      label: node.glyph,
      color: this.palette[node.glyph]?.color || "#888"
    }));

    const connections = state.connections.map(connection => {
      const from = state.nodes.find(node => node.id === connection.from);
      const to = state.nodes.find(node => node.id === connection.to);

      return {
        from: {
          x: from?.position.x || 0,
          y: from?.position.y || 0
        },
        to: {
          x: to?.position.x || 0,
          y: to?.position.y || 0
        }
      };
    });

    return { nodes, connections };
  }
}
