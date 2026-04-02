import { describe, it, expect } from "vitest";
import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function flattenValues(
  obj: Record<string, unknown>,
  prefix = "",
): { key: string; value: unknown }[] {
  const entries: { key: string; value: unknown }[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      entries.push(
        ...flattenValues(value as Record<string, unknown>, fullKey),
      );
    } else {
      entries.push({ key: fullKey, value });
    }
  }
  return entries;
}

describe("i18n parity", () => {
  const enKeys = flattenKeys(en as Record<string, unknown>);
  const esKeys = flattenKeys(es as Record<string, unknown>);

  it("every English key exists in Spanish", () => {
    const missing = enKeys.filter((k) => !esKeys.includes(k));
    expect(missing).toEqual([]);
  });

  it("every Spanish key exists in English", () => {
    const extra = esKeys.filter((k) => !enKeys.includes(k));
    expect(extra).toEqual([]);
  });

  it("no empty string values in English", () => {
    const empty = flattenValues(en as Record<string, unknown>).filter(
      (e) => e.value === "",
    );
    expect(empty.map((e) => e.key)).toEqual([]);
  });

  it("no empty string values in Spanish", () => {
    const empty = flattenValues(es as Record<string, unknown>).filter(
      (e) => e.value === "",
    );
    expect(empty.map((e) => e.key)).toEqual([]);
  });
});
