export type UserRole = 'admin' | 'manager' | 'staff';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  facilityIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface StaffMember {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  facilityIds: string[];
  phone?: string;
  certifications?: Certification[];
  isActive: boolean;
  hireDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Certification {
  id: string;
  name: string;
  issuedBy: string;
  issuedDate: Date;
  expiresDate: Date;
  certificateUrl?: string;
}
