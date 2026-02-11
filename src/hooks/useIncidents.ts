import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { incidentService } from '../services/firebase/incident.service';
import { IncidentReport } from '../types';

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

export const useIncidents = (
  facilityId: string | undefined,
  statusFilter?: IncidentReport['status'],
  limitCount: number = 50
) => {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!facilityId) {
      setIncidents([]);
      setLoading(false);
      return;
    }

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

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const raw = convertTimestampsToDates(doc.data());
          return { id: doc.id, ...raw } as IncidentReport;
        });
        setIncidents(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching incidents:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [facilityId, statusFilter, limitCount]);

  const createIncident = async (
    data: Omit<IncidentReport, 'id' | 'incidentNumber' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!facilityId) throw new Error('Facility ID is required');
    try {
      const id = await incidentService.createIncident(facilityId, data);
      return id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateIncident = async (incidentId: string, updates: Partial<IncidentReport>) => {
    try {
      await incidentService.updateIncident(incidentId, updates);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const submitIncident = async (incidentId: string) => {
    try {
      await incidentService.submitIncident(incidentId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const reviewIncident = async (
    incidentId: string,
    reviewedBy: string,
    followUpRequired: boolean,
    followUpNotes?: string
  ) => {
    try {
      await incidentService.reviewIncident(incidentId, reviewedBy, followUpRequired, followUpNotes);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const closeIncident = async (incidentId: string, reviewedBy: string) => {
    try {
      await incidentService.closeIncident(incidentId, reviewedBy);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteIncident = async (incidentId: string) => {
    try {
      await incidentService.deleteIncident(incidentId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    incidents,
    loading,
    error,
    createIncident,
    updateIncident,
    submitIncident,
    reviewIncident,
    closeIncident,
    deleteIncident,
  };
};
