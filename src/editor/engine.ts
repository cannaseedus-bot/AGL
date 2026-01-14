export interface EditorNode {
  id: string;
  glyph: string;
  inputs: string[];
  position: { x: number; y: number };
  metadata?: Record<string, unknown>;
}

export interface EditorConnection {
  from: string;
  to: string;
}

export interface EditorState {
  nodes: EditorNode[];
  connections: EditorConnection[];
  metadata?: Record<string, unknown>;
}

export class EditorEngine {
  state: EditorState;

  constructor(initial?: Partial<EditorState>) {
    this.state = {
      nodes: initial?.nodes || [],
      connections: initial?.connections || [],
      metadata: initial?.metadata || {}
    };
  }

  addNode(node: EditorNode) {
    this.state.nodes.push(node);
  }

  removeNode(id: string) {
    this.state.nodes = this.state.nodes.filter(node => node.id !== id);
    this.state.connections = this.state.connections.filter(
      connection => connection.from !== id && connection.to !== id
    );
  }

  connect(from: string, to: string) {
    this.state.connections.push({ from, to });
  }

  disconnect(from: string, to: string) {
    this.state.connections = this.state.connections.filter(
      connection => !(connection.from === from && connection.to === to)
    );
  }

  moveNode(id: string, x: number, y: number) {
    const node = this.state.nodes.find(item => item.id === id);
    if (node) {
      node.position = { x, y };
    }
  }

  serialize() {
    return JSON.stringify(this.state, null, 2);
  }

  static deserialize(json: string) {
    return new EditorEngine(JSON.parse(json));
  }
}
