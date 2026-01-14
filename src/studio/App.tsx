import React, { useMemo, useState } from "react";
import { EditorEngine } from "../editor/engine.js";
import { NodeGraphRenderer } from "../editor/renderer.js";
import { ReactEditorUI } from "../editor/ui/react.js";
import { glyphMeta } from "../glyphs/register-builtins.js";
import { DragLayer } from "./DragLayer.js";
import { ExecutionPanel } from "./ExecutionPanel.js";
import { GlyphPalette } from "./GlyphPalette.js";
import { ModelFlowGenerator } from "./ModelFlowGenerator.js";

const buildGlyphColors = () =>
  Object.fromEntries(
    glyphMeta.all().map((meta) => [meta.name, meta.ui?.color ?? "#555"])
  );

export function App() {
  const [engine] = useState(() => new EditorEngine());
  const [state, setState] = useState(engine.state);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const glyphColors = useMemo(() => buildGlyphColors(), []);

  const renderer = useMemo(() => new NodeGraphRenderer(), []);

  const refresh = () => setState(engine.state);

  const addGlyphNode = (
    metaEntry: { name: string },
    pos: { x: number; y: number }
  ) => {
    engine.addNode({
      id: `n${engine.state.nodes.length}`,
      glyph: metaEntry.name,
      inputs: [],
      position: pos,
      color: glyphColors[metaEntry.name],
    });
    refresh();
  };

  const callModel = async (prompt: string) => prompt;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr 260px",
        height: "100vh",
      }}
    >
      <div style={{ borderRight: "1px solid #333", padding: 12 }}>
        <h3>Glyphs</h3>
        <GlyphPalette meta={glyphMeta} onAdd={addGlyphNode} />
      </div>

      <div style={{ position: "relative", background: "#111" }}>
        <ReactEditorUI
          state={state}
          renderer={renderer}
          onNodeMouseDown={(id) => (event) => {
            event.stopPropagation();
            setDraggingId(id);
          }}
        />
        <DragLayer
          engine={engine}
          draggingId={draggingId}
          onChange={refresh}
          onStop={() => setDraggingId(null)}
        />
      </div>

      <div style={{ borderLeft: "1px solid #333", padding: 12 }}>
        <h3>Execution</h3>
        <ExecutionPanel state={state} />
        <ModelFlowGenerator
          engine={engine}
          onChange={setState}
          callModel={callModel}
        />
      </div>
    </div>
  );
}
