import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import { 
  LayoutGrid, 
  Activity, 
  Cpu, 
  BarChart3, 
  Sparkles, 
  ShieldAlert,
  MoreHorizontal,
  FileText,
  Radio,
  Settings,
  X
} from 'lucide-react';

export function BottomNav({ onOpenAcademic }) {
  const { activeTab, setActiveTab, alerts } = useEnergy();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const unreadAlerts = alerts.filter(a => !a.is_resolved).length;

  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutGrid },
    { id: 'live', label: 'Live', icon: Activity },
    { id: 'devices', label: 'Devices', icon: Cpu },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'automations', label: 'Automations', icon: Sparkles },
    { id: 'alerts', label: 'Alerts', icon: ShieldAlert, badge: unreadAlerts },
  ];

  return (
    <>
      {/* "More" Popover Menu on Mobile */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex flex-col justify-end p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-5 shadow-2xl border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h4 className="font-bold text-sm text-neutral-900">System Modules & Admin</h4>
              <button onClick={() => setIsMoreOpen(false)} className="p-1 rounded-full text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                onClick={() => { setActiveTab('reports'); setIsMoreOpen(false); }}
                className="p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 text-left border border-neutral-100 flex items-center gap-2.5 font-semibold text-neutral-800"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                Audit Reports
              </button>
              <button
                onClick={() => { setActiveTab('network'); setIsMoreOpen(false); }}
                className="p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 text-left border border-neutral-100 flex items-center gap-2.5 font-semibold text-neutral-800"
              >
                <Radio className="w-4 h-4 text-emerald-600" />
                IoT Network
              </button>
              <button
                onClick={() => { setActiveTab('config'); setIsMoreOpen(false); }}
                className="p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 text-left border border-neutral-100 flex items-center gap-2.5 font-semibold text-neutral-800"
              >
                <Settings className="w-4 h-4 text-neutral-700" />
                Tariff Config
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-800 px-2 py-1.5 safe-area-pb">
        <div className="flex items-center justify-around">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all relative cursor-pointer ${
                  isActive ? 'text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-white' : ''}`} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full mt-0.5"></div>
                )}
              </button>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-neutral-400 hover:text-neutral-200 cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-1">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
