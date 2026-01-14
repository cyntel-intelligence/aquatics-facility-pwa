export type IncidentSeverity = 'minor' | 'moderate' | 'serious' | 'critical';
export type IncidentType =
  | 'injury'
  | 'near_miss'
  | 'property_damage'
  | 'chemical_spill'
  | 'equipment_failure'
  | 'other';

export interface IncidentReport {
  id: string;
  facilityId: string;
  incidentNumber: string;
  type: IncidentType;
  severity: IncidentSeverity;

  occurredAt: Date;
  location: string;

  reportedBy: string;
  reportedByName: string;
  reportedAt: Date;
  involvedPersons: InvolvedPerson[];
  witnesses: Witness[];

  description: string;
  immediateActions: string;
  rootCause?: string;
  preventiveMeasures?: string;

  photoUrls: string[];
  documentUrls: string[];
  signatures: Signature[];

  status: 'draft' | 'submitted' | 'under_review' | 'closed';
  followUpRequired: boolean;
  followUpNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  closedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface InvolvedPerson {
  id: string;
  name: string;
  type: 'patron' | 'staff' | 'visitor' | 'contractor';
  age?: number;
  contactInfo?: string;
  injuries?: string;
  medicalAttention: boolean;
  medicalDetails?: string;
}

export interface Witness {
  id: string;
  name: string;
  contactInfo: string;
  statement?: string;
}

export interface Signature {
  id: string;
  signedBy: string;
  role: string;
  signatureDataUrl: string;
  signedAt: Date;
}
