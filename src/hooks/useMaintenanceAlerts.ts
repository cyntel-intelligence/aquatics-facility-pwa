import { useMemo } from 'react';
import { differenceInDays } from 'date-fns';
import {
  Log,
  SaltLevelLog,
  SaltCellCleaningLog,
  FilterCleaningLog,
  TemperatureLog,
} from '../types';

export interface MaintenanceAlert {
  id: string;
  type: 'out_of_range' | 'maintenance_due' | 'maintenance_overdue';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  logId?: string;
}

export const useMaintenanceAlerts = (logs: Log[]): MaintenanceAlert[] => {
  return useMemo(() => {
    const alerts: MaintenanceAlert[] = [];
    const today = new Date();

    // Check each log type for issues
    logs.forEach((log) => {
      // Salt Level Alerts
      if (log.type === 'salt_level') {
        const saltLog = log as SaltLevelLog;
        if (!saltLog.isInRange) {
          alerts.push({
            id: `salt-${log.id}`,
            type: 'out_of_range',
            severity: 'high',
            title: 'Salt Level Out of Range',
            description: `Salt level is ${saltLog.saltLevel} ppm (target: ${saltLog.targetRange.min}-${saltLog.targetRange.max} ppm)`,
            logId: log.id,
          });
        }
      }

      // Salt Cell Cleaning Due
      if (log.type === 'salt_cell_cleaning') {
        const cellLog = log as SaltCellCleaningLog;
        if (cellLog.nextCleaningDue) {
          const daysUntilDue = differenceInDays(cellLog.nextCleaningDue, today);

          if (daysUntilDue < 0) {
            alerts.push({
              id: `salt-cell-overdue-${log.id}`,
              type: 'maintenance_overdue',
              severity: 'high',
              title: 'Salt Cell Cleaning Overdue',
              description: `Salt cell cleaning was due ${Math.abs(daysUntilDue)} days ago`,
              logId: log.id,
            });
          } else if (daysUntilDue <= 7) {
            alerts.push({
              id: `salt-cell-due-${log.id}`,
              type: 'maintenance_due',
              severity: daysUntilDue <= 3 ? 'medium' : 'low',
              title: 'Salt Cell Cleaning Due Soon',
              description: `Salt cell cleaning is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
              logId: log.id,
            });
          }
        }
      }

      // Filter Cleaning Due
      if (log.type === 'filter_cleaning') {
        const filterLog = log as FilterCleaningLog;
        if (filterLog.nextCleaningDue) {
          const daysUntilDue = differenceInDays(filterLog.nextCleaningDue, today);

          if (daysUntilDue < 0) {
            alerts.push({
              id: `filter-overdue-${log.id}`,
              type: 'maintenance_overdue',
              severity: 'high',
              title: 'Filter Cleaning Overdue',
              description: `Filter cleaning was due ${Math.abs(daysUntilDue)} days ago`,
              logId: log.id,
            });
          } else if (daysUntilDue <= 7) {
            alerts.push({
              id: `filter-due-${log.id}`,
              type: 'maintenance_due',
              severity: daysUntilDue <= 3 ? 'medium' : 'low',
              title: 'Filter Cleaning Due Soon',
              description: `Filter cleaning is due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
              logId: log.id,
            });
          }
        }
      }

      // Temperature Alerts
      if (log.type === 'temperature') {
        const tempLog = log as TemperatureLog;
        if (!tempLog.isInRange) {
          alerts.push({
            id: `temp-${log.id}`,
            type: 'out_of_range',
            severity: 'medium',
            title: 'Temperature Out of Range',
            description: `${tempLog.location.replace('-', ' ')} temperature is ${tempLog.temperature}°F (target: ${tempLog.targetRange.min}-${tempLog.targetRange.max}°F)`,
            logId: log.id,
          });
        }
      }
    });

    // Sort by severity (high first)
    return alerts.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [logs]);
};
