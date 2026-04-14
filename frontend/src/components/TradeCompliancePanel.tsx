import { useState, useCallback, useEffect } from 'react';
import type { EscalationCase } from '../types';
import { useTheme } from '../context/ThemeContext';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GppBadIcon from '@mui/icons-material/GppBad';
import GppGoodIcon from '@mui/icons-material/GppGood';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

type WorkflowStep = 'part' | 'costs' | 'sla' | 'compliance' | 'result';

const PARTS = [
  { id: '994-023', name: 'NLO Harmonic Crystal Assembly', category: 'Laser Optics', cost: 45000 },
  { id: '994-024', name: 'LBO Frequency Doubler Crystal', category: 'Laser Optics', cost: 28000 },
  { id: '995-001', name: 'EUV Collector Mirror', category: 'EUV Optics', cost: 180000 },
  { id: '995-002', name: 'Tin Droplet Generator', category: 'EUV Source', cost: 95000 },
  { id: '996-001', name: 'Wafer Stage Interferometer', category: 'Metrology', cost: 35000 },
  { id: '997-001', name: 'Motion Controller PCB', category: 'Electronics', cost: 8500 },
];

const CUSTOMERS = [
  { name: 'Samsung', city: 'Pyeongtaek', country: 'South Korea', code: 'KOR' },
  { name: 'Renesas', city: 'Hitachinaka', country: 'Japan', code: 'JPN' },
  { name: 'TSMC', city: 'Taichung', country: 'Taiwan', code: 'TWN' },
  { name: 'SK Hynix', city: 'Icheon', country: 'South Korea', code: 'KOR' },
  { name: 'Intel', city: 'Chandler', country: 'USA', code: 'USA' },
  { name: 'SMIC', city: 'Shanghai', country: 'China', code: 'CN' },
  { name: 'Huawei Technologies', city: 'Shenzhen', country: 'China', code: 'CN' },
  { name: 'YMTC', city: 'Wuhan', country: 'China', code: 'CN' },
  { name: 'Russian Microelectronics', city: 'Moscow', country: 'Russia', code: 'RU' },
  { name: 'Baikal Electronics', city: 'Moscow', country: 'Russia', code: 'RU' },
];

const RESTRICTED_ENTITIES: Record<string, { level: string; list: string; reason: string }> = {
  'Huawei Technologies': { level: 'DENIED', list: 'US Entity List (BIS)', reason: 'License required for all items subject to EAR.' },
  'SMIC': { level: 'RESTRICTED', list: 'US Entity List (BIS)', reason: 'Foreign Direct Product Rule applies. EUV equipment prohibited.' },
  'YMTC': { level: 'DENIED', list: 'US Entity List (BIS)', reason: 'All semiconductor manufacturing equipment requires license.' },
  'Russian Microelectronics': { level: 'DENIED', list: 'OFAC SDN / BIS Entity List', reason: 'Comprehensive sanctions. All semi equipment exports prohibited.' },
  'Baikal Electronics': { level: 'RESTRICTED', list: 'BIS Entity List', reason: 'License required for semiconductor manufacturing equipment.' },
};

const RESTRICTED_REGIONS: Record<string, { type: string; categories: string; list: string }> = {
  'CN': { type: 'EXPORT_LICENSE_REQUIRED', categories: 'EUV Optics, EUV Source', list: 'BIS Oct 2022 Advanced Computing Rule' },
  'RU': { type: 'EMBARGO', categories: 'ALL', list: 'OFAC / BIS Comprehensive Sanctions' },
  'IR': { type: 'EMBARGO', categories: 'ALL', list: 'OFAC Comprehensive Sanctions' },
  'KP': { type: 'EMBARGO', categories: 'ALL', list: 'OFAC / UN Sanctions' },
  'BY': { type: 'EXPORT_LICENSE_REQUIRED', categories: 'ALL', list: 'BIS Entity List Expansion' },
};

const TARIFFS: Record<string, { rate: number; freight: number; fta?: string }> = {
  'USA-KOR': { rate: 0.08, freight: 4500 },
  'SGP-KOR': { rate: 0.00, freight: 1800, fta: 'ASEAN-Korea' },
  'USA-JPN': { rate: 0.05, freight: 4200 },
  'SGP-JPN': { rate: 0.00, freight: 2100, fta: 'CPTPP' },
  'USA-TWN': { rate: 0.06, freight: 4800 },
  'USA-USA': { rate: 0.00, freight: 400, fta: 'Domestic' },
  'USA-CN': { rate: 0.25, freight: 5200 },
  'USA-RU': { rate: 0.00, freight: 0 },
};

interface TradeCompliancePanelProps {
  onAskAI?: (prompt: string) => void;
  prefillPartId?: string;
  prefillCustomer?: string;
  prefillSlaHours?: number;
  selectedCase?: EscalationCase | null;
}

export function TradeCompliancePanel({ onAskAI, prefillPartId, prefillCustomer, prefillSlaHours, selectedCase }: TradeCompliancePanelProps) {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('part');
  const [selectedPartIdx, setSelectedPartIdx] = useState(0);
  const [selectedCustIdx, setSelectedCustIdx] = useState(0);
  const [slaHours, setSlaHours] = useState(48);
  const [complianceResult, setComplianceResult] = useState<{
    entityBlocked: boolean;
    regionBlocked: boolean;
    entityDetail?: { level: string; list: string; reason: string };
    regionDetail?: { type: string; categories: string; list: string };
    partCategoryBlocked: boolean;
  } | null>(null);

  useEffect(() => {
    if (prefillPartId) {
      const idx = PARTS.findIndex(p => p.id === prefillPartId);
      if (idx >= 0) setSelectedPartIdx(idx);
    }
    if (prefillCustomer) {
      const idx = CUSTOMERS.findIndex(c => c.name === prefillCustomer);
      if (idx >= 0) setSelectedCustIdx(idx);
    }
    if (prefillSlaHours !== undefined) {
      setSlaHours(Math.max(-120, Math.min(120, prefillSlaHours)));
    }
    if (selectedCase) {
      const neededPart = selectedCase.PARTS_NEEDED[0];
      if (neededPart) {
        const idx = PARTS.findIndex(p => p.id === neededPart);
        if (idx >= 0) setSelectedPartIdx(idx);
      }
      const custIdx = CUSTOMERS.findIndex(c => c.name === selectedCase.CUSTOMER);
      if (custIdx >= 0) setSelectedCustIdx(custIdx);
      setSlaHours(Math.max(-120, Math.min(120, selectedCase.SLA_REMAINING_HOURS)));
    }
  }, [prefillPartId, prefillCustomer, prefillSlaHours, selectedCase]);

  const part = PARTS[selectedPartIdx];
  const cust = CUSTOMERS[selectedCustIdx];

  const steps: { id: WorkflowStep; label: string; num: number }[] = [
    { id: 'part', label: 'Select Part & Dest', num: 1 },
    { id: 'costs', label: 'Review Costs', num: 2 },
    { id: 'sla', label: 'SLA Check', num: 3 },
    { id: 'compliance', label: 'Compliance Check', num: 4 },
    { id: 'result', label: 'Result', num: 5 },
  ];

  const stepIdx = steps.findIndex(s => s.id === currentStep);

  const costData = (() => {
    const key = `USA-${cust.code}`;
    const t = TARIFFS[key];
    if (!t) return { freight: 5000, duty: part.cost * 0.05, total: part.cost + 5000 + part.cost * 0.05, fta: undefined };
    const duty = part.cost * t.rate;
    return { freight: t.freight, duty, total: part.cost + t.freight + duty, fta: t.fta };
  })();

  const runComplianceCheck = useCallback(() => {
    const entityCheck = RESTRICTED_ENTITIES[cust.name];
    const regionCheck = RESTRICTED_REGIONS[cust.code];
    const partCategoryBlocked = regionCheck
      ? regionCheck.categories === 'ALL' || regionCheck.categories.split(', ').some(cat => part.category === cat)
      : false;

    const result = {
      entityBlocked: !!entityCheck,
      regionBlocked: !!regionCheck && partCategoryBlocked,
      entityDetail: entityCheck,
      regionDetail: regionCheck,
      partCategoryBlocked,
    };

    setComplianceResult(result);
    setCurrentStep('result');

    const blocked = (
      result.entityBlocked && result.entityDetail?.level === 'DENIED' ||
      result.regionBlocked && result.regionDetail?.type === 'EMBARGO'
    );
    if (blocked) {
      setShowBlockedModal(true);
    }
  }, [cust, part]);

  const isBlocked = complianceResult && (
    complianceResult.entityBlocked && complianceResult.entityDetail?.level === 'DENIED' ||
    complianceResult.regionBlocked && complianceResult.regionDetail?.type === 'EMBARGO'
  );

  const isRestricted = complianceResult && !isBlocked && (
    complianceResult.entityBlocked || complianceResult.regionBlocked
  );

  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const reset = () => {
    setCurrentStep('part');
    setComplianceResult(null);
    setShowBlockedModal(false);
  };

  const stepColor = (idx: number) => {
    if (idx < stepIdx) return colors.success;
    if (idx === stepIdx) return colors.accent;
    return colors.textDim;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 10px',
        background: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}`, flexShrink: 0,
      }}>
        {steps.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i < stepIdx ? colors.success : i === stepIdx ? colors.accent : colors.border,
              color: i <= stepIdx ? 'white' : colors.textDim, fontSize: '10px', fontWeight: 700,
              transition: 'all 0.3s',
            }}>
              {i < stepIdx ? <CheckCircleIcon style={{ fontSize: 14 }} /> : s.num}
            </div>
            <span style={{ fontSize: '10px', color: stepColor(i), fontWeight: i === stepIdx ? 700 : 400 }}>{s.label}</span>
            {i < steps.length - 1 && <ArrowForwardIcon style={{ fontSize: 12, color: colors.textDim, margin: '0 2px' }} />}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {currentStep === 'part' && (
          <div style={{ background: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}`, padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <VerifiedUserIcon style={{ fontSize: 18, color: colors.accent }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Step 1: Select Part & Destination</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '10px', color: colors.textMuted, marginBottom: '4px', fontWeight: 600 }}>PART</div>
                <select value={selectedPartIdx} onChange={e => setSelectedPartIdx(+e.target.value)}
                  style={{ width: '100%', padding: '8px', fontSize: '11px', borderRadius: '6px', background: colors.bgSecondary, color: colors.text, border: `1px solid ${colors.border}` }}>
                  {PARTS.map((p, i) => <option key={i} value={i}>{p.id} — {p.name}</option>)}
                </select>
                <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
                  Category: {part.category} | Unit cost: ${part.cost.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: colors.textMuted, marginBottom: '4px', fontWeight: 600 }}>DESTINATION CUSTOMER</div>
                <select value={selectedCustIdx} onChange={e => setSelectedCustIdx(+e.target.value)}
                  style={{ width: '100%', padding: '8px', fontSize: '11px', borderRadius: '6px', background: colors.bgSecondary, color: colors.text, border: `1px solid ${colors.border}` }}>
                  {CUSTOMERS.map((c, i) => <option key={i} value={i}>{c.name} — {c.city}, {c.country}</option>)}
                </select>
                <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
                  Country code: {cust.code}
                </div>
              </div>
            </div>
            <button onClick={() => setCurrentStep('costs')} style={{
              marginTop: '14px', padding: '8px 20px', borderRadius: '6px', border: 'none',
              background: colors.accent, color: 'white',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              Next: Review Costs <ArrowForwardIcon style={{ fontSize: 14 }} />
            </button>
          </div>
        )}

        {currentStep === 'costs' && (
          <div style={{ background: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}`, padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <VerifiedUserIcon style={{ fontSize: 18, color: colors.accent }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Step 2: Cost Review — {part.id} to {cust.city}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              {[
                { label: 'Unit Cost', value: `$${part.cost.toLocaleString()}` },
                { label: 'Freight', value: `$${costData.freight.toLocaleString()}` },
                { label: 'Import Duty', value: `$${costData.duty.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
                { label: 'Total Landed', value: `$${costData.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
              ].map(item => (
                <div key={item.label} style={{ background: colors.bgSecondary, borderRadius: '6px', padding: '10px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: colors.text }}>{item.value}</div>
                  <div style={{ fontSize: '9px', color: colors.textMuted, marginTop: '2px' }}>{item.label}</div>
                </div>
              ))}
            </div>
            {costData.fta && (
              <div style={{ fontSize: '11px', color: colors.success, background: colors.success + '15', padding: '6px 10px', borderRadius: '5px', marginBottom: '10px' }}>
                FTA applies: {costData.fta}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setCurrentStep('part')} style={{
                padding: '8px 16px', borderRadius: '6px', border: `1px solid ${colors.border}`,
                background: 'transparent', color: colors.text, fontSize: '12px', cursor: 'pointer',
              }}>Back</button>
              <button onClick={() => setCurrentStep('sla')} style={{
                padding: '8px 20px', borderRadius: '6px', border: 'none',
                background: colors.accent, color: 'white',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                Next: SLA Check <ArrowForwardIcon style={{ fontSize: 14 }} />
              </button>
            </div>
          </div>
        )}

        {currentStep === 'sla' && (
          <div style={{ background: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}`, padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <VerifiedUserIcon style={{ fontSize: 18, color: colors.accent }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Step 3: SLA Validation</span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '10px', color: colors.textMuted, marginBottom: '4px', fontWeight: 600 }}>SLA REMAINING (hours)</div>
              <input type="range" min={-120} max={120} step={1} value={slaHours}
                onChange={e => setSlaHours(+e.target.value)}
                style={{ width: '100%', cursor: 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '2px' }}>
                <span style={{ color: colors.critical }}>-120h (Breached)</span>
                <span style={{ color: slaHours < 0 ? colors.critical : slaHours < 24 ? colors.warning : colors.success, fontWeight: 700, fontSize: '14px' }}>
                  {slaHours}h
                </span>
                <span style={{ color: colors.success }}>+120h (Healthy)</span>
              </div>
            </div>
            {slaHours < 0 && (
              <div style={{ background: colors.critical + '15', border: `1px solid ${colors.critical}40`, borderRadius: '6px', padding: '8px 10px', marginBottom: '10px', fontSize: '11px', color: colors.critical, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <WarningAmberIcon style={{ fontSize: 16 }} />
                SLA BREACHED by {Math.abs(slaHours)} hours. Penalty accruing. Expedited shipment recommended.
              </div>
            )}
            {slaHours >= 0 && slaHours < 24 && (
              <div style={{ background: colors.warning + '15', border: `1px solid ${colors.warning}40`, borderRadius: '6px', padding: '8px 10px', marginBottom: '10px', fontSize: '11px', color: colors.warning, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <WarningAmberIcon style={{ fontSize: 16 }} />
                SLA at risk. Only {slaHours}h remaining. Consider expedited shipping.
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setCurrentStep('costs')} style={{
                padding: '8px 16px', borderRadius: '6px', border: `1px solid ${colors.border}`,
                background: 'transparent', color: colors.text, fontSize: '12px', cursor: 'pointer',
              }}>Back</button>
              <button onClick={() => setCurrentStep('compliance')} style={{
                padding: '8px 20px', borderRadius: '6px', border: 'none',
                background: colors.accent, color: 'white',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                Next: Compliance Check <ArrowForwardIcon style={{ fontSize: 14 }} />
              </button>
            </div>
          </div>
        )}

        {currentStep === 'compliance' && (
          <div style={{ background: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}`, padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <VerifiedUserIcon style={{ fontSize: 18, color: colors.accent }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Step 4: Export Compliance Screening</span>
            </div>
            <div style={{ background: colors.bgSecondary, borderRadius: '6px', padding: '10px', marginBottom: '12px', border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '11px', marginBottom: '4px' }}>
                <span style={{ color: colors.textMuted }}>Part:</span> <span style={{ fontWeight: 600 }}>{part.id} — {part.name}</span>
              </div>
              <div style={{ fontSize: '11px', marginBottom: '4px' }}>
                <span style={{ color: colors.textMuted }}>Category:</span> <span style={{ fontWeight: 600 }}>{part.category}</span>
              </div>
              <div style={{ fontSize: '11px', marginBottom: '4px' }}>
                <span style={{ color: colors.textMuted }}>Destination:</span> <span style={{ fontWeight: 600 }}>{cust.name} — {cust.city}, {cust.country} ({cust.code})</span>
              </div>
              <div style={{ fontSize: '11px' }}>
                <span style={{ color: colors.textMuted }}>Shipment Value:</span> <span style={{ fontWeight: 600 }}>${costData.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
            <div style={{ fontSize: '10px', color: colors.textMuted, marginBottom: '8px' }}>
              Screening against US Entity List (BIS), OFAC SDN List, and regional export control regulations.
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setCurrentStep('sla')} style={{
                padding: '8px 16px', borderRadius: '6px', border: `1px solid ${colors.border}`,
                background: 'transparent', color: colors.text, fontSize: '12px', cursor: 'pointer',
              }}>Back</button>
              <button onClick={runComplianceCheck} style={{
                padding: '8px 20px', borderRadius: '6px', border: 'none',
                background: colors.critical, color: 'white',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <VerifiedUserIcon style={{ fontSize: 14 }} /> Run Compliance Check
              </button>
            </div>
          </div>
        )}

        {currentStep === 'result' && complianceResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              background: isBlocked ? colors.critical + '10' : isRestricted ? colors.warning + '10' : colors.success + '10',
              borderRadius: '8px',
              border: `1px solid ${isBlocked ? colors.critical + '60' : isRestricted ? colors.warning + '60' : colors.success + '60'}`,
              padding: '14px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              {isBlocked ? (
                <BlockIcon style={{ fontSize: 36, color: colors.critical }} />
              ) : isRestricted ? (
                <GppBadIcon style={{ fontSize: 36, color: colors.warning }} />
              ) : (
                <GppGoodIcon style={{ fontSize: 36, color: colors.success }} />
              )}
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: isBlocked ? colors.critical : isRestricted ? colors.warning : colors.success }}>
                  {isBlocked ? 'SHIPMENT BLOCKED' : isRestricted ? 'LICENSE REQUIRED' : 'CLEARED FOR SHIPMENT'}
                </div>
                <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>
                  {isBlocked ? 'This shipment cannot proceed under current export control regulations.' :
                    isRestricted ? 'An export license must be obtained before shipment can proceed.' :
                      `${part.id} to ${cust.name} (${cust.city}) passes all compliance checks.`}
                </div>
              </div>
            </div>

            <div style={{ background: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}`, padding: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Screening Results</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: colors.bgSecondary, borderRadius: '5px', border: `1px solid ${colors.border}` }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600 }}>Entity Screening</div>
                    <div style={{ fontSize: '9px', color: colors.textMuted }}>{cust.name}</div>
                  </div>
                  {complianceResult.entityBlocked ? (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '3px',
                        background: complianceResult.entityDetail?.level === 'DENIED' ? colors.critical + '20' : colors.warning + '20',
                        color: complianceResult.entityDetail?.level === 'DENIED' ? colors.critical : colors.warning,
                      }}>
                        {complianceResult.entityDetail?.level}
                      </span>
                      <div style={{ fontSize: '8px', color: colors.textMuted, marginTop: '2px' }}>{complianceResult.entityDetail?.list}</div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: colors.success, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircleIcon style={{ fontSize: 14, color: colors.success }} /> CLEAR
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: colors.bgSecondary, borderRadius: '5px', border: `1px solid ${colors.border}` }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600 }}>Region Screening</div>
                    <div style={{ fontSize: '9px', color: colors.textMuted }}>{cust.country} ({cust.code})</div>
                  </div>
                  {complianceResult.regionBlocked ? (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '3px',
                        background: complianceResult.regionDetail?.type === 'EMBARGO' ? colors.critical + '20' : colors.warning + '20',
                        color: complianceResult.regionDetail?.type === 'EMBARGO' ? colors.critical : colors.warning,
                      }}>
                        {complianceResult.regionDetail?.type}
                      </span>
                      <div style={{ fontSize: '8px', color: colors.textMuted, marginTop: '2px' }}>{complianceResult.regionDetail?.list}</div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: colors.success, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircleIcon style={{ fontSize: 14, color: colors.success }} /> CLEAR
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: colors.bgSecondary, borderRadius: '5px', border: `1px solid ${colors.border}` }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600 }}>Part Category Check</div>
                    <div style={{ fontSize: '9px', color: colors.textMuted }}>{part.category}</div>
                  </div>
                  {complianceResult.partCategoryBlocked ? (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: colors.critical, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BlockIcon style={{ fontSize: 14 }} /> RESTRICTED
                    </span>
                  ) : (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: colors.success, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircleIcon style={{ fontSize: 14, color: colors.success }} /> CLEAR
                    </span>
                  )}
                </div>
              </div>
            </div>

            {complianceResult.entityBlocked && complianceResult.entityDetail && (
              <div style={{ background: colors.critical + '10', borderRadius: '8px', border: `1px solid ${colors.critical}30`, padding: '10px', fontSize: '11px' }}>
                <div style={{ fontWeight: 600, color: colors.critical, marginBottom: '4px' }}>Entity List Match Detail</div>
                <div style={{ color: colors.text }}>{complianceResult.entityDetail.reason}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={reset} style={{
                padding: '8px 20px', borderRadius: '6px', border: `1px solid ${colors.border}`,
                background: 'transparent', color: colors.text, fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              }}>
                New Check
              </button>
              {onAskAI && (
                <button onClick={() => onAskAI(`Compliance check result for ${part.id} (${part.category}) to ${cust.name} (${cust.city}, ${cust.country}): ${isBlocked ? 'BLOCKED' : isRestricted ? 'LICENSE REQUIRED' : 'CLEARED'}. Explain export control implications and next steps.`)}
                  style={{
                    padding: '8px 16px', borderRadius: '6px', border: `1px solid ${colors.accent}40`,
                    background: colors.accent + '10', color: colors.accent, fontSize: '11px', fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                  Ask AI About This Result
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showBlockedModal && complianceResult && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}
          onClick={() => setShowBlockedModal(false)}
        >
          <div style={{
            background: colors.bgSecondary,
            borderRadius: '16px',
            padding: '32px 40px',
            maxWidth: '520px',
            width: '90%',
            border: `2px solid ${colors.critical}`,
            boxShadow: `0 0 40px ${colors.critical}40, 0 8px 32px rgba(0,0,0,0.4)`,
            textAlign: 'center',
          }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: colors.critical + '20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <BlockIcon style={{ fontSize: 36, color: colors.critical }} />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: colors.critical, marginBottom: '8px', letterSpacing: '-0.5px' }}>
              EXPORT BLOCKED
            </div>
            <div style={{ fontSize: '14px', color: colors.text, marginBottom: '16px', lineHeight: 1.5 }}>
              Shipment of <strong>{part.id} — {part.name}</strong> to <strong>{cust.name}</strong> ({cust.city}, {cust.country}) is <span style={{ color: colors.critical, fontWeight: 700 }}>prohibited</span> under current export control regulations.
            </div>

            <div style={{
              background: colors.critical + '10',
              border: `1px solid ${colors.critical}30`,
              borderRadius: '10px',
              padding: '12px 16px',
              textAlign: 'left',
              marginBottom: '16px',
            }}>
              {complianceResult.entityDetail && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: colors.critical, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                    Entity List Match
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text }}>{complianceResult.entityDetail.list}</div>
                  <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>{complianceResult.entityDetail.reason}</div>
                </div>
              )}
              {complianceResult.regionDetail && (
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: colors.critical, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                    Regional Restriction
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text }}>{complianceResult.regionDetail.list}</div>
                  <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px' }}>Restricted categories: {complianceResult.regionDetail.categories}</div>
                </div>
              )}
            </div>

            <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '20px' }}>
              Contact the Export Compliance Office before proceeding. Reference: EAR §744 / OFAC 31 CFR 560
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowBlockedModal(false)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  background: 'transparent',
                  color: colors.text,
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Dismiss
              </button>
              {onAskAI && (
                <button
                  onClick={() => {
                    setShowBlockedModal(false);
                    onAskAI(`EXPORT BLOCKED: ${part.id} (${part.category}) to ${cust.name} (${cust.country}). Entity: ${complianceResult.entityDetail?.list || 'N/A'}. Region: ${complianceResult.regionDetail?.list || 'N/A'}. What are the legal implications and alternative options?`);
                  }}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: colors.accent,
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Ask AI for Alternatives
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
