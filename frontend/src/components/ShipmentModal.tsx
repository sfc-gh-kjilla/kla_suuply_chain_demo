import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StorageIcon from '@mui/icons-material/Storage';
import type { ShippingOption } from '../types';

interface ShipmentModalProps {
  option: ShippingOption;
  destinationScanner: string;
  caseId?: string;
  engineer?: string;
  onClose: () => void;
  onConfirm: () => void;
}

interface ActionStep {
  label: string;
  system: string;
  status: 'pending' | 'executing' | 'complete';
}

export const ShipmentModal: React.FC<ShipmentModalProps> = ({
  option,
  destinationScanner,
  caseId,
  engineer,
  onClose,
  onConfirm,
}) => {
  const { colors } = useTheme();
  const [executing, setExecuting] = useState(false);
  const [steps, setSteps] = useState<ActionStep[]>([
    { label: 'Create SAP Purchase Order (ME21N)', system: 'SAP SD', status: 'pending' },
    { label: `Decrement inventory at ${option.WAREHOUSE_LOCATION}`, system: 'SAP WM', status: 'pending' },
    { label: `Update case ${caseId || 'ESC-2026-4281'} status`, system: 'Snowflake', status: 'pending' },
    { label: `Notify ${engineer || 'Field Engineer'} via Teams`, system: 'Notification', status: 'pending' },
    { label: 'Post material document to SAP FI', system: 'SAP FI', status: 'pending' },
  ]);

  const landedCost = option.LANDED_COST ?? option.TOTAL_COST;

  useEffect(() => {
    if (!executing) return;
    let current = 0;
    const interval = setInterval(() => {
      if (current >= steps.length) {
        clearInterval(interval);
        setTimeout(() => onConfirm(), 800);
        return;
      }
      setSteps(prev => prev.map((s, i) => {
        if (i === current) return { ...s, status: 'executing' };
        if (i === current - 1) return { ...s, status: 'complete' };
        return s;
      }));
      if (current > 0) {
        setSteps(prev => prev.map((s, i) => i === current - 1 ? { ...s, status: 'complete' } : s));
      }
      current++;
    }, 700);

    return () => clearInterval(interval);
  }, [executing]);

  useEffect(() => {
    if (executing && steps.every(s => s.status === 'complete' || s.status === 'executing')) {
      const lastExecuting = steps.findIndex(s => s.status === 'executing');
      if (lastExecuting === steps.length - 1) {
        setTimeout(() => {
          setSteps(prev => prev.map(s => ({ ...s, status: 'complete' as const })));
        }, 700);
      }
    }
  }, [steps, executing]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: colors.bgSecondary,
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        width: '480px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LocalShippingIcon style={{ fontSize: 20, color: colors.accent }} />
            <span style={{ fontWeight: 700, fontSize: '14px', color: colors.text }}>
              {executing ? 'Executing Shipment Order' : 'Confirm Shipment Order'}
            </span>
          </div>
          {!executing && (
            <button onClick={onClose} style={{
              background: 'transparent',
              border: 'none',
              color: colors.textMuted,
              cursor: 'pointer',
              padding: '4px',
            }}>
              <CloseIcon style={{ fontSize: 18 }} />
            </button>
          )}
        </div>

        <div style={{ padding: '16px 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '16px',
          }}>
            <div style={{ background: colors.bg, borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>Part</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: colors.text }}>994-023 NLO Crystal Assembly</div>
            </div>
            <div style={{ background: colors.bg, borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>Landed Cost</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: colors.success }}>${landedCost.toLocaleString()}</div>
            </div>
            <div style={{ background: colors.bg, borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>Ship From</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: colors.text }}>{option.WAREHOUSE_LOCATION}</div>
            </div>
            <div style={{ background: colors.bg, borderRadius: '8px', padding: '10px' }}>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>Ship To</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: colors.text }}>{destinationScanner}</div>
            </div>
          </div>

          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            color: colors.textMuted,
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Actions to Execute
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            {steps.map((step, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '6px',
                background: step.status === 'executing' ? colors.accent + '10' :
                            step.status === 'complete' ? colors.success + '10' : colors.bg,
                border: step.status === 'executing' ? `1px solid ${colors.accent}30` :
                        step.status === 'complete' ? `1px solid ${colors.success}30` :
                        `1px solid ${colors.border}`,
                transition: 'all 0.3s ease',
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {step.status === 'complete' && <CheckCircleIcon style={{ fontSize: 18, color: colors.success }} />}
                  {step.status === 'executing' && (
                    <HourglassBottomIcon style={{
                      fontSize: 18,
                      color: colors.accent,
                      animation: 'spin 1s linear infinite',
                    }} />
                  )}
                  {step.status === 'pending' && (
                    <div style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      border: `2px solid ${colors.border}`,
                    }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: step.status === 'executing' ? 600 : 400,
                    color: step.status === 'complete' ? colors.success :
                           step.status === 'executing' ? colors.accent : colors.text,
                  }}>
                    {step.label}
                  </div>
                </div>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  color: colors.textMuted,
                  background: colors.bg,
                  padding: '2px 6px',
                  borderRadius: '3px',
                }}>
                  {step.system}
                </span>
              </div>
            ))}
          </div>

          {!executing && (
            <div style={{
              display: 'flex',
              gap: '8px',
            }}>
              <button onClick={onClose} style={{
                flex: 1,
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: '10px',
                color: colors.textMuted,
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                Cancel
              </button>
              <button onClick={() => setExecuting(true)} style={{
                flex: 2,
                background: colors.accent,
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}>
                <StorageIcon style={{ fontSize: 16 }} />
                Execute via Cortex Agent
              </button>
            </div>
          )}

          {executing && steps.every(s => s.status === 'complete') && (
            <div style={{
              textAlign: 'center',
              padding: '12px',
              background: colors.success + '15',
              borderRadius: '8px',
              border: `1px solid ${colors.success}30`,
            }}>
              <CheckCircleIcon style={{ fontSize: 28, color: colors.success, marginBottom: '4px' }} />
              <div style={{ fontSize: '13px', fontWeight: 700, color: colors.success }}>
                All actions completed successfully
              </div>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>
                SAP PO created | Inventory updated | Case status synced
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
