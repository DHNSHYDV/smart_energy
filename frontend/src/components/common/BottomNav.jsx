import React from 'react';
import { useEnergy } from '../../context/EnergyContext';
import { 
  LayoutDashboard, 
  Sliders, 
  BarChart3, 
  Bell, 
  CalendarClock 
} from 'lucide-react';

export function BottomNav() {
  const { activeTab, setActiveTab, alerts } = useEnergy();
  const unreadAlerts = alerts.filter(a => !a.is_resolved).length;

  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'appliances', label: 'Devices', icon: Sliders },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadAlerts },
    { id: 'schedules', label: 'Schedule', icon: CalendarClock },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-emerald-400' : ''}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1">{item.label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-0.5 shadow-sm shadow-emerald-400"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
