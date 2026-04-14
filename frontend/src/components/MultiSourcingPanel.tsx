import { useState, useMemo, useEffect } from 'react';
import type { EscalationCase } from '../types';
import { useTheme } from '../context/ThemeContext';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const PARTS = [
  { id: '994-023', name: 'NLO Harmonic Crystal Assembly', category: 'Laser Optics', cost: 45000 },
  { id: '994-024', name: 'LBO Frequency Doubler Crystal', category: 'Laser Optics', cost: 28000 },
  { id: '994-025', name: 'Beam Delivery Mirror Assembly', category: 'Laser Optics', cost: 12000 },
  { id: '994-026', name: 'Excimer Gas Mix Cylinder', category: 'Consumables', cost: 3500 },
  { id: '995-001', name: 'EUV Collector Mirror', category: 'EUV Optics', cost: 180000 },
  { id: '995-002', name: 'Tin Droplet Generator', category: 'EUV Source', cost: 95000 },
  { id: '996-001', name: 'Wafer Stage Interferometer', category: 'Metrology', cost: 35000 },
  { id: '996-002', name: 'Spectroscopic Ellipsometer Module', category: 'Metrology', cost: 52000 },
  { id: '997-001', name: 'Motion Controller PCB', category: 'Electronics', cost: 8500 },
  { id: '997-002', name: 'High-Speed Camera Module', category: 'Electronics', cost: 22000 },
  { id: '997-003', name: 'Vacuum Pump Assembly', category: 'Mechanical', cost: 15000 },
];

const SUBSTITUTIONS: Record<string, { subId: string; name: string; score: number; eco: string; ecoDate: string; models: string; costDelta: number; leadDelta: number; notes: string }[]> = {
  '994-023': [
    { subId: '994-023-R2', name: 'NLO Crystal Assembly Rev2', score: 0.95, eco: 'ECO-2024-0156', ecoDate: '2024-08-15', models: '39xx DUV, 29xx DUV', costDelta: 2500, leadDelta: -1, notes: 'Improved thermal stability, drop-in replacement' },
    { subId: '994-023-ALT', name: 'BBO Crystal Alternative', score: 0.82, eco: 'ECO-2024-0189', ecoDate: '2024-10-01', models: '39xx DUV only', costDelta: 5000, leadDelta: 2, notes: 'BBO-based, requires recalibration. Not for 29xx' },
  ],
  '994-024': [
    { subId: '994-024-R3', name: 'LBO Doubler Crystal Rev3', score: 0.98, eco: 'ECO-2024-0201', ecoDate: '2024-11-20', models: '39xx DUV, 29xx DUV', costDelta: 1200, leadDelta: 0, notes: 'Enhanced coating, extended lifetime. Direct swap.' },
  ],
  '995-001': [
    { subId: '995-001-B', name: 'EUV Collector Mirror Type B', score: 0.90, eco: 'ECO-2024-0178', ecoDate: '2024-09-10', models: 'EUV 7xx', costDelta: -5000, leadDelta: 5, notes: 'Alt reflective coating, 90% compat. Longer lead.' },
  ],
  '996-001': [
    { subId: '996-001-V2', name: 'Interferometer V2', score: 0.97, eco: 'ECO-2025-0012', ecoDate: '2025-01-15', models: '39xx, 29xx, Metrology 8xx', costDelta: 3000, leadDelta: 1, notes: 'Updated firmware, improved accuracy at 193nm' },
  ],
  '997-001': [
    { subId: '997-001-FPGA', name: 'Motion Controller (FPGA)', score: 0.88, eco: 'ECO-2024-0210', ecoDate: '2024-12-01', models: '39xx DUV', costDelta: 4500, leadDelta: 3, notes: 'FPGA-based, faster response. Requires firmware flash.' },
  ],
  '997-002': [
    { subId: '997-002-HD', name: 'Camera Module HD', score: 0.93, eco: 'ECO-2025-0008', ecoDate: '2025-01-10', models: '39xx DUV, 29xx DUV', costDelta: 6000, leadDelta: 2, notes: 'Higher resolution. Requires updated image pipeline.' },
  ],
  '994-025': [
    { subId: '994-025-CU', name: 'Mirror Assembly (Cu-coated)', score: 0.91, eco: 'ECO-2024-0195', ecoDate: '2024-10-20', models: '39xx DUV', costDelta: -1000, leadDelta: 0, notes: 'Copper-coated, lower cost, slightly lower reflectivity' },
  ],
};

const WAREHOUSES = [
  { id: 'WH-TUCSON', city: 'Tucson', country: 'USA', countryCode: 'USA' },
  { id: 'WH-SANJOSE', city: 'San Jose', country: 'USA', countryCode: 'USA' },
  { id: 'WH-SINGAPORE', city: 'Singapore', country: 'Singapore', countryCode: 'SGP' },
  { id: 'WH-DRESDEN', city: 'Dresden', country: 'Germany', countryCode: 'DEU' },
];

const DESTINATIONS = [
  { city: 'Pyeongtaek', country: 'Korea', code: 'KOR', customer: 'Samsung' },
  { city: 'Hitachinaka', country: 'Japan', code: 'JPN', customer: 'Renesas' },
  { city: 'Taichung', country: 'Taiwan', code: 'TWN', customer: 'TSMC' },
  { city: 'Icheon', country: 'Korea', code: 'KOR', customer: 'SK Hynix' },
  { city: 'Chandler', country: 'USA', code: 'USA', customer: 'Intel' },
];

const TARIFFS: Record<string, { rate: number; freight: number; days: number; fta?: string }> = {
  'USA-KOR': { rate: 0.08, freight: 4500, days: 2 },
  'SGP-KOR': { rate: 0.00, freight: 1800, days: 1, fta: 'ASEAN-Korea' },
  'DEU-KOR': { rate: 0.032, freight: 3200, days: 2, fta: 'EU-Korea' },
  'USA-JPN': { rate: 0.05, freight: 4200, days: 2 },
  'SGP-JPN': { rate: 0.00, freight: 2100, days: 1, fta: 'CPTPP' },
  'DEU-JPN': { rate: 0.038, freight: 3400, days: 2, fta: 'EU-Japan' },
  'USA-TWN': { rate: 0.06, freight: 4800, days: 2 },
  'SGP-TWN': { rate: 0.00, freight: 1900, days: 1, fta: 'ASEAN-Taiwan' },
  'DEU-TWN': { rate: 0.035, freight: 3500, days: 2 },
  'USA-USA': { rate: 0.00, freight: 400, days: 1, fta: 'Domestic' },
  'SGP-SGP': { rate: 0.00, freight: 200, days: 0, fta: 'Domestic' },
  'DEU-DEU': { rate: 0.00, freight: 250, days: 0, fta: 'Domestic' },
};

const VAT = 0.10;

function calcLandedCost(unitCost: number, originCode: string, destCode: string) {
  const key = `${originCode}-${destCode}`;
  const t = TARIFFS[key];
  if (!t) return { total: unitCost + 5000, freight: 5000, duty: 0, vat: unitCost * VAT, fta: undefined, days: 3 };
  const freight = t.freight;
  const duty = unitCost * t.rate;
  const vat = (unitCost + duty) * VAT;
  return { total: unitCost + freight + duty + vat, freight, duty, vat, fta: t.fta, days: t.days };
}

interface MultiSourcingPanelProps {
  onAskAI?: (prompt: string) => void;
  selectedCase?: EscalationCase | null;
  onProceedToCompliance?: (partId: string, destCustomer: string, destCode: string, landedCost: number) => void;
}

export function MultiSourcingPanel({ onAskAI, selectedCase, onProceedToCompliance }: MultiSourcingPanelProps) {
  const { colors } = useTheme();
  const [selectedPartId, setSelectedPartId] = useState('994-023');
  const [selectedDest, setSelectedDest] = useState(0);
  const [showSubstitutes, setShowSubstitutes] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCase) return;
    const neededPart = selectedCase.PARTS_NEEDED[0];
    if (neededPart) {
      const match = PARTS.find(p => p.id === neededPart);
      if (match) setSelectedPartId(match.id);
    }
    const custName = selectedCase.CUSTOMER;
    const destIdx = DESTINATIONS.findIndex(d => d.customer === custName);
    if (destIdx >= 0) setSelectedDest(destIdx);
    setSelectedSubId(null);
    setShowSubstitutes(false);
  }, [selectedCase]);

  const part = PARTS.find(p => p.id === selectedPartId)!;
  const dest = DESTINATIONS[selectedDest];
  const subs = SUBSTITUTIONS[selectedPartId] || [];

  const activePart = useMemo(() => {
    if (selectedSubId) {
      const sub = subs.find(s => s.subId === selectedSubId);
      if (sub) return { id: sub.subId, name: sub.name, cost: part.cost + sub.costDelta };
    }
    return part;
  }, [selectedPartId, selectedSubId, part, subs]);

  const costComparison = useMemo(() => {
    return WAREHOUSES.map(wh => {
      const lc = calcLandedCost(activePart.cost, wh.countryCode, dest.code);
      return { ...wh, ...lc };
    }).sort((a, b) => a.total - b.total);
  }, [activePart, dest]);

  const bestOption = costComparison[0];
  const worstOption = costComparison[costComparison.length - 1];
  const savings = worstOption.total - bestOption.total;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', color: colors.textMuted, marginBottom: '2px', fontWeight: 600 }}>PART</div>
          <select value={selectedPartId} onChange={e => { setSelectedPartId(e.target.value); setSelectedSubId(null); setShowSubstitutes(false); }}
            style={{ width: '100%', padding: '6px 8px', fontSize: '11px', borderRadius: '6px', background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
            {PARTS.map(p => <option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', color: colors.textMuted, marginBottom: '2px', fontWeight: 600 }}>DESTINATION</div>
          <select value={selectedDest} onChange={e => setSelectedDest(+e.target.value)}
            style={{ width: '100%', padding: '6px 8px', fontSize: '11px', borderRadius: '6px', background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
            {DESTINATIONS.map((d, i) => <option key={i} value={i}>{d.customer} — {d.city}, {d.country}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { label: 'Best Landed Cost', value: `$${bestOption.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: `from ${bestOption.city}` },
              { label: 'Potential Savings', value: `$${savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: 'vs worst option' },
              { label: 'FTA Available', value: costComparison.filter(c => c.fta && c.fta !== 'Domestic').length.toString(), sub: 'corridors with FTA' },
            ].map(kpi => (
              <div key={kpi.label} style={{ flex: 1, background: colors.bg, borderRadius: '6px', padding: '8px 12px', border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: colors.text, fontFamily: 'monospace' }}>{kpi.value}</div>
                <div style={{ fontSize: '9px', color: colors.textMuted }}>{kpi.label}</div>
                <div style={{ fontSize: '8px', color: colors.textDim }}>{kpi.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ background: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}`, padding: '10px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              Landed Cost Comparison — {activePart.id} to {dest.city}
            </div>
            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  {['Origin', 'Unit Cost', 'Freight', 'Duty', 'VAT', 'Landed Cost', 'Days', 'FTA'].map(h => (
                    <th key={h} style={{ padding: '4px 6px', textAlign: h === 'FTA' ? 'center' : 'right', color: colors.textMuted, fontWeight: 600, fontSize: '10px' }}>
                      {h === 'Origin' ? <span style={{ textAlign: 'left' }}>{h}</span> : h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {costComparison.map((row, i) => (
                  <tr key={row.id} style={{
                    borderBottom: `1px solid ${colors.border}22`,
                    background: i === 0 ? colors.accent + '10' : undefined,
                  }}>
                    <td style={{ padding: '5px 6px', textAlign: 'left', fontWeight: i === 0 ? 600 : 400 }}>{row.city}, {row.country}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'right', fontFamily: 'monospace', fontSize: '10px' }}>${activePart.cost.toLocaleString()}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'right', fontFamily: 'monospace', fontSize: '10px' }}>${row.freight.toLocaleString()}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'right', fontFamily: 'monospace', fontSize: '10px', color: row.duty > 0 ? colors.warning : colors.textMuted }}>
                      ${row.duty.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td style={{ padding: '5px 6px', textAlign: 'right', fontFamily: 'monospace', fontSize: '10px' }}>${row.vat.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'right', fontFamily: 'monospace', fontSize: '10px', fontWeight: 700, color: i === 0 ? colors.accent : colors.text }}>
                      ${row.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td style={{ padding: '5px 6px', textAlign: 'right' }}>{row.days}d</td>
                    <td style={{ padding: '5px 6px', textAlign: 'center' }}>
                      {row.fta ? (
                        <span style={{ background: colors.accent + '12', color: colors.accent, padding: '1px 6px', borderRadius: '3px', fontSize: '9px', fontWeight: 500 }}>
                          {row.fta}
                        </span>
                      ) : (
                        <span style={{ color: colors.textDim, fontSize: '9px' }}>None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {onAskAI && (
            <button onClick={() => onAskAI(`Compare sourcing options for part ${activePart.id} shipping to ${dest.city}, ${dest.country}. Best option is ${bestOption.city} at $${bestOption.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Savings of $${savings.toLocaleString(undefined, { maximumFractionDigits: 0 })} vs worst. Analyze FTA impact and recommend.`)}
              style={{
                padding: '6px 12px', borderRadius: '6px', border: `1px solid ${colors.border}`,
                background: 'transparent', color: colors.accent, fontSize: '11px', fontWeight: 500,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-start',
              }}>
              <SearchIcon style={{ fontSize: 14 }} /> Ask AI to Analyze
            </button>
          )}
          {onProceedToCompliance && (
            <button onClick={() => onProceedToCompliance(activePart.id, dest.customer, dest.code, bestOption.total)}
              style={{
                padding: '6px 12px', borderRadius: '6px', border: `1px solid ${colors.border}`,
                background: 'transparent', color: colors.text, fontSize: '11px', fontWeight: 500,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-start',
              }}>
              <CheckCircleIcon style={{ fontSize: 14 }} /> Proceed to Compliance
            </button>
          )}
        </div>

        <div style={{
          width: '280px', flexShrink: 0, background: colors.bg, borderRadius: '8px',
          border: `1px solid ${colors.border}`, padding: '10px', overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <SwapHorizIcon style={{ fontSize: 16, color: colors.accent }} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Part Substitutions</span>
          </div>

          {subs.length === 0 ? (
            <div style={{ fontSize: '11px', color: colors.textMuted, textAlign: 'center', padding: '20px 0' }}>
              <InfoOutlinedIcon style={{ fontSize: 24, opacity: 0.3, display: 'block', margin: '0 auto 6px' }} />
              No ECO-approved substitutes for this part
            </div>
          ) : (
            <>
              <button onClick={() => { setShowSubstitutes(!showSubstitutes); if (showSubstitutes) setSelectedSubId(null); }}
                style={{
                  width: '100%', padding: '6px', borderRadius: '5px', border: `1px solid ${colors.border}`,
                  background: showSubstitutes ? colors.accent + '15' : 'transparent', color: colors.text,
                  fontSize: '10px', cursor: 'pointer', marginBottom: '8px', fontWeight: 600,
                }}>
                {showSubstitutes ? 'Hide Substitutes' : `Show ${subs.length} Substitute${subs.length > 1 ? 's' : ''}`}
              </button>

              {showSubstitutes && subs.map(sub => (
                <div key={sub.subId}
                  onClick={() => setSelectedSubId(selectedSubId === sub.subId ? null : sub.subId)}
                  style={{
                    background: selectedSubId === sub.subId ? colors.accent + '15' : colors.bgSecondary,
                    border: `1px solid ${selectedSubId === sub.subId ? colors.accent : colors.border}`,
                    borderRadius: '6px', padding: '8px', marginBottom: '6px', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'monospace' }}>{sub.subId}</span>
                    <span style={{
                      fontSize: '9px', fontWeight: 600, padding: '1px 5px', borderRadius: '3px',
                      background: sub.score >= 0.95 ? colors.success + '15' : sub.score >= 0.90 ? colors.warning + '15' : colors.critical + '15',
                      color: sub.score >= 0.95 ? colors.success : sub.score >= 0.90 ? colors.warning : colors.critical,
                    }}>
                      {(sub.score * 100).toFixed(0)}% match
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: colors.text, marginBottom: '4px' }}>{sub.name}</div>
                  <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '2px' }}>
                    ECO: {sub.eco} ({sub.ecoDate})
                  </div>
                  <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '4px' }}>
                    Models: {sub.models}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '9px' }}>
                    <span style={{ color: sub.costDelta > 0 ? colors.warning : colors.success }}>
                      Cost: {sub.costDelta > 0 ? '+' : ''}${sub.costDelta.toLocaleString()}
                    </span>
                    <span style={{ color: sub.leadDelta > 0 ? colors.warning : sub.leadDelta < 0 ? colors.success : colors.textMuted }}>
                      Lead: {sub.leadDelta > 0 ? '+' : ''}{sub.leadDelta}d
                    </span>
                  </div>
                  {selectedSubId === sub.subId && (
                    <div style={{
                      marginTop: '6px', paddingTop: '6px', borderTop: `1px solid ${colors.border}`,
                      fontSize: '9px', color: colors.textMuted, lineHeight: 1.4,
                    }}>
                      {sub.notes}
                      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {sub.score >= 0.95 ? (
                          <><CheckCircleIcon style={{ fontSize: 12, color: colors.success }} /> <span style={{ color: colors.success }}>Drop-in compatible</span></>
                        ) : (
                          <><WarningAmberIcon style={{ fontSize: 12, color: colors.warning }} /> <span style={{ color: colors.warning }}>Recalibration may be required</span></>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
