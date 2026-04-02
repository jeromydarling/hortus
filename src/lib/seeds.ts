const AFFILIATE_TAG =
  import.meta.env.VITE_SEEDS_NOW_AFFILIATE_TAG ?? "HORTUS_AFFILIATE";
const BASE = "https://www.seedsnow.com";

export function seedsNowUrl(path: string): string {
  return `${BASE}${path}?ref=${AFFILIATE_TAG}`;
}
