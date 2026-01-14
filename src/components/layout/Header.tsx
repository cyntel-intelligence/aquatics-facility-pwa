import { Menu, Bell } from 'lucide-react';
import { FacilitySelector } from '../facilities/FacilitySelector';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export const Header = ({ onMenuClick, title }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>

        {/* Desktop facility selector */}
        <div className="hidden lg:block">
          <FacilitySelector />
        </div>

        {/* Mobile title */}
        {title && <h2 className="font-semibold text-gray-900 lg:hidden">{title}</h2>}

        {/* Spacer for mobile */}
        <div className="lg:flex-1" />

        {/* Notifications */}
        <button
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="h-6 w-6 text-gray-700" />
          {/* Notification badge */}
          <span className="absolute top-1 right-1 h-2 w-2 bg-danger-500 rounded-full" />
        </button>
      </div>

      {/* Mobile facility selector */}
      <div className="px-4 pb-3 lg:hidden border-t">
        <div className="pt-3">
          <FacilitySelector />
        </div>
      </div>
    </header>
  );
};
