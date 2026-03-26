import { useState, useEffect, useMemo } from 'react';
import { ChatPanel, AlertsPanel, TelemetryChart, KLALogo, MaintenanceHistory, ShippingComparison, PartTransfer, PartsInventory, CustomerFleetOverview, SensorHealthPanel } from './components';
import { mockFleetMetrics, mockAlerts, mockTelemetryData, mockScanners, mockMaintenanceLogs, getShippingOptions, getSensorReadingsForScanner } from './services/api';
import type { FleetMetric, Alert, TelemetryReading, MaintenanceLog, ShippingOption, SensorReading } from './types';
import SpeedIcon from '@mui/icons-material/Speed';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import HistoryIcon from '@mui/icons-material/History';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTheme } from './context/ThemeContext';

const customerFleetData = [
  {
    name: 'TSMC',
    fabs: [
      { fabName: 'Fab 18', location: 'Tainan', country: 'Taiwan', scannerCount: 12, critical: 0, warning: 1, healthy: 11 },
      { fabName: 'Fab 15', location: 'Taichung', country: 'Taiwan', scannerCount: 8, critical: 0, warning: 1, healthy: 7 },
      { fabName: 'Fab 12', location: 'Hsinchu', country: 'Taiwan', scannerCount: 6, critical: 0, warning: 1, healthy: 5 },
      { fabName: 'Fab 21', location: 'Arizona', country: 'USA', scannerCount: 4, critical: 0, warning: 0, healthy: 4 },
    ],
  },
  {
    name: 'Samsung',
    fabs: [
      { fabName: 'Pyeongtaek', location: 'Pyeongtaek', country: 'Korea', scannerCount: 10, critical: 1, warning: 0, healthy: 9 },
      { fabName: 'Hwaseong', location: 'Hwaseong', country: 'Korea', scannerCount: 6, critical: 0, warning: 0, healthy: 6 },
      { fabName: 'Austin', location: 'Texas', country: 'USA', scannerCount: 4, critical: 0, warning: 0, healthy: 4 },
    ],
  },
  {
    name: 'Intel',
    fabs: [
      { fabName: 'Fab 42', location: 'Arizona', country: 'USA', scannerCount: 8, critical: 0, warning: 1, healthy: 7 },
      { fabName: 'Fab 34', location: 'Ireland', country: 'Ireland', scannerCount: 5, critical: 0, warning: 0, healthy: 5 },
      { fabName: 'Fab 52', location: 'Ohio', country: 'USA', scannerCount: 3, critical: 0, warning: 0, healthy: 3 },
    ],
  },
  {
    name: 'SK Hynix',
    fabs: [
      { fabName: 'Icheon', location: 'Icheon', country: 'Korea', scannerCount: 6, critical: 0, warning: 1, healthy: 5 },
      { fabName: 'Cheongju', location: 'Cheongju', country: 'Korea', scannerCount: 4, critical: 0, warning: 0, healthy: 4 },
    ],
  },
  {
    name: 'Renesas',
    fabs: [
      { fabName: 'Naka', location: 'Ibaraki', country: 'Japan', scannerCount: 3, critical: 1, warning: 0, healthy: 2 },
    ],
  },
];

const warehouseInventory = [
  { location: 'KLA Tucson Hub', city: 'Tucson', country: 'USA', quantity: 3, reorderPoint: 2, inTransit: 1, backordered: 0 },
  { location: 'KLA San Jose HQ', city: 'San Jose', country: 'USA', quantity: 0, reorderPoint: 3, inTransit: 2, backordered: 4 },
  { location: 'KLA Singapore Hub', city: 'Singapore', country: 'SGP', quantity: 2, reorderPoint: 2, inTransit: 0, backordered: 0 },
  { location: 'KLA Dresden Hub', city: 'Dresden', country: 'DEU', quantity: 1, reorderPoint: 2, inTransit: 1, backordered: 0 },
];

function App() {
  const { theme, toggleTheme, colors } = useTheme();
  const [fleetMetrics, setFleetMetrics] = useState<FleetMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryReading[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedScanner, setSelectedScanner] = useState<string | null>(
    mockScanners.find(s => s.STATUS === 'CRITICAL')?.SCANNER_ID || mockScanners[0]?.SCANNER_ID || null
  );
  const [selectedCustomer, setSelectedCustomer] = useState<string>('All Customers');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'telemetry' | 'maintenance' | 'shipping' | 'transfer' | 'inventory'>('telemetry');
  const [chatPrompt, setChatPrompt] = useState<string | undefined>(undefined);

  useEffect(() => {
    setFleetMetrics(mockFleetMetrics);
    setAlerts(mockAlerts);
    setTelemetry(mockTelemetryData);
    setMaintenanceLogs(mockMaintenanceLogs);
  }, []);

  const sensorReadings = useMemo<SensorReading[]>(() => {
    if (!selectedScanner) return [];
    return getSensorReadingsForScanner(selectedScanner);
  }, [selectedScanner]);

  const filteredCustomerData = useMemo(() => {
    if (selectedCustomer === 'All Customers') return customerFleetData;
    return customerFleetData.filter(c => c.name === selectedCustomer);
  }, [selectedCustomer]);

  const triggerChatPrompt = (prompt: string) => {
    setChatPrompt(`${prompt} [${Date.now()}]`);
  };

  const handleScannerClick = (scannerId: string) => {
    setSelectedScanner(scannerId);
    const scanner = mockScanners.find(s => s.SCANNER_ID === scannerId);
    if (scanner) {
      setShippingOptions(getShippingOptions(scanner.FAB_COUNTRY));
      if (scanner.STATUS === 'CRITICAL') {
        triggerChatPrompt(`Diagnose issues with scanner ${scannerId}`);
      }
    }
  };

  const handleAlertClick = (alert: Alert) => {
    setSelectedScanner(alert.SCANNER_ID);
    const scanner = mockScanners.find(s => s.SCANNER_ID === alert.SCANNER_ID);
    if (scanner) {
      setShippingOptions(getShippingOptions(scanner.FAB_COUNTRY));
    }
    triggerChatPrompt(`Analyze alert for scanner ${alert.SCANNER_ID} with power at ${alert.METRIC_VALUE}mW`);
  };

  const handleMetricClick = (metricName: string, scannerId: string) => {
    triggerChatPrompt(`Analyze ${metricName} readings for scanner ${scannerId}. What is the likely root cause and have we seen this pattern before on other scanners?`);
  };

  const selectedScannerData = mockScanners.find(s => s.SCANNER_ID === selectedScanner);

  const stats = {
    totalScanners: mockScanners.length,
    criticalCount: mockScanners.filter(s => s.STATUS === 'CRITICAL').length,
    warningCount: mockScanners.filter(s => s.STATUS === 'WARNING').length,
  };

  const customerNames = ['All Customers', ...customerFleetData.map(c => c.name)];

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: colors.bg,
      color: colors.text,
      fontFamily: 'Inter, system-ui, sans-serif',
      transition: 'background 0.3s, color 0.3s',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          padding: '12px 24px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: colors.bgSecondary,
          transition: 'background 0.3s, border-color 0.3s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <KLALogo size={40} />
            <div>
              <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Global Supply Chain Tower</h1>
              <p style={{ margin: 0, fontSize: '11px', color: colors.textMuted }}>Fleet Manager - DUV/EUV Scanner Operations</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #0066B3 0%, #004080 100%)',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 600,
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#4ADE80',
                boxShadow: '0 0 6px #4ADE80',
                animation: 'pulse 2s infinite',
              }} />
              SAP S/4 HANA
            </div>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: colors.text,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  minWidth: '140px',
                  justifyContent: 'space-between',
                }}
              >
                {selectedCustomer}
                <KeyboardArrowDownIcon style={{ fontSize: 16 }} />
              </button>
              {customerDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  background: colors.bgSecondary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  zIndex: 100,
                  minWidth: '160px',
                  overflow: 'hidden',
                }}>
                  {customerNames.map(name => (
                    <div
                      key={name}
                      onClick={() => { setSelectedCustomer(name); setCustomerDropdownOpen(false); }}
                      style={{
                        padding: '8px 14px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        color: name === selectedCustomer ? colors.accent : colors.text,
                        fontWeight: name === selectedCustomer ? 600 : 400,
                        background: name === selectedCustomer ? colors.accent + '15' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = colors.accent + '15'}
                      onMouseLeave={e => e.currentTarget.style.background = name === selectedCustomer ? colors.accent + '15' : 'transparent'}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: colors.textMuted }}>FLEET</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: colors.accent }}>{stats.totalScanners}</div>
            </div>
            <div
              onClick={() => triggerChatPrompt('Show me all critical scanners, their sensor readings, and likely root causes')}
              style={{
                textAlign: 'center',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '6px',
                transition: 'all 0.2s',
                background: 'transparent',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.critical + '20'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontSize: '10px', color: colors.textMuted }}>CRITICAL</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: colors.critical }}>{stats.criticalCount}</div>
            </div>
            <div
              onClick={() => triggerChatPrompt('Show me all warning scanners and predict which will become critical next')}
              style={{
                textAlign: 'center',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '6px',
                transition: 'all 0.2s',
                background: 'transparent',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.warning + '20'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontSize: '10px', color: colors.textMuted }}>WARNING</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: colors.warning }}>{stats.warningCount}</div>
            </div>
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.textMuted,
              }}
            >
              {theme === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </button>
          </div>
        </header>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                background: colors.bgSecondary,
                borderRadius: '10px',
                border: `1px solid ${colors.border}`,
                padding: '12px',
              }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: colors.textMuted }}>
                  {selectedCustomer === 'All Customers' ? 'Customer Fleet Overview' : `${selectedCustomer} Fleet Overview`}
                </h3>
                <CustomerFleetOverview
                  customers={filteredCustomerData}
                  onFabClick={(customer, fab) => {
                    triggerChatPrompt(`Show scanner status for ${customer} ${fab}`);
                  }}
                />
              </div>

              <div style={{
                background: colors.bgSecondary,
                borderRadius: '10px',
                border: `1px solid ${colors.border}`,
                padding: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 10px 0' }}>
                  <h3 style={{ margin: 0, fontSize: '13px', color: colors.textMuted }}>
                    Sensor Health — {selectedScanner || 'No Scanner Selected'}
                  </h3>
                  {selectedScannerData && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: selectedScannerData.STATUS === 'CRITICAL' ? colors.critical :
                        selectedScannerData.STATUS === 'WARNING' ? colors.warning : colors.success,
                      background: (selectedScannerData.STATUS === 'CRITICAL' ? colors.critical :
                        selectedScannerData.STATUS === 'WARNING' ? colors.warning : colors.success) + '20',
                      padding: '3px 8px',
                      borderRadius: '4px',
                    }}>
                      {selectedScannerData.STATUS}
                    </span>
                  )}
                </div>
                <div style={{ height: 280, overflowY: 'auto' }}>
                  <SensorHealthPanel
                    readings={sensorReadings}
                    scannerId={selectedScanner || ''}
                    onMetricClick={handleMetricClick}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div style={{
                background: colors.bgSecondary,
                borderRadius: '10px',
                border: `1px solid ${colors.border}`,
                padding: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[
                      { id: 'telemetry', label: 'Telemetry', icon: <SpeedIcon style={{ fontSize: 14 }} /> },
                      { id: 'maintenance', label: 'Maintenance', icon: <HistoryIcon style={{ fontSize: 14 }} /> },
                      { id: 'shipping', label: 'Ship Part', icon: <CompareArrowsIcon style={{ fontSize: 14 }} /> },
                      { id: 'transfer', label: 'Transfer', icon: <SwapHorizIcon style={{ fontSize: 14 }} /> },
                      { id: 'inventory', label: 'Inventory', icon: <LocalShippingIcon style={{ fontSize: 14 }} /> },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveBottomTab(tab.id as typeof activeBottomTab)}
                        style={{
                          background: activeBottomTab === tab.id ? colors.accent : 'transparent',
                          color: activeBottomTab === tab.id ? '#fff' : colors.textMuted,
                          border: `1px solid ${activeBottomTab === tab.id ? colors.accent : colors.border}`,
                          borderRadius: '5px',
                          padding: '5px 10px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  {selectedScannerData && (
                    <div style={{ display: 'flex', gap: '10px', fontSize: '11px' }}>
                      <span style={{ color: colors.textMuted }}>{selectedScannerData.SCANNER_ID}</span>
                      <span style={{ color: colors.textMuted }}>{selectedScannerData.FAB_NAME}</span>
                    </div>
                  )}
                </div>
                <div style={{ height: 220 }}>
                  {activeBottomTab === 'telemetry' && (
                    selectedScanner ? (
                      <TelemetryChart data={telemetry} scannerId={selectedScanner} />
                    ) : (
                      <div style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.textDim,
                        fontSize: '13px'
                      }}>
                        Select a scanner to view telemetry
                      </div>
                    )
                  )}
                  {activeBottomTab === 'maintenance' && (
                    <MaintenanceHistory logs={maintenanceLogs} scannerId={selectedScanner} />
                  )}
                  {activeBottomTab === 'shipping' && (
                    <ShippingComparison
                      options={shippingOptions}
                      partName="994-023 NLO Crystal Assembly"
                      destinationScanner={selectedScanner}
                      onShip={(option) => {
                        triggerChatPrompt(`Ship part 994-023 from ${option.WAREHOUSE_LOCATION} to ${selectedScanner}`);
                      }}
                    />
                  )}
                  {activeBottomTab === 'transfer' && (
                    <PartTransfer
                      partId="994-023"
                      partName="NLO Crystal Assembly"
                      warehouses={[
                        { location: 'KLA Tucson Hub', city: 'Tucson', state: 'AZ', quantity: 3 },
                        { location: 'KLA San Jose HQ', city: 'San Jose', state: 'CA', quantity: 0 },
                        { location: 'KLA Singapore Hub', city: 'Singapore', state: 'SG', quantity: 2 },
                        { location: 'KLA Dresden Hub', city: 'Dresden', state: 'DE', quantity: 1 },
                      ]}
                      onTransfer={(from, to, qty) => {
                        triggerChatPrompt(`Transfer ${qty} unit(s) of part 994-023 from ${from} to ${to}`);
                      }}
                    />
                  )}
                  {activeBottomTab === 'inventory' && (
                    <PartsInventory
                      partId="994-023"
                      partName="NLO Harmonic Crystal Assembly"
                      warehouses={warehouseInventory}
                      onWarehouseClick={(warehouse) => {
                        triggerChatPrompt(`Show inventory details for ${warehouse}`);
                      }}
                    />
                  )}
                </div>
              </div>

              <AlertsPanel alerts={alerts} onAlertClick={handleAlertClick} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ width: '380px', borderLeft: `1px solid ${colors.border}` }}>
        <ChatPanel initialMessage={chatPrompt} />
      </div>
    </div>
  );
}

export default App;
