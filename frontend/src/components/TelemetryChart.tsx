import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import type { TelemetryReading } from '../types';
import { useTheme } from '../context/ThemeContext';

interface TelemetryChartProps {
  data: TelemetryReading[];
  scannerId: string;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ data, scannerId }) => {
  const { theme, colors } = useTheme();

  const chartData = data
    .filter(r => r.SCANNER_ID === scannerId)
    .sort((a, b) => new Date(a.READING_TIMESTAMP).getTime() - new Date(b.READING_TIMESTAMP).getTime())
    .map(r => ({
      ...r,
      time: new Date(r.READING_TIMESTAMP).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit',
        minute: '2-digit'
      }),
      value: r.METRIC_VALUE,
    }));

  const tooltipBg = theme === 'dark' ? '#1e1e1e' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#333' : '#ddd';
  const gridColor = theme === 'dark' ? '#333' : '#e0e0e0';
  const axisColor = theme === 'dark' ? '#444' : '#ccc';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const isAnomaly = value < 90;
      return (
        <div style={{
          background: tooltipBg,
          border: `1px solid ${tooltipBorder}`,
          borderRadius: '8px',
          padding: '12px',
        }}>
          <p style={{ margin: 0, color: colors.textMuted, fontSize: '12px' }}>{payload[0].payload.time}</p>
          <p style={{ 
            margin: '4px 0 0 0', 
            fontWeight: 'bold',
            color: isAnomaly ? colors.critical : value < 95 ? colors.warning : colors.success,
            fontSize: '16px'
          }}>
            {value.toFixed(1)} mW
          </p>
          {isAnomaly && (
            <p style={{ margin: '4px 0 0 0', color: colors.critical, fontSize: '11px' }}>
              Below critical threshold
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: colors.textMuted 
      }}>
        No telemetry data available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 200 }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="time" 
            tick={{ fill: colors.textMuted, fontSize: 10 }}
            interval="preserveStartEnd"
            axisLine={{ stroke: axisColor }}
          />
          <YAxis 
            domain={[70, 140]}
            tick={{ fill: colors.textMuted }}
            axisLine={{ stroke: axisColor }}
            label={{ value: 'Power (mW)', angle: -90, position: 'insideLeft', fill: colors.textMuted }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <ReferenceLine 
            y={90} 
            stroke={colors.critical} 
            strokeDasharray="5 5"
            label={{ value: 'Critical: 90mW', fill: colors.critical, fontSize: 10 }}
          />
          <ReferenceLine 
            y={95} 
            stroke={colors.warning} 
            strokeDasharray="5 5"
            label={{ value: 'Warning: 95mW', fill: colors.warning, fontSize: 10 }}
          />
          
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={colors.accent}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: colors.accent }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
