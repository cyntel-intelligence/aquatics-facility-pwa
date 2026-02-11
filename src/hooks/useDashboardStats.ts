import { useMemo } from 'react';
import { Log, PoolTestingLog, IncidentReport, Checklist } from '../types';
import { MaintenanceAlert } from './useMaintenanceAlerts';

export interface DashboardStats {
  complianceRate: number | null;
  activeIncidents: number;
  pendingChecklists: number;
  maintenanceAlerts: number;
  totalPoolTests: number;
  recentPoolTests: number;
}

export const useDashboardStats = (
  logs: Log[],
  incidents: IncidentReport[],
  checklists: Checklist[],
  alerts: MaintenanceAlert[]
): DashboardStats => {
  return useMemo(() => {
    // Compliance rate from pool tests
    const poolTests = logs.filter((l) => l.type === 'pool_testing') as PoolTestingLog[];
    const recentTests = poolTests.slice(0, 10);
    const compliantCount = recentTests.filter((t) => t.isCompliant).length;
    const complianceRate =
      recentTests.length > 0
        ? Math.round((compliantCount / recentTests.length) * 100)
        : null;

    // Active incidents (not closed)
    const activeIncidents = incidents.filter(
      (i) => i.status !== 'closed' && i.status !== 'draft'
    ).length;

    // Pending/in-progress checklists
    const pendingChecklists = checklists.filter(
      (c) => c.status === 'pending' || c.status === 'in-progress'
    ).length;

    return {
      complianceRate,
      activeIncidents,
      pendingChecklists,
      maintenanceAlerts: alerts.length,
      totalPoolTests: poolTests.length,
      recentPoolTests: recentTests.length,
    };
  }, [logs, incidents, checklists, alerts]);
};
