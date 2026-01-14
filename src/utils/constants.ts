// MAHC Standard Compliance Ranges
export const MAHC_STANDARDS = {
  pH: { min: 7.2, max: 7.8 },
  chlorine: { min: 1.0, max: 10.0 }, // ppm (ideal 1-3)
  alkalinity: { min: 80, max: 120 }, // ppm
  calciumHardness: { min: 200, max: 400 }, // ppm
  cyanuricAcid: { min: 30, max: 50 }, // ppm
  temperature: { min: 78, max: 84 }, // Fahrenheit
};

// User Roles
export const ROLES = {
  ADMIN: 'admin' as const,
  MANAGER: 'manager' as const,
  STAFF: 'staff' as const,
};

// Incident Types
export const INCIDENT_TYPES = [
  { value: 'injury', label: 'Injury' },
  { value: 'near_miss', label: 'Near Miss' },
  { value: 'property_damage', label: 'Property Damage' },
  { value: 'chemical_spill', label: 'Chemical Spill' },
  { value: 'equipment_failure', label: 'Equipment Failure' },
  { value: 'other', label: 'Other' },
];

// Incident Severities
export const INCIDENT_SEVERITIES = [
  { value: 'minor', label: 'Minor', color: 'text-yellow-600' },
  { value: 'moderate', label: 'Moderate', color: 'text-orange-600' },
  { value: 'serious', label: 'Serious', color: 'text-red-600' },
  { value: 'critical', label: 'Critical', color: 'text-red-900' },
];

// Log Types
export const LOG_TYPES = [
  { value: 'pool_testing', label: 'Pool Testing', icon: 'TestTube' },
  { value: 'inspection', label: 'Inspection', icon: 'ClipboardCheck' },
  { value: 'salt_level', label: 'Salt Level', icon: 'Droplets' },
  { value: 'salt_cell_cleaning', label: 'Salt Cell Cleaning', icon: 'Wrench' },
  { value: 'filter_cleaning', label: 'Filter Cleaning', icon: 'Filter' },
  { value: 'temperature', label: 'Temperature', icon: 'Thermometer' },
];

// Checklist Categories
export const CHECKLIST_CATEGORIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
];

// Facility Types
export const FACILITY_TYPES = [
  { value: 'pool', label: 'Pool' },
  { value: 'spa', label: 'Spa' },
  { value: 'waterpark', label: 'Waterpark' },
  { value: 'other', label: 'Other' },
];
