import type { EChartsOption } from "echarts";

const baseText = {
  color: "var(--color-text-secondary)",
};

export function getChartTheme(theme: "dark" | "light"): EChartsOption {
  if (theme === "light") {
    return {
      color: ["#ea580c", "#3b82f6", "#f59e0b", "#10b981", "#14b8a6"],
      textStyle: baseText,
    };
  }

  return {
    color: ["#ff6b00", "#3b82f6", "#ffb800", "#0ae448", "#14b8a6"],
    textStyle: baseText,
  };
}
