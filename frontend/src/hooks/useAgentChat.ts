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
    
    if (lowerMessage.includes('transfer') && (lowerMessage.includes('unit') || lowerMessage.includes('994-023'))) {
      const fromMatch = userMessage.match(/from ([^to]+) to/i);
      const toMatch = userMessage.match(/to ([^,.\n]+)/i);
      const qtyMatch = userMessage.match(/(\d+)\s*unit/i);
      
      const from = fromMatch ? fromMatch[1].trim() : 'KLA Tucson Hub';
      const to = toMatch ? toMatch[1].trim() : 'KLA San Jose HQ';
      const qty = qtyMatch ? qtyMatch[1] : '1';
      
      return `## Transfer Order Initiated ✓

### Transfer Details
- **Transfer ID:** TRF-20260305-${Math.floor(Math.random() * 10000)}
- **Part:** 994-023 (NLO Harmonic Crystal Assembly)
- **Quantity:** ${qty} unit(s)
- **From:** ${from}
- **To:** ${to}
- **Method:** Ground Freight
- **ETA:** 2-3 business days
- **Status:** PROCESSING

### Inventory Update
| Warehouse | Before | After |
|-----------|--------|-------|
| ${from} | 3 | ${3 - parseInt(qty)} |
| ${to} | 0 | ${qty} |

### Approval Chain
1. ✅ Inventory check passed
2. ✅ Transfer authorized
3. 🔄 Awaiting pickup confirmation

The receiving warehouse will be notified upon shipment.`;
    }
    
    if (lowerMessage.includes('ship') && (lowerMessage.includes('994-023') || lowerMessage.includes('crystal') || lowerMessage.includes('part'))) {
      const fromMatch = userMessage.match(/from ([^to]+) to/i);
      const toMatch = userMessage.match(/to (SCN-[A-Z]+-\d+)/i);
      
      const from = fromMatch ? fromMatch[1].trim() : 'KLA Singapore Hub';
      const to = toMatch ? toMatch[1] : 'SCN-KR-001';
      
      return `## Shipment Order Created ✓

### Order Details
- **Order ID:** KLA-20260305-${Math.floor(Math.random() * 10000)}
- **Part:** 994-023 (NLO Harmonic Crystal Assembly)
- **From:** ${from}
- **To:** ${to}
- **Method:** Next Day Air Priority
- **ETA:** March 6, 2026
- **Cost Breakdown:**
  - Unit: $2,800
  - Shipping: $450
  - Import Duty: $168
  - VAT: $392
  - **Total: $3,810**

### Next Steps
1. ✅ Order confirmed
2. ✅ Warehouse notified
3. 🔄 Packaging in progress
4. ⏳ Field service scheduling

The maintenance team at ${to.includes('KR') ? 'Samsung Pyeongtaek' : 'the destination fab'} has been notified.`;
    }
    
    if (lowerMessage.includes('critical') || lowerMessage.includes('alert') || lowerMessage.includes('issue')) {
      return `## Current Critical Alerts

**2 critical alerts** requiring immediate attention:

### 1. SCN-KR-001 (Samsung Pyeongtaek)
- **Power:** 82.3 mW ⚠️ Below 90mW threshold
- **Batch:** B-2024-X (known quality issue)
- **Recommended:** Replace crystal assembly

### 2. SCN-JP-005 (Renesas Naka)  
- **Power:** 78.9 mW ⚠️ Below 90mW threshold
- **Batch:** B-2024-X
- **Recommended:** Replace crystal assembly

### Root Cause
Both use crystals from **batch B-2024-X** with elevated sodium impurities (Service Bulletin SB-2024-0892).

**Action:** Ship replacement parts from Singapore Hub (2 in stock, lowest cost for Asia).`;
    }

    if (lowerMessage.includes('warning') && lowerMessage.includes('predict')) {
      return `## Warning Scanner Analysis

**5 scanners** currently in WARNING status (90-95mW):

| Scanner | Location | Power | Days to Critical |
|---------|----------|-------|------------------|
| SCN-TW-004 | TSMC Taichung | 91.2 mW | ~14 days |
| SCN-KR-004 | SK Hynix | 92.1 mW | ~21 days |
| SCN-US-003 | Intel Fab 42 | 91.8 mW | ~18 days |
| SCN-EU-004 | IMEC Leuven | 92.4 mW | ~25 days |
| SCN-TW-007 | TSMC Fab 12 | 91.5 mW | ~16 days |

### Prediction Model
Based on degradation rate of 0.3mW/day for B-2024-X batch:
- **SCN-TW-004** will reach critical first (~14 days)
- All 5 use batch B-2024-X crystals

### Recommendation
Schedule proactive replacements starting with TSMC Taichung.`;
    }
    
    if (lowerMessage.includes('inventory') || lowerMessage.includes('details')) {
      return `## Inventory Status: 994-023

| Warehouse | On Hand | In Transit | Backorder |
|-----------|---------|------------|-----------|
| KLA Tucson Hub | 3 | 1 | 0 |
| KLA San Jose HQ | 0 | 2 | 4 |
| KLA Singapore Hub | 2 | 0 | 0 |
| KLA Dresden Hub | 1 | 1 | 0 |

**Global Total:** 6 available, 4 in transit, 4 backordered

### Alerts
⚠️ **San Jose HQ** is out of stock with 4 units backordered
⚠️ **Dresden Hub** below reorder point (1 < 2)

### Recommendation
Transfer 1 unit from Tucson to San Jose to reduce backorder.`;
    }
    
    if (lowerMessage.includes('90mw') || lowerMessage.includes('power') || lowerMessage.includes('threshold')) {
      return `## 90mW Power Threshold

The **90mW threshold** is critical minimum for 193nm DUV lasers.

### Below Threshold Impact
- Pattern transfer precision compromised
- Wafer exposure times increase
- Production yield declines

### Current Fleet Status
- **2 scanners** CRITICAL (below 90mW)
- **5 scanners** WARNING (90-95mW)
- **35 scanners** NORMAL (>95mW)`;
    }
    
    if (lowerMessage.includes('b-2024-x') || lowerMessage.includes('batch')) {
      return `## Batch B-2024-X Analysis

**Service Bulletin SB-2024-0892**

Elevated sodium impurities (>50ppm vs <10ppm spec) causing accelerated crystal degradation.

### Affected Scanners: 7
| Scanner | Power | Status |
|---------|-------|--------|
| SCN-KR-001 | 82.3 mW | CRITICAL |
| SCN-JP-005 | 78.9 mW | CRITICAL |
| SCN-TW-004 | 91.2 mW | WARNING |
| SCN-KR-004 | 92.1 mW | WARNING |
| SCN-US-003 | 91.8 mW | WARNING |

**Action:** Replace all B-2024-X crystals proactively.`;
    }

    if (lowerMessage.includes('maintenance') || lowerMessage.includes('history')) {
      return `## Recent Maintenance

| Scanner | Date | Issue | Downtime |
|---------|------|-------|----------|
| SCN-KR-001 | Aug 15 | Low power | 8.5h |
| SCN-JP-005 | Aug 20 | Power drop | 12h |
| SCN-TW-004 | Sep 20 | Misalignment | 6h |

**Pattern:** 3 repairs involved B-2024-X batch crystals
**Avg Downtime:** 10.25 hours for crystal replacement`;
    }

    return `I can help with KLA scanner diagnostics:

- **"Show critical alerts"** - View urgent issues
- **"Analyze warning scanners"** - Predictive analysis
- **"Check inventory"** - Parts availability
- **"Ship part to SCN-KR-001"** - Create shipment

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
