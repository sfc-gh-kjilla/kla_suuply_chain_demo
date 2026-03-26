import React, { useMemo } from 'react';
import type { FleetMetric } from '../types';
import { useTheme } from '../context/ThemeContext';

interface GlobalMapProps {
  data: FleetMetric[];
  onScannerClick?: (scannerId: string) => void;
  selectedScanner?: string | null;
}

const locationGroups: Record<string, { x: number; y: number; label: string }> = {
  'Taiwan': { x: 680, y: 200, label: 'Taiwan' },
  'South Korea': { x: 700, y: 160, label: 'S. Korea' },
  'Japan': { x: 740, y: 155, label: 'Japan' },
  'China': { x: 620, y: 180, label: 'China' },
  'Singapore': { x: 620, y: 270, label: 'Singapore' },
  'USA': { x: 150, y: 180, label: 'USA' },
  'Belgium': { x: 420, y: 125, label: 'Belgium' },
  'Netherlands': { x: 415, y: 120, label: 'Netherlands' },
  'Germany': { x: 430, y: 130, label: 'Germany' },
  'France': { x: 410, y: 140, label: 'France' },
};

export const GlobalMap: React.FC<GlobalMapProps> = ({ data, onScannerClick, selectedScanner }) => {
  const { theme, colors } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return colors.critical;
      case 'WARNING': return colors.warning;
      case 'OPERATIONAL': return colors.success;
      default: return colors.textMuted;
    }
  };

  const groupedData = useMemo(() => {
    const groups: Record<string, FleetMetric[]> = {};
    data.forEach(item => {
      const country = item.FAB_COUNTRY;
      if (!groups[country]) groups[country] = [];
      groups[country].push(item);
    });
    return groups;
  }, [data]);

  const getWorstStatus = (scanners: FleetMetric[]) => {
    if (scanners.some(s => s.STATUS === 'CRITICAL')) return 'CRITICAL';
    if (scanners.some(s => s.STATUS === 'WARNING')) return 'WARNING';
    return 'OPERATIONAL';
  };

  const bgColor = theme === 'dark' ? '#0a0f16' : '#e8f4fc';
  const landFill1 = theme === 'dark' ? '#1a2332' : '#c5dde8';
  const landFill2 = theme === 'dark' ? '#141d29' : '#b8d4e3';
  const landStroke = theme === 'dark' ? '#2a3f5f' : '#90b4c8';
  const legendBg = theme === 'dark' ? '#1a1a2e' : '#ffffff';

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 350, position: 'relative' }}>
      <svg viewBox="0 0 800 400" style={{ width: '100%', height: '100%', background: colors.bgSecondary, transition: 'background 0.3s' }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={landFill1} />
            <stop offset="100%" stopColor={landFill2} />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="800" height="400" fill={bgColor} />
        
        <path d="M80,100 Q150,90 200,110 Q280,80 350,100 Q380,95 400,105 L400,220 Q350,240 300,220 Q200,250 120,220 Q90,200 80,180 Z" 
              fill="url(#landGradient)" stroke={landStroke} strokeWidth="1" opacity="0.8"/>
        
        <path d="M380,80 Q450,70 500,90 Q550,100 580,95 L580,200 Q530,220 480,200 Q420,210 380,190 Z" 
              fill="url(#landGradient)" stroke={landStroke} strokeWidth="1" opacity="0.8"/>
        
        <path d="M600,120 Q680,100 750,130 Q770,150 760,180 Q740,220 700,230 Q650,240 620,220 Q590,200 600,170 Z" 
              fill="url(#landGradient)" stroke={landStroke} strokeWidth="1" opacity="0.8"/>
        
        <path d="M580,260 Q620,250 640,280 Q630,310 600,300 Q570,280 580,260 Z" 
              fill="url(#landGradient)" stroke={landStroke} strokeWidth="1" opacity="0.8"/>

        {Object.entries(groupedData).map(([country, scanners]) => {
          const location = locationGroups[country];
          if (!location) return null;
          
          const worstStatus = getWorstStatus(scanners);
          const color = getStatusColor(worstStatus);
          const isSelected = scanners.some(s => s.SCANNER_ID === selectedScanner);
          
          return (
            <g key={country} style={{ cursor: 'pointer' }} onClick={() => onScannerClick?.(scanners[0].SCANNER_ID)}>
              <circle
                cx={location.x}
                cy={location.y}
                r={isSelected ? 18 : 14}
                fill={color}
                opacity={0.3}
                filter="url(#glow)"
              />
              <circle
                cx={location.x}
                cy={location.y}
                r={isSelected ? 10 : 7}
                fill={color}
                stroke={isSelected ? (theme === 'dark' ? '#fff' : '#333') : 'none'}
                strokeWidth={2}
              />
              {worstStatus === 'CRITICAL' && (
                <circle
                  cx={location.x}
                  cy={location.y}
                  r={20}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  opacity={0.6}
                >
                  <animate attributeName="r" from="10" to="25" dur="1.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite"/>
                </circle>
              )}
              <text
                x={location.x}
                y={location.y + 28}
                textAnchor="middle"
                fill={colors.textMuted}
                fontSize="10"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {location.label}
              </text>
              <text
                x={location.x}
                y={location.y + 40}
                textAnchor="middle"
                fill={color}
                fontSize="9"
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight="bold"
              >
                {scanners.length} scanner{scanners.length > 1 ? 's' : ''}
              </text>
            </g>
          );
        })}

        <g transform="translate(20, 340)">
          <rect x="0" y="0" width="180" height="50" fill={legendBg} rx="4" opacity="0.9" stroke={colors.border}/>
          <circle cx="15" cy="15" r="5" fill={colors.success}/>
          <text x="25" y="18" fill={colors.textMuted} fontSize="10">Operational</text>
          <circle cx="90" cy="15" r="5" fill={colors.warning}/>
          <text x="100" y="18" fill={colors.textMuted} fontSize="10">Warning</text>
          <circle cx="15" cy="35" r="5" fill={colors.critical}/>
          <text x="25" y="38" fill={colors.textMuted} fontSize="10">Critical</text>
        </g>
      </svg>
    </div>
  );
};
