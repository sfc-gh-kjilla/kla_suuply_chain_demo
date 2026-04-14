import React from 'react';
import { useTheme } from '../context/ThemeContext';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface WarehouseStock {
  location: string;
  city: string;
  country: string;
  quantity: number;
  reorderPoint: number;
  inTransit: number;
  backordered: number;
}

interface PartsInventoryProps {
  partId: string;
  partName: string;
  warehouses: WarehouseStock[];
  onWarehouseClick?: (warehouse: string) => void;
}

export const PartsInventory: React.FC<PartsInventoryProps> = ({
  partId,
  partName,
  warehouses,
  onWarehouseClick,
}) => {
  const { colors } = useTheme();

  const totalStock = warehouses.reduce((sum, w) => sum + w.quantity, 0);
  const totalInTransit = warehouses.reduce((sum, w) => sum + w.inTransit, 0);
  const lowStockCount = warehouses.filter(w => w.quantity <= w.reorderPoint && w.quantity > 0).length;
  const outOfStockCount = warehouses.filter(w => w.quantity === 0).length;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
      }}>
        <div>
          <div style={{ fontSize: '11px', color: colors.textMuted }}>Part #{partId}</div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>{partName}</div>
        </div>
        <div style={{
          display: 'flex',
          gap: '16px',
          fontSize: '11px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: colors.textMuted }}>Total Stock</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: colors.success }}>{totalStock}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: colors.textMuted }}>In Transit</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: colors.accent }}>{totalInTransit}</div>
          </div>
          {outOfStockCount > 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: colors.critical }}>Out of Stock</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: colors.critical }}>{outOfStockCount}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        overflowY: 'auto',
      }}>
        {warehouses.map((warehouse, idx) => {
          const isLowStock = warehouse.quantity <= warehouse.reorderPoint && warehouse.quantity > 0;
          const isOutOfStock = warehouse.quantity === 0;
          const stockStatus = isOutOfStock ? 'critical' : isLowStock ? 'warning' : 'good';
          
          return (
            <div
              key={idx}
              onClick={() => onWarehouseClick?.(warehouse.location)}
              style={{
                background: colors.bg,
                borderRadius: '8px',
                padding: '10px',
                border: `1px solid ${
                  isOutOfStock ? colors.critical : 
                  isLowStock ? colors.warning : 
                  colors.border
                }`,
                cursor: onWarehouseClick ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <WarehouseIcon style={{ 
                    fontSize: 16, 
                    color: isOutOfStock ? colors.critical : isLowStock ? colors.warning : colors.accent 
                  }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: colors.text }}>
                      {warehouse.location}
                    </div>
                    <div style={{ fontSize: '10px', color: colors.textMuted }}>
                      {warehouse.city}, {warehouse.country}
                    </div>
                  </div>
                </div>
                {stockStatus === 'critical' && (
                  <WarningIcon style={{ fontSize: 14, color: colors.critical }} />
                )}
                {stockStatus === 'warning' && (
                  <TrendingDownIcon style={{ fontSize: 14, color: colors.warning }} />
                )}
                {stockStatus === 'good' && (
                  <CheckCircleIcon style={{ fontSize: 14, color: colors.success }} />
                )}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px',
                fontSize: '10px',
              }}>
                <div style={{ textAlign: 'center', padding: '4px', background: colors.surface, borderRadius: '4px' }}>
                  <div style={{ color: colors.textMuted }}>On Hand</div>
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: '14px',
                    color: isOutOfStock ? colors.critical : isLowStock ? colors.warning : colors.text 
                  }}>
                    {warehouse.quantity}
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '4px', background: colors.surface, borderRadius: '4px' }}>
                  <div style={{ color: colors.textMuted }}>In Transit</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: colors.accent }}>
                    {warehouse.inTransit}
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '4px', background: colors.surface, borderRadius: '4px' }}>
                  <div style={{ color: colors.textMuted }}>Backorder</div>
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: '14px', 
                    color: warehouse.backordered > 0 ? colors.warning : colors.textMuted 
                  }}>
                    {warehouse.backordered}
                  </div>
                </div>
              </div>

              {isLowStock && (
                <div style={{
                  marginTop: '6px',
                  padding: '4px 6px',
                  background: colors.warning + '20',
                  borderRadius: '4px',
                  fontSize: '9px',
                  color: colors.warning,
                  textAlign: 'center',
                }}>
                  Below reorder point ({warehouse.reorderPoint})
                </div>
              )}
              {isOutOfStock && warehouse.backordered > 0 && (
                <div style={{
                  marginTop: '6px',
                  padding: '4px 6px',
                  background: colors.critical + '20',
                  borderRadius: '4px',
                  fontSize: '9px',
                  color: colors.critical,
                  textAlign: 'center',
                }}>
                  {warehouse.backordered} units backordered
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
