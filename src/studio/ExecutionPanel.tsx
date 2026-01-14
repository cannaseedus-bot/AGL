import React, { useState } from "react";
import { graphToAGL } from "../compiler/graph-to-agl.js";
import { glyphs } from "../glyphs/index.js";
import { run } from "../runtime/index.js";
import { useStudioTheme } from "./theme-context.js";

type ExecutionPanelProps = {
  state: { nodes: { glyph: string; inputs: string[]; position: { x: number; y: number } }[] };
};

export function ExecutionPanel({ state }: ExecutionPanelProps) {
  const theme = useStudioTheme();
  const [output, setOutput] = useState<unknown>(null);
  const [source, setSource] = useState("");

  const execute = () => {
    const src = graphToAGL(state);
    setSource(src);
    const result = run(src, { glyphs });
    setOutput(result);
  };

  return (
    <div>
      <button
        onClick={execute}
        style={{
          background: theme.colors.accent,
          color: theme.colors.background,
          border: "none",
          borderRadius: theme.radii.button,
          padding: "6px 12px",
          cursor: "pointer",
        }}
      >
        Run
      </button>
      <h4>AGL Source</h4>
      <pre
        style={{
          background: theme.colors.surfaceAlt,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radii.panel,
          padding: theme.spacing.panelPadding,
          color: theme.colors.text,
          fontFamily: theme.typography.codeFont,
        }}
      >
        {source}
      </pre>
      <h4>Result</h4>
      <pre
        style={{
          background: theme.colors.surfaceAlt,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radii.panel,
          padding: theme.spacing.panelPadding,
          color: theme.colors.text,
          fontFamily: theme.typography.codeFont,
        }}
      >
        {JSON.stringify(output, null, 2)}
      </pre>
    </div>
  );
}
