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
    { id: 'automations', label: 'Rules', icon: Sparkles },
  ];

  return (
    <>
      {/* "More" Popover Menu on Mobile */}
      {isMoreOpen && (
        <div 
          onClick={() => setIsMoreOpen(false)}
          className="md:hidden fixed inset-0 z-50 bg-neutral-900/70 backdrop-blur-sm flex flex-col justify-end p-4 animate-fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-900 rounded-3xl p-5 shadow-2xl border border-neutral-800 space-y-3 cursor-default"
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h4 className="font-bold text-sm text-white">App Features & Utilities</h4>
              <button onClick={() => setIsMoreOpen(false)} className="p-1 rounded-full text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <button
                onClick={() => { setActiveTab('analytics'); setIsMoreOpen(false); }}
                className="p-3 rounded-2xl bg-neutral-800/80 hover:bg-neutral-800 text-left border border-neutral-700/60 flex items-center gap-2.5 font-semibold text-neutral-200"
              >
                <BarChart3 className="w-4 h-4 text-purple-400" />
                Analytics
              </button>
              <button
                onClick={() => { setActiveTab('alerts'); setIsMoreOpen(false); }}
                className="p-3 rounded-2xl bg-neutral-800/80 hover:bg-neutral-800 text-left border border-neutral-700/60 flex items-center justify-between font-semibold text-neutral-200"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Alerts
                </div>
                {unreadAlerts > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500 text-white">
                    {unreadAlerts}
                  </span>
                )}
              </button>
              <button
                onClick={() => { setActiveTab('reports'); setIsMoreOpen(false); }}
                className="p-3 rounded-2xl bg-neutral-800/80 hover:bg-neutral-800 text-left border border-neutral-700/60 flex items-center gap-2.5 font-semibold text-neutral-200"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                Audit Reports
              </button>
              <button
                onClick={() => { setActiveTab('network'); setIsMoreOpen(false); }}
                className="p-3 rounded-2xl bg-neutral-800/80 hover:bg-neutral-800 text-left border border-neutral-700/60 flex items-center gap-2.5 font-semibold text-neutral-200"
              >
                <Radio className="w-4 h-4 text-emerald-400" />
                IoT Gateway
              </button>
              <button
                onClick={() => { setActiveTab('config'); setIsMoreOpen(false); }}
                className="p-3 rounded-2xl bg-neutral-800/80 hover:bg-neutral-800 text-left border border-neutral-700/60 flex items-center gap-2.5 font-semibold text-neutral-200 col-span-2"
              >
                <Settings className="w-4 h-4 text-amber-400" />
                Tariff Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-800/90 px-3 py-2 safe-area-pb">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative cursor-pointer min-w-[56px] ${
                  isActive ? 'text-emerald-400 bg-emerald-500/10 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-emerald-400' : ''}`} />
                </div>
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative cursor-pointer min-w-[56px] ${
              isMoreOpen ? 'text-emerald-400 bg-emerald-500/10 font-bold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <div className="relative">
              <MoreHorizontal className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 w-2 h-2 rounded-full"></span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium">Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
}
