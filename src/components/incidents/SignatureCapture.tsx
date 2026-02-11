import { useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '../common/Button';
import { RotateCcw } from 'lucide-react';

interface SignatureCaptureProps {
  label: string;
  onCapture: (dataUrl: string) => void;
  existingSignature?: string;
}

export const SignatureCapture = ({ label, onCapture, existingSignature }: SignatureCaptureProps) => {
  const sigRef = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (existingSignature && sigRef.current) {
      sigRef.current.fromDataURL(existingSignature);
    }
  }, [existingSignature]);

  const handleClear = () => {
    sigRef.current?.clear();
    onCapture('');
  };

  const handleEnd = () => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL('image/png');
      onCapture(dataUrl);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        ref={containerRef}
        className="border-2 border-dashed border-gray-300 rounded-lg bg-white relative"
      >
        <SignatureCanvas
          ref={sigRef}
          penColor="black"
          canvasProps={{
            className: 'w-full rounded-lg',
            style: { height: '150px', width: '100%' },
          }}
          onEnd={handleEnd}
        />
        {existingSignature && (
          <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none flex items-center justify-center">
            {/* Shows existing signature via fromDataURL */}
          </div>
        )}
      </div>
      <div className="flex justify-end mt-2">
        <Button variant="outline" size="sm" type="button" onClick={handleClear}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>
    </div>
  );
};
