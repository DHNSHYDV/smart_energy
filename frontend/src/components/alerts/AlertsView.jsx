import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import { 
  Bell, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  CheckCircle2, 
  ShieldAlert
} from 'lucide-react';

export function AlertsView() {
  const { alerts, resolveAlert } = useEnergy();
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'ALL') return true;
    return a.severity === filter;
  });

  const getSeverityIcon = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return <AlertOctagon className="w-4 h-4 text-rose-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-700';
      case 'WARNING':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Alerts Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Abnormal Consumption & Anomaly Alerts
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Autonomous threshold monitoring, prolonged run-time detection, and surge alerts
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center bg-neutral-100 p-1 rounded-full border border-neutral-200 self-start sm:self-auto">
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                filter === sev
                  ? 'bg-white text-neutral-900 shadow-xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-neutral-50 border border-neutral-200/80 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-neutral-800">All Systems Nominal</h3>
            <p className="text-xs text-neutral-500 mt-1">
              No anomalies detected. Grid voltage, power factor, and runtime thresholds within safe parameters.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                alert.is_resolved
                  ? 'bg-neutral-50/60 border-neutral-200/50 opacity-60'
                  : 'bg-white border-neutral-200/90 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${getSeverityBadge(alert.severity)}`}>
                  {getSeverityIcon(alert.severity)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-neutral-900">{alert.applianceName || alert.alertType}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    {alert.is_resolved && (
                      <span className="text-[10px] text-neutral-400 font-medium">Resolved</span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-600 mt-1">{alert.message}</p>
                  <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {!alert.is_resolved && (
                <button
                  onClick={() => resolveAlert(alert.id)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors self-start sm:self-auto cursor-pointer shrink-0"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
