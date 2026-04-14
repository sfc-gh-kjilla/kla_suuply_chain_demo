export interface Scanner {
  SCANNER_ID: string;
  SCANNER_MODEL: string;
  SCANNER_TYPE: string;
  FAB_NAME: string;
  FAB_CITY: string;
  FAB_COUNTRY: string;
  LATITUDE: number;
  LONGITUDE: number;
  STATUS: 'OPERATIONAL' | 'WARNING' | 'CRITICAL' | 'MAINTENANCE';
  CRYSTAL_BATCH_LOT: string;
  CURRENT_POWER_MW?: number;
}

export interface TelemetryReading {
  SCANNER_ID: string;
  READING_TIMESTAMP: string;
  METRIC_VALUE: number;
  IS_ANOMALY: boolean;
}

export interface Alert {
  ALERT_ID: number;
  SCANNER_ID: string;
  ALERT_TIMESTAMP: string;
  ALERT_TYPE: string;
  SEVERITY: 'INFO' | 'WARNING' | 'CRITICAL';
  METRIC_VALUE: number;
  THRESHOLD_VALUE: number;
  DESCRIPTION: string;
  STATUS: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface PartInventory {
  PART_ID: string;
  PART_NAME: string;
  WAREHOUSE_LOCATION: string;
  QUANTITY_AVAILABLE: number;
  UNIT_COST: number;
}

export interface FleetMetric {
  SCANNER_ID: string;
  FAB_NAME: string;
  FAB_COUNTRY: string;
  STATUS: string;
  CURRENT_POWER_MW: number;
  FLEET_MEAN_POWER: number;
  Z_SCORE: number;
  LATITUDE: number;
  LONGITUDE: number;
  CRYSTAL_BATCH_LOT: string;
}

export interface ToolStep {
  tool: string;
  description: string;
  status: 'pending' | 'running' | 'complete';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolResults?: ToolResult[];
  toolSteps?: ToolStep[];
}

export interface ToolResult {
  tool: string;
  result: unknown;
}

export interface MaintenanceLog {
  LOG_ID: number;
  SCANNER_ID: string;
  MAINTENANCE_DATE: string;
  MAINTENANCE_TYPE: 'CORRECTIVE' | 'PREVENTIVE';
  TECHNICIAN_NAME: string;
  PARTS_REPLACED: string;
  ISSUE_DESCRIPTION: string;
  RESOLUTION_NOTES: string;
  DOWNTIME_HOURS: number;
}

export interface SensorReading {
  SCANNER_ID: string;
  METRIC_NAME: string;
  CURRENT_VALUE: number;
  UNIT: string;
  MIN_THRESHOLD: number;
  MAX_THRESHOLD: number;
  WARNING_LOW: number;
  WARNING_HIGH: number;
  STATUS: 'CRITICAL' | 'WARNING' | 'HEALTHY';
  DEVIATION_PCT: number;
}

export interface ShippingOption {
  WAREHOUSE_LOCATION: string;
  WAREHOUSE_CITY: string;
  WAREHOUSE_STATE: string;
  QUANTITY_AVAILABLE: number;
  UNIT_COST: number;
  SHIPPING_COST: number;
  TAX_RATE: number;
  TAX_AMOUNT: number;
  TOTAL_COST: number;
  ESTIMATED_DAYS: number;
  SUPPLIER_BATCH_LOT: string;
  IMPORT_DUTY?: number;
  TARIFF_RATE?: number;
  LANDED_COST?: number;
}

export interface EscalationCase {
  CASE_ID: string;
  CASE_TITLE: string;
  CUSTOMER: string;
  FAB_SITE: string;
  SCANNER_ID: string;
  SEVERITY: 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4';
  STATUS: 'OPEN' | 'IN_PROGRESS' | 'WAITING_PARTS' | 'WAITING_CUSTOMER' | 'ESCALATED' | 'RESOLVED';
  ASSIGNED_ENGINEER: string;
  ENGINEER_LOCATION: string;
  CREATED_DATE: string;
  LAST_UPDATED: string;
  AGE_DAYS: number;
  SLA_TARGET_HOURS: number;
  SLA_REMAINING_HOURS: number;
  PARTS_NEEDED: string[];
  DESCRIPTION: string;
  RESOLUTION_NOTES?: string;
  COMMUNICATION_LOG: CaseCommunication[];
}

export interface CaseCommunication {
  TIMESTAMP: string;
  AUTHOR: string;
  AUTHOR_ROLE: string;
  MESSAGE: string;
  TYPE: 'NOTE' | 'EMAIL' | 'ESCALATION' | 'PARTS_REQUEST' | 'STATUS_UPDATE';
}
