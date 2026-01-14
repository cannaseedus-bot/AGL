import React, { useState } from "react";
import { graphToAGL } from "../compiler/graph-to-agl.js";
import { glyphs } from "../glyphs/index.js";
import { run } from "../runtime/index.js";

type ExecutionPanelProps = {
  state: { nodes: { glyph: string; inputs: string[]; position: { x: number; y: number } }[] };
};

export function ExecutionPanel({ state }: ExecutionPanelProps) {
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
      <button onClick={execute}>Run</button>
      <h4>AGL Source</h4>
      <pre>{source}</pre>
      <h4>Result</h4>
      <pre>{JSON.stringify(output, null, 2)}</pre>
    </div>
  );
}
