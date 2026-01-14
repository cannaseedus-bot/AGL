import React from "react";
import { NodeGraphRenderer } from "../renderer.js";

type ReactEditorUIProps = {
  state: unknown;
  renderer: NodeGraphRenderer;
};

export function ReactEditorUI({ state, renderer }: ReactEditorUIProps) {
  const { nodes, connections } = renderer.render(state);

  return (
    <svg width="100%" height="100%">
      {connections.map((c, i) => (
        <line
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          x1={c.from.x}
          y1={c.from.y}
          x2={c.to.x}
          y2={c.to.y}
          stroke="#999"
        />
      ))}

      {nodes.map((n) => (
        <g key={n.id}>
          <rect
            x={n.x - 40}
            y={n.y - 20}
            width={80}
            height={40}
            fill={n.color}
            rx={6}
          />
          <text x={n.x - 30} y={n.y + 4} fill="#fff">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
