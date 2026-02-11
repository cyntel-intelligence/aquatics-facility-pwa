import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { PoolTestingLog, Log } from '../../types';

interface ComplianceStatusCardProps {
  logs: Log[];
  hasRules: boolean;
}

export const ComplianceStatusCard = ({ logs, hasRules }: ComplianceStatusCardProps) => {
  const poolTests = logs.filter((l) => l.type === 'pool_testing') as PoolTestingLog[];
  const recentTests = poolTests.slice(0, 10);
  const compliantCount = recentTests.filter((t) => t.isCompliant).length;
  const totalCount = recentTests.length;
  const complianceRate = totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : null;

  if (!hasRules) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <h3 className="text-sm font-semibold text-gray-900">Compliance Status</h3>
        </div>
        <p className="text-sm text-gray-500">
          Configure compliance rules to track water chemistry compliance.
        </p>
      </div>
    );
  }

  if (complianceRate === null) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Compliance Status</h3>
        <p className="text-sm text-gray-500">No pool tests recorded yet.</p>
      </div>
    );
  }

  const isGood = complianceRate >= 90;
  const isWarning = complianceRate >= 70 && complianceRate < 90;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Compliance Status</h3>
        {isGood ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : isWarning ? (
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
      </div>

      <div className="flex items-end gap-2">
        <span
          className={`text-3xl font-bold ${
            isGood ? 'text-green-600' : isWarning ? 'text-yellow-600' : 'text-red-600'
          }`}
        >
          {complianceRate}%
        </span>
        <span className="text-sm text-gray-500 mb-1">
          ({compliantCount}/{totalCount} tests)
        </span>
      </div>

      {/* Mini bar */}
      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            isGood ? 'bg-green-500' : isWarning ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${complianceRate}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 mt-2">Based on last {totalCount} pool tests</p>
    </div>
  );
};
