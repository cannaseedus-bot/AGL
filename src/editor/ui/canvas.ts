import { NodeGraphRenderer } from "../renderer.js";

export class CanvasEditorUI {
  constructor(private canvas: HTMLCanvasElement, private renderer: NodeGraphRenderer) {}

  draw(state: unknown) {
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const { nodes, connections } = this.renderer.render(state);

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw connections
    ctx.strokeStyle = "#999";
    connections.forEach((c) => {
      ctx.beginPath();
      ctx.moveTo(c.from.x, c.from.y);
      ctx.lineTo(c.to.x, c.to.y);
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach((n) => {
      ctx.fillStyle = n.color;
      ctx.fillRect(n.x - 40, n.y - 20, 80, 40);

      ctx.fillStyle = "#fff";
      ctx.font = "12px sans-serif";
      ctx.fillText(n.label, n.x - 30, n.y + 4);
    });
  }
}
