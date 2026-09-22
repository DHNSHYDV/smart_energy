import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import { 
  CalendarClock, 
  Plus, 
  Trash2, 
  Power, 
  Check, 
  X, 
  Clock, 
  Calendar,
  AlertCircle 
} from 'lucide-react';

export function SchedulesView() {
  const { schedules, appliances, addSchedule, toggleSchedule, deleteSchedule } = useEnergy();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppliance, setSelectedAppliance] = useState(appliances[0]?.id || 'AC001');
  const [action, setAction] = useState('OFF');
  const [time, setTime] = useState('23:00');
  const [selectedDays, setSelectedDays] = useState(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);

  const daysList = [
    { id: 'MON', label: 'Mon' },
    { id: 'TUE', label: 'Tue' },
    { id: 'WED', label: 'Wed' },
    { id: 'THU', label: 'Thu' },
    { id: 'FRI', label: 'Fri' },
    { id: 'SAT', label: 'Sat' },
    { id: 'SUN', label: 'Sun' },
  ];

  const handleToggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== dayId));
      }
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    await addSchedule({
      applianceId: selectedAppliance,
      action,
      time,
      days: selectedDays
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-emerald-400" />
            Automated Schedules & Load Shedding
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure time-of-day automation rules executed autonomously by the Virtual IoT Controller
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Schedule</span>
        </button>
      </div>

      {/* Schedules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedules.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
            <Calendar className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">No Active Automation Schedules</h3>
            <p className="text-xs text-slate-400 mt-1">
              Add automated ON/OFF rules to eliminate standby losses during night or peak-tariff periods.
            </p>
          </div>
        ) : (
          schedules.map((sch) => {
            let daysArr = [];
            try {
              daysArr = typeof sch.days === 'string' ? JSON.parse(sch.days) : sch.days;
            } catch (e) {
              daysArr = ['Daily'];
            }

            return (
              <div
                key={sch.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  sch.is_active
                    ? 'bg-slate-900/90 border-slate-800 shadow-xl'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                        sch.action === 'ON' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        TURN {sch.action}
                      </span>
                      <h4 className="font-bold text-sm text-white truncate max-w-[140px]">
                        {sch.appliance_name || sch.appliance_id}
                      </h4>
                    </div>

                    <button
                      onClick={() => deleteSchedule(sch.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete Schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Scheduled Time */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className="text-2xl font-extrabold font-mono text-white tracking-tight">
                      {sch.time}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({sch.days?.length === 7 ? 'Every day' : `${daysArr.length} days/week`})
                    </span>
                  </div>

                  {/* Days Chips */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {daysList.map((d) => {
                      const isSelected = daysArr.includes(d.id);
                      return (
                        <span
                          key={d.id}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                            isSelected
                              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 font-semibold'
                              : 'bg-slate-950 text-slate-600'
                          }`}
                        >
                          {d.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Footer toggle */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Status: <strong className={sch.is_active ? 'text-emerald-400' : 'text-slate-500'}>
                      {sch.is_active ? 'ACTIVE' : 'DISABLED'}
                    </strong>
                  </span>

                  <button
                    onClick={() => toggleSchedule(sch.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      sch.is_active
                        ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                    }`}
                  >
                    {sch.is_active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Schedule Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Create Automation Schedule</h3>
            <p className="text-xs text-slate-400 mb-4">Command will be triggered autonomously by ESP32-SIM-001</p>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              
              {/* Select Appliance */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Select Appliance</label>
                <select
                  value={selectedAppliance}
                  onChange={(e) => setSelectedAppliance(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {appliances.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAction('OFF')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      action === 'OFF'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    TURN OFF
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction('ON')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      action === 'ON'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    TURN ON
                  </button>
                </div>
              </div>

              {/* Time Picker */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Trigger Time (24h)</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Repeat Days */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Repeat Days</label>
                <div className="flex gap-1 justify-between">
                  {daysList.map((d) => {
                    const isSelected = selectedDays.includes(d.id);
                    return (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => handleToggleDay(d.id)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
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
