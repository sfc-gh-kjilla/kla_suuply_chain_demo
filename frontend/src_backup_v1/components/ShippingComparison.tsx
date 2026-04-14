import React from 'react';
import { useTheme } from '../context/ThemeContext';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import WarningIcon from '@mui/icons-material/Warning';
import FlightIcon from '@mui/icons-material/Flight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import type { ShippingOption } from '../types';

interface ShippingComparisonProps {
  options: ShippingOption[];
  partName: string;
  destinationScanner: string | null;
  onShip?: (option: ShippingOption) => void;
}

export const ShippingComparison: React.FC<ShippingComparisonProps> = ({ 
  options, 
  partName, 
  destinationScanner,
  onShip 
}) => {
  const { colors } = useTheme();

  if (!destinationScanner) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.textDim,
        fontSize: '14px',
      }}>
        Select a scanner to compare shipping options
      </div>
    );
  }

  const availableOptions = options.filter(opt => opt.QUANTITY_AVAILABLE > 0 && opt.SUPPLIER_BATCH_LOT !== 'B-2024-X');
  
  if (availableOptions.length === 0) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.warning,
        fontSize: '14px',
        gap: '8px',
      }}>
        <WarningIcon />
        No valid {partName} available (batch B-2024-X excluded)
      </div>
    );
  }

  const sortedOptions = [...availableOptions].sort((a, b) => (a.LANDED_COST ?? a.TOTAL_COST) - (b.LANDED_COST ?? b.TOTAL_COST));
  const bestCostOption = sortedOptions[0];
  const fastestOption = [...availableOptions].sort((a, b) => a.ESTIMATED_DAYS - b.ESTIMATED_DAYS)[0];

  const topOptions = sortedOptions.slice(0, 2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ 
        fontSize: '11px', 
        color: colors.textMuted,
        padding: '6px 10px',
        background: colors.bg,
        borderRadius: '6px',
        marginBottom: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span><strong>Part:</strong> {partName}</span>
        <span><strong>Ship To:</strong> {destinationScanner}</span>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: topOptions.length > 1 ? '1fr 1fr' : '1fr',
        gap: '12px',
        flex: 1,
      }}>
        {topOptions.map((option, idx) => {
          const isBestCost = option === bestCostOption;
          const isFastest = option === fastestOption && !isBestCost;
          const importDuty = option.IMPORT_DUTY ?? option.TAX_AMOUNT * 0.3;
          const vatAmount = option.TAX_AMOUNT - importDuty;
          const landedCost = option.LANDED_COST ?? option.TOTAL_COST;
          const tariffRate = option.TARIFF_RATE ?? 0;
          
          return (
            <div
              key={idx}
              style={{
                background: colors.bg,
                borderRadius: '10px',
                border: `2px solid ${isBestCost ? colors.success : colors.border}`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <div style={{
                background: isBestCost ? colors.success : isFastest ? colors.accent : colors.border,
                color: '#fff',
                padding: '8px 12px',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <WarehouseIcon style={{ fontSize: 16 }} />
                  {option.WAREHOUSE_LOCATION}
                </span>
                {isBestCost && <span>★ BEST VALUE</span>}
                {isFastest && <span>⚡ FASTEST</span>}
              </div>
              
              <div style={{ padding: '12px', flex: 1 }}>
                <div style={{ 
                  fontSize: '11px', 
                  color: colors.textMuted,
                  marginBottom: '8px',
                }}>
                  {option.WAREHOUSE_CITY}, {option.WAREHOUSE_STATE}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    background: colors.surface,
                    borderRadius: '6px',
                    padding: '8px',
                    textAlign: 'center',
                  }}>
                    <AccessTimeIcon style={{ fontSize: 20, color: colors.accent }} />
                    <div style={{ fontSize: '18px', fontWeight: 700, color: colors.text }}>
                      {option.ESTIMATED_DAYS}
                    </div>
                    <div style={{ fontSize: '10px', color: colors.textMuted }}>Days to Arrive</div>
                  </div>
                  <div style={{
                    background: colors.surface,
                    borderRadius: '6px',
                    padding: '8px',
                    textAlign: 'center',
                  }}>
                    <AttachMoneyIcon style={{ fontSize: 20, color: colors.success }} />
                    <div style={{ fontSize: '18px', fontWeight: 700, color: colors.text }}>
                      ${landedCost.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '10px', color: colors.textMuted }}>Landed Cost</div>
                  </div>
                </div>

                <div style={{
                  background: colors.surface,
                  borderRadius: '6px',
                  padding: '10px',
                  marginBottom: '12px',
                }}>
                  <div style={{ 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    color: colors.text,
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <ReceiptIcon style={{ fontSize: 14 }} />
                    Cost Breakdown
                  </div>
                  
                  <div style={{ fontSize: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: colors.textMuted }}>Unit Price</span>
                      <span style={{ color: colors.text }}>${option.UNIT_COST.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: colors.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FlightIcon style={{ fontSize: 12 }} /> Shipping
                      </span>
                      <span style={{ color: colors.text }}>${option.SHIPPING_COST.toLocaleString()}</span>
                    </div>
                    
                    <div style={{ 
                      borderTop: `1px dashed ${colors.border}`,
                      marginTop: '6px',
                      paddingTop: '6px',
                    }}>
                      <div style={{ 
                        fontSize: '10px', 
                        color: colors.warning, 
                        fontWeight: 600,
                        marginBottom: '4px',
                      }}>
                        DUTIES & TAXES {tariffRate > 0 && `(Tariff: ${(tariffRate * 100).toFixed(0)}%)`}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ color: colors.textMuted }}>Import Duty</span>
                        <span style={{ color: colors.warning }}>${importDuty.toFixed(0)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ color: colors.textMuted }}>VAT/GST ({(option.TAX_RATE * 100).toFixed(0)}%)</span>
                        <span style={{ color: colors.warning }}>${vatAmount.toFixed(0)}</span>
                      </div>
                    </div>
                    
                    <div style={{ 
                      borderTop: `1px solid ${colors.border}`,
                      marginTop: '6px',
                      paddingTop: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 600,
                    }}>
                      <span style={{ color: colors.text }}>Total</span>
                      <span style={{ color: colors.success }}>${landedCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  fontSize: '10px', 
                  color: colors.textMuted,
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}>
                  <span>Qty: <strong style={{ color: colors.text }}>{option.QUANTITY_AVAILABLE}</strong></span>
                  <span>Batch: <strong style={{ color: colors.text }}>{option.SUPPLIER_BATCH_LOT}</strong></span>
                </div>

                {onShip && (
                  <button
                    onClick={() => onShip(option)}
                    style={{
                      width: '100%',
                      background: isBestCost ? colors.success : colors.accent,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'transform 0.1s, opacity 0.1s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <LocalShippingIcon style={{ fontSize: 16 }} />
                    Execute Shipment
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {sortedOptions.length > 2 && (
        <div style={{
          marginTop: '10px',
          fontSize: '10px',
          color: colors.textMuted,
          textAlign: 'center',
        }}>
          +{sortedOptions.length - 2} more warehouse options available
        </div>
      )}
    </div>
  );
};
