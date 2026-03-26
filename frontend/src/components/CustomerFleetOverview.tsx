import React from 'react';
import { useTheme } from '../context/ThemeContext';
import BusinessIcon from '@mui/icons-material/Business';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface Fab {
  fabName: string;
  location: string;
  country: string;
  scannerCount: number;
  critical: number;
  warning: number;
  healthy: number;
}

interface Customer {
  name: string;
  logo?: string;
  fabs: Fab[];
}

interface CustomerFleetOverviewProps {
  customers: Customer[];
  onFabClick?: (customer: string, fab: string) => void;
}

export const CustomerFleetOverview: React.FC<CustomerFleetOverviewProps> = ({
  customers,
  onFabClick,
}) => {
  const { colors } = useTheme();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
      {customers.map((customer, idx) => {
        const totalScanners = customer.fabs.reduce((sum, f) => sum + f.scannerCount, 0);
        const totalCritical = customer.fabs.reduce((sum, f) => sum + f.critical, 0);
        const totalWarning = customer.fabs.reduce((sum, f) => sum + f.warning, 0);
        
        return (
          <div
            key={idx}
            style={{
              background: colors.bg,
              borderRadius: '8px',
              border: `1px solid ${totalCritical > 0 ? colors.critical : colors.border}`,
              overflow: 'hidden',
            }}
          >
            <div style={{
              padding: '8px 12px',
              background: totalCritical > 0 ? colors.critical + '20' : colors.surface,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `1px solid ${colors.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BusinessIcon style={{ fontSize: 18, color: colors.accent }} />
                <span style={{ fontWeight: 600, fontSize: '13px', color: colors.text }}>
                  {customer.name}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                <span style={{ color: colors.textMuted }}>
                  {totalScanners} scanners
                </span>
                {totalCritical > 0 && (
                  <span style={{ color: colors.critical, fontWeight: 600 }}>
                    {totalCritical} critical
                  </span>
                )}
                {totalWarning > 0 && (
                  <span style={{ color: colors.warning }}>
                    {totalWarning} warning
                  </span>
                )}
              </div>
            </div>
            
            <div style={{ padding: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {customer.fabs.map((fab, fabIdx) => (
                <div
                  key={fabIdx}
                  onClick={() => onFabClick?.(customer.name, fab.fabName)}
                  style={{
                    background: colors.surface,
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    border: `1px solid ${fab.critical > 0 ? colors.critical : fab.warning > 0 ? colors.warning : colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                  }}
                >
                  {fab.critical > 0 ? (
                    <ErrorIcon style={{ fontSize: 12, color: colors.critical }} />
                  ) : fab.warning > 0 ? (
                    <WarningIcon style={{ fontSize: 12, color: colors.warning }} />
                  ) : (
                    <CheckCircleIcon style={{ fontSize: 12, color: colors.success }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 500, color: colors.text }}>{fab.fabName}</div>
                    <div style={{ color: colors.textMuted, fontSize: '10px' }}>{fab.location}</div>
                  </div>
                  <div style={{ 
                    marginLeft: '4px',
                    padding: '2px 6px',
                    background: colors.bg,
                    borderRadius: '4px',
                    fontWeight: 600,
                    color: fab.critical > 0 ? colors.critical : fab.warning > 0 ? colors.warning : colors.text,
                  }}>
                    {fab.scannerCount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
