# KLA Escalation Command Center — Demo Speaker Notes

**Audience:** Dave Kelly, Jim Cordova (non-technical decision makers)
**Key Message:** KLA manages ~3,500 active cases across 4,000 field engineers today via email and SharePoint. This demo shows how Snowflake + Cortex AI can centralize escalation management with real-time visibility, SLA tracking, and intelligent parts sourcing with landed cost awareness.

---

## Opening: The Dashboard at a Glance

**[Screen: Full dashboard loads — dark theme recommended]**

> "This is the KLA Escalation Command Center. Think of it as the single pane of glass that replaces the email threads, SharePoint lists, and phone calls your field service team uses today."

**Point out the header bar (top):**
- **SAP S/4 HANA** badge (green dot) — "This is connected to your SAP backend in real time. Inventory, parts, and shipping data flow directly from your ERP."
- **OPEN CASES: 7** — "At a glance, we see 7 active escalation cases across the global fleet."
- **SEV1: 2** (red) — "Two critical cases — production lines down. These are the ones keeping your regional managers up at night."
- **SEV2: 3** (amber) — "Three high-priority cases trending toward critical."
- **SLA BREACH: 4** (red border) — "Four cases have already breached their SLA targets. Today, you'd only know this if someone checked a spreadsheet. Here, it's front and center."

> "You can click any of these counters — SEV1, SEV2, SLA BREACH — and the AI agent on the right will immediately give you a detailed breakdown."

**Customer Filter dropdown:**
> "You can filter the entire dashboard by customer — TSMC, Samsung, Intel, SK Hynix, Renesas. Or view all customers at once. For this demo, we'll keep it on 'All Customers'."

---

## Scenario 1: Escalation Case Triage (Right Panel)

**[Point to the Escalation Cases panel on the right]**

> "This is your escalation queue — every open case, sorted and color-coded by severity. Each card shows the case ID, title, customer, fab site, assigned engineer, and most importantly — the SLA status."

**Walk through the cases visible:**

- **ESC-2026-4281** (Samsung Pyeongtaek) — "SEV1, ESCALATED. SLA breached 72 hours ago. Park Jin-soo is the dedicated field engineer on-site. Two production lines are halted."
- **ESC-2026-4305** (Renesas Naka) — "SEV1, IN PROGRESS. SLA breached 24 hours. 12 wafers scrapped. Tanaka Hiroshi is on it."
- **ESC-2026-4198** (TSMC Fab 15) — "SEV2, WAITING PARTS. SLA breached 120 hours. The part is backordered at San Jose."

**Filter buttons:**
> "Notice the filter tabs — ALL, SEV1, SEV2, SEV3. Click SEV1 to isolate just the critical cases."

**[Click SEV1 filter]**

> "Now you only see the two production-down cases. This is the view a regional VP would use in a morning standup."

**AI Summary button (bottom of panel):**
> "Click 'AI Summary' at the bottom — this sends all open cases to the Cortex Agent for prioritized recommendations."

**[Click 'AI Summary' button]**

> "The agent immediately returns a priority table with severity counts, SLA status, and — critically — identifies that 5 of 7 open cases share the same root cause: batch B-2024-X crystals. That kind of pattern recognition is impossible when cases live in separate email threads."

---

## Scenario 2: Case Deep-Dive (Case Detail Tab)

**[Click on ESC-2026-4281 in the escalation panel]**

> "Let's drill into the Samsung case. Clicking it loads the Case Detail tab in the main panel."

**Point out the case header:**
- Case ID, SEV1 badge, "SLA BREACHED (72h)" in red
- Title: "Critical laser power degradation — production impact"

**Case metadata grid:**
- **Customer:** Samsung — Pyeongtaek P3
- **Scanner:** SCN-KR-001
- **Assigned Engineer:** Park Jin-soo (Pyeongtaek, KR) — "Dedicated on-site. He's not flying in from somewhere — he lives at this fab."
- **Case Age:** 4 days

**Description:**
> "Laser power at 82.3mW, below the 90mW critical threshold. Two production lines halted. Customer requesting ETA."

**Parts Required:**
> "The system shows the specific part needed — 994-023 NLO Crystal Assembly. Click the part name and the agent will check inventory and landed cost options automatically."

**Communication Timeline:**
> "This is the game-changer for replacing email. Every interaction — field engineer notes, customer emails, escalation events, parts requests, status updates — all in one chronological timeline."

Walk through the timeline entries:
1. Mar 22: Park opens the case — power at 82.3mW
2. Mar 22: Confirms crystal from batch B-2024-X (matches Service Bulletin)
3. Mar 23: **Samsung emails** — "Need resolution in 24 hours or VP escalation"
4. Mar 23: Park escalates to SEV1, requests emergency crystal from Singapore
5. Mar 24: Regional manager approves shipment
6. Mar 26: Part in transit, customer updated

> "Every communication type has its own icon — notes, emails, escalations, parts requests, status updates. No more searching through Outlook to find what was said."

**Action buttons at the bottom:**
- **"AI Case Summary"** — "Asks the agent for a full status briefing"
- **"Source Parts"** — "Jumps to landed cost comparison for this case"

**[Click "AI Case Summary"]**

> "The agent gives you: current status, complete timeline summary, parts status with landed cost breakdown, and recommended next steps. This is what a service manager would normally compile manually from 5 different systems."

---

## Scenario 3: Sensor Health Monitoring (Top-Right Panel)

**[Point to Sensor Health panel, top-right]**

> "When we clicked the Samsung case, the dashboard automatically loaded the sensor health for scanner SCN-KR-001. Notice the 'CRITICAL' badge in red."

**Sensor readings displayed:**
- **193nm Laser Power:** 82.3 mW — "This is the root cause. Below the 90mW critical threshold."
- **Chamber Temperature, Stage Vibration, Chamber Pressure, Beam Current, High Voltage, Coolant Flow, Optics Contamination** — "Eight sensor dimensions. Green is healthy, yellow is warning, red is critical."

> "Click any sensor metric and the AI agent analyzes its readings and correlates to open cases. For a critical scanner, you might see 2-3 metrics flagging simultaneously — that's the pattern that tells a field engineer 'this is a crystal problem, not a calibration issue.'"

---

## Scenario 4: Fleet Overview (Top-Left Panel)

**[Point to Customer Fleet Overview panel]**

> "This is your global fleet at a glance. Five customers, 13 fabs, every scanner tracked."

Walk through the fleet:
- **TSMC:** 4 fabs (Tainan, Taichung, Hsinchu, Arizona) — 30 scanners, 3 warnings
- **Samsung:** 3 fabs (Pyeongtaek, Hwaseong, Austin) — 20 scanners, 1 critical
- **Intel:** 3 fabs (Arizona, Ireland, Ohio) — 16 scanners, 1 warning
- **SK Hynix:** 2 fabs (Icheon, Cheongju) — 10 scanners, 1 warning
- **Renesas:** 1 fab (Naka) — 3 scanners, 1 critical

> "Red indicators = critical. Yellow = warning. Click any fab and the AI agent pulls up cases and scanner status for that specific site."

**[Click a fab, e.g., "Samsung Pyeongtaek"]**

> "Immediately triggers a contextual AI query about escalation cases and scanner status at that fab."

**[Use the customer dropdown to filter to "Samsung"]**

> "Now the fleet overview shows only Samsung's 3 fabs. The entire dashboard contextualizes to one customer — useful for preparing for a customer quarterly review."

---

## Scenario 5: Telemetry Analysis (Telemetry Tab)

**[Click the "Telemetry" tab in the bottom panel]**

> "This shows the laser power time series for the selected scanner. For SCN-KR-001, you can see the degradation trend — power declining from ~105mW down to 82mW over 12 days."

> "The red anomaly markers flag when readings dropped below the 90mW threshold. This is the kind of trend that, in production, Cortex AI would detect automatically and trigger a proactive case before the customer even calls."

---

## Scenario 6: Maintenance History (Maintenance Tab)

**[Click the "Maintenance" tab]**

> "Every maintenance event for this scanner — corrective and preventive. Notice SCN-KR-001 had a corrective repair in August: same issue, same part, same batch B-2024-X. 8.5 hours of downtime."

> "The pattern is clear: B-2024-X crystals are failing prematurely across the fleet. Without a centralized system, this correlation would take weeks to discover. Here, the AI flagged it in seconds."

---

## Scenario 7: Parts Sourcing with Landed Cost (Source Parts Tab)

**[Click the "Source Parts" tab]**

> "This is where supply chain meets field service. We need to ship a 994-023 NLO Crystal Assembly to Samsung Pyeongtaek in South Korea."

**Two cards displayed (top 2 options by landed cost):**

**Card 1: KLA Singapore Hub (BEST VALUE)**
- Stock: 2 units
- Shipping: $1,800 | 1 day delivery
- Import Duty: $0 — "Zero tariff because of the ASEAN-Korea Free Trade Agreement"
- VAT/GST: 10%
- **Landed Cost: ~$51,480**
- Batch: B-2024-B (good batch)

**Card 2: KLA Tucson Hub**
- Stock: 3 units
- Shipping: $4,500 | 2 day delivery
- Import Duty: $3,600 — "8% tariff on US-to-Korea optical equipment"
- VAT/GST: 10%
- **Landed Cost: ~$58,410**
- Batch: B-2024-A (good batch)

> "The system automatically excludes San Jose HQ — zero stock — and filters out any warehouse still holding batch B-2024-X, the bad batch."

> "Singapore saves $7,000 per unit AND arrives a day faster. For a $45,000 crystal, tariff awareness alone drives the sourcing decision."

**[Click "Execute Shipment" on Singapore option]**

> "The shipment order is created and the AI agent confirms: order ID, tracking, landed cost breakdown, and automatically updates the linked escalation case. The field engineer gets notified."

---

## Scenario 8: Parts Transfer (Transfer Tab)

**[Click the "Transfer" tab]**

> "Sometimes the part isn't at the right warehouse. This panel lets you initiate inter-warehouse transfers."

**Recommended Transfer: Tucson → San Jose (2 units)**

| Warehouse | On Hand | In Transit | Backordered | Reorder Point |
|-----------|---------|------------|-------------|---------------|
| KLA Tucson Hub | 3 | 1 | 0 | 2 |
| KLA San Jose HQ | **0** | 2 | **4** | 3 |
| KLA Singapore Hub | 2 | 0 | 0 | 2 |
| KLA Dresden Hub | 1 | 1 | 0 | 2 |

> "Look at the inventory picture: San Jose HQ is completely out of stock with 4 units backordered — that's 4 open cases waiting for parts. Meanwhile, Tucson has 3 units on hand, the highest stock of any hub."

> "The smart move: transfer 2 units from Tucson to San Jose."

**Why this transfer makes sense:**
- **Proximity:** Tucson to San Jose is a domestic US transfer — no customs, no tariffs, no duties. Ground shipping, same-day or next-day.
- **Cost:** Domestic ground shipping ~$200-400 vs. international shipping $1,800-4,500. Zero import duties.
- **Coverage:** 2 units covers half the backorder immediately. The remaining 2 in-transit units arriving at San Jose will cover the rest.
- **Safety stock:** Keeps 1 unit at Tucson (at reorder point), triggers automatic replenishment.

> "You select Tucson as source, San Jose as destination, quantity 2. One click."

**[Initiate the transfer: Tucson → San Jose, Qty: 2]**

> "The agent confirms the transfer order with before/after inventory levels:"
> - Tucson: 3 → 1 on hand (at reorder point, replenishment triggered)
> - San Jose: 0 → 2 on hand (backordered drops from 4 to 2)

> "It also identifies which open cases this transfer supports — the 4 backordered cases at San Jose, prioritized by SLA breach severity."

**Alternative transfers to mention if asked:**
- Singapore → Dresden (1 unit): Rebalance European stock, but Singapore only has 2 and needs to support Asia-Pacific shipments
- Tucson → Singapore: Not recommended — cross-Pacific shipping adds 3-5 days and Singapore already has adequate stock

---

## Scenario 9: Inventory Visibility (Inventory Tab)

**[Click the "Inventory" tab]**

> "Global inventory status for part 994-023 across all four KLA hubs."

**Four warehouse cards:**
- **Tucson Hub:** 3 on hand, 1 in transit, 0 backordered
- **San Jose HQ:** 0 on hand, 2 in transit, 4 backordered — "Red 'OUT OF STOCK' warning. 4 units backordered."
- **Singapore Hub:** 2 on hand, 0 in transit, 0 backordered
- **Dresden Hub:** 1 on hand, 1 in transit, 0 backordered

> "At a glance: 6 units globally, 4 backordered at San Jose. With 5+ open cases needing this part, inventory is tight. Click any warehouse card and the AI tells you which cases are committed to that stock."

---

## Scenario 10: AI Agent Conversations (Chat Panel)

**[Point to the right-side chat panel]**

> "The AI agent — powered by Snowflake Cortex — is your intelligent assistant. It understands your fleet, cases, inventory, and cost structures."

**Suggested prompts (visible when chat is empty):**
1. "Summarize open escalation cases by priority"
2. "Show all SEV1 cases with SLA status and engineer assignments"
3. "Source parts for ESC-2026-4281 with landed cost comparison"
4. "What is the fleet impact of batch B-2024-X?"
5. "Give me a status update on case ESC-2026-4281"

**Demo each prompt:**

### Prompt 1: "Summarize open escalation cases by priority"
> "Returns a severity table, priority-ranked recommendations, and identifies the B-2024-X root cause pattern. This replaces your Monday morning case review meeting."

### Prompt 2: "Show all SEV1 cases with SLA status and engineer assignments"
> "Detailed breakdown of each SEV1 case: scanner, engineer, SLA status, parts situation, customer impact, and specific actions required."

### Prompt 3: "Source parts for ESC-2026-4281 with landed cost comparison"
> "Full warehouse comparison with shipping cost, import duty, tariff rates, VAT, and total landed cost. Recommends Singapore at $51,480 vs. Tucson at $58,410. Explains the ASEAN-Korea FTA advantage."

### Prompt 4: "What is the fleet impact of batch B-2024-X?"
> "Lists all 6 affected scanners, their customers, current power readings, and linked escalation cases. Recommends fleet-wide recall. This is the kind of cross-case intelligence that's impossible without centralization."

### Prompt 5: "Give me a status update on case ESC-2026-4281"
> "Full timeline, parts status with landed cost, and 4 recommended next steps. This is what you'd send to Dave Kelly before his Samsung call."

---

## Scenario 11: Executive KPI Bar (New Enhancement)

**[Point to the KPI bar at the very top of the dashboard]**

> "This KPI bar gives executives instant business impact visibility — no drill-downs needed."

**Six real-time KPIs:**
- **Revenue at Risk: $12.4M** — "Total production revenue exposed by active escalation cases"
- **SLA Penalty Exposure: $890K** — "Contractual penalties accumulating from breached SLAs"
- **Avg Case Age: 5.2 days** — "How long cases stay open — target is under 3 days for SEV1"
- **Parts Cost MTD: $234K** — "Month-to-date spend on replacement parts with landed cost awareness"
- **Cases/Engineer: 1.4** — "Workload balance across your 4,000 field engineers"
- **Batch B-2024-X** (amber alert) — "Fleet-wide batch quality indicator — this batch is the root cause in 5 of 7 cases"

> "Today this data lives in 5 different systems. Here it's one glance."

---

## Scenario 12: Workflow Strip — Escalation Lifecycle (New Enhancement)

**[Point to the 6-step workflow strip below the KPI bar]**

> "Every escalation follows this 6-step lifecycle."

**Six stages:**
1. **Issue Detected** — Sensor anomaly or customer report triggers case creation
2. **Case Created** — Escalation case logged with severity, engineer assignment
3. **Parts Identified** — Required parts determined from diagnostic analysis
4. **Landed Cost Calc** — Tariff-aware sourcing comparison across global warehouses
5. **Shipment Executed** — Order created, SAP write-back, field engineer notified
6. **Case Resolved** — Customer confirmation, case closure, lessons learned

> "The active step is highlighted for the selected case. This gives leadership instant pipeline visibility."

> "In production, each step transition would be automated with Snowflake Tasks and Streams."

---

## Scenario 13: SAP Integration Panel — Data Flow Visibility (New Enhancement)

**[Click the SAP Integration tab or point to the SAP data flow panel]**

> "This panel shows the real-time data flow between SAP S/4 HANA and the Snowflake command center."

**Three data tables visible:**
- **Warehouse Inventory** — From SAP MM (Material Management): stock levels, locations, batch IDs
- **Part Recommendations** — Snowflake-calculated: landed cost, duty rates, optimal source
- **Tariff/Duty Rates** — Trade corridor data: US-Korea (8%), Singapore-Korea (0% ASEAN FTA), EU-Korea (3.2%)

> "SAP provides the transactional backbone — inventory, purchase orders, shipping. Snowflake provides the intelligence layer — AI analysis, pattern detection, cost optimization."

> "Data flows in both directions: read from SAP for inventory and orders, write back shipment execution and delivery documents."

> "No rip-and-replace of your ERP. This augments SAP with AI intelligence."

---

## Scenario 14: Architecture Overlay — Technical Deep-Dive (New Enhancement)

**[Click "View Architecture" button or toggle the architecture overlay]**

> "This is the technical architecture behind everything you just saw."

**Three columns:**

**LEFT — SAP S/4 HANA:**
- Source of truth for inventory (MM), orders (SD), shipping (LE), master data
- Real-time replication via Snowpipe Streaming

**CENTER — Snowflake Data Cloud:**
- Data ingestion and unification layer
- Cortex AI Layer: LLM inference (Cortex Complete), semantic search (Cortex Search), agent orchestration (Cortex Agent)
- Real-time analytics and dashboard serving

**RIGHT — Business Value:**
- Single pane of glass for 3,500+ cases
- AI-powered pattern detection (batch B-2024-X across 5 cases)
- Landed cost optimization ($7K savings per shipment via tariff awareness)
- Proactive maintenance vs. reactive firefighting

> "Key message: SAP stays as your ERP. Snowflake adds the intelligence layer on top. This is additive, not competitive with your existing investments."

---

## Scenario 15: AI Tool Orchestration — Agent Intelligence (New Enhancement)

**[Type a question in the chat panel and watch tool steps appear]**

> "Watch what happens when I ask the agent a complex question."

**Tool orchestration visible in chat:**
- **scanner_analyst** (running → completed) — Queries fleet data, case history, sensor readings from Snowflake
- **tech_docs_search** (running → completed) — Searches technical documentation and service bulletins via Cortex Search
- **ship_part** (running → completed) — Checks inventory, calculates landed costs, creates shipment orders

> "Each tool shows its status: spinner while running, checkmark when complete."

> "The agent decides which tools to use based on your question. Ask about a case — it calls scanner_analyst. Ask about parts — it adds ship_part. Ask a technical question — tech_docs_search kicks in."

> "You don't need to know the underlying data model. Natural language in, structured intelligence out. That's the power of Cortex Agent."

---

## Scenario 16: Shipment Write-Back Modal (New Enhancement)

**[Click "Execute Shipment" on the recommended source option]**

> "This is where intelligence turns into action."

**Modal displays:**
- Part details: 994-023 NLO Crystal Assembly
- Source: KLA Singapore Hub (recommended by landed cost analysis)
- Destination: Samsung Pyeongtaek P3, South Korea
- Cost breakdown: Unit ($45,000) + Shipping ($1,800) + Duty ($0) + VAT ($4,680) = **$51,480 landed**
- ETA: 1 business day

> "One click creates the shipment order."

**After execution:**
- Order ID generated with tracking number
- SAP S/4 HANA write-back: delivery document created, goods movement posted
- Escalation case ESC-2026-4281 automatically updated with shipment status
- Field engineer Park Jin-soo notified: "Part arriving tomorrow from Singapore"

> "This closes the loop: from AI recommendation to SAP execution in one workflow. No manual data entry, no copy-paste between systems."

---

## Scenario 17: Theme Toggle

**[Click the sun/moon icon in the header]**

> "Light mode for presentations. Dark mode for the ops center at 2am. Both fully supported."

---

## Closing Talking Points

> "Let me bring it back to the business problem:"

1. **Today:** 3,500 cases managed across email, SharePoint, and phone calls. No single view. No SLA tracking. No pattern detection.

2. **With this:** Every case, every communication, every part, every cost calculation — in one place. The AI agent surfaces patterns (like batch B-2024-X affecting 5 cases) that would take weeks to discover manually.

3. **Landed cost awareness:** When you're shipping a $45,000 crystal, knowing that Singapore saves $7,000 over Tucson because of ASEAN-Korea FTA isn't a nice-to-have — it's margin.

4. **Built on Snowflake:** All data in one platform. Cortex Agent for natural language queries. No new infrastructure to manage. Connects to your SAP S/4 HANA and existing data sources.

> "Questions?"

---

## Scenario 17: Inventory Optimization — PuLP + cuOpt (Optimize Tab)

**[Click the "Optimize" tab in the bottom panel]**

> "Now here's where it gets powerful. Instead of manually deciding which warehouse ships where, we let a Mixed Integer Program figure it out. This is a PuLP solver running a multi-echelon optimization across all 4 warehouses and 5 open cases simultaneously."

**Walk through the parameter panel:**
> "On the left, you can model different scenarios — SLA penalty rates, shipping cost multipliers, safety stock requirements, customer priority. Think of it as a digital twin of your supply chain decisions."

**Click "Run Optimization" → walk through results:**
> "The solver just evaluated every possible warehouse-to-case assignment in under a second. It found the minimum-cost allocation that fulfills all 5 cases."

---

### Killer Question 1: "Why doesn't Singapore serve all the APAC cases?"

**Setup:** Point to the assignment table showing Samsung (KOR) being served from Singapore.

> "Great question. Singapore serves Samsung at $51,300 landed — that's $6,660 cheaper than Tucson at $57,960, because the ASEAN-Korea FTA eliminates the 8% tariff, saving $3,600 in duty alone. But Singapore only has 2 units on hand. The solver has to balance: give both units to APAC, or save one for TSMC's SEV2 case which has been breached for 120 hours. It's optimizing the global minimum, not just one corridor."

**Key stat:** Singapore saves $4,575–$6,660 per unit vs. Tucson on APAC routes due to FTA agreements (ASEAN-Korea, CPTPP, ASEAN-Taiwan = 0% duty).

---

### Killer Question 2: "What happens if we enforce safety stock?"

**Setup:** Drag safety stock slider from 0 to 1. Click Run.

> "Watch what happens. We have 6 units globally, but now 4 are reserved (one per warehouse). That leaves only 2 units available for 5 cases. Three cases go unfulfilled."

> "This is the real trade-off your operations team faces every day: maintaining safety stock to prevent future stockouts vs. fulfilling today's SLA-breached escalations. The 3 unfulfilled cases represent **$8.4 million** in revenue at risk. Is a 1-unit buffer at each warehouse worth $8.4 million in exposed revenue?"

**Key stat:** Safety stock=1 drops SLA coverage from 100% to 40%. The solver shows you that trade-off instantly instead of debating it in a meeting.

---

### Killer Question 3: "How much is the SLA breach actually costing us right now?"

**Setup:** Point to the KPI cards and unfulfilled cases section.

> "Let me quantify it. Right now, across these 5 cases:
> - Samsung SEV1: breached by 72 hours → **$3.6M** in accrued penalties
> - Renesas SEV1: breached by 24 hours → **$1.2M** in accrued penalties  
> - TSMC SEV2: breached by 120 hours → **$3.0M** in accrued penalties
> - That's **$7.8 million** in penalties already accrued, and the meter is still running."

> "Total revenue at risk across all 5 cases is **$10.2 million**. The entire optimized shipping cost to fulfill all 5 cases is roughly $260K. The ROI of getting these parts shipped optimally today is **39x** the shipping cost."

---

### Killer Question 4: "What if tariffs spike — say the US raises Korea tariffs?"

**Setup:** Drag shipping cost multiplier to 2.5x. Click Run.

> "If shipping and tariff costs spike 2.5x — say due to new tariff policy — the USA→Korea corridor goes from $57,960 to $64,710, an increase of $6,750. But the Singapore→Korea corridor only goes up $2,700 because the FTA baseline freight is lower."

> "The solver automatically reroutes: Singapore picks up more APAC cases, Tucson gets the domestic Intel case. This is why having FTA-aware optimization matters — it's not just about shipping cost, it's about **tariff arbitrage**. Singapore is your APAC tariff shield."

---

### Killer Question 5: "How do I know which parameter matters most?"

**Setup (Notebook only):** Point to the Sensitivity Tornado chart after running optimization.

> "The tornado chart ranks every parameter by its cost impact. You'll see that SEV1 penalty rate dominates — changing it from 0.5x to 2x swings total cost by hundreds of thousands. Shipping cost multiplier is second. Safety stock has a binary cliff effect — it's either fine or catastrophic."

> "This tells your VP of Operations: focus on SLA penalty negotiations and FTA corridor optimization. Don't waste time debating whether safety stock should be 0 or 1 — the model shows that decision is a $6M revenue cliff, not a gradual trade-off."

---

### Killer Question 6: "Can the customer prioritize one account over others?"

**Setup:** Select "Samsung" from the Priority Customer dropdown. Click Run.

> "When Dave tells the team 'Samsung is our top priority this quarter,' we can encode that directly. The solver doubles Samsung's penalty weight, ensuring Samsung gets the best warehouse assignment — in this case, Singapore at $51,300 with 1-day delivery. Other cases may shift to more expensive corridors as a result."

> "This is how you turn a verbal directive into a mathematically enforced allocation policy."

---

### Killer Question 7: "What's the production-scale path?"

> "Right now this runs PuLP on CPU — solves 5 cases in under a second. For KLA's actual scale — 3,500 active cases, dozens of part types, hundreds of warehouse-to-fab corridors — we add NVIDIA cuOpt running on GPU via Snowpark Container Services. Same Snowflake account, same data, but the routing solver uses an A10G GPU to solve Vehicle Routing Problems with Time Windows in sub-second latency."

> "The architecture is: PuLP handles strategic allocation (which warehouse serves which case), cuOpt handles tactical routing (in what sequence, respecting delivery windows). Two-stage optimization, all inside Snowflake."

---

## Quick Reference: Interactive Elements to Click During Demo

| Action | What Happens |
|--------|-------------|
| Click SEV1/SEV2/SLA BREACH counters in header | AI agent shows detailed breakdown |
| Customer dropdown filter | Filters fleet overview by customer |
| Click a fab in Fleet Overview | AI query for that fab's cases |
| Click a case in Escalation panel | Loads Case Detail + Sensor Health |
| Click a part name in Case Detail | AI checks inventory + landed cost |
| Click "AI Case Summary" button | Full case briefing from agent |
| Click "Source Parts" button | Landed cost comparison from agent |
| Click "AI Summary" at bottom of cases panel | Priority-ranked case summary |
| Click "Execute Shipment" | Creates shipment order via agent |
| Tab: Case Detail / Telemetry / Maintenance / Source Parts / Transfer / Inventory / **Optimize** | Switches bottom panel view |
| **Optimize tab:** Drag SLA sliders, click Run Optimization | Shows optimal assignments, transfers, cost breakdown |
| **Optimize tab:** Set Safety Stock = 1, click Run | Shows unfulfilled cases and revenue impact |
| **Optimize tab:** Select priority customer dropdown | Solver favors that customer's cases |
| **Optimize tab:** Click "Ask AI to Analyze" button | AI agent analyzes optimization results |
| SEV1/SEV2/SEV3/ALL filter tabs | Filters escalation case list |
| Theme toggle (sun/moon icon) | Switches dark/light mode |
