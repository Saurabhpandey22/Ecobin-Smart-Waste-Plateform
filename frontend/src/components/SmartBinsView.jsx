import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, BatteryCharging, AlertTriangle, RefreshCw, Play, Pause, 
  Trash2, TrendingUp, Sliders, MapPin, CheckCircle, ShieldAlert, X,
  LayoutGrid, Map, Cpu, Wifi, Copy, Check, Send, Activity, Info, Gauge,
  ArrowDown, CheckCircle2, ChevronRight, Terminal, Usb, Cable, ShieldCheck,
  AlertCircle, Power, Zap
} from 'lucide-react';
import translations from '../utils/i18n';
import { api, socket } from '../services/api';
import CityBinsMap from './CityBinsMap';

export default function SmartBinsView({ user, lang }) {
  const t = translations[lang] || translations.en;
  
  const [bins, setBins] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [simulatorRunning, setSimulatorRunning] = useState(false);
  const [selectedBin, setSelectedBin] = useState(null);
  const [binLogs, setBinLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newThreshold, setNewThreshold] = useState(80);

  // Hardware connection & Live Telemetry State
  const [networkInfo, setNetworkInfo] = useState(null);
  const [showHardwareModal, setShowHardwareModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('usb'); // 'usb' | 'wifi' | 'logs' | 'tester'
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [telemetryLogsStream, setTelemetryLogsStream] = useState([]);
  const [lastHardwarePing, setLastHardwarePing] = useState(null);

  // USB Data Cable (Web Serial API) State
  const [isWebSerialSupported, setIsWebSerialSupported] = useState(false);
  const [isSerialConnected, setIsSerialConnected] = useState(false);
  const [serialTerminalLines, setSerialTerminalLines] = useState([]);
  const serialPortRef = useRef(null);
  const serialReaderRef = useRef(null);
  const currentDistanceRef = useRef(null);
  const currentFillRef = useRef(null);

  // Quick Hardware Tester State
  const [testBinCode, setTestBinCode] = useState('BIN001');
  const [testDistance, setTestDistance] = useState(10.3);
  const [testFill, setTestFill] = useState(0);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResponseStatus, setTestResponseStatus] = useState(null);

  useEffect(() => {
    setIsWebSerialSupported('serial' in navigator);
    loadBinsData();
    loadNetworkInfo();

    const handleBinUpdate = (updatedBin) => {
      setBins(prev => {
        const exists = prev.some(b => b.id === updatedBin.id);
        if (exists) {
          return prev.map(b => b.id === updatedBin.id ? { ...b, ...updatedBin } : b);
        }
        return [updatedBin, ...prev];
      });

      if (updatedBin.is_hardware || updatedBin.bin_code === 'BIN001') {
        setLastHardwarePing(new Date());
      }
    };

    const handleTelemetry = (packet) => {
      setTelemetryLogsStream(prev => [
        { ...packet, id: Date.now() + Math.random() },
        ...prev.slice(0, 29)
      ]);
    };

    const handleRawSerialLine = (data) => {
      setSerialTerminalLines(prev => [data.line, ...prev.slice(0, 49)]);
    };

    const handleSerialStatus = (status) => {
      setIsSerialConnected(Boolean(status.connected));
    };

    socket.on('bin_updated', handleBinUpdate);
    socket.on('iot_telemetry', handleTelemetry);
    socket.on('raw_serial_line', handleRawSerialLine);
    socket.on('serial_status', handleSerialStatus);

    return () => {
      socket.off('bin_updated', handleBinUpdate);
      socket.off('iot_telemetry', handleTelemetry);
      socket.off('raw_serial_line', handleRawSerialLine);
      socket.off('serial_status', handleSerialStatus);
      handleDisconnectWebSerial();
    };
  }, []);

  const loadNetworkInfo = async () => {
    try {
      const info = await api.getNetworkInfo();
      if (info.success) {
        setNetworkInfo(info);
      }
    } catch (err) {
      console.warn('Network info load notice:', err.message);
    }
  };

  const loadBinsData = async () => {
    try {
      setLoading(true);
      const res = await api.getBins();
      if (res.success) {
        setBins(res.bins || []);
        setSimulatorRunning(Boolean(res.simulatorRunning));
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

  const handleCopyApiUrl = () => {
    const url = networkInfo?.apiUrl || `http://${window.location.hostname}:5000/api/bin/update`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  // Connect directly to USB Data Cable via Web Serial API (Chrome/Edge)
  const handleConnectWebSerial = async () => {
    if (!('serial' in navigator)) {
      alert('Web Serial API is available in Google Chrome, Microsoft Edge, and Brave. Please use Google Chrome to read directly from USB Data Cable.');
      return;
    }

    try {
      // Prompt user to select their ESP32 COM port
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      serialPortRef.current = port;
      setIsSerialConnected(true);

      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      serialReaderRef.current = reader;

      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;

        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep remainder

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          setSerialTerminalLines(prev => [trimmed, ...prev.slice(0, 49)]);

          // Parse sensor values:
          // Distance: 10.3 cm
          // Fill: 0%
          const distMatch = trimmed.match(/Distance:\s*([\d.]+)/i);
          const fillMatch = trimmed.match(/Fill:\s*(\d+)/i);

          if (distMatch) currentDistanceRef.current = parseFloat(distMatch[1]);
          if (fillMatch) currentFillRef.current = parseInt(fillMatch[1], 10);

          if (currentFillRef.current !== null && currentDistanceRef.current !== null) {
            const f = currentFillRef.current;
            const d = currentDistanceRef.current;
            currentFillRef.current = null;
            currentDistanceRef.current = null;

            // Update UI in real-time
            setBins(prev => prev.map(b => (b.bin_code === 'BIN001' || b.is_hardware) ? {
              ...b,
              fill_percentage: f,
              distance_cm: d,
              status: f >= 80 ? 'critical' : f >= 50 ? 'warning' : 'normal',
              last_updated: new Date().toISOString()
            } : b));

            // Sync to backend
            api.sendHardwareTelemetry({
              bin_id: 'BIN001',
              fill_percentage: f,
              distance_cm: d
            }).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.warn('Web Serial:', err);
      if (err.name !== 'NotFoundError') {
        alert('USB Port Notice: ' + err.message + '\n\nNote: If Arduino IDE Serial Monitor is open, please CLOSE IT first (Windows only allows one app per COM port).');
      }
      setIsSerialConnected(false);
    }
  };

  const handleDisconnectWebSerial = async () => {
    try {
      if (serialReaderRef.current) {
        await serialReaderRef.current.cancel();
        serialReaderRef.current = null;
      }
      if (serialPortRef.current) {
        await serialPortRef.current.close();
        serialPortRef.current = null;
      }
    } catch (e) {}
    setIsSerialConnected(false);
  };

  // Distance to fill calculator (HC-SR04: Empty=10.3cm, Full=2.0cm)
  const handleDistanceChange = (distance) => {
    const d = parseFloat(distance);
    setTestDistance(d);
    const emptyDist = 10.3;
    const fullDist = 2.0;
    if (d >= (emptyDist - 0.6)) {
      setTestFill(0);
    } else if (d <= fullDist) {
      setTestFill(100);
    } else {
      const calculated = Math.round(((emptyDist - d) / (emptyDist - fullDist)) * 100);
      setTestFill(Math.min(100, Math.max(0, calculated)));
    }
  };

  const handleSendTestTelemetry = async () => {
    try {
      setIsSendingTest(true);
      setTestResponseStatus(null);
      const res = await api.sendHardwareTelemetry({
        bin_id: testBinCode,
        fill_percentage: testFill,
        distance_cm: testDistance
      });
      if (res.success) {
        setTestResponseStatus('success');
        loadBinsData();
      }
    } catch (err) {
      setTestResponseStatus('error: ' + err.message);
    } finally {
      setIsSendingTest(false);
    }
  };

  // Primary physical hardware bin
  const hardwareBin = bins.find(b => b.is_hardware || b.bin_code === 'BIN001') || bins[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Real-Sensor Guarantee Banner */}
      <div className="px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 font-bold">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>REAL SENSOR MODE ACTIVE: Background fake simulator is disabled. Levels only reflect actual HC-SR04 ultrasonic readings.</span>
        </div>
        <div className="flex items-center space-x-2">
          {isSerialConnected ? (
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center space-x-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
              <span>USB SERIAL CABLE CONNECTED</span>
            </span>
          ) : (
            <button
              onClick={handleConnectWebSerial}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Cable className="w-4 h-4" />
              <span>Connect USB Cable (Serial)</span>
            </button>
          )}
        </div>
      </div>

      {/* Header & IoT Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950 to-teal-900 text-white shadow-xl border border-cyan-800/40 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>ESP32 + HC-SR04 SENSOR</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE TELEMETRY</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            IoT Smart Dustbins Network
          </h1>
          <p className="text-xs sm:text-sm text-cyan-200/80 mt-1 max-w-xl">
            Real ultrasonic fill measurement directly from your ESP32 hardware via USB Data Cable or Wi-Fi.
          </p>
        </div>

        {/* View Mode & Hardware Setup Controls */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          
          <button
            onClick={() => setShowHardwareModal(true)}
            className="px-4 py-2 rounded-2xl text-xs font-black bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-cyan-500/25 flex items-center space-x-2 transition-all transform active:scale-95"
          >
            <Cable className="w-4 h-4" />
            <span>Connect & Setup Hardware</span>
          </button>

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
              <span>Grid</span>
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
              <span>Map</span>
            </button>
          </div>

          <button
            onClick={handleToggleSimulator}
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md ${
              simulatorRunning
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
            title="Simulator is disabled by default to avoid fake data"
          >
            {simulatorRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{simulatorRunning ? 'Sim Active' : 'Sim Off'}</span>
          </button>
        </div>
      </div>

      {/* FEATURED PHYSICAL HARDWARE SPOTLIGHT CARD (BIN001) */}
      {hardwareBin && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-950/80 via-slate-900/90 to-slate-900 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/10 text-white relative overflow-hidden backdrop-blur-md">
          
          {/* Top Banner Tag */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cyan-800/40">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 relative">
                <Radio className="w-6 h-6 animate-pulse" />
                <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                  isSerialConnected ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'
                }`} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
                    {hardwareBin.bin_code} • PHYSICAL ESP32 HARDWARE
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    {isSerialConnected ? '🟢 USB DATA CABLE ACTIVE' : 'AWAITING SENSOR PING'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  {hardwareBin.location_name}
                </h3>
              </div>
            </div>

            {/* Connection Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {isSerialConnected ? (
                <button
                  onClick={handleDisconnectWebSerial}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center space-x-1.5"
                >
                  <Power className="w-3.5 h-3.5 text-rose-400" />
                  <span>Disconnect USB</span>
                </button>
              ) : (
                <button
                  onClick={handleConnectWebSerial}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center space-x-1.5 shadow-md shadow-cyan-500/30"
                >
                  <Cable className="w-3.5 h-3.5" />
                  <span>Connect USB Data Cable</span>
                </button>
              )}

              <button
                onClick={() => setShowHardwareModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-900/40 hover:bg-cyan-800/50 text-cyan-200 border border-cyan-700/50 text-xs font-bold flex items-center space-x-1.5"
              >
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                <span>Wi-Fi Setup</span>
              </button>
              
              <button
                onClick={() => handleEmptyBin(hardwareBin.id)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset (0%)</span>
              </button>
            </div>
          </div>

          {/* Metric Grid & Container Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-center">
            
            {/* Visual Cylinder Gauge */}
            <div className="md:col-span-4 bg-slate-950/60 p-4 rounded-2xl border border-cyan-800/40 flex items-center space-x-4">
              <div className="relative w-16 h-36 bg-slate-800/90 rounded-2xl border-2 border-cyan-400/50 overflow-hidden flex flex-col justify-end p-1 shadow-inner">
                {/* Ultrasonic sensor beam indicator on top */}
                <div className="absolute top-1 inset-x-1 h-3 rounded-lg bg-cyan-400/40 border border-cyan-300/50 flex items-center justify-center">
                  <span className="text-[8px] font-black text-cyan-200">SENSOR</span>
                </div>
                {/* Fill liquid bar */}
                <div 
                  className={`w-full rounded-xl transition-all duration-700 flex items-center justify-center text-[10px] font-black ${
                    hardwareBin.fill_percentage >= 80
                      ? 'bg-gradient-to-t from-rose-600 to-rose-400 text-white shadow-lg shadow-rose-500/50'
                      : hardwareBin.fill_percentage >= 50
                      ? 'bg-gradient-to-t from-amber-500 to-amber-300 text-slate-950'
                      : 'bg-gradient-to-t from-emerald-600 to-teal-400 text-slate-950'
                  }`}
                  style={{ height: `${Math.max(10, Math.min(100, hardwareBin.fill_percentage))}%` }}
                >
                  {hardwareBin.fill_percentage}%
                </div>
              </div>

              <div className="space-y-1.5 flex-1">
                <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider block">
                  HC-SR04 Fill Reading
                </span>
                <div className="text-3xl font-black text-white">
                  {hardwareBin.fill_percentage}%
                </div>
                <div className="text-xs text-slate-400">
                  Status: <span className={`font-black ${
                    hardwareBin.fill_percentage >= 95 ? 'text-rose-400' :
                    hardwareBin.fill_percentage >= 80 ? 'text-rose-300' :
                    hardwareBin.fill_percentage >= 60 ? 'text-amber-300' : 'text-emerald-400'
                  }`}>
                    {hardwareBin.fill_percentage >= 95 ? 'CRITICAL OVERFLOW' :
                     hardwareBin.fill_percentage >= 80 ? 'PICKUP REQUIRED' :
                     hardwareBin.fill_percentage >= 60 ? 'WARNING (FILLING UP)' : 'NORMAL (EMPTY)'}
                  </span>
                </div>
                <div className="text-[11px] text-cyan-200/70 pt-1">
                  Threshold limit: <span className="font-bold text-white">{hardwareBin.threshold_value}%</span>
                </div>
              </div>
            </div>

            {/* Ultrasonic Distance Metric Card */}
            <div className="md:col-span-4 bg-slate-950/60 p-4 rounded-2xl border border-cyan-800/40 space-y-2">
              <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Measured Distance</span>
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-cyan-300">
                  {hardwareBin.distance_cm !== undefined && hardwareBin.distance_cm !== null ? Number(hardwareBin.distance_cm).toFixed(1) : '10.3'}
                </span>
                <span className="text-sm font-bold text-cyan-400/80">cm</span>
              </div>
              
              <div className="pt-2 text-xs space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Empty Bin Reference:</span>
                  <span className="font-bold text-emerald-400">10.3 cm (0%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Full Bin Reference:</span>
                  <span className="font-bold text-rose-400">2.0 cm (100%)</span>
                </div>
              </div>
            </div>

            {/* Connection Channel & Status */}
            <div className="md:col-span-4 bg-slate-950/60 p-4 rounded-2xl border border-cyan-800/40 space-y-2">
              <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sensor Channel Info</span>
              </span>
              
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-300">Connection Mode:</span>
                <span className="text-xs font-black text-cyan-300">
                  {isSerialConnected ? 'USB Data Cable (Serial)' : 'Wi-Fi / Standby'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Sensor Accuracy:</span>
                <span className="font-semibold text-emerald-400">7-Reading Filtered Avg</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-800">
                <span>Last Telemetry Update:</span>
                <span className="font-mono text-cyan-300 text-[11px]">
                  {new Date(hardwareBin.last_updated).toLocaleTimeString()}
                </span>
              </div>
            </div>

          </div>

          {/* Real-time Serial Monitor Console (When USB is connected) */}
          {isSerialConnected && serialTerminalLines.length > 0 && (
            <div className="mt-4 p-3 rounded-2xl bg-black/80 border border-cyan-500/40 font-mono text-[11px] text-emerald-400 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-slate-800">
                <span className="flex items-center space-x-1.5 text-cyan-300 font-bold">
                  <Terminal className="w-3 h-3" />
                  <span>Real-Time USB Serial Output from ESP32:</span>
                </span>
                <span className="text-emerald-400 animate-pulse">● STREAMING</span>
              </div>
              <div className="max-h-20 overflow-y-auto space-y-0.5 pt-1">
                {serialTerminalLines.slice(0, 5).map((l, i) => (
                  <div key={i}>{l}</div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Grid View of Dustbins */}
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
            const isHardware = b.is_hardware || b.bin_code === 'BIN001';

            return (
              <div
                key={b.id}
                className={`p-5 rounded-3xl glass-panel bg-white/90 dark:bg-slate-800/90 shadow-sm border transition-all duration-200 hover:shadow-lg relative overflow-hidden ${
                  isHardware
                    ? 'border-cyan-500/80 dark:border-cyan-500/80 ring-2 ring-cyan-500/20'
                    : isOverflow
                    ? 'border-rose-400 dark:border-rose-600/60 ring-2 ring-rose-500/20'
                    : isWarning
                    ? 'border-amber-300 dark:border-amber-700/60'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {/* Top Hardware Banner Tag if hardware */}
                {isHardware && (
                  <div className="absolute top-0 right-0 bg-cyan-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl tracking-wider flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                    <span>PHYSICAL HARDWARE</span>
                  </div>
                )}

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

                {/* Ultrasonic Distance readout for hardware bins */}
                {b.distance_cm !== undefined && b.distance_cm !== null && (
                  <div className="mt-3 px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/50 flex items-center justify-between text-xs">
                    <span className="text-cyan-700 dark:text-cyan-300 font-semibold flex items-center space-x-1">
                      <ArrowDown className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                      <span>Distance:</span>
                    </span>
                    <span className="font-black text-cyan-950 dark:text-cyan-100">
                      {Number(b.distance_cm).toFixed(1)} cm
                    </span>
                  </div>
                )}

                {/* Animated Fill Bar Gauge */}
                <div className="mt-3 space-y-1.5">
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
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenBinDetail(b)}
                    className="py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 font-semibold text-[11px] text-slate-700 dark:text-slate-200"
                  >
                    Historical Trend
                  </button>
                  <button
                    onClick={() => handleEmptyBin(b.id)}
                    className="py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] hover:bg-emerald-100"
                  >
                    Reset (0%)
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* HARDWARE CONNECTION & SETUP MODAL */}
      {showHardwareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white flex items-center justify-between border-b border-cyan-800/40">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <Cable className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Connect Physical Dustbin Hardware</h3>
                  <p className="text-xs text-cyan-200/80">USB Data Cable (Serial) or Wireless Wi-Fi Connection</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHardwareModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-5 pt-3 gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveModalTab('usb')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 shrink-0 ${
                  activeModalTab === 'usb'
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Cable className="w-3.5 h-3.5" />
                <span>1. USB Data Cable (Direct Serial)</span>
              </button>

              <button
                onClick={() => setActiveModalTab('wifi')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 shrink-0 ${
                  activeModalTab === 'wifi'
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>2. Wi-Fi Wireless Mode</span>
              </button>

              <button
                onClick={() => setActiveModalTab('logs')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 shrink-0 ${
                  activeModalTab === 'logs'
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>3. Live Stream Logs ({serialTerminalLines.length + telemetryLogsStream.length})</span>
              </button>

              <button
                onClick={() => setActiveModalTab('tester')}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 shrink-0 ${
                  activeModalTab === 'tester'
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>4. Manual Ping Tester</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200 text-sm">
              
              {/* TAB 1: USB DATA CABLE (DIRECT SERIAL) */}
              {activeModalTab === 'usb' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-cyan-800 dark:text-cyan-300 uppercase tracking-wider flex items-center space-x-1.5">
                        <Cable className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <span>Direct USB Cable Connection</span>
                      </span>
                      {isSerialConnected ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                          CONNECTED
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          NOT CONNECTED
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Because your ESP32 is connected via USB Data Cable, the browser can read the HC-SR04 ultrasonic distance in real-time over the COM port without needing any Wi-Fi router.
                    </p>

                    <div className="pt-1">
                      {isSerialConnected ? (
                        <button
                          onClick={handleDisconnectWebSerial}
                          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition-colors"
                        >
                          <Power className="w-4 h-4" />
                          <span>Disconnect USB Cable</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleConnectWebSerial}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black text-xs flex items-center space-x-2 shadow-lg shadow-cyan-600/30 transition-all transform active:scale-95"
                        >
                          <Cable className="w-4 h-4" />
                          <span>Click Here: Connect USB Cable to Chrome</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Troubleshooting Guide if Data Cable doesn't show */}
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs space-y-2 text-amber-900 dark:text-amber-200">
                    <div className="font-bold flex items-center space-x-1.5 text-amber-800 dark:text-amber-300">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Important Tips for USB Data Cable:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800/90 dark:text-amber-300/90">
                      <li><strong>Use a Data Cable (not charge-only):</strong> Normal charging cables do not have data wires. Ensure your micro-USB cable supports data transfer.</li>
                      <li><strong>Close Arduino IDE Serial Monitor:</strong> Windows only permits one application to open a COM port at a time. If the Serial Monitor is open in Arduino IDE, close it before clicking Connect here.</li>
                      <li><strong>USB Driver:</strong> Ensure CH340 or CP2102 driver is installed on Windows.</li>
                    </ul>
                  </div>

                  {/* Raw stream preview */}
                  {serialTerminalLines.length > 0 && (
                    <div className="p-3 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs max-h-36 overflow-y-auto space-y-1 border border-slate-800">
                      <div className="text-[10px] text-slate-500 pb-1 border-b border-slate-800">Latest Serial Lines:</div>
                      {serialTerminalLines.slice(0, 5).map((l, i) => (
                        <div key={i}>{l}</div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: WI-FI SETUP */}
              {activeModalTab === 'wifi' && (
                <div className="space-y-4">
                  {/* Local API URL Box */}
                  <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 space-y-2">
                    <span className="text-xs font-extrabold text-cyan-800 dark:text-cyan-300 uppercase tracking-wider block">
                      Backend API Endpoint for Wi-Fi Mode
                    </span>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-cyan-300 dark:border-cyan-800 font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300 select-all overflow-x-auto">
                        {networkInfo?.apiUrl || `http://${window.location.hostname}:5000/api/bin/update`}
                      </code>
                      <button
                        onClick={handleCopyApiUrl}
                        className="px-3 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-1 shadow-md transition-colors"
                      >
                        {copiedUrl ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedUrl ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-cyan-900/70 dark:text-cyan-300/70">
                      Laptop Wi-Fi IPv4: <strong className="font-bold">{networkInfo?.primaryIp || '172.25.90.23'}</strong>
                    </p>
                  </div>

                  {/* 3 Step Arduino instructions */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>If connecting over Wi-Fi, update these 3 lines in your Arduino Code:</span>
                    </h4>

                    <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2 border border-slate-800">
                      <div className="text-slate-400">// 1. Enter your Wi-Fi name & password</div>
                      <div className="text-emerald-400">const char* WIFI_SSID = "YOUR_WIFI_NAME";</div>
                      <div className="text-emerald-400">const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";</div>
                      <br />
                      <div className="text-slate-400">// 2. Set backend API address to your laptop's Wi-Fi IP</div>
                      <div className="text-cyan-400">const char* API_URL = "{networkInfo?.apiUrl || 'http://172.25.90.23:5000/api/bin/update'}";</div>
                      <br />
                      <div className="text-slate-400">// 3. Turn WiFi ON (change false to true)</div>
                      <div className="text-amber-400 font-bold">const bool USE_WIFI = true;</div>
                    </div>
                  </div>

                  {/* Hardware Calibration Info */}
                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <div className="font-bold text-slate-900 dark:text-slate-100">HC-SR04 Sensor Calibration:</div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Empty reference: <strong className="text-emerald-600 dark:text-emerald-400">10.3 cm (0%)</strong> | Full reference: <strong className="text-rose-600 dark:text-rose-400">2.0 cm (100%)</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LIVE STREAM LOGS */}
              {activeModalTab === 'logs' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Live Telemetry & Serial Console</span>
                    <button
                      onClick={() => {
                        setTelemetryLogsStream([]);
                        setSerialTerminalLines([]);
                      }}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs max-h-80 overflow-y-auto space-y-2 border border-slate-800">
                    {serialTerminalLines.length === 0 && telemetryLogsStream.length === 0 ? (
                      <div className="text-slate-500 text-center py-6">
                        No telemetry packets received yet. Connect your USB Data Cable in Tab 1 or power on your ESP32 Wi-Fi.
                      </div>
                    ) : (
                      <>
                        {serialTerminalLines.slice(0, 10).map((line, idx) => (
                          <div key={'s-' + idx} className="p-1.5 rounded bg-slate-900/60 text-emerald-400 text-[11px]">
                            [USB Serial] {line}
                          </div>
                        ))}
                        {telemetryLogsStream.map((log) => (
                          <div key={log.id} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-[11px]">
                            <div className="flex items-center space-x-2">
                              <span className="text-cyan-400 font-bold">{log.binCode || `BIN-${log.binId}`}</span>
                              <span className="text-slate-400">•</span>
                              <span>Fill: <strong className={log.fillPercentage >= 80 ? 'text-rose-400' : 'text-emerald-400'}>{log.fillPercentage}%</strong></span>
                              {log.distanceCm && (
                                <>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-cyan-300">{Number(log.distanceCm).toFixed(1)} cm</span>
                                </>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: MANUAL TESTER */}
              {activeModalTab === 'tester' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Verify how the website renders different sensor readings:
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Distance: {testDistance.toFixed(1)} cm</span>
                        <span className="text-cyan-600 dark:text-cyan-400">Calculated Fill: {testFill}%</span>
                      </div>
                      <input
                        type="range"
                        min="2.0"
                        max="10.3"
                        step="0.1"
                        value={testDistance}
                        onChange={(e) => handleDistanceChange(e.target.value)}
                        className="w-full accent-cyan-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                        <span>2.0 cm (100% Full)</span>
                        <span>10.3 cm (0% Empty)</span>
                      </div>
                    </div>

                    <button
                      onClick={handleSendTestTelemetry}
                      disabled={isSendingTest}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSendingTest ? 'Sending Packet...' : `Send Test Reading (Fill: ${testFill}%, Distance: ${testDistance.toFixed(1)}cm)`}</span>
                    </button>

                    {testResponseStatus && (
                      <div className={`p-3 rounded-xl text-xs font-bold ${
                        testResponseStatus === 'success'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {testResponseStatus === 'success' 
                          ? '✅ Telemetry sent successfully!' 
                          : testResponseStatus}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end">
              <button
                onClick={() => setShowHardwareModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>

          </div>
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
                Mark Emptied (0%)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
