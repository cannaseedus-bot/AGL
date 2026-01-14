import type { StudioTheme } from "./theme-types.js";

export const darkNeon: StudioTheme = {
  name: "Dark Neon",
  mode: "dark",
  colors: {
    background: "#0D0D0D",
    surface: "#141414",
    surfaceAlt: "#1E1E1E",
    border: "#333333",
    text: "#EDEDED",
    textMuted: "#9E9E9E",
    accent: "#00E5FF",
    accentSoft: "#003F4A",
    danger: "#FF5252",
    nodeDefault: "#1A1A1A",
    nodeSelected: "#222B3F",
    nodeBorder: "#333333",
    connection: "#00E5FF",
    grid: "#1A1A1A",
  },
  typography: {
    uiFont: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    codeFont: "JetBrains Mono, SFMono-Regular, Menlo, Monaco, monospace",
    baseSize: "14px",
  },
  radii: {
    node: 8,
    panel: 10,
    button: 6,
  },
  spacing: {
    panelPadding: 12,
    nodePadding: 8,
    gap: 8,
  },
  glyph: {
    mathColor: "#4CAF50",
    logicColor: "#2196F3",
    flowColor: "#FFB300",
    ioColor: "#B388FF",
  },
};

export const lightGrid: StudioTheme = {
  name: "Light Grid",
  mode: "light",
  colors: {
    background: "#F5F5F5",
    surface: "#FFFFFF",
    surfaceAlt: "#F0F0F0",
    border: "#DDDDDD",
    text: "#222222",
    textMuted: "#777777",
    accent: "#2962FF",
    accentSoft: "#E3ECFF",
    danger: "#D32F2F",
    nodeDefault: "#FFFFFF",
    nodeSelected: "#E3ECFF",
    nodeBorder: "#CCCCCC",
    connection: "#2962FF",
    grid: "#E0E0E0",
  },
  typography: {
    uiFont: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    codeFont: "JetBrains Mono, SFMono-Regular, Menlo, Monaco, monospace",
    baseSize: "14px",
  },
  radii: {
    node: 8,
    panel: 10,
    button: 6,
  },
  spacing: {
    panelPadding: 12,
    nodePadding: 8,
    gap: 8,
  },
  glyph: {
    mathColor: "#2E7D32",
    logicColor: "#1565C0",
    flowColor: "#EF6C00",
    ioColor: "#6A1B9A",
  },
};
