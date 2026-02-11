import { useState } from 'react';
import { AlertTriangle, Plus, FileText, Send, Eye, CheckCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { IncidentForm } from '../components/incidents/IncidentForm';
import { IncidentCard } from '../components/incidents/IncidentCard';
import { IncidentReview } from '../components/incidents/IncidentReview';
import { useFacility } from '../contexts/FacilityContext';
import { useAuth } from '../contexts/AuthContext';
import { useIncidents } from '../hooks/useIncidents';
import { IncidentReport } from '../types';
import toast from 'react-hot-toast';

type StatusFilter = 'all' | 'draft' | 'submitted' | 'under_review' | 'closed';

const STATUS_TABS: { id: StatusFilter; label: string; icon: typeof FileText }[] = [
  { id: 'all', label: 'All', icon: AlertTriangle },
  { id: 'draft', label: 'Drafts', icon: FileText },
  { id: 'submitted', label: 'Submitted', icon: Send },
  { id: 'under_review', label: 'Under Review', icon: Eye },
  { id: 'closed', label: 'Closed', icon: CheckCircle },
];

export const Incidents = () => {
  const { currentFacility } = useFacility();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const [showForm, setShowForm] = useState(false);
  const [reviewingIncident, setReviewingIncident] = useState<IncidentReport | null>(null);

  const statusFilter = activeTab === 'all' ? undefined : activeTab;
  const {
    incidents,
    loading,
    createIncident,
    updateIncident,
    reviewIncident,
    closeIncident,
  } = useIncidents(currentFacility?.id, statusFilter);

  const canReview = user?.role === 'admin' || user?.role === 'manager';

  const handleCreateIncident = async (
    data: Omit<IncidentReport, 'id' | 'incidentNumber' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      await createIncident(data);
      setShowForm(false);
      toast.success(
        data.status === 'draft'
          ? 'Incident saved as draft'
          : 'Incident report submitted'
      );
    } catch (error) {
      toast.error('Failed to create incident report');
      throw error;
    }
  };

  const handleReview = async (
    incidentId: string,
    reviewedBy: string,
    followUpRequired: boolean,
    followUpNotes?: string
  ) => {
    try {
      await reviewIncident(incidentId, reviewedBy, followUpRequired, followUpNotes);
      setReviewingIncident(null);
      toast.success('Incident marked as under review');
    } catch (error) {
      toast.error('Failed to review incident');
    }
  };

  const handleClose = async (incidentId: string, reviewedBy: string) => {
    try {
      await closeIncident(incidentId, reviewedBy);
      setReviewingIncident(null);
      toast.success('Incident closed');
    } catch (error) {
      toast.error('Failed to close incident');
    }
  };

  const handleUpdateIncident = async (incidentId: string, updates: Partial<IncidentReport>) => {
    try {
      await updateIncident(incidentId, updates);
    } catch (error) {
      toast.error('Failed to update incident');
    }
  };

  if (!currentFacility) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-6">
          <p className="text-warning-800">Please select a facility to view incident reports.</p>
        </div>
      </div>
    );
  }

  // Count incidents by status for badges (when viewing 'all')
  const getStatusCount = (status: string) => {
    if (activeTab !== 'all') return null;
    return incidents.filter((i) => i.status === status).length;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Incident Reports</h1>
        </div>

        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-5 w-5 mr-2" />
          New Incident
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {STATUS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const count =
                tab.id === 'all'
                  ? incidents.length
                  : getStatusCount(tab.id);

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
                  {count !== null && (
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
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Incident list */}
      <div className="space-y-4">
        {loading ? (
          <LoadingSpinner />
        ) : incidents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Incident Reports</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'all'
                ? 'No incidents have been reported yet.'
                : `No ${activeTab.replace('_', ' ')} incidents found.`}
            </p>
            {activeTab === 'all' && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Report an Incident
              </Button>
            )}
          </div>
        ) : (
          incidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              canReview={canReview}
              onReview={setReviewingIncident}
            />
          ))
        )}
      </div>

      {/* Create Incident Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Report New Incident"
        size="xl"
      >
        <IncidentForm
          facilityId={currentFacility.id}
          onSubmit={handleCreateIncident}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Review Incident Modal */}
      <Modal
        isOpen={!!reviewingIncident}
        onClose={() => setReviewingIncident(null)}
        title="Review Incident"
        size="lg"
      >
        {reviewingIncident && (
          <IncidentReview
            incident={reviewingIncident}
            onReview={handleReview}
            onClose={handleClose}
            onUpdateIncident={handleUpdateIncident}
            onCancel={() => setReviewingIncident(null)}
          />
        )}
      </Modal>
    </div>
  );
};
