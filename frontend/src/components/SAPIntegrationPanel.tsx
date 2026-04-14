import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import StorageIcon from '@mui/icons-material/Storage';
import SyncIcon from '@mui/icons-material/Sync';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface DataFlow {
  sapModule: string;
  sapLabel: string;
  direction: 'inbound' | 'outbound';
  method: string;
  snowflakeObject: string;
  aiConsumer: string;
  lastSync: string;
  rowCount: number;
  status: 'synced' | 'syncing' | 'pending';
}

const dataFlows: DataFlow[] = [
  { sapModule: 'MM', sapLabel: 'Material Master', direction: 'inbound', method: 'CDC', snowflakeObject: 'PARTS_INVENTORY', aiConsumer: 'Semantic View', lastSync: '2 min ago', rowCount: 12847, status: 'synced' },
  { sapModule: 'PM', sapLabel: 'Plant Maintenance', direction: 'inbound', method: 'CDC', snowflakeObject: 'ESCALATION_CASES', aiConsumer: 'Cortex Agent', lastSync: '30 sec ago', rowCount: 3512, status: 'synced' },
  { sapModule: 'WM', sapLabel: 'Warehouse Mgmt', direction: 'inbound', method: 'CDC', snowflakeObject: 'WAREHOUSE_LOCATIONS', aiConsumer: 'Semantic View', lastSync: '1 min ago', rowCount: 4203, status: 'synced' },
  { sapModule: 'QM', sapLabel: 'Quality Mgmt', direction: 'inbound', method: 'Batch', snowflakeObject: 'SERVICE_BULLETINS', aiConsumer: 'Cortex Search', lastSync: '15 min ago', rowCount: 892, status: 'synced' },
  { sapModule: 'SD', sapLabel: 'Sales & Dist', direction: 'outbound', method: 'API', snowflakeObject: 'SHIP_PART()', aiConsumer: 'Agent Tool Call', lastSync: 'On demand', rowCount: 0, status: 'pending' },
  { sapModule: 'FI', sapLabel: 'Financial Acctg', direction: 'outbound', method: 'API', snowflakeObject: 'COST_POSTINGS', aiConsumer: 'Agent Tool Call', lastSync: 'On demand', rowCount: 0, status: 'pending' },
];

interface SAPIntegrationPanelProps {
  onClose: () => void;
}

export const SAPIntegrationPanel: React.FC<SAPIntegrationPanelProps> = ({ onClose }) => {
  const { colors } = useTheme();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const sapBlue = colors.textMuted;
  const snowflakeBlue = colors.accent;

  return (
    <div style={{
      background: colors.bgSecondary,
      borderBottom: `1px solid ${colors.border}`,
      padding: '12px 20px',
      animation: 'slideDown 0.3s ease-out',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: colors.bg,
            padding: '4px 10px',
            borderRadius: '6px',
            border: `1px solid ${colors.border}`,
            color: colors.text,
            fontSize: '11px',
            fontWeight: 600,
          }}>
            <StorageIcon style={{ fontSize: 14 }} />
            SAP S/4 HANA
          </div>
          <ArrowForwardIcon style={{ fontSize: 16, color: colors.textMuted }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: colors.bg,
            padding: '4px 10px',
            borderRadius: '6px',
            border: `1px solid ${colors.border}`,
            color: colors.text,
            fontSize: '11px',
            fontWeight: 600,
          }}>
            <CloudDoneIcon style={{ fontSize: 14 }} />
            Snowflake Data Cloud
          </div>
          <ArrowForwardIcon style={{ fontSize: 16, color: colors.textMuted }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: colors.bg,
            padding: '4px 10px',
            borderRadius: '6px',
            border: `1px solid ${colors.border}`,
            color: colors.text,
            fontSize: '11px',
            fontWeight: 600,
          }}>
            <SmartToyIcon style={{ fontSize: 14 }} />
            Cortex AI Layer
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'transparent',
          border: 'none',
          color: colors.textMuted,
          cursor: 'pointer',
          padding: '4px',
        }}>
          <CloseIcon style={{ fontSize: 18 }} />
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '100px 120px 60px 70px 150px 120px 80px 70px',
        gap: '0',
        fontSize: '10px',
        fontWeight: 600,
        color: colors.textMuted,
        padding: '6px 10px',
        borderBottom: `1px solid ${colors.border}`,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        <span>SAP Module</span>
        <span>Description</span>
        <span>Flow</span>
        <span>Method</span>
        <span>Snowflake Object</span>
        <span>AI Consumer</span>
        <span>Last Sync</span>
        <span>Status</span>
      </div>

      {dataFlows.map((flow, idx) => (
        <div
          key={idx}
          onMouseEnter={() => setHoveredRow(idx)}
          onMouseLeave={() => setHoveredRow(null)}
          style={{
            display: 'grid',
            gridTemplateColumns: '100px 120px 60px 70px 150px 120px 80px 70px',
            gap: '0',
            fontSize: '11px',
            padding: '6px 10px',
            borderBottom: `1px solid ${colors.border}20`,
            background: hoveredRow === idx ? colors.bg : 'transparent',
            transition: 'background 0.15s',
            alignItems: 'center',
          }}
        >
          <span style={{
            fontWeight: 700,
            color: sapBlue,
            background: sapBlue + '15',
            padding: '2px 6px',
            borderRadius: '3px',
            width: 'fit-content',
          }}>
            {flow.sapModule}
          </span>
          <span style={{ color: colors.text }}>{flow.sapLabel}</span>
          <span>
            {flow.direction === 'inbound' ? (
              <ArrowForwardIcon style={{ fontSize: 14, color: colors.success }} />
            ) : (
              <ArrowBackIcon style={{ fontSize: 14, color: colors.warning }} />
            )}
          </span>
          <span style={{
            color: flow.method === 'CDC' ? colors.success : flow.method === 'API' ? colors.warning : colors.accent,
            fontWeight: 600,
          }}>
            {flow.method}
          </span>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '10px',
            color: snowflakeBlue,
            background: snowflakeBlue + '15',
            padding: '2px 6px',
            borderRadius: '3px',
            width: 'fit-content',
          }}>
            {flow.snowflakeObject}
          </span>
          <span style={{
            color: colors.accent,
            fontSize: '10px',
            fontWeight: 500,
          }}>
            {flow.aiConsumer}
          </span>
          <span style={{ color: colors.textMuted, fontSize: '10px' }}>
            {flow.lastSync}
            {flow.rowCount > 0 && (
              <span style={{ color: colors.textDim, marginLeft: '4px' }}>
                ({flow.rowCount.toLocaleString()})
              </span>
            )}
          </span>
          <span>
            {flow.status === 'synced' && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: colors.success,
                fontSize: '10px',
                fontWeight: 600,
              }}>
                <SyncIcon style={{ fontSize: 12 }} />
                Live
              </span>
            )}
            {flow.status === 'pending' && (
              <span style={{
                color: colors.warning,
                fontSize: '10px',
                fontWeight: 600,
              }}>
                Ready
              </span>
            )}
          </span>
        </div>
      ))}

      <div style={{
        marginTop: '8px',
        padding: '6px 10px',
        background: colors.bg,
        borderRadius: '6px',
        fontSize: '10px',
        color: colors.textMuted,
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>4 inbound CDC streams (real-time) | 2 outbound API endpoints (on-demand write-back)</span>
        <span style={{ color: colors.success, fontWeight: 600 }}>All connectors healthy</span>
      </div>
    </div>
  );
};
