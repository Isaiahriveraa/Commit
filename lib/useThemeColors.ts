"use client";

import { useSyncExternalStore } from "react";

/**
 * Hook to read CSS variable values at runtime.
 * Use this for chart libraries (Recharts, Chart.js, etc.) that can't parse CSS variables directly.
 *
 * Colors are defined in globals.css - this hook reads those values at runtime.
 *
 * @example
 * const colors = useThemeColors();
 * <Bar fill={colors.primary} />
 */

type ThemeColors = {
  primary: string;
  primaryHover: string;
  primaryDark: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
};

const defaultColors: ThemeColors = {
  // Primary
  primary: "#E8814F",
  primaryHover: "#D6703E",
  primaryDark: "#C45D2A",

  // Status
  success: "#22C55E",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",

  // Text
  textPrimary: "#1A1A1A",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",

  // Backgrounds
  surface: "#FFFFFF",
  surfaceAlt: "#F5F5F3",
  border: "rgba(0, 0, 0, 0.08)",

  // Chart palette
  chart1: "#E8814F",
  chart2: "#F59E0B",
  chart3: "#22C55E",
  chart4: "#3B82F6",
  chart5: "#8B5CF6",
};

// Module-level cache to ensure referential stability for useSyncExternalStore
let cachedColors: ThemeColors = defaultColors;

function colorsEqual(a: ThemeColors, b: ThemeColors): boolean {
  return (Object.keys(a) as Array<keyof ThemeColors>).every(
    (key) => a[key] === b[key]
  );
}

function getColors(): ThemeColors {
  if (typeof window === "undefined") return defaultColors;

  const root = document.documentElement;
  const style = getComputedStyle(root);
  const getCSSVar = (name: string) => style.getPropertyValue(name).trim();

  const newColors: ThemeColors = {
    primary: getCSSVar("--color-primary") || defaultColors.primary,
    primaryHover: getCSSVar("--color-primary-hover") || defaultColors.primaryHover,
    primaryDark: getCSSVar("--color-primary-dark") || defaultColors.primaryDark,

    success: getCSSVar("--color-success") || defaultColors.success,
    error: getCSSVar("--color-error") || defaultColors.error,
    warning: getCSSVar("--color-warning") || defaultColors.warning,
    info: getCSSVar("--color-info") || defaultColors.info,

    textPrimary: getCSSVar("--color-text-primary") || defaultColors.textPrimary,
    textSecondary: getCSSVar("--color-text-secondary") || defaultColors.textSecondary,
    textMuted: getCSSVar("--color-text-muted") || defaultColors.textMuted,

    surface: getCSSVar("--color-surface") || defaultColors.surface,
    surfaceAlt: getCSSVar("--color-surface-alt") || defaultColors.surfaceAlt,
    border: getCSSVar("--color-border") || defaultColors.border,

    chart1: getCSSVar("--color-chart-1") || defaultColors.chart1,
    chart2: getCSSVar("--color-chart-2") || defaultColors.chart2,
    chart3: getCSSVar("--color-chart-3") || defaultColors.chart3,
    chart4: getCSSVar("--color-chart-4") || defaultColors.chart4,
    chart5: getCSSVar("--color-chart-5") || defaultColors.chart5,
  };

  // Return cached object if values haven't changed (referential stability)
  if (colorsEqual(newColors, cachedColors)) {
    return cachedColors;
  }

  cachedColors = newColors;
  return cachedColors;
}

// Subscribe to nothing - colors don't change dynamically (yet)
function subscribe() {
  return () => {};
}

export function useThemeColors(): ThemeColors {
  return useSyncExternalStore(subscribe, getColors, () => defaultColors);
}
