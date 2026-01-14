export interface Checklist {
  id: string;
  facilityId: string;
  templateId?: string;
  name: string;
  description?: string;
  items: ChecklistItem[];
  assignedTo?: string;
  dueDate?: Date;
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: Date;
  completedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
  requiresPhoto: boolean;
  photoUrl?: string;
  order: number;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'daily' | 'weekly' | 'monthly' | 'custom';
  items: ChecklistTemplateItem[];
  isDefault: boolean;
  facilityId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistTemplateItem {
  id: string;
  text: string;
  requiresPhoto: boolean;
  order: number;
}
