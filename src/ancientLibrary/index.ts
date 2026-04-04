export {
  AncientLibraryProvider,
  useAncientLibrary,
} from "./AncientLibraryContext";

export {
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
} from "./data";

export type {
  AncientPlant,
  AncientTechnique,
  AncientTradition,
  AncientMonthEntry,
  AncientQuote,
  AncientSource,
  SeasonalCalendar,
  AncientLibraryMeta,
} from "./data";
