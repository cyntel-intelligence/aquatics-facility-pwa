import { useNavigate } from 'react-router-dom';
import {
  TestTube,
  ClipboardCheck,
  AlertTriangle,
  Wrench,
  Zap,
} from 'lucide-react';

const ACTIONS = [
  {
    label: 'Record Pool Test',
    icon: TestTube,
    path: '/pool-testing',
    color: 'text-purple-600',
    bg: 'bg-purple-50 hover:bg-purple-100',
  },
  {
    label: 'Complete Checklist',
    icon: ClipboardCheck,
    path: '/checklists',
    color: 'text-green-600',
    bg: 'bg-green-50 hover:bg-green-100',
  },
  {
    label: 'Report Incident',
    icon: AlertTriangle,
    path: '/incidents',
    color: 'text-red-600',
    bg: 'bg-red-50 hover:bg-red-100',
  },
  {
    label: 'Log Maintenance',
    icon: Wrench,
    path: '/maintenance',
    color: 'text-blue-600',
    bg: 'bg-blue-50 hover:bg-blue-100',
  },
];

export const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${action.bg}`}
            >
              <Icon className={`h-5 w-5 ${action.color}`} />
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
