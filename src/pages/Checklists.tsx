import { useState } from 'react';
import { ClipboardCheck, Plus, FileText, ListChecks, CheckCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ChecklistTemplateForm } from '../components/checklists/ChecklistTemplateForm';
import { ChecklistForm } from '../components/checklists/ChecklistForm';
import { ChecklistCard } from '../components/checklists/ChecklistCard';
import { useFacility } from '../contexts/FacilityContext';
import { useAuth } from '../contexts/AuthContext';
import { useChecklistTemplates, useChecklists } from '../hooks/useChecklists';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

type TabType = 'active' | 'completed' | 'templates';

export const Checklists = () => {
  const { currentFacility } = useFacility();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showChecklistForm, setShowChecklistForm] = useState(false);

  const { templates, loading: templatesLoading, createTemplate } = useChecklistTemplates(
    currentFacility?.id
  );
  const {
    checklists: activeChecklists,
    loading: activeLoading,
    createChecklist,
    updateChecklistItem,
  } = useChecklists(currentFacility?.id, 'in-progress');
  const { checklists: completedChecklists, loading: completedLoading } = useChecklists(
    currentFacility?.id,
    'completed'
  );

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  const handleCreateTemplate = async (
    name: string,
    description: string,
    category: 'daily' | 'weekly' | 'monthly' | 'custom',
    items: any[]
  ) => {
    await createTemplate(name, description, category, items);
    setShowTemplateForm(false);
  };

  const handleCreateChecklist = async (
    name: string,
    description: string,
    items: any[],
    templateId?: string,
    assignedTo?: string,
    dueDate?: Date
  ) => {
    await createChecklist(name, description, items, templateId, assignedTo, dueDate);
    setShowChecklistForm(false);
  };

  if (!currentFacility) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-6">
          <p className="text-warning-800">Please select a facility to view checklists.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'active' as TabType, label: 'Active', icon: ListChecks, count: activeChecklists.length },
    {
      id: 'completed' as TabType,
      label: 'Completed',
      icon: CheckCircle,
      count: completedChecklists.length,
    },
    ...(isAdminOrManager
      ? [{ id: 'templates' as TabType, label: 'Templates', icon: FileText, count: templates.length }]
      : []),
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Checklists</h1>
        </div>

        <div className="flex gap-3">
          {activeTab === 'templates' && isAdminOrManager && (
            <Button onClick={() => setShowTemplateForm(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create Template
            </Button>
          )}
          {(activeTab === 'active' || activeTab === 'completed') && (
            <Button onClick={() => setShowChecklistForm(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create Checklist
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
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
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {activeLoading ? (
            <LoadingSpinner />
          ) : activeChecklists.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <ListChecks className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Checklists</h3>
              <p className="text-gray-600 mb-6">
                Create a checklist from a template to get started.
              </p>
              <Button onClick={() => setShowChecklistForm(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Create Checklist
              </Button>
            </div>
          ) : (
            activeChecklists.map((checklist) => (
              <ChecklistCard
                key={checklist.id}
                checklist={checklist}
                onItemUpdate={updateChecklistItem}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="space-y-6">
          {completedLoading ? (
            <LoadingSpinner />
          ) : completedChecklists.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Checklists</h3>
              <p className="text-gray-600">Completed checklists will appear here.</p>
            </div>
          ) : (
            completedChecklists.map((checklist) => (
              <ChecklistCard
                key={checklist.id}
                checklist={checklist}
                onItemUpdate={updateChecklistItem}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'templates' && isAdminOrManager && (
        <div className="space-y-6">
          {templatesLoading ? (
            <LoadingSpinner />
          ) : templates.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates</h3>
              <p className="text-gray-600 mb-6">
                Create reusable checklist templates for common inspections.
              </p>
              <Button onClick={() => setShowTemplateForm(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Create Template
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-100 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <span className="text-xs text-gray-500 capitalize">{template.category}</span>
                      </div>
                    </div>
                  </div>

                  {template.description && (
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  )}

                  <div className="text-sm text-gray-500 mb-4">
                    {template.items.length} item{template.items.length !== 1 ? 's' : ''}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChecklistForm(true)}
                    className="w-full"
                  >
                    Use Template
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Template Modal */}
      <Modal
        isOpen={showTemplateForm}
        onClose={() => setShowTemplateForm(false)}
        title="Create Checklist Template"
      >
        <ChecklistTemplateForm
          onSubmit={handleCreateTemplate}
          onCancel={() => setShowTemplateForm(false)}
        />
      </Modal>

      {/* Create Checklist Modal */}
      <Modal
        isOpen={showChecklistForm}
        onClose={() => setShowChecklistForm(false)}
        title="Create Checklist"
      >
        <ChecklistForm
          templates={templates}
          onSubmit={handleCreateChecklist}
          onCancel={() => setShowChecklistForm(false)}
        />
      </Modal>
    </div>
  );
};
