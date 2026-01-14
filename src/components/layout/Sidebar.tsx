import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  TestTube,
  Wrench,
  AlertTriangle,
  BarChart3,
  Users,
  Building2,
  Settings,
  LogOut,
  Waves,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/checklists', icon: ClipboardCheck, label: 'Checklists' },
    { to: '/pool-testing', icon: TestTube, label: 'Pool Testing' },
    { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
    { to: '/incidents', icon: AlertTriangle, label: 'Incidents' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
  ];

  const adminItems = [
    { to: '/admin/staff', icon: Users, label: 'Staff' },
    { to: '/admin/facilities', icon: Building2, label: 'Facilities' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b">
            <div className="bg-primary-100 p-2 rounded-lg">
              <Waves className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">Aquatics FM</h1>
              <p className="text-xs text-gray-500">Facility Manager</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}

            {/* Admin Section */}
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <>
                <div className="pt-4 pb-2 px-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Administration
                  </p>
                </div>
                {adminItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </>
            )}

            <div className="pt-4">
              <NavLink
                to="/settings"
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Settings className="h-5 w-5" />
                <span className="font-medium">Settings</span>
              </NavLink>
            </div>
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3 px-4 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
