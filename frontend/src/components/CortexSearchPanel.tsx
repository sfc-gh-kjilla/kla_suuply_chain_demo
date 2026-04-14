import { useState } from 'react';
import type { EscalationCase } from '../types';
import { useTheme } from '../context/ThemeContext';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DescriptionIcon from '@mui/icons-material/Description';
import BuildIcon from '@mui/icons-material/Build';
import ArticleIcon from '@mui/icons-material/Article';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

const SAMPLE_QUERIES = [
  'How to replace NLO crystal assembly on 39xx DUV scanner?',
  'Troubleshooting power degradation in DUV laser system',
  'Crystal batch lot B-2024 known issues',
  'Maintenance interval for EUV collector mirror',
  'Service bulletin SB-2024-0892 details',
];

interface DocResult {
  docName: string;
  docType: string;
  sectionTitle: string;
  pageNumber: number;
  snippet: string;
  relevance: number;
}

const MOCK_RESULTS: Record<string, DocResult[]> = {
  'crystal': [
    { docName: 'KLA DUV Troubleshooting Guide', docType: 'TROUBLESHOOTING', sectionTitle: 'Crystal Assembly Replacement Procedure', pageNumber: 45, snippet: 'The NLO Harmonic Crystal Assembly (994-023) should be replaced when power output drops below 85% of baseline. Ensure the laser interlock is engaged before opening the crystal housing. Use the alignment jig (tool #TJ-193-A) to verify beam path after installation. Typical replacement time: 4-6 hours for trained technicians.', relevance: 0.96 },
    { docName: 'KLA DUV Scanner Maintenance Manual Rev 4.2', docType: 'MAINTENANCE_MANUAL', sectionTitle: 'Preventive Maintenance Schedule — Laser Optics', pageNumber: 23, snippet: 'Crystal assemblies (NLO and LBO) should be inspected every 2000 operating hours. Key indicators for replacement: power degradation >15%, beam profile asymmetry >5%, or visible surface damage. CLBO crystals are hygroscopic — maintain dry nitrogen purge at all times during handling.', relevance: 0.91 },
    { docName: 'KLA Service Bulletin SB-2024-0892', docType: 'SERVICE_BULLETIN', sectionTitle: 'Batch B-2024-A Crystal Quality Advisory', pageNumber: 1, snippet: 'ADVISORY: Batch B-2024-A CLBO crystals from Oxide Corporation may exhibit accelerated degradation under high-duty-cycle operation (>80% uptime). Affected scanners should increase crystal inspection frequency to every 1000 hours. Replacement with Batch B-2024-B or later recommended when available.', relevance: 0.88 },
  ],
  'power': [
    { docName: 'KLA DUV Troubleshooting Guide', docType: 'TROUBLESHOOTING', sectionTitle: 'Laser Power Degradation — Root Cause Analysis', pageNumber: 32, snippet: 'Power degradation in DUV laser systems has multiple root causes: (1) Crystal surface degradation — most common, accounts for 60% of cases. Check NLO and LBO crystal assemblies. (2) Gas mixture depletion — replace excimer gas cylinder if >500 operating hours. (3) Mirror alignment drift — run beam alignment diagnostic. (4) Thermal management — verify chiller temperature within ±0.5°C of setpoint.', relevance: 0.95 },
    { docName: 'KLA Application Note AN-193-2024', docType: 'APPLICATION_NOTE', sectionTitle: 'Optimizing 193nm Laser Output Power', pageNumber: 8, snippet: 'For optimal 193nm power output, maintain crystal temperature at 23.0±0.2°C. Power readings should be taken after 30-minute warm-up. Fleet-wide analysis shows that scanners with power >175mW typically have crystals with <1500 hours of operation. Z-score monitoring against fleet mean is recommended for early anomaly detection.', relevance: 0.89 },
  ],
  'maintenance': [
    { docName: 'KLA DUV Scanner Maintenance Manual Rev 4.2', docType: 'MAINTENANCE_MANUAL', sectionTitle: 'Scheduled Maintenance Overview', pageNumber: 5, snippet: 'DUV scanner preventive maintenance follows a tiered schedule: Daily (operator): visual inspection, power check. Weekly: gas pressure verification, chiller performance. Monthly: crystal inspection, mirror alignment check. Quarterly: full optical path alignment, vacuum system leak check. Annual: comprehensive overhaul including all optical component replacement evaluation.', relevance: 0.94 },
    { docName: 'KLA Parts Catalog 2024', docType: 'PARTS_CATALOG', sectionTitle: 'Recommended Spare Parts Kit — DUV 39xx', pageNumber: 12, snippet: 'Standard spare parts kit for DUV 39xx series includes: 1x NLO Crystal Assembly (994-023), 2x LBO Crystal (994-024), 1x Mirror Assembly (994-025), 4x Gas Cylinder (994-026), 1x Controller PCB (997-001). Recommended stocking: minimum 1 crystal assembly per 5 scanners in fleet. Lead time for crystal assemblies: 2-5 days depending on warehouse.', relevance: 0.87 },
  ],
  'euv': [
    { docName: 'KLA DUV Scanner Maintenance Manual Rev 4.2', docType: 'MAINTENANCE_MANUAL', sectionTitle: 'EUV Collector Mirror Handling', pageNumber: 67, snippet: 'EUV Collector Mirrors (995-001) require cleanroom Class 1 handling. Mirror reflectivity degrades with tin contamination from the plasma source. Cleaning cycle: hydrogen radical clean every 200 hours. Replacement threshold: reflectivity <85% of original specification. Cost: $180,000 per unit. Handle with extreme care — surface contact will permanently damage the multilayer coating.', relevance: 0.93 },
    { docName: 'KLA Parts Catalog 2024', docType: 'PARTS_CATALOG', sectionTitle: 'EUV Source Components', pageNumber: 34, snippet: 'EUV source components include: Collector Mirror (995-001, $180,000), Tin Droplet Generator (995-002, $95,000). These are the highest-value components in the EUV system. Extended lead time: 5-10 days for international shipment. CRITICAL: EUV optics are export-controlled under BIS regulations for certain destinations. Verify compliance before shipping.', relevance: 0.90 },
  ],
  'default': [
    { docName: 'KLA DUV Troubleshooting Guide', docType: 'TROUBLESHOOTING', sectionTitle: 'General Diagnostic Procedures', pageNumber: 3, snippet: 'Begin all troubleshooting with the standard diagnostic checklist: (1) Verify system status indicators on main controller. (2) Check recent alert history in monitoring system. (3) Run automated self-test sequence. (4) Review telemetry data for anomalous readings. (5) If crystal-related, check power output, beam profile, and crystal temperature. Contact KLA Global Support for escalation guidance.', relevance: 0.82 },
    { docName: 'KLA DUV Scanner Maintenance Manual Rev 4.2', docType: 'MAINTENANCE_MANUAL', sectionTitle: 'System Overview', pageNumber: 1, snippet: 'The KLA DUV scanner series (29xx, 39xx) utilizes 193nm deep ultraviolet laser technology for semiconductor wafer inspection. Key subsystems: laser source (NLO/LBO crystal assemblies), beam delivery optics, wafer stage (interferometer-controlled), image capture (high-speed camera), and motion control (PCB-based servo system). Each subsystem has independent monitoring and alert thresholds.', relevance: 0.78 },
  ],
};

function searchDocs(query: string): DocResult[] {
  const q = query.toLowerCase();
  if (q.includes('crystal') || q.includes('nlo') || q.includes('clbo') || q.includes('994-023') || q.includes('batch')) return MOCK_RESULTS['crystal'];
  if (q.includes('power') || q.includes('degradation') || q.includes('laser') || q.includes('193nm')) return MOCK_RESULTS['power'];
  if (q.includes('maintenance') || q.includes('schedule') || q.includes('spare') || q.includes('kit')) return MOCK_RESULTS['maintenance'];
  if (q.includes('euv') || q.includes('mirror') || q.includes('tin') || q.includes('collector')) return MOCK_RESULTS['euv'];
  return MOCK_RESULTS['default'];
}

const docTypeIcon = (type: string) => {
  switch (type) {
    case 'TROUBLESHOOTING': return <BuildIcon style={{ fontSize: 14 }} />;
    case 'MAINTENANCE_MANUAL': return <AutoStoriesIcon style={{ fontSize: 14 }} />;
    case 'SERVICE_BULLETIN': return <DescriptionIcon style={{ fontSize: 14 }} />;
    case 'PARTS_CATALOG': return <MenuBookIcon style={{ fontSize: 14 }} />;
    case 'APPLICATION_NOTE': return <ArticleIcon style={{ fontSize: 14 }} />;
    default: return <DescriptionIcon style={{ fontSize: 14 }} />;
  }
};

const docTypeColor = (_type: string) => {
  return '#6b7280';
};

interface CortexSearchPanelProps {
  selectedCase?: EscalationCase | null;
  onAskAI?: (prompt: string) => void;
}

export function CortexSearchPanel({ selectedCase, onAskAI: _onAskAI }: CortexSearchPanelProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DocResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const contextQueries = selectedCase ? [
    `Troubleshooting ${selectedCase.CASE_TITLE?.split(' ').slice(0, 4).join(' ')}`,
    ...(selectedCase.PARTS_NEEDED.length > 0 ? [`Replacement procedure for ${selectedCase.PARTS_NEEDED[0]}`] : []),
    `Maintenance guide for scanner ${selectedCase.SCANNER_ID}`,
  ] : [];

  const handleSearch = (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setQuery(searchQuery);
    setTimeout(() => {
      setResults(searchDocs(searchQuery));
      setIsSearching(false);
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <SearchIcon style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: colors.textMuted }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search technical docs, maintenance manuals, service bulletins..."
            style={{
              width: '100%', padding: '10px 10px 10px 34px', fontSize: '12px', borderRadius: '8px',
              background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <button onClick={() => handleSearch()} disabled={isSearching || !query.trim()} style={{
          padding: '0 16px', borderRadius: '8px', border: 'none',
          background: colors.accent, color: 'white',
          fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
          opacity: isSearching || !query.trim() ? 0.5 : 1,
        }}>
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {!results && !isSearching && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <SearchIcon style={{ fontSize: 40, color: colors.textDim, opacity: 0.3 }} />
          <div style={{ fontSize: '13px', color: colors.textMuted }}>Search KLA technical documentation</div>
          <div style={{ fontSize: '10px', color: colors.textDim }}>Powered by Snowflake Cortex Search (snowflake-arctic-embed-m-v1.5)</div>
          {contextQueries.length > 0 && (
            <div style={{ marginTop: '10px', width: '100%', maxWidth: '500px' }}>
              <div style={{ fontSize: '10px', color: colors.accent, marginBottom: '4px', fontWeight: 600, textAlign: 'center' }}>SUGGESTED FROM CASE CONTEXT</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                {contextQueries.map(sq => (
                  <button key={sq} onClick={() => handleSearch(sq)} style={{
                    padding: '5px 10px', borderRadius: '14px', border: `1px solid ${colors.accent}40`,
                    background: colors.accent + '10', color: colors.accent, fontSize: '10px', cursor: 'pointer',
                    fontWeight: 600,
                  }}>
                    {sq}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', maxWidth: '500px', marginTop: '8px' }}>
            {SAMPLE_QUERIES.map(sq => (
              <button key={sq} onClick={() => handleSearch(sq)} style={{
                padding: '5px 10px', borderRadius: '14px', border: `1px solid ${colors.border}`,
                background: colors.bgSecondary, color: colors.text, fontSize: '10px', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = colors.accent; e.currentTarget.style.color = colors.accent; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.text; }}
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      )}

      {isSearching && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <div style={{ fontSize: '24px', animation: 'spin 1s linear infinite' }}>&#9881;</div>
          <div style={{ fontSize: '12px', color: colors.accent }}>Searching Cortex Search Service...</div>
          <div style={{ fontSize: '10px', color: colors.textMuted }}>Querying TECHNICAL_DOCS_SEARCH with semantic embeddings</div>
        </div>
      )}

      {results && !isSearching && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '11px', color: colors.textMuted, flexShrink: 0 }}>
            {results.length} results for "<span style={{ color: colors.text, fontWeight: 600 }}>{query}</span>"
          </div>
          {results.map((r, i) => (
            <div key={i} style={{
              background: colors.bg, borderRadius: '8px', border: `1px solid ${colors.border}`,
              padding: '12px', transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = colors.accent}
              onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: docTypeColor(r.docType) }}>{docTypeIcon(r.docType)}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{r.docName}</span>
                </div>
                <span style={{
                  fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px',
                  background: colors.accent + '12',
                  color: colors.accent,
                }}>
                  {(r.relevance * 100).toFixed(0)}% match
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <span style={{
                  fontSize: '9px', padding: '1px 6px', borderRadius: '3px',
                  background: docTypeColor(r.docType) + '15', color: docTypeColor(r.docType),
                }}>
                  {r.docType.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: '9px', color: colors.textMuted }}>Section: {r.sectionTitle}</span>
                <span style={{ fontSize: '9px', color: colors.textMuted }}>Page {r.pageNumber}</span>
              </div>
              <div style={{ fontSize: '11px', color: colors.text, lineHeight: 1.5, background: colors.bgSecondary, padding: '8px 10px', borderRadius: '5px', border: `1px solid ${colors.border}` }}>
                {r.snippet}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
