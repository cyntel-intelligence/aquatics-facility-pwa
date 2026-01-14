import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { facilityService } from '../services/firebase/facility.service';
import { Facility } from '../types';

export const useFacilities = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'facilities'), orderBy('name'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const facilitiesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Facility[];

        setFacilities(facilitiesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching facilities:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const createFacility = async (facilityData: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await facilityService.createFacility(facilityData);
      return id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateFacility = async (facilityId: string, updates: Partial<Facility>) => {
    try {
      await facilityService.updateFacility(facilityId, updates);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteFacility = async (facilityId: string) => {
    try {
      await facilityService.deleteFacility(facilityId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    facilities,
    loading,
    error,
    createFacility,
    updateFacility,
    deleteFacility,
  };
};
