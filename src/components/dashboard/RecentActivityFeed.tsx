import { format, formatDistanceToNow } from 'date-fns';
import {
  TestTube,
  Wrench,
  ClipboardCheck,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import { Log, PoolTestingLog, IncidentReport, Checklist } from '../../types';

interface ActivityItem {
  id: string;
  type: 'pool_test' | 'maintenance' | 'checklist' | 'incident';
  title: string;
  description: string;
  timestamp: Date;
  userName: string;
  status?: string;
}

interface RecentActivityFeedProps {
  logs: Log[];
  incidents: IncidentReport[];
  checklists: Checklist[];
  maxItems?: number;
}

function buildActivityItems(
  logs: Log[],
  incidents: IncidentReport[],
  checklists: Checklist[],
  maxItems: number
): ActivityItem[] {
  const items: ActivityItem[] = [];

  // Pool testing logs
  logs
    .filter((l) => l.type === 'pool_testing')
    .slice(0, 10)
    .forEach((log) => {
      const ptLog = log as PoolTestingLog;
      items.push({
        id: `log-${log.id}`,
        type: 'pool_test',
        title: 'Pool Test Recorded',
        description: ptLog.isCompliant
          ? `pH ${ptLog.readings.pH}, Cl ${ptLog.readings.chlorine} ppm — Compliant`
          : `pH ${ptLog.readings.pH}, Cl ${ptLog.readings.chlorine} ppm — Action Required`,
        timestamp: log.timestamp,
        userName: log.recordedByName,
        status: ptLog.isCompliant ? 'compliant' : 'non-compliant',
      });
    });

  // Maintenance logs
  logs
    .filter((l) => l.type !== 'pool_testing')
    .slice(0, 10)
    .forEach((log) => {
      const typeLabels: Record<string, string> = {
        salt_level: 'Salt Level Recorded',
        salt_cell_cleaning: 'Salt Cell Cleaned',
        filter_cleaning: 'Filter Cleaned',
        temperature: 'Temperature Recorded',
      };
      items.push({
        id: `maint-${log.id}`,
        type: 'maintenance',
        title: typeLabels[log.type] || 'Maintenance Log',
        description: `Logged by ${log.recordedByName}`,
        timestamp: log.timestamp,
        userName: log.recordedByName,
      });
    });

  // Incidents
  incidents.slice(0, 10).forEach((inc) => {
    items.push({
      id: `inc-${inc.id}`,
      type: 'incident',
      title: `Incident ${inc.incidentNumber}`,
      description: `${inc.type.replace('_', ' ')} — ${inc.severity}`,
      timestamp: inc.reportedAt,
      userName: inc.reportedByName,
      status: inc.status,
    });
  });

  // Checklists
  checklists.slice(0, 10).forEach((cl) => {
    items.push({
      id: `cl-${cl.id}`,
      type: 'checklist',
      title: cl.name,
      description: `${cl.items.filter((i) => i.isCompleted).length}/${cl.items.length} items — ${cl.status}`,
      timestamp: cl.updatedAt || cl.createdAt,
      userName: cl.completedBy || '',
      status: cl.status,
    });
  });

  // Sort by timestamp descending and take top N
  return items
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxItems);
}

const ICON_MAP = {
  pool_test: { icon: TestTube, color: 'text-purple-500', bg: 'bg-purple-50' },
  maintenance: { icon: Wrench, color: 'text-blue-500', bg: 'bg-blue-50' },
  checklist: { icon: ClipboardCheck, color: 'text-green-500', bg: 'bg-green-50' },
  incident: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
};

export const RecentActivityFeed = ({
  logs,
  incidents,
  checklists,
  maxItems = 10,
}: RecentActivityFeedProps) => {
  const items = buildActivityItems(logs, incidents, checklists, maxItems);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">
          No recent activity. Start logging pool tests, checklists, or incidents.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const iconConfig = ICON_MAP[item.type];
            const Icon = iconConfig.icon;

            return (
              <div key={item.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${iconConfig.bg} flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${iconConfig.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{item.description}</p>
                  {item.userName && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.userName}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
