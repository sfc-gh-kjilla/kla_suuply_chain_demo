import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import type { TelemetryReading } from '../types';
import { useTheme } from '../context/ThemeContext';

interface TelemetryChartProps {
  data: TelemetryReading[];
  scannerId: string;
}

function downsample<T extends { time: number; value: number }>(data: T[], threshold: number): T[] {
  if (data.length <= threshold) return data;
  const sampled: T[] = [data[0]];
  const bucketSize = (data.length - 2) / (threshold - 2);
  let a = 0;
  for (let i = 0; i < threshold - 2; i++) {
    const rangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const rangeEnd = Math.min(Math.floor((i + 2) * bucketSize) + 1, data.length);
    let avgX = 0, avgY = 0, count = 0;
    for (let j = rangeStart; j < rangeEnd; j++) {
      avgX += data[j].time;
      avgY += data[j].value;
      count++;
    }
    avgX /= count;
    avgY /= count;
    let maxArea = -1, nextA = rangeStart;
    for (let j = rangeStart; j < rangeEnd; j++) {
      const area = Math.abs(
        (data[a].time - avgX) * (data[j].value - data[a].value) -
        (data[a].time - data[j].time) * (avgY - data[a].value)
      );
      if (area > maxArea) { maxArea = area; nextA = j; }
    }
    sampled.push(data[nextA]);
    a = nextA;
  }
  sampled.push(data[data.length - 1]);
  return sampled;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = React.memo(({ data, scannerId }) => {
  const { theme, colors } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      setDimensions(prev => {
        if (Math.abs(prev.width - width) < 2 && Math.abs(prev.height - height) < 2) return prev;
        return { width: Math.floor(width), height: Math.floor(height) };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const chartData = useMemo(() => {
    const sorted = data
      .filter(r => r.SCANNER_ID === scannerId)
      .sort((a, b) => new Date(a.READING_TIMESTAMP).getTime() - new Date(b.READING_TIMESTAMP).getTime())
      .map(r => ({
        ...r,
        time: new Date(r.READING_TIMESTAMP).getTime(),
        value: r.METRIC_VALUE,
      }));
    const sampled = downsample(sorted, 200);
    return sampled.map(r => ({
      ...r,
      timeLabel: new Date(r.time).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    }));
  }, [data, scannerId]);

  const tooltipBg = theme === 'dark' ? '#1e1e1e' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#333' : '#ddd';
  const gridColor = theme === 'dark' ? '#333' : '#e0e0e0';
  const axisColor = theme === 'dark' ? '#444' : '#ccc';

  const renderTooltip = useCallback(({ active, payload }: any) => {
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
          <p style={{ margin: 0, color: colors.textMuted, fontSize: '12px' }}>{payload[0].payload.timeLabel}</p>
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
  }, [tooltipBg, tooltipBorder, colors]);

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
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: 200, overflow: 'hidden' }}>
      <LineChart
        width={dimensions.width}
        height={dimensions.height}
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="timeLabel"
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
        <Tooltip content={renderTooltip} />
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
          isAnimationActive={false}
        />
      </LineChart>
    </div>
  );
});
