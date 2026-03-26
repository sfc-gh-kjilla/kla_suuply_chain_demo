import React from 'react';
import { useTheme } from '../context/ThemeContext';
import BuildIcon from '@mui/icons-material/Build';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonIcon from '@mui/icons-material/Person';
import type { MaintenanceLog } from '../types';

interface MaintenanceHistoryProps {
  logs: MaintenanceLog[];
  scannerId: string | null;
}

export const MaintenanceHistory: React.FC<MaintenanceHistoryProps> = ({ logs, scannerId }) => {
  const { colors } = useTheme();

  const filteredLogs = scannerId 
    ? logs.filter(log => log.SCANNER_ID === scannerId)
    : logs;

  if (!scannerId) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.textDim,
        fontSize: '14px',
      }}>
        Select a scanner to view maintenance history
      </div>
    );
  }

  if (filteredLogs.length === 0) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.textDim,
        fontSize: '14px',
      }}>
        No maintenance records for {scannerId}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }}>
      {filteredLogs.map((log) => (
        <div
          key={log.LOG_ID}
          style={{
            background: colors.bg,
            borderRadius: '8px',
            padding: '12px',
            border: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: log.MAINTENANCE_TYPE === 'CORRECTIVE' ? colors.critical : colors.success,
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 600,
              }}>
                {log.MAINTENANCE_TYPE}
              </span>
              <span style={{ color: colors.textMuted, fontSize: '12px' }}>
                {new Date(log.MAINTENANCE_DATE).toLocaleDateString()}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.textMuted, fontSize: '11px' }}>
              <ScheduleIcon style={{ fontSize: 14 }} />
              {log.DOWNTIME_HOURS}h downtime
            </div>
          </div>
          
          <div style={{ fontSize: '13px', color: colors.text, marginBottom: '6px' }}>
            {log.ISSUE_DESCRIPTION}
          </div>
          
          <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>
            <strong>Resolution:</strong> {log.RESOLUTION_NOTES}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: colors.textMuted }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BuildIcon style={{ fontSize: 12 }} />
              {log.PARTS_REPLACED}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <PersonIcon style={{ fontSize: 12 }} />
              {log.TECHNICIAN_NAME}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
