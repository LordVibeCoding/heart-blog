import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | number | Date, locale = "zh-CN"): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function readingTime(text: string): number {
  const words = text.trim().replace(/<[^>]+>/g, "").split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

export function truncate(text: string, max = 160): string {
  const clean = text.replace(/<[^>]+>/g, "").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}
