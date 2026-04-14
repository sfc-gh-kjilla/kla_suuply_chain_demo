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

> "You select source warehouse, destination, and quantity. For example, moving 1 unit from Tucson to San Jose to cover backordered cases."

**[Initiate a transfer]**

> "The agent confirms the transfer order with before/after inventory levels and identifies which open cases this transfer supports."

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

## Scenario 11: Theme Toggle

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
| Tab: Case Detail / Telemetry / Maintenance / Source Parts / Transfer / Inventory | Switches bottom panel view |
| SEV1/SEV2/SEV3/ALL filter tabs | Filters escalation case list |
| Theme toggle (sun/moon icon) | Switches dark/light mode |
