import type { Card, ColorId } from "@/lib/types";

export const COLOR_LABELS: Record<ColorId, string> = {
  red: "赤",
  blue: "青",
  yellow: "黄",
  green: "緑",
  purple: "紫",
  brown: "茶",
};

export const COLOR_HEX: Record<ColorId, string> = {
  red: "#d62d20",
  blue: "#006da8",
  yellow: "#f4d000",
  green: "#15803d",
  purple: "#32145f",
  brown: "#6b3f1d",
};

export const CARDS: Card[] = [
  { id: "card-01", label: "red", textColor: "purple", backgroundColor: "blue" },
  { id: "card-02", label: "brown", textColor: "purple", backgroundColor: "green" },
  { id: "card-03", label: "blue", textColor: "purple", backgroundColor: "brown" },
  { id: "card-04", label: "yellow", textColor: "purple", backgroundColor: "red" },
  { id: "card-05", label: "green", textColor: "purple", backgroundColor: "yellow" },
  { id: "card-06", label: "red", textColor: "yellow", backgroundColor: "green" },
  { id: "card-07", label: "brown", textColor: "yellow", backgroundColor: "blue" },
  { id: "card-08", label: "blue", textColor: "yellow", backgroundColor: "purple" },
  { id: "card-09", label: "green", textColor: "yellow", backgroundColor: "brown" },
  { id: "card-10", label: "purple", textColor: "yellow", backgroundColor: "red" },
  { id: "card-11", label: "red", textColor: "brown", backgroundColor: "yellow" },
  { id: "card-12", label: "blue", textColor: "brown", backgroundColor: "red" },
  { id: "card-13", label: "yellow", textColor: "brown", backgroundColor: "blue" },
  { id: "card-14", label: "green", textColor: "brown", backgroundColor: "purple" },
  { id: "card-15", label: "purple", textColor: "brown", backgroundColor: "green" },
  { id: "card-16", label: "red", textColor: "green", backgroundColor: "brown" },
  { id: "card-17", label: "brown", textColor: "green", backgroundColor: "red" },
  { id: "card-18", label: "blue", textColor: "green", backgroundColor: "yellow" },
  { id: "card-19", label: "yellow", textColor: "green", backgroundColor: "purple" },
  { id: "card-20", label: "purple", textColor: "green", backgroundColor: "blue" },
  { id: "card-21", label: "red", textColor: "blue", backgroundColor: "purple" },
  { id: "card-22", label: "brown", textColor: "blue", backgroundColor: "yellow" },
  { id: "card-23", label: "yellow", textColor: "blue", backgroundColor: "green" },
  { id: "card-24", label: "green", textColor: "blue", backgroundColor: "red" },
  { id: "card-25", label: "purple", textColor: "blue", backgroundColor: "brown" },
  { id: "card-26", label: "brown", textColor: "red", backgroundColor: "purple" },
  { id: "card-27", label: "blue", textColor: "red", backgroundColor: "green" },
  { id: "card-28", label: "yellow", textColor: "red", backgroundColor: "brown" },
  { id: "card-29", label: "green", textColor: "red", backgroundColor: "blue" },
  { id: "card-30", label: "purple", textColor: "red", backgroundColor: "yellow" },
];
