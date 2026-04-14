import React from 'react';
import type { Alert } from '../types';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { useTheme } from '../context/ThemeContext';

interface AlertsPanelProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onAlertClick }) => {
  const { theme, colors } = useTheme();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return colors.critical;
      case 'WARNING': return colors.warning;
      default: return colors.accent;
    }
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'CRITICAL') {
      return <ErrorIcon style={{ color: colors.critical, fontSize: 20 }} />;
    }
    return <WarningIcon style={{ color: colors.warning, fontSize: 20 }} />;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const openAlerts = alerts.filter(a => a.STATUS !== 'RESOLVED');
  const criticalCount = openAlerts.filter(a => a.SEVERITY === 'CRITICAL').length;
  const warningCount = openAlerts.filter(a => a.SEVERITY === 'WARNING').length;

  const hoverBg = theme === 'dark' ? '#161b22' : '#f0f0f0';

  return (
    <div style={{
      background: colors.bgSecondary,
      borderRadius: '12px',
      border: `1px solid ${colors.border}`,
      overflow: 'hidden',
      transition: 'background 0.3s, border-color 0.3s',
    }}>
      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h3 style={{ margin: 0, fontSize: '14px', color: colors.text }}>Active Alerts</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          {criticalCount > 0 && (
            <span style={{
              background: theme === 'dark' ? '#3d1f1f' : '#ffebee',
              color: colors.critical,
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              {criticalCount} Critical
            </span>
          )}
          {warningCount > 0 && (
            <span style={{
              background: theme === 'dark' ? '#3d2e1f' : '#fff3e0',
              color: colors.warning,
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              {warningCount} Warning
            </span>
          )}
        </div>
      </div>

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {openAlerts.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: colors.textMuted }}>
            No active alerts
          </div>
        ) : (
          openAlerts.map((alert) => (
            <div
              key={alert.ALERT_ID}
              onClick={() => onAlertClick?.(alert)}
              style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${colors.border}`,
                cursor: 'pointer',
                transition: 'background 0.2s',
                borderLeft: `3px solid ${getSeverityColor(alert.SEVERITY)}`,
              }}
              onMouseOver={(e) => e.currentTarget.style.background = hoverBg}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                {getSeverityIcon(alert.SEVERITY)}
                <span style={{ fontWeight: 600, color: colors.text, fontSize: '13px' }}>
                  {alert.SCANNER_ID}
                </span>
                <span style={{ color: colors.textMuted, fontSize: '11px', marginLeft: 'auto' }}>
                  {formatTime(alert.ALERT_TIMESTAMP)}
                </span>
              </div>
              <div style={{ color: colors.textMuted, fontSize: '12px', marginLeft: '28px' }}>
                Power: {alert.METRIC_VALUE.toFixed(1)} mW (threshold: {alert.THRESHOLD_VALUE} mW)
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
