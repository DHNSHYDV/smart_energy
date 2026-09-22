import React from 'react';
import { useEnergy } from '../../context/EnergyContext';
import { 
  Zap, 
  Power, 
  AlertTriangle, 
  Activity, 
  Clock, 
  IndianRupee, 
  Leaf, 
  Gauge,
  Snowflake,
  Tv,
  Monitor,
  Lightbulb,
  Fan,
  Flame,
  CheckCircle2
} from 'lucide-react';

const iconMap = {
  'AC001': Snowflake,
  'FR001': Zap,
  'TV001': Tv,
  'PC001': Monitor,
  'LT001': Lightbulb,
  'FN001': Fan,
  'WM001': Zap,
  'GH001': Flame,
};

export function AppliancesView() {
  const { appliances, toggleAppliance, injectAnomaly, telemetry } = useEnergy();

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            Device-Level Energy Sensing & Control
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulated CT sensors, voltage meters, and smart relays for individual load circuits
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Virtual CT Sensor Hub Active</span>
        </div>
      </div>

      {/* Grid of Detailed Appliance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {appliances.map((app) => {
          const Icon = iconMap[app.id] || Zap;
          const reading = app.reading || {
            voltage: telemetry.gridVoltage,
            current: 0,
            powerFactor: app.powerFactor,
            activePower: 0,
            apparentPower: 0,
            reactivePower: 0,
            cumulativeEnergyKwh: 0,
            status: app.isOn ? 'ON' : 'OFF'
          };

          const energyKwh = reading.cumulativeEnergyKwh || 0;
          const cost = (energyKwh * telemetry.tariffRate).toFixed(2);
          const carbon = (energyKwh * 0.82).toFixed(2);
          const isAnomaly = app.isAnomaly;

          return (
            <div
              key={app.id}
              className={`rounded-2xl p-5 border transition-all duration-200 ${
                app.isOn
                  ? isAnomaly
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-xl shadow-rose-950/20'
                    : 'bg-slate-900/90 border-slate-800 shadow-xl'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-80'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl border ${
                    app.isOn
                      ? isAnomaly
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white">{app.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        app.isOn 
                          ? isAnomaly ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {app.isOn ? '● ON' : '○ OFF'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      ID: <span className="font-mono text-slate-300">{app.id}</span> | {app.location} | Rated: {app.ratedPower}W
                    </p>
                  </div>
                </div>

                {/* Primary Remote Relay Switch Button */}
                <button
                  onClick={() => toggleAppliance(app.id, !app.isOn)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                    app.isOn
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40 active:scale-95'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40 active:scale-95'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{app.isOn ? 'TURN OFF' : 'TURN ON'}</span>
                </button>
              </div>

              {/* Electrical Parameters Grid (Simulated CT & Voltage Sensor) */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  Virtual CT Clamp & Power Sensor Readings
                </span>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center">
                  
                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Active Power</span>
                    <span className={`text-sm font-mono font-bold ${
                      app.isOn 
                        ? isAnomaly ? 'text-rose-400' : 'text-emerald-400'
                        : 'text-slate-400'
                    }`}>
                      {app.isOn ? `${Math.round(reading.activePower)} W` : '0 W'}
                    </span>
                  </div>

                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">RMS Current</span>
                    <span className="text-sm font-mono font-bold text-cyan-400">
                      {app.isOn ? `${reading.current} A` : '0.00 A'}
                    </span>
                  </div>

                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">RMS Voltage</span>
                    <span className="text-sm font-mono font-bold text-amber-400">
                      {reading.voltage} V
                    </span>
                  </div>

                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Power Factor</span>
                    <span className="text-sm font-mono font-bold text-indigo-400">
                      {reading.powerFactor}
                    </span>
                  </div>

                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Energy Today</span>
                    <span className="text-sm font-mono font-bold text-teal-400">
                      {energyKwh.toFixed(2)} kWh
                    </span>
                  </div>

                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Today's Cost</span>
                    <span className="text-sm font-mono font-bold text-emerald-300">
                      ₹{cost}
                    </span>
                  </div>

                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Carbon CO₂</span>
                    <span className="text-sm font-mono font-bold text-slate-300">
                      {carbon} kg
                    </span>
                  </div>

                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Apparent (S)</span>
                    <span className="text-sm font-mono font-bold text-slate-400">
                      {app.isOn ? `${Math.round(reading.apparentPower)} VA` : '0 VA'}
                    </span>
                  </div>

                </div>
              </div>

              {/* Anomaly & Control Footer */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {isAnomaly ? (
                    <span className="text-rose-400 font-semibold flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Abnormal Current Surge Active
                    </span>
                  ) : (
                    <span className="text-emerald-400/80 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Normal Operating Range
                    </span>
                  )}
                </span>

                {/* Inject Anomaly Button for Evaluator Demo */}
                <button
                  onClick={() => injectAnomaly(app.id, !isAnomaly)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                    isAnomaly
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {isAnomaly ? 'Reset Anomaly' : 'Test Anomaly'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
