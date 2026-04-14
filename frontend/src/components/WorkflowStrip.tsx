import React from 'react';
import { useTheme } from '../context/ThemeContext';
import CheckIcon from '@mui/icons-material/Check';

interface WorkflowStripProps {
  activeStep: string;
}

export const WorkflowStrip: React.FC<WorkflowStripProps> = ({ activeStep }) => {
  const { colors } = useTheme();

  const steps = [
    { id: 'detect', label: 'Detect' },
    { id: 'case', label: 'Case' },
    { id: 'parts', label: 'Parts' },
    { id: 'source', label: 'Source' },
    { id: 'optimize', label: 'Optimize' },
    { id: 'comply', label: 'Comply' },
    { id: 'cost', label: 'Cost' },
    { id: 'ship', label: 'Ship' },
    { id: 'resolve', label: 'Resolve' },
  ];

  const stepIndex = steps.findIndex(s => s.id === activeStep);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '6px 16px',
      borderBottom: `1px solid ${colors.border}`,
      background: colors.bgSecondary,
      gap: '0',
      flexShrink: 0,
    }}>
      {steps.map((step, idx) => {
        const isCompleted = idx < stepIndex;
        const isActive = idx === stepIndex;
        const isFuture = idx > stepIndex;

        return (
          <React.Fragment key={step.id}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: isActive ? '3px 10px 3px 3px' : '3px',
              borderRadius: '16px',
              background: isActive ? colors.tealSubtle : 'transparent',
              transition: 'all 0.25s ease',
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                fontWeight: 700,
                background: isCompleted ? colors.accent :
                  isActive ? colors.teal :
                  'transparent',
                border: isFuture ? `1.5px solid ${colors.textDim}` : 'none',
                color: isFuture ? colors.textDim : '#fff',
                transition: 'all 0.25s ease',
                boxShadow: isActive ? `0 0 8px ${colors.teal}40` : 'none',
                flexShrink: 0,
              }}>
                {isCompleted ? <CheckIcon style={{ fontSize: 11 }} /> : idx + 1}
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: isActive ? 600 : isCompleted ? 500 : 400,
                color: isCompleted ? colors.accent :
                  isActive ? colors.teal :
                  colors.textDim,
                letterSpacing: '0.2px',
                transition: 'all 0.25s ease',
                whiteSpace: 'nowrap',
              }}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: '2px',
                margin: '0 3px',
                background: isCompleted
                  ? `linear-gradient(90deg, ${colors.accent}, ${colors.accent}80)`
                  : colors.divider,
                borderRadius: '1px',
                transition: 'background 0.3s ease',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
