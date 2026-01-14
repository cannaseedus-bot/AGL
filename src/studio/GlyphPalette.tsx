import React from "react";
import { GlyphMetadataRegistry } from "../glyphs/metadata-registry.js";
import { useStudioTheme } from "./theme-context.js";
import type { StudioTheme } from "./theme-types.js";

type GlyphPaletteProps = {
  meta: GlyphMetadataRegistry;
  onAdd: (metaEntry: { name: string }, pos: { x: number; y: number }) => void;
};

export function GlyphPalette({ meta, onAdd }: GlyphPaletteProps) {
  const theme = useStudioTheme();
  const categories = Array.from(new Set(meta.all().map((entry) => entry.category)));
  const colorForCategory = (currentTheme: StudioTheme, category?: string) => {
    switch (category) {
      case "math":
        return currentTheme.glyph.mathColor;
      case "logic":
        return currentTheme.glyph.logicColor;
      case "flow":
        return currentTheme.glyph.flowColor;
      case "io":
        return currentTheme.glyph.ioColor;
      default:
        return currentTheme.colors.accent;
    }
  };

  return (
    <div>
      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: theme.spacing.gap }}>
          <h4 style={{ color: theme.colors.textMuted }}>{cat}</h4>
          {meta.byCategory(cat).map((entry) => (
            <div
              key={entry.name}
              style={{
                padding: "4px 8px",
                marginBottom: 4,
                borderRadius: theme.radii.button,
                background: theme.colors.surfaceAlt,
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.text,
                cursor: "grab",
              }}
              onClick={() => onAdd(entry, { x: 140, y: Math.random() * 400 + 40 })}
            >
              <span style={{ color: colorForCategory(theme, entry.category), marginRight: 6 }}>
                ●
              </span>
              {entry.name}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
