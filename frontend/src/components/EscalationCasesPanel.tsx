import React, { useState } from 'react';
import type { EscalationCase } from '../types';
import { useTheme } from '../context/ThemeContext';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';

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
  const { colors } = useTheme();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [showMyOnly, setShowMyOnly] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'SEV1': return colors.critical;
      case 'SEV2': return colors.warning;
      case 'SEV3': return colors.textMuted;
      default: return colors.textDim;
    }
  };

  const filteredCases = cases.filter(c => {
    if (filterSeverity !== 'ALL' && c.SEVERITY !== filterSeverity) return false;
    if (showMyOnly && currentEngineer && c.ASSIGNED_ENGINEER !== currentEngineer) return false;
    return true;
  });

  const openCases = filteredCases.filter(c => c.STATUS !== 'RESOLVED');
  const sev1Count = openCases.filter(c => c.SEVERITY === 'SEV1').length;
  const breachedCount = openCases.filter(c => c.SLA_REMAINING_HOURS < 0).length;

  return (
    <div style={{
      background: colors.bgSecondary,
      borderRadius: '12px',
      border: `1px solid ${colors.border}`,
      boxShadow: colors.panelShadow,
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '10px 14px',
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{
            margin: 0,
            fontSize: '11px',
            fontWeight: 600,
            color: colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Escalation Cases
          </h3>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {sev1Count > 0 && (
              <span style={{
                color: colors.critical,
                fontSize: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: colors.critical + '12',
                padding: '2px 8px',
                borderRadius: '10px',
              }}>
                <span style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: colors.critical,
                  display: 'inline-block',
                  boxShadow: `0 0 4px ${colors.critical}`,
                }} />
                {sev1Count} SEV1
              </span>
            )}
            {breachedCount > 0 && (
              <span style={{
                color: colors.critical,
                fontSize: '10px',
                fontWeight: 700,
                background: colors.critical + '12',
                padding: '2px 8px',
                borderRadius: '10px',
              }}>
                {breachedCount} Breached
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {['ALL', 'SEV1', 'SEV2', 'SEV3'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              style={{
                background: filterSeverity === sev ? colors.pillActiveBg : colors.pillBg,
                color: filterSeverity === sev ? colors.accent : colors.textMuted,
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '10px',
                cursor: 'pointer',
                fontWeight: filterSeverity === sev ? 600 : 500,
                transition: 'all 0.15s ease',
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
                borderRadius: '6px',
                padding: '3px 8px',
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
          <div style={{ padding: '24px', textAlign: 'center', color: colors.textMuted, fontSize: '13px' }}>
            No active cases
          </div>
        ) : (
          openCases.map((caseItem) => (
            <div
              key={caseItem.CASE_ID}
              onClick={() => onCaseClick?.(caseItem)}
              style={{
                padding: '10px 14px',
                borderBottom: `1px solid ${colors.borderSubtle}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                borderLeft: `3px solid ${getSeverityColor(caseItem.SEVERITY)}`,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = colors.cardHover;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                {caseItem.SEVERITY === 'SEV1' ? (
                  <ErrorIcon style={{ fontSize: 15, color: colors.critical }} />
                ) : caseItem.SEVERITY === 'SEV2' ? (
                  <WarningIcon style={{ fontSize: 15, color: colors.warning }} />
                ) : (
                  <InfoIcon style={{ fontSize: 15, color: colors.teal }} />
                )}
                <span style={{ fontWeight: 600, color: colors.text, fontSize: '12px', letterSpacing: '-0.2px' }}>
                  {caseItem.CASE_ID}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: colors.teal,
                  background: colors.tealSubtle,
                  padding: '1px 6px',
                  borderRadius: '4px',
                }}>
                  {caseItem.CUSTOMER}
                </span>
                <span style={{ flex: 1 }} />
                <span style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: getSeverityColor(caseItem.SEVERITY),
                }}>
                  {caseItem.SEVERITY}
                </span>
                <span style={{
                  background: colors.pillBg,
                  color: colors.textMuted,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '9px',
                  fontWeight: 500,
                }}>
                  {caseItem.STATUS.replace(/_/g, ' ')}
                </span>
              </div>

              <div style={{ fontSize: '11px', color: colors.text, marginBottom: '4px', marginLeft: '21px', lineHeight: 1.3 }}>
                {caseItem.CASE_TITLE}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginLeft: '21px', fontSize: '10px', color: colors.textMuted, flexWrap: 'wrap' }}>
                <span>{caseItem.FAB_SITE}</span>
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
        padding: '8px 14px',
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
            background: colors.accentGradient,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '5px 12px',
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
