import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Facility, ComplianceRules, PoolTestingRanges } from '../../types';

export const facilityService = {
  // Create a new facility
  async createFacility(facilityData: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'facilities'), {
        ...facilityData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating facility:', error);
      throw error;
    }
  },

  // Get a single facility by ID
  async getFacility(facilityId: string): Promise<Facility | null> {
    try {
      const docRef = doc(db, 'facilities', facilityId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        } as Facility;
      }

      return null;
    } catch (error) {
      console.error('Error getting facility:', error);
      throw error;
    }
  },

  // Get all facilities
  async getAllFacilities(): Promise<Facility[]> {
    try {
      const q = query(collection(db, 'facilities'), orderBy('name'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Facility[];
    } catch (error) {
      console.error('Error getting facilities:', error);
      throw error;
    }
  },

  // Update a facility
  async updateFacility(facilityId: string, updates: Partial<Facility>): Promise<void> {
    try {
      const docRef = doc(db, 'facilities', facilityId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating facility:', error);
      throw error;
    }
  },

  // Delete a facility
  async deleteFacility(facilityId: string): Promise<void> {
    try {
      const docRef = doc(db, 'facilities', facilityId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting facility:', error);
      throw error;
    }
  },

  // Compliance Rules Management
  async createComplianceRules(
    facilityId: string,
    standard: 'MAHC' | 'state' | 'local' | 'custom',
    poolTestingRanges: PoolTestingRanges
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'complianceRules'), {
        facilityId,
        standard,
        poolTestingRanges,
        inspectionRequirements: [],
        maintenanceSchedules: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating compliance rules:', error);
      throw error;
    }
  },

  async getComplianceRules(facilityId: string): Promise<ComplianceRules | null> {
    try {
      const q = query(collection(db, 'complianceRules'), where('facilityId', '==', facilityId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as ComplianceRules;
    } catch (error) {
      console.error('Error getting compliance rules:', error);
      throw error;
    }
  },

  async updateComplianceRules(complianceRulesId: string, updates: Partial<ComplianceRules>): Promise<void> {
    try {
      const docRef = doc(db, 'complianceRules', complianceRulesId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating compliance rules:', error);
      throw error;
    }
  },
};
