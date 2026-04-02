export const DEMO_FIXTURE = {
  user: {
    id: "demo-user",
    name: "Demo Gardener",
  },
  land: {
    id: "demo-land",
    displayName: "Sundown Edge",
    address: "4821 Oak Street, Savage, MN 55378",
    zip: "55378",
    hardinessZone: "4b",
    philosophy: "backToEden",
    languageMode: "plain" as const,
    frostDates: { lastSpring: "2026-05-03", firstFall: "2026-10-01" },
    currentPhase: {
      phaseId: "firstSigns",
      confidence: 0.88,
      detectedAt: new Date().toISOString(),
      reason:
        "Forsythia at 45% bloom. Soil temp 41\u00B0F at 4 inches. Frost risk remains through May 3.",
    },
    soilProfile: {
      texture: {
        plain: "Sandy loam \u2014 holds shape but drains well",
        gardener: "Sandy loam",
        source: "Loamy sand, USDA textural class",
        value: "Sandy loam",
      },
      drainage: {
        plain: "Water drains in about an hour after rain",
        gardener: "Well drained",
        source: "NRCS drainage class A/B",
        value: "Well drained",
      },
      pH: {
        plain: "Slightly acidic \u2014 good for most vegetables",
        gardener: "pH 6.4",
        source: "pH 6.4 (1:1 water method)",
        value: 6.4,
      },
      organicMatter: {
        plain: "Decent amount of life in the soil",
        gardener: "3.2% organic matter",
        source: "SOM 3.2%",
        value: "3.2%",
      },
      depth: {
        plain: "18 inches before you hit dense subsoil",
        gardener: "Effective rooting depth ~18 in",
        source: "Depth to restrictive layer: 46cm",
        value: 18,
      },
      slope: {
        plain: "Gentle slope toward the southeast",
        gardener: "2\u20134% SE slope",
        source: "Percent slope from DEM: 2.8%",
        value: 2.8,
      },
      waterHolding: {
        plain: "Holds water reasonably well \u2014 mulch helps",
        gardener: "AWC 0.17 in/in",
        source: "Available water capacity 0.17 in/in",
        value: "0.17 in/in",
      },
      workability: {
        plain: "Easy to dig \u2014 good structure",
        gardener: "High workability",
        source: "Derived: ksat 15 \u03BCm/s, low compaction risk",
        value: "High",
      },
      floodRisk: {
        plain: "Not in a flood zone",
        gardener: "Flood zone X \u2014 minimal risk",
        source: "FEMA designation: Zone X",
        value: "Zone X",
      },
    },
    sunExposure: {
      bestSpot: "Southwest corner \u2014 6.5 hours direct sun",
      hoursEstimate: 6.5,
    },
    phaseHistory: [
      {
        phaseId: "rest",
        date: "2025-12-01",
        confidence: 0.95,
        reason: "Ground frozen, under 10h daylight",
      },
      {
        phaseId: "preparation",
        date: "2026-02-15",
        confidence: 0.87,
        reason: "Daylight lengthening, forsythia buds swelling",
      },
      {
        phaseId: "firstSigns",
        date: "2026-03-20",
        confidence: 0.88,
        reason: "Forsythia bloom, soil temp crossing 40\u00B0F",
      },
    ],
    sourcingPreference: { organic: false, local: true, budget: "thrifty" },
  },
  plots: [
    {
      id: "demo-plot-1",
      landId: "demo-land",
      name: "Bed 1",
      type: "raised" as const,
      dimensions: { length: 8, width: 4 },
      sunHours: 6.5,
      crops: [
        {
          cropName: "Sugar Snap Peas",
          plantedDate: null,
          status: "planned",
          seedSource: "seedsNow",
          notes: "Direct sow after May 3",
        },
        {
          cropName: "Lettuce mix",
          plantedDate: null,
          status: "planned",
          seedSource: "seedsNow",
          notes: "Start indoors now",
        },
      ],
    },
    {
      id: "demo-plot-2",
      landId: "demo-land",
      name: "Bed 2",
      type: "raised" as const,
      dimensions: { length: 8, width: 4 },
      sunHours: 6.0,
      crops: [
        {
          cropName: "Tomatoes (Brandywine)",
          plantedDate: null,
          status: "planned",
          seedSource: "seedsNow",
          notes: "Start indoors Apr 10",
        },
        {
          cropName: "Basil",
          plantedDate: null,
          status: "planned",
          seedSource: "seedsNow",
          notes: "Start with tomatoes",
        },
      ],
    },
  ],
  observations: [
    {
      id: "obs-1",
      type: "note",
      content: "Saw first crocus near the east fence. Small and purple.",
      phaseAtTime: "firstSigns",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      tags: ["crocus", "east fence", "first signs"],
    },
    {
      id: "obs-2",
      type: "voice",
      content:
        "Checked the chip pile \u2014 still plenty there from last fall. Bed 1 edges look like they need a refresh though. Maybe 2 inches thin.",
      phaseAtTime: "firstSigns",
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      tags: ["chip pile", "Bed 1", "mulch"],
    },
    {
      id: "obs-3",
      type: "note",
      content:
        "Forsythia on the neighbor's fence is starting to open. Maybe 30% bloom. Getting close.",
      phaseAtTime: "firstSigns",
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      tags: ["forsythia", "phenology", "phase signal"],
    },
  ],
  weather: {
    state: "caution" as const,
    headline: "Frost risk through May 3",
    forecast:
      "Partly cloudy, high 52\u00B0F. Overnight low 34\u00B0F \u2014 frost advisory in effect.",
    aqi: 18,
  },
  activePlan: {
    id: "demo-plan-1",
    name: "Spring 2026",
    philosophy: "backToEden",
    cropPatternId: "firstGarden",
    status: "active",
    seedList: [
      {
        cropName: "Sugar Snap Peas",
        variety: "Oregon Sugar Pod",
        quantity: "1 packet",
        source: "seedsNow",
        seedsNowUrl: "/collections/pea-seeds",
        estimatedCost: 2.99,
        ordered: false,
        plantBy: "2026-05-03",
      },
      {
        cropName: "Lettuce mix",
        variety: "Mesclun",
        quantity: "1 packet",
        source: "seedsNow",
        seedsNowUrl: "/collections/lettuce-seeds",
        estimatedCost: 2.49,
        ordered: true,
        plantBy: "2026-04-15",
      },
      {
        cropName: "Tomatoes",
        variety: "Brandywine",
        quantity: "1 packet",
        source: "seedsNow",
        seedsNowUrl: "/collections/tomato-seeds",
        estimatedCost: 3.49,
        ordered: false,
        plantBy: "2026-04-10",
      },
    ],
  },
};

export const DEMO_COMMUNITY = {
  id: "demo-community",
  name: "Sundown Edge Garden Co-op",
  memberCount: 6,
  members: [
    {
      id: "dm-1",
      displayName: "Maya R.",
      role: "coordinator" as const,
      plotId: "demo-plot-1",
      volunteerHoursYTD: 14,
      engagementScore: 0.92,
    },
    {
      id: "dm-2",
      displayName: "Marcus T.",
      role: "member" as const,
      plotId: "demo-plot-2",
      volunteerHoursYTD: 3,
      engagementScore: 0.41,
    },
    {
      id: "dm-3",
      displayName: "Li W.",
      role: "mentor" as const,
      plotId: null,
      volunteerHoursYTD: 22,
      engagementScore: 0.88,
    },
    {
      id: "dm-4",
      displayName: "Priya S.",
      role: "member" as const,
      plotId: null,
      volunteerHoursYTD: 8,
      engagementScore: 0.67,
    },
    {
      id: "dm-5",
      displayName: "James K.",
      role: "member" as const,
      plotId: null,
      volunteerHoursYTD: 1,
      engagementScore: 0.18,
    },
    {
      id: "dm-6",
      displayName: "Demo Gardener",
      role: "member" as const,
      plotId: "demo-plot-1",
      volunteerHoursYTD: 0,
      engagementScore: 0.5,
    },
  ],
  nriSignals: [
    {
      personId: "dm-2",
      type: "checkin" as const,
      severity: "caution" as const,
      reason:
        "Marcus hasn't logged in 11 days and missed the last workday.",
    },
    {
      personId: "dm-3",
      type: "mentor_candidate" as const,
      severity: "info" as const,
      reason:
        "Li is in her third season with consistent records. She may be ready to mentor a newer member.",
    },
  ],
  workdays: [
    {
      id: "wd-1",
      scheduledDate: new Date(Date.now() + 2 * 86400000)
        .toISOString()
        .split("T")[0],
      startTime: "9:00 AM",
      focus: "Spring bed prep and chip refresh",
      rsvps: 4,
    },
  ],
  sharingPosts: [
    {
      id: "sp-1",
      authorId: "dm-1",
      type: "surplus" as const,
      item: "Surplus kale starts \u2014 6 plants",
      status: "available" as const,
    },
    {
      id: "sp-2",
      authorId: "dm-3",
      type: "announcement" as const,
      item: "Garlic order arriving Friday \u2014 pick up at the shed",
      status: "available" as const,
    },
  ],
};
