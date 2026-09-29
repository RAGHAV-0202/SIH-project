# 📡 CityFlow AI — Data Provenance & Mock Data Registry

This document serves as the **official registry and audit log** of all data sources used across **CityFlow AI**, distinguishing between **Real-Time Live APIs**, **Authentic Static Transit Datasets**, and **Simulated / Mock Data Layers** (with rationale for hackathon demonstration).

---

## 📊 Summary Matrix

| Domain | Component / Agent | Data Source Type | Provider / Endpoint | Real vs Mock Status |
|---|---|---|---|---|
| **Weather** | `weatherAgent.js` | Live REST API | OpenWeatherMap API (`api.openweathermap.org/data/2.5/weather`) | ✅ **100% Real Live Data** |
| **Reasoning / NLP** | `intentAgent.js` | Live LLM Inference | Groq LPU (`api.groq.com`, Llama 3 / GPT-OSS / Qwen models) | ✅ **100% Real Live AI** |
| **Geocoding** | `routeAgent.js` & `RouteMap.jsx` | Live Reverse Geocoding | OpenStreetMap Nominatim (`nominatim.openstreetmap.org/search`) | ✅ **100% Real Live Geocoding** |
| **Transit Network** | `delhi-transit.json` | Authentic Static Dataset | Delhi Metro Rail Corporation (DMRC) & DTC Network Specs | ✅ **Real Official Dataset** |
| **Emissions** | `routeAgent.js` & `CarbonTracker.jsx` | Standard Emission Coefficients | Central Pollution Control Board (CPCB) & IEA Transit Metrics | ✅ **Real Scientific Constants** |
| **Speech Recognition** | `VoiceInputButton.jsx` | W3C Native API | Browser Web Speech API (`SpeechRecognition`) | ✅ **Real Native Device API** |
| **Traffic Congestion** | `trafficAgent.js` & `corridors.json` | Hybrid Dynamic Model | Real Delhi arterial corridors + Time-of-day peak congestion model | ⚠️ **Simulated Traffic Telematics** |
| **Cab / Ride-Hailing** | `routeAgent.js` (`cab_providers`) | Dynamic Fare Model | Calibrated to Delhi Uber Go / Ola Mini / Rapido tariff cards | ⚠️ **Simulated Fleet Dispatch** |
| **Live Bus GPS** | `TransitTimeline.jsx` | Simulated Telematics | Modeled after Delhi Open Transit Data bus frequency | ⚠️ **Simulated GPS Feed** |
| **Disruption Scenarios** | `DisruptionLab.jsx` | Incident Testbed | Authentic Delhi choke point scenarios (Moolchand, Rajiv Chowk) | ⚠️ **Simulated Chaos Vector** |

---

## 🔍 Detailed Component Audits

### 1. Weather Agent (`server/agents/weatherAgent.js`)
- **Status:** **REAL DATA** (Primary) with Graceful Fallback
- **Live Endpoint:** `https://api.openweathermap.org/data/2.5/weather?q=Delhi,IN&appid={OPENWEATHER_API_KEY}&units=metric`
- **Fields Ingested:** Temperature (°C), Humidity (%), Wind Speed (m/s), Precipitation / Weather Conditions (Clear, Rain, Extreme Heat).
- **Agentic Impact:** If rainfall is detected, the agent biases routing away from walking and two-wheelers toward sheltered metro networks. If temperature exceeds 40°C, AC modes are prioritized.
- **Fallback Trigger:** If the OpenWeather API experiences network timeout or rate limits, it falls back to a time-aware seasonal baseline for Delhi.

---

### 2. Natural Language Intent Agent (`server/agents/intentAgent.js`)
- **Status:** **REAL DATA (Live AI)**
- **Engine:** Groq LPU Inference Cloud via `groq-sdk`.
- **Active Models:** `openai/gpt-oss-20b`, `openai/gpt-oss-120b`, `qwen/qwen3.8-27b`.
- **Capabilities:** Parses natural Hindi, Hinglish, and English user prompts into strict Zod schemas (`origin`, `destination`, `arrival_by`, `budget_inr`, `preferences`).
- **Fallback Trigger:** Built-in regex rule engine for offline or low-connectivity edge parsing.

---

### 3. Geocoding & Mapping (`client/src/components/RouteMap.jsx` & `server/agents/routeAgent.js`)
- **Status:** **REAL DATA**
- **Endpoint:** OpenStreetMap Nominatim API (`https://nominatim.openstreetmap.org/search?format=json&q=...`)
- **Map Tiles:** CartoDB Dark Matter / OpenStreetMap global vector tile server.
- **Cache Mechanism:** In-memory `Map` + browser `localStorage` caching to guarantee sub-millisecond redraws without spamming Nominatim rate limits.
- **Coordinates Dictionary:** 45+ verified ground-truth Delhi NCR transport hubs and landmarks mapped directly from DMRC benchmarks.

---

### 4. Delhi Transit Infrastructure (`server/data/delhi-transit.json`)
- **Status:** **REAL TRANSIT SPECIFICATIONS**
- **Coverage:**
  - **DMRC Metro:** Blue, Yellow, Red, Violet, Pink, Magenta, Airport Express lines with verified geographic coordinates, station names, and interchange hubs (Rajiv Chowk, Kashmere Gate, Central Secretariat, Hauz Khas, Mandi House).
  - **DTC Buses:** Official Delhi Transport Corporation bus routes (501, 544, 423, 724, 604, 817, 419) with stop sequences, frequency, and AC express tariffs.
  - **DMRC Fare Slabs:** Exact distance-based tariff slabs (₹10 / ₹20 / ₹30 / ₹40 / ₹50 / ₹60).

---

### 5. Carbon Footprint Baseline (`server/agents/routeAgent.js` & `CarbonTracker.jsx`)
- **Status:** **REAL SCIENTIFIC DATA**
- **Emission Standards:**
  - Metro: `0.008 kg CO₂ / passenger-km` (Central Electricity Authority grid emission factor for electrified rail)
  - Bus: `0.025 kg CO₂ / passenger-km` (CNG & electric bus average)
  - Auto-Rickshaw: `0.065 kg CO₂ / km` (CNG three-wheeler)
  - Two-Wheeler: `0.040 kg CO₂ / km`
  - Cab: `0.120 kg CO₂ / km` (Four-wheeler petrol/CNG cab)
- **Impact Calculation:** Direct comparison against private car baseline to compute kilograms of carbon saved and equivalent trees planted.

---

## ⚠️ Where and Why Mock / Simulated Data is Used

### 1. Uber / Ola Live Driver Dispatch API
- **Where Used:** `routeAgent.js` (Route 2: Direct Cab option) & `CommuteConcierge.jsx` (First-Mile/Last-Mile cab booking toggle).
- **What is Simulated:** Live driver vehicle assignment (`DL 1Y B 4821`), real-time driver ETA (4 mins away), and dynamic surge pricing multiplier.
- **Why Mocked:** Ride-hailing dispatch APIs (Uber Driver API, Ola Partner Fleet API) require commercial B2B partner agreements, commercial enterprise tokens, and live credit card billing. The tariff formulas (base fare ₹50 + ₹14/km + peak hour 1.3x surge) strictly reflect official Delhi ride-hailing rates.
- **Production Integration Path:** Replace `cabSegments` generator in `routeAgent.js` with Uber Rides API `POST /v1/requests` webhook.

---

### 2. Live Bus GPS Telematics (DIMTS / Open Transit Data)
- **Where Used:** `TransitTimeline.jsx` & `RouteResults.jsx` (Bus arrival countdowns e.g., "Bus arriving in 6 min").
- **What is Simulated:** Real-time live GPS coordinates of moving DTC buses along route 501/544.
- **Why Mocked:** Delhi Open Transit Data (OTD) provides GTFS-RT protobuf feeds, but requires static OTP authorization and enterprise IP whitelisting that cannot be shared in open GitHub repositories.
- **Production Integration Path:** Ingest Delhi Government OTD GTFS-RT feed using `gtfs-realtime-bindings` npm package.

---

### 3. Traffic Sensor Camera Feeds & Heatmap Telematics
- **Where Used:** `trafficAgent.js`, `corridors.json`, and `Dashboard.jsx` (Corridor Congestion Heatmap).
- **What is Simulated:** Minute-by-minute congestion indices (0.0 to 1.0) and speed reductions along 10 Delhi corridors (Ring Road, NH-8, Vikas Marg, etc.).
- **Why Mocked:** Delhi Traffic Police Intelligent Traffic Management System (ITMS) camera feeds are restricted to government traffic control rooms and have no public streaming endpoints. We model peak vs off-peak hours using empirical Delhi traffic patterns (peak 8–10 AM & 5–8 PM: 1.5x travel time multiplier).
- **Production Integration Path:** Connect TomTom Traffic Flow API or Google Distance Matrix API with live traffic parameters.

---

### 4. Disruption Simulation Lab Vectors
- **Where Used:** `DisruptionLab.jsx` and `/api/route/replan`.
- **What is Simulated:** Synthetic catastrophic urban disruptions:
  - Vector 01: Blue Line Signal Failure at Rajiv Chowk
  - Vector 02: Flash Waterlogging at Moolchand Underpass (Ring Road)
  - Vector 03: Farmer Protest / VIP Cavalcade Choke on NH-8
  - Vector 04: Anand Vihar EV Hub Grid Failure
- **Why Mocked:** Used for hackathon live judging demonstration so judges can click to simulate a crisis and inspect how CityFlow AI autonomously replans in <400ms without crashing live municipal infrastructure.

---

### 5. Simulated Urban Impact Telemetry & AI Fare Negotiation (SIH PS 26205)
- **Where Used:** `Dashboard.jsx` (Impact telemetry cards: -24.8% road load, +41.2% transit shift, 19.5% freight shift) and `FareNegotiationModal.jsx`.
- **What is Simulated:**
  - Macro-level road load diversion percentage and public transit shift percentage calibrated to Delhi Master Plan 2041 transit targets.
  - Driver counter-offer logic for last-mile feeder tariff bargaining with local traffic justification.
- **Why Mocked:** Real-time citywide vehicular count and individual driver bargaining APIs require citywide sensor infrastructure. The simulation enables evaluators to test municipal benefits and commuter bargaining interactions live.

---

## 🛠️ Verification Checklist for Judges

1. **Weather:** Open the app and check the live temperature in the banner — compare it with Google Weather for Delhi; it matches in real-time.
2. **AI Intent & Logistics:** Speak or type any query in Hinglish or switch to Logistics Delivery Mode; Groq LLM parses it live or falls back gracefully without errors.
3. **Map:** Click on any route; the Leaflet map loads real tiles and renders accurate station-to-station polylines plotted from OpenStreetMap.
4. **Fare Negotiation & HITL Authorization:** Try negotiating a last-mile cab fare or authorizing an emergency pass; human confirmation is enforced with full cost breakdown.
5. **Emergency Helplines:** Open the Offline Commute Pass; all phone numbers (112, 1095, 155370) are the official government emergency numbers for the National Capital Territory of Delhi.
