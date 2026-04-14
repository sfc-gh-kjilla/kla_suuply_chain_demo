import React from 'react';
import type { EscalationCase } from '../types';
import { useTheme } from '../context/ThemeContext';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import BuildIcon from '@mui/icons-material/Build';
import NoteIcon from '@mui/icons-material/Note';
import UpdateIcon from '@mui/icons-material/Update';

interface CaseDetailPanelProps {
  caseItem: EscalationCase;
  onClose: () => void;
  onAskAI?: (prompt: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const CaseDetailPanel: React.FC<CaseDetailPanelProps> = ({
  caseItem,
  onClose,
  onAskAI,
  onNavigateTab,
}) => {
  const { colors } = useTheme();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'SEV1': return colors.critical;
      case 'SEV2': return colors.warning;
      case 'SEV3': return colors.accent;
      default: return colors.textMuted;
    }
  };

  const getCommIcon = (type: string) => {
    switch (type) {
      case 'EMAIL': return <EmailIcon style={{ fontSize: 14, color: colors.accent }} />;
      case 'ESCALATION': return <ArrowUpwardIcon style={{ fontSize: 14, color: colors.critical }} />;
      case 'PARTS_REQUEST': return <BuildIcon style={{ fontSize: 14, color: colors.warning }} />;
      case 'STATUS_UPDATE': return <UpdateIcon style={{ fontSize: 14, color: colors.success }} />;
      default: return <NoteIcon style={{ fontSize: 14, color: colors.textMuted }} />;
    }
  };

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      background: colors.bgSecondary,
      borderRadius: '10px',
      border: `1px solid ${colors.border}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              fontWeight: 700,
              fontSize: '14px',
              color: getSeverityColor(caseItem.SEVERITY),
            }}>
              {caseItem.CASE_ID}
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              color: getSeverityColor(caseItem.SEVERITY),
              background: getSeverityColor(caseItem.SEVERITY) + '20',
              padding: '2px 6px',
              borderRadius: '4px',
            }}>
              {caseItem.SEVERITY}
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              color: caseItem.SLA_REMAINING_HOURS < 0 ? colors.critical : colors.success,
              background: (caseItem.SLA_REMAINING_HOURS < 0 ? colors.critical : colors.success) + '20',
              padding: '2px 6px',
              borderRadius: '4px',
            }}>
              {caseItem.SLA_REMAINING_HOURS < 0
                ? `SLA BREACHED (${Math.abs(caseItem.SLA_REMAINING_HOURS)}h)`
                : `${caseItem.SLA_REMAINING_HOURS}h to SLA`
              }
            </span>
          </div>
          <div style={{ fontSize: '12px', color: colors.text, fontWeight: 500 }}>{caseItem.CASE_TITLE}</div>
        </div>
        <button onClick={onClose} style={{
          background: 'transparent',
          border: 'none',
          color: colors.textMuted,
          cursor: 'pointer',
          padding: '2px',
        }}>
          <CloseIcon style={{ fontSize: 18 }} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '12px',
          fontSize: '11px',
        }}>
          <div style={{ background: colors.bg, borderRadius: '6px', padding: '8px' }}>
            <div style={{ color: colors.textMuted, marginBottom: '2px' }}>Customer</div>
            <div style={{ color: colors.text, fontWeight: 600 }}>{caseItem.CUSTOMER} — {caseItem.FAB_SITE}</div>
          </div>
          <div style={{ background: colors.bg, borderRadius: '6px', padding: '8px' }}>
            <div style={{ color: colors.textMuted, marginBottom: '2px' }}>Scanner</div>
            <div style={{ color: colors.text, fontWeight: 600 }}>{caseItem.SCANNER_ID}</div>
          </div>
          <div style={{ background: colors.bg, borderRadius: '6px', padding: '8px' }}>
            <div style={{ color: colors.textMuted, marginBottom: '2px' }}>Assigned Engineer</div>
            <div style={{ color: colors.text, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <PersonIcon style={{ fontSize: 12 }} />
              {caseItem.ASSIGNED_ENGINEER}
            </div>
            <div style={{ color: colors.textMuted, fontSize: '10px' }}>{caseItem.ENGINEER_LOCATION}</div>
          </div>
          <div style={{ background: colors.bg, borderRadius: '6px', padding: '8px' }}>
            <div style={{ color: colors.textMuted, marginBottom: '2px' }}>Case Age</div>
            <div style={{ color: colors.text, fontWeight: 600 }}>{caseItem.AGE_DAYS} days</div>
            <div style={{ color: colors.textMuted, fontSize: '10px' }}>Opened {new Date(caseItem.CREATED_DATE).toLocaleDateString()}</div>
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>Description</div>
          <div style={{
            fontSize: '12px',
            color: colors.text,
            background: colors.bg,
            borderRadius: '6px',
            padding: '8px',
            lineHeight: '1.5',
          }}>
            {caseItem.DESCRIPTION}
          </div>
        </div>

        {caseItem.PARTS_NEEDED.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>Parts Required</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {caseItem.PARTS_NEEDED.map((part, idx) => (
                <span key={idx} style={{
                  background: colors.warning + '20',
                  color: colors.warning,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAskAI?.(`Check inventory and landed cost options for ${part} to ship to ${caseItem.FAB_SITE}, ${caseItem.CUSTOMER}`);
                  }}
                >
                  {part}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '8px' }}>Communication Timeline</div>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '7px',
              top: '0',
              bottom: '0',
              width: '2px',
              background: colors.border,
            }} />
            {caseItem.COMMUNICATION_LOG.map((comm, idx) => (
              <div key={idx} style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '12px',
                position: 'relative',
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: colors.bgSecondary,
                  border: `2px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                  flexShrink: 0,
                }}>
                  {getCommIcon(comm.TYPE)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: colors.text }}>
                      {comm.AUTHOR}
                      <span style={{ fontWeight: 400, color: colors.textMuted, marginLeft: '6px' }}>
                        {comm.AUTHOR_ROLE}
                      </span>
                    </span>
                    <span style={{ fontSize: '10px', color: colors.textMuted }}>
                      {formatDate(comm.TIMESTAMP)}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: colors.text,
                    background: colors.bg,
                    borderRadius: '6px',
                    padding: '6px 8px',
                    lineHeight: '1.4',
                  }}>
                    {comm.MESSAGE}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        padding: '8px 16px',
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        gap: '6px',
      }}>
        <button
          onClick={() => onAskAI?.(`Give me a full status update on case ${caseItem.CASE_ID} for ${caseItem.CUSTOMER} ${caseItem.FAB_SITE}. What's the current status, parts situation, and recommended next steps?`)}
          style={{
            flex: 1,
            background: colors.accent,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          AI Case Summary
        </button>
        <button
          onClick={() => onAskAI?.(`Find parts sourcing options for case ${caseItem.CASE_ID}. Compare landed costs from all warehouses for delivery to ${caseItem.FAB_SITE}`)}
          style={{
            flex: 1,
            background: colors.warning + '20',
            color: colors.warning,
            border: `1px solid ${colors.warning}40`,
            borderRadius: '6px',
            padding: '8px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Source Parts
        </button>
        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('multiSource')}
            style={{
              flex: 1,
              background: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              padding: '8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Multi-Source &rarr;
          </button>
        )}
      </div>
    </div>
  );
};
