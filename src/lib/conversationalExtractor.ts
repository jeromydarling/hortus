/**
 * Conversational Extractor — client-side NLP-lite parser.
 *
 * Extracts structured observation data from freeform text without
 * an API call.  Uses keyword matching and regex patterns so it
 * runs instantly on-device even when offline.
 */

export interface ExtractedObservation {
  crops: string[];
  beds: string[];
  conditions: string[];
  actions: string[];
  phenologyEvents: string[];
  weatherNotes: string[];
  sentiment: "positive" | "neutral" | "concerned";
}

// ---------------------------------------------------------------------------
// Vocabularies
// ---------------------------------------------------------------------------

const CROP_NAMES = [
  "tomato", "tomatoes", "potato", "potatoes", "carrot", "carrots",
  "lettuce", "kale", "spinach", "chard", "arugula", "basil",
  "cilantro", "parsley", "dill", "mint", "thyme", "rosemary",
  "sage", "oregano", "chive", "chives", "garlic", "onion", "onions",
  "leek", "leeks", "pepper", "peppers", "zucchini", "squash",
  "cucumber", "cucumbers", "pumpkin", "pumpkins", "melon", "melons",
  "watermelon", "corn", "bean", "beans", "pea", "peas",
  "radish", "radishes", "beet", "beets", "turnip", "turnips",
  "cabbage", "broccoli", "cauliflower", "celery", "eggplant",
  "strawberry", "strawberries", "raspberry", "raspberries",
  "blueberry", "blueberries", "blackberry", "blackberries",
  "apple", "pear", "plum", "cherry", "fig", "grape", "grapes",
  "rhubarb", "asparagus", "artichoke", "fennel", "okra",
  "sweet potato", "sweet potatoes", "sunflower", "sunflowers",
  "marigold", "marigolds", "nasturtium", "nasturtiums",
  "lavender", "comfrey", "borage", "chamomile",
];

const BED_PATTERNS = [
  /\bbed\s*(?:#?\s*)?(\d+[a-z]?)\b/gi,
  /\b(north|south|east|west|front|back|side|raised|main|new)\s+bed\b/gi,
  /\bplot\s*(?:#?\s*)?(\d+[a-z]?)\b/gi,
  /\brow\s*(?:#?\s*)?(\d+[a-z]?)\b/gi,
  /\b(greenhouse|polytunnel|cold frame|hoop house)\b/gi,
];

const CONDITION_WORDS = [
  "wet", "dry", "muddy", "frozen", "waterlogged", "parched",
  "compacted", "crumbly", "rich", "sandy", "clay", "loamy",
  "warm", "cool", "cold", "damp", "moist", "soggy",
  "wilting", "yellowing", "browning", "leggy", "stunted",
  "lush", "vigorous", "established", "bolting", "flowering",
  "fruiting", "dormant", "stressed", "healthy", "diseased",
  "infested", "pest damage", "slug damage", "aphids",
  "powdery mildew", "blight", "rust", "rot", "mold",
];

const ACTION_WORDS = [
  "watered", "planted", "harvested", "mulched", "weeded",
  "composted", "fertilized", "pruned", "sowed", "seeded",
  "transplanted", "thinned", "staked", "tied", "trellised",
  "covered", "uncovered", "turned", "amended", "limed",
  "sprayed", "fed", "deadheaded", "divided", "propagated",
  "potted", "repotted", "hardened off", "pinched",
  "direct sowed", "direct seeded", "top dressed",
];

const PHENOLOGY_PATTERNS = [
  /\bfirst\s+(\w+)\b/gi,
  /\b(forsythia|lilac|magnolia|cherry|apple|crab\s*apple)\s+(bloom|blossom|flowering|leafing)/gi,
  /\b(crocus|daffodil|tulip|snowdrop|bluebell)\s*(up|out|blooming|flowering|appearing)/gi,
  /\b(bud\s*break|leaf\s*out|leaf\s*drop|dormancy|first\s*frost|last\s*frost)\b/gi,
  /\b(migrat|swallow|cuckoo|swift).*\b(arrived|seen|heard|spotted)\b/gi,
  /\bfirst\s+(egg|frog\s*spawn|tadpole|butterfly|bee)\b/gi,
];

const WEATHER_WORDS = [
  "rain", "rained", "raining", "rainy", "shower", "showers",
  "drizzle", "downpour", "storm", "thunder", "lightning",
  "frost", "frosty", "freeze", "frozen", "ice", "icy",
  "snow", "snowed", "snowing", "sleet", "hail",
  "hot", "warm", "heat", "heatwave", "scorching",
  "cold", "chilly", "cool", "mild", "overcast", "cloudy",
  "sunny", "clear", "windy", "wind", "gale", "breezy",
  "fog", "foggy", "misty", "humid", "drought", "dry spell",
];

const POSITIVE_WORDS = [
  "great", "good", "beautiful", "amazing", "lovely", "thriving",
  "wonderful", "excellent", "lush", "vigorous", "healthy",
  "impressive", "happy", "pleased", "excited", "delighted",
  "productive", "abundant", "fantastic", "perfect", "gorgeous",
];

const CONCERNED_WORDS = [
  "worried", "concerned", "problem", "issue", "trouble",
  "damage", "damaged", "dying", "dead", "poor", "bad",
  "failing", "struggling", "wilting", "disease", "diseased",
  "pest", "infested", "blight", "rot", "mold", "mildew",
  "disappointing", "frustrated", "unfortunately", "sadly",
];

// ---------------------------------------------------------------------------
// Extraction logic
// ---------------------------------------------------------------------------

function matchWords(text: string, vocabulary: string[]): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];

  for (const word of vocabulary) {
    // Use word-boundary check to avoid partial matches
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b${escaped}\\b`, "i");
    if (re.test(lower)) {
      found.push(word);
    }
  }

  return [...new Set(found)];
}

function matchPatterns(text: string, patterns: RegExp[]): string[] {
  const found: string[] = [];

  for (const pattern of patterns) {
    // Reset lastIndex for global regexes
    pattern.lastIndex = 0;
    let match = pattern.exec(text);
    while (match) {
      found.push(match[0].trim());
      match = pattern.exec(text);
    }
  }

  return [...new Set(found)];
}

function detectSentiment(text: string): ExtractedObservation["sentiment"] {
  const positiveCount = matchWords(text, POSITIVE_WORDS).length;
  const concernedCount = matchWords(text, CONCERNED_WORDS).length;

  if (concernedCount > positiveCount) return "concerned";
  if (positiveCount > concernedCount) return "positive";
  return "neutral";
}

/**
 * Extract structured observation data from freeform text.
 *
 * Runs entirely client-side with keyword matching — no network required.
 */
export function extractObservationData(text: string): ExtractedObservation {
  return {
    crops: matchWords(text, CROP_NAMES),
    beds: matchPatterns(text, BED_PATTERNS),
    conditions: matchWords(text, CONDITION_WORDS),
    actions: matchWords(text, ACTION_WORDS),
    phenologyEvents: matchPatterns(text, PHENOLOGY_PATTERNS),
    weatherNotes: matchWords(text, WEATHER_WORDS),
    sentiment: detectSentiment(text),
  };
}
