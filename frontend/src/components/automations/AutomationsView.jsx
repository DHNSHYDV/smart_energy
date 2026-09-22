import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import {
  Sparkles,
  CalendarClock,
  Sliders,
  TrendingDown,
  Moon,
  Briefcase,
  Leaf,
  Shield,
  Plus,
  Trash2,
  Power,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export function AutomationsView() {
  const {
    scenes,
    schedules,
    rules,
    loadShifting,
    appliances,
    applyScene,
    toggleSchedule,
    deleteSchedule,
    addSchedule
  } = useEnergy();

  const [activeTab, setActiveTab] = useState('scenes'); // 'scenes' | 'schedules' | 'rules' | 'shifting'
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [newScheduleAppliance, setNewScheduleAppliance] = useState(appliances[0]?.id || 'AC001');
  const [newScheduleTime, setNewScheduleTime] = useState('22:00');
  const [newScheduleAction, setNewScheduleAction] = useState('OFF');
  const [sceneSuccessToast, setSceneSuccessToast] = useState(null);

  const sceneIcons = {
    night_mode: Moon,
    work_mode: Briefcase,
    eco_peak_shift: Leaf,
    away_mode: Shield
  };

  const handleApplyScene = async (sceneId, sceneName) => {
    const success = await applyScene(sceneId);
    if (success) {
      setSceneSuccessToast(`Activated "${sceneName}" profile successfully`);
      setTimeout(() => setSceneSuccessToast(null), 4000);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    const app = appliances.find(a => a.id === newScheduleAppliance);
    const success = await addSchedule({
      appliance_id: newScheduleAppliance,
      appliance_name: app ? app.name : newScheduleAppliance,
      action: newScheduleAction,
      scheduled_time: newScheduleTime,
      days_of_week: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
      is_active: 1
    });

    if (success) {
      setIsAddScheduleModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neutral-800" />
            Automations & Demand-Side Management (DSM)
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Orchestrate one-touch scenes, cron schedules, automated demand rules, and peak load shifting
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('scenes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'scenes' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Scenes (Profiles)
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'schedules' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Schedules ({schedules.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'rules' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Smart Rules
          </button>
          <button
            onClick={() => setActiveTab('shifting')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'shifting' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Peak Load Shifting
          </button>
        </div>
      </div>

      {/* SUCCESS TOAST */}
      {sceneSuccessToast && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{sceneSuccessToast}</span>
        </div>
      )}

      {/* TAB CONTENT */}

      {/* 1. SCENES TAB */}
      {activeTab === 'scenes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenes.map(scene => {
            const Icon = sceneIcons[scene.id] || Sparkles;
            return (
              <div
                key={scene.id}
                className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-neutral-900">{scene.name}</h3>
                        <span className="text-[11px] text-neutral-400 font-mono">1-Touch Scene Profile</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                    {scene.description}
                  </p>

                  <div className="p-3 rounded-xl bg-neutral-50 text-xs space-y-1.5 mb-4 border border-neutral-100 font-mono text-[11px]">
                    <span className="text-neutral-400 text-[10px] uppercase font-bold block">Relay Actions:</span>
                    {Object.entries(scene.actions || {}).map(([appId, state]) => {
                      const app = appliances.find(a => a.id === appId);
                      return (
                        <div key={appId} className="flex items-center justify-between">
                          <span className="text-neutral-700">{app?.name || appId}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            state === 'ON' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                          }`}>
                            SET {state}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => handleApplyScene(scene.id, scene.name)}
                  className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Execute Scene Profile</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. SCHEDULES TAB */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">
              Active schedules trigger relays at designated times without manual intervention.
            </span>
            <button
              onClick={() => setIsAddScheduleModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Schedule</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
            {schedules.length === 0 ? (
              <div className="text-center py-10 text-neutral-400 text-xs">
                No automation schedules configured. Click "Create Schedule" above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-100 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Device</th>
                      <th className="py-2.5 px-3">Trigger Time</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Days</th>
                      <th className="py-2.5 px-3">State</th>
                      <th className="py-2.5 px-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-mono">
                    {schedules.map(sch => (
                      <tr key={sch.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-3 px-3 font-sans font-semibold text-neutral-900">
                          {sch.appliance_name || sch.appliance_id}
                        </td>
                        <td className="py-3 px-3 text-neutral-700 font-bold">
                          {sch.scheduled_time}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sch.action === 'ON' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {sch.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-sans text-neutral-500 text-[11px]">
                          {sch.days_of_week || 'Everyday'}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => toggleSchedule(sch.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold transition-all cursor-pointer ${
                              sch.is_active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-neutral-200 text-neutral-600'
                            }`}
                          >
                            {sch.is_active ? 'ACTIVE' : 'PAUSED'}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => deleteSchedule(sch.id)}
                            className="p-1 rounded-lg text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SMART RULES TAB */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map(rule => (
            <div key={rule.id} className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200/60">
                  {rule.type || 'RULE'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <h3 className="font-bold text-sm text-neutral-900">{rule.name}</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">{rule.description}</p>
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs font-mono">
                <div className="text-neutral-400 text-[10px] uppercase font-bold mb-1">TRIGGER LOGIC:</div>
                <div className="text-neutral-800">
                  IF <span className="text-amber-600">{rule.condition}</span> THEN <span className="text-emerald-700 font-bold">{rule.action}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. PEAK LOAD SHIFTING TAB */}
      {activeTab === 'shifting' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
              <div>
                <h3 className="font-bold text-sm text-neutral-900">Time-of-Day (TOD) Peak Tariff Curtailment</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Financial benefit analysis of shifting heavy resistive and inductive loads out of the 18:00–22:00 peak surcharge window
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Peak Surcharge: 1.25x (₹10.00/kWh)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/70">
                <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Peak Power Curtailed</span>
                <span className="text-2xl font-bold font-mono text-neutral-900 mt-1 block">
                  {loadShifting?.curtailedPeakKw || '1.8'} kW
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block">When Eco Peak Shift active</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/70">
                <span className="text-[11px] font-semibold text-emerald-600 block uppercase">Estimated Monthly Savings</span>
                <span className="text-2xl font-bold font-mono text-emerald-900 mt-1 block">
                  ₹{loadShifting?.monthlySavingsInr || '540.00'}
                </span>
                <span className="text-[11px] text-emerald-700 mt-1 block">Avoided peak tariff differential</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/70">
                <span className="text-[11px] font-semibold text-blue-600 block uppercase">Grid Stress Reduction</span>
                <span className="text-2xl font-bold font-mono text-blue-900 mt-1 block">
                  {loadShifting?.gridStressReductionPct || '36.5'}%
                </span>
                <span className="text-[11px] text-blue-700 mt-1 block">Lower peak transformer loading</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 text-xs space-y-2">
              <span className="font-bold text-neutral-900 block">System Recommendations for Peak Shifting:</span>
              <ul className="space-y-1.5 text-neutral-600 list-disc list-inside">
                <li>Pre-heat geyser before 17:30 or schedule water heating after 22:00.</li>
                <li>Delay washing machine spin cycles to morning off-peak window (07:00–11:00).</li>
                <li>Set Inverter AC temperature to 25°C instead of 22°C between 18:00 and 22:00 to reduce compressor duty cycle by 28%.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SCHEDULE MODAL */}
      {isAddScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-neutral-200">
            <h3 className="font-bold text-base text-neutral-900 mb-1">Create Automation Schedule</h3>
            <p className="text-xs text-neutral-500 mb-4">Set automated relay switching for any monitored appliance</p>

            <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Target Appliance</label>
                <select
                  value={newScheduleAppliance}
                  onChange={(e) => setNewScheduleAppliance(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                >
                  {appliances.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Relay Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewScheduleAction('ON')}
                    className={`py-2 rounded-xl font-bold cursor-pointer transition-all ${
                      newScheduleAction === 'ON' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    Switch ON
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewScheduleAction('OFF')}
                    className={`py-2 rounded-xl font-bold cursor-pointer transition-all ${
                      newScheduleAction === 'OFF' ? 'bg-rose-600 text-white shadow-xs' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    Switch OFF
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Execution Time (24h)</label>
                <input
                  type="time"
                  value={newScheduleTime}
                  onChange={(e) => setNewScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-white font-semibold hover:bg-neutral-800 cursor-pointer shadow-xs"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
