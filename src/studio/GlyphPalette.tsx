import React from "react";
import { GlyphMetadataRegistry } from "../glyphs/metadata-registry.js";

type GlyphPaletteProps = {
  meta: GlyphMetadataRegistry;
  onAdd: (metaEntry: { name: string }, pos: { x: number; y: number }) => void;
};

export function GlyphPalette({ meta, onAdd }: GlyphPaletteProps) {
  const categories = Array.from(new Set(meta.all().map((entry) => entry.category)));

  return (
    <div>
      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 12 }}>
          <h4>{cat}</h4>
          {meta.byCategory(cat).map((entry) => (
            <div
              key={entry.name}
              style={{
                padding: "4px 8px",
                marginBottom: 4,
                borderRadius: 4,
                background: "#222",
                cursor: "grab",
              }}
              onClick={() => onAdd(entry, { x: 140, y: Math.random() * 400 + 40 })}
            >
              {entry.name}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
