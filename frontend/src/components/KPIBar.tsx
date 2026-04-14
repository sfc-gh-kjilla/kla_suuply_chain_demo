import React from 'react';
import { useTheme } from '../context/ThemeContext';
import type { EscalationCase } from '../types';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface KPIBarProps {
  cases: EscalationCase[];
}

export const KPIBar: React.FC<KPIBarProps> = ({ cases }) => {
  const { colors } = useTheme();

  const openCases = cases.filter(c => c.STATUS !== 'RESOLVED');
  const sev1Cases = openCases.filter(c => c.SEVERITY === 'SEV1');
  const breachedCases = openCases.filter(c => c.SLA_REMAINING_HOURS < 0);

  const revenueAtRisk = sev1Cases.length * 1.8 + openCases.filter(c => c.SEVERITY === 'SEV2').length * 0.6 + openCases.filter(c => c.SEVERITY === 'SEV3').length * 0.2;
  const slaPenaltyExposure = breachedCases.reduce((sum, c) => {
    const hoursBreached = Math.abs(c.SLA_REMAINING_HOURS);
    const penaltyRate = c.SEVERITY === 'SEV1' ? 5000 : c.SEVERITY === 'SEV2' ? 2000 : 500;
    return sum + (hoursBreached * penaltyRate / 24);
  }, 0);
  const avgResolutionDays = openCases.reduce((sum, c) => sum + c.AGE_DAYS, 0) / (openCases.length || 1);
  const partsCostMTD = openCases.filter(c => c.PARTS_NEEDED.length > 0).length * 51480;
  const uniqueEngineers = new Set(openCases.map(c => c.ASSIGNED_ENGINEER)).size;
  const casesPerEngineer = openCases.length / (uniqueEngineers || 1);

  const kpis = [
    { label: 'Revenue at Risk', value: `$${revenueAtRisk.toFixed(1)}M`, alert: revenueAtRisk > 3, icon: revenueAtRisk > 3 },
    { label: 'SLA Penalty Exposure', value: `$${Math.round(slaPenaltyExposure / 1000)}K`, alert: breachedCases.length > 0, icon: breachedCases.length > 0 },
    { label: 'Avg Resolution', value: `${avgResolutionDays.toFixed(1)}d`, alert: false, icon: false },
    { label: 'Parts Cost MTD', value: `$${Math.round(partsCostMTD / 1000)}K`, alert: false, icon: false },
    { label: 'Load / Engineer', value: casesPerEngineer.toFixed(1), alert: casesPerEngineer > 2, icon: false },
    { label: 'Batch B-2024-X', value: '5 / 7', alert: true, icon: true },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      padding: '8px 12px',
      borderBottom: `1px solid ${colors.border}`,
      background: colors.bgSecondary,
      flexShrink: 0,
    }}>
      {kpis.map((kpi, idx) => (
        <div key={idx} style={{
          flex: 1,
          padding: '10px 12px',
          borderRadius: '10px',
          background: kpi.alert ? colors.critical + '08' : colors.surface,
          border: `1px solid ${kpi.alert ? colors.critical + '25' : colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'default',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = colors.panelShadow;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {kpi.alert && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: `linear-gradient(90deg, ${colors.critical}, ${colors.critical}80)`,
              borderRadius: '2px 2px 0 0',
            }} />
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '18px',
              fontWeight: 700,
              color: kpi.alert ? colors.critical : colors.text,
              fontFamily: "'Inter', monospace",
              letterSpacing: '-0.5px',
              lineHeight: 1,
            }}>
              {kpi.value}
            </span>
            {kpi.icon && (
              kpi.label.includes('Batch') ?
                <WarningAmberIcon style={{ fontSize: 14, color: colors.warning }} /> :
                <TrendingDownIcon style={{ fontSize: 14, color: colors.critical }} />
            )}
          </div>
          <span style={{
            fontSize: '9px',
            color: colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 500,
          }}>
            {kpi.label}
          </span>
        </div>
      ))}
    </div>
  );
};
