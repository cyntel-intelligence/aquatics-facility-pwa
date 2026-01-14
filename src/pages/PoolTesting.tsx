import { useState } from 'react';
import { TestTube, Plus, TrendingUp } from 'lucide-react';
import { useFacility } from '../contexts/FacilityContext';
import { useLogs, usePoolTestingChart } from '../hooks/useLogs';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { PoolTestingForm } from '../components/logs/PoolTestingForm';
import { PoolTestingLogCard } from '../components/logs/PoolTestingLogCard';
import { PoolTestingChart } from '../components/logs/PoolTestingChart';
import { PoolTestingLog, ChemicalAddition } from '../types';

export const PoolTesting = () => {
  const { currentFacility } = useFacility();
  const { user } = useAuth();
  const { logs, loading, createPoolTestingLog } = useLogs(currentFacility?.id, 'pool_testing', 30);
  const { chartData, loading: chartLoading } = usePoolTestingChart(currentFacility?.id, 7);
  const toast = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showChart, setShowChart] = useState(true);

  const handleSubmit = async (
    readings: any,
    isCompliant: boolean,
    recommendations: string[],
    chemicalsAdded: ChemicalAddition[],
    notes: string
  ) => {
    if (!user || !currentFacility) return;

    try {
      await createPoolTestingLog(
        user.uid,
        user.displayName || user.email || 'Unknown',
        readings,
        isCompliant,
        recommendations,
        chemicalsAdded,
        notes
      );

      toast.success(
        isCompliant
          ? 'Pool test recorded - All readings compliant ✓'
          : 'Pool test recorded - Action required ⚠'
      );
      setIsFormOpen(false);
    } catch (error) {
      toast.error('Failed to save pool test');
    }
  };

  if (!currentFacility) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <TestTube className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Facility Selected</h3>
          <p className="text-gray-600">
            Please select a facility from the dropdown to start recording pool tests.
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
          <TestTube className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pool Testing</h1>
            <p className="text-gray-600 mt-1">{currentFacility.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowChart(!showChart)}>
            <TrendingUp className="h-4 w-4 mr-2" />
            {showChart ? 'Hide' : 'Show'} Chart
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Test
          </Button>
        </div>
      </div>

      {/* Chart */}
      {showChart && (
        <div className="mb-6">
          <PoolTestingChart logs={chartData as PoolTestingLog[]} loading={chartLoading} />
        </div>
      )}

      {/* Logs List */}
      {loading ? (
        <LoadingSpinner size="lg" message="Loading pool tests..." />
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <TestTube className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pool tests recorded yet</h3>
          <p className="text-gray-600 mb-4">
            Start tracking water chemistry by recording your first pool test.
          </p>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record First Test
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Tests ({logs.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing the last 30 pool water tests
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {logs.map((log) => (
              <PoolTestingLogCard key={log.id} log={log as PoolTestingLog} />
            ))}
          </div>
        </>
      )}

      {/* Record Test Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Record Pool Water Test"
        size="xl"
      >
        <PoolTestingForm
          facilityId={currentFacility.id}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
};
