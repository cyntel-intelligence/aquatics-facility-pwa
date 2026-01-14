import { useState } from 'react';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';
import { useFacilities } from '../hooks/useFacilities';
import { useToast } from '../contexts/ToastContext';
import { Facility } from '../types';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { FacilityForm } from '../components/facilities/FacilityForm';

export const Facilities = () => {
  const { facilities, loading, createFacility, updateFacility, deleteFacility } = useFacilities();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | undefined>(undefined);

  const handleCreate = () => {
    setEditingFacility(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility);
    setIsModalOpen(true);
  };

  const handleDelete = async (facilityId: string, facilityName: string) => {
    if (!confirm(`Are you sure you want to delete "${facilityName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteFacility(facilityId);
      toast.success('Facility deleted successfully');
    } catch (error) {
      toast.error('Failed to delete facility');
    }
  };

  const handleSubmit = async (data: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingFacility) {
        await updateFacility(editingFacility.id, data);
        toast.success('Facility updated successfully');
      } else {
        await createFacility(data);
        toast.success('Facility created successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(editingFacility ? 'Failed to update facility' : 'Failed to create facility');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <LoadingSpinner size="lg" message="Loading facilities..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Facility Management</h1>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Facility
        </Button>
      </div>

      {facilities.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No facilities yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first facility.</p>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Facility
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => (
            <div key={facility.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 p-2 rounded-lg">
                      <Building2 className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{facility.name}</h3>
                      <span className="text-sm text-gray-500 capitalize">{facility.type}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">{facility.address}</p>
                  <p className="text-sm text-gray-600">{facility.phone}</p>
                  <p className="text-sm text-gray-600">{facility.email}</p>
                  <p className="text-sm text-gray-600">Capacity: {facility.capacity}</p>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(facility)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(facility.id, facility.name)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFacility ? 'Edit Facility' : 'Create New Facility'}
        size="lg"
      >
        <FacilityForm
          facility={editingFacility}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
