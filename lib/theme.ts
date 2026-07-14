import { db } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";

export const defaultTheme = {
  navy: "#0A1B33",
  gold: "#C79A44",
};

export type Theme = typeof defaultTheme;

export async function getTheme(): Promise<Theme> {
  const rows = db.select().from(siteContent).all();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    navy: map.theme_navy || defaultTheme.navy,
    gold: map.theme_gold || defaultTheme.gold,
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function mix(hex: string, target: [number, number, number], amount: number): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  const [tr, tg, tb] = target;
  return [
    Math.round(r + (tr - r) * amount),
    Math.round(g + (tg - g) * amount),
    Math.round(b + (tb - b) * amount),
  ];
}

function lighten(hex: string, amount: number) {
  return mix(hex, [255, 255, 255], amount);
}
function darken(hex: string, amount: number) {
  return mix(hex, [0, 0, 0], amount);
}
function triplet([r, g, b]: [number, number, number]) {
  return `${r} ${g} ${b}`;
}

export function buildThemeCssVars(theme: Theme) {
  return {
    "--c-navy-950": triplet(darken(theme.navy, 0.3)),
    "--c-navy-900": triplet(hexToRgb(theme.navy)),
    "--c-navy-800": triplet(lighten(theme.navy, 0.12)),
    "--c-navy-700": triplet(lighten(theme.navy, 0.25)),
    "--c-navy-600": triplet(lighten(theme.navy, 0.38)),
    "--c-gold-400": triplet(lighten(theme.gold, 0.18)),
    "--c-gold-500": triplet(hexToRgb(theme.gold)),
    "--c-gold-600": triplet(darken(theme.gold, 0.15)),
  };
}
