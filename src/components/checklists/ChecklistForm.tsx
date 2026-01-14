import { useState, FormEvent, useEffect } from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { ChecklistTemplate, ChecklistItem } from '../../types';

interface ChecklistFormProps {
  templates: ChecklistTemplate[];
  onSubmit: (
    name: string,
    description: string,
    items: ChecklistItem[],
    templateId?: string,
    assignedTo?: string,
    dueDate?: Date
  ) => Promise<void>;
  onCancel: () => void;
}

export const ChecklistForm = ({ templates, onSubmit, onCancel }: ChecklistFormProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find((t) => t.id === selectedTemplateId);
      if (template) {
        setName(template.name);
        setDescription(template.description || '');
      }
    }
  }, [selectedTemplateId, templates]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedTemplateId || !name) {
      return;
    }

    const template = templates.find((t) => t.id === selectedTemplateId);
    if (!template) return;

    setLoading(true);

    try {
      // Convert template items to checklist items
      const checklistItems: ChecklistItem[] = template.items.map((item) => ({
        id: item.id,
        text: item.text,
        requiresPhoto: item.requiresPhoto,
        order: item.order,
        isCompleted: false,
        completedAt: undefined,
        completedBy: undefined,
        notes: undefined,
        photoUrl: undefined,
      }));

      await onSubmit(
        name,
        description,
        checklistItems,
        selectedTemplateId,
        undefined, // assignedTo - can be added later
        dueDate ? new Date(dueDate) : undefined
      );
    } catch (error) {
      console.error('Error creating checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const templateOptions = [
    { value: '', label: 'Select a template...' },
    ...templates.map((t) => ({ value: t.id, label: `${t.name} (${t.category})` })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Select
        label="Checklist Template"
        value={selectedTemplateId}
        onChange={(e) => setSelectedTemplateId(e.target.value)}
        options={templateOptions}
        required
      />

      {selectedTemplateId && (
        <>
          <Input
            label="Checklist Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g., Morning Pool Opening - Jan 13"
          />

          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
          />

          <Input
            label="Due Date (Optional)"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          {/* Preview Template Items */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Template Items:</h4>
            <ul className="space-y-2">
              {templates
                .find((t) => t.id === selectedTemplateId)
                ?.items.map((item, index) => (
                  <li key={item.id} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-gray-500">{index + 1}.</span>
                    <span className="flex-1">{item.text}</span>
                    {item.requiresPhoto && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Photo Required
                      </span>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} disabled={!selectedTemplateId}>
          Create Checklist
        </Button>
      </div>
    </form>
  );
};
