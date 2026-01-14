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
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PoolTestingLog, Log, LogType } from '../../types';

export const logService = {
  // Create a pool testing log
  async createPoolTestingLog(
    facilityId: string,
    userId: string,
    userName: string,
    readings: PoolTestingLog['readings'],
    isCompliant: boolean,
    recommendations?: string[],
    chemicalsAdded?: PoolTestingLog['chemicalsAdded'],
    notes?: string
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'logs'), {
        facilityId,
        type: 'pool_testing',
        timestamp: serverTimestamp(),
        recordedBy: userId,
        recordedByName: userName,
        readings,
        chemicalsAdded: chemicalsAdded || [],
        isCompliant,
        recommendations: recommendations || [],
        notes: notes || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating pool testing log:', error);
      throw error;
    }
  },

  // Get logs by facility and type
  async getLogsByFacility(
    facilityId: string,
    logType?: LogType,
    limitCount: number = 50
  ): Promise<Log[]> {
    try {
      let q;
      if (logType) {
        q = query(
          collection(db, 'logs'),
          where('facilityId', '==', facilityId),
          where('type', '==', logType),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
      } else {
        q = query(
          collection(db, 'logs'),
          where('facilityId', '==', facilityId),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Log;
      });
    } catch (error) {
      console.error('Error getting logs:', error);
      throw error;
    }
  },

  // Get pool testing logs for trend analysis
  async getPoolTestingLogsForChart(
    facilityId: string,
    days: number = 7
  ): Promise<PoolTestingLog[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const q = query(
        collection(db, 'logs'),
        where('facilityId', '==', facilityId),
        where('type', '==', 'pool_testing'),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        orderBy('timestamp', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as PoolTestingLog;
      });
    } catch (error) {
      console.error('Error getting pool testing logs for chart:', error);
      throw error;
    }
  },

  // Create salt level log
  async createSaltLevelLog(
    facilityId: string,
    saltLevel: number,
    targetRange: { min: number; max: number },
    recordedBy: string,
    recordedByName: string,
    actionTaken?: string,
    notes?: string
  ): Promise<string> {
    try {
      const isInRange = saltLevel >= targetRange.min && saltLevel <= targetRange.max;

      const logData = {
        facilityId,
        type: 'salt_level',
        timestamp: serverTimestamp(),
        recordedBy,
        recordedByName,
        saltLevel,
        targetRange,
        isInRange,
        actionTaken: actionTaken || null,
        notes: notes || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'logs'), logData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating salt level log:', error);
      throw error;
    }
  },

  // Create salt cell cleaning log
  async createSaltCellCleaningLog(
    facilityId: string,
    cleaningMethod: string,
    conditionBefore: string,
    conditionAfter: string,
    recordedBy: string,
    recordedByName: string,
    nextCleaningDue?: Date,
    notes?: string
  ): Promise<string> {
    try {
      const logData = {
        facilityId,
        type: 'salt_cell_cleaning',
        timestamp: serverTimestamp(),
        recordedBy,
        recordedByName,
        cleaningMethod,
        conditionBefore,
        conditionAfter,
        nextCleaningDue: nextCleaningDue ? Timestamp.fromDate(nextCleaningDue) : null,
        notes: notes || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'logs'), logData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating salt cell cleaning log:', error);
      throw error;
    }
  },

  // Create filter cleaning log
  async createFilterCleaningLog(
    facilityId: string,
    filterType: string,
    cleaningMethod: string,
    pressureBefore: number,
    pressureAfter: number,
    recordedBy: string,
    recordedByName: string,
    nextCleaningDue?: Date,
    notes?: string
  ): Promise<string> {
    try {
      const logData = {
        facilityId,
        type: 'filter_cleaning',
        timestamp: serverTimestamp(),
        recordedBy,
        recordedByName,
        filterType,
        cleaningMethod,
        pressureBefore,
        pressureAfter,
        nextCleaningDue: nextCleaningDue ? Timestamp.fromDate(nextCleaningDue) : null,
        notes: notes || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'logs'), logData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating filter cleaning log:', error);
      throw error;
    }
  },

  // Create temperature log
  async createTemperatureLog(
    facilityId: string,
    temperature: number,
    location: string,
    targetRange: { min: number; max: number },
    recordedBy: string,
    recordedByName: string,
    actionTaken?: string,
    notes?: string
  ): Promise<string> {
    try {
      const isInRange = temperature >= targetRange.min && temperature <= targetRange.max;

      const logData = {
        facilityId,
        type: 'temperature',
        timestamp: serverTimestamp(),
        recordedBy,
        recordedByName,
        temperature,
        location,
        targetRange,
        isInRange,
        actionTaken: actionTaken || null,
        notes: notes || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'logs'), logData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating temperature log:', error);
      throw error;
    }
  },

  // Update a log
  async updateLog(logId: string, updates: Partial<Log>): Promise<void> {
    try {
      const docRef = doc(db, 'logs', logId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating log:', error);
      throw error;
    }
  },

  // Delete a log
  async deleteLog(logId: string): Promise<void> {
    try {
      const docRef = doc(db, 'logs', logId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting log:', error);
      throw error;
    }
  },
};
