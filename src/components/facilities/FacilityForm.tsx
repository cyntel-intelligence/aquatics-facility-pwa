import { useState, FormEvent } from 'react';
import { Facility } from '../../types';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { FACILITY_TYPES } from '../../utils/constants';

interface FacilityFormProps {
  facility?: Facility;
  onSubmit: (data: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const FacilityForm = ({ facility, onSubmit, onCancel }: FacilityFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: facility?.name || '',
    address: facility?.address || '',
    phone: facility?.phone || '',
    email: facility?.email || '',
    type: facility?.type || 'pool',
    capacity: facility?.capacity || 0,
    timezone: facility?.timezone || 'America/New_York',
    operatingHours: facility?.operatingHours || {
      Monday: { open: '09:00', close: '17:00', isClosed: false },
      Tuesday: { open: '09:00', close: '17:00', isClosed: false },
      Wednesday: { open: '09:00', close: '17:00', isClosed: false },
      Thursday: { open: '09:00', close: '17:00', isClosed: false },
      Friday: { open: '09:00', close: '17:00', isClosed: false },
      Saturday: { open: '10:00', close: '18:00', isClosed: false },
      Sunday: { open: '10:00', close: '18:00', isClosed: false },
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value,
    }));
  };

  const handleHoursChange = (day: string, field: 'open' | 'close' | 'isClosed', value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData as any);
    } catch (error) {
      console.error('Error submitting facility:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Facility Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Main Pool"
        />

        <Select
          label="Facility Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          options={FACILITY_TYPES}
        />

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          placeholder="123 Main St, City, State 12345"
        />

        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          required
          placeholder="(555) 123-4567"
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="facility@example.com"
        />

        <Input
          label="Capacity"
          name="capacity"
          type="number"
          value={formData.capacity}
          onChange={handleChange}
          required
          placeholder="100"
        />
      </div>

      {/* Operating Hours */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Operating Hours</h3>
        <div className="space-y-3">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-3">
              <div className="w-28">
                <label className="text-sm font-medium text-gray-700">{day}</label>
              </div>
              <input
                type="checkbox"
                checked={!formData.operatingHours[day]?.isClosed}
                onChange={(e) => handleHoursChange(day, 'isClosed', !e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-600 w-12">Open</span>
              {!formData.operatingHours[day]?.isClosed && (
                <>
                  <input
                    type="time"
                    value={formData.operatingHours[day]?.open || '09:00'}
                    onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <span className="text-gray-600">to</span>
                  <input
                    type="time"
                    value={formData.operatingHours[day]?.close || '17:00'}
                    onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {facility ? 'Update Facility' : 'Create Facility'}
        </Button>
      </div>
    </form>
  );
};
