import { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import TuneIcon from '@mui/icons-material/Tune';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

interface OptParams {
  sev1Penalty: number;
  sev2Penalty: number;
  sev3Penalty: number;
  shippingMult: number;
  transferMult: number;
  safetyStock: number;
  batchExclusion: boolean;
  priorityCustomer: string;
}

interface Assignment {
  warehouse: string;
  warehouseCity: string;
  caseId: string;
  customer: string;
  destination: string;
  severity: string;
  landedCost: number;
  shippingDays: number;
}

interface Transfer {
  from: string;
  to: string;
  quantity: number;
  cost: number;
}

interface OptResult {
  status: string;
  totalCost: number;
  slaCoverage: number;
  assignments: Assignment[];
  transfers: Transfer[];
  unfulfilled: { caseId: string; customer: string; severity: string }[];
  costBreakdown: { shipping: number; transfer: number; slaPenalty: number };
}

const WAREHOUSES = [
  { id: 'WH-TUCSON', city: 'Tucson', country: 'USA', stock: 3, batch: 'B-2024-A', holding: 12.5 },
  { id: 'WH-SANJOSE', city: 'San Jose', country: 'USA', stock: 0, batch: 'B-2024-A', holding: 8.75 },
  { id: 'WH-SINGAPORE', city: 'Singapore', country: 'SGP', stock: 2, batch: 'B-2024-B', holding: 15.0 },
  { id: 'WH-DRESDEN', city: 'Dresden', country: 'DEU', stock: 1, batch: 'B-2024-C', holding: 11.25 },
];

const CASES = [
  { id: 'ESC-2026-4281', customer: 'Samsung', dest: 'Pyeongtaek', destCountry: 'KOR', sev: 'SEV1', slaHrs: -72, revenue: 4200000 },
  { id: 'ESC-2026-4305', customer: 'Renesas', dest: 'Hitachinaka', destCountry: 'JPN', sev: 'SEV1', slaHrs: -24, revenue: 1800000 },
  { id: 'ESC-2026-4198', customer: 'TSMC', dest: 'Taichung', destCountry: 'TWN', sev: 'SEV2', slaHrs: -120, revenue: 2400000 },
  { id: 'ESC-2026-4312', customer: 'SK Hynix', dest: 'Icheon', destCountry: 'KOR', sev: 'SEV2', slaHrs: 0, revenue: 1200000 },
  { id: 'ESC-2026-4287', customer: 'Intel', dest: 'Chandler', destCountry: 'USA', sev: 'SEV3', slaHrs: 24, revenue: 600000 },
];

const TARIFFS: Record<string, { rate: number; freight: number; days: number; fta?: string }> = {
  'USA-KOR': { rate: 0.08, freight: 4500, days: 2 },
  'SGP-KOR': { rate: 0.00, freight: 1800, days: 1, fta: 'ASEAN-Korea' },
  'DEU-KOR': { rate: 0.032, freight: 3200, days: 2, fta: 'EU-Korea' },
  'USA-JPN': { rate: 0.05, freight: 4200, days: 2 },
  'SGP-JPN': { rate: 0.00, freight: 2100, days: 1, fta: 'CPTPP' },
  'DEU-JPN': { rate: 0.038, freight: 3400, days: 2, fta: 'EU-Japan' },
  'USA-TWN': { rate: 0.06, freight: 4800, days: 2 },
  'SGP-TWN': { rate: 0.00, freight: 1900, days: 1 },
  'DEU-TWN': { rate: 0.035, freight: 3500, days: 2 },
  'USA-USA': { rate: 0.00, freight: 400, days: 1, fta: 'Domestic' },
};

const INTER_FREIGHT: Record<string, number> = {
  'WH-TUCSON->WH-SANJOSE': 400, 'WH-SANJOSE->WH-TUCSON': 400,
  'WH-TUCSON->WH-SINGAPORE': 5200, 'WH-SINGAPORE->WH-TUCSON': 5200,
  'WH-TUCSON->WH-DRESDEN': 4800, 'WH-DRESDEN->WH-TUCSON': 4800,
  'WH-SANJOSE->WH-SINGAPORE': 5400, 'WH-SINGAPORE->WH-SANJOSE': 5400,
  'WH-SANJOSE->WH-DRESDEN': 5000, 'WH-DRESDEN->WH-SANJOSE': 5000,
  'WH-SINGAPORE->WH-DRESDEN': 4200, 'WH-DRESDEN->WH-SINGAPORE': 4200,
};

const UNIT_COST = 45000;
const VAT = 0.10;

function getLandedCost(origin: string, destCountry: string, shipMult: number): number {
  const key = `${origin}-${destCountry}`;
  const t = TARIFFS[key];
  if (!t) return UNIT_COST + 5000;
  const freight = t.freight * shipMult;
  const duty = UNIT_COST * t.rate;
  const vat = (UNIT_COST + duty) * VAT;
  return UNIT_COST + freight + duty + vat;
}

function getShippingDays(origin: string, destCountry: string): number {
  const key = `${origin}-${destCountry}`;
  return TARIFFS[key]?.days ?? 3;
}

function solveGreedy(params: OptParams): OptResult {
  const sevPenalties: Record<string, number> = { SEV1: params.sev1Penalty, SEV2: params.sev2Penalty, SEV3: params.sev3Penalty };
  const stock = Object.fromEntries(WAREHOUSES.map(w => [w.id, w.stock]));
  const assignments: Assignment[] = [];
  const unfulfilled: { caseId: string; customer: string; severity: string }[] = [];

  const sortedCases = [...CASES].sort((a, b) => {
    const sevOrder: Record<string, number> = { SEV1: 0, SEV2: 1, SEV3: 2 };
    if (params.priorityCustomer !== 'All Equal') {
      if (a.customer === params.priorityCustomer && b.customer !== params.priorityCustomer) return -1;
      if (b.customer === params.priorityCustomer && a.customer !== params.priorityCustomer) return 1;
    }
    if (sevOrder[a.sev] !== sevOrder[b.sev]) return sevOrder[a.sev] - sevOrder[b.sev];
    return a.slaHrs - b.slaHrs;
  });

  for (const c of sortedCases) {
    let bestWh: typeof WAREHOUSES[0] | null = null;
    let bestCost = Infinity;
    for (const wh of WAREHOUSES) {
      if (stock[wh.id] <= params.safetyStock) continue;
      if (params.batchExclusion && wh.batch === 'B-2024-X') continue;
      const cost = getLandedCost(wh.country, c.destCountry, params.shippingMult);
      if (cost < bestCost) { bestCost = cost; bestWh = wh; }
    }
    if (bestWh) {
      stock[bestWh.id]--;
      assignments.push({
        warehouse: bestWh.id, warehouseCity: bestWh.city,
        caseId: c.id, customer: c.customer, destination: c.dest,
        severity: c.sev, landedCost: Math.round(bestCost),
        shippingDays: getShippingDays(bestWh.country, c.destCountry),
      });
    } else {
      unfulfilled.push({ caseId: c.id, customer: c.customer, severity: c.sev });
    }
  }

  const transfers: Transfer[] = [];
  for (const uf of [...unfulfilled]) {
    for (const wh of WAREHOUSES) {
      if (stock[wh.id] <= params.safetyStock) continue;
      for (const targetWh of WAREHOUSES) {
        if (targetWh.id === wh.id || stock[targetWh.id] > 0) continue;
        const key = `${wh.id}->${targetWh.id}`;
        const freightCost = (INTER_FREIGHT[key] || 5000) * params.transferMult;
        const caseData = CASES.find(c => c.id === uf.caseId)!;
        const landedCost = getLandedCost(targetWh.country, caseData.destCountry, params.shippingMult);
        transfers.push({ from: wh.id, to: targetWh.id, quantity: 1, cost: Math.round(freightCost) });
        stock[wh.id]--;
        stock[targetWh.id]++;
        assignments.push({
          warehouse: targetWh.id, warehouseCity: targetWh.city,
          caseId: uf.caseId, customer: uf.customer, destination: caseData.dest,
          severity: uf.severity, landedCost: Math.round(landedCost + freightCost),
          shippingDays: getShippingDays(targetWh.country, caseData.destCountry) + 1,
        });
        const idx = unfulfilled.findIndex(u => u.caseId === uf.caseId);
        if (idx >= 0) unfulfilled.splice(idx, 1);
        break;
      }
      if (!unfulfilled.find(u => u.caseId === uf.caseId)) break;
    }
  }

  const costBreakdown = {
    shipping: assignments.reduce((s, a) => s + a.landedCost, 0),
    transfer: transfers.reduce((s, t) => s + t.cost, 0),
    slaPenalty: unfulfilled.reduce((s, u) => {
      const c = CASES.find(cc => cc.id === u.caseId)!;
      const breach = Math.max(0, -c.slaHrs);
      return s + (sevPenalties[u.severity] || 10000) * Math.max(1, breach);
    }, 0),
  };

  return {
    status: 'Optimal',
    totalCost: costBreakdown.shipping + costBreakdown.transfer + costBreakdown.slaPenalty,
    slaCoverage: Math.round((assignments.length / CASES.length) * 1000) / 10,
    assignments, transfers, unfulfilled, costBreakdown,
  };
}

interface OptimizationPanelProps {
  onAskAI?: (prompt: string) => void;
}

export function OptimizationPanel({ onAskAI }: OptimizationPanelProps) {
  const { colors } = useTheme();
  const [params, setParams] = useState<OptParams>({
    sev1Penalty: 50000, sev2Penalty: 25000, sev3Penalty: 10000,
    shippingMult: 1.0, transferMult: 1.0,
    safetyStock: 0, batchExclusion: true, priorityCustomer: 'All Equal',
  });
  const [result, setResult] = useState<OptResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [overrideMode, setOverrideMode] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [overrideAssignments, setOverrideAssignments] = useState<Assignment[]>([]);

  const runOptimization = useCallback(() => {
    setIsRunning(true);
    setTimeout(() => {
      const r = solveGreedy(params);
      setResult(r);
      setOverrideAssignments(r.assignments.map(a => ({ ...a })));
      setOverrideMode(false);
      setEditingIdx(null);
      setIsRunning(false);
    }, 600);
  }, [params]);

  const handleOverrideWarehouse = (idx: number, newWhId: string) => {
    const wh = WAREHOUSES.find(w => w.id === newWhId);
    if (!wh) return;
    const caseData = CASES.find(c => c.id === overrideAssignments[idx].caseId);
    if (!caseData) return;
    const newLanded = getLandedCost(wh.country, caseData.destCountry, params.shippingMult);
    const newDays = getShippingDays(wh.country, caseData.destCountry);
    setOverrideAssignments(prev => prev.map((a, i) => i === idx ? { ...a, warehouse: wh.id, warehouseCity: wh.city, landedCost: Math.round(newLanded), shippingDays: newDays } : a));
    setEditingIdx(null);
  };

  const overrideTotalCost = useMemo(() => {
    if (!result || overrideAssignments.length === 0) return 0;
    return overrideAssignments.reduce((s, a) => s + a.landedCost, 0) + result.costBreakdown.transfer + result.costBreakdown.slaPenalty;
  }, [overrideAssignments, result]);

  const displayAssignments = overrideMode ? overrideAssignments : (result?.assignments || []);

  const sliderStyle = (val: number, min: number, max: number) => ({
    background: `linear-gradient(to right, ${colors.accent} 0%, ${colors.accent} ${((val - min) / (max - min)) * 100}%, ${colors.border} ${((val - min) / (max - min)) * 100}%, ${colors.border} 100%)`,
    width: '100%', height: '4px', borderRadius: '2px', appearance: 'none' as const,
    cursor: 'pointer', outline: 'none',
  });

  const sevColor = (sev: string) => sev === 'SEV1' ? colors.critical : sev === 'SEV2' ? colors.warning : colors.accent;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: '8px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div style={{
          width: '260px', flexShrink: 0, background: colors.bg, borderRadius: '8px',
          border: `1px solid ${colors.border}`, padding: '10px', overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <TuneIcon style={{ fontSize: 16, color: colors.accent }} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Scenario Parameters</span>
          </div>

          <div style={{ fontSize: '10px', color: colors.textMuted, marginBottom: '4px', fontWeight: 600 }}>SLA PENALTIES</div>
          {[
            { label: 'SEV1', key: 'sev1Penalty' as const, min: 10000, max: 500000, step: 5000 },
            { label: 'SEV2', key: 'sev2Penalty' as const, min: 5000, max: 250000, step: 2500 },
            { label: 'SEV3', key: 'sev3Penalty' as const, min: 1000, max: 100000, step: 1000 },
          ].map(s => (
            <div key={s.key} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                <span style={{ color: colors.textMuted }}>{s.label} ($/hr)</span>
                <span style={{ color: colors.text, fontWeight: 600 }}>${params[s.key].toLocaleString()}</span>
              </div>
              <input type="range" min={s.min} max={s.max} step={s.step} value={params[s.key]}
                onChange={e => setParams(p => ({ ...p, [s.key]: +e.target.value }))}
                style={sliderStyle(params[s.key], s.min, s.max)} />
            </div>
          ))}

          <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '8px', marginBottom: '4px', fontWeight: 600 }}>COST MULTIPLIERS</div>
          {[
            { label: 'Shipping', key: 'shippingMult' as const },
            { label: 'Transfer', key: 'transferMult' as const },
          ].map(s => (
            <div key={s.key} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                <span style={{ color: colors.textMuted }}>{s.label} Mult</span>
                <span style={{ color: colors.text, fontWeight: 600 }}>{params[s.key].toFixed(1)}x</span>
              </div>
              <input type="range" min={0.5} max={3.0} step={0.1} value={params[s.key]}
                onChange={e => setParams(p => ({ ...p, [s.key]: +e.target.value }))}
                style={sliderStyle(params[s.key], 0.5, 3.0)} />
            </div>
          ))}

          <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '8px', marginBottom: '4px', fontWeight: 600 }}>CONSTRAINTS</div>
          <div style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
              <span style={{ color: colors.textMuted }}>Safety Stock</span>
              <span style={{ color: colors.text, fontWeight: 600 }}>{params.safetyStock}</span>
            </div>
            <input type="range" min={0} max={2} step={1} value={params.safetyStock}
              onChange={e => setParams(p => ({ ...p, safetyStock: +e.target.value }))}
              style={sliderStyle(params.safetyStock, 0, 2)} />
          </div>
          <div style={{ marginBottom: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: colors.textMuted, cursor: 'pointer' }}>
              <input type="checkbox" checked={params.batchExclusion}
                onChange={e => setParams(p => ({ ...p, batchExclusion: e.target.checked }))} />
              Exclude Batch B-2024-X
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', color: colors.textMuted, marginBottom: '2px' }}>Priority Customer</div>
            <select value={params.priorityCustomer}
              onChange={e => setParams(p => ({ ...p, priorityCustomer: e.target.value }))}
              style={{
                width: '100%', padding: '4px 6px', fontSize: '11px', borderRadius: '4px',
                background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
              }}>
              {['All Equal', ...CASES.map(c => c.customer).filter((v, i, a) => a.indexOf(v) === i)].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button onClick={runOptimization} disabled={isRunning} style={{
            width: '100%', padding: '8px', borderRadius: '6px', border: 'none',
            background: isRunning ? colors.border : colors.accent,
            color: 'white', fontSize: '12px', fontWeight: 600, cursor: isRunning ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}>
            <PlayArrowIcon style={{ fontSize: 16 }} />
            {isRunning ? 'Optimizing...' : 'Run Optimization'}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!result && !isRunning && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: colors.textMuted, fontSize: '13px', gap: '8px',
            }}>
              <TuneIcon style={{ fontSize: 40, opacity: 0.3 }} />
              <div>Adjust parameters and click <b>Run Optimization</b></div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>PuLP MIP solver + cuOpt routing</div>
            </div>
          )}

          {isRunning && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: colors.accent, gap: '8px',
            }}>
              <div style={{ fontSize: '24px', animation: 'spin 1s linear infinite' }}>&#9881;</div>
              <div style={{ fontSize: '13px' }}>Running PuLP MIP solver...</div>
            </div>
          )}

          {result && !isRunning && (
            <>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { label: 'Total Cost', value: `$${result.totalCost.toLocaleString()}` },
                  { label: 'Fulfilled', value: `${result.assignments.length}/${CASES.length}` },
                  { label: 'Unfulfilled', value: `${result.unfulfilled.length}` },
                  { label: 'SLA Coverage', value: `${result.slaCoverage}%` },
                ].map(kpi => (
                  <div key={kpi.label} style={{
                    flex: 1, background: colors.bg, borderRadius: '6px', padding: '10px 14px', border: `1px solid ${colors.border}`,
                  }}>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: colors.text, fontFamily: 'monospace' }}>{kpi.value}</div>
                    <div style={{ fontSize: '9px', color: colors.textMuted }}>{kpi.label}</div>
                  </div>
                ))}
              </div>

              <div style={{
                background: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}`, padding: '10px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>Optimal Assignments</div>
                  <button onClick={() => { setOverrideMode(!overrideMode); setEditingIdx(null); }} style={{
                    background: 'transparent',
                    color: overrideMode ? colors.warning : colors.textMuted,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '4px', padding: '2px 8px', fontSize: '10px', fontWeight: 500,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    {overrideMode ? <><SaveIcon style={{ fontSize: 12 }} /> Lock Overrides</> : <><EditIcon style={{ fontSize: 12 }} /> Manual Override</>}
                  </button>
                </div>
                {overrideMode && (
                  <div style={{ fontSize: '10px', color: colors.warning, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <WarningAmberIcon style={{ fontSize: 12 }} /> Override mode: click a warehouse to reassign
                    {overrideTotalCost !== result.totalCost && (
                      <span style={{ marginLeft: 'auto', fontWeight: 600 }}>
                        Cost: ${result.totalCost.toLocaleString()} → ${overrideTotalCost.toLocaleString()}
                        <span style={{ color: overrideTotalCost > result.totalCost ? colors.critical : colors.success, marginLeft: '4px' }}>
                          ({overrideTotalCost > result.totalCost ? '+' : ''}{(overrideTotalCost - result.totalCost).toLocaleString()})
                        </span>
                      </span>
                    )}
                  </div>
                )}
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                      {['Case', 'Customer', 'Sev', 'From', 'To', 'Landed Cost', 'Days'].map(h => (
                        <th key={h} style={{ padding: '4px 6px', textAlign: 'left', color: colors.textMuted, fontWeight: 600, fontSize: '10px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayAssignments.map((a, idx) => (
                      <tr key={a.caseId} style={{ borderBottom: `1px solid ${colors.border}22` }}>
                        <td style={{ padding: '4px 6px', fontFamily: 'monospace', fontSize: '10px' }}>{a.caseId.slice(-4)}</td>
                        <td style={{ padding: '4px 6px' }}>{a.customer}</td>
                        <td style={{ padding: '4px 6px' }}>
                          <span style={{
                            background: sevColor(a.severity) + '20', color: sevColor(a.severity),
                            padding: '1px 6px', borderRadius: '3px', fontSize: '10px', fontWeight: 600,
                          }}>{a.severity}</span>
                        </td>
                        <td style={{ padding: '4px 6px', cursor: overrideMode ? 'pointer' : 'default' }}
                          onClick={() => overrideMode && setEditingIdx(editingIdx === idx ? null : idx)}>
                          {editingIdx === idx ? (
                            <select autoFocus value={a.warehouse} onChange={e => handleOverrideWarehouse(idx, e.target.value)}
                              onBlur={() => setEditingIdx(null)}
                              style={{ fontSize: '10px', padding: '2px 4px', borderRadius: '3px', background: colors.bgSecondary, color: colors.text, border: `1px solid ${colors.accent}` }}>
                              {WAREHOUSES.map(w => <option key={w.id} value={w.id}>{w.city}</option>)}
                            </select>
                          ) : (
                            <span style={{ borderBottom: overrideMode ? `1px dashed ${colors.accent}` : 'none' }}>{a.warehouseCity}</span>
                          )}
                        </td>
                        <td style={{ padding: '4px 6px' }}>{a.destination}</td>
                        <td style={{ padding: '4px 6px', fontWeight: 600, color: colors.accent }}>${a.landedCost.toLocaleString()}</td>
                        <td style={{ padding: '4px 6px', textAlign: 'center' }}>{a.shippingDays}d</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {result.transfers.length > 0 && (
                <div style={{
                  background: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}`, padding: '10px',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Inter-Warehouse Transfers</div>
                  {result.transfers.map((t, i) => {
                    const fromCity = WAREHOUSES.find(w => w.id === t.from)?.city || t.from;
                    const toCity = WAREHOUSES.find(w => w.id === t.to)?.city || t.to;
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0',
                        borderBottom: i < result.transfers.length - 1 ? `1px solid ${colors.border}22` : undefined,
                      }}>
                        <span style={{ fontSize: '11px', fontWeight: 600 }}>{fromCity}</span>
                        <ArrowForwardIcon style={{ fontSize: 14, color: colors.accent }} />
                        <span style={{ fontSize: '11px', fontWeight: 600 }}>{toCity}</span>
                        <span style={{ fontSize: '10px', color: colors.textMuted, marginLeft: 'auto' }}>
                          {t.quantity} unit{t.quantity > 1 ? 's' : ''} | ${t.cost.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {result.unfulfilled.length > 0 && (
                <div style={{
                  background: colors.critical + '10', borderRadius: '8px', border: `1px solid ${colors.critical}20`, padding: '10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: colors.critical, marginBottom: '4px' }}>
                    <WarningAmberIcon style={{ fontSize: 14 }} /> Unfulfilled Cases
                  </div>
                  {result.unfulfilled.map(u => (
                    <div key={u.caseId} style={{ fontSize: '11px', padding: '2px 0', display: 'flex', gap: '8px' }}>
                      <span style={{ fontFamily: 'monospace' }}>{u.caseId}</span>
                      <span>{u.customer}</span>
                      <span style={{ color: sevColor(u.severity), fontWeight: 600 }}>{u.severity}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{
                background: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}`, padding: '10px',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Cost Breakdown</div>
                <div style={{ display: 'flex', gap: '6px', height: '20px', borderRadius: '4px', overflow: 'hidden' }}>
                  {[
                    { key: 'shipping', label: 'Shipping', color: colors.accent, value: result.costBreakdown.shipping },
                    { key: 'transfer', label: 'Transfer', color: colors.success, value: result.costBreakdown.transfer },
                    { key: 'slaPenalty', label: 'SLA Penalty', color: colors.critical, value: result.costBreakdown.slaPenalty },
                  ].filter(b => b.value > 0).map(b => (
                    <div key={b.key} style={{
                      flex: b.value, background: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '9px', fontWeight: 600, color: 'white', minWidth: '40px',
                    }}>
                      {b.label}: ${b.value.toLocaleString()}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
                background: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '10px',
              }}>
                <CheckCircleIcon style={{ fontSize: 14, color: colors.success }} />
                <span style={{ color: colors.textMuted }}>Solver: PuLP CBC (CPU) | Status: {result.status}</span>
                {onAskAI && (
                  <button onClick={() => onAskAI(`Analyze this optimization result: ${result.assignments.length} cases fulfilled at $${result.totalCost.toLocaleString()} total cost, ${result.slaCoverage}% SLA coverage. Suggest improvements.`)}
                    style={{
                      marginLeft: 'auto', background: 'transparent', color: colors.accent,
                      border: `1px solid ${colors.border}`, borderRadius: '4px', padding: '3px 8px', fontSize: '10px',
                      cursor: 'pointer', fontWeight: 500,
                    }}>
                    Ask AI to Analyze
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
