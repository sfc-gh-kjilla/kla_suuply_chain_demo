import React, { useState } from 'react';
import type { EscalationCase } from '../types';
import { useTheme } from '../context/ThemeContext';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import FilterListIcon from '@mui/icons-material/FilterList';

interface EscalationCasesPanelProps {
  cases: EscalationCase[];
  onCaseClick?: (caseItem: EscalationCase) => void;
  onAskAI?: (prompt: string) => void;
  currentEngineer?: string;
}

export const EscalationCasesPanel: React.FC<EscalationCasesPanelProps> = ({
  cases,
  onCaseClick,
  onAskAI,
  currentEngineer,
}) => {
  const { theme, colors } = useTheme();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [showMyOnly, setShowMyOnly] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'SEV1': return colors.critical;
      case 'SEV2': return colors.warning;
      case 'SEV3': return colors.accent;
      default: return colors.textMuted;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, { bg: string; text: string }> = {
      'OPEN': { bg: theme === 'dark' ? '#1e3a5f' : '#e3f2fd', text: colors.accent },
      'IN_PROGRESS': { bg: theme === 'dark' ? '#2d4a3e' : '#e8f5e9', text: colors.success },
      'WAITING_PARTS': { bg: theme === 'dark' ? '#3d2e1f' : '#fff3e0', text: colors.warning },
      'WAITING_CUSTOMER': { bg: theme === 'dark' ? '#3d2e1f' : '#fff8e1', text: '#f9a825' },
      'ESCALATED': { bg: theme === 'dark' ? '#3d1f1f' : '#ffebee', text: colors.critical },
      'RESOLVED': { bg: theme === 'dark' ? '#1a2e1a' : '#e8f5e9', text: colors.success },
    };
    const c = statusColors[status] || statusColors['OPEN'];
    return (
      <span style={{
        background: c.bg,
        color: c.text,
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  const filteredCases = cases.filter(c => {
    if (filterSeverity !== 'ALL' && c.SEVERITY !== filterSeverity) return false;
    if (showMyOnly && currentEngineer && c.ASSIGNED_ENGINEER !== currentEngineer) return false;
    return true;
  });

  const openCases = filteredCases.filter(c => c.STATUS !== 'RESOLVED');
  const sev1Count = openCases.filter(c => c.SEVERITY === 'SEV1').length;
  const sev2Count = openCases.filter(c => c.SEVERITY === 'SEV2').length;
  const breachedCount = openCases.filter(c => c.SLA_REMAINING_HOURS < 0).length;

  const hoverBg = theme === 'dark' ? '#161b22' : '#f0f0f0';

  return (
    <div style={{
      background: colors.bgSecondary,
      borderRadius: '12px',
      border: `1px solid ${colors.border}`,
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', color: colors.text }}>Escalation Cases</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {sev1Count > 0 && (
              <span style={{
                background: theme === 'dark' ? '#3d1f1f' : '#ffebee',
                color: colors.critical,
                padding: '3px 8px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                {sev1Count} SEV1
              </span>
            )}
            {breachedCount > 0 && (
              <span style={{
                background: theme === 'dark' ? '#3d1f1f' : '#ffcdd2',
                color: colors.critical,
                padding: '3px 8px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                {breachedCount} SLA Breached
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <FilterListIcon style={{ fontSize: 14, color: colors.textMuted }} />
          {['ALL', 'SEV1', 'SEV2', 'SEV3'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              style={{
                background: filterSeverity === sev ? colors.accent : 'transparent',
                color: filterSeverity === sev ? '#fff' : colors.textMuted,
                border: `1px solid ${filterSeverity === sev ? colors.accent : colors.border}`,
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '10px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {sev}
            </button>
          ))}
          {currentEngineer && (
            <button
              onClick={() => setShowMyOnly(!showMyOnly)}
              style={{
                background: showMyOnly ? colors.accent : 'transparent',
                color: showMyOnly ? '#fff' : colors.textMuted,
                border: `1px solid ${showMyOnly ? colors.accent : colors.border}`,
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                marginLeft: '4px',
              }}
            >
              My Cases
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {openCases.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: colors.textMuted }}>
            No active cases
          </div>
        ) : (
          openCases.map((caseItem) => (
            <div
              key={caseItem.CASE_ID}
              onClick={() => onCaseClick?.(caseItem)}
              style={{
                padding: '10px 16px',
                borderBottom: `1px solid ${colors.border}`,
                cursor: 'pointer',
                transition: 'background 0.2s',
                borderLeft: `3px solid ${getSeverityColor(caseItem.SEVERITY)}`,
              }}
              onMouseOver={(e) => e.currentTarget.style.background = hoverBg}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                {caseItem.SEVERITY === 'SEV1' ? (
                  <ErrorIcon style={{ fontSize: 16, color: colors.critical }} />
                ) : caseItem.SEVERITY === 'SEV2' ? (
                  <WarningIcon style={{ fontSize: 16, color: colors.warning }} />
                ) : (
                  <InfoIcon style={{ fontSize: 16, color: colors.accent }} />
                )}
                <span style={{ fontWeight: 600, color: colors.text, fontSize: '12px', flex: 1 }}>
                  {caseItem.CASE_ID}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: getSeverityColor(caseItem.SEVERITY),
                }}>
                  {caseItem.SEVERITY}
                </span>
                {getStatusBadge(caseItem.STATUS)}
              </div>

              <div style={{ fontSize: '11px', color: colors.text, marginBottom: '4px', marginLeft: '22px' }}>
                {caseItem.CASE_TITLE}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginLeft: '22px', fontSize: '10px', color: colors.textMuted }}>
                <span>{caseItem.CUSTOMER} — {caseItem.FAB_SITE}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <PersonIcon style={{ fontSize: 10 }} />
                  {caseItem.ASSIGNED_ENGINEER}
                </span>
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  color: caseItem.SLA_REMAINING_HOURS < 0 ? colors.critical : colors.textMuted,
                  fontWeight: caseItem.SLA_REMAINING_HOURS < 0 ? 700 : 400,
                }}>
                  <AccessTimeIcon style={{ fontSize: 10 }} />
                  {caseItem.SLA_REMAINING_HOURS < 0
                    ? `SLA breached ${Math.abs(caseItem.SLA_REMAINING_HOURS)}h ago`
                    : `${caseItem.SLA_REMAINING_HOURS}h remaining`
                  }
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{
        padding: '8px 16px',
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '10px',
        color: colors.textMuted,
      }}>
        <span>{openCases.length} open cases</span>
        <button
          onClick={() => onAskAI?.('Summarize all open escalation cases by severity and recommend prioritization')}
          style={{
            background: colors.accent + '20',
            color: colors.accent,
            border: `1px solid ${colors.accent}40`,
            borderRadius: '4px',
            padding: '3px 8px',
            fontSize: '10px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          AI Summary
        </button>
      </div>
    </div>
  );
};
