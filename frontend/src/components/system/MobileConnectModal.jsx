import React, { useState } from 'react';
import { useEnergy } from '../../context/EnergyContext';
import { X, Wifi, Smartphone, Laptop, Check, Copy, ExternalLink, ArrowRightLeft } from 'lucide-react';

export function MobileConnectModal({ isOpen, onClose }) {
  const { networkInfo, gatewayStatus } = useEnergy();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const mobileUrl = networkInfo?.mobileUrl || `http://192.168.1.42:5000`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Connect Mobile Device</h2>
            <p className="text-xs text-slate-400">Control appliances & view live charts from your smartphone</p>
          </div>
        </div>

        {/* Architecture flow badge */}
        <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 mb-5">
          <div className="flex items-center gap-1 font-medium text-emerald-400">
            <Laptop className="w-4 h-4" />
            <span>Laptop Server</span>
          </div>
          <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
          <div className="flex items-center gap-1 text-slate-400">
            <Wifi className="w-3.5 h-3.5 text-teal-400" />
            <span>Same Wi-Fi</span>
          </div>
          <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
          <div className="flex items-center gap-1 font-medium text-emerald-400">
            <Smartphone className="w-4 h-4" />
            <span>Mobile Client</span>
          </div>
        </div>

        {/* QR Code and Direct URL Container */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-5">
          
          {/* QR Code */}
          <div className="bg-white p-2.5 rounded-xl shadow-lg flex-shrink-0">
            {networkInfo?.qrCode ? (
              <img 
                src={networkInfo.qrCode} 
                alt="Mobile Connection QR Code" 
                className="w-36 h-36 rounded-lg object-contain"
              />
            ) : (
              <div className="w-36 h-36 flex items-center justify-center bg-slate-200 text-slate-600 text-xs text-center font-mono">
                Generating QR...
              </div>
            )}
          </div>

          {/* Instructions & Direct Link */}
          <div className="flex-1 space-y-3 text-left w-full">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Direct Network URL</span>
              <div className="flex items-center gap-1.5 mt-1 bg-slate-900 border border-slate-700/80 rounded-lg p-2 font-mono text-xs text-emerald-400 select-all">
                <span className="truncate">{mobileUrl}</span>
                <button
                  onClick={copyToClipboard}
                  title="Copy URL"
                  className="ml-auto p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Connect your phone to <strong className="text-emerald-300">Same Wi-Fi</strong>.</li>
              <li>Scan the QR code with phone camera or browser.</li>
              <li>Tapping switches on phone instantly triggers the virtual relay on the laptop!</li>
            </ol>
          </div>
        </div>

        {/* Gateway Diagnostics Details */}
        <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-lg bg-slate-800/40 border border-slate-800">
          <div>
            <span className="text-slate-400">Gateway Controller:</span>
            <span className="font-mono text-slate-200 ml-1.5">{gatewayStatus?.deviceId || 'ESP32-SIM-001'}</span>
          </div>
          <div>
            <span className="text-slate-400">Local Wi-Fi IP:</span>
            <span className="font-mono text-emerald-400 ml-1.5">{networkInfo?.localIp || '192.168.1.42'}</span>
          </div>
          <div>
            <span className="text-slate-400">Telemetry Protocol:</span>
            <span className="text-slate-200 ml-1.5">MQTT (1883) + WS</span>
          </div>
          <div>
            <span className="text-slate-400">Web Dashboard Port:</span>
            <span className="font-mono text-slate-200 ml-1.5">5000</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
