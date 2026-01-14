import { useState } from 'react';
import { format } from 'date-fns';
import { ClipboardCheck, Calendar, User, Camera, CheckCircle, Circle, Image } from 'lucide-react';
import { Checklist, ChecklistItem } from '../../types';
import { Button } from '../common/Button';
import { TextArea } from '../common/TextArea';
import { useAuth } from '../../contexts/AuthContext';
import { storageService } from '../../services/firebase/storage.service';
import { useFacility } from '../../contexts/FacilityContext';

interface ChecklistCardProps {
  checklist: Checklist;
  onItemUpdate: (
    checklistId: string,
    itemId: string,
    isCompleted: boolean,
    completedBy?: string,
    notes?: string,
    photoUrl?: string
  ) => Promise<void>;
}

export const ChecklistCard = ({ checklist, onItemUpdate }: ChecklistCardProps) => {
  const { user } = useAuth();
  const { currentFacility } = useFacility();
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [itemNotes, setItemNotes] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-700 border-success-200';
      case 'in-progress':
        return 'bg-warning-100 text-warning-700 border-warning-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const completedCount = checklist.items.filter((item) => item.isCompleted).length;
  const progressPercentage = (completedCount / checklist.items.length) * 100;

  const handleToggleItem = async (item: ChecklistItem) => {
    const newCompletedStatus = !item.isCompleted;
    const notes = itemNotes[item.id] || item.notes;

    await onItemUpdate(
      checklist.id,
      item.id,
      newCompletedStatus,
      newCompletedStatus ? user?.displayName || user?.email || 'Unknown' : undefined,
      notes,
      item.photoUrl
    );

    if (!newCompletedStatus) {
      setExpandedItemId(null);
    }
  };

  const handlePhotoUpload = async (item: ChecklistItem, file: File) => {
    if (!currentFacility) return;

    setUploading({ ...uploading, [item.id]: true });

    try {
      const photoUrl = await storageService.uploadChecklistPhoto(
        currentFacility.id,
        checklist.id,
        item.id,
        file
      );

      await onItemUpdate(
        checklist.id,
        item.id,
        item.isCompleted,
        item.completedBy,
        itemNotes[item.id] || item.notes,
        photoUrl
      );
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploading({ ...uploading, [item.id]: false });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <ClipboardCheck className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{checklist.name}</h3>
              {checklist.description && (
                <p className="text-sm text-gray-600 mt-1">{checklist.description}</p>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
              checklist.status
            )}`}
          >
            {checklist.status.replace('-', ' ')}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>
              {completedCount} of {checklist.items.length} items completed
            </span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{format(checklist.createdAt, 'PP')}</span>
          </div>
          {checklist.dueDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Due: {format(checklist.dueDate, 'PP')}</span>
            </div>
          )}
          {checklist.completedBy && (
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>Completed by {checklist.completedBy}</span>
            </div>
          )}
        </div>
      </div>

      {/* Checklist Items */}
      <div className="p-6">
        <div className="space-y-3">
          {checklist.items
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <div key={item.id} className="border rounded-lg">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleItem(item)}
                      className={`mt-0.5 flex-shrink-0 ${
                        item.isCompleted ? 'text-success-600' : 'text-gray-400'
                      }`}
                      disabled={checklist.status === 'completed'}
                    >
                      {item.isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Circle className="h-6 w-6" />
                      )}
                    </button>

                    {/* Item Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-gray-900 ${
                          item.isCompleted ? 'line-through text-gray-500' : ''
                        }`}
                      >
                        {item.text}
                      </p>

                      {/* Photo Required Badge */}
                      {item.requiresPhoto && !item.photoUrl && (
                        <span className="inline-flex items-center gap-1 mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          <Camera className="h-3 w-3" />
                          Photo Required
                        </span>
                      )}

                      {/* Photo Preview */}
                      {item.photoUrl && (
                        <div className="mt-2">
                          <img
                            src={item.photoUrl}
                            alt="Checklist item"
                            className="h-32 w-auto rounded-lg border"
                          />
                        </div>
                      )}

                      {/* Completed Info */}
                      {item.completedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Completed by {item.completedBy} on {format(item.completedAt, 'PPp')}
                        </p>
                      )}

                      {/* Notes */}
                      {item.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">{item.notes}</p>
                      )}

                      {/* Expanded Details */}
                      {expandedItemId === item.id && checklist.status !== 'completed' && (
                        <div className="mt-3 space-y-3">
                          <TextArea
                            label="Notes (Optional)"
                            value={itemNotes[item.id] || item.notes || ''}
                            onChange={(e) =>
                              setItemNotes({ ...itemNotes, [item.id]: e.target.value })
                            }
                            placeholder="Add any observations or notes..."
                            rows={2}
                          />

                          {item.requiresPhoto && !item.photoUrl && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Photo
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handlePhotoUpload(item, file);
                                }}
                                disabled={uploading[item.id]}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                              />
                              {uploading[item.id] && (
                                <p className="text-sm text-gray-600 mt-2">Uploading...</p>
                              )}
                            </div>
                          )}

                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setExpandedItemId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleToggleItem(item)}
                              disabled={item.requiresPhoto && !item.photoUrl && !uploading[item.id]}
                            >
                              Mark Complete
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expand Button */}
                    {!item.isCompleted && checklist.status !== 'completed' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setExpandedItemId(expandedItemId === item.id ? null : item.id)
                        }
                      >
                        {expandedItemId === item.id ? 'Close' : 'Details'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
