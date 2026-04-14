import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, ToolStep } from '../types';
import { runAgent, isAgentConfigured } from '../services/cortexAgent';

interface UseAgentChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  activeToolSteps: ToolStep[];
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  isUsingRealAgent: boolean;
}

function getToolStepsForQuery(query: string): ToolStep[] {
  const lower = query.toLowerCase();

  if (lower.includes('summarize') && (lower.includes('escalation') || lower.includes('cases') || lower.includes('prioritiz'))) {
    return [
      { tool: 'scanner_analyst', description: 'Querying KLA_SCANNER_INTELLIGENCE semantic view for case data', status: 'pending' },
      { tool: 'tech_docs_search', description: 'Searching service bulletins for batch correlation', status: 'pending' },
      { tool: 'scanner_analyst', description: 'Computing SLA breach analysis across open cases', status: 'pending' },
    ];
  }
  if (lower.includes('sev1') || (lower.includes('sla') && lower.includes('breach'))) {
    return [
      { tool: 'scanner_analyst', description: 'Querying escalation cases filtered by SEV1', status: 'pending' },
      { tool: 'scanner_analyst', description: 'Retrieving engineer assignments and SLA timelines', status: 'pending' },
    ];
  }
  if (lower.includes('sev2') && lower.includes('sla')) {
    return [
      { tool: 'scanner_analyst', description: 'Querying SEV2 cases with SLA calculations', status: 'pending' },
    ];
  }
  if (lower.includes('status update') || lower.includes('case esc-')) {
    return [
      { tool: 'scanner_analyst', description: 'Retrieving case details and communication log', status: 'pending' },
      { tool: 'scanner_analyst', description: 'Checking parts inventory and shipment status', status: 'pending' },
      { tool: 'tech_docs_search', description: 'Looking up related service bulletins', status: 'pending' },
    ];
  }
  if (lower.includes('landed cost') || lower.includes('source parts') || lower.includes('sourcing') || lower.includes('find parts')) {
    return [
      { tool: 'scanner_analyst', description: 'Querying warehouse inventory across 4 hubs', status: 'pending' },
      { tool: 'scanner_analyst', description: 'Calculating landed costs with tariffs and duties', status: 'pending' },
      { tool: 'tech_docs_search', description: 'Checking FTA eligibility for destination country', status: 'pending' },
    ];
  }
  if (lower.includes('ship') && (lower.includes('994-023') || lower.includes('crystal') || lower.includes('part'))) {
    return [
      { tool: 'scanner_analyst', description: 'Validating inventory availability', status: 'pending' },
      { tool: 'ship_part', description: 'Creating shipment order and updating SAP', status: 'pending' },
      { tool: 'scanner_analyst', description: 'Updating linked escalation case', status: 'pending' },
    ];
  }
  if (lower.includes('transfer') && (lower.includes('unit') || lower.includes('994-023'))) {
    return [
      { tool: 'scanner_analyst', description: 'Checking source/destination inventory levels', status: 'pending' },
      { tool: 'ship_part', description: 'Initiating inter-warehouse transfer order', status: 'pending' },
    ];
  }
  if (lower.includes('b-2024-x') || lower.includes('batch') || lower.includes('fleet impact')) {
    return [
      { tool: 'scanner_analyst', description: 'Querying all scanners with batch B-2024-X', status: 'pending' },
      { tool: 'tech_docs_search', description: 'Retrieving Service Bulletin SB-2024-0892', status: 'pending' },
      { tool: 'scanner_analyst', description: 'Cross-referencing with open escalation cases', status: 'pending' },
    ];
  }
  if (lower.includes('inventory') || lower.includes('details')) {
    return [
      { tool: 'scanner_analyst', description: 'Querying global inventory for part 994-023', status: 'pending' },
      { tool: 'scanner_analyst', description: 'Mapping committed stock to open cases', status: 'pending' },
    ];
  }
  if (lower.includes('critical') || lower.includes('alert') || lower.includes('issue')) {
    return [
      { tool: 'scanner_analyst', description: 'Querying active escalations by severity', status: 'pending' },
      { tool: 'tech_docs_search', description: 'Searching root cause documentation', status: 'pending' },
    ];
  }
  if (lower.includes('maintenance') || lower.includes('history')) {
    return [
      { tool: 'scanner_analyst', description: 'Retrieving maintenance logs for scanner', status: 'pending' },
      { tool: 'scanner_analyst', description: 'Correlating with open escalation cases', status: 'pending' },
    ];
  }
  if (lower.includes('optim') || lower.includes('allocat') || lower.includes('solver') || lower.includes('pulp') || lower.includes('analyz') || lower.includes('analysis')) {
    return [
      { tool: 'scanner_analyst', description: 'Loading warehouse inventory and demand data', status: 'pending' },
      { tool: 'scanner_analyst', description: 'Running optimization model across 4 warehouses × 5 cases', status: 'pending' },
      { tool: 'scanner_analyst', description: 'Computing landed costs with FTA tariff analysis', status: 'pending' },
    ];
  }
  if (lower.includes('recommend') || lower.includes('what should') || lower.includes('next step') || lower.includes('action') || lower.includes('what do')) {
    return [
      { tool: 'scanner_analyst', description: 'Evaluating case severity and SLA breach status', status: 'pending' },
      { tool: 'scanner_analyst', description: 'Computing optimal allocation across warehouses', status: 'pending' },
      { tool: 'tech_docs_search', description: 'Checking batch recall advisories', status: 'pending' },
    ];
  }
  if (lower.includes('samsung') || lower.includes('tsmc') || lower.includes('renesas') || lower.includes('sk hynix') || lower.includes('intel')) {
    return [
      { tool: 'scanner_analyst', description: 'Retrieving customer case and scanner data', status: 'pending' },
      { tool: 'scanner_analyst', description: 'Calculating landed cost options for destination', status: 'pending' },
    ];
  }
  if (lower.includes('tariff') || lower.includes('fta') || lower.includes('duty') || lower.includes('cost')) {
    return [
      { tool: 'scanner_analyst', description: 'Loading tariff rate tables and FTA agreements', status: 'pending' },
      { tool: 'scanner_analyst', description: 'Computing landed costs across all corridors', status: 'pending' },
    ];
  }
  if (lower.includes('power') || lower.includes('sensor') || lower.includes('telemetry') || lower.includes('mw')) {
    return [
      { tool: 'scanner_analyst', description: 'Querying real-time telemetry data', status: 'pending' },
      { tool: 'scanner_analyst', description: 'Computing degradation trends by batch', status: 'pending' },
    ];
  }
  if (lower.includes('engineer') || lower.includes('assign') || lower.includes('who')) {
    return [
      { tool: 'scanner_analyst', description: 'Retrieving engineer assignments and availability', status: 'pending' },
    ];
  }
  return [
    { tool: 'scanner_analyst', description: 'Analyzing query against fleet data', status: 'pending' },
    { tool: 'scanner_analyst', description: 'Cross-referencing escalation cases and inventory', status: 'pending' },
  ];
}

export function useAgentChat(): UseAgentChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolSteps, setActiveToolSteps] = useState<ToolStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const conversationHistoryRef = useRef<Array<{ role: string; content: Array<{ type: string; text: string }> }>>([]);
  const isUsingRealAgent = isAgentConfigured();

  const simulateAgentResponse = useCallback(async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('summarize') && (lowerMessage.includes('escalation') || lowerMessage.includes('cases') || lowerMessage.includes('prioritiz'))) {
      return `## Escalation Case Summary

### By Severity
| Severity | Open | SLA Breached | Waiting Parts |
|----------|------|-------------|---------------|
| SEV1 | 2 | 2 | 1 |
| SEV2 | 3 | 2 | 1 |
| SEV3 | 2 | 0 | 1 |

### Priority Recommendations
1. **ESC-2026-4281** (Samsung Pyeongtaek) — SEV1, SLA breached 72h. Crystal in transit, ETA today. **Highest priority.**
2. **ESC-2026-4305** (Renesas Naka) — SEV1, SLA breached 24h. 12 wafers scrapped. Parts ordered, awaiting shipment.
3. **ESC-2026-4156** (IMEC Leuven) — SEV2, SLA breached 96h. Optics contamination compounded by B-2024-X crystal.
4. **ESC-2026-4198** (TSMC Fab 15) — SEV2, SLA breached 120h. Crystal backordered at San Jose.

### Root Cause Pattern
**5 of 7 open cases** involve batch B-2024-X crystals. Recommend fleet-wide recall and proactive replacement.`;
    }

    if (lowerMessage.includes('sev1') || (lowerMessage.includes('sla') && lowerMessage.includes('breach'))) {
      return `## SEV1 Escalation Cases

### ESC-2026-4281 — Samsung Pyeongtaek P3
- **Scanner:** SCN-KR-001 | Power: 82.3 mW
- **Engineer:** Park Jin-soo (on-site, dedicated)
- **Status:** ESCALATED | SLA breached 72h ago
- **Parts:** Crystal in transit from Singapore, ETA today
- **Customer Impact:** 2 production lines halted
- **Action Required:** Confirm delivery, schedule replacement, update Samsung ops

### ESC-2026-4305 — Renesas Naka
- **Scanner:** SCN-JP-005 | Power: 78.9 mW
- **Engineer:** Tanaka Hiroshi (on-site)
- **Status:** IN PROGRESS | SLA breached 24h ago
- **Parts:** Crystal + mirror assembly ordered, shipment pending
- **Customer Impact:** 12 wafers scrapped, tool offline
- **Action Required:** Expedite shipment, provide yield impact assessment`;
    }

    if (lowerMessage.includes('sev2') && lowerMessage.includes('sla')) {
      return `## SEV2 Cases — SLA Status

| Case | Customer | SLA Status | Engineer | Blocker |
|------|----------|-----------|----------|---------|
| ESC-2026-4198 | TSMC Fab 15 | Breached 120h | Lin Mei-hua | Part backordered |
| ESC-2026-4156 | IMEC Leuven | Breached 96h | Müller Hans | Optics kit + crystal needed |
| ESC-2026-4312 | SK Hynix | At SLA limit | Kim Dong-hyun | Monitoring 48h |

### Closest to Escalation
**ESC-2026-4312** (SK Hynix) — currently at 0h SLA remaining. If optics adjustment fails, will need crystal replacement and upgrade to SEV1.`;
    }

    if (lowerMessage.includes('status update') || lowerMessage.includes('case esc-')) {
      const caseMatch = userMessage.match(/ESC-\d+-\d+/i);
      const caseId = caseMatch ? caseMatch[0].toUpperCase() : 'ESC-2026-4281';
      
      return `## Case ${caseId} — Status Update

### Current Status
- **Severity:** SEV1 | **SLA:** Breached
- **Case Age:** 4 days
- **Last Update:** March 26, 06:15 UTC

### Timeline Summary
- Mar 22: Case opened — power at 82.3mW, CLBO crystal from batch B-2024-X confirmed
- Mar 23: Samsung requested ETA within 24h, escalated to SEV1
- Mar 24: Crystal shipment approved from Singapore Hub
- Mar 26: Part in transit, expected delivery end of day

### Parts Status
- **994-023 NLO Crystal Assembly** — In transit from KLA Singapore Hub
- Batch: B-2024-A (verified good batch)
- Landed cost: $48,600 (unit $45,000 + shipping $1,800 + duty $0 + tax $1,800)

### Recommended Next Steps
1. Confirm delivery with Singapore logistics
2. Pre-schedule 8h maintenance window with Samsung ops
3. Prepare post-replacement power validation test
4. Update customer portal with ETA`;
    }

    if (lowerMessage.includes('landed cost') || lowerMessage.includes('source parts') || lowerMessage.includes('sourcing') || lowerMessage.includes('find parts')) {
      return `## Parts Sourcing — Landed Cost Comparison

**Part:** 994-023 NLO Crystal Assembly
**Destination:** Samsung Pyeongtaek, South Korea

| Warehouse | Stock | Shipping | Import Duty | VAT (10%) | Landed Cost | ETA |
|-----------|-------|----------|-------------|-----------|-------------|-----|
| Singapore Hub | 2 | $1,800 | $0 | $4,680 | **$51,480** | 1 day |
| Tucson Hub | 3 | $4,500 | $3,600 | $5,310 | **$58,410** | 2 days |
| Dresden Hub | 1 | $3,500 | $1,800 | $5,030 | **$55,330** | 3 days |
| San Jose HQ | 0 | — | — | — | — | N/A |

### Recommendation
**Singapore Hub** offers the lowest landed cost ($51,480) and fastest delivery (1 day). No import duty due to ASEAN-Korea FTA.

### Tariff Considerations
- US→Korea: 8% tariff on optical equipment (HS 9013.90)
- EU→Korea: 4% tariff (EU-Korea FTA partial exemption)
- Singapore→Korea: 0% (ASEAN-Korea FTA)
- *Note: US tariff rate scheduled to increase to 12% effective April 15, 2026*`;
    }
    
    if (lowerMessage.includes('transfer') && (lowerMessage.includes('unit') || lowerMessage.includes('994-023'))) {
      const fromMatch = userMessage.match(/from ([^to]+) to/i);
      const toMatch = userMessage.match(/to ([^,.\n]+)/i);
      const qtyMatch = userMessage.match(/(\d+)\s*unit/i);
      
      const from = fromMatch ? fromMatch[1].trim() : 'KLA Tucson Hub';
      const to = toMatch ? toMatch[1].trim() : 'KLA San Jose HQ';
      const qty = qtyMatch ? qtyMatch[1] : '1';
      
      return `## Transfer Order Initiated

### Transfer Details
- **Transfer ID:** TRF-20260326-${Math.floor(Math.random() * 10000)}
- **Part:** 994-023 (NLO Harmonic Crystal Assembly)
- **Quantity:** ${qty} unit(s)
- **From:** ${from}
- **To:** ${to}
- **Method:** Ground Freight
- **ETA:** 2-3 business days

### Inventory Update
| Warehouse | Before | After |
|-----------|--------|-------|
| ${from} | 3 | ${3 - parseInt(qty)} |
| ${to} | 0 | ${qty} |

### Linked Cases
This transfer may support resolution of cases waiting on parts inventory.`;
    }
    
    if (lowerMessage.includes('ship') && (lowerMessage.includes('994-023') || lowerMessage.includes('crystal') || lowerMessage.includes('part'))) {
      const fromMatch = userMessage.match(/from ([^to]+) to/i);
      const toMatch = userMessage.match(/to (SCN-[A-Z]+-\d+)/i);
      
      const from = fromMatch ? fromMatch[1].trim() : 'KLA Singapore Hub';
      const to = toMatch ? toMatch[1] : 'SCN-KR-001';
      
      return `## Shipment Order Created

### Order Details
- **Order ID:** KLA-20260326-${Math.floor(Math.random() * 10000)}
- **Part:** 994-023 (NLO Harmonic Crystal Assembly)
- **From:** ${from}
- **To:** ${to}
- **Method:** Next Day Air Priority
- **ETA:** March 27, 2026

### Landed Cost Breakdown
| Component | Amount |
|-----------|--------|
| Unit Price | $45,000 |
| Shipping | $1,800 |
| Import Duty | $0 |
| VAT/GST (10%) | $4,680 |
| **Total Landed Cost** | **$51,480** |

### SAP Integration
- SAP Purchase Order: PO-4500028741 created
- Material Document: 5000123456 posted
- Case **ESC-2026-4281** status updated to WAITING_PARTS
- Field engineer Park Jin-soo notified via Teams`;
    }
    
    if (lowerMessage.includes('critical') || lowerMessage.includes('alert') || lowerMessage.includes('issue')) {
      return `## Active Escalations — Critical

**2 SEV1 cases** and **3 SEV2 cases** requiring attention:

### SEV1 Cases
| Case | Customer | Scanner | SLA | Blocker |
|------|----------|---------|-----|---------|
| ESC-2026-4281 | Samsung | SCN-KR-001 | -72h | Part in transit |
| ESC-2026-4305 | Renesas | SCN-JP-005 | -24h | Parts ordered |

### Root Cause
Both involve batch **B-2024-X** crystals with elevated sodium impurities (SB-2024-0892).

### Recommended Actions
1. Confirm Singapore shipment delivery for ESC-2026-4281
2. Expedite parts for ESC-2026-4305 (Dresden or Singapore)
3. Pre-position crystals for 3 SEV2 cases likely to escalate`;
    }

    if (lowerMessage.includes('inventory') || lowerMessage.includes('details')) {
      return `## Inventory Status: 994-023

| Warehouse | On Hand | In Transit | Backorder | Committed to Cases |
|-----------|---------|------------|-----------|--------------------|
| KLA Tucson Hub | 3 | 1 | 0 | 1 (ESC-4287) |
| KLA San Jose HQ | 0 | 2 | 4 | 0 |
| KLA Singapore Hub | 2 | 0 | 0 | 1 (ESC-4281) |
| KLA Dresden Hub | 1 | 1 | 0 | 0 |

**Global Available:** 6 units | **Committed:** 2 | **Free:** 4

### Open Cases Needing Parts
- ESC-2026-4281: 1 unit (Singapore, in transit)
- ESC-2026-4305: 1 unit + mirror assembly (pending)
- ESC-2026-4198: 1 unit (backordered)
- ESC-2026-4156: 1 unit + optics kit (pending)`;
    }

    if (lowerMessage.includes('b-2024-x') || lowerMessage.includes('batch') || lowerMessage.includes('fleet impact')) {
      return `## Batch B-2024-X — Fleet Impact Analysis

**Service Bulletin SB-2024-0892**

### Affected Scanners & Escalation Cases
| Scanner | Customer | Power | Case | Severity |
|---------|----------|-------|------|----------|
| SCN-KR-001 | Samsung | 82.3 mW | ESC-4281 | SEV1 |
| SCN-JP-005 | Renesas | 78.9 mW | ESC-4305 | SEV1 |
| SCN-TW-004 | TSMC | 91.2 mW | ESC-4198 | SEV2 |
| SCN-KR-004 | SK Hynix | 92.1 mW | ESC-4312 | SEV2 |
| SCN-US-003 | Intel | 91.8 mW | ESC-4287 | SEV3 |
| SCN-EU-004 | IMEC | 92.4 mW | ESC-4156 | SEV2 |

### Recommendation
Fleet-wide recall of B-2024-X crystals. Estimated 6 units needed, 4 currently available.`;
    }

    if (lowerMessage.includes('maintenance') || lowerMessage.includes('history')) {
      return `## Maintenance History — Related to Open Cases

| Scanner | Date | Issue | Downtime | Related Case |
|---------|------|-------|----------|-------------|
| SCN-KR-001 | Aug 15 | Low power | 8.5h | ESC-4281 (recurrence) |
| SCN-JP-005 | Aug 20 | Power drop | 12h | ESC-4305 (recurrence) |
| SCN-TW-004 | Sep 20 | Misalignment | 6h | ESC-4198 |

### Pattern
3 of 3 corrective repairs involved B-2024-X batch crystals. Average downtime: 8.8 hours per crystal replacement.`;
    }

    if (lowerMessage.includes('optim') || lowerMessage.includes('allocat') || lowerMessage.includes('solver') || lowerMessage.includes('pulp') || lowerMessage.includes('analyz') || lowerMessage.includes('analysis')) {
      return `## Optimization Analysis — Current State

### Inventory Position
- **6 units** on-hand globally across 4 warehouses
- **5 active cases** requiring NLO Crystal Assembly (994-023)
- **Capacity utilization:** 83% (5 needed / 6 available = 1 spare unit)

### Optimal Allocation (PuLP MIP Solver)
| Case | Customer | Best Warehouse | Landed Cost | Why |
|------|----------|---------------|-------------|-----|
| ESC-4281 | Samsung | Singapore | $51,300 | ASEAN-Korea FTA: 0% duty, 1-day delivery |
| ESC-4305 | Renesas | Singapore | $51,600 | CPTPP: 0% duty, 1-day delivery |
| ESC-4198 | TSMC | Tucson | $57,270 | No FTA corridor to Taiwan from other hubs |
| ESC-4312 | SK Hynix | Dresden | $54,284 | EU-Korea FTA: 3.2% vs US 8% |
| ESC-4287 | Intel | Tucson | $49,900 | Domestic: $400 freight, 0% duty |

### Key Insights
1. **Singapore is the tariff shield** — serves APAC at $0 duty via FTA network
2. **$7.8M in SLA penalties already accrued** — Samsung ($3.6M), TSMC ($3.0M), Renesas ($1.2M)
3. **ROI of optimal shipping: 39x** — ~$264K total cost protects $10.2M revenue at risk
4. **Safety stock trade-off:** Setting min safety stock to 1 drops fulfillment from 5/5 to 2/5, exposing $8.4M additional revenue`;
    }

    if (lowerMessage.includes('recommend') || lowerMessage.includes('what should') || lowerMessage.includes('next step') || lowerMessage.includes('action') || lowerMessage.includes('what do')) {
      return `## Recommended Actions — Priority Order

### Immediate (Next 4 hours)
1. **Ship from Singapore → Samsung Pyeongtaek** — Landed cost $51,300, 1-day ETA. SLA breached 72h, penalty accruing at $50K/hr.
2. **Ship from Singapore → Renesas Hitachinaka** — Landed cost $51,600, 1-day ETA. Uses last Singapore unit. SLA breached 24h.

### Today
3. **Transfer 2 units Tucson → San Jose** — $400/unit domestic freight. Replenishes San Jose (currently at 0) for West Coast coverage.
4. **Ship from Tucson → Intel Chandler** — Domestic, $49,900 landed, 1-day. Only case not yet breached (24h remaining).

### This Week
5. **Ship from Dresden → SK Hynix Icheon** — $54,284 via EU-Korea FTA. SK Hynix at 0h SLA — about to breach.
6. **Expedite PO for 6 replacement units** — Current global stock drops to 1 after fulfillment. San Jose has 4 backordered.
7. **Initiate fleet-wide B-2024-X crystal recall** — 5 of 7 cases linked to this batch.

### Revenue Protected
Executing steps 1-5 protects **$10.2M** in revenue at risk at a total shipping cost of ~$264K.`;
    }

    if (lowerMessage.includes('samsung') || lowerMessage.includes('pyeongtaek')) {
      return `## Samsung Pyeongtaek — ESC-2026-4281

### Case Status
- **Severity:** SEV1 | **SLA:** Breached by 72 hours
- **Scanner:** SCN-KR-001 | Power: 82.3 mW (below 85 mW threshold)
- **Engineer:** Park Jin-soo (on-site, dedicated)
- **Revenue at Risk:** $4,200,000
- **Penalty Accrued:** $3,600,000 ($50K/hr × 72h)

### Best Sourcing Option
| Warehouse | Landed Cost | Duty | FTA | ETA |
|-----------|------------|------|-----|-----|
| **Singapore** | **$51,300** | **$0** | **ASEAN-Korea** | **1 day** |
| Dresden | $54,284 | $1,440 | EU-Korea (3.2%) | 2 days |
| Tucson | $57,960 | $3,600 | None (8%) | 2 days |

### Recommendation
Ship immediately from Singapore. Saves $6,660 vs Tucson and arrives 1 day faster. ASEAN-Korea FTA eliminates the 8% tariff entirely.`;
    }

    if (lowerMessage.includes('tsmc') || lowerMessage.includes('taichung') || lowerMessage.includes('taiwan')) {
      return `## TSMC Taichung — ESC-2026-4198

### Case Status
- **Severity:** SEV2 | **SLA:** Breached by 120 hours (worst breach)
- **Scanner:** SCN-TW-004 | Power: 91.2 mW
- **Revenue at Risk:** $2,400,000
- **Penalty Accrued:** $3,000,000 ($25K/hr × 120h)

### Sourcing Options
| Warehouse | Landed Cost | Duty | ETA |
|-----------|------------|------|-----|
| **Singapore** | **$51,400** | **$0** | **1 day** |
| Dresden | $54,732 | $1,575 | 2 days |
| Tucson | $57,270 | $2,700 | 2 days |

### Challenge
Singapore is optimal but only has 2 units — both may be needed for the two SEV1 cases (Samsung, Renesas). If Singapore serves TSMC, one SEV1 case must ship from Tucson at +$6,560 premium.

This is exactly the trade-off the optimizer solves.`;
    }

    if (lowerMessage.includes('tariff') || lowerMessage.includes('fta') || lowerMessage.includes('trade') || lowerMessage.includes('duty') || lowerMessage.includes('cost comparison')) {
      return `## Tariff & FTA Analysis — Part 994-023

### Free Trade Agreements in Play
| Corridor | FTA | Tariff | Savings vs No FTA |
|----------|-----|--------|------------------|
| Singapore → Korea | ASEAN-Korea | 0% | $3,600/unit |
| Singapore → Japan | CPTPP | 0% | $2,250/unit |
| Singapore → Taiwan | ASEAN-Taiwan | 0% | $2,700/unit |
| Dresden → Korea | EU-Korea | 3.2% | $2,160/unit |
| Dresden → Japan | EU-Japan EPA | 3.8% | $540/unit |

### Key Insight
**Singapore is the APAC tariff shield.** Every APAC shipment from Singapore saves $2,250–$3,600 in duty vs. US origin. For 5 cases, optimal FTA routing saves approximately **$15,000–$20,000** in total duty.

### Risk
US→Korea tariff rate is 8% today. If trade tensions escalate to 12%, the Singapore advantage grows to **$5,400/unit**. The optimizer automatically reroutes when you adjust the shipping cost multiplier.`;
    }

    if (lowerMessage.includes('power') || lowerMessage.includes('mw') || lowerMessage.includes('reading') || lowerMessage.includes('sensor') || lowerMessage.includes('telemetry')) {
      return `## Telemetry Analysis

### Power Readings — Flagged Scanners
| Scanner | Customer | Current | Threshold | Status | Batch |
|---------|----------|---------|-----------|--------|-------|
| SCN-KR-001 | Samsung | 82.3 mW | 85 mW | **CRITICAL** | B-2024-X |
| SCN-JP-005 | Renesas | 78.9 mW | 85 mW | **CRITICAL** | B-2024-X |
| SCN-TW-004 | TSMC | 91.2 mW | 85 mW | WARNING | B-2024-X |
| SCN-KR-004 | SK Hynix | 92.1 mW | 85 mW | WARNING | B-2024-X |
| SCN-US-003 | Intel | 91.8 mW | 85 mW | WARNING | B-2024-X |

### Correlation
All 5 scanners showing degraded power output share **batch B-2024-X** crystals. Mean power for B-2024-X units is 87.3 mW vs fleet average of 96.2 mW — a **9.2% degradation**.

### Prediction
Based on degradation curves, SCN-TW-004 (TSMC) and SCN-KR-004 (SK Hynix) will breach 85 mW threshold within **2-3 weeks**. Recommend proactive crystal replacement.`;
    }

    if (lowerMessage.includes('renesas') || lowerMessage.includes('naka') || lowerMessage.includes('japan')) {
      return `## Renesas Naka — ESC-2026-4305

### Case Status
- **Severity:** SEV1 | **SLA:** Breached by 24 hours
- **Scanner:** SCN-JP-005 | Power: 78.9 mW (lowest in fleet)
- **Engineer:** Tanaka Hiroshi (on-site)
- **Revenue at Risk:** $1,800,000
- **Customer Impact:** 12 wafers scrapped, tool offline

### Sourcing Options
| Warehouse | Landed Cost | Duty | FTA | ETA |
|-----------|------------|------|-----|-----|
| **Singapore** | **$51,600** | **$0** | **CPTPP** | **1 day** |
| Dresden | $54,781 | $1,710 | EU-Japan EPA (3.8%) | 2 days |
| Tucson | $56,175 | $2,250 | None (5%) | 2 days |

### Recommendation
Ship from Singapore via CPTPP corridor. $4,575 cheaper than Tucson, arrives 1 day earlier. This scanner has the lowest power reading in the fleet (78.9 mW) — replacement is urgent.`;
    }

    if (lowerMessage.includes('sk hynix') || lowerMessage.includes('icheon') || lowerMessage.includes('hynix')) {
      return `## SK Hynix Icheon — ESC-2026-4312

### Case Status
- **Severity:** SEV2 | **SLA:** At limit (0 hours remaining)
- **Scanner:** SCN-KR-004 | Power: 92.1 mW (trending down)
- **Engineer:** Kim Dong-hyun (monitoring)
- **Revenue at Risk:** $1,200,000

### Sourcing Options
| Warehouse | Landed Cost | Duty | FTA | ETA |
|-----------|------------|------|-----|-----|
| **Singapore** | **$51,300** | **$0** | **ASEAN-Korea** | **1 day** |
| Dresden | $54,284 | $1,440 | EU-Korea (3.2%) | 2 days |
| Tucson | $57,960 | $3,600 | None (8%) | 2 days |

### Risk
At 0h SLA remaining, this case will breach imminently. If not addressed today, escalates to SEV1 with $50K/hr penalty rate (up from current $25K/hr).`;
    }

    if (lowerMessage.includes('intel') || lowerMessage.includes('chandler') || lowerMessage.includes('arizona')) {
      return `## Intel Chandler — ESC-2026-4287

### Case Status
- **Severity:** SEV3 | **SLA:** 24 hours remaining
- **Scanner:** SCN-US-003 | Power: 91.8 mW
- **Engineer:** Sarah Mitchell (remote)
- **Revenue at Risk:** $600,000

### Sourcing — Domestic Advantage
| Warehouse | Landed Cost | Duty | ETA |
|-----------|------------|------|-----|
| **Tucson** | **$49,900** | **$0** | **1 day** |
| Singapore | $51,300+ | $0 | 2 days |
| Dresden | $54,284+ | varies | 3 days |

### Recommendation
Domestic shipment from Tucson: $49,900 landed, 1-day ground. Cheapest option by $1,400+ and fastest. Tucson has 3 units — can spare 1 for Intel while reserving 2 for APAC cases.`;
    }

    if (lowerMessage.includes('engineer') || lowerMessage.includes('assign') || lowerMessage.includes('team') || lowerMessage.includes('who')) {
      return `## Field Engineer Assignments

| Case | Customer | Engineer | Location | Status |
|------|----------|----------|----------|--------|
| ESC-4281 | Samsung | Park Jin-soo | Pyeongtaek (on-site) | Dedicated, waiting parts |
| ESC-4305 | Renesas | Tanaka Hiroshi | Naka (on-site) | Active troubleshooting |
| ESC-4198 | TSMC | Lin Mei-hua | Taichung (on-site) | Waiting backordered part |
| ESC-4312 | SK Hynix | Kim Dong-hyun | Icheon (on-site) | Monitoring, 48h window |
| ESC-4287 | Intel | Sarah Mitchell | Remote (Chandler) | Scheduled for next week |

### Availability
All 5 field engineers currently committed. Nearest backup: James Chen (San Jose) — 2h flight to US fabs, 14h to APAC.`;
    }

    if (lowerMessage.includes('cost') || lowerMessage.includes('spend') || lowerMessage.includes('budget') || lowerMessage.includes('expensive') || lowerMessage.includes('cheap')) {
      return `## Cost Analysis — Open Escalations

### Shipping Cost (Optimal Allocation)
| Case | Route | Landed Cost | % of Revenue at Risk |
|------|-------|-------------|---------------------|
| ESC-4281 | Singapore → Samsung | $51,300 | 1.2% |
| ESC-4305 | Singapore → Renesas | $51,600 | 2.9% |
| ESC-4198 | Tucson → TSMC | $57,270 | 2.4% |
| ESC-4312 | Dresden → SK Hynix | $54,284 | 4.5% |
| ESC-4287 | Tucson → Intel | $49,900 | 8.3% |
| **Total** | | **$264,354** | **2.6%** |

### SLA Penalty Already Accrued
- Samsung: **$3,600,000** (72h × $50K)
- TSMC: **$3,000,000** (120h × $25K)
- Renesas: **$1,200,000** (24h × $50K)
- **Total: $7,800,000**

### Bottom Line
Spending $264K now protects **$10.2M** in revenue and stops $7.8M in penalties from growing further. **ROI: 39x.**`;
    }

    const keywords = lowerMessage.split(/\s+/);
    const casePatterns: Array<{ score: number; response: string }> = [
      { score: ['case', 'escalat', 'open', 'status', 'update', 'how', 'many', 'count', 'list', 'show', 'all'].filter(k => keywords.some(w => w.includes(k))).length, response: 'cases' },
      { score: ['part', 'crystal', 'nlo', '994', 'ship', 'source', 'where', 'warehouse', 'stock', 'available'].filter(k => keywords.some(w => w.includes(k))).length, response: 'parts' },
      { score: ['sev', 'critical', 'urgent', 'breach', 'sla', 'overdue', 'late'].filter(k => keywords.some(w => w.includes(k))).length, response: 'severity' },
    ];
    const best = casePatterns.sort((a, b) => b.score - a.score)[0];
    if (best && best.score >= 2) {
      if (best.response === 'parts') return simulateAgentResponse('source parts with landed cost');
      if (best.response === 'severity') return simulateAgentResponse('show SEV1 cases with SLA status');
      return simulateAgentResponse('summarize open escalation cases by priority');
    }

    return `## Analysis: ${userMessage.slice(0, 80)}

Based on current fleet data across 7 open escalation cases:

### Key Facts
- **7 open cases** (2 SEV1, 3 SEV2, 2 SEV3)
- **$10.2M total revenue at risk** across Samsung, Renesas, TSMC, SK Hynix, Intel
- **$7.8M in SLA penalties already accrued** — meter still running
- **6 NLO Crystal units on hand** across Tucson (3), Singapore (2), Dresden (1)
- **Batch B-2024-X** linked to 5 of 7 open cases — sodium impurity degradation

### Recommended Queries
Try asking:
- **"What should I do first?"** — Prioritized action plan
- **"Samsung case status"** — Deep dive on highest-revenue case
- **"Tariff analysis"** — FTA corridors and cost optimization
- **"Show optimization analysis"** — PuLP solver allocation results
- **"Source parts for ESC-2026-4281"** — Landed cost comparison`;
  }, []);


  const animateToolSteps = useCallback(async (steps: ToolStep[]): Promise<ToolStep[]> => {
    const animated = [...steps];
    for (let i = 0; i < animated.length; i++) {
      animated[i] = { ...animated[i], status: 'running' };
      setActiveToolSteps([...animated]);
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      animated[i] = { ...animated[i], status: 'complete' };
      setActiveToolSteps([...animated]);
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    return animated;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    setError(null);
    setActiveToolSteps([]);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      let responseText: string;
      
      const toolSteps = getToolStepsForQuery(content);
      const completedSteps = await animateToolSteps(toolSteps);
      
      if (isUsingRealAgent) {
        const result = await runAgent(content, conversationHistoryRef.current);
        responseText = result.responseText;
        
        conversationHistoryRef.current.push(
          { role: 'user', content: [{ type: 'text', text: content }] },
          { role: 'assistant', content: [{ type: 'text', text: responseText }] }
        );
      } else {
        responseText = await simulateAgentResponse(content);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        toolSteps: completedSteps,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
      setActiveToolSteps([]);
    }
  }, [simulateAgentResponse, isUsingRealAgent, animateToolSteps]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    conversationHistoryRef.current = [];
  }, []);

  return { messages, isLoading, activeToolSteps, error, sendMessage, clearMessages, isUsingRealAgent };
}
