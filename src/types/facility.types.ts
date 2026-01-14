export interface Facility {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  type: 'pool' | 'spa' | 'waterpark' | 'other';
  capacity: number;
  operatingHours: OperatingHours;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperatingHours {
  [day: string]: {
    open: string;
    close: string;
    isClosed: boolean;
  };
}

export interface ComplianceRules {
  id: string;
  facilityId: string;
  standard: 'MAHC' | 'state' | 'local' | 'custom';
  poolTestingRanges: PoolTestingRanges;
  inspectionRequirements: InspectionRequirement[];
  maintenanceSchedules: MaintenanceSchedule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PoolTestingRanges {
  pH: { min: number; max: number };
  chlorine: { min: number; max: number };
  alkalinity: { min: number; max: number };
  calciumHardness?: { min: number; max: number };
  cyanuricAcid?: { min: number; max: number };
  temperature?: { min: number; max: number };
}

export interface InspectionRequirement {
  type: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'annual';
  description: string;
}

export interface MaintenanceSchedule {
  type: string;
  frequency: string;
  description: string;
}
