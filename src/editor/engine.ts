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

  get state() {
    return this.getState();
  }

  addNode(node: EditorNode) {
    this.nodes.push(node);
  }

  moveNode(id: string, x: number, y: number) {
    const node = this.nodes.find((entry) => entry.id === id);
    if (!node) return;
    node.position = { x, y };
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
