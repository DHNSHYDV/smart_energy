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
            Configuration
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

      {/* OVER-THE-AIR (OTA) MOBILE UPDATE MANAGER */}
      <OtaUpdateManager backendUrl={useEnergy().backendUrl} />

    </div>
  );
}

function OtaUpdateManager({ backendUrl }) {
  const [otaData, setOtaData] = useState({
    isActive: true,
    versionName: '2.1.0',
    versionCode: 3,
    title: 'GridSense v2.1.0 Update Available',
    releaseNotes: '• Multi-tenant resident switching (Dhanush Yadav & Priya Sharma)\n• User-specific diurnal energy curves & billing breakdown\n• Real-time sub-metering telemetry sync\n• In-app Over-The-Air (OTA) auto-updating',
    apkUrl: '/download/apk',
    fileSizeFormatted: '8.1 MB',
    isMandatory: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [actionStatus, setActionStatus] = useState(null);

  const fetchOtaStatus = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/app/update/admin`);
      const json = await res.json();
      if (json.success && json.data) {
        setOtaData(json.data);
      }
    } catch (e) {
      console.warn('Failed to load OTA admin settings:', e.message);
    }
  };

  React.useEffect(() => {
    fetchOtaStatus();
  }, [backendUrl]);

  const handlePublish = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`${backendUrl}/api/app/update/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(otaData)
      });
      const json = await res.json();
      if (json.success) {
        setOtaData(json.data);
        setActionStatus({ type: 'success', message: json.message });
      } else {
        setActionStatus({ type: 'error', message: json.message });
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: err.message });
    } finally {
      setIsSaving(false);
      setTimeout(() => setActionStatus(null), 4000);
    }
  };

  const handleRetract = async () => {
    if (!window.confirm('Retract this update? Mobile devices will immediately stop receiving update prompts.')) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${backendUrl}/api/app/update/retract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      if (json.success) {
        setOtaData(json.data);
        setActionStatus({ type: 'info', message: json.message });
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: err.message });
    } finally {
      setIsSaving(false);
      setTimeout(() => setActionStatus(null), 4000);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-6">
      
      {/* HEADER & STATUS BADGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </span>
            <div>
              <h3 className="text-base font-bold text-neutral-900">Mobile OTA Update Manager</h3>
              <p className="text-xs text-neutral-500">Push new releases, edit changelogs, or retract updates from mobile clients</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {otaData.isActive ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ● OTA ACTIVE (Devices Prompted)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
              <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
              ○ RETRACTED (No Prompts)
            </span>
          )}
        </div>
      </div>

      {/* FEEDBACK STATUS */}
      {actionStatus && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${
          actionStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          actionStatus.type === 'info' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
          'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{actionStatus.message}</span>
        </div>
      )}

      {/* GRID: CONTROLS & LIVE MOBILE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* EDIT FORM (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Target Version Tag</label>
              <input
                type="text"
                value={otaData.versionName}
                onChange={(e) => setOtaData({ ...otaData, versionName: e.target.value })}
                placeholder="2.1.0"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Internal Version Code</label>
              <input
                type="number"
                value={otaData.versionCode}
                onChange={(e) => setOtaData({ ...otaData, versionCode: parseInt(e.target.value, 10) || 1 })}
                placeholder="3"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Update Dialog Title</label>
              <input
                type="text"
                value={otaData.title}
                onChange={(e) => setOtaData({ ...otaData, title: e.target.value })}
                placeholder="GridSense v2.1.0 Update Available"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Package Size</label>
              <input
                type="text"
                value={otaData.fileSizeFormatted}
                onChange={(e) => setOtaData({ ...otaData, fileSizeFormatted: e.target.value })}
                placeholder="8.1 MB"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1">APK Download Route / Link</label>
            <input
              type="text"
              value={otaData.apkUrl}
              onChange={(e) => setOtaData({ ...otaData, apkUrl: e.target.value })}
              placeholder="/download/apk"
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <span className="text-[10px] text-neutral-400 block mt-0.5">Defaults to local express route: /download/apk (or GitHub asset URL)</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1">Release Notes & Changelog</label>
            <textarea
              rows={4}
              value={otaData.releaseNotes}
              onChange={(e) => setOtaData({ ...otaData, releaseNotes: e.target.value })}
              placeholder="• Feature 1\n• Feature 2"
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="mandatoryToggle"
              checked={otaData.isMandatory}
              onChange={(e) => setOtaData({ ...otaData, isMandatory: e.target.checked })}
              className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
            />
            <label htmlFor="mandatoryToggle" className="text-xs font-semibold text-neutral-700">
              Mandatory Update (blocks dismiss button until installed)
            </label>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handlePublish}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>{isSaving ? 'Publishing...' : 'Push Update to App'}</span>
            </button>

            {otaData.isActive && (
              <button
                type="button"
                onClick={handleRetract}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors border border-rose-200 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Remove / Retract Update</span>
              </button>
            )}
          </div>
        </div>

        {/* LIVE MOBILE PREVIEW (5 COLS) */}
        <div className="lg:col-span-5 bg-neutral-900 rounded-2xl p-5 border border-neutral-800 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-neutral-400 text-[10px] pb-3 border-b border-neutral-800 uppercase tracking-widest font-mono font-bold">
              <span>Mobile In-App Dialog Preview</span>
              <span className="text-emerald-400">Live</span>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-neutral-800/90 border border-neutral-700 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    OTA Update
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1.5">{otaData.title || 'GridSense Update'}</h4>
                  <p className="text-[11px] text-neutral-400">Version {otaData.versionName} · {otaData.fileSizeFormatted}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-[11px] text-neutral-300 font-sans whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
                {otaData.releaseNotes}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-default"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download & Install</span>
                </button>
                {!otaData.isMandatory && (
                  <button
                    type="button"
                    className="py-2 px-3 rounded-lg bg-neutral-700 text-neutral-300 font-semibold text-xs cursor-default"
                  >
                    Later
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 text-center text-[10px] text-neutral-500 font-mono">
            Direct binary endpoint: {backendUrl}/download/apk
          </div>
        </div>

      </div>

    </div>
  );
}

