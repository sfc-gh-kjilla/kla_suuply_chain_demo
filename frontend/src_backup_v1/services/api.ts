import type { Scanner, TelemetryReading, Alert, FleetMetric, PartInventory, MaintenanceLog, ShippingOption, SensorReading, EscalationCase } from '../types';

export const mockScanners: Scanner[] = [
  { SCANNER_ID: 'SCN-KR-001', SCANNER_MODEL: 'KLA-DUV-7500', SCANNER_TYPE: 'DUV', FAB_NAME: 'Samsung Pyeongtaek', FAB_CITY: 'Pyeongtaek', FAB_COUNTRY: 'South Korea', LATITUDE: 36.99, LONGITUDE: 127.11, STATUS: 'CRITICAL', CRYSTAL_BATCH_LOT: 'B-2024-X', CURRENT_POWER_MW: 82.3 },
  { SCANNER_ID: 'SCN-JP-005', SCANNER_MODEL: 'KLA-DUV-7500', SCANNER_TYPE: 'DUV', FAB_NAME: 'Renesas Naka', FAB_CITY: 'Hitachinaka', FAB_COUNTRY: 'Japan', LATITUDE: 36.4, LONGITUDE: 140.53, STATUS: 'CRITICAL', CRYSTAL_BATCH_LOT: 'B-2024-X', CURRENT_POWER_MW: 78.9 },
  { SCANNER_ID: 'SCN-TW-004', SCANNER_MODEL: 'KLA-DUV-7500', SCANNER_TYPE: 'DUV', FAB_NAME: 'TSMC Fab 15', FAB_CITY: 'Taichung', FAB_COUNTRY: 'Taiwan', LATITUDE: 24.15, LONGITUDE: 120.67, STATUS: 'WARNING', CRYSTAL_BATCH_LOT: 'B-2024-X', CURRENT_POWER_MW: 91.2 },
  { SCANNER_ID: 'SCN-KR-004', SCANNER_MODEL: 'KLA-DUV-7200', SCANNER_TYPE: 'DUV', FAB_NAME: 'SK Hynix Icheon', FAB_CITY: 'Icheon', FAB_COUNTRY: 'South Korea', LATITUDE: 37.28, LONGITUDE: 127.44, STATUS: 'WARNING', CRYSTAL_BATCH_LOT: 'B-2024-X', CURRENT_POWER_MW: 92.1 },
  { SCANNER_ID: 'SCN-US-003', SCANNER_MODEL: 'KLA-DUV-7200', SCANNER_TYPE: 'DUV', FAB_NAME: 'Intel Fab 42', FAB_CITY: 'Chandler', FAB_COUNTRY: 'USA', LATITUDE: 33.308, LONGITUDE: -111.843, STATUS: 'WARNING', CRYSTAL_BATCH_LOT: 'B-2024-X', CURRENT_POWER_MW: 91.8 },
  { SCANNER_ID: 'SCN-EU-004', SCANNER_MODEL: 'KLA-DUV-7500', SCANNER_TYPE: 'DUV', FAB_NAME: 'IMEC Leuven', FAB_CITY: 'Leuven', FAB_COUNTRY: 'Belgium', LATITUDE: 50.88, LONGITUDE: 4.7, STATUS: 'WARNING', CRYSTAL_BATCH_LOT: 'B-2024-X', CURRENT_POWER_MW: 92.4 },
  { SCANNER_ID: 'SCN-TW-001', SCANNER_MODEL: 'KLA-DUV-7500', SCANNER_TYPE: 'DUV', FAB_NAME: 'TSMC Fab 18', FAB_CITY: 'Tainan', FAB_COUNTRY: 'Taiwan', LATITUDE: 23.0, LONGITUDE: 120.2, STATUS: 'OPERATIONAL', CRYSTAL_BATCH_LOT: 'B-2024-A', CURRENT_POWER_MW: 115.2 },
  { SCANNER_ID: 'SCN-TW-002', SCANNER_MODEL: 'KLA-DUV-7500', SCANNER_TYPE: 'DUV', FAB_NAME: 'TSMC Fab 18', FAB_CITY: 'Tainan', FAB_COUNTRY: 'Taiwan', LATITUDE: 23.001, LONGITUDE: 120.201, STATUS: 'OPERATIONAL', CRYSTAL_BATCH_LOT: 'B-2024-X', CURRENT_POWER_MW: 98.5 },
  { SCANNER_ID: 'SCN-KR-002', SCANNER_MODEL: 'KLA-DUV-7500', SCANNER_TYPE: 'DUV', FAB_NAME: 'Samsung Pyeongtaek', FAB_CITY: 'Pyeongtaek', FAB_COUNTRY: 'South Korea', LATITUDE: 36.991, LONGITUDE: 127.111, STATUS: 'OPERATIONAL', CRYSTAL_BATCH_LOT: 'B-2024-A', CURRENT_POWER_MW: 118.7 },
  { SCANNER_ID: 'SCN-US-001', SCANNER_MODEL: 'KLA-DUV-7500', SCANNER_TYPE: 'DUV', FAB_NAME: 'Intel Fab 52', FAB_CITY: 'Chandler', FAB_COUNTRY: 'USA', LATITUDE: 33.306, LONGITUDE: -111.841, STATUS: 'OPERATIONAL', CRYSTAL_BATCH_LOT: 'B-2024-A', CURRENT_POWER_MW: 121.3 },
  { SCANNER_ID: 'SCN-JP-001', SCANNER_MODEL: 'KLA-DUV-7200', SCANNER_TYPE: 'DUV', FAB_NAME: 'Kioxia Yokkaichi', FAB_CITY: 'Yokkaichi', FAB_COUNTRY: 'Japan', LATITUDE: 34.97, LONGITUDE: 136.62, STATUS: 'OPERATIONAL', CRYSTAL_BATCH_LOT: 'B-2023-A', CURRENT_POWER_MW: 112.8 },
  { SCANNER_ID: 'SCN-SG-001', SCANNER_MODEL: 'KLA-DUV-7500', SCANNER_TYPE: 'DUV', FAB_NAME: 'Micron Singapore', FAB_CITY: 'Singapore', FAB_COUNTRY: 'Singapore', LATITUDE: 1.352, LONGITUDE: 103.82, STATUS: 'OPERATIONAL', CRYSTAL_BATCH_LOT: 'B-2024-A', CURRENT_POWER_MW: 119.4 },
];

export const mockFleetMetrics: FleetMetric[] = mockScanners.map(s => ({
  SCANNER_ID: s.SCANNER_ID,
  FAB_NAME: s.FAB_NAME,
  FAB_COUNTRY: s.FAB_COUNTRY,
  STATUS: s.STATUS,
  CURRENT_POWER_MW: s.CURRENT_POWER_MW || 110,
  FLEET_MEAN_POWER: 108.5,
  Z_SCORE: ((s.CURRENT_POWER_MW || 110) - 108.5) / 12.3,
  LATITUDE: s.LATITUDE,
  LONGITUDE: s.LONGITUDE,
  CRYSTAL_BATCH_LOT: s.CRYSTAL_BATCH_LOT,
}));

export const mockAlerts: Alert[] = [
  { ALERT_ID: 1, SCANNER_ID: 'SCN-KR-001', ALERT_TIMESTAMP: new Date().toISOString(), ALERT_TYPE: 'POWER_DEGRADATION', SEVERITY: 'CRITICAL', METRIC_VALUE: 82.3, THRESHOLD_VALUE: 90, DESCRIPTION: 'Laser power dropped below 90mW critical threshold. Possible CLBO crystal degradation.', STATUS: 'OPEN' },
  { ALERT_ID: 2, SCANNER_ID: 'SCN-JP-005', ALERT_TIMESTAMP: new Date().toISOString(), ALERT_TYPE: 'POWER_DEGRADATION', SEVERITY: 'CRITICAL', METRIC_VALUE: 78.9, THRESHOLD_VALUE: 90, DESCRIPTION: 'Laser power dropped below 90mW critical threshold. Immediate maintenance required.', STATUS: 'OPEN' },
  { ALERT_ID: 3, SCANNER_ID: 'SCN-TW-004', ALERT_TIMESTAMP: new Date(Date.now() - 3*24*60*60*1000).toISOString(), ALERT_TYPE: 'POWER_WARNING', SEVERITY: 'WARNING', METRIC_VALUE: 91.2, THRESHOLD_VALUE: 95, DESCRIPTION: 'Laser power trending toward critical threshold.', STATUS: 'ACKNOWLEDGED' },
];

export const mockInventory: PartInventory[] = [
  { PART_ID: '994-023', PART_NAME: 'NLO Harmonic Crystal Assembly', WAREHOUSE_LOCATION: 'KLA Tucson Hub', QUANTITY_AVAILABLE: 3, UNIT_COST: 45000 },
  { PART_ID: '994-023', PART_NAME: 'NLO Harmonic Crystal Assembly', WAREHOUSE_LOCATION: 'KLA San Jose HQ', QUANTITY_AVAILABLE: 0, UNIT_COST: 45000 },
  { PART_ID: '994-023', PART_NAME: 'NLO Harmonic Crystal Assembly', WAREHOUSE_LOCATION: 'KLA Singapore Hub', QUANTITY_AVAILABLE: 2, UNIT_COST: 45000 },
];

function generateTimeSeriesData(scannerId: string, baseValue: number, isDegrading: boolean): TelemetryReading[] {
  const readings: TelemetryReading[] = [];
  const now = Date.now();
  
  for (let i = 0; i < 72; i++) {
    const hoursAgo = i * 4;
    const timestamp = new Date(now - hoursAgo * 60 * 60 * 1000);
    
    let value = baseValue;
    if (isDegrading) {
      const degradation = Math.min(i * 0.3, 25);
      value = baseValue + degradation + (Math.random() - 0.5) * 5;
    } else {
      value = baseValue + (Math.random() - 0.5) * 8;
    }
    
    readings.push({
      SCANNER_ID: scannerId,
      READING_TIMESTAMP: timestamp.toISOString(),
      METRIC_VALUE: value,
      IS_ANOMALY: value < 90,
    });
  }
  
  return readings.reverse();
}

export const mockTelemetryData: TelemetryReading[] = [
  ...generateTimeSeriesData('SCN-KR-001', 82, true),
  ...generateTimeSeriesData('SCN-JP-005', 79, true),
  ...generateTimeSeriesData('SCN-TW-004', 91, true),
  ...generateTimeSeriesData('SCN-US-001', 121, false),
  ...generateTimeSeriesData('SCN-TW-001', 115, false),
];

export async function fetchScanners(): Promise<Scanner[]> {
  return mockScanners;
}

export async function fetchFleetMetrics(): Promise<FleetMetric[]> {
  return mockFleetMetrics;
}

export async function fetchAlerts(): Promise<Alert[]> {
  return mockAlerts;
}

export async function fetchTelemetry(scannerId?: string): Promise<TelemetryReading[]> {
  if (scannerId) {
    return mockTelemetryData.filter(r => r.SCANNER_ID === scannerId);
  }
  return mockTelemetryData;
}

export async function fetchInventory(partId?: string): Promise<PartInventory[]> {
  if (partId) {
    return mockInventory.filter(p => p.PART_ID === partId);
  }
  return mockInventory;
}

export const mockMaintenanceLogs: MaintenanceLog[] = [
  { LOG_ID: 1, SCANNER_ID: 'SCN-KR-001', MAINTENANCE_DATE: '2024-08-15', MAINTENANCE_TYPE: 'CORRECTIVE', TECHNICIAN_NAME: 'Park Jin-soo', PARTS_REPLACED: '994-023 NLO Crystal Assembly', ISSUE_DESCRIPTION: 'Low laser power output detected at 85mW', RESOLUTION_NOTES: 'Replaced CLBO crystal assembly from batch B-2024-X. Power restored to 118mW. Note: third replacement this quarter.', DOWNTIME_HOURS: 8.5 },
  { LOG_ID: 2, SCANNER_ID: 'SCN-JP-005', MAINTENANCE_DATE: '2024-08-20', MAINTENANCE_TYPE: 'CORRECTIVE', TECHNICIAN_NAME: 'Tanaka Hiroshi', PARTS_REPLACED: '994-023 NLO Crystal Assembly', ISSUE_DESCRIPTION: 'Sudden power drop to 79mW during production', RESOLUTION_NOTES: 'Emergency crystal replacement performed. Root cause: thermal runaway in CLBO crystal.', DOWNTIME_HOURS: 12 },
  { LOG_ID: 3, SCANNER_ID: 'SCN-TW-002', MAINTENANCE_DATE: '2024-10-15', MAINTENANCE_TYPE: 'PREVENTIVE', TECHNICIAN_NAME: 'Chen Wei-lin', PARTS_REPLACED: 'Gas cylinder replacement', ISSUE_DESCRIPTION: 'Scheduled maintenance and gas refill', RESOLUTION_NOTES: 'Routine service completed. Noted slight power degradation trend - monitoring.', DOWNTIME_HOURS: 4 },
  { LOG_ID: 4, SCANNER_ID: 'SCN-US-001', MAINTENANCE_DATE: '2024-11-15', MAINTENANCE_TYPE: 'PREVENTIVE', TECHNICIAN_NAME: 'John Martinez', PARTS_REPLACED: 'Beam alignment check', ISSUE_DESCRIPTION: 'Quarterly calibration', RESOLUTION_NOTES: 'All metrics within specification. System performing optimally.', DOWNTIME_HOURS: 2.5 },
  { LOG_ID: 5, SCANNER_ID: 'SCN-TW-004', MAINTENANCE_DATE: '2024-09-20', MAINTENANCE_TYPE: 'CORRECTIVE', TECHNICIAN_NAME: 'Lin Mei-hua', PARTS_REPLACED: '994-025 Mirror Assembly', ISSUE_DESCRIPTION: 'Beam delivery misalignment causing power loss', RESOLUTION_NOTES: 'Mirror assembly realigned. Power improved from 88mW to 102mW.', DOWNTIME_HOURS: 6 },
  { LOG_ID: 6, SCANNER_ID: 'SCN-KR-004', MAINTENANCE_DATE: '2024-10-01', MAINTENANCE_TYPE: 'PREVENTIVE', TECHNICIAN_NAME: 'Kim Dong-hyun', PARTS_REPLACED: 'Optics cleaning', ISSUE_DESCRIPTION: 'Scheduled optics maintenance', RESOLUTION_NOTES: 'Minor contamination on output window cleaned. Crystal batch B-2024-X flagged for monitoring.', DOWNTIME_HOURS: 3.5 },
];

export function getShippingOptions(destinationCountry: string): ShippingOption[] {
  const baseOptions = [
    { WAREHOUSE_LOCATION: 'KLA Tucson Hub', WAREHOUSE_CITY: 'Tucson', WAREHOUSE_STATE: 'AZ', QUANTITY_AVAILABLE: 3, UNIT_COST: 45000, SUPPLIER_BATCH_LOT: 'B-2024-A' },
    { WAREHOUSE_LOCATION: 'KLA San Jose HQ', WAREHOUSE_CITY: 'San Jose', WAREHOUSE_STATE: 'CA', QUANTITY_AVAILABLE: 0, UNIT_COST: 45000, SUPPLIER_BATCH_LOT: 'B-2024-X' },
    { WAREHOUSE_LOCATION: 'KLA Singapore Hub', WAREHOUSE_CITY: 'Singapore', WAREHOUSE_STATE: 'SG', QUANTITY_AVAILABLE: 2, UNIT_COST: 45000, SUPPLIER_BATCH_LOT: 'B-2024-B' },
    { WAREHOUSE_LOCATION: 'KLA Dresden Hub', WAREHOUSE_CITY: 'Dresden', WAREHOUSE_STATE: 'DE', QUANTITY_AVAILABLE: 1, UNIT_COST: 45000, SUPPLIER_BATCH_LOT: 'B-2024-A' },
  ];

  const shippingRates: Record<string, Record<string, { cost: number; days: number }>> = {
    'South Korea': { 'AZ': { cost: 4500, days: 2 }, 'CA': { cost: 4200, days: 2 }, 'SG': { cost: 1800, days: 1 }, 'DE': { cost: 3500, days: 3 } },
    'Japan': { 'AZ': { cost: 4200, days: 2 }, 'CA': { cost: 4000, days: 2 }, 'SG': { cost: 1600, days: 1 }, 'DE': { cost: 3800, days: 3 } },
    'Taiwan': { 'AZ': { cost: 4000, days: 2 }, 'CA': { cost: 3800, days: 2 }, 'SG': { cost: 1200, days: 1 }, 'DE': { cost: 3600, days: 3 } },
    'USA': { 'AZ': { cost: 500, days: 1 }, 'CA': { cost: 600, days: 1 }, 'SG': { cost: 4500, days: 3 }, 'DE': { cost: 4000, days: 3 } },
    'Belgium': { 'AZ': { cost: 4000, days: 3 }, 'CA': { cost: 4200, days: 3 }, 'SG': { cost: 3500, days: 2 }, 'DE': { cost: 800, days: 1 } },
    'Singapore': { 'AZ': { cost: 4500, days: 3 }, 'CA': { cost: 4200, days: 3 }, 'SG': { cost: 0, days: 0 }, 'DE': { cost: 3500, days: 2 } },
  };

  const taxRates: Record<string, number> = {
    'South Korea': 0.10,
    'Japan': 0.10,
    'Taiwan': 0.05,
    'USA': 0.08,
    'Belgium': 0.21,
    'Singapore': 0.09,
  };

  const tariffRates: Record<string, Record<string, number>> = {
    'South Korea': { 'AZ': 0.08, 'CA': 0.08, 'SG': 0.0, 'DE': 0.04 },
    'Japan': { 'AZ': 0.06, 'CA': 0.06, 'SG': 0.0, 'DE': 0.04 },
    'Taiwan': { 'AZ': 0.07, 'CA': 0.07, 'SG': 0.0, 'DE': 0.035 },
    'USA': { 'AZ': 0.0, 'CA': 0.0, 'SG': 0.0, 'DE': 0.04 },
    'Belgium': { 'AZ': 0.05, 'CA': 0.05, 'SG': 0.02, 'DE': 0.0 },
    'Singapore': { 'AZ': 0.0, 'CA': 0.0, 'SG': 0.0, 'DE': 0.02 },
  };

  const rates = shippingRates[destinationCountry] || shippingRates['USA'];
  const taxRate = taxRates[destinationCountry] || 0.08;
  const tariffs = tariffRates[destinationCountry] || {};

  return baseOptions.map(opt => {
    const shipping = rates[opt.WAREHOUSE_STATE] || { cost: 3000, days: 3 };
    const tariffRate = tariffs[opt.WAREHOUSE_STATE] || 0.05;
    const importDuty = Math.round(opt.UNIT_COST * tariffRate);
    const subtotal = opt.UNIT_COST + shipping.cost + importDuty;
    const taxAmount = Math.round(subtotal * taxRate);
    const landedCost = subtotal + taxAmount;
    return {
      ...opt,
      SHIPPING_COST: shipping.cost,
      ESTIMATED_DAYS: shipping.days,
      TAX_RATE: taxRate,
      TAX_AMOUNT: taxAmount,
      TARIFF_RATE: tariffRate,
      IMPORT_DUTY: importDuty,
      LANDED_COST: landedCost,
      TOTAL_COST: landedCost,
    };
  });
}

export async function fetchMaintenanceLogs(scannerId?: string): Promise<MaintenanceLog[]> {
  if (scannerId) {
    return mockMaintenanceLogs.filter(l => l.SCANNER_ID === scannerId);
  }
  return mockMaintenanceLogs;
}

const sensorSpecs = [
  { name: '193nm Laser Power', unit: 'mW', min: 90, warnLow: 95, warnHigh: 130, max: 140 },
  { name: 'Chamber Temperature', unit: '°C', min: 20, warnLow: 22, warnHigh: 26, max: 28 },
  { name: 'Stage Vibration', unit: 'nm', min: 0, warnLow: 0, warnHigh: 2.5, max: 3.5 },
  { name: 'Chamber Pressure', unit: 'Pa', min: 0.8, warnLow: 0.9, warnHigh: 1.15, max: 1.3 },
  { name: 'Beam Current', unit: 'mA', min: 40, warnLow: 45, warnHigh: 58, max: 62 },
  { name: 'High Voltage Supply', unit: 'kV', min: 18, warnLow: 19, warnHigh: 21.5, max: 22 },
  { name: 'Coolant Flow Rate', unit: 'L/min', min: 8, warnLow: 9, warnHigh: 13, max: 14 },
  { name: 'Optics Contamination', unit: 'ppm', min: 0, warnLow: 0, warnHigh: 15, max: 25 },
];

function generateSensorReadings(scanner: Scanner): SensorReading[] {
  return sensorSpecs.map(spec => {
    let value: number;
    let status: 'CRITICAL' | 'WARNING' | 'HEALTHY';

    if (spec.name === '193nm Laser Power') {
      value = scanner.CURRENT_POWER_MW || 110;
    } else if (scanner.STATUS === 'CRITICAL') {
      const r = Math.random();
      if (r < 0.3) {
        value = spec.min + (spec.warnLow - spec.min) * Math.random() * 0.6;
      } else if (r < 0.6) {
        value = spec.warnHigh + (spec.max - spec.warnHigh) * Math.random() * 0.8;
      } else {
        value = spec.warnLow + (spec.warnHigh - spec.warnLow) * Math.random();
      }
    } else if (scanner.STATUS === 'WARNING') {
      const r = Math.random();
      if (r < 0.25) {
        value = spec.warnLow * 0.98 + Math.random() * (spec.warnLow * 0.04);
      } else if (r < 0.5) {
        value = spec.warnHigh + (spec.max - spec.warnHigh) * Math.random() * 0.4;
      } else {
        value = spec.warnLow + (spec.warnHigh - spec.warnLow) * Math.random();
      }
    } else {
      const range = spec.warnHigh - spec.warnLow;
      value = spec.warnLow + range * 0.15 + Math.random() * range * 0.7;
    }

    value = Math.round(value * 100) / 100;

    if (spec.name === '193nm Laser Power') {
      status = value < spec.min ? 'CRITICAL' : value < spec.warnLow ? 'WARNING' : 'HEALTHY';
    } else if (spec.name === 'Optics Contamination' || spec.name === 'Stage Vibration') {
      status = value > spec.max ? 'CRITICAL' : value > spec.warnHigh ? 'WARNING' : 'HEALTHY';
    } else {
      status = (value < spec.min || value > spec.max) ? 'CRITICAL'
        : (value < spec.warnLow || value > spec.warnHigh) ? 'WARNING'
        : 'HEALTHY';
    }

    const midpoint = (spec.warnLow + spec.warnHigh) / 2;
    const deviationPct = Math.round(Math.abs(value - midpoint) / midpoint * 100);

    return {
      SCANNER_ID: scanner.SCANNER_ID,
      METRIC_NAME: spec.name,
      CURRENT_VALUE: value,
      UNIT: spec.unit,
      MIN_THRESHOLD: spec.min,
      MAX_THRESHOLD: spec.max,
      WARNING_LOW: spec.warnLow,
      WARNING_HIGH: spec.warnHigh,
      STATUS: status,
      DEVIATION_PCT: deviationPct,
    };
  });
}

export function getSensorReadingsForScanner(scannerId: string): SensorReading[] {
  const scanner = mockScanners.find(s => s.SCANNER_ID === scannerId);
  if (!scanner) return [];
  return generateSensorReadings(scanner);
}

export function getAllSensorReadings(): SensorReading[] {
  return mockScanners.flatMap(s => generateSensorReadings(s));
}

export const mockEscalationCases: EscalationCase[] = [
  {
    CASE_ID: 'ESC-2026-4281',
    CASE_TITLE: 'Critical laser power degradation — production impact',
    CUSTOMER: 'Samsung',
    FAB_SITE: 'Pyeongtaek P3',
    SCANNER_ID: 'SCN-KR-001',
    SEVERITY: 'SEV1',
    STATUS: 'ESCALATED',
    ASSIGNED_ENGINEER: 'Park Jin-soo',
    ENGINEER_LOCATION: 'Pyeongtaek, KR',
    CREATED_DATE: '2026-03-22T08:00:00Z',
    LAST_UPDATED: '2026-03-26T06:15:00Z',
    AGE_DAYS: 4,
    SLA_TARGET_HOURS: 24,
    SLA_REMAINING_HOURS: -72,
    PARTS_NEEDED: ['994-023 NLO Crystal Assembly'],
    DESCRIPTION: 'Laser power at 82.3mW, below 90mW critical threshold. Production line halted on 2 tools. Customer requesting ETA on resolution.',
    COMMUNICATION_LOG: [
      { TIMESTAMP: '2026-03-22T08:00:00Z', AUTHOR: 'Park Jin-soo', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Initial case opened. Power readings dropping consistently over past 48 hours. Now at 82.3mW.', TYPE: 'NOTE' },
      { TIMESTAMP: '2026-03-22T14:00:00Z', AUTHOR: 'Park Jin-soo', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Confirmed CLBO crystal from batch B-2024-X. Matches Service Bulletin SB-2024-0892.', TYPE: 'NOTE' },
      { TIMESTAMP: '2026-03-23T09:00:00Z', AUTHOR: 'Samsung Fab Ops', AUTHOR_ROLE: 'Customer', MESSAGE: 'Two production lines impacted. Need resolution ETA within 24 hours or escalation to VP level.', TYPE: 'EMAIL' },
      { TIMESTAMP: '2026-03-23T10:00:00Z', AUTHOR: 'Park Jin-soo', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Escalating to SEV1. Requesting emergency crystal shipment from Singapore Hub.', TYPE: 'ESCALATION' },
      { TIMESTAMP: '2026-03-24T08:00:00Z', AUTHOR: 'Kim Soo-yeon', AUTHOR_ROLE: 'Regional Manager', MESSAGE: 'Crystal shipment approved from Singapore. Parts request submitted.', TYPE: 'PARTS_REQUEST' },
      { TIMESTAMP: '2026-03-26T06:15:00Z', AUTHOR: 'Park Jin-soo', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Part in transit. Expected delivery by end of day. Customer updated on ETA.', TYPE: 'STATUS_UPDATE' },
    ],
  },
  {
    CASE_ID: 'ESC-2026-4305',
    CASE_TITLE: 'Emergency power failure — wafer scrap event',
    CUSTOMER: 'Renesas',
    FAB_SITE: 'Naka Fab',
    SCANNER_ID: 'SCN-JP-005',
    SEVERITY: 'SEV1',
    STATUS: 'IN_PROGRESS',
    ASSIGNED_ENGINEER: 'Tanaka Hiroshi',
    ENGINEER_LOCATION: 'Hitachinaka, JP',
    CREATED_DATE: '2026-03-24T02:00:00Z',
    LAST_UPDATED: '2026-03-25T22:00:00Z',
    AGE_DAYS: 2,
    SLA_TARGET_HOURS: 24,
    SLA_REMAINING_HOURS: -24,
    PARTS_NEEDED: ['994-023 NLO Crystal Assembly', '994-025 Mirror Assembly'],
    DESCRIPTION: 'Sudden power drop to 78.9mW mid-production. 12 wafers scrapped. Root cause: thermal runaway in CLBO crystal (batch B-2024-X).',
    COMMUNICATION_LOG: [
      { TIMESTAMP: '2026-03-24T02:00:00Z', AUTHOR: 'Tanaka Hiroshi', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Urgent: power dropped to 78.9mW during active production run. 12 wafers lost. Tool taken offline.', TYPE: 'NOTE' },
      { TIMESTAMP: '2026-03-24T06:00:00Z', AUTHOR: 'Renesas Fab Manager', AUTHOR_ROLE: 'Customer', MESSAGE: 'Requesting root cause analysis and timeline for repair. Yield impact assessment needed.', TYPE: 'EMAIL' },
      { TIMESTAMP: '2026-03-24T10:00:00Z', AUTHOR: 'Tanaka Hiroshi', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Crystal inspection confirms thermal damage. Batch B-2024-X. Also recommending mirror assembly inspection.', TYPE: 'NOTE' },
      { TIMESTAMP: '2026-03-25T22:00:00Z', AUTHOR: 'Tanaka Hiroshi', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Parts ordered. Singapore and Dresden both have stock. Awaiting shipment confirmation.', TYPE: 'PARTS_REQUEST' },
    ],
  },
  {
    CASE_ID: 'ESC-2026-4198',
    CASE_TITLE: 'Intermittent power fluctuations during high-volume production',
    CUSTOMER: 'TSMC',
    FAB_SITE: 'Fab 15 Taichung',
    SCANNER_ID: 'SCN-TW-004',
    SEVERITY: 'SEV2',
    STATUS: 'WAITING_PARTS',
    ASSIGNED_ENGINEER: 'Lin Mei-hua',
    ENGINEER_LOCATION: 'Taichung, TW',
    CREATED_DATE: '2026-03-18T04:00:00Z',
    LAST_UPDATED: '2026-03-25T08:00:00Z',
    AGE_DAYS: 8,
    SLA_TARGET_HOURS: 72,
    SLA_REMAINING_HOURS: -120,
    PARTS_NEEDED: ['994-023 NLO Crystal Assembly'],
    DESCRIPTION: 'Power oscillating between 89-93mW. Not yet critical but trending. Customer wants preventive swap during next maintenance window.',
    COMMUNICATION_LOG: [
      { TIMESTAMP: '2026-03-18T04:00:00Z', AUTHOR: 'Lin Mei-hua', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Power readings unstable: 89-93mW range. Crystal batch B-2024-X. Opened as SEV2 per trending analysis.', TYPE: 'NOTE' },
      { TIMESTAMP: '2026-03-20T10:00:00Z', AUTHOR: 'TSMC Fab 15 Ops', AUTHOR_ROLE: 'Customer', MESSAGE: 'Maintenance window available March 28-29. Can we schedule crystal replacement?', TYPE: 'EMAIL' },
      { TIMESTAMP: '2026-03-22T09:00:00Z', AUTHOR: 'Lin Mei-hua', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Crystal from batch B-2024-A requested. Waiting on inventory availability.', TYPE: 'PARTS_REQUEST' },
      { TIMESTAMP: '2026-03-25T08:00:00Z', AUTHOR: 'Lin Mei-hua', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Part backordered at San Jose. Checking Singapore and Tucson hubs.', TYPE: 'STATUS_UPDATE' },
    ],
  },
  {
    CASE_ID: 'ESC-2026-4312',
    CASE_TITLE: 'Beam current anomaly after calibration',
    CUSTOMER: 'SK Hynix',
    FAB_SITE: 'Icheon',
    SCANNER_ID: 'SCN-KR-004',
    SEVERITY: 'SEV2',
    STATUS: 'IN_PROGRESS',
    ASSIGNED_ENGINEER: 'Kim Dong-hyun',
    ENGINEER_LOCATION: 'Icheon, KR',
    CREATED_DATE: '2026-03-23T06:00:00Z',
    LAST_UPDATED: '2026-03-25T14:00:00Z',
    AGE_DAYS: 3,
    SLA_TARGET_HOURS: 72,
    SLA_REMAINING_HOURS: 0,
    PARTS_NEEDED: [],
    DESCRIPTION: 'Beam current running high after quarterly calibration. Power at 92.1mW and drifting. Investigating if related to B-2024-X batch.',
    COMMUNICATION_LOG: [
      { TIMESTAMP: '2026-03-23T06:00:00Z', AUTHOR: 'Kim Dong-hyun', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Post-calibration beam current above normal range. Correlates with power degradation trend.', TYPE: 'NOTE' },
      { TIMESTAMP: '2026-03-24T12:00:00Z', AUTHOR: 'Kim Dong-hyun', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Crystal is batch B-2024-X. May need replacement but attempting optics adjustment first.', TYPE: 'NOTE' },
      { TIMESTAMP: '2026-03-25T14:00:00Z', AUTHOR: 'Kim Dong-hyun', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Optics adjustment provided temporary improvement. Monitoring for 48 hours before deciding on crystal swap.', TYPE: 'STATUS_UPDATE' },
    ],
  },
  {
    CASE_ID: 'ESC-2026-4287',
    CASE_TITLE: 'Power trending below warning threshold',
    CUSTOMER: 'Intel',
    FAB_SITE: 'Fab 42 Chandler',
    SCANNER_ID: 'SCN-US-003',
    SEVERITY: 'SEV3',
    STATUS: 'OPEN',
    ASSIGNED_ENGINEER: 'John Martinez',
    ENGINEER_LOCATION: 'Chandler, AZ',
    CREATED_DATE: '2026-03-20T16:00:00Z',
    LAST_UPDATED: '2026-03-24T10:00:00Z',
    AGE_DAYS: 6,
    SLA_TARGET_HOURS: 168,
    SLA_REMAINING_HOURS: 24,
    PARTS_NEEDED: ['994-023 NLO Crystal Assembly'],
    DESCRIPTION: 'Gradual power decline from 98mW to 91.8mW over 2 weeks. Batch B-2024-X. Not yet impacting production.',
    COMMUNICATION_LOG: [
      { TIMESTAMP: '2026-03-20T16:00:00Z', AUTHOR: 'John Martinez', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Opened monitoring case. Power decline rate ~0.4mW/day. Batch B-2024-X confirmed.', TYPE: 'NOTE' },
      { TIMESTAMP: '2026-03-24T10:00:00Z', AUTHOR: 'John Martinez', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Customer informed. They prefer to plan replacement during next scheduled downtime (April 5).', TYPE: 'EMAIL' },
    ],
  },
  {
    CASE_ID: 'ESC-2026-4340',
    CASE_TITLE: 'Coolant flow rate irregularity',
    CUSTOMER: 'TSMC',
    FAB_SITE: 'Fab 18 Tainan',
    SCANNER_ID: 'SCN-TW-001',
    SEVERITY: 'SEV3',
    STATUS: 'WAITING_CUSTOMER',
    ASSIGNED_ENGINEER: 'Chen Wei-lin',
    ENGINEER_LOCATION: 'Tainan, TW',
    CREATED_DATE: '2026-03-25T02:00:00Z',
    LAST_UPDATED: '2026-03-25T18:00:00Z',
    AGE_DAYS: 1,
    SLA_TARGET_HOURS: 168,
    SLA_REMAINING_HOURS: 144,
    PARTS_NEEDED: [],
    DESCRIPTION: 'Coolant flow rate sensor showing periodic drops. May be sensor fault or actual flow restriction. Awaiting customer approval for inspection window.',
    COMMUNICATION_LOG: [
      { TIMESTAMP: '2026-03-25T02:00:00Z', AUTHOR: 'Chen Wei-lin', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Coolant flow sensor flagging intermittent drops below 9 L/min. Scanner still operational at 115.2mW.', TYPE: 'NOTE' },
      { TIMESTAMP: '2026-03-25T18:00:00Z', AUTHOR: 'Chen Wei-lin', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Requested 2-hour inspection window from TSMC ops. Awaiting response.', TYPE: 'STATUS_UPDATE' },
    ],
  },
  {
    CASE_ID: 'ESC-2026-4156',
    CASE_TITLE: 'Optics contamination exceeding threshold',
    CUSTOMER: 'IMEC',
    FAB_SITE: 'Leuven Cleanroom',
    SCANNER_ID: 'SCN-EU-004',
    SEVERITY: 'SEV2',
    STATUS: 'IN_PROGRESS',
    ASSIGNED_ENGINEER: 'Müller Hans',
    ENGINEER_LOCATION: 'Leuven, BE',
    CREATED_DATE: '2026-03-19T10:00:00Z',
    LAST_UPDATED: '2026-03-25T16:00:00Z',
    AGE_DAYS: 7,
    SLA_TARGET_HOURS: 72,
    SLA_REMAINING_HOURS: -96,
    PARTS_NEEDED: ['994-028 Optics Cleaning Kit', '994-023 NLO Crystal Assembly'],
    DESCRIPTION: 'Optics contamination at 18ppm (threshold 15ppm). Power at 92.4mW and declining. Crystal B-2024-X compounding the issue.',
    COMMUNICATION_LOG: [
      { TIMESTAMP: '2026-03-19T10:00:00Z', AUTHOR: 'Müller Hans', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Optics contamination sensor reading 18ppm. Cleaned but reading returned within 24 hours.', TYPE: 'NOTE' },
      { TIMESTAMP: '2026-03-21T14:00:00Z', AUTHOR: 'Müller Hans', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Root cause may be outgassing from crystal batch B-2024-X accelerating contamination.', TYPE: 'NOTE' },
      { TIMESTAMP: '2026-03-23T09:00:00Z', AUTHOR: 'IMEC Lab Director', AUTHOR_ROLE: 'Customer', MESSAGE: 'Research timeline flexible but need reliable tool by April 1 for next experimental run.', TYPE: 'EMAIL' },
      { TIMESTAMP: '2026-03-25T16:00:00Z', AUTHOR: 'Müller Hans', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Ordering optics cleaning kit and crystal replacement. Planning full service for March 30.', TYPE: 'PARTS_REQUEST' },
    ],
  },
  {
    CASE_ID: 'ESC-2026-4089',
    CASE_TITLE: 'Stage vibration after facility power event',
    CUSTOMER: 'Samsung',
    FAB_SITE: 'Austin Fab',
    SCANNER_ID: 'SCN-US-002',
    SEVERITY: 'SEV4',
    STATUS: 'RESOLVED',
    ASSIGNED_ENGINEER: 'Maria Garcia',
    ENGINEER_LOCATION: 'Austin, TX',
    CREATED_DATE: '2026-03-10T14:00:00Z',
    LAST_UPDATED: '2026-03-15T10:00:00Z',
    AGE_DAYS: 16,
    SLA_TARGET_HOURS: 336,
    SLA_REMAINING_HOURS: 200,
    PARTS_NEEDED: [],
    DESCRIPTION: 'Minor vibration increase after facility power event. Recalibration resolved the issue.',
    RESOLUTION_NOTES: 'Stage recalibrated. Vibration returned to normal range. Monitoring for 5 days confirmed stable.',
    COMMUNICATION_LOG: [
      { TIMESTAMP: '2026-03-10T14:00:00Z', AUTHOR: 'Maria Garcia', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Vibration readings elevated after site-wide power interruption yesterday.', TYPE: 'NOTE' },
      { TIMESTAMP: '2026-03-12T10:00:00Z', AUTHOR: 'Maria Garcia', AUTHOR_ROLE: 'Field Engineer', MESSAGE: 'Recalibration completed. Vibration back within normal range.', TYPE: 'STATUS_UPDATE' },
      { TIMESTAMP: '2026-03-15T10:00:00Z', AUTHOR: 'Maria Garcia', AUTHOR_ROLE: 'Field Engineer', MESSAGE: '5-day monitoring shows stable readings. Closing case.', TYPE: 'STATUS_UPDATE' },
    ],
  },
];

export function getEscalationCases(filter?: { engineer?: string; customer?: string; severity?: string; status?: string }): EscalationCase[] {
  let cases = mockEscalationCases;
  if (filter?.engineer) cases = cases.filter(c => c.ASSIGNED_ENGINEER === filter.engineer);
  if (filter?.customer) cases = cases.filter(c => c.CUSTOMER === filter.customer);
  if (filter?.severity) cases = cases.filter(c => c.SEVERITY === filter.severity);
  if (filter?.status) cases = cases.filter(c => c.STATUS !== 'RESOLVED');
  return cases;
}
