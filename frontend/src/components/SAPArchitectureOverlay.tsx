import React from 'react';
import { useTheme } from '../context/ThemeContext';
import CloseIcon from '@mui/icons-material/Close';
import StorageIcon from '@mui/icons-material/Storage';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import SecurityIcon from '@mui/icons-material/Security';

interface SAPArchitectureOverlayProps {
  onClose: () => void;
}

export const SAPArchitectureOverlay: React.FC<SAPArchitectureOverlayProps> = ({ onClose }) => {
  const { colors } = useTheme();

  const sapBlue = colors.textMuted;
  const snowflakeBlue = colors.accent;
  const cortexPurple = colors.accent;
  const boxBg = colors.bgSecondary;
  const boxBorder = colors.border;

  const SAPBox = ({ module, label }: { module: string; label: string }) => (
    <div style={{
      background: sapBlue + '15',
      border: `1px solid ${sapBlue}40`,
      borderRadius: '8px',
      padding: '8px 12px',
      textAlign: 'center',
      minWidth: '100px',
    }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: sapBlue }}>{module}</div>
      <div style={{ fontSize: '9px', color: colors.textMuted }}>{label}</div>
    </div>
  );

  const SnowflakeBox = ({ name, type }: { name: string; type: string }) => (
    <div style={{
      background: snowflakeBlue + '15',
      border: `1px solid ${snowflakeBlue}40`,
      borderRadius: '8px',
      padding: '8px 12px',
      textAlign: 'center',
      minWidth: '120px',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: snowflakeBlue, fontFamily: 'monospace' }}>{name}</div>
      <div style={{ fontSize: '9px', color: colors.textMuted }}>{type}</div>
    </div>
  );

  const AIBox = ({ name, type }: { name: string; type: string }) => (
    <div style={{
      background: cortexPurple + '15',
      border: `1px solid ${cortexPurple}40`,
      borderRadius: '8px',
      padding: '8px 12px',
      textAlign: 'center',
      minWidth: '130px',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: cortexPurple }}>{name}</div>
      <div style={{ fontSize: '9px', color: colors.textMuted }}>{type}</div>
    </div>
  );

  const Arrow = ({ label, color, reverse }: { label: string; color: string; reverse?: boolean }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', margin: '0 8px' }}>
      {reverse ? (
        <ArrowBackIcon style={{ fontSize: 20, color }} />
      ) : (
        <ArrowForwardIcon style={{ fontSize: 20, color }} />
      )}
      <span style={{ fontSize: '8px', color: colors.textMuted, whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        background: colors.bg,
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        width: '900px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', color: colors.text }}>Snowflake + SAP Interoperability Architecture</h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: colors.textMuted }}>
              Zero overhead to the ERP. Snowflake reads via CDC, enriches with AI, writes back via API.
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent',
            border: 'none',
            color: colors.textMuted,
            cursor: 'pointer',
            padding: '4px',
          }}>
            <CloseIcon style={{ fontSize: 20 }} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '200px 60px 260px 60px 250px',
            gap: '0',
            alignItems: 'center',
            marginBottom: '32px',
          }}>
            <div style={{
              background: sapBlue + '10',
              border: `2px solid ${sapBlue}40`,
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
            }}>
              <StorageIcon style={{ fontSize: 32, color: sapBlue }} />
              <div style={{ fontSize: '14px', fontWeight: 700, color: sapBlue, marginTop: '4px' }}>SAP S/4 HANA</div>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>Source of Truth (ERP)</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <ArrowForwardIcon style={{ fontSize: 24, color: colors.success }} />
              <div style={{ fontSize: '8px', color: colors.success, fontWeight: 600 }}>CDC</div>
            </div>
            <div style={{
              background: snowflakeBlue + '10',
              border: `2px solid ${snowflakeBlue}40`,
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
            }}>
              <CloudDoneIcon style={{ fontSize: 32, color: snowflakeBlue }} />
              <div style={{ fontSize: '14px', fontWeight: 700, color: snowflakeBlue, marginTop: '4px' }}>Snowflake Data Cloud</div>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>AI-Ready Data Platform</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <ArrowForwardIcon style={{ fontSize: 24, color: cortexPurple }} />
              <div style={{ fontSize: '8px', color: cortexPurple, fontWeight: 600 }}>Native</div>
            </div>
            <div style={{
              background: cortexPurple + '10',
              border: `2px solid ${cortexPurple}40`,
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
            }}>
              <SmartToyIcon style={{ fontSize: 32, color: cortexPurple }} />
              <div style={{ fontSize: '14px', fontWeight: 700, color: cortexPurple, marginTop: '4px' }}>Cortex AI Layer</div>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>Agent + Search + Analytics</div>
            </div>
          </div>

          <div style={{ fontSize: '12px', fontWeight: 700, color: colors.text, marginBottom: '12px' }}>
            Data Flows
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { sap: 'MM', sapLabel: 'Material Master', sf: 'PARTS_INVENTORY', sfType: 'Table', ai: 'KLA_SCANNER_INTELLIGENCE', aiType: 'Semantic View', method: 'CDC (real-time)', dir: 'inbound' },
              { sap: 'PM', sapLabel: 'Plant Maintenance', sf: 'ESCALATION_CASES', sfType: 'Table', ai: 'KLA_DIAGNOSTIC_AGENT', aiType: 'Cortex Agent', method: 'CDC (real-time)', dir: 'inbound' },
              { sap: 'WM', sapLabel: 'Warehouse Mgmt', sf: 'WAREHOUSE_LOCATIONS', sfType: 'Table', ai: 'KLA_SCANNER_INTELLIGENCE', aiType: 'Semantic View', method: 'CDC (real-time)', dir: 'inbound' },
              { sap: 'QM', sapLabel: 'Quality Mgmt', sf: 'TECHNICAL_DOCS', sfType: 'Stage', ai: 'TECHNICAL_DOCS_SEARCH', aiType: 'Cortex Search', method: 'Batch (daily)', dir: 'inbound' },
              { sap: 'SD', sapLabel: 'Sales & Distribution', sf: 'SHIP_PART()', sfType: 'Stored Proc', ai: 'Agent Tool Call', aiType: 'Action', method: 'API (on-demand)', dir: 'outbound' },
            ].map((flow, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                background: boxBg,
                borderRadius: '8px',
                border: `1px solid ${boxBorder}`,
                gap: '8px',
              }}>
                <SAPBox module={flow.sap} label={flow.sapLabel} />
                <Arrow
                  label={flow.method}
                  color={flow.dir === 'inbound' ? colors.success : colors.warning}
                  reverse={flow.dir === 'outbound'}
                />
                <SnowflakeBox name={flow.sf} type={flow.sfType} />
                <Arrow label="Serves" color={cortexPurple} />
                <AIBox name={flow.ai} type={flow.aiType} />
              </div>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '12px',
            marginTop: '24px',
          }}>
            <div style={{
              background: colors.success + '10',
              border: `1px solid ${colors.success}30`,
              borderRadius: '8px',
              padding: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <SecurityIcon style={{ fontSize: 16, color: colors.success }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: colors.success }}>Zero ERP Overhead</span>
              </div>
              <div style={{ fontSize: '11px', color: colors.text, lineHeight: 1.4 }}>
                CDC captures changes passively. No custom ABAP. No RFC calls during peak hours. SAP performance unaffected.
              </div>
            </div>
            <div style={{
              background: snowflakeBlue + '10',
              border: `1px solid ${snowflakeBlue}30`,
              borderRadius: '8px',
              padding: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <MonitorHeartIcon style={{ fontSize: 16, color: snowflakeBlue }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: snowflakeBlue }}>Real-Time Sync</span>
              </div>
              <div style={{ fontSize: '11px', color: colors.text, lineHeight: 1.4 }}>
                Material master changes, service orders, and warehouse updates flow to Snowflake within seconds via CDC connector.
              </div>
            </div>
            <div style={{
              background: cortexPurple + '10',
              border: `1px solid ${cortexPurple}30`,
              borderRadius: '8px',
              padding: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <SmartToyIcon style={{ fontSize: 16, color: cortexPurple }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: cortexPurple }}>Write-Back via Agent</span>
              </div>
              <div style={{ fontSize: '11px', color: colors.text, lineHeight: 1.4 }}>
                Cortex Agent calls SHIP_PART() stored procedure which creates POs and material documents back in SAP via API.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
