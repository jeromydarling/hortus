/**
 * Ancient Library Data Layer
 *
 * Typed accessors for the Ancient Growing Library JSON.
 * All data is local — no API calls needed.
 */

import libraryData from "./hortus-ancient-growing-library.json";

// ---------------------------------------------------------------------------
// Types (inferred from JSON schema)
// ---------------------------------------------------------------------------

export interface AncientSource {
  id: string;
  title: string;
  author: string;
  date: string;
  tradition: string;
  archive_url?: string;
  web_url?: string;
  description: string;
}

export interface AncientPlant {
  id: string;
  common_name: string;
  latin_name: string;
  category: string;
  traditions: string[];
  sources: string[];
  ancient_uses: string[];
  growing_notes: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  sun: string;
  water: string;
  soil: string;
}

export interface AncientTechnique {
  id: string;
  name: string;
  tradition: string;
  source: string;
  difficulty: string;
  summary: string;
  instructions: string[];
  modern_notes: string;
}

export interface AncientTradition {
  id: string;
  name: string;
  period: string;
  icon: string;
  summary: string;
  key_principles: string[];
}

export interface AncientMonthEntry {
  month: number;
  name: string;
  theme: string;
  tasks: string[];
}

export interface SeasonalCalendar {
  description: string;
  months: AncientMonthEntry[];
}

export interface AncientQuote {
  text: string;
  author: string;
  source: string;
}

export interface AncientLibraryMeta {
  name: string;
  version: string;
  motto: string;
  description: string;
  sources: AncientSource[];
  collection_stats: {
    total_plants: number;
    categories: Record<string, number>;
    positioning: string;
  };
}

// ---------------------------------------------------------------------------
// Data accessors
// ---------------------------------------------------------------------------

const data = libraryData as {
  meta: AncientLibraryMeta;
  traditions: AncientTradition[];
  techniques: AncientTechnique[];
  plants: AncientPlant[];
  seasonal_calendar: SeasonalCalendar;
  quotes: AncientQuote[];
};

export function getAncientPlants(): AncientPlant[] {
  return data.plants;
}

export function getAncientPlantById(id: string): AncientPlant | undefined {
  return data.plants.find((p) => p.id === id);
}

export function getAncientTechniques(): AncientTechnique[] {
  return data.techniques;
}

export function getAncientTechniqueById(
  id: string,
): AncientTechnique | undefined {
  return data.techniques.find((t) => t.id === id);
}

export function getAncientTraditions(): AncientTradition[] {
  return data.traditions;
}

export function getAncientTraditionById(
  id: string,
): AncientTradition | undefined {
  return data.traditions.find((t) => t.id === id);
}

export function getSeasonalCalendar(): SeasonalCalendar {
  return data.seasonal_calendar;
}

export function getQuotes(): AncientQuote[] {
  return data.quotes;
}

export function getMeta(): AncientLibraryMeta {
  return data.meta;
}

export function getSourceById(id: string): AncientSource | undefined {
  return data.meta.sources.find((s) => s.id === id);
}

// ---------------------------------------------------------------------------
// Derived helpers
// ---------------------------------------------------------------------------

export function getPlantsByDifficulty(
  diff: "beginner" | "intermediate" | "advanced",
): AncientPlant[] {
  return data.plants.filter((p) => p.difficulty === diff);
}

export function getPlantsByCategory(cat: string): AncientPlant[] {
  return data.plants.filter(
    (p) => p.category.toLowerCase() === cat.toLowerCase(),
  );
}

export function getPlantsByTradition(tradId: string): AncientPlant[] {
  return data.plants.filter((p) => p.traditions.includes(tradId));
}

export function getTechniquesByTradition(tradId: string): AncientTechnique[] {
  return data.techniques.filter((t) => t.tradition === tradId);
}

export function getCurrentMonth(): AncientMonthEntry | undefined {
  const monthNum = new Date().getMonth() + 1; // 1-indexed
  return data.seasonal_calendar.months.find((m) => m.month === monthNum);
}

export function getRandomQuote(): AncientQuote {
  const quotes = data.quotes;
  return quotes[Math.floor(Math.random() * quotes.length)] ?? quotes[0]!;
}

export function searchPlants(query: string): AncientPlant[] {
  const q = query.toLowerCase();
  return data.plants.filter(
    (p) =>
      p.common_name.toLowerCase().includes(q) ||
      p.latin_name.toLowerCase().includes(q) ||
      p.ancient_uses.some((u) => u.toLowerCase().includes(q)),
  );
}
