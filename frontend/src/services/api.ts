import type { Scanner, TelemetryReading, Alert, FleetMetric, PartInventory, MaintenanceLog, ShippingOption, SensorReading } from '../types';

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

  const rates = shippingRates[destinationCountry] || shippingRates['USA'];
  const taxRate = taxRates[destinationCountry] || 0.08;

  return baseOptions.map(opt => {
    const shipping = rates[opt.WAREHOUSE_STATE] || { cost: 3000, days: 3 };
    const subtotal = opt.UNIT_COST + shipping.cost;
    const taxAmount = Math.round(subtotal * taxRate);
    return {
      ...opt,
      SHIPPING_COST: shipping.cost,
      ESTIMATED_DAYS: shipping.days,
      TAX_RATE: taxRate,
      TAX_AMOUNT: taxAmount,
      TOTAL_COST: subtotal + taxAmount,
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
