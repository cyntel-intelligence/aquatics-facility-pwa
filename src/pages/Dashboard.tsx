import { useState } from 'react';
import {
  LayoutDashboard,
  Settings as SettingsIcon,
  CheckCircle,
  AlertTriangle,
  ClipboardCheck,
  Wrench,
  TestTube,
} from 'lucide-react';
import { useFacility } from '../contexts/FacilityContext';
import { useAuth } from '../contexts/AuthContext';
import { useCompliance } from '../hooks/useCompliance';
import { useLogs, usePoolTestingChart } from '../hooks/useLogs';
import { useIncidents } from '../hooks/useIncidents';
import { useChecklists } from '../hooks/useChecklists';
import { useMaintenanceAlerts } from '../hooks/useMaintenanceAlerts';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useToast } from '../contexts/ToastContext';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ComplianceRulesForm } from '../components/facilities/ComplianceRulesForm';
import { MaintenanceAlerts } from '../components/dashboard/MaintenanceAlerts';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import { ComplianceStatusCard } from '../components/dashboard/ComplianceStatusCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { PoolTestingChart } from '../components/logs/PoolTestingChart';
import { PoolTestingLog, PoolTestingRanges } from '../types';

export const Dashboard = () => {
  const { currentFacility } = useFacility();
  const { user } = useAuth();
  const { complianceRules, loading: complianceLoading, createComplianceRules, updateComplianceRules } =
    useCompliance(currentFacility?.id);
  const { logs, loading: logsLoading } = useLogs(currentFacility?.id);
  const { incidents, loading: incidentsLoading } = useIncidents(currentFacility?.id);
  const { checklists, loading: checklistsLoading } = useChecklists(currentFacility?.id);
  const { chartData, loading: chartLoading } = usePoolTestingChart(currentFacility?.id, 7);
  const alerts = useMaintenanceAlerts(logs);
  const stats = useDashboardStats(logs, incidents, checklists, alerts);
  const toast = useToast();
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);

  const isLoading = logsLoading || incidentsLoading || checklistsLoading;

  const handleComplianceSubmit = async (
    standard: 'MAHC' | 'state' | 'local' | 'custom',
    ranges: PoolTestingRanges
  ) => {
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

  if (!currentFacility) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <LayoutDashboard className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Facility Selected</h3>
          <p className="text-gray-600 mb-4">
            Please select a facility from the dropdown above or create a new one in the Facilities page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">{currentFacility.name}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setIsComplianceModalOpen(true)}>
          <SettingsIcon className="h-4 w-4 mr-2" />
          Compliance Rules
        </Button>
      </div>

      {/* Compliance banner */}
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

      {isLoading ? (
        <LoadingSpinner size="lg" message="Loading dashboard..." />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Compliance */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm">Compliance Rate</p>
                <TestTube className="h-5 w-5 text-gray-400" />
              </div>
              <p
                className={`text-3xl font-bold mt-2 ${
                  stats.complianceRate === null
                    ? 'text-gray-400'
                    : stats.complianceRate >= 90
                    ? 'text-success-600'
                    : stats.complianceRate >= 70
                    ? 'text-warning-600'
                    : 'text-danger-600'
                }`}
              >
                {stats.complianceRate !== null ? `${stats.complianceRate}%` : '—'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.recentPoolTests > 0
                  ? `Based on last ${stats.recentPoolTests} tests`
                  : 'No tests recorded'}
              </p>
            </div>

            {/* Active Incidents */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm">Active Incidents</p>
                <AlertTriangle className="h-5 w-5 text-gray-400" />
              </div>
              <p
                className={`text-3xl font-bold mt-2 ${
                  stats.activeIncidents > 0 ? 'text-warning-600' : 'text-success-600'
                }`}
              >
                {stats.activeIncidents}
              </p>
              <p className="text-xs text-gray-500 mt-1">Submitted or under review</p>
            </div>

            {/* Pending Checklists */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm">Pending Checklists</p>
                <ClipboardCheck className="h-5 w-5 text-gray-400" />
              </div>
              <p
                className={`text-3xl font-bold mt-2 ${
                  stats.pendingChecklists > 0 ? 'text-primary-600' : 'text-success-600'
                }`}
              >
                {stats.pendingChecklists}
              </p>
              <p className="text-xs text-gray-500 mt-1">Awaiting completion</p>
            </div>

            {/* Maintenance Alerts */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm">Maintenance Alerts</p>
                <Wrench className="h-5 w-5 text-gray-400" />
              </div>
              <p
                className={`text-3xl font-bold mt-2 ${
                  stats.maintenanceAlerts > 0 ? 'text-danger-600' : 'text-success-600'
                }`}
              >
                {stats.maintenanceAlerts}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.maintenanceAlerts > 0 ? 'Requires attention' : 'All clear'}
              </p>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left column — Chart + Maintenance Alerts (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pool Chemistry Chart */}
              <PoolTestingChart
                logs={chartData as PoolTestingLog[]}
                loading={chartLoading}
                compact
              />

              {/* Maintenance Alerts */}
              <MaintenanceAlerts alerts={alerts} />
            </div>

            {/* Right column — Quick Actions + Compliance (1/3 width) */}
            <div className="space-y-6">
              <QuickActions />
              <ComplianceStatusCard logs={logs} hasRules={!!complianceRules} />
            </div>
          </div>

          {/* Recent Activity Feed — full width */}
          <div className="mb-8">
            <RecentActivityFeed
              logs={logs}
              incidents={incidents}
              checklists={checklists}
              maxItems={12}
            />
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
        <ComplianceRulesForm
          facilityId={currentFacility.id}
          existingRules={complianceRules}
          onSubmit={handleComplianceSubmit}
          onCancel={() => setIsComplianceModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
