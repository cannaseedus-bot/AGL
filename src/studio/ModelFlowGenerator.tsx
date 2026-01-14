import React, { useState } from "react";
import { aiToGraph } from "../compiler/ai-to-graph.js";
import { EditorEngine } from "../editor/engine.js";
import { glyphMeta } from "../glyphs/register-builtins.js";
import { useStudioTheme } from "./theme-context.js";

type ModelFlowGeneratorProps = {
  engine: EditorEngine;
  onChange: (state: { nodes: EditorEngine["nodes"]; connections: EditorEngine["connections"] }) => void;
  callModel: (prompt: string) => Promise<string>;
};

export function ModelFlowGenerator({ engine, onChange, callModel }: ModelFlowGeneratorProps) {
  const theme = useStudioTheme();
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<"idle" | "running">("idle");

  const generate = async () => {
    setStatus("running");
    const text = await callModel(prompt);
    const newEngine = aiToGraph(text, glyphMeta, engine);
    onChange(newEngine.state);
    setStatus("idle");
  };

  return (
    <div>
      <h4>AI Flow Generator</h4>
      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Describe the flow you want..."
        rows={4}
        style={{
          width: "100%",
          background: theme.colors.surfaceAlt,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radii.panel,
          padding: theme.spacing.gap,
          color: theme.colors.text,
          fontFamily: theme.typography.uiFont,
        }}
      />
      <button
        onClick={generate}
        disabled={status === "running"}
        style={{
          marginTop: theme.spacing.gap,
          background: theme.colors.accentSoft,
          color: theme.colors.text,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radii.button,
          padding: "6px 12px",
          cursor: status === "running" ? "not-allowed" : "pointer",
        }}
      >
        {status === "running" ? "Generating..." : "Generate Flow"}
      </button>
    </div>
  );
}
