import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { IncidentReport } from '../../types';

// Generate an auto-incrementing incident number like INC-2026-001
async function generateIncidentNumber(facilityId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INC-${year}-`;

  const q = query(
    collection(db, 'incidents'),
    where('facilityId', '==', facilityId),
    where('incidentNumber', '>=', prefix),
    where('incidentNumber', '<=', prefix + '\uf8ff'),
    orderBy('incidentNumber', 'desc'),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return `${prefix}001`;
  }

  const lastNumber = snapshot.docs[0].data().incidentNumber as string;
  const seq = parseInt(lastNumber.split('-')[2], 10) + 1;
  return `${prefix}${seq.toString().padStart(3, '0')}`;
}

function convertDatesToTimestamps(data: Record<string, any>): Record<string, any> {
  const converted: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      converted[key] = Timestamp.fromDate(value);
    } else if (Array.isArray(value)) {
      converted[key] = value.map((item) =>
        typeof item === 'object' && item !== null ? convertDatesToTimestamps(item) : item
      );
    } else if (typeof value === 'object' && value !== null && !(value instanceof Timestamp)) {
      converted[key] = convertDatesToTimestamps(value);
    } else {
      converted[key] = value;
    }
  }
  return converted;
}

function convertTimestampsToDates(data: Record<string, any>): Record<string, any> {
  const converted: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      converted[key] = value.toDate();
    } else if (Array.isArray(value)) {
      converted[key] = value.map((item) =>
        typeof item === 'object' && item !== null ? convertTimestampsToDates(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      converted[key] = convertTimestampsToDates(value);
    } else {
      converted[key] = value;
    }
  }
  return converted;
}

export const incidentService = {
  async createIncident(
    facilityId: string,
    data: Omit<IncidentReport, 'id' | 'incidentNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const incidentNumber = await generateIncidentNumber(facilityId);

      const docData = convertDatesToTimestamps({
        ...data,
        facilityId,
        incidentNumber,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const docRef = await addDoc(collection(db, 'incidents'), docData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating incident:', error);
      throw error;
    }
  },

  async getIncidentsByFacility(
    facilityId: string,
    statusFilter?: IncidentReport['status'],
    limitCount: number = 50
  ): Promise<IncidentReport[]> {
    try {
      let q;
      if (statusFilter) {
        q = query(
          collection(db, 'incidents'),
          where('facilityId', '==', facilityId),
          where('status', '==', statusFilter),
          orderBy('reportedAt', 'desc'),
          limit(limitCount)
        );
      } else {
        q = query(
          collection(db, 'incidents'),
          where('facilityId', '==', facilityId),
          orderBy('reportedAt', 'desc'),
          limit(limitCount)
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = convertTimestampsToDates(doc.data());
        return { id: doc.id, ...data } as IncidentReport;
      });
    } catch (error) {
      console.error('Error getting incidents:', error);
      throw error;
    }
  },

  async getIncidentById(incidentId: string): Promise<IncidentReport | null> {
    try {
      const docSnap = await getDoc(doc(db, 'incidents', incidentId));
      if (!docSnap.exists()) return null;

      const data = convertTimestampsToDates(docSnap.data());
      return { id: docSnap.id, ...data } as IncidentReport;
    } catch (error) {
      console.error('Error getting incident:', error);
      throw error;
    }
  },

  async updateIncident(
    incidentId: string,
    updates: Partial<IncidentReport>
  ): Promise<void> {
    try {
      const { id, ...data } = updates as any;
      const docData = convertDatesToTimestamps({
        ...data,
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'incidents', incidentId), docData);
    } catch (error) {
      console.error('Error updating incident:', error);
      throw error;
    }
  },

  async submitIncident(incidentId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'incidents', incidentId), {
        status: 'submitted',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error submitting incident:', error);
      throw error;
    }
  },

  async reviewIncident(
    incidentId: string,
    reviewedBy: string,
    followUpRequired: boolean,
    followUpNotes?: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'incidents', incidentId), {
        status: 'under_review',
        reviewedBy,
        reviewedAt: serverTimestamp(),
        followUpRequired,
        followUpNotes: followUpNotes || null,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error reviewing incident:', error);
      throw error;
    }
  },

  async closeIncident(incidentId: string, reviewedBy: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'incidents', incidentId), {
        status: 'closed',
        reviewedBy,
        closedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error closing incident:', error);
      throw error;
    }
  },

  async deleteIncident(incidentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'incidents', incidentId));
    } catch (error) {
      console.error('Error deleting incident:', error);
      throw error;
    }
  },
};
