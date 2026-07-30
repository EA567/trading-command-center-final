"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light";

const THEME_STORAGE_KEY = "tcc:theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  if (theme === "light") root.classList.add("light");
  else root.classList.remove("light");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // "dark" is the deterministic default for both the server render and the
  // client's pre-hydration render — it matches the :root default in
  // globals.css, so there's no mismatch. The blocking inline script in
  // app/layout.tsx already applied the *real* stored preference to the DOM
  // before paint (avoiding a flash); this effect just syncs React's state
  // to match what's already on the page, and owns all future updates.
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const isLight = document.documentElement.classList.contains("light");
    setThemeState(isLight ? "light" : "dark");
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyThemeClass(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // storage unavailable — theme still applies for this session
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      applyThemeClass(next);
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // storage unavailable — theme still applies for this session
      }
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

/**
 * Source for the blocking inline script injected in app/layout.tsx.
 * Runs before React hydrates so the correct theme class is on <html>
 * before first paint — no flash of the wrong theme. Exported as a string
 * (rather than imported) so it can be inlined verbatim into a <script> tag.
 */
export const THEME_INIT_SCRIPT = `
(function() {
  try {
    var stored = window.localStorage.getItem('${THEME_STORAGE_KEY}');
    if (stored === 'light') {
      document.documentElement.classList.add('light');
    }
  } catch (e) {}
})();
`;
