import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '../common/Button';
import { TextArea } from '../common/TextArea';
import { SignatureCapture } from './SignatureCapture';
import { useAuth } from '../../contexts/AuthContext';
import { IncidentReport, Signature } from '../../types';
import { INCIDENT_TYPES, INCIDENT_SEVERITIES } from '../../utils/constants';

interface IncidentReviewProps {
  incident: IncidentReport;
  onReview: (
    incidentId: string,
    reviewedBy: string,
    followUpRequired: boolean,
    followUpNotes?: string
  ) => Promise<void>;
  onClose: (incidentId: string, reviewedBy: string) => Promise<void>;
  onUpdateIncident: (incidentId: string, updates: Partial<IncidentReport>) => Promise<void>;
  onCancel: () => void;
}

export const IncidentReview = ({
  incident,
  onReview,
  onClose,
  onUpdateIncident,
  onCancel,
}: IncidentReviewProps) => {
  const { user } = useAuth();
  const [followUpRequired, setFollowUpRequired] = useState(incident.followUpRequired);
  const [followUpNotes, setFollowUpNotes] = useState(incident.followUpNotes || '');
  const [reviewerSignature, setReviewerSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<'review' | 'close' | null>(null);

  const typeLabel = INCIDENT_TYPES.find((t) => t.value === incident.type)?.label || incident.type;
  const severityLabel =
    INCIDENT_SEVERITIES.find((s) => s.value === incident.severity)?.label || incident.severity;

  const handleReview = async () => {
    if (!user) return;
    setAction('review');
    setSubmitting(true);
    try {
      // Add reviewer signature if provided
      if (reviewerSignature) {
        const newSig: Signature = {
          id: `sig-reviewer-${Date.now()}`,
          signedBy: user.displayName || user.email || 'Unknown',
          role: 'Reviewer',
          signatureDataUrl: reviewerSignature,
          signedAt: new Date(),
        };
        await onUpdateIncident(incident.id, {
          signatures: [...incident.signatures, newSig],
        });
      }

      await onReview(
        incident.id,
        user.displayName || user.email || 'Unknown',
        followUpRequired,
        followUpNotes.trim() || undefined
      );
    } catch (error) {
      console.error('Error reviewing incident:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    if (!user) return;
    setAction('close');
    setSubmitting(true);
    try {
      if (reviewerSignature) {
        const newSig: Signature = {
          id: `sig-closer-${Date.now()}`,
          signedBy: user.displayName || user.email || 'Unknown',
          role: 'Closing Reviewer',
          signatureDataUrl: reviewerSignature,
          signedAt: new Date(),
        };
        await onUpdateIncident(incident.id, {
          signatures: [...incident.signatures, newSig],
        });
      }

      await onClose(incident.id, user.displayName || user.email || 'Unknown');
    } catch (error) {
      console.error('Error closing incident:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Incident summary */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <h3 className="font-medium text-gray-900 mb-3">
          {incident.incidentNumber} - Review
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>{' '}
            <span className="font-medium">{typeLabel}</span>
          </div>
          <div>
            <span className="text-gray-500">Severity:</span>{' '}
            <span className="font-medium">{severityLabel}</span>
          </div>
          <div>
            <span className="text-gray-500">Location:</span>{' '}
            <span className="font-medium">{incident.location}</span>
          </div>
          <div>
            <span className="text-gray-500">Occurred:</span>{' '}
            <span className="font-medium">
              {format(incident.occurredAt, 'MMM d, yyyy h:mm a')}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Reported By:</span>{' '}
            <span className="font-medium">{incident.reportedByName}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
        <p className="text-sm text-gray-600 bg-white border rounded p-3 whitespace-pre-wrap">
          {incident.description}
        </p>
      </div>

      {/* Immediate Actions */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-1">Immediate Actions Taken</h4>
        <p className="text-sm text-gray-600 bg-white border rounded p-3 whitespace-pre-wrap">
          {incident.immediateActions}
        </p>
      </div>

      {/* Follow-up */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={followUpRequired}
            onChange={(e) => setFollowUpRequired(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700">Follow-up required</span>
        </label>

        {followUpRequired && (
          <TextArea
            label="Follow-up Notes"
            value={followUpNotes}
            onChange={(e) => setFollowUpNotes(e.target.value)}
            placeholder="Describe required follow-up actions..."
            rows={3}
          />
        )}
      </div>

      {/* Reviewer Signature */}
      <SignatureCapture
        label="Reviewer Signature"
        onCapture={setReviewerSignature}
      />

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <div className="flex items-center gap-3">
          {incident.status === 'submitted' && (
            <Button
              onClick={handleReview}
              loading={submitting && action === 'review'}
              disabled={submitting}
            >
              Mark Under Review
            </Button>
          )}
          {(incident.status === 'submitted' || incident.status === 'under_review') && (
            <Button
              variant="success"
              onClick={handleClose}
              loading={submitting && action === 'close'}
              disabled={submitting}
            >
              Close Incident
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
