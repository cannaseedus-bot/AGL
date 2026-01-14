import React from "react";
import { EditorEngine } from "../editor/engine.js";

type DragLayerProps = {
  engine: EditorEngine;
  draggingId: string | null;
  onChange: () => void;
  onStop: () => void;
};

export function DragLayer({ engine, draggingId, onChange, onStop }: DragLayerProps) {
  const onMouseMove = (event: React.MouseEvent) => {
    if (!draggingId) return;
    const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    engine.moveNode(draggingId, x, y);
    onChange();
  };

  const onMouseUp = () => onStop();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: draggingId ? "auto" : "none",
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    />
  );
}
