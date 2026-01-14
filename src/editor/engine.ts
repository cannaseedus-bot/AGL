export type EditorNode = {
  id: string;
  glyph: string;
  inputs: string[];
  position: { x: number; y: number };
  color?: string;
};

export type EditorConnection = {
  from: string;
  to: string;
};

export class EditorEngine {
  nodes: EditorNode[] = [];
  connections: EditorConnection[] = [];

  addNode(node: EditorNode) {
    this.nodes.push(node);
  }

  connect(from: string, to: string) {
    this.connections.push({ from, to });
  }

  getState() {
    return {
      nodes: this.nodes,
      connections: this.connections,
    };
  }
}
