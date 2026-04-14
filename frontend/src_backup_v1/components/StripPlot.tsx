import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';
import type { FleetMetric } from '../types';
import { useTheme } from '../context/ThemeContext';

interface StripPlotProps {
  data: FleetMetric[];
  onScannerClick?: (scannerId: string) => void;
  selectedScanner?: string | null;
}

const CRITICAL_THRESHOLD = 90;
const WARNING_THRESHOLD = 95;

export const StripPlot: React.FC<StripPlotProps> = ({ data, onScannerClick, selectedScanner }) => {
  const { theme, colors } = useTheme();

  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      x: index + (Math.random() - 0.5) * 0.4,
      y: item.CURRENT_POWER_MW,
    }));
  }, [data]);

  const fleetMean = useMemo(() => {
    const sum = data.reduce((acc, item) => acc + item.CURRENT_POWER_MW, 0);
    return sum / data.length;
  }, [data]);

  const getPointColor = (value: number, scannerId: string) => {
    if (selectedScanner === scannerId) return '#9C27B0';
    if (value < CRITICAL_THRESHOLD) return colors.critical;
    if (value < WARNING_THRESHOLD) return colors.warning;
    return colors.success;
  };

  const tooltipBg = theme === 'dark' ? '#1e1e1e' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#333' : '#ddd';
  const gridColor = theme === 'dark' ? '#333' : '#e0e0e0';
  const axisColor = theme === 'dark' ? '#444' : '#ccc';
  const selectedStroke = theme === 'dark' ? '#fff' : '#333';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as FleetMetric;
      return (
        <div style={{
          backgroundColor: tooltipBg,
          border: `1px solid ${tooltipBorder}`,
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: colors.text }}>{data.SCANNER_ID}</p>
          <p style={{ margin: '4px 0', color: colors.textMuted, fontSize: '12px' }}>{data.FAB_NAME}</p>
          <p style={{ margin: '4px 0', color: getPointColor(data.CURRENT_POWER_MW, data.SCANNER_ID) }}>
            Power: {data.CURRENT_POWER_MW.toFixed(1)} mW
          </p>
          <p style={{ margin: '4px 0', color: colors.textMuted, fontSize: '11px' }}>
            Batch: {data.CRYSTAL_BATCH_LOT}
          </p>
          <p style={{ margin: '4px 0', color: colors.textMuted, fontSize: '11px' }}>
            Z-Score: {data.Z_SCORE.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 300 }}>
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            type="number" 
            dataKey="x" 
            tick={false}
            axisLine={{ stroke: axisColor }}
            label={{ value: 'Scanners', position: 'bottom', fill: colors.textMuted, offset: 0 }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            domain={[70, 140]}
            axisLine={{ stroke: axisColor }}
            tick={{ fill: colors.textMuted }}
            label={{ value: 'Power (mW)', angle: -90, position: 'insideLeft', fill: colors.textMuted }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <ReferenceLine 
            y={CRITICAL_THRESHOLD} 
            stroke={colors.critical} 
            strokeDasharray="5 5"
            label={{ value: '90mW Critical', fill: colors.critical, fontSize: 11, position: 'right' }}
          />
          <ReferenceLine 
            y={WARNING_THRESHOLD} 
            stroke={colors.warning} 
            strokeDasharray="5 5"
            label={{ value: '95mW Warning', fill: colors.warning, fontSize: 11, position: 'right' }}
          />
          <ReferenceLine 
            y={fleetMean} 
            stroke={colors.accent} 
            strokeWidth={2}
            label={{ value: `Fleet Mean: ${fleetMean.toFixed(1)}mW`, fill: colors.accent, fontSize: 11, position: 'right' }}
          />
          
          <Scatter 
            data={chartData} 
            onClick={(data) => onScannerClick?.(data.SCANNER_ID)}
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getPointColor(entry.CURRENT_POWER_MW, entry.SCANNER_ID)}
                r={selectedScanner === entry.SCANNER_ID ? 10 : 7}
                stroke={selectedScanner === entry.SCANNER_ID ? selectedStroke : 'none'}
                strokeWidth={2}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
