import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Truck, Radio, AlertTriangle, Key, Check, Settings, Compass, Car, RefreshCw } from 'lucide-react';
import { loadGoogleMapsApi } from '../services/googleMapsLoader';

export default function CityBinsMap({ 
  bins = [], 
  onSelectBin, 
  onEmptyBin,
  onTriggerDump 
}) {
  const [mapEngine, setMapEngine] = useState('google'); // 'google' | 'leaflet'
  const [googleMapsReady, setGoogleMapsReady] = useState(false);
  const [googleMapsError, setGoogleMapsError] = useState(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(localStorage.getItem('ecobin_gmaps_key') || '');
  
  // DOM Refs
  const mapContainerRef = useRef(null);
  
  // Google Maps Instance Refs
  const googleMapInstanceRef = useRef(null);
  const googleMarkersRef = useRef([]);
  const googleInfoWindowRef = useRef(null);
  const googleTrafficLayerRef = useRef(null);

  // Leaflet Instance Refs
  const leafletMapInstanceRef = useRef(null);
  const leafletMarkersLayerRef = useRef(null);

  // Load Google Maps JavaScript API
  useEffect(() => {
    let isMounted = true;
    loadGoogleMapsApi(customApiKey)
      .then((gMaps) => {
        if (isMounted) {
          setGoogleMapsReady(true);
          setGoogleMapsError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Google Maps API load issue, fallback available:', err.message);
          setGoogleMapsError(err.message);
          // If Google Maps fails to load (e.g. offline), fallback seamlessly to Leaflet
          setMapEngine('leaflet');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [customApiKey]);

  // Clean up Leaflet on engine switch
  const destroyLeafletMap = () => {
    if (leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.remove();
      leafletMapInstanceRef.current = null;
      leafletMarkersLayerRef.current = null;
    }
  };

  // Clean up Google Maps markers
  const clearGoogleMarkers = () => {
    googleMarkersRef.current.forEach(m => m.setMap(null));
    googleMarkersRef.current = [];
  };

  // -------------------------------------------------------------
  // GOOGLE MAPS ENGINE INITIALIZATION & UPDATES
  // -------------------------------------------------------------
  useEffect(() => {
    if (mapEngine !== 'google' || !googleMapsReady || !window.google?.maps || !mapContainerRef.current) {
      return;
    }

    destroyLeafletMap();

    if (!googleMapInstanceRef.current) {
      const delhiCoords = { lat: 28.6139, lng: 77.2090 };
      
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: delhiCoords,
        zoom: 12,
        mapTypeId: 'roadmap',
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          position: window.google.maps.ControlPosition.TOP_LEFT
        },
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER
        },
        streetViewControl: true,
        streetViewControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM
        },
        fullscreenControl: true,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
        ]
      });

      googleMapInstanceRef.current = map;
      googleInfoWindowRef.current = new window.google.maps.InfoWindow();
      googleTrafficLayerRef.current = new window.google.maps.TrafficLayer();
    }

    // Toggle Traffic Layer
    if (googleTrafficLayerRef.current) {
      googleTrafficLayerRef.current.setMap(showTraffic ? googleMapInstanceRef.current : null);
    }

    // Render / update Google Maps Markers
    clearGoogleMarkers();

    const gMap = googleMapInstanceRef.current;
    const infoWindow = googleInfoWindowRef.current;

    // 1. Add Municipal Waste Truck Marker
    const truckMarker = new window.google.maps.Marker({
      position: { lat: 28.6180, lng: 77.2140 },
      map: gMap,
      title: 'Swachh Rapid Truck DL-01-A-402',
      label: {
        text: '🚚',
        fontSize: '22px'
      },
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 18,
        fillColor: '#0891b2',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      }
    });

    truckMarker.addListener('click', () => {
      infoWindow.setContent(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 180px;">
          <div style="font-size: 10px; font-weight: 800; color: #0891b2; text-transform: uppercase;">GOOGLE MAPS GIS DISPATCH</div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">Municipal Truck DL-01-A-402</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Driver: Rajesh Kumar (Officer)</div>
          <div style="font-size: 11px; color: #10b981; font-weight: 700; margin-top: 4px;">Status: In-Transit Route CP - Ward 14</div>
        </div>
      `);
      infoWindow.open(gMap, truckMarker);
    });

    googleMarkersRef.current.push(truckMarker);

    // 2. Add Bin Markers
    bins.forEach((b) => {
      if (!b.latitude || !b.longitude) return;

      const isOverflow = b.fill_percentage >= b.threshold_value;
      const isWarning = b.fill_percentage >= 50 && b.fill_percentage < b.threshold_value;
      const pinColor = isOverflow ? '#e11d48' : isWarning ? '#d97706' : '#059669';

      const binMarker = new window.google.maps.Marker({
        position: { lat: Number(b.latitude), lng: Number(b.longitude) },
        map: gMap,
        title: `${b.bin_code} (${b.fill_percentage}%)`,
        label: {
          text: `${b.fill_percentage}%`,
          color: '#ffffff',
          fontWeight: '900',
          fontSize: '10px'
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isOverflow ? 17 : 14,
          fillColor: pinColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5
        },
        animation: isOverflow ? window.google.maps.Animation.BOUNCE : null
      });

      binMarker.addListener('click', () => {
        const content = `
          <div style="font-family: system-ui, sans-serif; padding: 6px; min-width: 220px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 10px; font-weight: 800; color: ${pinColor}; text-transform: uppercase;">${b.bin_code}</span>
              <span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 9999px; ${isOverflow ? 'background: #ffe4e6; color: #e11d48;' : isWarning ? 'background: #fef3c7; color: #d97706;' : 'background: #d1fae5; color: #059669;'}">
                ${isOverflow ? 'CRITICAL OVERFLOW' : isWarning ? 'WARNING' : 'NORMAL'}
              </span>
            </div>
            <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 4px 0 2px 0;">${b.location_name}</h4>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0;">${b.ward_area}</p>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px; margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; margin-bottom: 4px;">
                <span>Fill Level:</span>
                <span style="color: ${pinColor};">${b.fill_percentage}% / ${b.threshold_value}% Limit</span>
              </div>
              <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 9999px; overflow: hidden;">
                <div style="width: ${Math.min(b.fill_percentage, 100)}%; height: 100%; background: ${pinColor};"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 4px;">
                <span>Battery: ${b.battery_level}%</span>
                <span>Google Maps API</span>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <button id="gmap-inspect-${b.id}" style="width: 100%; padding: 6px 4px; background: #059669; color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
                🔍 Inspect Logs
              </button>
              <button id="gmap-empty-${b.id}" style="width: 100%; padding: 6px 4px; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">
                🧹 Empty Bin
              </button>
            </div>
          </div>
        `;

        infoWindow.setContent(content);
        infoWindow.open(gMap, binMarker);

        setTimeout(() => {
          const btnInspect = document.getElementById(`gmap-inspect-${b.id}`);
          const btnEmpty = document.getElementById(`gmap-empty-${b.id}`);
          if (btnInspect) {
            btnInspect.onclick = () => { if (onSelectBin) onSelectBin(b); };
          }
          if (btnEmpty) {
            btnEmpty.onclick = () => { if (onEmptyBin) onEmptyBin(b.id); };
          }
        }, 100);
      });

      googleMarkersRef.current.push(binMarker);
    });

  }, [mapEngine, googleMapsReady, bins, showTraffic]);

  // -------------------------------------------------------------
  // LEAFLET MAP ENGINE INITIALIZATION (FALLBACK / ALTERNATIVE)
  // -------------------------------------------------------------
  useEffect(() => {
    if (mapEngine !== 'leaflet' || !mapContainerRef.current) return;

    // Reset google map ref
    googleMapInstanceRef.current = null;

    if (!leafletMapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.6000, 77.2100],
        zoom: 12,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      L.control.attribution({ position: 'bottomright', prefix: '© OpenStreetMap & CartoDB' }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      leafletMarkersLayerRef.current = markersLayer;
      leafletMapInstanceRef.current = map;

      // Add truck
      const truckHtml = `
        <div class="relative flex items-center justify-center w-10 h-10">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60"></span>
          <div class="relative inline-flex rounded-2xl h-9 w-9 bg-gradient-to-tr from-cyan-600 to-teal-500 text-white items-center justify-center shadow-xl border-2 border-white">
            🚚
          </div>
        </div>
      `;
      const truckIcon = L.divIcon({ className: 'custom-truck-pin', html: truckHtml, iconSize: [40, 40], iconAnchor: [20, 20] });
      L.marker([28.6180, 77.2140], { icon: truckIcon }).addTo(map);
    }

    if (leafletMarkersLayerRef.current) {
      leafletMarkersLayerRef.current.clearLayers();

      bins.forEach((b) => {
        if (!b.latitude || !b.longitude) return;
        const isOverflow = b.fill_percentage >= b.threshold_value;
        const isWarning = b.fill_percentage >= 50 && b.fill_percentage < b.threshold_value;

        const markerHtml = `
          <div class="relative flex items-center justify-center w-10 h-10 cursor-pointer">
            ${isOverflow ? '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-80"></span>' : ''}
            <div class="relative inline-flex rounded-2xl h-9 w-9 ${isOverflow ? 'bg-rose-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-600'} text-white font-black text-xs items-center justify-center shadow-2xl border-2 border-white">
              ${b.fill_percentage}%
            </div>
          </div>
        `;
        const customIcon = L.divIcon({ className: 'custom-bin-pin', html: markerHtml, iconSize: [40, 40], iconAnchor: [20, 20] });
        const marker = L.marker([b.latitude, b.longitude], { icon: customIcon });

        marker.bindPopup(`
          <div style="font-family: system-ui; padding: 4px; min-width: 200px;">
            <div style="font-size: 10px; font-weight: 800; color: #059669;">${b.bin_code}</div>
            <h4 style="font-size: 13px; font-weight: 800; margin: 2px 0;">${b.location_name}</h4>
            <p style="font-size: 11px; color: #64748b;">${b.ward_area}</p>
            <div style="font-size: 12px; font-weight: bold; margin: 4px 0;">Fill: ${b.fill_percentage}% / ${b.threshold_value}%</div>
          </div>
        `);
        marker.addTo(leafletMarkersLayerRef.current);
      });
    }

  }, [mapEngine, bins]);

  const handleSaveApiKey = () => {
    localStorage.setItem('ecobin_gmaps_key', customApiKey.trim());
    setShowKeyModal(false);
    window.location.reload();
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-900 h-[580px]">
      
      {/* Map Target Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left Engine Selector Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="flex items-center bg-white/95 dark:bg-slate-900/95 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md">
          <button
            onClick={() => setMapEngine('google')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              mapEngine === 'google'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-200" />
            <span>Google Maps API</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          <button
            onClick={() => setMapEngine('leaflet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              mapEngine === 'leaflet'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-200" />
            <span>OpenStreetMap</span>
          </button>
        </div>

        {mapEngine === 'google' && (
          <>
            {/* Live Traffic Toggle */}
            <button
              onClick={() => setShowTraffic(!showTraffic)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl backdrop-blur-md transition-all flex items-center space-x-1.5 border ${
                showTraffic
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
              }`}
              title="Toggle Live Delhi Traffic Flow"
            >
              <Car className="w-3.5 h-3.5" />
              <span>{showTraffic ? 'Traffic: ON' : 'Live Traffic'}</span>
            </button>

            {/* API Key Config Button */}
            <button
              onClick={() => setShowKeyModal(true)}
              className="p-2 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
              title="Configure Google Maps API Key"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Floating Map Legend & Control Overlay (Top Right) */}
      <div className="absolute top-4 right-4 z-10 p-3 rounded-2xl glass-panel bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-700/80 shadow-xl backdrop-blur-md text-xs space-y-2 max-w-[220px]">
        <div className="flex items-center space-x-1.5 pb-1 border-b border-slate-200 dark:border-slate-800">
          <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="font-extrabold text-slate-900 dark:text-slate-100">
            {mapEngine === 'google' ? 'Google Maps JS API' : 'CartoDB OpenStreetMap'}
          </span>
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
          Click any pin on Google Map to inspect telemetry logs or trigger 1-click clearance.
        </div>
      </div>

      {/* Bottom Floating Stats Pill */}
      <div className="absolute bottom-4 left-4 z-10 px-4 py-2 rounded-2xl glass-panel bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-700/80 shadow-xl backdrop-blur-md text-xs flex items-center space-x-3">
        <div className="flex items-center space-x-1.5">
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-800 dark:text-slate-200">{bins.length} Active IoT Nodes</span>
        </div>
        <div className="text-slate-300 dark:text-slate-700">|</div>
        <div className="text-slate-600 dark:text-slate-300">
          Critical: <strong className="text-rose-500">{bins.filter(b => b.fill_percentage >= b.threshold_value).length}</strong>
        </div>
        <div className="text-slate-300 dark:text-slate-700">|</div>
        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          {mapEngine === 'google' ? 'Google Maps JS Engine' : 'OSM Engine'}
        </span>
      </div>

      {/* Google Maps API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center space-x-2 text-blue-600">
              <Key className="w-5 h-5" />
              <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">Google Maps API Key</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your Google Cloud Maps JavaScript API Key below, or configure in <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">frontend/.env</code> as <code className="font-mono text-[10px]">VITE_GOOGLE_MAPS_API_KEY</code>.
            </p>
            <input
              type="text"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Key & Reload</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
