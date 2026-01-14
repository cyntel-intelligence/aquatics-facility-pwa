export type LogType =
  | 'pool_testing'
  | 'inspection'
  | 'salt_level'
  | 'salt_cell_cleaning'
  | 'filter_cleaning'
  | 'temperature';

export interface BaseLog {
  id: string;
  facilityId: string;
  type: LogType;
  timestamp: Date;
  recordedBy: string;
  recordedByName: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PoolTestingLog extends BaseLog {
  type: 'pool_testing';
  readings: {
    pH: number;
    chlorine: number;
    alkalinity: number;
    calciumHardness?: number;
    cyanuricAcid?: number;
    temperature?: number;
  };
  chemicalsAdded?: ChemicalAddition[];
  isCompliant: boolean;
  recommendations?: string[];
}

export interface ChemicalAddition {
  chemical: string;
  amount: number;
  unit: string;
  time: Date;
}

export interface InspectionLog extends BaseLog {
  type: 'inspection';
  inspectionType: 'daily' | 'weekly' | 'monthly' | 'safety' | 'equipment';
  findings: InspectionFinding[];
  overallStatus: 'pass' | 'fail' | 'needs_attention';
  followUpRequired: boolean;
  photoUrls?: string[];
}

export interface InspectionFinding {
  id: string;
  area: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SaltLevelLog extends BaseLog {
  type: 'salt_level';
  saltLevel: number;
  targetRange: { min: number; max: number };
  isInRange: boolean;
  actionTaken?: string;
}

export interface SaltCellCleaningLog extends BaseLog {
  type: 'salt_cell_cleaning';
  cleaningMethod: 'acid_wash' | 'manual' | 'other';
  conditionBefore: string;
  conditionAfter: string;
  nextCleaningDue?: Date;
  photoUrls?: string[];
}

export interface FilterCleaningLog extends BaseLog {
  type: 'filter_cleaning';
  filterType: 'sand' | 'cartridge' | 'de' | 'other';
  cleaningMethod: 'backwash' | 'replace' | 'deep_clean';
  pressureBefore?: number;
  pressureAfter?: number;
  nextCleaningDue?: Date;
}

export interface TemperatureLog extends BaseLog {
  type: 'temperature';
  temperature: number;
  location: 'pool' | 'spa' | 'ambient';
  targetRange: { min: number; max: number };
  isInRange: boolean;
}

export type Log =
  | PoolTestingLog
  | InspectionLog
  | SaltLevelLog
  | SaltCellCleaningLog
  | FilterCleaningLog
  | TemperatureLog;
