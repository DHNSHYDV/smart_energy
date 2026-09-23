import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  ShieldAlert,
  Clock,
  Check
} from 'lucide-react';

export function AlertsView() {
  const { alerts, resolveAlert } = useEnergy();
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'
  const [statusFilter, setStatusFilter] = useState('OPEN'); // 'OPEN' | 'ALL'

  const openAlerts = alerts.filter(a => !a.is_resolved);
  const criticalCount = openAlerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = openAlerts.filter(a => a.severity === 'WARNING').length;
  const resolvedCount = alerts.filter(a => a.is_resolved).length;

  const filteredAlerts = alerts.filter(a => {
    const matchesStatus = statusFilter === 'OPEN' ? !a.is_resolved : true;
    const matchesSev = filter === 'ALL' || a.severity === filter;
    return matchesStatus && matchesSev;
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
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'WARNING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">

      {/* TOP HEADER & COUNTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-neutral-800" />
            Alerts & Anomaly Incident Log
          </h2>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl">
          <button
            onClick={() => setStatusFilter('OPEN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'OPEN' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Open ({openAlerts.length})
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            All History ({alerts.length})
          </button>
        </div>
      </div>

      {/* 4 COUNTER CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-neutral-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Active Open</span>
          <span className="text-2xl font-bold font-mono text-neutral-900 mt-0.5 block">{openAlerts.length}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/70 shadow-xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Critical</span>
          <span className="text-2xl font-bold font-mono text-rose-900 mt-0.5 block">{criticalCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Warnings</span>
          <span className="text-2xl font-bold font-mono text-amber-900 mt-0.5 block">{warningCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Resolved</span>
          <span className="text-2xl font-bold font-mono text-emerald-900 mt-0.5 block">{resolvedCount}</span>
        </div>
      </div>

      {/* SEVERITY FILTER TABS */}
      <div className="flex items-center gap-2">
        {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(sev => (
          <button
            key={sev}
            onClick={() => setFilter(sev)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === sev
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* ALERTS LIST */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-10 text-center bg-white border border-neutral-200/80 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-neutral-800">No Incidents Detected</h3>
            <p className="text-xs text-neutral-500 mt-1">
              All monitored sub-circuits, voltage margins, and power factors are operating within academic baseline parameters.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                alert.is_resolved
                  ? 'bg-neutral-50 border-neutral-200/60 opacity-60'
                  : 'bg-white border-neutral-200/90 shadow-xs hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-neutral-900">
                      {alert.applianceName || alert.alertType}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {new Date(alert.created_at || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1 leading-snug">
                    {alert.message}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center gap-2 sm:self-center self-end">
                {alert.is_resolved ? (
                  <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" /> Resolved
                  </span>
                ) : (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Acknowledge & Resolve</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
