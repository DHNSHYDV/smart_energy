import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
  Settings,
  IndianRupee,
  Leaf,
  Zap,
  Gauge,
  CheckCircle2,
  Save,
  RotateCcw
} from 'lucide-react';

export function EnergyConfigView() {
  const { telemetry, updateConfig } = useEnergy();

  const [tariff, setTariff] = useState(telemetry.tariffRate || 8.0);
  const [peakMultiplier, setPeakMultiplier] = useState(1.25);
  const [peakStart, setPeakStart] = useState('18:00');
  const [peakEnd, setPeakEnd] = useState('22:00');
  const [carbonFactor, setCarbonFactor] = useState(0.82);
  const [sanctionedDemandW, setSanctionedDemandW] = useState(5000);
  const [monthlyBudgetKwh, setMonthlyBudgetKwh] = useState(350);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    const success = await updateConfig({
      tariff: Number(tariff),
      peakMultiplier: Number(peakMultiplier),
      carbonFactor: Number(carbonFactor),
      sanctionedDemandW: Number(sanctionedDemandW),
      monthlyBudgetKwh: Number(monthlyBudgetKwh)
    });

    if (success) {
      setSaveStatus('System parameters updated and synchronized with backend engine.');
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const handleReset = () => {
    setTariff(8.0);
    setPeakMultiplier(1.25);
    setPeakStart('18:00');
    setPeakEnd('22:00');
    setCarbonFactor(0.82);
    setSanctionedDemandW(5000);
    setMonthlyBudgetKwh(350);
  };

  return (
    <div className="space-y-6">

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-neutral-800" />
            Energy Billing & Threshold Configuration
          </h2>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* STATUS TOAST */}
      {saveStatus && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* CONFIGURATION FORM */}
      <form onSubmit={handleSave} className="space-y-6">

        {/* 1. TARIFF STRUCTURE */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <IndianRupee className="w-4 h-4 text-neutral-800" />
            <h3 className="font-bold text-sm text-neutral-900">Utility Tariff Structure (TOD Billing)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Standard Tariff (₹/kWh)</label>
              <input
                type="number"
                step="0.1"
                value={tariff}
                onChange={(e) => setTariff(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                required
              />
              <span className="text-[10px] text-neutral-400 block mt-1">Normal off-peak rate</span>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Peak Surcharge Multiplier</label>
              <input
                type="number"
                step="0.05"
                value={peakMultiplier}
                onChange={(e) => setPeakMultiplier(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                required
              />
              <span className="text-[10px] text-neutral-400 block mt-1">Peak Rate: ₹{(tariff * peakMultiplier).toFixed(2)}/kWh</span>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Peak Window Start</label>
              <input
                type="time"
                value={peakStart}
                onChange={(e) => setPeakStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                required
              />
              <span className="text-[10px] text-neutral-400 block mt-1">Evening surge onset</span>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Peak Window End</label>
              <input
                type="time"
                value={peakEnd}
                onChange={(e) => setPeakEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                required
              />
              <span className="text-[10px] text-neutral-400 block mt-1">Evening surge conclusion</span>
            </div>
          </div>
        </div>

        {/* 2. DEMAND & CARBON LIMITS */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Gauge className="w-4 h-4 text-neutral-800" />
            <h3 className="font-bold text-sm text-neutral-900">Demand Limits & Environmental Factors</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Sanctioned Demand (Watts)</label>
              <input
                type="number"
                value={sanctionedDemandW}
                onChange={(e) => setSanctionedDemandW(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                required
              />
              <span className="text-[10px] text-neutral-400 block mt-1">5000 W (5.0 kW Sanctioned)</span>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Carbon Factor (kg CO₂ / kWh)</label>
              <input
                type="number"
                step="0.01"
                value={carbonFactor}
                onChange={(e) => setCarbonFactor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                required
              />
              <span className="text-[10px] text-neutral-400 block mt-1">CEA Baseline Version 19.0 (0.82 kg)</span>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Monthly Conservation Budget (kWh)</label>
              <input
                type="number"
                value={monthlyBudgetKwh}
                onChange={(e) => setMonthlyBudgetKwh(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                required
              />
              <span className="text-[10px] text-neutral-400 block mt-1">Alert triggers at 80% consumption</span>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-[0.99]"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>

    </div>
  );
}
