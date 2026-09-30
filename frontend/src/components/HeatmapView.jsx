import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Flame, AlertCircle, RefreshCw, Layers, ShieldAlert, LayoutGrid, Map } from 'lucide-react';
import { api } from '../services/api';

export default function HeatmapView() {
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState('all');
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'cards'
  
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circlesLayerRef = useRef(null);

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

  // Initialize Leaflet Map for Heatmap
  useEffect(() => {
    if (viewMode !== 'map' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.6000, 77.2100],
        zoom: 12,
        zoomControl: true,
        attributionControl: false
      });

      // Dark Matter CartoDB tiles for dark-mode glowing heatmap aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      L.control.attribution({ position: 'bottomright', prefix: '© OpenStreetMap & CartoDB' }).addTo(map);

      const circlesLayer = L.layerGroup().addTo(map);
      circlesLayerRef.current = circlesLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [viewMode]);

  // Update circles & pins when filtered points change
  useEffect(() => {
    if (!mapInstanceRef.current || !circlesLayerRef.current) return;

    circlesLayerRef.current.clearLayers();

    filteredPoints.forEach((pt) => {
      if (!pt.lat || !pt.lng) return;

      const isHighRisk = pt.intensity >= 0.8;
      const radiusMeters = isHighRisk ? 500 : 320;
      const color = isHighRisk ? '#f43f5e' : '#f59e0b';

      // 1. Semi-transparent intensity circle buffer
      const circle = L.circle([pt.lat, pt.lng], {
        radius: radiusMeters,
        color: color,
        fillColor: color,
        fillOpacity: isHighRisk ? 0.35 : 0.22,
        weight: 1.5
      });

      // 2. Custom flame pin marker
      const flameHtml = `
        <div class="relative flex items-center justify-center w-8 h-8 cursor-pointer">
          ${isHighRisk ? '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-60"></span>' : ''}
          <div class="relative inline-flex rounded-full h-7 w-7 ${isHighRisk ? 'bg-rose-600' : 'bg-amber-500'} text-white items-center justify-center shadow-lg border border-white text-xs">
            🔥
          </div>
        </div>
      `;

      const flameIcon = L.divIcon({
        className: 'custom-flame-pin',
        html: flameHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([pt.lat, pt.lng], { icon: flameIcon });

      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px; min-width: 190px;">
          <div style="font-size: 10px; font-weight: 800; color: ${isHighRisk ? '#f43f5e' : '#d97706'}; text-transform: uppercase;">
            ${isHighRisk ? 'CRITICAL HOTSPOT DENSITY' : 'MODERATE DENSITY'}
          </div>
          <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 3px 0 1px 0;">
            ${pt.label}
          </h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">${pt.ward}</p>
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; background: #f8fafc; padding: 4px 6px; border-radius: 6px;">
            <span>Intensity Score:</span>
            <span style="color: ${color};">${(pt.intensity * 100).toFixed(0)}%</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      circle.bindPopup(popupHtml);

      circle.addTo(circlesLayerRef.current);
      marker.addTo(circlesLayerRef.current);
    });

  }, [filteredPoints, viewMode]);

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

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-rose-800/60 backdrop-blur-md">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === 'map'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-rose-200/80 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>GIS Heatmap</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                viewMode === 'cards'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-rose-200/80 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Card Grid</span>
            </button>
          </div>

          <button
            onClick={loadHeatmap}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Ward Filter Bar */}
      <div className="p-4 rounded-2xl glass-panel bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Filter Heatmap by Ward Area:</span>
        <select
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200"
        >
          <option value="all">All City Wards ({heatmapPoints.length} Hotspots)</option>
          <option value="Ward 14 - Connaught Place">Ward 14 - Connaught Place</option>
          <option value="Ward 08 - South Extension">Ward 08 - South Extension</option>
          <option value="Ward 02 - Hauz Khas">Ward 02 - Hauz Khas</option>
          <option value="Ward 22 - Noida Sector 62">Ward 22 - Noida Sector 62</option>
        </select>
      </div>

      {/* Visual Canvas Heatmap Simulation: Interactive Leaflet Map vs Cards */}
      {viewMode === 'map' ? (
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 h-[560px]">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Map Legend Overlay */}
          <div className="absolute top-4 right-4 z-10 p-3 rounded-2xl glass-panel bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md text-xs space-y-2 max-w-[210px] text-white">
            <div className="flex items-center space-x-1.5 pb-1 border-b border-slate-800">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-extrabold">Hotspot Intensity</span>
            </div>
            <div className="space-y-1.5 text-[11px] font-bold">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500/40 border border-rose-500"></span>
                <span>Critical Risk (&ge;80%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500/40 border border-amber-500"></span>
                <span>Moderate Density (50-79%)</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              Showing {filteredPoints.length} active risk zones across Delhi.
            </p>
          </div>
        </div>
      ) : (
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
      )}

    </div>
  );
}
