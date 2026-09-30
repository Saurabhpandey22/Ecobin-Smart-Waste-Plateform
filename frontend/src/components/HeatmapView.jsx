import React, { useState, useEffect } from 'react';
import { MapPin, Flame, AlertCircle, RefreshCw, Layers, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function HeatmapView() {
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState('all');

  useEffect(() => {
    loadHeatmap();
  }, []);

  const loadHeatmap = async () => {
    try {
      setLoading(true);
      const res = await api.getHeatmapData();
      if (res.success) {
        setHeatmapPoints(res.heatmapData || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPoints = selectedWard === 'all'
    ? heatmapPoints
    : heatmapPoints.filter(p => p.ward === selectedWard);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-amber-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-rose-800/40">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              MUNICIPAL DENSITY ANALYTICS
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300">
              🔥 HOTSPOT HEATMAP
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
            Waste Complaint & Overflow Heatmap
          </h1>
          <p className="text-xs sm:text-sm text-rose-200/80 mt-1">
            Visualizing high-density waste dumping zones, chronic overflow hotspots, & bin fill frequencies.
          </p>
        </div>

        <button
          onClick={loadHeatmap}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Hotspots</span>
        </button>
      </div>

      {/* Ward Filter Bar */}
      <div className="p-4 rounded-2xl glass-panel bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Filter Heatmap by Ward Area:</span>
        <select
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold"
        >
          <option value="all">All City Wards ({heatmapPoints.length} Hotspots)</option>
          <option value="Ward 14 - Connaught Place">Ward 14 - Connaught Place</option>
          <option value="Ward 08 - South Extension">Ward 08 - South Extension</option>
          <option value="Ward 02 - Hauz Khas">Ward 02 - Hauz Khas</option>
          <option value="Ward 22 - Noida Sector 62">Ward 22 - Noida Sector 62</option>
        </select>
      </div>

      {/* Visual Canvas Heatmap Simulation Grid */}
      <div className="p-6 rounded-3xl glass-panel bg-slate-900 text-white shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
          <span className="flex items-center space-x-1 font-bold">
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>Real-Time Hotspot Intensity Canvas</span>
          </span>
          <span>Red = High Risk (&gt;80%) | Yellow = Moderate Density</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {filteredPoints.map((pt) => (
            <div
              key={pt.id}
              className={`p-4 rounded-2xl border transition-all ${
                pt.intensity >= 0.8
                  ? 'bg-rose-950/40 border-rose-500/60 shadow-md shadow-rose-900/30'
                  : 'bg-amber-950/30 border-amber-500/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Flame className={`w-5 h-5 ${pt.intensity >= 0.8 ? 'text-rose-500 animate-bounce' : 'text-amber-400'}`} />
                  <div>
                    <span className="font-bold text-xs text-white block capitalize">{pt.label}</span>
                    <span className="text-[10px] text-slate-400">{pt.ward}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/10 text-white">
                  {(pt.intensity * 100).toFixed(0)}% Intensity
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
