import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { logService } from '../services/firebase/log.service';
import { Log, LogType, PoolTestingLog, ChemicalAddition } from '../types';

export const useLogs = (facilityId: string | undefined, logType?: LogType, limitCount: number = 50) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!facilityId) {
      setLogs([]);
      setLoading(false);
      return;
    }

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

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as Log;
        });

        setLogs(logsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching logs:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [facilityId, logType, limitCount]);

  const createPoolTestingLog = async (
    userId: string,
    userName: string,
    readings: PoolTestingLog['readings'],
    isCompliant: boolean,
    recommendations?: string[],
    chemicalsAdded?: ChemicalAddition[],
    notes?: string
  ) => {
    if (!facilityId) {
      throw new Error('Facility ID is required');
    }

    try {
      const id = await logService.createPoolTestingLog(
        facilityId,
        userId,
        userName,
        readings,
        isCompliant,
        recommendations,
        chemicalsAdded,
        notes
      );
      return id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateLog = async (logId: string, updates: Partial<Log>) => {
    try {
      await logService.updateLog(logId, updates);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteLog = async (logId: string) => {
    try {
      await logService.deleteLog(logId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const createSaltLevelLog = async (
    saltLevel: number,
    targetRange: { min: number; max: number },
    actionTaken?: string,
    notes?: string
  ) => {
    if (!facilityId || !user) {
      throw new Error('Facility ID and user are required');
    }

    try {
      const id = await logService.createSaltLevelLog(
        facilityId,
        saltLevel,
        targetRange,
        user.uid,
        user.displayName || user.email || 'Unknown',
        actionTaken,
        notes
      );
      return id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const createSaltCellCleaningLog = async (
    cleaningMethod: string,
    conditionBefore: string,
    conditionAfter: string,
    nextCleaningDue?: Date,
    notes?: string
  ) => {
    if (!facilityId || !user) {
      throw new Error('Facility ID and user are required');
    }

    try {
      const id = await logService.createSaltCellCleaningLog(
        facilityId,
        cleaningMethod,
        conditionBefore,
        conditionAfter,
        user.uid,
        user.displayName || user.email || 'Unknown',
        nextCleaningDue,
        notes
      );
      return id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const createFilterCleaningLog = async (
    filterType: string,
    cleaningMethod: string,
    pressureBefore: number,
    pressureAfter: number,
    nextCleaningDue?: Date,
    notes?: string
  ) => {
    if (!facilityId || !user) {
      throw new Error('Facility ID and user are required');
    }

    try {
      const id = await logService.createFilterCleaningLog(
        facilityId,
        filterType,
        cleaningMethod,
        pressureBefore,
        pressureAfter,
        user.uid,
        user.displayName || user.email || 'Unknown',
        nextCleaningDue,
        notes
      );
      return id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const createTemperatureLog = async (
    temperature: number,
    location: string,
    targetRange: { min: number; max: number },
    actionTaken?: string,
    notes?: string
  ) => {
    if (!facilityId || !user) {
      throw new Error('Facility ID and user are required');
    }

    try {
      const id = await logService.createTemperatureLog(
        facilityId,
        temperature,
        location,
        targetRange,
        user.uid,
        user.displayName || user.email || 'Unknown',
        actionTaken,
        notes
      );
      return id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    logs,
    loading,
    error,
    createPoolTestingLog,
    createSaltLevelLog,
    createSaltCellCleaningLog,
    createFilterCleaningLog,
    createTemperatureLog,
    updateLog,
    deleteLog,
  };
};

// Separate hook for chart data
export const usePoolTestingChart = (facilityId: string | undefined, days: number = 7) => {
  const [chartData, setChartData] = useState<PoolTestingLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!facilityId) {
      setChartData([]);
      setLoading(false);
      return;
    }

    const fetchChartData = async () => {
      try {
        const data = await logService.getPoolTestingLogsForChart(facilityId, days);
        setChartData(data);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [facilityId, days]);

  return { chartData, loading };
};
