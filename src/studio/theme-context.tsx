import React, { createContext, useContext } from "react";
import { darkNeon } from "./themes.js";
import type { StudioTheme } from "./theme-types.js";

const StudioThemeContext = createContext<StudioTheme>(darkNeon);

export function StudioThemeProvider({
  theme,
  children,
}: {
  theme?: StudioTheme;
  children: React.ReactNode;
}) {
  return (
    <StudioThemeContext.Provider value={theme || darkNeon}>
      {children}
    </StudioThemeContext.Provider>
  );
}

export function useStudioTheme() {
  return useContext(StudioThemeContext);
}
