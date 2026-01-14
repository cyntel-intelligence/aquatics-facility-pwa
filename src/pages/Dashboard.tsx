import { useState } from 'react';
import { LayoutDashboard, Settings as SettingsIcon, CheckCircle } from 'lucide-react';
import { useFacility } from '../contexts/FacilityContext';
import { useCompliance } from '../hooks/useCompliance';
import { useLogs } from '../hooks/useLogs';
import { useMaintenanceAlerts } from '../hooks/useMaintenanceAlerts';
import { useToast } from '../contexts/ToastContext';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { ComplianceRulesForm } from '../components/facilities/ComplianceRulesForm';
import { MaintenanceAlerts } from '../components/dashboard/MaintenanceAlerts';
import { PoolTestingRanges } from '../types';

export const Dashboard = () => {
  const { currentFacility } = useFacility();
  const { complianceRules, loading, createComplianceRules, updateComplianceRules } = useCompliance(
    currentFacility?.id
  );
  const { logs } = useLogs(currentFacility?.id);
  const alerts = useMaintenanceAlerts(logs);
  const toast = useToast();
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);

  const handleComplianceSubmit = async (standard: 'MAHC' | 'state' | 'local' | 'custom', ranges: PoolTestingRanges) => {
    try {
      if (complianceRules) {
        await updateComplianceRules({ standard, poolTestingRanges: ranges });
        toast.success('Compliance rules updated successfully');
      } else {
        await createComplianceRules(standard, ranges);
        toast.success('Compliance rules created successfully');
      }
      setIsComplianceModalOpen(false);
    } catch (error) {
      toast.error('Failed to save compliance rules');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            {currentFacility && (
              <p className="text-gray-600 mt-1">{currentFacility.name}</p>
            )}
          </div>
        </div>
        {currentFacility && (
          <Button variant="outline" onClick={() => setIsComplianceModalOpen(true)}>
            <SettingsIcon className="h-4 w-4 mr-2" />
            Compliance Rules
          </Button>
        )}
      </div>

      {!currentFacility ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Facility Selected</h3>
          <p className="text-gray-600 mb-4">
            Please select a facility from the dropdown above or create a new one in the Facilities page.
          </p>
        </div>
      ) : (
        <>
          {/* Compliance Status */}
          {complianceRules && (
            <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success-600" />
                <p className="text-success-800 font-medium">
                  Compliance rules configured ({complianceRules.standard} Standard)
                </p>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-sm">Compliance Status</p>
              <p className="text-3xl font-bold text-success-600 mt-2">98%</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-sm">Active Incidents</p>
              <p className="text-3xl font-bold text-warning-600 mt-2">2</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-sm">Pending Checklists</p>
              <p className="text-3xl font-bold text-primary-600 mt-2">5</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500 text-sm">Maintenance Alerts</p>
              <p className={`text-3xl font-bold mt-2 ${alerts.length > 0 ? 'text-danger-600' : 'text-success-600'}`}>
                {alerts.length}
              </p>
            </div>
          </div>

          {/* Maintenance Alerts */}
          <div className="mb-8">
            <MaintenanceAlerts alerts={alerts} />
          </div>

          {/* Welcome Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to Aquatics Facility Manager</h2>
            <p className="text-gray-600 mb-4">
              Your comprehensive solution for managing aquatics facilities. Track water chemistry,
              manage incidents, and ensure compliance with ease.
            </p>
            {!complianceRules && (
              <Button onClick={() => setIsComplianceModalOpen(true)}>
                <SettingsIcon className="h-4 w-4 mr-2" />
                Configure Compliance Rules
              </Button>
            )}
          </div>
        </>
      )}

      {/* Compliance Rules Modal */}
      <Modal
        isOpen={isComplianceModalOpen}
        onClose={() => setIsComplianceModalOpen(false)}
        title={complianceRules ? 'Edit Compliance Rules' : 'Configure Compliance Rules'}
        size="lg"
      >
        {currentFacility && (
          <ComplianceRulesForm
            facilityId={currentFacility.id}
            existingRules={complianceRules}
            onSubmit={handleComplianceSubmit}
            onCancel={() => setIsComplianceModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};
