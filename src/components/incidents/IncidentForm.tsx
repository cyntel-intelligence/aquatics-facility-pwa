import { useState, useCallback } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Upload,
  Camera,
  Check,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { Select } from '../common/Select';
import { SignatureCapture } from './SignatureCapture';
import { useAuth } from '../../contexts/AuthContext';
import { storageService } from '../../services/firebase/storage.service';
import {
  IncidentReport,
  IncidentType,
  IncidentSeverity,
  InvolvedPerson,
  Witness,
  Signature,
} from '../../types';
import { INCIDENT_TYPES, INCIDENT_SEVERITIES } from '../../utils/constants';

interface IncidentFormProps {
  facilityId: string;
  onSubmit: (data: Omit<IncidentReport, 'id' | 'incidentNumber' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<IncidentReport>;
}

const STEPS = [
  'Basic Information',
  'People Involved',
  'Description & Actions',
  'Photos & Documents',
  'Signatures & Submit',
];

let personIdCounter = 0;
function nextPersonId() {
  return `person-${++personIdCounter}`;
}

let witnessIdCounter = 0;
function nextWitnessId() {
  return `witness-${++witnessIdCounter}`;
}

export const IncidentForm = ({ facilityId, onSubmit, onCancel, initialData }: IncidentFormProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Step 1: Basic info
  const [incidentType, setIncidentType] = useState<IncidentType>(
    initialData?.type || 'injury'
  );
  const [severity, setSeverity] = useState<IncidentSeverity>(
    initialData?.severity || 'minor'
  );
  const [occurredAt, setOccurredAt] = useState(
    initialData?.occurredAt
      ? formatDateTimeLocal(initialData.occurredAt)
      : formatDateTimeLocal(new Date())
  );
  const [location, setLocation] = useState(initialData?.location || '');

  // Step 2: People involved
  const [involvedPersons, setInvolvedPersons] = useState<InvolvedPerson[]>(
    initialData?.involvedPersons || []
  );
  const [witnesses, setWitnesses] = useState<Witness[]>(
    initialData?.witnesses || []
  );

  // Step 3: Description
  const [description, setDescription] = useState(initialData?.description || '');
  const [immediateActions, setImmediateActions] = useState(initialData?.immediateActions || '');
  const [rootCause, setRootCause] = useState(initialData?.rootCause || '');
  const [preventiveMeasures, setPreventiveMeasures] = useState(initialData?.preventiveMeasures || '');

  // Step 4: Photos
  const [photoUrls, setPhotoUrls] = useState<string[]>(initialData?.photoUrls || []);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  // Step 5: Signatures
  const [signatures, setSignatures] = useState<Signature[]>(initialData?.signatures || []);
  const [reporterSignature, setReporterSignature] = useState('');
  const [saveAsDraft, setSaveAsDraft] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  function formatDateTimeLocal(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  // --- Involved Persons ---
  const addInvolvedPerson = () => {
    setInvolvedPersons((prev) => [
      ...prev,
      {
        id: nextPersonId(),
        name: '',
        type: 'patron',
        medicalAttention: false,
      },
    ]);
  };

  const updateInvolvedPerson = (id: string, updates: Partial<InvolvedPerson>) => {
    setInvolvedPersons((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const removeInvolvedPerson = (id: string) => {
    setInvolvedPersons((prev) => prev.filter((p) => p.id !== id));
  };

  // --- Witnesses ---
  const addWitness = () => {
    setWitnesses((prev) => [
      ...prev,
      {
        id: nextWitnessId(),
        name: '',
        contactInfo: '',
        statement: '',
      },
    ]);
  };

  const updateWitness = (id: string, updates: Partial<Witness>) => {
    setWitnesses((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
  };

  const removeWitness = (id: string) => {
    setWitnesses((prev) => prev.filter((w) => w.id !== id));
  };

  // --- Photos ---
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPendingFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  }, []);

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeUploadedPhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Validation ---
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!location.trim()) newErrors.location = 'Location is required';
        if (!occurredAt) newErrors.occurredAt = 'Date/time is required';
        break;
      case 1:
        // Involved persons are optional but names required if added
        involvedPersons.forEach((p, i) => {
          if (!p.name.trim()) newErrors[`person_${i}_name`] = 'Name is required';
        });
        witnesses.forEach((w, i) => {
          if (!w.name.trim()) newErrors[`witness_${i}_name`] = 'Name is required';
        });
        break;
      case 2:
        if (!description.trim()) newErrors.description = 'Description is required';
        if (!immediateActions.trim()) newErrors.immediateActions = 'Immediate actions taken is required';
        break;
      case 3:
        // Photos are optional
        break;
      case 4:
        if (!saveAsDraft && !reporterSignature) {
          newErrors.signature = 'Signature is required to submit';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!user) return;

    const isDraft = saveAsDraft;
    if (!isDraft && !validateStep(currentStep)) return;

    setSubmitting(true);
    try {
      // Upload pending photos
      let allPhotoUrls = [...photoUrls];
      if (pendingFiles.length > 0) {
        setUploadingPhotos(true);
        for (const file of pendingFiles) {
          const url = await storageService.uploadIncidentPhoto(facilityId, 'new', file);
          allPhotoUrls.push(url);
        }
        setUploadingPhotos(false);
      }

      // Build signatures array
      const allSignatures: Signature[] = [...signatures];
      if (reporterSignature) {
        allSignatures.push({
          id: `sig-reporter-${Date.now()}`,
          signedBy: user.displayName || user.email || 'Unknown',
          role: 'Reporter',
          signatureDataUrl: reporterSignature,
          signedAt: new Date(),
        });
      }

      const incidentData: Omit<IncidentReport, 'id' | 'incidentNumber' | 'createdAt' | 'updatedAt'> = {
        facilityId,
        type: incidentType,
        severity,
        occurredAt: new Date(occurredAt),
        location: location.trim(),
        reportedBy: user.uid,
        reportedByName: user.displayName || user.email || 'Unknown',
        reportedAt: new Date(),
        involvedPersons,
        witnesses,
        description: description.trim(),
        immediateActions: immediateActions.trim(),
        rootCause: rootCause.trim() || undefined,
        preventiveMeasures: preventiveMeasures.trim() || undefined,
        photoUrls: allPhotoUrls,
        documentUrls: [],
        signatures: allSignatures,
        status: isDraft ? 'draft' : 'submitted',
        followUpRequired: severity === 'serious' || severity === 'critical',
      };

      await onSubmit(incidentData);
    } catch (error) {
      console.error('Error submitting incident:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Step Renderers ---
  const renderStep0 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Incident Type"
          required
          value={incidentType}
          onChange={(e) => setIncidentType(e.target.value as IncidentType)}
          options={[
            { value: '', label: 'Select type...' },
            ...INCIDENT_TYPES,
          ]}
        />
        <Select
          label="Severity"
          required
          value={severity}
          onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
          options={[
            { value: '', label: 'Select severity...' },
            ...INCIDENT_SEVERITIES.map((s) => ({ value: s.value, label: s.label })),
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date & Time of Incident"
          type="datetime-local"
          required
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          error={errors.occurredAt}
        />
        <Input
          label="Location"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Main Pool - Deep End"
          error={errors.location}
        />
      </div>

      {/* Severity indicator */}
      {severity && (
        <div
          className={`p-3 rounded-lg border ${
            severity === 'critical'
              ? 'bg-red-50 border-red-200 text-red-800'
              : severity === 'serious'
              ? 'bg-red-50 border-red-200 text-red-700'
              : severity === 'moderate'
              ? 'bg-orange-50 border-orange-200 text-orange-700'
              : 'bg-yellow-50 border-yellow-200 text-yellow-700'
          }`}
        >
          <p className="text-sm font-medium">
            {severity === 'critical' && 'Critical: Requires immediate supervisor notification and may require emergency services.'}
            {severity === 'serious' && 'Serious: Requires manager review and follow-up action.'}
            {severity === 'moderate' && 'Moderate: Should be reviewed within 24 hours.'}
            {severity === 'minor' && 'Minor: Standard documentation and review process.'}
          </p>
        </div>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Involved Persons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">Involved Persons</h3>
          <Button variant="outline" size="sm" type="button" onClick={addInvolvedPerson}>
            <Plus className="h-4 w-4 mr-1" />
            Add Person
          </Button>
        </div>

        {involvedPersons.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No persons added yet. Click "Add Person" to add involved individuals.</p>
        ) : (
          <div className="space-y-4">
            {involvedPersons.map((person, index) => (
              <div key={person.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700">Person {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeInvolvedPerson(person.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Name"
                    required
                    value={person.name}
                    onChange={(e) => updateInvolvedPerson(person.id, { name: e.target.value })}
                    error={errors[`person_${index}_name`]}
                  />
                  <Select
                    label="Type"
                    value={person.type}
                    onChange={(e) =>
                      updateInvolvedPerson(person.id, {
                        type: e.target.value as InvolvedPerson['type'],
                      })
                    }
                    options={[
                      { value: 'patron', label: 'Patron' },
                      { value: 'staff', label: 'Staff' },
                      { value: 'visitor', label: 'Visitor' },
                      { value: 'contractor', label: 'Contractor' },
                    ]}
                  />
                  <Input
                    label="Age"
                    type="number"
                    value={person.age?.toString() || ''}
                    onChange={(e) =>
                      updateInvolvedPerson(person.id, {
                        age: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                  <Input
                    label="Contact Info"
                    value={person.contactInfo || ''}
                    onChange={(e) => updateInvolvedPerson(person.id, { contactInfo: e.target.value })}
                    placeholder="Phone or email"
                  />
                </div>

                <div className="mt-3">
                  <TextArea
                    label="Injuries"
                    value={person.injuries || ''}
                    onChange={(e) => updateInvolvedPerson(person.id, { injuries: e.target.value })}
                    placeholder="Describe any injuries..."
                    rows={2}
                  />
                </div>

                <div className="mt-3 flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={person.medicalAttention}
                      onChange={(e) =>
                        updateInvolvedPerson(person.id, { medicalAttention: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Medical Attention Required</span>
                  </label>
                </div>

                {person.medicalAttention && (
                  <div className="mt-3">
                    <TextArea
                      label="Medical Details"
                      value={person.medicalDetails || ''}
                      onChange={(e) =>
                        updateInvolvedPerson(person.id, { medicalDetails: e.target.value })
                      }
                      placeholder="EMS called, transported to hospital, first aid given, etc."
                      rows={2}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Witnesses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">Witnesses</h3>
          <Button variant="outline" size="sm" type="button" onClick={addWitness}>
            <Plus className="h-4 w-4 mr-1" />
            Add Witness
          </Button>
        </div>

        {witnesses.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No witnesses added yet.</p>
        ) : (
          <div className="space-y-4">
            {witnesses.map((witness, index) => (
              <div key={witness.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700">Witness {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeWitness(witness.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Name"
                    required
                    value={witness.name}
                    onChange={(e) => updateWitness(witness.id, { name: e.target.value })}
                    error={errors[`witness_${index}_name`]}
                  />
                  <Input
                    label="Contact Info"
                    value={witness.contactInfo}
                    onChange={(e) => updateWitness(witness.id, { contactInfo: e.target.value })}
                    placeholder="Phone or email"
                  />
                </div>

                <div className="mt-3">
                  <TextArea
                    label="Statement"
                    value={witness.statement || ''}
                    onChange={(e) => updateWitness(witness.id, { statement: e.target.value })}
                    placeholder="Witness statement..."
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <TextArea
        label="Description of Incident"
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Provide a detailed description of what happened..."
        rows={5}
        error={errors.description}
      />
      <TextArea
        label="Immediate Actions Taken"
        required
        value={immediateActions}
        onChange={(e) => setImmediateActions(e.target.value)}
        placeholder="What actions were taken immediately after the incident?"
        rows={4}
        error={errors.immediateActions}
      />
      <TextArea
        label="Root Cause (if known)"
        value={rootCause}
        onChange={(e) => setRootCause(e.target.value)}
        placeholder="What was the underlying cause of the incident?"
        rows={3}
      />
      <TextArea
        label="Preventive Measures"
        value={preventiveMeasures}
        onChange={(e) => setPreventiveMeasures(e.target.value)}
        placeholder="What steps can be taken to prevent this from happening again?"
        rows={3}
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Photos / Documents
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Camera className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-3">
            Take a photo or select files to upload
          </p>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors">
            <Upload className="h-4 w-4" />
            Choose Files
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Pending files */}
      {pendingFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Files to Upload ({pendingFiles.length})</h4>
          <div className="space-y-2">
            {pendingFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removePendingFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Already uploaded photos */}
      {photoUrls.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Photos ({photoUrls.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photoUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Incident photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeUploadedPhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <h3 className="font-medium text-gray-900 mb-3">Incident Summary</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>{' '}
            <span className="font-medium">
              {INCIDENT_TYPES.find((t) => t.value === incidentType)?.label}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Severity:</span>{' '}
            <span className="font-medium">
              {INCIDENT_SEVERITIES.find((s) => s.value === severity)?.label}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Location:</span>{' '}
            <span className="font-medium">{location}</span>
          </div>
          <div>
            <span className="text-gray-500">Persons:</span>{' '}
            <span className="font-medium">{involvedPersons.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Witnesses:</span>{' '}
            <span className="font-medium">{witnesses.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Photos:</span>{' '}
            <span className="font-medium">{photoUrls.length + pendingFiles.length}</span>
          </div>
        </div>
      </div>

      {/* Reporter Signature */}
      <SignatureCapture
        label="Reporter Signature *"
        onCapture={setReporterSignature}
        existingSignature={reporterSignature}
      />
      {errors.signature && (
        <p className="text-sm text-danger-500">{errors.signature}</p>
      )}

      {/* Submit options */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={saveAsDraft}
            onChange={(e) => setSaveAsDraft(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Save as draft (complete later)</span>
        </label>
      </div>
    </div>
  );

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4];

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${
                  index < currentStep
                    ? 'bg-success-500 text-white'
                    : index === currentStep
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }
              `}
            >
              {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span
              className={`hidden md:block ml-2 text-xs ${
                index === currentStep ? 'text-primary-600 font-medium' : 'text-gray-500'
              }`}
            >
              {step}
            </span>
            {index < STEPS.length - 1 && (
              <div
                className={`w-8 md:w-12 h-0.5 mx-2 ${
                  index < currentStep ? 'bg-success-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step title (mobile) */}
      <h3 className="text-lg font-medium text-gray-900 md:hidden">{STEPS[currentStep]}</h3>

      {/* Step content */}
      <div className="min-h-[300px]">{stepRenderers[currentStep]()}</div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          {currentStep > 0 && (
            <Button variant="outline" type="button" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              loading={submitting}
              variant={saveAsDraft ? 'secondary' : 'primary'}
            >
              {uploadingPhotos
                ? 'Uploading Photos...'
                : saveAsDraft
                ? 'Save Draft'
                : 'Submit Report'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
