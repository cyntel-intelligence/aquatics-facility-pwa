import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { MaintenanceAlert } from '../../hooks/useMaintenanceAlerts';

interface MaintenanceAlertsProps {
  alerts: MaintenanceAlert[];
}

export const MaintenanceAlerts = ({ alerts }: MaintenanceAlertsProps) => {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Alerts</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="bg-success-100 p-3 rounded-full w-fit mx-auto mb-3">
              <Info className="h-6 w-6 text-success-600" />
            </div>
            <p className="text-gray-600">No maintenance alerts</p>
            <p className="text-sm text-gray-500 mt-1">All systems operating normally</p>
          </div>
        </div>
      </div>
    );
  }

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="h-5 w-5" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5" />;
      case 'low':
        return <Info className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getAlertStyle = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-danger-50 border-danger-200 text-danger-800';
      case 'medium':
        return 'bg-warning-50 border-warning-200 text-warning-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIconColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-danger-600';
      case 'medium':
        return 'text-warning-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Maintenance Alerts</h2>
        <span className="bg-danger-100 text-danger-700 text-sm font-medium px-2.5 py-1 rounded">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-4 rounded-lg border ${getAlertStyle(alert.severity)}`}
          >
            <div className={getIconColor(alert.severity)}>{getIcon(alert.severity)}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium">{alert.title}</h3>
              <p className="text-sm mt-1">{alert.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
