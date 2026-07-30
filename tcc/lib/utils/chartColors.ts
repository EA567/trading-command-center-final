import { Theme } from "@/lib/theme/ThemeContext";

export interface ChartColors {
  grid: string;
  tick: string;
  tickSecondary: string;
  tooltipBg: string;
  tooltipBorder: string;
  profit: string;
  loss: string;
  line: string;
}

const DARK: ChartColors = {
  grid: "#27272a",
  tick: "#71717a",
  tickSecondary: "#a1a1aa",
  tooltipBg: "#18181b",
  tooltipBorder: "#3f3f46",
  profit: "#34d399",
  loss: "#fb7185",
  line: "#60a5fa",
};

const LIGHT: ChartColors = {
  grid: "#e4e4e7",
  tick: "#52525b",
  tickSecondary: "#3f3f46",
  tooltipBg: "#ffffff",
  tooltipBorder: "#d4d4d8",
  profit: "#059669",
  loss: "#e11d48",
  line: "#2563eb",
};

export function getChartColors(theme: Theme): ChartColors {
  return theme === "light" ? LIGHT : DARK;
}
