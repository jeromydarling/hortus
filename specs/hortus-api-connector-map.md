# Hortus API Connector Map
**Version 1.0 · Complete endpoint registry, field mappings, and Hortus data model bindings**

---

## Overview

Every external data source Hortus touches is documented here. For each connector:
- **When it's called** — trigger (onboarding, real-time, scheduled)
- **Endpoint** — exact URL pattern
- **Key fields** — what Hortus extracts and what schema field it maps to
- **Caching strategy** — how long the result is valid before a fresh call
- **Fallback** — what happens if the call fails

Data flows into three categories:
- **Static at onboarding** — called once when user enters their address; result stored in `Land` record
- **Scheduled refresh** — background job updates on a set cadence
- **Real-time on demand** — called live when a screen loads or an action is triggered

---

## 1. NWS Weather API
**Purpose:** Current forecast, frost risk, hazard alerts, operational state computation

| Property | Value |
|---|---|
| Base URL | `https://api.weather.gov` |
| Auth | None (public) |
| Format | JSON-LD / GeoJSON |
| Rate limit | None documented — be a good citizen, cache aggressively |
| Docs | https://www.weather.gov/documentation/services-web-api |

### Step 1 — Resolve grid point from lat/lon (onboarding, once)
```
GET https://api.weather.gov/points/{lat},{lon}
```
**Extract and store on `Land`:**
| API field | Hortus field | Notes |
|---|---|---|
| `properties.gridId` | `land.nws.gridId` | e.g. `MPX` |
| `properties.gridX` | `land.nws.gridX` | |
| `properties.gridY` | `land.nws.gridY` | |
| `properties.forecast` | `land.nws.forecastUrl` | Full forecast endpoint |
| `properties.forecastHourly` | `land.nws.hourlyUrl` | Hourly endpoint |
| `properties.county` | `land.nws.countyZone` | For alerts filtering |
| `properties.forecastZone` | `land.nws.forecastZone` | For alerts filtering |

**Cache:** Permanent — grid point doesn't change.

### Step 2 — Fetch forecast (scheduled, every 2 hours)
```
GET {land.nws.forecastUrl}
```
**Extract:**
| API field | Hortus use | Notes |
|---|---|---|
| `properties.periods[0].temperature` | Hazard engine | Current/tonight temp |
| `properties.periods[0].shortForecast` | Home screen | Display string |
| `properties.periods[].probabilityOfPrecipitation` | Hazard engine | Rain delay logic |
| `properties.periods[].windSpeed` | Hazard engine | Wind caution |
| `properties.periods[].icon` | Weather screen | Forecast icon URL |

**Cache:** 2 hours.

### Step 3 — Fetch hourly forecast (scheduled, every hour)
```
GET {land.nws.hourlyUrl}
```
**Extract:**
| API field | Hortus use |
|---|---|
| `properties.periods[0..23].temperature` | Frost window computation |
| `properties.periods[0..23].probabilityOfPrecipitation` | Hour-by-hour rain risk |
| `properties.periods[0..23].windSpeed` | Wind threshold check |

**Cache:** 1 hour. Used for frost countdown chip on home screen.

### Step 4 — Fetch active alerts (real-time, every 30 min + on home screen load)
```
GET https://api.weather.gov/alerts/active?zone={land.nws.forecastZone}
```
**Extract:**
| API field | Hortus field | Hazard mapping |
|---|---|---|
| `features[].properties.event` | `weather.alertType` | See hazard rules table below |
| `features[].properties.severity` | `weather.alertSeverity` | |
| `features[].properties.headline` | `weather.alertHeadline` | Display in hazard banner |
| `features[].properties.description` | `weather.alertDetail` | |
| `features[].properties.expires` | `weather.alertExpires` | For "recheck at" time |

**Cache:** 30 minutes. Override on push from Supabase Edge Function if alert arrives.

---

### Hazard State Computation
Computed in a Supabase Edge Function from NWS alert type + forecast thresholds + plot traits.

| Hazard | Trigger | State | Task suppression |
|---|---|---|---|
| Frost advisory / freeze warning | Alert OR hourly temp < 34°F | `protect` | Suppress transplanting; surface "cover plants before dusk" |
| Severe thunderstorm / lightning | Alert event contains "Thunderstorm" | `suspend` | Suppress all outdoor tasks; postpone workdays |
| Heat advisory / extreme heat | Alert OR daytime high > 95°F | `caution` or `suspend` | Shift labor to early AM; suppress heavy work |
| Wind advisory | Alert OR sustained wind > 25 mph | `caution` | Suppress spraying, cover work, delicate planting |
| Heavy rain / flood watch | Alert OR precip > 0.75" forecast | `delay` | Suppress digging, tilling, bed shaping |
| Flood warning | Alert event contains "Flood" | `protect` or `suspend` | Site access warning; flag low beds |
| AQI unhealthy (from AirNow) | AQI > 100 | `caution` | Limit outdoor duration; flag for vulnerable users |

**Plot modifiers:** Poorly drained plots (`land.soilProfile.drainage.value` = C or D) escalate `delay` → `protect` for rain events. Exposed sites escalate wind caution threshold to 20 mph.

**Output structure per hazard event:**
```json
{
  "state": "protect",
  "headline": "Frost risk tonight",
  "action": "Cover tender transplants before dusk.",
  "recheckAt": "2026-04-02T06:00:00Z",
  "suppressedTasks": ["transplanting", "direct_sow_warm"],
  "promotedTasks": ["cover_row_cover", "bring_in_containers"]
}
```

---

## 2. NRCS Soil Data Access (SSURGO)
**Purpose:** Soil texture, drainage class, depth, pH, organic matter, workability — the Loam Map

| Property | Value |
|---|---|
| Base URL | `https://sdmdataaccess.sc.egov.usda.gov/Tabular/SDMTabularService.asmx` |
| Alt REST | `https://SDMDataAccess.nrcs.usda.gov/Tabular/post.rest` |
| Auth | None (public) |
| Format | JSON (POST with SQL query body) |
| Docs | https://sdmdataaccess.nrcs.usda.gov |

**When called:** Onboarding — once per address. Result stored permanently on `Land.soilProfile`.

### Query pattern
POST to the REST endpoint with a T-SQL body. Hortus uses two queries:

**Query 1 — Map unit by lat/lon:**
```sql
SELECT mu.mukey, mu.muname, mu.musym
FROM mapunit mu
INNER JOIN SDA_Get_Mapunit_from_Lonlat_Geographic({lon}, {lat}) m ON mu.mukey = m.mukey
```

**Query 2 — Component data by mukey:**
```sql
SELECT
  c.compname, c.comppct_r, c.drainagecl,
  ch.hzdept_r, ch.hzdepb_r, ch.texture,
  ch.om_r, ch.ph1to1h2o_r, ch.awc_r,
  ch.ksat_r
FROM mapunit mu
INNER JOIN component c ON c.mukey = mu.mukey
INNER JOIN chorizon ch ON ch.cokey = c.cokey
WHERE mu.mukey = '{mukey}'
  AND c.majcompflag = 'Yes'
ORDER BY c.comppct_r DESC, ch.hzdept_r ASC
```

### Field mappings → `Land.soilProfile`
| SSURGO field | Hortus schema field | Trilingual label key |
|---|---|---|
| `drainagecl` | `soilProfile.drainage.value` | `drainage` |
| `texture` (surface horizon) | `soilProfile.texture.value` | `texture` |
| `om_r` | `soilProfile.organicMatter.value` | `organicMatter` |
| `ph1to1h2o_r` | `soilProfile.pH.value` | `pH` |
| `awc_r` | `soilProfile.waterHolding.value` | `waterHolding` |
| `hzdepb_r` (deepest horizon) | `soilProfile.depth.value` | `depth` |
| `ksat_r` | Derived → `soilProfile.workability.value` | `workability` |

**Trilingual plain labels** are generated by NRI from the raw values using the `groundReading` NRI prompt template. Store both raw value and all three language levels on the record.

**Cache:** Permanent. Soil surveys update infrequently (years). Invalidate manually if user reports data mismatch.

**Fallback:** If SDA is unavailable, store `soilProfile.dataSource = "pending"` and flag for background retry. NRI tells user: "I don't have your soil data yet. I'll read it when it becomes available — here's what your zip code typically sees."

---

## 3. USDA Plant Hardiness Zone
**Purpose:** Hardiness zone for frost tolerance, perennial suitability, phase timing baseline

| Property | Value |
|---|---|
| Primary method | Point-in-polygon lookup against USDA PHZM GIS dataset |
| Dataset | https://catalog.data.gov/dataset/usda-plant-hardiness-zone-map-phzm-fdfe1 |
| Backup API | `https://phzmapi.org/{zip}.json` (unofficial but stable) |
| Auth | None |
| Format | JSON |

**When called:** Onboarding — once per address/zip.

### Backup API response (phzmapi.org):
```json
{ "zone": "4b", "temperature_range": "-25°F to -20°F", "coordinates": {...} }
```

### Field mapping → `Land`
| API field | Hortus field |
|---|---|
| `zone` | `land.hardinessZone` |
| `temperature_range` | Stored in `land.soilProfile` metadata |

**Cache:** Permanent. Zone reclassifications happen on decade timescales.

**Fallback:** Use zip code lookup table (pre-loaded in Supabase) as final fallback.

---

## 4. USA National Phenology Network (USA-NPN)
**Purpose:** Real seasonal progression — what's actually blooming, emerging, and active right now

| Property | Value |
|---|---|
| Base URL | `https://services.usanpn.org/npn_portal` |
| Auth | None (public) |
| Format | JSON |
| Docs | https://www.usanpn.org/data/code |

### Endpoint 1 — Current observations near user location (scheduled, daily)
```
GET https://services.usanpn.org/npn_portal/observations/getObservations.json
  ?start_date={30_days_ago}
  &end_date={today}
  &latitude={lat}
  &longitude={lon}
  &radius=50
  &species_id=3,6,15,35,82   (forsythia, dandelion, lilac, crabapple, earthworm)
  &phenophase_id=501,390,482  (open flowers, breaking leaf buds, active)
```

**Extract:**
| API field | Hortus use |
|---|---|
| `species_desc` | Display in phenology log |
| `phenophase_description` | Display in phenology log |
| `observation_date` | Phase transition cue for NRI |
| `mean_numdays_since_prior_no` | Confidence signal for NRI |

**Key phenological trigger signals for phase detection:**
| Species/event | Phenophase | Phase transition cue |
|---|---|---|
| Forsythia | Open flowers (50%+) | Rest → Preparation → First Signs |
| Dandelion | Open flowers | First Signs → Planting |
| Lilac | Breaking leaf buds | First Signs confirmed |
| Iris | Open flowers | Planting → Establishment |
| Goldenrod | Open flowers | Abundance → Preservation |
| Migratory birds | Active | Preservation → Return |

**Cache:** 24 hours. Phase detection runs once daily unless user logs a new phenology observation.

### Endpoint 2 — Extended Spring Index (phase prediction)
```
GET https://services.usanpn.org/npn_portal/phenology/getSIFirstLeafIndividual.json
  ?latitude={lat}&longitude={lon}
```
Returns predicted first leaf date for the current year. Used for frost window estimation refinement.

**Cache:** 7 days during Preparation/First Signs phases, 30 days otherwise.

---

## 5. AirNow API
**Purpose:** AQI and smoke burden for outdoor labor safety

| Property | Value |
|---|---|
| Base URL | `https://www.airnowapi.org/aq` |
| Auth | API key (free, register at airnow.gov) |
| Format | JSON |
| Docs | https://docs.airnowapi.org |

### Endpoint — Current observations by zip (scheduled, every 2 hours)
```
GET https://www.airnowapi.org/aq/observation/zipCode/current/
  ?zipCode={zip}
  &distance=25
  &API_KEY={key}
  &format=application/json
```

**Extract:**
| API field | Hortus field | Hazard mapping |
|---|---|---|
| `AQI` | `weather.aqi` | > 100 → caution; > 150 → suspend outdoor |
| `Category.Name` | `weather.aqiLabel` | Display label |
| `ParameterName` | Filter for `PM2.5` and `Ozone` | |
| `DateObserved` | `weather.aqiUpdatedAt` | |

**Cache:** 2 hours. AQI changes slowly enough that 2-hour polls are sufficient.

**Fallback:** If AirNow unavailable, omit AQI from hazard computation. Do not assume safe.

---

## 6. Parcel / Land-Use GIS
**Purpose:** Property boundary for the Loam Map and garden layout planner

This is the most variable connector — parcel data is served by state or county GIS. Hortus uses a **cascading resolver**: try MetroGIS → try state open data → try Census TIGER → fall back to user-drawn boundary.

### Option A — MetroGIS (Twin Cities metro, primary for MN launch)
```
GET https://arcgis.metc.state.mn.us/arcgis/rest/services/BaseLayer/Parcels/MapServer/0/query
  ?geometryType=esriGeometryPoint
  &geometry={lon},{lat}
  &inSR=4326
  &outFields=PIN,OWNER_NAME,LAND_USE,SHAPE_Area
  &returnGeometry=true
  &f=json
```

### Option B — Minnesota State Open Data
```
GET https://gisdata.mn.gov/dataset/plan-parcels-open
```
Download as GeoJSON, load into Supabase, query with PostGIS point-in-polygon.

### Option C — Census TIGERweb (national fallback, block-level only)
```
GET https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/2/query
  ?geometry={lon},{lat}
  &geometryType=esriGeometryPoint
  &inSR=4326
  &outFields=*
  &returnGeometry=true
  &f=json
```

**Field mapping → `Land`:**
| GIS field | Hortus field |
|---|---|
| Parcel geometry (polygon) | `land.parcelGeometry` (GeoJSON) |
| Lot area | Used to estimate max garden footprint |
| Land use code | Surfaces zoning notes if relevant |

**Cache:** 30 days. Parcel boundaries change rarely.

**Fallback chain:** MetroGIS → State open data → TIGERweb block → User draws boundary manually on map.

---

## 7. USGS National Map (Terrain)
**Purpose:** Slope, elevation, and topographic context for the Loam Map

| Property | Value |
|---|---|
| Base URL | `https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer` |
| Auth | None (public) |
| Format | JSON |
| Docs | https://www.usgs.gov/faqs/there-api-accessing-national-map-data |

### Endpoint — Elevation at point
```
GET https://epqs.nationalmap.gov/v1/json
  ?x={lon}
  &y={lat}
  &units=Feet
  &includeDate=false
```

**Extract:**
| API field | Hortus field |
|---|---|
| `value` | `land.soilProfile.slope` (derived with neighbor points) |

**Slope computation:** Request elevation at 5 points (center + N/S/E/W offsets of ~100m). Compute percent slope from the gradient. Store max slope direction.

**Cache:** Permanent. Terrain doesn't change.

---

## 8. Plant.id (Recognition)
**Purpose:** Plant identification and disease recognition from user photos

| Property | Value |
|---|---|
| Base URL | `https://api.plant.id/v3` |
| Auth | API key (paid, per-call) |
| Format | JSON |
| Docs | https://plant.id/docs |
| Cost model | Call only on explicit user action ("What is this?") — never automatic |

### Endpoint — Identify plant from photo
```
POST https://api.plant.id/v3/identification
Content-Type: application/json

{
  "images": ["{base64_or_url}"],
  "latitude": {lat},
  "longitude": {lon},
  "similar_images": true,
  "health": "auto"
}
```

**Extract → `Observation`:**
| API field | Hortus field |
|---|---|
| `result.classification.suggestions[0].name` | `observation.tags[]` → plant name |
| `result.classification.suggestions[0].probability` | Confidence — display to user |
| `result.disease.suggestions[0].name` | Disease flag if present |
| `result.disease.suggestions[0].probability` | Disease confidence |
| `result.is_plant.binary` | Validate it's actually a plant |

**NRI always surfaces confidence level.** Never diagnose with certainty. Format: "This looks like [name] (confidence: [X]%). Here's how to confirm and what to do."

**Cache:** None — recognition is per-image, per-call. Store result on the `Observation` record.

**Cost guard:** Only call when user explicitly taps "What is this?" Never auto-process photos.

---

## 9. Seeds Now (Affiliate)
**Purpose:** Seed purchasing links with affiliate commission tracking

| Property | Value |
|---|---|
| Base URL | `https://www.seedsnow.com` |
| Affiliate network | Refersion |
| Tag | `HORTUS_AFFILIATE` (replace with live tag before launch) |
| Commission | 25% |
| Cookie | 365 days |
| Payout | Weekly (Friday) via PayPal |

**No API call needed.** All seed links are static URLs constructed at render time:
```
https://www.seedsnow.com{path}?ref={SEEDS_NOW_AFFILIATE_TAG}
```

Track clicks and conversions via `AffiliateEvent` schema records. Log each click server-side before redirecting.

**URL patterns:**
| Context | URL |
|---|---|
| Specific crop from crop pattern | `https://www.seedsnow.com/collections/{crop}-seeds?ref={tag}` |
| Full catalog browse | `https://www.seedsnow.com/collections/all?ref={tag}` |
| Vegetables | `https://www.seedsnow.com/collections/vegetable-seeds?ref={tag}` |
| Herbs | `https://www.seedsnow.com/collections/herb-seeds?ref={tag}` |
| Flowers | `https://www.seedsnow.com/collections/flower-seeds?ref={tag}` |

---

## 10. Perplexity Connector (Dynamic Search)
**Purpose:** Live local sourcing search, current research, nearby materials

| Property | Value |
|---|---|
| Integration | Lovable Perplexity connector (native) |
| When called | Explicit user action: "Find chips near me", "Find local compost", seed sourcing with local option |
| Cost model | Per-search — call only on explicit user intent, never automatically |

### Call pattern — Local sourcing search
```
System: {nriPrompts.seedSourcing.system from seed-pack-v2.json}
User: {nriPrompts.seedSourcing.userTemplate with variables filled}
```

### Call pattern — Ground reading enrichment
```
System: {nriPrompts.groundReading.system}
User: {nriPrompts.groundReading.userTemplate with SSURGO data injected}
```

### Call pattern — Phase detection
```
System: {nriPrompts.phaseDetection.system}
User: {nriPrompts.phaseDetection.userTemplate with weather + observations}
```

**All Perplexity calls pass through NRI.** NRI decides when to call, interprets the result, and never surfaces raw search output directly to the user.

---

## 11. Anthropic API (NRI / Claude)
**Purpose:** All NRI intelligence — ground readings, Rule of Life generation, voice log processing, phase detection, community signals

| Property | Value |
|---|---|
| Endpoint | `https://api.anthropic.com/v1/messages` |
| Model | `claude-sonnet-4-6` |
| System prompt | Verbatim content from `nri-system-prompt.md` |
| Max tokens | 1000 (standard responses); 2000 (Rule of Life, onboarding ground reading) |
| Auth | Anthropic API key (server-side only — never expose to client) |

### Standard call structure
```json
{
  "model": "claude-sonnet-4-6",
  "max_tokens": 1000,
  "system": "{verbatim NRI system prompt}",
  "messages": [
    {
      "role": "user",
      "content": "{structured context object as JSON string}\n\nUser message: {user_input}"
    }
  ]
}
```

### Context object injected per call
```json
{
  "user": { "name": "string" },
  "land": {
    "displayName": "string",
    "hardinessZone": "string",
    "soilProfile": { "...full trilingual profile..." },
    "currentPhase": { "phaseId": "string", "confidence": 0.0, "reason": "string" },
    "frostDates": { "lastSpring": "ISO date", "firstFall": "ISO date" },
    "philosophy": "string",
    "languageMode": "plain|gardener|source"
  },
  "weather": {
    "state": "clear|caution|delay|protect|suspend",
    "headline": "string",
    "forecast": "string",
    "aqi": 0
  },
  "recentObservations": [ "...last 5 observation summaries..." ],
  "activePlan": { "...crop plan summary..." },
  "phaseHistory": [ "...prior phase transitions..." ],
  "nriSignals": [ "...active community signals if applicable..." ]
}
```

**Never call NRI without context.** A context-free NRI call produces generic output. Context is what makes it feel like it knows this place.

**Cost guard:** NRI calls fire on user message send, Rule of Life generation (once weekly per user), onboarding ground reading (once), voice log processing (on save). Never on passive screen views.

---

## Connector Summary

| Connector | Trigger | Frequency | Cost | Caching |
|---|---|---|---|---|
| NWS Grid Point | Onboarding | Once | Free | Permanent |
| NWS Forecast | Background | Every 2h | Free | 2h |
| NWS Hourly | Background | Every 1h | Free | 1h |
| NWS Alerts | Background + screen load | Every 30min | Free | 30min |
| SSURGO / SDA | Onboarding | Once | Free | Permanent |
| USDA Hardiness | Onboarding | Once | Free | Permanent |
| USA-NPN Observations | Background | Daily | Free | 24h |
| USA-NPN Spring Index | Background | Weekly | Free | 7d |
| AirNow | Background | Every 2h | Free | 2h |
| Parcel GIS | Onboarding | Once | Free | 30d |
| USGS Elevation | Onboarding | Once | Free | Permanent |
| Plant.id | On user tap | Per action | Paid | On record |
| Seeds Now | On render | Static URLs | Affiliate | N/A |
| Perplexity | On user intent | Per search | Paid | None |
| Anthropic / NRI | On user message | Per message | Paid | None |
