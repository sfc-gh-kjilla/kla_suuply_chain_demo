import React, { useMemo } from 'react';
import type { SensorReading } from '../types';
import { useTheme } from '../context/ThemeContext';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface SensorHealthPanelProps {
  readings: SensorReading[];
  scannerId: string;
  onMetricClick?: (metricName: string, scannerId: string) => void;
}

export const SensorHealthPanel: React.FC<SensorHealthPanelProps> = ({
  readings,
  scannerId,
  onMetricClick,
}) => {
  const { colors } = useTheme();

  const sortedReadings = useMemo(() => {
    const scannerReadings = readings.filter(r => r.SCANNER_ID === scannerId);
    const statusOrder = { CRITICAL: 0, WARNING: 1, HEALTHY: 2 };
    return [...scannerReadings].sort((a, b) => {
      const orderDiff = statusOrder[a.STATUS] - statusOrder[b.STATUS];
      if (orderDiff !== 0) return orderDiff;
      return b.DEVIATION_PCT - a.DEVIATION_PCT;
    });
  }, [readings, scannerId]);

  if (sortedReadings.length === 0) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.textDim,
        fontSize: '13px',
      }}>
        Select a scanner to view sensor health
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return colors.critical;
      case 'WARNING': return colors.warning;
      default: return colors.success;
    }
  };

  const getBarPosition = (reading: SensorReading) => {
    const range = reading.MAX_THRESHOLD - reading.MIN_THRESHOLD;
    const pos = ((reading.CURRENT_VALUE - reading.MIN_THRESHOLD) / range) * 100;
    return Math.max(0, Math.min(100, pos));
  };

  const getWarningZone = (reading: SensorReading) => {
    const range = reading.MAX_THRESHOLD - reading.MIN_THRESHOLD;
    const left = ((reading.WARNING_LOW - reading.MIN_THRESHOLD) / range) * 100;
    const right = ((reading.WARNING_HIGH - reading.MIN_THRESHOLD) / range) * 100;
    return { left: Math.max(0, left), width: Math.min(100, right) - Math.max(0, left) };
  };

  const hoverBg = colors.bgElevated;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto', height: '100%' }}>
      {sortedReadings.map((reading, idx) => {
        const barPos = getBarPosition(reading);
        const greenZone = getWarningZone(reading);
        const statusColor = getStatusColor(reading.STATUS);

        return (
          <div
            key={idx}
            onClick={() => onMetricClick?.(reading.METRIC_NAME, reading.SCANNER_ID)}
            style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr 80px 24px',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              borderLeft: `3px solid ${statusColor}`,
              transition: 'background 0.15s',
              background: reading.STATUS === 'CRITICAL' ? statusColor + '10' : 'transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.background = reading.STATUS === 'CRITICAL' ? statusColor + '20' : hoverBg}
            onMouseLeave={e => e.currentTarget.style.background = reading.STATUS === 'CRITICAL' ? statusColor + '10' : 'transparent'}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: colors.text }}>
                {reading.METRIC_NAME}
              </div>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>
                {reading.CURRENT_VALUE} {reading.UNIT}
              </div>
            </div>

            <div style={{ position: 'relative', height: '16px', background: colors.bg, borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                left: `${greenZone.left}%`,
                width: `${greenZone.width}%`,
                height: '100%',
                background: colors.success + '25',
                borderRadius: '4px',
              }} />
              <div style={{
                position: 'absolute',
                left: 0,
                width: `${greenZone.left}%`,
                height: '100%',
                background: greenZone.left > 0 ? colors.critical + '15' : 'transparent',
              }} />
              <div style={{
                position: 'absolute',
                left: `${greenZone.left + greenZone.width}%`,
                right: 0,
                height: '100%',
                background: colors.critical + '15',
              }} />
              <div style={{
                position: 'absolute',
                left: `${barPos}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: statusColor,
                boxShadow: reading.STATUS !== 'HEALTHY' ? `0 0 6px ${statusColor}` : 'none',
                zIndex: 1,
              }} />
            </div>

            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: statusColor,
              textAlign: 'right',
            }}>
              {reading.STATUS}
            </div>

            <div>
              {reading.STATUS === 'CRITICAL' ? (
                <TrendingDownIcon style={{ fontSize: 16, color: colors.critical }} />
              ) : reading.STATUS === 'WARNING' ? (
                <TrendingUpIcon style={{ fontSize: 16, color: colors.warning }} />
              ) : (
                <CheckCircleIcon style={{ fontSize: 16, color: colors.success }} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
