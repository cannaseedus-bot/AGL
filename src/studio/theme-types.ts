export type StudioTheme = {
  name: string;
  mode: "dark" | "light";
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    border: string;
    text: string;
    textMuted: string;
    accent: string;
    accentSoft: string;
    danger: string;
    nodeDefault: string;
    nodeSelected: string;
    nodeBorder: string;
    connection: string;
    grid: string;
  };
  typography: {
    uiFont: string;
    codeFont: string;
    baseSize: string;
  };
  radii: {
    node: number;
    panel: number;
    button: number;
  };
  spacing: {
    panelPadding: number;
    nodePadding: number;
    gap: number;
  };
  glyph: {
    mathColor: string;
    logicColor: string;
    flowColor: string;
    ioColor: string;
  };
};
