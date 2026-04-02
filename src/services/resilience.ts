import { supabase } from "@/integrations/supabase/client";

export interface ResilienceMetrics {
  lbsProduced: number;
  sqftCultivated: number;
  varietiesGrown: number;
  daysOfFood: number;
  groceryValueSaved: number;
  seedVarietiesSaved: number;
  compostProducedGallons: number;
  localSpendPct: number;
  cropsShared: number;
}

export function computeResilienceScore(metrics: ResilienceMetrics): number {
  // Weighted score across 9 dimensions, each worth up to ~11 points
  const weights = {
    lbsProduced: { max: 200, weight: 15 }, // 200+ lbs = full marks
    sqftCultivated: { max: 200, weight: 10 }, // 200+ sqft
    varietiesGrown: { max: 15, weight: 12 }, // 15+ varieties
    daysOfFood: { max: 30, weight: 20 }, // 30 days of food = full marks
    groceryValueSaved: { max: 500, weight: 10 }, // $500+ saved
    seedVarietiesSaved: { max: 5, weight: 10 }, // 5+ varieties saved
    compostProducedGallons: { max: 50, weight: 8 }, // 50+ gallons
    localSpendPct: { max: 80, weight: 8 }, // 80%+ local sourcing
    cropsShared: { max: 10, weight: 7 }, // 10+ sharing events
  };

  let score = 0;
  for (const [key, config] of Object.entries(weights)) {
    const value = metrics[key as keyof ResilienceMetrics] ?? 0;
    const normalized = Math.min(value / config.max, 1);
    score += normalized * config.weight;
  }

  return Math.round(score);
}

// Average grocery price per pound for common garden crops
const GROCERY_PRICES: Record<string, number> = {
  tomato: 3.5,
  lettuce: 4.0,
  kale: 5.0,
  zucchini: 2.5,
  cucumber: 2.0,
  pepper: 4.0,
  basil: 20.0, // per lb herbs are expensive
  peas: 5.0,
  beans: 3.0,
  carrot: 2.0,
  radish: 3.5,
  spinach: 6.0,
  squash: 2.0,
  garlic: 8.0,
};

export function estimateGroceryValue(
  cropName: string,
  lbs: number,
): number {
  const key = cropName.toLowerCase().split(" ")[0] ?? "";
  const pricePerLb = GROCERY_PRICES[key] ?? 3.0; // default $3/lb
  return lbs * pricePerLb;
}

// Estimate days of food for a household of 2-4
// Average person eats ~1.5 lbs of vegetables per day
export function estimateDaysOfFood(
  totalLbs: number,
  householdSize = 2,
): number {
  const lbsPerPersonPerDay = 1.5;
  return Math.floor(totalLbs / (lbsPerPersonPerDay * householdSize));
}

export const resilienceService = {
  async getLatest(userId: string) {
    const { data, error } = await supabase
      .from("food_resilience_snapshots")
      .select("*")
      .eq("user_id", userId)
      .order("computed_at", { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async getByZip(zip: string) {
    const { data, error } = await supabase
      .from("food_resilience_snapshots")
      .select("*")
      .eq("zip", zip)
      .eq("scope", "zip")
      .order("computed_at", { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async save(snapshot: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("food_resilience_snapshots")
      .insert(snapshot)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
