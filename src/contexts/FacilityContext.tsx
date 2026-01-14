import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { Facility } from '../types';

interface FacilityContextType {
  facilities: Facility[];
  currentFacility: Facility | null;
  setCurrentFacility: (facility: Facility | null) => void;
  loading: boolean;
}

const FacilityContext = createContext<FacilityContextType | undefined>(undefined);

export const useFacility = () => {
  const context = useContext(FacilityContext);
  if (!context) {
    throw new Error('useFacility must be used within a FacilityProvider');
  }
  return context;
};

interface FacilityProviderProps {
  children: ReactNode;
}

export const FacilityProvider = ({ children }: FacilityProviderProps) => {
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [currentFacility, setCurrentFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.facilityIds.length === 0) {
      setFacilities([]);
      setCurrentFacility(null);
      setLoading(false);
      return;
    }

    // Subscribe to facilities the user has access to
    const q = query(
      collection(db, 'facilities'),
      where('__name__', 'in', user.facilityIds.slice(0, 10)) // Firestore 'in' query limit is 10
    );

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

        // Set current facility to first one if not already set
        if (!currentFacility && facilitiesData.length > 0) {
          const savedFacilityId = localStorage.getItem('currentFacilityId');
          const savedFacility = facilitiesData.find((f) => f.id === savedFacilityId);
          setCurrentFacility(savedFacility || facilitiesData[0]);
        }

        setLoading(false);
      },
      (error) => {
        console.error('Error fetching facilities:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const handleSetCurrentFacility = (facility: Facility | null) => {
    setCurrentFacility(facility);
    if (facility) {
      localStorage.setItem('currentFacilityId', facility.id);
    } else {
      localStorage.removeItem('currentFacilityId');
    }
  };

  const value: FacilityContextType = {
    facilities,
    currentFacility,
    setCurrentFacility: handleSetCurrentFacility,
    loading,
  };

  return <FacilityContext.Provider value={value}>{children}</FacilityContext.Provider>;
};
