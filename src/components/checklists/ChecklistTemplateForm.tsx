import { useState, FormEvent } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { CHECKLIST_CATEGORIES } from '../../utils/constants';
import { ChecklistTemplateItem } from '../../types';

interface ChecklistTemplateFormProps {
  onSubmit: (
    name: string,
    description: string,
    category: 'daily' | 'weekly' | 'monthly' | 'custom',
    items: Omit<ChecklistTemplateItem, 'id'>[]
  ) => Promise<void>;
  onCancel: () => void;
}

export const ChecklistTemplateForm = ({ onSubmit, onCancel }: ChecklistTemplateFormProps) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [items, setItems] = useState<Omit<ChecklistTemplateItem, 'id'>[]>([
    { text: '', requiresPhoto: false, order: 0 },
  ]);

  const addItem = () => {
    setItems([...items, { text: '', requiresPhoto: false, order: items.length }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof Omit<ChecklistTemplateItem, 'id'>, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || items.length === 0 || items.some((item) => !item.text)) {
      return;
    }

    setLoading(true);

    try {
      // Update order before submitting
      const orderedItems = items.map((item, index) => ({ ...item, order: index }));
      await onSubmit(name, description, category, orderedItems);
    } catch (error) {
      console.error('Error creating template:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Template Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g., Daily Pool Opening"
        />

        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          options={CHECKLIST_CATEGORIES}
          required
        />
      </div>

      <TextArea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Brief description of when to use this checklist..."
        rows={2}
      />

      {/* Checklist Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Checklist Items</h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="flex gap-3 items-start bg-gray-50 p-4 rounded-lg">
            <div className="mt-8 cursor-move">
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex-1 space-y-3">
              <Input
                label={`Item ${index + 1}`}
                value={item.text}
                onChange={(e) => updateItem(index, 'text', e.target.value)}
                placeholder="e.g., Check pool chemistry"
                required
              />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={item.requiresPhoto}
                  onChange={(e) => updateItem(index, 'requiresPhoto', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Requires photo verification
              </label>
            </div>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="mt-8 p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Create Template
        </Button>
      </div>
    </form>
  );
};
