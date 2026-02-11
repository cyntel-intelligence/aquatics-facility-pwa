import { useState } from 'react';
import { format } from 'date-fns';
import {
  AlertTriangle,
  MapPin,
  Clock,
  Users,
  Eye,
  ChevronDown,
  ChevronUp,
  Camera,
  FileText,
  PenTool,
} from 'lucide-react';
import { Button } from '../common/Button';
import { IncidentReport } from '../../types';
import { INCIDENT_TYPES, INCIDENT_SEVERITIES } from '../../utils/constants';

interface IncidentCardProps {
  incident: IncidentReport;
  onReview?: (incident: IncidentReport) => void;
  canReview?: boolean;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
  submitted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Submitted' },
  under_review: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Under Review' },
  closed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Closed' },
};

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  minor: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  moderate: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  serious: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  critical: { bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-300' },
};

export const IncidentCard = ({ incident, onReview, canReview }: IncidentCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const statusStyle = STATUS_STYLES[incident.status] || STATUS_STYLES.draft;
  const severityStyle = SEVERITY_STYLES[incident.severity] || SEVERITY_STYLES.minor;
  const typeLabel = INCIDENT_TYPES.find((t) => t.value === incident.type)?.label || incident.type;
  const severityLabel =
    INCIDENT_SEVERITIES.find((s) => s.value === incident.severity)?.label || incident.severity;

  return (
    <div className={`bg-white rounded-lg shadow border-l-4 ${severityStyle.border}`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className={`h-5 w-5 mt-0.5 ${
                incident.severity === 'critical' || incident.severity === 'serious'
                  ? 'text-red-500'
                  : incident.severity === 'moderate'
                  ? 'text-orange-500'
                  : 'text-yellow-500'
              }`}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900">{incident.incidentNumber}</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                >
                  {statusStyle.label}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityStyle.bg} ${severityStyle.text}`}
                >
                  {severityLabel}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{typeLabel}</p>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {format(incident.occurredAt, 'MMM d, yyyy h:mm a')}
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {incident.location}
          </div>
          {incident.involvedPersons.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {incident.involvedPersons.length} person{incident.involvedPersons.length !== 1 ? 's' : ''}
            </div>
          )}
          {incident.photoUrls.length > 0 && (
            <div className="flex items-center gap-1">
              <Camera className="h-4 w-4" />
              {incident.photoUrls.length} photo{incident.photoUrls.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Description preview */}
        {!expanded && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{incident.description}</p>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{incident.description}</p>
          </div>

          {/* Immediate Actions */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Immediate Actions Taken</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{incident.immediateActions}</p>
          </div>

          {/* Root Cause */}
          {incident.rootCause && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Root Cause</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{incident.rootCause}</p>
            </div>
          )}

          {/* Preventive Measures */}
          {incident.preventiveMeasures && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Preventive Measures</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{incident.preventiveMeasures}</p>
            </div>
          )}

          {/* Involved Persons */}
          {incident.involvedPersons.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Involved Persons</h4>
              <div className="space-y-2">
                {incident.involvedPersons.map((person) => (
                  <div key={person.id} className="bg-gray-50 rounded p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{person.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full capitalize">
                        {person.type}
                      </span>
                      {person.medicalAttention && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                          Medical Attention
                        </span>
                      )}
                    </div>
                    {person.injuries && (
                      <p className="text-gray-600 mt-1">Injuries: {person.injuries}</p>
                    )}
                    {person.medicalDetails && (
                      <p className="text-gray-600 mt-1">Medical: {person.medicalDetails}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Witnesses */}
          {incident.witnesses.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Witnesses</h4>
              <div className="space-y-2">
                {incident.witnesses.map((witness) => (
                  <div key={witness.id} className="bg-gray-50 rounded p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{witness.name}</span>
                      {witness.contactInfo && (
                        <span className="text-gray-500">- {witness.contactInfo}</span>
                      )}
                    </div>
                    {witness.statement && (
                      <p className="text-gray-600 mt-1 italic">"{witness.statement}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos */}
          {incident.photoUrls.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Photos</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {incident.photoUrls.map((url, index) => (
                  <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={url}
                      alt={`Incident photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded border hover:opacity-75 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Signatures */}
          {incident.signatures.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Signatures</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {incident.signatures.map((sig) => (
                  <div key={sig.id} className="bg-gray-50 rounded p-3 border">
                    <div className="flex items-center gap-2 mb-1">
                      <PenTool className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">{sig.signedBy}</span>
                      <span className="text-xs text-gray-500">({sig.role})</span>
                    </div>
                    <img
                      src={sig.signatureDataUrl}
                      alt={`Signature by ${sig.signedBy}`}
                      className="h-12 object-contain"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {format(sig.signedAt, 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up info */}
          {incident.followUpRequired && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Follow-up Required</span>
              </div>
              {incident.followUpNotes && (
                <p className="text-sm text-yellow-700 mt-1">{incident.followUpNotes}</p>
              )}
            </div>
          )}

          {/* Review info */}
          {incident.reviewedBy && (
            <div className="text-xs text-gray-500">
              Reviewed by {incident.reviewedBy}
              {incident.reviewedAt && ` on ${format(incident.reviewedAt, 'MMM d, yyyy h:mm a')}`}
            </div>
          )}

          {/* Reported by */}
          <div className="text-xs text-gray-500 pt-2 border-t">
            Reported by {incident.reportedByName} on{' '}
            {format(incident.reportedAt, 'MMM d, yyyy h:mm a')}
          </div>

          {/* Actions */}
          {canReview && onReview && incident.status !== 'closed' && (
            <div className="pt-3 border-t">
              <Button size="sm" onClick={() => onReview(incident)}>
                {incident.status === 'submitted' ? 'Review Incident' : 'Update Review'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
