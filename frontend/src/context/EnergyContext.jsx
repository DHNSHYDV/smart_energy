import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const EnergyContext = createContext(null);

export function EnergyProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Real-time telemetry state
  const [telemetry, setTelemetry] = useState({
    deviceId: 'ESP32-SIM-001',
    gridVoltage: 230.0,
    totalActivePower: 0,
    totalCurrent: 0,
    systemPowerFactor: 0.95,
    totalEnergyTodayKwh: 0,
    estimatedCost: 0,
    carbonKg: 0,
    isPeakHour: false,
    tariffRate: 8.0,
    speedMultiplier: 1,
  });

  const [appliances, setAppliances] = useState([]);
  const [liveHistory, setLiveHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [gatewayStatus, setGatewayStatus] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [toastAlert, setToastAlert] = useState(null);

  // Determine backend URL dynamically based on current browser window
  const getBackendUrl = () => {
    const host = window.location.hostname;
    // If running under Vite dev on port 3000, target 5000
    if (window.location.port === '3000') {
      return `http://${host}:5000`;
    }
    // If served by express directly or same port
    return window.location.origin;
  };

  const backendUrl = getBackendUrl();

  // Initialize Socket.IO connection
  useEffect(() => {
    const s = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    s.on('connect', () => {
      console.log('[Socket.IO] Connected to Simulation Server:', s.id);
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      console.warn('[Socket.IO] Disconnected from Simulation Server');
      setIsConnected(false);
    });

    // Initial snapshot from server
    s.on('init:snapshot', (snapshot) => {
      if (snapshot.appliances) setAppliances(snapshot.appliances);
      if (snapshot.liveHistory) setLiveHistory(snapshot.liveHistory);
      if (snapshot.recommendations) setRecommendations(snapshot.recommendations);
      if (snapshot.recentAlerts) setAlerts(snapshot.recentAlerts);
      if (snapshot.esp32) setGatewayStatus(snapshot.esp32);
      if (snapshot.speedMultiplier) setSpeedMultiplier(snapshot.speedMultiplier);
      if (snapshot.isPaused !== undefined) setIsPaused(snapshot.isPaused);
    });

    // Real-time tick update (1-second interval)
    s.on('telemetry:update', (data) => {
      setTelemetry({
        deviceId: data.deviceId,
        gridVoltage: data.gridVoltage,
        totalActivePower: data.totalActivePower,
        totalCurrent: data.totalCurrent,
        systemPowerFactor: data.systemPowerFactor,
        totalEnergyTodayKwh: data.totalEnergyTodayKwh,
        estimatedCost: data.estimatedCost,
        carbonKg: data.carbonKg,
        isPeakHour: data.isPeakHour,
        tariffRate: data.tariffRate,
        speedMultiplier: data.speedMultiplier,
      });

      if (data.appliances) {
        setAppliances(data.appliances);
      }

      // Append to live rolling chart
      const timeLabel = new Date(data.timestamp).toLocaleTimeString('en-US', { hour12: false });
      setLiveHistory(prev => {
        const next = [...prev, {
          time: timeLabel,
          totalPower: data.totalActivePower,
          voltage: data.gridVoltage,
          current: data.totalCurrent,
          cost: data.estimatedCost
        }];
        return next.length > 30 ? next.slice(next.length - 30) : next;
      });
    });

    // Appliance state changed confirmation
    s.on('appliance:state_changed', (updatedApp) => {
      setAppliances(prev => prev.map(a => a.id === updatedApp.id ? { ...a, ...updatedApp } : a));
    });

    // New anomaly alert push notification
    s.on('alert:new', (alert) => {
      setAlerts(prev => [alert, ...prev]);
      setToastAlert(alert);
      // Auto-hide toast after 6 seconds
      setTimeout(() => setToastAlert(null), 6000);
    });

    // Recommendations update
    s.on('recommendations:update', (recs) => {
      setRecommendations(recs);
    });

    // Speed changed
    s.on('simulation:speed_changed', (newSpeed) => {
      setSpeedMultiplier(newSpeed);
    });

    // Reset done
    s.on('simulation:reset_done', () => {
      setLiveHistory([]);
      setAlerts([]);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [backendUrl]);

  // Fetch initial REST data (network IP, QR code, schedules)
  const fetchNetworkInfo = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/system/network`);
      const data = await res.json();
      if (data.success) {
        setNetworkInfo(data.data);
      }
    } catch (e) {
      console.warn('Network info fetch error:', e.message);
    }
  }, [backendUrl]);

  const fetchGatewayStatus = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/system/gateway`);
      const data = await res.json();
      if (data.success) {
        setGatewayStatus(data.data);
      }
    } catch (e) {
      console.warn('Gateway status fetch error:', e.message);
    }
  }, [backendUrl]);

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/schedules`);
      const data = await res.json();
      if (data.success) {
        setSchedules(data.data);
      }
    } catch (e) {
      console.warn('Schedules fetch error:', e.message);
    }
  }, [backendUrl]);

  useEffect(() => {
    fetchNetworkInfo();
    fetchGatewayStatus();
    fetchSchedules();
  }, [fetchNetworkInfo, fetchGatewayStatus, fetchSchedules]);

  // Action methods:
  const toggleAppliance = (id, targetState = null) => {
    // Optimistic UI update
    setAppliances(prev => prev.map(a => {
      if (a.id === id) {
        const nextState = targetState !== null ? targetState : !a.isOn;
        return { ...a, isOn: nextState };
      }
      return a;
    }));

    if (socket && isConnected) {
      socket.emit('appliance:toggle', { id, state: targetState });
    } else {
      // Fallback to REST
      fetch(`${backendUrl}/api/appliances/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: targetState })
      });
    }
  };

  const injectAnomaly = (id = 'AC001', isAnomaly = true) => {
    if (socket && isConnected) {
      socket.emit('simulation:inject_anomaly', { id, isAnomaly });
    } else {
      fetch(`${backendUrl}/api/simulation/anomaly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applianceId: id, isAnomaly })
      });
    }
  };

  const setSimSpeed = (speed) => {
    setSpeedMultiplier(speed);
    if (socket && isConnected) {
      socket.emit('simulation:set_speed', speed);
    } else {
      fetch(`${backendUrl}/api/simulation/speed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speed })
      });
    }
  };

  const togglePause = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    fetch(`${backendUrl}/api/simulation/${nextPaused ? 'pause' : 'resume'}`, { method: 'POST' });
  };

  const resetSimulation = () => {
    if (socket && isConnected) {
      socket.emit('simulation:reset');
    } else {
      fetch(`${backendUrl}/api/simulation/reset`, { method: 'POST' });
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await fetch(`${backendUrl}/api/alerts/${alertId}/resolve`, { method: 'POST' });
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_resolved: 1 } : a));
    } catch (e) {
      console.error('Resolve alert error:', e.message);
    }
  };

  const addSchedule = async (scheduleData) => {
    try {
      const res = await fetch(`${backendUrl}/api/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });
      const data = await res.json();
      if (data.success) {
        fetchSchedules();
        return true;
      }
    } catch (e) {
      console.error('Add schedule error:', e.message);
    }
    return false;
  };

  const toggleSchedule = async (id) => {
    try {
      await fetch(`${backendUrl}/api/schedules/${id}/toggle`, { method: 'POST' });
      fetchSchedules();
    } catch (e) {
      console.error('Toggle schedule error:', e.message);
    }
  };

  const deleteSchedule = async (id) => {
    try {
      await fetch(`${backendUrl}/api/schedules/${id}`, { method: 'DELETE' });
      fetchSchedules();
    } catch (e) {
      console.error('Delete schedule error:', e.message);
    }
  };

  const value = {
    backendUrl,
    isConnected,
    activeTab,
    setActiveTab,
    telemetry,
    appliances,
    liveHistory,
    alerts,
    recommendations,
    schedules,
    gatewayStatus,
    networkInfo,
    isPaused,
    speedMultiplier,
    toastAlert,
    setToastAlert,
    toggleAppliance,
    injectAnomaly,
    setSimSpeed,
    togglePause,
    resetSimulation,
    resolveAlert,
    addSchedule,
    toggleSchedule,
    deleteSchedule,
    refreshSchedules: fetchSchedules,
  };

  return (
    <EnergyContext.Provider value={value}>
      {children}
    </EnergyContext.Provider>
  );
}

export function useEnergy() {
  const ctx = useContext(EnergyContext);
  if (!ctx) {
    throw new Error('useEnergy must be used within an EnergyProvider');
  }
  return ctx;
}
