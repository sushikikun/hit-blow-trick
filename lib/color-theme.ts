import type { ColorId } from "@/lib/types";

export type RgbColor = {
  r: number;
  g: number;
  b: number;
};

export type ColorThemeRgb = Record<ColorId, RgbColor>;

export type ColorTheme = ColorThemeRgb;

export const COLOR_THEME_STORAGE_KEY = "hit-blow-trick-color-theme";

export const DEFAULT_COLOR_THEME: ColorThemeRgb = {
  red: { r: 227, g: 52, b: 47 },
  blue: { r: 11, g: 132, b: 216 },
  yellow: { r: 246, g: 207, b: 0 },
  green: { r: 21, g: 148, b: 71 },
  purple: { r: 109, g: 40, b: 217 },
  brown: { r: 139, g: 74, b: 32 },
};

export const COLOR_THEME_IDS = Object.keys(DEFAULT_COLOR_THEME) as ColorId[];

export function clampRgbChannel(value: unknown): number {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(255, Math.max(0, Math.round(numericValue)));
}

export function normalizeRgbColor(value: unknown, fallback: RgbColor): RgbColor {
  if (!value || typeof value !== "object") {
    return { ...fallback };
  }

  const source = value as Partial<Record<keyof RgbColor, unknown>>;

  return {
    r: clampRgbChannel(source.r ?? fallback.r),
    g: clampRgbChannel(source.g ?? fallback.g),
    b: clampRgbChannel(source.b ?? fallback.b),
  };
}

export function rgbToHex(rgb: RgbColor): string {
  const toHex = (value: number) => clampRgbChannel(value).toString(16).padStart(2, "0");

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function rgbToCss(rgb: RgbColor): string {
  return `rgb(${clampRgbChannel(rgb.r)}, ${clampRgbChannel(rgb.g)}, ${clampRgbChannel(rgb.b)})`;
}

function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

function hexToRgb(hex: string): RgbColor | null {
  if (!isHexColor(hex)) {
    return null;
  }

  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

export function normalizeColorTheme(value: unknown): ColorThemeRgb {
  if (!value || typeof value !== "object") {
    return structuredClone(DEFAULT_COLOR_THEME);
  }

  const source = value as Partial<Record<ColorId, unknown>>;

  return COLOR_THEME_IDS.reduce<ColorThemeRgb>((theme, colorId) => {
    const fallback = DEFAULT_COLOR_THEME[colorId];
    const savedValue = source[colorId];
    const legacyRgb = isHexColor(savedValue) ? hexToRgb(savedValue) : null;

    theme[colorId] = legacyRgb ?? normalizeRgbColor(savedValue, fallback);
    return theme;
  }, structuredClone(DEFAULT_COLOR_THEME));
}

export function colorThemeToCssVariables(theme: ColorThemeRgb): Record<string, string> {
  return COLOR_THEME_IDS.reduce<Record<string, string>>((variables, colorId) => {
    variables[`--trick-${colorId}`] = rgbToCss(theme[colorId]);
    return variables;
  }, {});
}

export function colorVar(colorId: ColorId) {
  return `var(--trick-${colorId}, ${rgbToCss(DEFAULT_COLOR_THEME[colorId])})`;
}

export function getReadableTextColor(color: RgbColor | string) {
  const rgb = typeof color === "string" ? hexToRgb(color) ?? { r: 0, g: 0, b: 0 } : color;
  const luminance = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

  return luminance > 145 ? "#111827" : "#ffffff";
}
