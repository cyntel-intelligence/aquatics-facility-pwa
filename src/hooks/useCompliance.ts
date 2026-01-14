import { useState, useEffect } from 'react';
import { facilityService } from '../services/firebase/facility.service';
import { ComplianceRules, PoolTestingRanges } from '../types';
import { MAHC_STANDARDS } from '../utils/constants';

export const useCompliance = (facilityId: string | undefined) => {
  const [complianceRules, setComplianceRules] = useState<ComplianceRules | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!facilityId) {
      setLoading(false);
      return;
    }

    const fetchComplianceRules = async () => {
      try {
        setLoading(true);
        const rules = await facilityService.getComplianceRules(facilityId);
        setComplianceRules(rules);
      } catch (err: any) {
        console.error('Error fetching compliance rules:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComplianceRules();
  }, [facilityId]);

  const createComplianceRules = async (
    standard: 'MAHC' | 'state' | 'local' | 'custom',
    poolTestingRanges: PoolTestingRanges
  ) => {
    if (!facilityId) {
      throw new Error('Facility ID is required');
    }

    try {
      const id = await facilityService.createComplianceRules(facilityId, standard, poolTestingRanges);
      // Refresh compliance rules
      const rules = await facilityService.getComplianceRules(facilityId);
      setComplianceRules(rules);
      return id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateComplianceRules = async (updates: Partial<ComplianceRules>) => {
    if (!complianceRules) {
      throw new Error('No compliance rules to update');
    }

    try {
      await facilityService.updateComplianceRules(complianceRules.id, updates);
      // Refresh compliance rules
      if (facilityId) {
        const rules = await facilityService.getComplianceRules(facilityId);
        setComplianceRules(rules);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const checkCompliance = (readings: { [key: string]: number }): { isCompliant: boolean; violations: string[] } => {
    if (!complianceRules) {
      return { isCompliant: true, violations: [] };
    }

    const violations: string[] = [];
    const ranges = complianceRules.poolTestingRanges;

    // Check pH
    if (readings.pH && (readings.pH < ranges.pH.min || readings.pH > ranges.pH.max)) {
      violations.push(`pH ${readings.pH} is outside range ${ranges.pH.min}-${ranges.pH.max}`);
    }

    // Check chlorine
    if (readings.chlorine && (readings.chlorine < ranges.chlorine.min || readings.chlorine > ranges.chlorine.max)) {
      violations.push(
        `Chlorine ${readings.chlorine} ppm is outside range ${ranges.chlorine.min}-${ranges.chlorine.max} ppm`
      );
    }

    // Check alkalinity
    if (
      readings.alkalinity &&
      (readings.alkalinity < ranges.alkalinity.min || readings.alkalinity > ranges.alkalinity.max)
    ) {
      violations.push(
        `Alkalinity ${readings.alkalinity} ppm is outside range ${ranges.alkalinity.min}-${ranges.alkalinity.max} ppm`
      );
    }

    // Check calcium hardness if present
    if (
      ranges.calciumHardness &&
      readings.calciumHardness &&
      (readings.calciumHardness < ranges.calciumHardness.min ||
        readings.calciumHardness > ranges.calciumHardness.max)
    ) {
      violations.push(
        `Calcium Hardness ${readings.calciumHardness} ppm is outside range ${ranges.calciumHardness.min}-${ranges.calciumHardness.max} ppm`
      );
    }

    return {
      isCompliant: violations.length === 0,
      violations,
    };
  };

  const getRecommendations = (readings: { [key: string]: number }): string[] => {
    const recommendations: string[] = [];
    const ranges = complianceRules?.poolTestingRanges || MAHC_STANDARDS;

    // pH recommendations
    if (readings.pH < ranges.pH.min) {
      recommendations.push('pH is too low. Add soda ash or sodium carbonate to increase pH.');
    } else if (readings.pH > ranges.pH.max) {
      recommendations.push('pH is too high. Add muriatic acid or sodium bisulfate to lower pH.');
    }

    // Chlorine recommendations
    if (readings.chlorine < ranges.chlorine.min) {
      recommendations.push('Chlorine is too low. Add chlorine to increase sanitizer levels.');
    } else if (readings.chlorine > ranges.chlorine.max) {
      recommendations.push('Chlorine is too high. Dilute or allow time for chlorine to dissipate.');
    }

    // Alkalinity recommendations
    if (readings.alkalinity < ranges.alkalinity.min) {
      recommendations.push('Alkalinity is too low. Add sodium bicarbonate to increase alkalinity.');
    } else if (readings.alkalinity > ranges.alkalinity.max) {
      recommendations.push('Alkalinity is too high. Add muriatic acid to lower alkalinity.');
    }

    return recommendations;
  };

  return {
    complianceRules,
    loading,
    error,
    createComplianceRules,
    updateComplianceRules,
    checkCompliance,
    getRecommendations,
  };
};
