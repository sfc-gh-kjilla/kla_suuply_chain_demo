import { useState, useCallback, useEffect } from 'react';
import type { EscalationCase } from '../types';
import { useTheme } from '../context/ThemeContext';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GppBadIcon from '@mui/icons-material/GppBad';
import GppGoodIcon from '@mui/icons-material/GppGood';

type WorkflowStep = 'part' | 'exportControl' | 'result';

const PARTS = [
  { id: '994-023', name: 'NLO Harmonic Crystal Assembly', category: 'Laser Optics', cost: 45000, eccn: '6A005.a', earControl: 'Dual-Use (EAR)', licenseNote: 'NS1, AT1' },
  { id: '994-024', name: 'LBO Frequency Doubler Crystal', category: 'Laser Optics', cost: 28000, eccn: '6A005.d', earControl: 'Dual-Use (EAR)', licenseNote: 'NS1' },
  { id: '995-001', name: 'EUV Collector Mirror', category: 'EUV Optics', cost: 180000, eccn: '3B001.f', earControl: 'Dual-Use (EAR) — Enhanced Controls', licenseNote: 'NS1, AT1, RS' },
  { id: '995-002', name: 'Tin Droplet Generator', category: 'EUV Source', cost: 95000, eccn: '3B001.a', earControl: 'Dual-Use (EAR) — Enhanced Controls', licenseNote: 'NS1, AT1' },
  { id: '996-001', name: 'Wafer Stage Interferometer', category: 'Metrology', cost: 35000, eccn: '3B002.a', earControl: 'Dual-Use (EAR)', licenseNote: 'NS2, AT1' },
  { id: '997-001', name: 'Motion Controller PCB', category: 'Electronics', cost: 8500, eccn: '3A002.g', earControl: 'Dual-Use (EAR)', licenseNote: 'NS2' },
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

const DEST_CONTROLS: Record<string, { tier: string; colorKey: 'success' | 'warning' | 'critical'; description: string; licenseStatus: string }> = {
  'KOR': { tier: 'GROUP A — TIER 1', colorKey: 'success', description: 'South Korea is a Tier 1 STA country. Strategic Trade Authorization (STA) license exception applies for most CCL items. FTA in effect.', licenseStatus: 'STA / NLR (No License Required)' },
  'JPN': { tier: 'GROUP A — TIER 1', colorKey: 'success', description: 'Japan is a Tier 1 STA country and CPTPP member. License exception STA applies. Minimal restrictions for semiconductor equipment.', licenseStatus: 'STA / NLR (No License Required)' },
  'TWN': { tier: 'GROUP A — TIER 1', colorKey: 'success', description: 'Taiwan is a Tier 1 STA country. License exception STA available. Treated equivalently to close allies for most dual-use exports.', licenseStatus: 'STA / NLR (No License Required)' },
  'BEL': { tier: 'GROUP A — EU MEMBER', colorKey: 'success', description: 'Belgium is an EU member and NATO ally. STA license exception available. EU dual-use regulation 2021/821 applies domestically.', licenseStatus: 'STA / NLR (No License Required)' },
  'USA': { tier: 'DOMESTIC', colorKey: 'success', description: 'Domestic shipment within the United States. No export license required. EAR Part 740 domestic transfer rules apply.', licenseStatus: 'N/A — Domestic Transfer' },
  'CN': { tier: 'ENHANCED CONTROLS', colorKey: 'warning', description: 'China subject to Oct 2022 BIS Advanced Computing & Semiconductor Rule. Items classified 3B001 require license. EUV-related items face presumption of denial.', licenseStatus: 'License Required (3B001 / EUV items)' },
  'RU': { tier: 'PROHIBITED — EMBARGO', colorKey: 'critical', description: 'Russia subject to comprehensive OFAC / BIS sanctions since Feb 2022. All semiconductor manufacturing equipment exports prohibited. No license exceptions available.', licenseStatus: 'Prohibited — No License Available' },
  'IR': { tier: 'PROHIBITED — EMBARGO', colorKey: 'critical', description: 'Iran under comprehensive OFAC sanctions (31 CFR Part 560). All US-origin goods and technology prohibited without OFAC authorization.', licenseStatus: 'Prohibited — No License Available' },
  'KP': { tier: 'PROHIBITED — EMBARGO', colorKey: 'critical', description: 'North Korea under comprehensive OFAC sanctions and UN Security Council resolutions. All exports/reexports prohibited.', licenseStatus: 'Prohibited — No License Available' },
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
  onProceedToCost?: () => void;
  prefillPartId?: string;
  prefillCustomer?: string;
  prefillSlaHours?: number;
  selectedCase?: EscalationCase | null;
}

export function TradeCompliancePanel({ onAskAI, onProceedToCost, prefillPartId, prefillCustomer, selectedCase }: TradeCompliancePanelProps) {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('part');
  const [selectedPartIdx, setSelectedPartIdx] = useState(0);
  const [selectedCustIdx, setSelectedCustIdx] = useState(0);
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
    if (selectedCase) {
      const neededPart = selectedCase.PARTS_NEEDED[0];
      if (neededPart) {
        const idx = PARTS.findIndex(p => p.id === neededPart);
        if (idx >= 0) setSelectedPartIdx(idx);
      }
      const custIdx = CUSTOMERS.findIndex(c => c.name === selectedCase.CUSTOMER);
      if (custIdx >= 0) setSelectedCustIdx(custIdx);
    }
  }, [prefillPartId, prefillCustomer, selectedCase]);

  const part = PARTS[selectedPartIdx];
  const cust = CUSTOMERS[selectedCustIdx];

  const steps: { id: WorkflowStep; label: string; num: number }[] = [
    { id: 'part', label: 'Select Part & Dest', num: 1 },
    { id: 'exportControl', label: 'Export Control', num: 2 },
    { id: 'result', label: 'Result', num: 3 },
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
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setCurrentStep('exportControl')} style={{
                  padding: '8px 20px', borderRadius: '6px', border: 'none',
                  background: colors.accent, color: 'white',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  Next: Export Control <ArrowForwardIcon style={{ fontSize: 14 }} />
                </button>
              </div>
              {onAskAI && (
                <button onClick={() => onAskAI(
                  `Please explain the following US export control terms and how they apply to semiconductor manufacturing equipment like KLA parts:\n\n` +
                  `REGULATORY FRAMEWORKS:\n` +
                  `• EAR (Export Administration Regulations) — Commerce/BIS rules for dual-use items via ECCN codes on the Commerce Control List. Violations: up to $1M per incident or 20 years imprisonment.\n` +
                  `• ITAR (International Traffic in Arms Regulations) — State/DDTC rules for defense articles on the USML. Stricter than EAR; once ITAR-controlled, always ITAR.\n` +
                  `• BIS (Bureau of Industry and Security) — administers EAR, maintains the Entity List.\n` +
                  `• OFAC (Office of Foreign Assets Control) — administers economic sanctions (SDN List, embargoes).\n\n` +
                  `ECCN CODES IN USE:\n` +
                  `• 3B001.f — EUV Collector Mirror (semiconductor lithography equipment, highest control tier)\n` +
                  `• 3B001.a — Tin Droplet Generator (semiconductor manufacturing equipment)\n` +
                  `• 3B002.a — Wafer Stage Interferometer (metrology equipment)\n` +
                  `• 3A002.g — Motion Controller PCB (electronic test/measurement)\n` +
                  `• 6A005.a — NLO Harmonic Crystal Assembly (high-power lasers)\n` +
                  `• 6A005.d — LBO Frequency Doubler Crystal (optical components for lasers)\n\n` +
                  `REASONS FOR CONTROL:\n` +
                  `• NS1 (National Security 1) — highest tier, requires license to most non-allied destinations\n` +
                  `• NS2 (National Security 2) — lower tier, fewer restrictions\n` +
                  `• AT1 (Anti-Terrorism 1) — applies to embargoed countries\n` +
                  `• RS (Regional Stability) — items that could destabilize a region (EUV equipment for China)\n\n` +
                  `LICENSE TYPES & EXCEPTIONS:\n` +
                  `• NLR (No License Required) — default for friendly countries qualifying for exceptions\n` +
                  `• STA (Strategic Trade Authorization) — license exception for Group A Tier 1 allied countries\n` +
                  `• License Required — formal BIS application required (weeks to process); EUV to China = presumption of denial\n` +
                  `• No License Available — embargoed countries (Russia, Iran, North Korea)\n\n` +
                  `DESTINATION TIERS:\n` +
                  `• Group A Tier 1 (South Korea, Japan, Taiwan) — STA exception available\n` +
                  `• Group A EU Member (Belgium) — STA available, EU dual-use regulation 2021/821 also applies\n` +
                  `• Domestic (USA) — no export control, EAR Part 740 domestic transfer rules\n` +
                  `• Enhanced Controls (China) — Oct 2022 BIS Advanced Computing Rule; 3B001 items require license\n` +
                  `• Prohibited Embargo (Russia, Iran, North Korea) — comprehensive sanctions, no licenses available\n\n` +
                  `SCREENING LISTS:\n` +
                  `• US Entity List (BIS) — requires license for ANY US-origin item to listed companies (Huawei, SMIC, YMTC)\n` +
                  `• OFAC SDN List — blocked persons/entities; US persons prohibited from dealing with them\n` +
                  `• OFAC Comprehensive Sanctions — country-wide prohibitions\n\n` +
                  `ENTITY STATUS LEVELS:\n` +
                  `• DENIED — export prohibited, no license granted (Huawei, YMTC, Russian Microelectronics)\n` +
                  `• RESTRICTED — license required but may be grantable (SMIC, Baikal Electronics)\n\n` +
                  `Please explain these terms in plain language, give examples of how they interact, and describe what a compliance officer should check before approving a shipment of KLA semiconductor equipment.`
                )} style={{
                  padding: '7px 16px', borderRadius: '6px', border: `1px solid ${colors.accent}40`,
                  background: colors.accent + '10', color: colors.accent, fontSize: '11px', fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content',
                }}>
                  <VerifiedUserIcon style={{ fontSize: 13 }} /> Ask AI — Explain Export Control Terms
                </button>
              )}
            </div>
          </div>
        )}

        {currentStep === 'exportControl' && (
          <div style={{ background: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}`, padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <VerifiedUserIcon style={{ fontSize: 18, color: colors.accent }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Step 2: Export Control Check</span>
            </div>

            {/* Educational info */}
            <div style={{ background: colors.accent + '10', borderRadius: '6px', padding: '10px 12px', border: `1px solid ${colors.accent}30` }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: colors.accent, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>About US Export Controls</div>
              <div style={{ fontSize: '11px', color: colors.text, lineHeight: 1.6, marginBottom: '8px' }}>
                US export controls govern the transfer of sensitive technology and equipment to foreign parties. Two primary frameworks apply to semiconductor manufacturing equipment:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: colors.bgSecondary, borderRadius: '5px', padding: '8px', border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: colors.text, marginBottom: '3px' }}>EAR — Export Administration Regulations</div>
                  <div style={{ fontSize: '10px', color: colors.textMuted, lineHeight: 1.5 }}>
                    Administered by BIS (Commerce Dept.). Covers dual-use items via ECCN codes on the Commerce Control List. Most semiconductor equipment falls under EAR. Violations: up to $1M per incident or 20 years imprisonment.
                  </div>
                </div>
                <div style={{ background: colors.bgSecondary, borderRadius: '5px', padding: '8px', border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: colors.text, marginBottom: '3px' }}>ITAR — Intl. Traffic in Arms Regulations</div>
                  <div style={{ fontSize: '10px', color: colors.textMuted, lineHeight: 1.5 }}>
                    Administered by DDTC (State Dept.). Governs defense articles on the USML. Stricter than EAR — requires licenses for most foreign persons. Once ITAR-controlled, always ITAR regardless of modifications.
                  </div>
                </div>
              </div>
            </div>

            {/* ECCN classification */}
            <div style={{ background: colors.bgSecondary, borderRadius: '6px', padding: '10px 12px', border: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: colors.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ECCN Classification — {part.id}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: colors.accent, letterSpacing: '-0.5px' }}>{part.eccn}</div>
                  <div style={{ fontSize: '9px', color: colors.textMuted, marginTop: '2px' }}>ECCN Code</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: colors.text }}>{part.earControl}</div>
                  <div style={{ fontSize: '9px', color: colors.textMuted, marginTop: '2px' }}>Control Regime</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: colors.text }}>{part.licenseNote}</div>
                  <div style={{ fontSize: '9px', color: colors.textMuted, marginTop: '2px' }}>Reasons for Control</div>
                </div>
              </div>
            </div>

            {/* Destination control analysis */}
            {(() => {
              const destCtrl = DEST_CONTROLS[cust.code] || { tier: 'UNKNOWN', colorKey: 'warning' as const, description: 'No control profile found. Manual review recommended before proceeding.', licenseStatus: 'Manual Review Required' };
              const c = destCtrl.colorKey === 'success' ? colors.success : destCtrl.colorKey === 'warning' ? colors.warning : colors.critical;
              return (
                <div style={{ background: c + '0d', borderRadius: '6px', padding: '10px 12px', border: `1px solid ${c}40` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Destination Control Analysis</div>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: c + '20', color: c, border: `1px solid ${c}40` }}>
                      {destCtrl.tier}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: colors.text, marginBottom: '4px' }}>{cust.name} — {cust.city}, {cust.country} ({cust.code})</div>
                  <div style={{ fontSize: '11px', color: colors.textMuted, lineHeight: 1.5, marginBottom: '8px' }}>{destCtrl.description}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '9px', color: colors.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>License Status:</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: c }}>{destCtrl.licenseStatus}</span>
                  </div>
                </div>
              );
            })()}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setCurrentStep('part')} style={{
                padding: '8px 16px', borderRadius: '6px', border: `1px solid ${colors.border}`,
                background: 'transparent', color: colors.text, fontSize: '12px', cursor: 'pointer',
              }}>Back</button>
              <button onClick={runComplianceCheck} style={{
                padding: '8px 20px', borderRadius: '6px', border: 'none',
                background: colors.accent, color: 'white',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <VerifiedUserIcon style={{ fontSize: 14 }} /> Run Compliance Screening
              </button>
            </div>
          </div>
        )}

        {currentStep === 'result' && complianceResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              background: isBlocked ? 'transparent' : isRestricted ? colors.warning + '10' : colors.success + '10',
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
                        background: complianceResult.entityDetail?.level === 'DENIED' ? 'transparent' : colors.warning + '20',
                        border: complianceResult.entityDetail?.level === 'DENIED' ? `1px solid ${colors.critical}50` : 'none',
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
                        background: complianceResult.regionDetail?.type === 'EMBARGO' ? 'transparent' : colors.warning + '20',
                        border: complianceResult.regionDetail?.type === 'EMBARGO' ? `1px solid ${colors.critical}50` : 'none',
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
              <div style={{ background: 'transparent', borderRadius: '8px', border: `1px solid ${colors.critical}30`, padding: '10px', fontSize: '11px' }}>
                <div style={{ fontWeight: 600, color: colors.critical, marginBottom: '4px' }}>Entity List Match Detail</div>
                <div style={{ color: colors.text }}>{complianceResult.entityDetail.reason}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setCurrentStep('exportControl')} style={{
                padding: '8px 16px', borderRadius: '6px', border: `1px solid ${colors.border}`,
                background: 'transparent', color: colors.text, fontSize: '12px', cursor: 'pointer',
              }}>Back</button>
              <button onClick={reset} style={{
                padding: '8px 20px', borderRadius: '6px', border: `1px solid ${colors.border}`,
                background: 'transparent', color: colors.text, fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              }}>
                New Check
              </button>
              {onAskAI && (
                <button onClick={() => onAskAI(`Export compliance review for ${part.id} — ${part.name} (${part.category}, unit cost $${part.cost.toLocaleString()}) shipping to ${cust.name}, ${cust.city}, ${cust.country}. ECCN: ${part.eccn} (${part.earControl}). Compliance status: ${isBlocked ? 'EXPORT BLOCKED' : isRestricted ? 'LICENSE REQUIRED (EAR/ITAR)' : 'CLEARED FOR EXPORT'}.${complianceResult?.entityBlocked ? ` Entity screening: ${complianceResult.entityDetail?.level} match on ${complianceResult.entityDetail?.list} — ${complianceResult.entityDetail?.reason}.` : ''}${complianceResult?.regionBlocked ? ` Region control: ${complianceResult.regionDetail?.type} (${complianceResult.regionDetail?.list}, categories: ${complianceResult.regionDetail?.categories}).` : ''} Landed cost exposure: $${costData.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}. What specific export control obligations and licenses apply, what are the penalties for non-compliance, and what revenue is protected or at risk if this shipment is delayed or blocked?`)}
                  style={{
                    padding: '8px 16px', borderRadius: '6px', border: `1px solid ${colors.accent}40`,
                    background: colors.accent + '10', color: colors.accent, fontSize: '11px', fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                  Verify with AI
                </button>
              )}
              {onProceedToCost && (
                <button onClick={onProceedToCost}
                  style={{
                    padding: '8px 16px', borderRadius: '6px', border: `1px solid ${colors.success}60`,
                    background: colors.success + '10', color: colors.success, fontSize: '11px', fontWeight: 600,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                  Next: Review Shipment →
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
              background: 'transparent',
              border: `1px solid ${colors.critical}50`,
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
              background: 'transparent',
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
