import { useState, useCallback, useRef } from 'react';
import type { ChatMessage } from '../types';
import { runAgent, isAgentConfigured } from '../services/cortexAgent';

interface UseAgentChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  isUsingRealAgent: boolean;
}

export function useAgentChat(): UseAgentChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversationHistoryRef = useRef<Array<{ role: string; content: Array<{ type: string; text: string }> }>>([]);
  const isUsingRealAgent = isAgentConfigured();

  const simulateAgentResponse = useCallback(async (userMessage: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    
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

    if (lowerMessage.includes('landed cost') || lowerMessage.includes('source parts') || lowerMessage.includes('sourcing')) {
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
- US→Korea: 8% tariff on optical equipment
- EU→Korea: 4% tariff (EU-Korea FTA partial exemption)
- Singapore→Korea: 0% (ASEAN-Korea FTA)`;
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

### Linked Escalation
Case **ESC-2026-4281** updated. Field engineer Park Jin-soo notified.`;
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

    if (lowerMessage.includes('b-2024-x') || lowerMessage.includes('batch')) {
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

    return `I can help with escalation management:

- **"Summarize open escalation cases"** — Priority overview
- **"Show SEV1 cases"** — Critical escalations
- **"Source parts with landed cost"** — Compare warehouses
- **"Status update on case ESC-2026-4281"** — Case drill-down
- **"Batch B-2024-X impact"** — Fleet-wide analysis

What would you like to know?`;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      let responseText: string;
      
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
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [simulateAgentResponse, isUsingRealAgent]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    conversationHistoryRef.current = [];
  }, []);

  return { messages, isLoading, error, sendMessage, clearMessages, isUsingRealAgent };
}
