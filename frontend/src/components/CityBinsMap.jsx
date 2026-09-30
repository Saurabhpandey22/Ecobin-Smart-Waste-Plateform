import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Truck, Radio, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function CityBinsMap({ 
  bins = [], 
  onSelectBin, 
  onEmptyBin,
  onTriggerDump 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on Central Delhi (Connaught Place / South Delhi corridor)
      const map = L.map(mapContainerRef.current, {
        center: [28.6000, 77.2100],
        zoom: 12,
        zoomControl: true,
        attributionControl: false
      });

      // Ultra-clean CartoDB Voyager tiles (crisp & modern, works great in both light & dark)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: '© OpenStreetMap & CartoDB' }).addTo(map);

      // Create a layer group for bin markers
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Add a simulated active Municipal Waste Truck marker
      const truckHtml = `
        <div class="relative flex items-center justify-center w-10 h-10">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60"></span>
          <div class="relative inline-flex rounded-2xl h-9 w-9 bg-gradient-to-tr from-cyan-600 to-teal-500 text-white items-center justify-center shadow-xl border-2 border-white">
            🚚
          </div>
        </div>
      `;
      const truckIcon = L.divIcon({
        className: 'custom-truck-pin',
        html: truckHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const truckMarker = L.marker([28.6180, 77.2140], { icon: truckIcon }).addTo(map);
      truckMarker.bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; min-width: 180px;">
          <div style="font-size: 10px; font-weight: 800; color: #0891b2; text-transform: uppercase;">MUNICIPAL SWACHH TRUCK</div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">DL-01-GA-402 (Active Dispatch)</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Assigned: Rajesh Kumar</div>
          <div style="font-size: 11px; color: #10b981; font-weight: 700; margin-top: 4px;">Status: In-Transit to Ward 14</div>
        </div>
      `);
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers whenever bins telemetry changes in real time
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    bins.forEach((b) => {
      if (!b.latitude || !b.longitude) return;

      const isOverflow = b.fill_percentage >= b.threshold_value;
      const isWarning = b.fill_percentage >= 50 && b.fill_percentage < b.threshold_value;

      let markerHtml = '';
      if (isOverflow) {
        markerHtml = `
          <div class="relative flex items-center justify-center w-11 h-11 cursor-pointer">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-80"></span>
            <div class="relative inline-flex rounded-2xl h-10 w-10 bg-gradient-to-tr from-rose-600 to-red-500 text-white font-black text-xs items-center justify-center shadow-2xl border-2 border-white">
              ${b.fill_percentage}%
            </div>
          </div>
        `;
      } else if (isWarning) {
        markerHtml = `
          <div class="relative flex items-center justify-center w-10 h-10 cursor-pointer">
            <div class="relative inline-flex rounded-2xl h-9 w-9 bg-gradient-to-tr from-amber-500 to-yellow-500 text-slate-950 font-black text-xs items-center justify-center shadow-xl border-2 border-white">
              ${b.fill_percentage}%
            </div>
          </div>
        `;
      } else {
        markerHtml = `
          <div class="relative flex items-center justify-center w-9 h-9 cursor-pointer">
            <div class="relative inline-flex rounded-2xl h-8 w-8 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-[11px] items-center justify-center shadow-lg border-2 border-white">
              ${b.fill_percentage}%
            </div>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: 'custom-bin-pin',
        html: markerHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([b.latitude, b.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 6px; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 10px; font-weight: 800; color: #059669; text-transform: uppercase;">${b.bin_code}</span>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; ${isOverflow ? 'background: #ffe4e6; color: #e11d48;' : isWarning ? 'background: #fef3c7; color: #d97706;' : 'background: #d1fae5; color: #059669;'}">
              ${isOverflow ? 'OVERFLOW ALARM' : isWarning ? 'WARNING' : 'NORMAL'}
            </span>
          </div>

          <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 4px 0 2px 0; line-height: 1.2;">
            ${b.location_name}
          </h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0;">${b.ward_area}</p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; margin-bottom: 4px;">
              <span style="color: #475569;">Fill Level:</span>
              <span style="color: ${isOverflow ? '#e11d48' : '#0f172a'};">${b.fill_percentage}% / ${b.threshold_value}% Limit</span>
            </div>
            <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 9999px; overflow: hidden;">
              <div style="width: ${Math.min(b.fill_percentage, 100)}%; height: 100%; background: ${isOverflow ? '#e11d48' : isWarning ? '#f59e0b' : '#10b981'};"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 4px;">
              <span>Battery: ${b.battery_level}%</span>
              <span>Updated: Real-Time</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
            <button id="btn-inspect-${b.id}" style="width: 100%; padding: 6px 4px; background: #059669; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
              🔍 Inspect Logs
            </button>
            <button id="btn-empty-${b.id}" style="width: 100%; padding: 6px 4px; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
              🧹 Empty Bin
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btnInspect = document.getElementById(`btn-inspect-${b.id}`);
        const btnEmpty = document.getElementById(`btn-empty-${b.id}`);

        if (btnInspect) {
          btnInspect.onclick = () => {
            if (onSelectBin) onSelectBin(b);
          };
        }
        if (btnEmpty) {
          btnEmpty.onclick = () => {
            if (onEmptyBin) onEmptyBin(b.id);
          };
        }
      });

      marker.addTo(markersLayerRef.current);
    });

  }, [bins]);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-900 h-[560px]">
      
      {/* Map Target Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Legend & Control Overlay */}
      <div className="absolute top-4 right-4 z-10 p-3 rounded-2xl glass-panel bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xl backdrop-blur-md text-xs space-y-2 max-w-[220px]">
        <div className="flex items-center space-x-1.5 pb-1 border-b border-slate-200 dark:border-slate-800">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-extrabold text-slate-900 dark:text-slate-100">Live GIS City Map</span>
        </div>

        <div className="space-y-1.5 text-[11px] font-bold">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-slate-700 dark:text-slate-300">Overflow (&ge;80% Limit)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-700 dark:text-slate-300">Warning (50% - 79%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-700 dark:text-slate-300">Normal (&lt;50% Fill)</span>
          </div>
          <div className="flex items-center space-x-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-base leading-none">🚚</span>
            <span className="text-cyan-600 dark:text-cyan-400">Sanitation Truck</span>
          </div>
        </div>

        <div className="pt-1 text-[10px] text-slate-400 font-semibold italic">
          Click any pin on the map to view logs or trigger municipal action.
        </div>
      </div>

      {/* Bottom Floating Stats Pill */}
      <div className="absolute bottom-4 left-4 z-10 px-4 py-2 rounded-2xl glass-panel bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xl backdrop-blur-md text-xs flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-800 dark:text-slate-200">{bins.length} Active IoT Nodes</span>
        </div>
        <div className="text-slate-300 dark:text-slate-700">|</div>
        <div className="text-slate-600 dark:text-slate-300">
          Critical: <strong className="text-rose-500">{bins.filter(b => b.fill_percentage >= b.threshold_value).length}</strong>
        </div>
      </div>

    </div>
  );
}
