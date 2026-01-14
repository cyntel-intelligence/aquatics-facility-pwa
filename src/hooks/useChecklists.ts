import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { checklistService } from '../services/firebase/checklist.service';
import { Checklist, ChecklistTemplate, ChecklistItem } from '../types';

export const useChecklistTemplates = (facilityId?: string) => {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await checklistService.getTemplates(facilityId);
        setTemplates(data);
      } catch (err: any) {
        console.error('Error fetching templates:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [facilityId]);

  const createTemplate = async (
    name: string,
    description: string,
    category: 'daily' | 'weekly' | 'monthly' | 'custom',
    items: Omit<ChecklistItem, 'id' | 'isCompleted' | 'completedAt' | 'completedBy' | 'notes' | 'photoUrl'>[]
  ) => {
    try {
      const id = await checklistService.createTemplate(name, description, category, items, facilityId);
      // Refresh templates
      const data = await checklistService.getTemplates(facilityId);
      setTemplates(data);
      return id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateTemplate = async (templateId: string, updates: Partial<ChecklistTemplate>) => {
    try {
      await checklistService.updateTemplate(templateId, updates);
      // Refresh templates
      const data = await checklistService.getTemplates(facilityId);
      setTemplates(data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      await checklistService.deleteTemplate(templateId);
      // Refresh templates
      const data = await checklistService.getTemplates(facilityId);
      setTemplates(data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};

export const useChecklists = (facilityId: string | undefined, status?: string) => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!facilityId) {
      setChecklists([]);
      setLoading(false);
      return;
    }

    let q;
    if (status) {
      q = query(
        collection(db, 'checklists'),
        where('facilityId', '==', facilityId),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'checklists'),
        where('facilityId', '==', facilityId),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const checklistsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          dueDate: doc.data().dueDate?.toDate() || undefined,
          completedAt: doc.data().completedAt?.toDate() || undefined,
        })) as Checklist[];

        setChecklists(checklistsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching checklists:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [facilityId, status]);

  const createChecklist = async (
    name: string,
    description: string,
    items: ChecklistItem[],
    templateId?: string,
    assignedTo?: string,
    dueDate?: Date
  ) => {
    if (!facilityId) {
      throw new Error('Facility ID is required');
    }

    try {
      const id = await checklistService.createChecklist(
        facilityId,
        name,
        description,
        items,
        templateId,
        assignedTo,
        dueDate
      );
      return id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateChecklist = async (checklistId: string, updates: Partial<Checklist>) => {
    try {
      await checklistService.updateChecklist(checklistId, updates);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateChecklistItem = async (
    checklistId: string,
    itemId: string,
    isCompleted: boolean,
    completedBy?: string,
    notes?: string,
    photoUrl?: string
  ) => {
    try {
      await checklistService.updateChecklistItem(checklistId, itemId, isCompleted, completedBy, notes, photoUrl);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteChecklist = async (checklistId: string) => {
    try {
      await checklistService.deleteChecklist(checklistId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    checklists,
    loading,
    error,
    createChecklist,
    updateChecklist,
    updateChecklistItem,
    deleteChecklist,
  };
};
