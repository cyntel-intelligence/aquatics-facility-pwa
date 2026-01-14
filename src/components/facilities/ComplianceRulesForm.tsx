import { useState, FormEvent, useEffect } from 'react';
import { ComplianceRules, PoolTestingRanges } from '../../types';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { MAHC_STANDARDS } from '../../utils/constants';

interface ComplianceRulesFormProps {
  facilityId: string;
  existingRules?: ComplianceRules | null;
  onSubmit: (standard: 'MAHC' | 'state' | 'local' | 'custom', ranges: PoolTestingRanges) => Promise<void>;
  onCancel: () => void;
}

export const ComplianceRulesForm = ({
  facilityId,
  existingRules,
  onSubmit,
  onCancel,
}: ComplianceRulesFormProps) => {
  const [loading, setLoading] = useState(false);
  const [standard, setStandard] = useState<'MAHC' | 'state' | 'local' | 'custom'>(
    existingRules?.standard || 'MAHC'
  );
  const [ranges, setRanges] = useState<PoolTestingRanges>(
    existingRules?.poolTestingRanges || MAHC_STANDARDS
  );

  useEffect(() => {
    // When standard changes to MAHC, load MAHC defaults
    if (standard === 'MAHC') {
      setRanges(MAHC_STANDARDS);
    }
  }, [standard]);

  const handleRangeChange = (parameter: keyof PoolTestingRanges, field: 'min' | 'max', value: string) => {
    setRanges((prev) => ({
      ...prev,
      [parameter]: {
        ...prev[parameter],
        [field]: parseFloat(value) || 0,
      },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(standard, ranges);
    } catch (error) {
      console.error('Error submitting compliance rules:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Select
        label="Compliance Standard"
        value={standard}
        onChange={(e) => setStandard(e.target.value as any)}
        options={[
          { value: 'MAHC', label: 'MAHC (Model Aquatic Health Code)' },
          { value: 'state', label: 'State Regulations' },
          { value: 'local', label: 'Local Regulations' },
          { value: 'custom', label: 'Custom Standards' },
        ]}
        required
      />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Pool Testing Ranges</h3>

        {/* pH */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="pH Min"
            type="number"
            step="0.1"
            value={ranges.pH.min}
            onChange={(e) => handleRangeChange('pH', 'min', e.target.value)}
            required
          />
          <Input
            label="pH Max"
            type="number"
            step="0.1"
            value={ranges.pH.max}
            onChange={(e) => handleRangeChange('pH', 'max', e.target.value)}
            required
          />
        </div>

        {/* Chlorine */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Chlorine Min (ppm)"
            type="number"
            step="0.1"
            value={ranges.chlorine.min}
            onChange={(e) => handleRangeChange('chlorine', 'min', e.target.value)}
            required
          />
          <Input
            label="Chlorine Max (ppm)"
            type="number"
            step="0.1"
            value={ranges.chlorine.max}
            onChange={(e) => handleRangeChange('chlorine', 'max', e.target.value)}
            required
          />
        </div>

        {/* Alkalinity */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Alkalinity Min (ppm)"
            type="number"
            step="1"
            value={ranges.alkalinity.min}
            onChange={(e) => handleRangeChange('alkalinity', 'min', e.target.value)}
            required
          />
          <Input
            label="Alkalinity Max (ppm)"
            type="number"
            step="1"
            value={ranges.alkalinity.max}
            onChange={(e) => handleRangeChange('alkalinity', 'max', e.target.value)}
            required
          />
        </div>

        {/* Calcium Hardness (Optional) */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Calcium Hardness Min (ppm) - Optional"
            type="number"
            step="1"
            value={ranges.calciumHardness?.min || 200}
            onChange={(e) => handleRangeChange('calciumHardness', 'min', e.target.value)}
          />
          <Input
            label="Calcium Hardness Max (ppm)"
            type="number"
            step="1"
            value={ranges.calciumHardness?.max || 400}
            onChange={(e) => handleRangeChange('calciumHardness', 'max', e.target.value)}
          />
        </div>

        {/* Cyanuric Acid (Optional) */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Cyanuric Acid Min (ppm) - Optional"
            type="number"
            step="1"
            value={ranges.cyanuricAcid?.min || 30}
            onChange={(e) => handleRangeChange('cyanuricAcid', 'min', e.target.value)}
          />
          <Input
            label="Cyanuric Acid Max (ppm)"
            type="number"
            step="1"
            value={ranges.cyanuricAcid?.max || 50}
            onChange={(e) => handleRangeChange('cyanuricAcid', 'max', e.target.value)}
          />
        </div>

        {/* Temperature (Optional) */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Temperature Min (°F) - Optional"
            type="number"
            step="1"
            value={ranges.temperature?.min || 78}
            onChange={(e) => handleRangeChange('temperature', 'min', e.target.value)}
          />
          <Input
            label="Temperature Max (°F)"
            type="number"
            step="1"
            value={ranges.temperature?.max || 84}
            onChange={(e) => handleRangeChange('temperature', 'max', e.target.value)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {existingRules ? 'Update Compliance Rules' : 'Set Compliance Rules'}
        </Button>
      </div>
    </form>
  );
};
