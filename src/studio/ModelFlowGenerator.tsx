import React, { useState } from "react";
import { aiToGraph } from "../compiler/ai-to-graph.js";
import { EditorEngine } from "../editor/engine.js";
import { glyphMeta } from "../glyphs/register-builtins.js";

type ModelFlowGeneratorProps = {
  engine: EditorEngine;
  onChange: (state: { nodes: EditorEngine["nodes"]; connections: EditorEngine["connections"] }) => void;
  callModel: (prompt: string) => Promise<string>;
};

export function ModelFlowGenerator({ engine, onChange, callModel }: ModelFlowGeneratorProps) {
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
        style={{ width: "100%" }}
      />
      <button onClick={generate} disabled={status === "running"}>
        {status === "running" ? "Generating..." : "Generate Flow"}
      </button>
    </div>
  );
}
