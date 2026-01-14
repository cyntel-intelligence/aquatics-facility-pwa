import { useState } from 'react';
import { Wrench, Droplet, Zap, Filter, Thermometer, Plus } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SaltLevelForm } from '../components/logs/SaltLevelForm';
import { SaltCellCleaningForm } from '../components/logs/SaltCellCleaningForm';
import { FilterCleaningForm } from '../components/logs/FilterCleaningForm';
import { TemperatureLogForm } from '../components/logs/TemperatureLogForm';
import { MaintenanceLogCard } from '../components/logs/MaintenanceLogCard';
import { useFacility } from '../contexts/FacilityContext';
import { useLogs } from '../hooks/useLogs';
import {
  SaltLevelLog,
  SaltCellCleaningLog,
  FilterCleaningLog,
  TemperatureLog,
} from '../types';

type TabType = 'salt_level' | 'salt_cell' | 'filter' | 'temperature';

export const Maintenance = () => {
  const { currentFacility } = useFacility();
  const [activeTab, setActiveTab] = useState<TabType>('salt_level');
  const [showForm, setShowForm] = useState(false);

  const {
    logs,
    loading,
    createSaltLevelLog,
    createSaltCellCleaningLog,
    createFilterCleaningLog,
    createTemperatureLog,
  } = useLogs(currentFacility?.id);

  const handleCreateSaltLevelLog = async (data: any) => {
    await createSaltLevelLog(
      data.saltLevel,
      data.targetRange,
      data.actionTaken,
      data.notes
    );
    setShowForm(false);
  };

  const handleCreateSaltCellCleaningLog = async (data: any) => {
    await createSaltCellCleaningLog(
      data.cleaningMethod,
      data.conditionBefore,
      data.conditionAfter,
      data.nextCleaningDue,
      data.notes
    );
    setShowForm(false);
  };

  const handleCreateFilterCleaningLog = async (data: any) => {
    await createFilterCleaningLog(
      data.filterType,
      data.cleaningMethod,
      data.pressureBefore,
      data.pressureAfter,
      data.nextCleaningDue,
      data.notes
    );
    setShowForm(false);
  };

  const handleCreateTemperatureLog = async (data: any) => {
    await createTemperatureLog(
      data.temperature,
      data.location,
      data.targetRange,
      data.actionTaken,
      data.notes
    );
    setShowForm(false);
  };

  if (!currentFacility) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-6">
          <p className="text-warning-800">Please select a facility to view maintenance logs.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'salt_level' as TabType,
      label: 'Salt Level',
      icon: Droplet,
      type: 'salt_level' as const,
    },
    {
      id: 'salt_cell' as TabType,
      label: 'Salt Cell Cleaning',
      icon: Zap,
      type: 'salt_cell_cleaning' as const,
    },
    {
      id: 'filter' as TabType,
      label: 'Filter Cleaning',
      icon: Filter,
      type: 'filter_cleaning' as const,
    },
    {
      id: 'temperature' as TabType,
      label: 'Temperature',
      icon: Thermometer,
      type: 'temperature' as const,
    },
  ];

  const getModalTitle = () => {
    switch (activeTab) {
      case 'salt_level':
        return 'Record Salt Level';
      case 'salt_cell':
        return 'Record Salt Cell Cleaning';
      case 'filter':
        return 'Record Filter Cleaning';
      case 'temperature':
        return 'Record Temperature';
    }
  };

  const getButtonLabel = () => {
    switch (activeTab) {
      case 'salt_level':
        return 'Record Salt Level';
      case 'salt_cell':
        return 'Record Cleaning';
      case 'filter':
        return 'Record Cleaning';
      case 'temperature':
        return 'Record Temperature';
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'salt_level':
        return 'No salt level readings recorded yet.';
      case 'salt_cell':
        return 'No salt cell cleaning logs recorded yet.';
      case 'filter':
        return 'No filter cleaning logs recorded yet.';
      case 'temperature':
        return 'No temperature readings recorded yet.';
    }
  };

  // Filter logs by current tab type
  const currentTab = tabs.find((t) => t.id === activeTab);
  const filteredLogs = logs.filter((log) => log.type === currentTab?.type);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Wrench className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Logs</h1>
        </div>

        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-5 w-5 mr-2" />
          {getButtonLabel()}
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const count = logs.filter((log) => log.type === tab.type).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                    ${
                      isActive
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                  <span
                    className={`
                    ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600'
                    }
                  `}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {loading ? (
          <LoadingSpinner />
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            {currentTab && <currentTab.icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Logs Yet</h3>
            <p className="text-gray-600 mb-6">{getEmptyMessage()}</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-5 w-5 mr-2" />
              {getButtonLabel()}
            </Button>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <MaintenanceLogCard
              key={log.id}
              log={
                log as
                  | (SaltLevelLog & { type: 'salt_level' })
                  | (SaltCellCleaningLog & { type: 'salt_cell_cleaning' })
                  | (FilterCleaningLog & { type: 'filter_cleaning' })
                  | (TemperatureLog & { type: 'temperature' })
              }
            />
          ))
        )}
      </div>

      {/* Create Log Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={getModalTitle()}>
        {activeTab === 'salt_level' && (
          <SaltLevelForm onSubmit={handleCreateSaltLevelLog} onCancel={() => setShowForm(false)} />
        )}
        {activeTab === 'salt_cell' && (
          <SaltCellCleaningForm
            onSubmit={handleCreateSaltCellCleaningLog}
            onCancel={() => setShowForm(false)}
          />
        )}
        {activeTab === 'filter' && (
          <FilterCleaningForm
            onSubmit={handleCreateFilterCleaningLog}
            onCancel={() => setShowForm(false)}
          />
        )}
        {activeTab === 'temperature' && (
          <TemperatureLogForm
            onSubmit={handleCreateTemperatureLog}
            onCancel={() => setShowForm(false)}
          />
        )}
      </Modal>
    </div>
  );
};
