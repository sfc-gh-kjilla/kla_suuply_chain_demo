# KLA Scanner Intelligence — 5-Minute Demo Talk Track

> **Setup:** Open http://localhost:5174/ in Chrome. Use Cmd+Shift+5 to start screen recording with microphone enabled.

---

## [0:00–0:40] OPENING — The Problem & The Dashboard

**[Screen: Full dashboard, "All Customers" selected, SCN-KR-001 auto-loaded]**

> "What you're looking at is a Global Supply Chain Tower for KLA's scanner fleet. This connects directly to SAP S/4 HANA — you can see the live indicator in the header — and gives our field service and supply chain teams a single pane of glass across all customers.
>
> Today we're managing a fleet of 12 fabs across 5 major customers — TSMC, Samsung, Intel, SK Hynix, and Renesas. Right away in the header you can see we have 2 critical scanners and 4 warnings that need attention."

---

## [0:40–1:20] CUSTOMER FLEET OVERVIEW — Navigate by Customer

**[Point to the left panel — Customer Fleet Overview]**

> "The first thing a fleet manager does is pick their customer. Let me filter down to TSMC — they're about 50% of our revenue."

**[ACTION: Click the "All Customers" dropdown → select "TSMC"]**

> "Now I'm looking at TSMC's 30 scanners across 4 fabs — Tainan, Taichung, Hsinchu, and Arizona. I can immediately see Fab 18 in Tainan has the most scanners and some warnings. The color coding — red for critical, orange for warning, green for healthy — tells me where to focus."

**[ACTION: Click dropdown → switch back to "All Customers"]**

> "Let me switch back to all customers so we can see the full picture."

---

## [1:20–2:10] SENSOR HEALTH — Multi-Sensor Diagnostics

**[Point to the Sensor Health panel on the right — already showing SCN-KR-001]**

> "This is where it gets powerful. Scanner SCN-KR-001 in Korea is flagged critical, and instead of just seeing one number, we see ALL the sensor metrics sorted worst-to-best.
>
> At the top — 193nm Laser Power at 82.3 milliwatts. That's well below our 90 milliwatt critical threshold. But look — it's not just the laser. Stage Vibration is in warning territory at 3.14 nanometers, Chamber Pressure is low at 0.81 Pascals, and Beam Current is borderline.
>
> This strip plot visualization shows the healthy range in green, and the dot shows exactly where the current reading sits. When multiple sensors degrade together like this, that's a pattern — and that's where our AI agent comes in."

---

## [2:10–3:10] AI DIAGNOSTIC AGENT — Pattern Recognition

**[Point to the AI chat panel on the far right]**

> "Let me ask our KLA Diagnostic Agent about this. I'll click directly on the 193nm Laser Power metric..."

**[ACTION: Click on the "193nm Laser Power" row in the Sensor Health panel]**

> "That automatically triggers an AI analysis. The agent looks at this scanner's telemetry history, compares it against the full fleet, and identifies root causes.
>
> But let me show you something even more powerful..."

**[ACTION: Click the suggested prompt: "Show me other scanners where this same pattern has been observed"]**

> "I just asked: 'show me other scanners where this same pattern has been observed.' This is the wow moment — the agent can correlate degradation patterns across the entire fleet and identify if this is an isolated issue or a systemic batch problem."

**[ACTION: Click "Have we deferred any preventive maintenance that could explain this?"]**

> "And now I'm checking if any deferred maintenance could be the root cause. This connects maintenance history to current sensor readings — something that typically requires a field engineer to manually cross-reference."

---

## [3:10–3:50] TELEMETRY & MAINTENANCE — The Evidence

**[Point to the bottom-left panel area]**

> "Below the fleet overview, we have the telemetry trend for this scanner — you can see the laser power degrading over the past two weeks."

**[ACTION: Click the "Maintenance" tab]**

> "Switching to Maintenance history, I can see the full repair log — previous part replacements, calibrations, and importantly, any deferred preventive maintenance that might explain what we're seeing."

---

## [3:50–4:30] SUPPLY CHAIN ACTION — Ship Part & Transfers

**[ACTION: Click the "Ship Part" tab]**

> "Here's where diagnostics meets supply chain execution. Once we've identified the issue, I need to get a replacement part to the customer. This view shows me shipping options from different warehouses — cost, transit time, and tax implications side by side.
>
> I can compare shipping from our US warehouse versus our APAC warehouse, see the landed cost breakdown, and choose the best option."

**[ACTION: Click the "Transfer" tab]**

> "And if the part isn't in the nearest warehouse, I can initiate a warehouse-to-warehouse transfer to pre-position inventory closer to customers who might need it next."

**[ACTION: Click the "Inventory" tab]**

> "The inventory view gives me real-time stock levels across all our warehouses, so I know exactly what's available before I commit to a repair plan."

---

## [4:30–5:00] CLOSING — The Value

**[Screen: Back to full dashboard view]**

> "So to recap — in one unified view, we went from a fleet-level overview, to customer-specific diagnostics, to multi-sensor pattern analysis, to AI-powered root cause identification, to supply chain execution. 
>
> What used to take a field engineer hours of cross-referencing spreadsheets and SAP transactions now happens in seconds. This is KLA Scanner Intelligence — connecting diagnostics to action, powered by Snowflake and SAP S/4 HANA."

---

## Demo Tips

- **Keep mouse movements deliberate and slow** — viewers need to follow your cursor
- **Pause 2 seconds** after each click before speaking — let the UI update
- **If the AI chat responds**, read a key insight from it aloud
- **Energy level:** Conversational and confident, not salesy
- **If something doesn't load:** "Let me refresh that" — keep moving
