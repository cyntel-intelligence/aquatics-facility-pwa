import { ChevronDown, Building2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useFacility } from '../../contexts/FacilityContext';

export const FacilitySelector = () => {
  const { facilities, currentFacility, setCurrentFacility } = useFacility();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (facilities.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Building2 className="h-4 w-4 text-gray-600" />
        <span className="font-medium text-gray-900">
          {currentFacility?.name || 'Select Facility'}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {facilities.map((facility) => (
            <button
              key={facility.id}
              onClick={() => {
                setCurrentFacility(facility);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                currentFacility?.id === facility.id ? 'bg-primary-50' : ''
              }`}
            >
              <div className="font-medium text-gray-900">{facility.name}</div>
              <div className="text-sm text-gray-500">{facility.type}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
