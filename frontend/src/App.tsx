import { useState, useEffect, useMemo } from 'react';
import { ChatPanel, TelemetryChart, KLALogo, MaintenanceHistory, ShippingComparison, PartTransfer, PartsInventory, CustomerFleetOverview, SensorHealthPanel, EscalationCasesPanel, CaseDetailPanel, KPIBar, SAPIntegrationPanel, WorkflowStrip, ShipmentModal, SAPArchitectureOverlay, OptimizationPanel, MultiSourcingPanel, TradeCompliancePanel, CortexSearchPanel } from './components';
import { mockFleetMetrics, mockAlerts, mockTelemetryData, mockScanners, mockMaintenanceLogs, getShippingOptions, getSensorReadingsForScanner, mockEscalationCases } from './services/api';
import type { FleetMetric, Alert, TelemetryReading, MaintenanceLog, ShippingOption, SensorReading, EscalationCase } from './types';
import SpeedIcon from '@mui/icons-material/Speed';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import HistoryIcon from '@mui/icons-material/History';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SourceIcon from '@mui/icons-material/Source';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
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
  const [_fleetMetrics, setFleetMetrics] = useState<FleetMetric[]>([]);
  const [_alerts, setAlerts] = useState<Alert[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryReading[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedScanner, setSelectedScanner] = useState<string | null>(
    mockScanners.find(s => s.STATUS === 'CRITICAL')?.SCANNER_ID || mockScanners[0]?.SCANNER_ID || null
  );
  const [selectedCustomer, setSelectedCustomer] = useState<string>('All Customers');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'caseDetail' | 'sensorHealth' | 'telemetry' | 'maintenance' | 'shipping' | 'transfer' | 'inventory' | 'optimize' | 'multiSource' | 'compliance' | 'aiSearch'>('caseDetail');
  const [chatPrompt, setChatPrompt] = useState<string | undefined>(undefined);
  const [selectedCase, setSelectedCase] = useState<EscalationCase | null>(null);
  const [showSAPPanel, setShowSAPPanel] = useState(false);
  const [showArchitectureOverlay, setShowArchitectureOverlay] = useState(false);
  const [shipmentModalOption, setShipmentModalOption] = useState<ShippingOption | null>(null);
  const [compliancePrefill, setCompliancePrefill] = useState<{ partId?: string; customer?: string; slaHours?: number } | null>(null);

  const workflowStep = useMemo(() => {
    if (shipmentModalOption) return 'ship';
    if (activeBottomTab === 'compliance') return 'comply';
    if (activeBottomTab === 'multiSource') return 'source';
    if (activeBottomTab === 'optimize') return 'optimize';
    if (activeBottomTab === 'shipping') return 'cost';
    if (activeBottomTab === 'inventory' || activeBottomTab === 'transfer') return 'parts';
    if (selectedCase) return 'case';
    return 'detect';
  }, [activeBottomTab, selectedCase, shipmentModalOption]);

  useEffect(() => {
    setFleetMetrics(mockFleetMetrics);
    setAlerts(mockAlerts);
    setTelemetry(mockTelemetryData);
    setMaintenanceLogs(mockMaintenanceLogs);
    setSelectedCase(mockEscalationCases.find(c => c.SEVERITY === 'SEV1') || null);
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

  const handleCaseClick = (caseItem: EscalationCase) => {
    setSelectedCase(caseItem);
    setSelectedScanner(caseItem.SCANNER_ID);
    setActiveBottomTab('caseDetail');
    const scanner = mockScanners.find(s => s.SCANNER_ID === caseItem.SCANNER_ID);
    if (scanner) {
      setShippingOptions(getShippingOptions(scanner.FAB_COUNTRY));
    }
  };

  const handleMetricClick = (metricName: string, scannerId: string) => {
    triggerChatPrompt(`Analyze ${metricName} readings for scanner ${scannerId}. What escalation cases are related and what's the current status?`);
  };

  const handleShipClick = (option: ShippingOption) => {
    setShipmentModalOption(option);
  };

  const handleShipmentConfirm = () => {
    if (shipmentModalOption) {
      triggerChatPrompt(`Ship part 994-023 from ${shipmentModalOption.WAREHOUSE_LOCATION} to ${selectedScanner}. Show landed cost breakdown including tariffs and duties.`);
      setShipmentModalOption(null);
    }
  };

  const handleProceedToCompliance = (partId: string, destCustomer: string, _destCode: string, _landedCost: number) => {
    setCompliancePrefill({
      partId,
      customer: destCustomer,
      slaHours: selectedCase?.SLA_REMAINING_HOURS,
    });
    setActiveBottomTab('compliance');
  };

  const selectedScannerData = mockScanners.find(s => s.SCANNER_ID === selectedScanner);

  const filteredCases = useMemo(() => {
    if (selectedCustomer === 'All Customers') return mockEscalationCases;
    return mockEscalationCases.filter(c => c.CUSTOMER === selectedCustomer);
  }, [selectedCustomer]);

  const openCases = filteredCases.filter(c => c.STATUS !== 'RESOLVED');
  const sev1Count = openCases.filter(c => c.SEVERITY === 'SEV1').length;
  const breachedCases = openCases.filter(c => c.SLA_REMAINING_HOURS < 0);
  const [alertBannerDismissed, setAlertBannerDismissed] = useState(false);

  useEffect(() => { setAlertBannerDismissed(false); }, [selectedCustomer]);

  const customerNames = ['All Customers', ...customerFleetData.map(c => c.name)];

  const tabGroups = [
    {
      tabs: [
        { id: 'caseDetail', label: 'Case', icon: <AssignmentIcon style={{ fontSize: 14 }} /> },
        { id: 'sensorHealth', label: 'Sensors', icon: <SpeedIcon style={{ fontSize: 14 }} /> },
        { id: 'telemetry', label: 'Telemetry', icon: <SpeedIcon style={{ fontSize: 14 }} /> },
        { id: 'maintenance', label: 'History', icon: <HistoryIcon style={{ fontSize: 14 }} /> },
      ],
    },
    {
      tabs: [
        { id: 'shipping', label: 'Source', icon: <CompareArrowsIcon style={{ fontSize: 14 }} /> },
        { id: 'transfer', label: 'Transfer', icon: <SwapHorizIcon style={{ fontSize: 14 }} /> },
        { id: 'inventory', label: 'Inventory', icon: <LocalShippingIcon style={{ fontSize: 14 }} /> },
      ],
    },
    {
      tabs: [
        { id: 'optimize', label: 'Optimize', icon: <AutoFixHighIcon style={{ fontSize: 14 }} /> },
        { id: 'multiSource', label: 'Multi-Src', icon: <SourceIcon style={{ fontSize: 14 }} /> },
        { id: 'compliance', label: 'Comply', icon: <VerifiedUserIcon style={{ fontSize: 14 }} /> },
        { id: 'aiSearch', label: 'Search', icon: <SearchIcon style={{ fontSize: 14 }} /> },
      ],
    },
  ];

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: colors.bg,
      color: colors.text,
      fontFamily: 'Inter, system-ui, sans-serif',
      transition: 'background 0.3s ease, color 0.3s ease',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <header style={{
          padding: '0 20px',
          height: '52px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: colors.bgSecondary,
          backdropFilter: 'blur(12px)',
          transition: 'all 0.3s ease',
          position: 'relative',
          flexShrink: 0,
          zIndex: 100,
          overflow: 'visible',
        }}>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: colors.accentGradient,
            opacity: 0.7,
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <KLALogo size={28} />
            <div>
              <h1 style={{ margin: 0, fontSize: '14px', fontWeight: 700, letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                Escalation Command Center
              </h1>
              <p style={{ margin: 0, fontSize: '10px', color: colors.textMuted, letterSpacing: '0.2px' }}>
                Field Service & Supply Chain Operations
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setShowSAPPanel(!showSAPPanel)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: colors.pillBg,
                color: colors.textMuted,
                padding: '5px 10px',
                borderRadius: '20px',
                fontSize: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${colors.border}`,
              }}
            >
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: colors.success,
                boxShadow: `0 0 4px ${colors.success}`,
              }} />
              SAP S/4 HANA
            </button>

            <button
              onClick={() => setShowArchitectureOverlay(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                borderRadius: '20px',
                padding: '5px 10px',
                color: colors.textMuted,
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 600,
              }}
            >
              <AccountTreeIcon style={{ fontSize: 13 }} />
              Architecture
            </button>

            <div style={{ width: '1px', height: '20px', background: colors.divider, margin: '0 2px' }} />

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                style={{
                  background: colors.inputBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '5px 10px',
                  color: colors.text,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  minWidth: '130px',
                  justifyContent: 'space-between',
                }}
              >
                {selectedCustomer}
                <KeyboardArrowDownIcon style={{ fontSize: 16, transition: 'transform 0.2s', transform: customerDropdownOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              {customerDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  background: colors.bgElevated,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '10px',
                  boxShadow: colors.elevatedShadow,
                  zIndex: 9999,
                  minWidth: '160px',
                  overflow: 'hidden',
                  animation: 'fadeIn 0.15s ease-out',
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
                        background: name === selectedCustomer ? colors.pillActiveBg : 'transparent',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = colors.pillBg}
                      onMouseLeave={e => e.currentTarget.style.background = name === selectedCustomer ? colors.pillActiveBg : 'transparent'}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ width: '1px', height: '20px', background: colors.divider, margin: '0 2px' }} />

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: colors.tealSubtle,
                padding: '3px 8px',
                borderRadius: '12px',
              }}>
                <span style={{ color: colors.teal, fontWeight: 700, fontFamily: 'monospace' }}>{openCases.length}</span>
                <span style={{ color: colors.textMuted }}>open</span>
              </div>
              {sev1Count > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: colors.critical + '12',
                  padding: '3px 8px',
                  borderRadius: '12px',
                }}>
                  <span style={{ color: colors.critical, fontWeight: 700, fontFamily: 'monospace' }}>{sev1Count}</span>
                  <span style={{ color: colors.critical, opacity: 0.8 }}>SEV1</span>
                </div>
              )}
            </div>

            <button
              onClick={toggleTheme}
              style={{
                background: colors.pillBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.textMuted,
              }}
            >
              {theme === 'dark' ? <LightModeIcon style={{ fontSize: 16 }} /> : <DarkModeIcon style={{ fontSize: 16 }} />}
            </button>
          </div>
        </header>

        {showSAPPanel && (
          <SAPIntegrationPanel onClose={() => setShowSAPPanel(false)} />
        )}

        <KPIBar cases={filteredCases} />

        {breachedCases.length > 0 && !alertBannerDismissed && (
          <div style={{
            margin: '0 12px',
            padding: '8px 14px',
            background: `${colors.critical}14`,
            border: `1px solid ${colors.critical}40`,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexShrink: 0,
            animation: 'alertPulse 2s ease-in-out infinite',
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: `${colors.critical}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <WarningAmberIcon style={{ fontSize: 16, color: colors.critical }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: colors.critical, marginBottom: '2px' }}>
                {breachedCases.length} SLA {breachedCases.length === 1 ? 'Breach' : 'Breaches'} — Immediate Action Required
              </div>
              <div style={{ fontSize: '10px', color: colors.textSecondary, display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {breachedCases.map(c => (
                  <span
                    key={c.CASE_ID}
                    onClick={() => handleCaseClick(c)}
                    style={{
                      cursor: 'pointer',
                      background: `${colors.critical}18`,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      fontSize: '10px',
                      color: colors.critical,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = `${colors.critical}30`}
                    onMouseLeave={e => e.currentTarget.style.background = `${colors.critical}18`}
                  >
                    {c.CASE_ID} · {c.CUSTOMER} · {Math.abs(c.SLA_REMAINING_HOURS)}h overdue
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setAlertBannerDismissed(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.textMuted,
                cursor: 'pointer',
                fontSize: '16px',
                padding: '2px 6px',
                borderRadius: '4px',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        )}

        <WorkflowStrip activeStep={workflowStep} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '10px 12px', gap: '10px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            flex: '0 0 35%',
            minHeight: 0,
            overflow: 'hidden',
          }}>
            <div style={{
              background: colors.bgSecondary,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              boxShadow: colors.panelShadow,
              padding: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'box-shadow 0.2s ease',
            }}>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '11px',
                color: colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600,
                flexShrink: 0,
              }}>
                {selectedCustomer === 'All Customers' ? 'Customer Fleet' : `${selectedCustomer} Fleet`}
              </h3>
              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                <CustomerFleetOverview
                  customers={filteredCustomerData}
                  onFabClick={(customer, fab) => {
                    triggerChatPrompt(`Show escalation cases and scanner status for ${customer} ${fab}`);
                  }}
                />
              </div>
            </div>
            <EscalationCasesPanel
              cases={filteredCases}
              onCaseClick={handleCaseClick}
              onAskAI={triggerChatPrompt}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', flex: 1, minHeight: 0 }}>
            <div style={{
              background: colors.bgSecondary,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              boxShadow: colors.panelShadow,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'box-shadow 0.2s ease',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px',
                borderBottom: `1px solid ${colors.border}`,
                flexShrink: 0,
                height: '38px',
                gap: '0',
                overflow: 'hidden',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  {tabGroups.map((group, gi) => (
                    <div key={gi} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      {gi > 0 && (
                        <div style={{ width: '1px', height: '16px', background: colors.divider, margin: '0 2px', flexShrink: 0 }} />
                      )}
                      {group.tabs.map(tab => {
                        const isActive = activeBottomTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            title={tab.label}
                            onClick={() => setActiveBottomTab(tab.id as typeof activeBottomTab)}
                            style={{
                              background: isActive ? colors.pillActiveBg : 'transparent',
                              color: isActive ? colors.accent : colors.textMuted,
                              border: 'none',
                              borderRadius: '5px',
                              padding: '4px 6px',
                              fontSize: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              fontWeight: isActive ? 600 : 400,
                              transition: 'all 0.15s ease',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                            }}
                          >
                            {tab.icon}
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
                {selectedScannerData && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '9px',
                    flexShrink: 0,
                    marginLeft: '4px',
                    whiteSpace: 'nowrap',
                  }}>
                    <span style={{
                      color: colors.accent,
                      background: colors.pillBg,
                      padding: '2px 5px',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      fontSize: '9px',
                    }}>
                      {selectedScannerData.SCANNER_ID}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '10px' }}>
                {activeBottomTab === 'caseDetail' && (
                  selectedCase ? (
                    <CaseDetailPanel
                      caseItem={selectedCase}
                      onClose={() => setSelectedCase(null)}
                      onAskAI={triggerChatPrompt}
                      onNavigateTab={(tab) => setActiveBottomTab(tab as typeof activeBottomTab)}
                    />
                  ) : (
                    <div style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      padding: '20px',
                    }}>
                      <div style={{
                        background: colors.accentGradient,
                        borderRadius: '12px',
                        padding: '16px 24px',
                        maxWidth: '600px',
                        width: '100%',
                      }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          AI Priority Summary
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
                          <strong>2 SEV1 cases</strong> need immediate attention. <strong>ESC-2026-4281</strong> (Samsung Pyeongtaek) — 193nm laser power critical, SLA breached 12h ago. <strong>ESC-2026-4285</strong> (Renesas Naka) — EUV collector contamination, 4h SLA remaining. Recommend starting with ESC-2026-4281 due to SLA breach penalty accrual.
                        </div>
                      </div>
                      <div style={{ color: colors.textDim, fontSize: '11px' }}>
                        Select an escalation case from the top-right panel to view details
                      </div>
                    </div>
                  )
                )}
                {activeBottomTab === 'sensorHealth' && (
                  <SensorHealthPanel
                    readings={sensorReadings}
                    scannerId={selectedScanner || ''}
                    onMetricClick={handleMetricClick}
                  />
                )}
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
                    onShip={handleShipClick}
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
                {activeBottomTab === 'optimize' && (
                  <OptimizationPanel onAskAI={triggerChatPrompt} />
                )}
                {activeBottomTab === 'multiSource' && (
                  <MultiSourcingPanel
                    onAskAI={triggerChatPrompt}
                    selectedCase={selectedCase}
                    onProceedToCompliance={handleProceedToCompliance}
                  />
                )}
                {activeBottomTab === 'compliance' && (
                  <TradeCompliancePanel
                    onAskAI={triggerChatPrompt}
                    selectedCase={selectedCase}
                    prefillPartId={compliancePrefill?.partId}
                    prefillCustomer={compliancePrefill?.customer}
                    prefillSlaHours={compliancePrefill?.slaHours}
                  />
                )}
                {activeBottomTab === 'aiSearch' && (
                  <CortexSearchPanel
                    selectedCase={selectedCase}
                    onAskAI={triggerChatPrompt}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        width: '380px',
        borderLeft: `1px solid ${colors.border}`,
        background: colors.bgSecondary,
        boxShadow: theme === 'light' ? '-2px 0 8px rgba(0,0,0,0.03)' : 'none',
      }}>
        <ChatPanel initialMessage={chatPrompt} />
      </div>

      {shipmentModalOption && (
        <ShipmentModal
          option={shipmentModalOption}
          destinationScanner={selectedScanner || 'Unknown'}
          caseId={selectedCase?.CASE_ID}
          engineer={selectedCase?.ASSIGNED_ENGINEER}
          onClose={() => setShipmentModalOption(null)}
          onConfirm={handleShipmentConfirm}
        />
      )}

      {showArchitectureOverlay && (
        <SAPArchitectureOverlay onClose={() => setShowArchitectureOverlay(false)} />
      )}
    </div>
  );
}

export default App;
