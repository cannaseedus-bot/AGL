import { NodeGraphRenderer } from "../renderer.js";

export class SVGEditorUI {
  constructor(private svg: SVGSVGElement, private renderer: NodeGraphRenderer) {}

  draw(state: unknown) {
    const { nodes, connections } = this.renderer.render(state);
    this.svg.innerHTML = "";

    connections.forEach((c) => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(c.from.x));
      line.setAttribute("y1", String(c.from.y));
      line.setAttribute("x2", String(c.to.x));
      line.setAttribute("y2", String(c.to.y));
      line.setAttribute("stroke", "#999");
      this.svg.appendChild(line);
    });

    nodes.forEach((n) => {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", String(n.x - 40));
      rect.setAttribute("y", String(n.y - 20));
      rect.setAttribute("width", "80");
      rect.setAttribute("height", "40");
      rect.setAttribute("fill", n.color);
      this.svg.appendChild(rect);

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", String(n.x - 30));
      text.setAttribute("y", String(n.y + 4));
      text.setAttribute("fill", "#fff");
      text.textContent = n.label;
      this.svg.appendChild(text);
    });
  }
}
