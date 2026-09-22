import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import { 
  Bell, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  CheckCircle2, 
  ShieldAlert, 
  Filter 
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
        return <AlertOctagon className="w-5 h-5 text-rose-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'WARNING':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      default:
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Alerts Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Abnormal Consumption & Anomaly Alerts
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous threshold monitoring, prolonged run-time detection, and surge alerts
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-bold text-white">All Circuits Operating Efficiently</h3>
            <p className="text-xs text-slate-400 mt-1">
              No active anomalies or threshold violations detected across connected virtual appliances.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                alert.is_resolved
                  ? 'bg-slate-950/40 border-slate-800/80 opacity-60'
                  : alert.severity === 'CRITICAL'
                    ? 'bg-rose-950/20 border-rose-500/30 shadow-lg shadow-rose-950/10'
                    : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                  alert.severity === 'CRITICAL' 
                    ? 'bg-rose-500/10 border-rose-500/20' 
                    : alert.severity === 'WARNING'
                      ? 'bg-amber-500/10 border-amber-500/20'
                      : 'bg-cyan-500/10 border-cyan-500/20'
                }`}>
                  {getSeverityIcon(alert.severity)}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {alert.applianceId || alert.appliance_id}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                    {alert.is_resolved && (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Resolved
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-slate-200 mt-1 leading-snug">
                    {alert.message}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              {!alert.is_resolved && (
                <button
                  onClick={() => resolveAlert(alert.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors self-end sm:self-center flex-shrink-0"
                >
                  Acknowledge
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
