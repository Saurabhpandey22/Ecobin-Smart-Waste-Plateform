import React, { useState, useEffect } from 'react';
import { 
  Radio, BatteryCharging, AlertTriangle, RefreshCw, Play, Pause, 
  Trash2, TrendingUp, Sliders, MapPin, CheckCircle, ShieldAlert, X,
  LayoutGrid, Map
} from 'lucide-react';
import translations from '../utils/i18n';
import { api, socket } from '../services/api';
import CityBinsMap from './CityBinsMap';

export default function SmartBinsView({ user, lang }) {
  const t = translations[lang] || translations.en;
  
  const [bins, setBins] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [simulatorRunning, setSimulatorRunning] = useState(true);
  const [selectedBin, setSelectedBin] = useState(null);
  const [binLogs, setBinLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newThreshold, setNewThreshold] = useState(80);

  useEffect(() => {
    loadBinsData();

    const handleBinUpdate = (updatedBin) => {
      setBins(prev => prev.map(b => b.id === updatedBin.id ? { ...b, ...updatedBin } : b));
    };

    socket.on('bin_updated', handleBinUpdate);

    return () => {
      socket.off('bin_updated', handleBinUpdate);
    };
  }, []);

  const loadBinsData = async () => {
    try {
      setLoading(true);
      const res = await api.getBins();
      if (res.success) {
        setBins(res.bins || []);
        setSimulatorRunning(res.simulatorRunning);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBinDetail = async (bin) => {
    setSelectedBin(bin);
    setNewThreshold(bin.threshold_value);
    try {
      const res = await api.getBinById(bin.id);
      if (res.success) {
        setBinLogs(res.telemetryLogs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSimulator = async () => {
    try {
      const res = await api.toggleSimulator();
      if (res.success) {
        setSimulatorRunning(res.simulatorRunning);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTriggerDump = async (binId) => {
    try {
      const res = await api.triggerDump(binId, 35);
      if (res.success) {
        loadBinsData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEmptyBin = async (binId) => {
    try {
      const res = await api.emptyBin(binId);
      if (res.success) {
        loadBinsData();
        if (selectedBin?.id === binId) setSelectedBin(null);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateThreshold = async (binId) => {
    try {
      const res = await api.updateThreshold(binId, newThreshold);
      if (res.success) {
        alert(res.message);
        loadBinsData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & IoT Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950 to-teal-900 text-white shadow-xl border border-cyan-800/40">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
              ESP32 ULTRASONIC SENSORS
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">
              ⚡ LIVE TELEMETRY STREAM
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
            IoT Smart Dustbins Network
          </h1>
          <p className="text-xs sm:text-sm text-cyan-200/80 mt-1">
            Real-time ultrasonic fill monitoring, battery health, threshold alerts, & route dispatch.
          </p>
        </div>

        {/* View Mode & Telemetry Simulator Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* View Mode Toggle: Grid Cards vs Live City Map */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-2xl border border-cyan-800/60 backdrop-blur-md shadow-inner">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === 'grid'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'text-cyan-200/80 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === 'map'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'text-cyan-200/80 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Live City Map</span>
            </button>
          </div>

          <button
            onClick={handleToggleSimulator}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md ${
              simulatorRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {simulatorRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline">{simulatorRunning ? 'Pause Sim' : 'Start Sim'}</span>
          </button>
        </div>
      </div>

      {/* View Mode Switching Canvas: Interactive Map vs Responsive Cards Grid */}
      {viewMode === 'map' ? (
        <CityBinsMap
          bins={bins}
          onSelectBin={handleOpenBinDetail}
          onEmptyBin={handleEmptyBin}
          onTriggerDump={handleTriggerDump}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bins.map((b) => {
            const isOverflow = b.fill_percentage >= b.threshold_value;
            const isWarning = b.fill_percentage >= 50 && b.fill_percentage < b.threshold_value;

            return (
              <div
                key={b.id}
                className={`p-5 rounded-3xl glass-panel bg-white/90 dark:bg-slate-800/90 shadow-sm border transition-all duration-200 hover:shadow-lg ${
                  isOverflow
                    ? 'border-rose-400 dark:border-rose-600/60 ring-2 ring-rose-500/20'
                    : isWarning
                    ? 'border-amber-300 dark:border-amber-700/60'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">
                      {b.bin_code}
                    </span>
                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-0.5 leading-snug">
                      {b.location_name}
                    </h4>
                    <span className="text-xs text-slate-400 flex items-center space-x-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{b.ward_area}</span>
                    </span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase ${
                    isOverflow
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                      : isWarning
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {isOverflow ? 'Overflow Risk' : isWarning ? 'Warning' : 'Normal'}
                  </span>
                </div>

                {/* Animated Fill Bar Gauge */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-extrabold">
                    <span className="text-slate-500 dark:text-slate-400">Fill Level</span>
                    <span className={isOverflow ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-900 dark:text-slate-100'}>
                      {b.fill_percentage}% (Limit: {b.threshold_value}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverflow
                          ? 'bg-gradient-to-r from-rose-500 to-red-600'
                          : isWarning
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                          : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                      }`}
                      style={{ width: `${Math.min(100, b.fill_percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Battery & Last Updated */}
                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <span className="flex items-center space-x-1 font-semibold text-slate-600 dark:text-slate-300">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Battery: {b.battery_level}%</span>
                  </span>
                  <span>{new Date(b.last_updated).toLocaleTimeString()}</span>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleOpenBinDetail(b)}
                    className="py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 font-semibold text-[11px] text-slate-700 dark:text-slate-200"
                  >
                    Trend
                  </button>
                  <button
                    onClick={() => handleTriggerDump(b.id)}
                    className="py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold text-[11px] hover:bg-amber-100"
                    title="Simulate Dump (+35% fill)"
                  >
                    + Dump
                  </button>
                  <button
                    onClick={() => handleEmptyBin(b.id)}
                    className="py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] hover:bg-emerald-100"
                  >
                    Empty
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Bin Detail Modal with Trend Chart */}
      {selectedBin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold text-cyan-600 uppercase">{selectedBin.bin_code}</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{selectedBin.location_name}</h3>
              </div>
              <button onClick={() => setSelectedBin(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Threshold Editor */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Set Alert Threshold (%)</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="20"
                  max="95"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  className="w-16 px-2 py-1 text-xs rounded-lg border text-center font-bold bg-white dark:bg-slate-800"
                />
                <button
                  onClick={() => handleUpdateThreshold(selectedBin.id)}
                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Historical Trend Graph Preview */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Telemetry Fill Trend</span>
                </span>
                <span>Last 30 updates</span>
              </div>

              <div className="h-32 flex items-end justify-between gap-1 pt-4">
                {binLogs.slice(-15).map((log, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group">
                    <div
                      className={`w-full rounded-t transition-all ${
                        log.fill_percentage >= 80 ? 'bg-rose-500' : 'bg-cyan-400'
                      }`}
                      style={{ height: `${Math.max(10, log.fill_percentage)}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleEmptyBin(selectedBin.id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500"
              >
                Mark Emptied
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
