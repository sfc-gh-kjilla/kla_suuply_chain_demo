import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface Warehouse {
  location: string;
  city: string;
  state: string;
  quantity: number;
}

interface PartTransferProps {
  partId: string;
  partName: string;
  warehouses: Warehouse[];
  onTransfer?: (from: string, to: string, quantity: number) => void;
}

export const PartTransfer: React.FC<PartTransferProps> = ({
  partId,
  partName,
  warehouses,
  onTransfer,
}) => {
  const { colors } = useTheme();
  const [fromWarehouse, setFromWarehouse] = useState<string>('');
  const [toWarehouse, setToWarehouse] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const availableWarehouses = warehouses.filter(w => w.quantity > 0);
  const fromSelected = warehouses.find(w => w.location === fromWarehouse);
  const maxQuantity = fromSelected?.quantity || 0;

  const handleTransfer = () => {
    if (fromWarehouse && toWarehouse && quantity > 0 && onTransfer) {
      onTransfer(fromWarehouse, toWarehouse, quantity);
    }
  };

  return (
    <div style={{
      background: colors.bgSecondary,
      borderRadius: '12px',
      border: `1px solid ${colors.border}`,
      padding: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <SwapHorizIcon style={{ color: colors.accent }} />
        <h3 style={{ margin: 0, fontSize: '14px', color: colors.text }}>
          Transfer Inventory
        </h3>
      </div>

      <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '16px' }}>
        <strong>Part:</strong> {partId} - {partName}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '11px', color: colors.textMuted, display: 'block', marginBottom: '6px' }}>
            From Warehouse
          </label>
          <select
            value={fromWarehouse}
            onChange={(e) => {
              setFromWarehouse(e.target.value);
              if (e.target.value === toWarehouse) setToWarehouse('');
            }}
            style={{
              width: '100%',
              padding: '10px',
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              color: colors.text,
              fontSize: '13px',
            }}
          >
            <option value="">Select source...</option>
            {availableWarehouses.map(w => (
              <option key={w.location} value={w.location}>
                {w.location} ({w.quantity} avail)
              </option>
            ))}
          </select>
        </div>

        <ArrowForwardIcon style={{ color: colors.textMuted, marginTop: '20px' }} />

        <div>
          <label style={{ fontSize: '11px', color: colors.textMuted, display: 'block', marginBottom: '6px' }}>
            To Warehouse
          </label>
          <select
            value={toWarehouse}
            onChange={(e) => setToWarehouse(e.target.value)}
            disabled={!fromWarehouse}
            style={{
              width: '100%',
              padding: '10px',
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              color: colors.text,
              fontSize: '13px',
              opacity: fromWarehouse ? 1 : 0.5,
            }}
          >
            <option value="">Select destination...</option>
            {warehouses.filter(w => w.location !== fromWarehouse).map(w => (
              <option key={w.location} value={w.location}>
                {w.location} ({w.quantity} current)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <label style={{ fontSize: '11px', color: colors.textMuted, display: 'block', marginBottom: '6px' }}>
          Quantity to Transfer
        </label>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="number"
            min={1}
            max={maxQuantity}
            value={quantity}
            onChange={(e) => setQuantity(Math.min(Number(e.target.value), maxQuantity))}
            disabled={!fromWarehouse}
            style={{
              width: '80px',
              padding: '10px',
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              color: colors.text,
              fontSize: '13px',
              textAlign: 'center',
            }}
          />
          <span style={{ fontSize: '12px', color: colors.textMuted }}>
            Max: {maxQuantity}
          </span>
        </div>
      </div>

      {fromWarehouse && toWarehouse && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: colors.bg,
          borderRadius: '8px',
          fontSize: '12px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <WarehouseIcon style={{ fontSize: 16, color: colors.accent }} />
              <span style={{ color: colors.text }}>{fromWarehouse}</span>
            </div>
            <ArrowForwardIcon style={{ color: colors.textMuted, fontSize: 16 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <WarehouseIcon style={{ fontSize: 16, color: colors.success }} />
              <span style={{ color: colors.text }}>{toWarehouse}</span>
            </div>
          </div>
          <div style={{ marginTop: '8px', color: colors.textMuted }}>
            Transfer <strong style={{ color: colors.text }}>{quantity}</strong> unit(s)
          </div>
        </div>
      )}

      <button
        onClick={handleTransfer}
        disabled={!fromWarehouse || !toWarehouse || quantity <= 0}
        style={{
          marginTop: '16px',
          width: '100%',
          padding: '12px',
          background: fromWarehouse && toWarehouse ? colors.accent : colors.border,
          color: fromWarehouse && toWarehouse ? '#fff' : colors.textMuted,
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: fromWarehouse && toWarehouse ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <SwapHorizIcon />
        Initiate Transfer
      </button>
    </div>
  );
};
