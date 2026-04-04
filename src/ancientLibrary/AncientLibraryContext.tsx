/**
 * AncientLibraryContext — Loads JSON once, memoizes all helpers.
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  getAncientPlants,
  getAncientPlantById,
  getAncientTechniques,
  getAncientTechniqueById,
  getAncientTraditions,
  getAncientTraditionById,
  getSeasonalCalendar,
  getQuotes,
  getMeta,
  getSourceById,
  getPlantsByDifficulty,
  getPlantsByCategory,
  getPlantsByTradition,
  getTechniquesByTradition,
  getCurrentMonth,
  getRandomQuote,
  searchPlants,
  type AncientPlant,
  type AncientTechnique,
  type AncientTradition,
  type AncientMonthEntry,
  type AncientQuote,
  type AncientSource,
  type SeasonalCalendar,
  type AncientLibraryMeta,
} from "./data";

interface AncientLibraryContextType {
  plants: AncientPlant[];
  techniques: AncientTechnique[];
  traditions: AncientTradition[];
  calendar: SeasonalCalendar;
  quotes: AncientQuote[];
  meta: AncientLibraryMeta;
  currentMonth: AncientMonthEntry | undefined;
  getPlantById: (id: string) => AncientPlant | undefined;
  getTechniqueById: (id: string) => AncientTechnique | undefined;
  getTraditionById: (id: string) => AncientTradition | undefined;
  getSourceById: (id: string) => AncientSource | undefined;
  plantsByDifficulty: (d: "beginner" | "intermediate" | "advanced") => AncientPlant[];
  plantsByCategory: (c: string) => AncientPlant[];
  plantsByTradition: (t: string) => AncientPlant[];
  techniquesByTradition: (t: string) => AncientTechnique[];
  randomQuote: AncientQuote;
  search: (q: string) => AncientPlant[];
}

const Ctx = createContext<AncientLibraryContextType | null>(null);

export function AncientLibraryProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AncientLibraryContextType>(
    () => ({
      plants: getAncientPlants(),
      techniques: getAncientTechniques(),
      traditions: getAncientTraditions(),
      calendar: getSeasonalCalendar(),
      quotes: getQuotes(),
      meta: getMeta(),
      currentMonth: getCurrentMonth(),
      getPlantById: getAncientPlantById,
      getTechniqueById: getAncientTechniqueById,
      getTraditionById: getAncientTraditionById,
      getSourceById,
      plantsByDifficulty: getPlantsByDifficulty,
      plantsByCategory: getPlantsByCategory,
      plantsByTradition: getPlantsByTradition,
      techniquesByTradition: getTechniquesByTradition,
      randomQuote: getRandomQuote(),
      search: searchPlants,
    }),
    [],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAncientLibrary(): AncientLibraryContextType {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error(
      "useAncientLibrary must be used within AncientLibraryProvider",
    );
  return ctx;
}
