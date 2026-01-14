import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Checklist, ChecklistTemplate, ChecklistItem } from '../../types';

export const checklistService = {
  // Template Management
  async createTemplate(
    name: string,
    description: string,
    category: 'daily' | 'weekly' | 'monthly' | 'custom',
    items: Omit<ChecklistItem, 'id' | 'isCompleted' | 'completedAt' | 'completedBy' | 'notes' | 'photoUrl'>[],
    facilityId?: string
  ): Promise<string> {
    try {
      const templateItems = items.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        text: item.text,
        requiresPhoto: item.requiresPhoto,
        order: item.order,
      }));

      const docRef = await addDoc(collection(db, 'checklistTemplates'), {
        name,
        description,
        category,
        items: templateItems,
        isDefault: false,
        facilityId: facilityId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  async getTemplates(facilityId?: string): Promise<ChecklistTemplate[]> {
    try {
      // Get both global templates and facility-specific templates
      const queries = [
        query(collection(db, 'checklistTemplates'), where('facilityId', '==', null), orderBy('name')),
      ];

      if (facilityId) {
        queries.push(
          query(
            collection(db, 'checklistTemplates'),
            where('facilityId', '==', facilityId),
            orderBy('name')
          )
        );
      }

      const results = await Promise.all(queries.map((q) => getDocs(q)));
      const templates: ChecklistTemplate[] = [];

      results.forEach((querySnapshot) => {
        querySnapshot.docs.forEach((doc) => {
          templates.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          } as ChecklistTemplate);
        });
      });

      return templates;
    } catch (error) {
      console.error('Error getting templates:', error);
      throw error;
    }
  },

  async updateTemplate(templateId: string, updates: Partial<ChecklistTemplate>): Promise<void> {
    try {
      const docRef = doc(db, 'checklistTemplates', templateId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const docRef = doc(db, 'checklistTemplates', templateId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  // Checklist Management
  async createChecklist(
    facilityId: string,
    name: string,
    description: string,
    items: ChecklistItem[],
    templateId?: string,
    assignedTo?: string,
    dueDate?: Date
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'checklists'), {
        facilityId,
        templateId: templateId || null,
        name,
        description,
        items,
        assignedTo: assignedTo || null,
        dueDate: dueDate || null,
        status: 'pending',
        completedAt: null,
        completedBy: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating checklist:', error);
      throw error;
    }
  },

  async getChecklists(facilityId: string, status?: string): Promise<Checklist[]> {
    try {
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

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        dueDate: doc.data().dueDate?.toDate() || undefined,
        completedAt: doc.data().completedAt?.toDate() || undefined,
      })) as Checklist[];
    } catch (error) {
      console.error('Error getting checklists:', error);
      throw error;
    }
  },

  async updateChecklist(checklistId: string, updates: Partial<Checklist>): Promise<void> {
    try {
      const docRef = doc(db, 'checklists', checklistId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating checklist:', error);
      throw error;
    }
  },

  async updateChecklistItem(
    checklistId: string,
    itemId: string,
    isCompleted: boolean,
    completedBy?: string,
    notes?: string,
    photoUrl?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, 'checklists', checklistId);

      // Fetch the current checklist to update the specific item
      const checklistDoc = await getDocs(query(collection(db, 'checklists'), where('__name__', '==', checklistId)));

      if (!checklistDoc.empty) {
        const checklist = checklistDoc.docs[0].data() as Checklist;
        const updatedItems = checklist.items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              isCompleted,
              completedAt: isCompleted ? new Date() : undefined,
              completedBy: isCompleted ? completedBy : undefined,
              notes: notes || item.notes,
              photoUrl: photoUrl || item.photoUrl,
            };
          }
          return item;
        });

        // Check if all items are completed
        const allCompleted = updatedItems.every((item) => item.isCompleted);
        const status = allCompleted ? 'completed' : updatedItems.some((item) => item.isCompleted) ? 'in-progress' : 'pending';

        await updateDoc(docRef, {
          items: updatedItems,
          status,
          ...(allCompleted && {
            completedAt: serverTimestamp(),
            completedBy: completedBy,
          }),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error updating checklist item:', error);
      throw error;
    }
  },

  async deleteChecklist(checklistId: string): Promise<void> {
    try {
      const docRef = doc(db, 'checklists', checklistId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting checklist:', error);
      throw error;
    }
  },
};
