import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, Camera, MapPin, Sparkles, Calendar, CheckCircle2, 
  Clock, AlertTriangle, Package, ShieldCheck, ArrowRight, Upload, RefreshCw
} from 'lucide-react';
import translations from '../utils/i18n';
import { api, socket } from '../services/api';

import ImageUploader from './ImageUploader';

export default function CitizenPortal({ user, lang, onOpenReportModalSignal }) {
  const t = translations[lang] || translations.en;
  
  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'pickup' | 'history'
  const [historyType, setHistoryType] = useState('all'); // 'all' | 'complaints' | 'pickups'
  const [myComplaints, setMyComplaints] = useState([]);
  const [myPickups, setMyPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Report Form state
  const [photoUrl, setPhotoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('overflowing_bin');
  const [priority, setPriority] = useState('medium');
  const [addressText, setAddressText] = useState(user?.ward_area || 'Connaught Place, New Delhi');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pickup Request state
  const [wasteType, setWasteType] = useState('e-waste');
  const [preferredSlot, setPreferredSlot] = useState('Morning (09:00 AM - 12:00 PM)');
  const [pickupAddress, setPickupAddress] = useState(user?.ward_area || 'Connaught Place, New Delhi');
  const [pickupNotes, setPickupNotes] = useState('');

  useEffect(() => {
    loadUserData();

    socket.on(`notification_user_${user?.id}`, () => {
      loadUserData();
    });

    return () => {
      socket.off(`notification_user_${user?.id}`);
    };
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [compRes, pickRes] = await Promise.all([
        api.getComplaints(),
        api.getPickups()
      ]);

      if (compRes.success) setMyComplaints(compRes.complaints || []);
      if (pickRes.success) setMyPickups(pickRes.pickups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Run AI Waste Photo Classifier when image/text changes
  const runAIAnalysis = async (url, desc) => {
    try {
      setIsClassifying(true);
      const res = await api.classifyWaste({ photo_url: url, notes: desc });
      if (res.success && res.analysis) {
        setAiAnalysis(res.analysis);
        if (res.analysis.category) setType(res.analysis.category);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await api.createComplaint({
        type,
        description,
        photo_url: photoUrl || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
        latitude: 28.6315,
        longitude: 77.2167,
        address_text: addressText,
        ward_area: user?.ward_area || 'Ward 14 - Connaught Place',
        priority
      });

      if (res.success) {
        alert(res.message);
        setDescription('');
        setPhotoUrl('');
        setAiAnalysis(null);
        setActiveTab('history');
        loadUserData();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePickupSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await api.createPickup({
        waste_type: wasteType,
        preferred_slot: preferredSlot,
        address_text: pickupAddress,
        latitude: 28.6315,
        longitude: 77.2167,
        notes: pickupNotes
      });

      if (res.success) {
        alert(res.message);
        setPickupNotes('');
        setHistoryType('pickups');
        setActiveTab('history');
        loadUserData();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Citizen Header & Eco Points Hero */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-700 via-emerald-800 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-600/30">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
            CITIZEN SWEEP PORTAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
            Namaste, {user?.name || 'Clean Ambassador'}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
            Report waste hotspots, schedule doorstep segregation pickups, and earn Eco Rewards.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-emerald-400 flex items-center justify-center text-slate-900 shadow-md">
            <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <span className="text-[11px] text-emerald-200 uppercase font-bold tracking-wider">Your Eco Points</span>
            <div className="text-2xl font-black text-white">{user?.eco_points || 340} pts</div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'report'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Waste Issue</span>
        </button>

        <button
          onClick={() => setActiveTab('pickup')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'pickup'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Request Doorstep Pickup</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>My Complaints Timeline ({myComplaints.length})</span>
        </button>
      </div>

      {/* TAB 1: REPORT WASTE ISSUE FORM WITH AI CLASSIFIER */}
      {activeTab === 'report' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleReportSubmit} className="lg:col-span-2 p-6 rounded-3xl glass-panel bg-white/90 dark:bg-slate-800/90 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>Report Garbage / Overflowing Dustbin</span>
            </h3>

            {/* Photo Selection / Camera upload simulation */}
            {/* Photo Selection / Device File Upload */}
            <ImageUploader
              value={photoUrl}
              onChange={(url) => {
                setPhotoUrl(url);
                if (url) runAIAnalysis(url, description);
              }}
              label="Upload Waste Photo from Device (AI Classifier)"
              presetSamples={[
                { label: '🗑️ Overflowing Bin', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80' },
                { label: '🥬 Road Vegetable Waste', url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80' }
              ]}
            />

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description of Issue
              </label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (e.target.value.length > 5) runAIAnalysis(photoUrl, e.target.value);
                }}
                placeholder="Describe garbage situation (e.g. dustbin overflowing onto pathway near CP block)..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                >
                  <option value="overflowing_bin">Overflowing Dustbin</option>
                  <option value="road_garbage">Road Garbage Dump</option>
                  <option value="missed_pickup">Missed Residential Pickup</option>
                  <option value="illegal_dumping">Illegal Waste Dumping</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Location / Address
                </label>
                <input
                  type="text"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm hover:opacity-95 transition-opacity shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>{isSubmitting ? 'Logging Complaint...' : 'Submit Complaint & Claim Eco Points (+30)'}</span>
            </button>
          </form>

          {/* AI Waste Classifier Live Card */}
          <div className="p-6 rounded-3xl glass-panel bg-emerald-950/20 dark:bg-slate-800/90 shadow-sm border border-emerald-500/30 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
              <h4 className="font-bold text-sm uppercase tracking-wider">AI Waste Photo Classifier</h4>
            </div>

            {isClassifying ? (
              <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500" />
                <p>Analyzing image features and category heuristics...</p>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">Detected Type</span>
                  <span className="text-sm font-extrabold text-emerald-300">{aiAnalysis.typeName}</span>
                  <span className="text-[10px] text-slate-400 ml-2">({aiAnalysis.confidenceScore} confidence)</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Bin Color Disposal Guide</span>
                  <span className="font-bold text-cyan-300">{aiAnalysis.binColor}</span>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">{aiAnalysis.disposalGuide}</p>
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <span className="font-bold text-amber-300">Eco Reward Bonus</span>
                  <span className="font-black text-amber-400 text-sm">+{aiAnalysis.recommendedEcoPoints} Points</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                Upload or paste a photo to see instant AI classification, bin color guide, and points estimator!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REQUEST DOORSTEP WASTE PICKUP */}
      {activeTab === 'pickup' && (
        <form onSubmit={handlePickupSubmit} className="max-w-2xl mx-auto p-6 rounded-3xl glass-panel bg-white/90 dark:bg-slate-800/90 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span>Schedule Doorstep Waste Pickup</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Waste Category
              </label>
              <select
                value={wasteType}
                onChange={(e) => setWasteType(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              >
                <option value="e-waste">💻 E-Waste (Electronics, Wires, Batteries)</option>
                <option value="bulk">🌿 Bulk / Garden Debris</option>
                <option value="hazardous">☣️ Household Hazardous (Paints, Chemicals)</option>
                <option value="recyclable">📦 Dry Recyclables (Paper, Plastics)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Time Slot
              </label>
              <select
                value={preferredSlot}
                onChange={(e) => setPreferredSlot(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
              >
                <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                <option value="Afternoon (02:00 PM - 05:00 PM)">Afternoon (02:00 PM - 05:00 PM)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pickup Address</label>
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Special Notes</label>
            <textarea
              rows="2"
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              placeholder="e.g. Old computer monitor and printers packed in cardboard box..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/30"
          >
            {isSubmitting ? 'Scheduling Pickup...' : 'Confirm Pickup Request (+40 Eco Points)'}
          </button>
        </form>
      )}

      {/* TAB 3: REAL-TIME COMPLAINTS & PICKUP TIMELINE TRACKER */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                Real-Time Grievance & Pickup Progress Tracker
              </h3>
              <p className="text-xs text-slate-400">Track all your submitted waste complaints and scheduled doorstep collections.</p>
            </div>

            {/* Filter Toggle: All | Grievances | Doorstep Pickups */}
            <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold self-start">
              <button
                type="button"
                onClick={() => setHistoryType('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  historyType === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                All ({myComplaints.length + myPickups.length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryType('complaints')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  historyType === 'complaints'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Grievances ({myComplaints.length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryType('pickups')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  historyType === 'pickups'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Doorstep Pickups ({myPickups.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading your history...</div>
          ) : (myComplaints.length === 0 && myPickups.length === 0) ? (
            <div className="p-8 text-center text-xs text-slate-400 glass-panel rounded-2xl">
              No requests filed yet. Report an issue or schedule a pickup to earn Eco Points!
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* 1. DOORSTEP PICKUPS STREAM */}
              {(historyType === 'all' || historyType === 'pickups') && myPickups.map((p) => (
                <div key={`pickup-${p.id}`} className="p-5 rounded-2xl glass-panel bg-white/90 dark:bg-slate-800/90 border border-teal-200/80 dark:border-teal-900/60 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/50">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-mono">
                          DOORSTEP PICKUP #{p.id}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 capitalize mt-0.5">
                        📦 {p.waste_type} Pickup Request
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Address: <span className="font-semibold text-slate-700 dark:text-slate-300">{p.address_text}</span> · Slot: <span className="font-semibold text-teal-600 dark:text-teal-400">{p.preferred_slot}</span>
                      </p>
                      {p.notes && (
                        <p className="text-[11px] text-slate-400 mt-1 italic bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                          Note: {p.notes}
                        </p>
                      )}
                    </div>

                    <span className={`self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      p.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : p.status === 'in-transit'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 animate-pulse'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {p.status === 'in-transit' ? 'Truck In-Transit' : (p.status || 'Scheduled')}
                    </span>
                  </div>

                  {/* 4-Step Progress Timeline for Doorstep Pickup */}
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold pt-1">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-extrabold">1</div>
                      <span className="mt-1 text-slate-600 dark:text-slate-300">Requested</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold ${
                        p.assigned_staff_id || p.status === 'in-transit' || p.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}>2</div>
                      <span className="mt-1 text-slate-600 dark:text-slate-300">Driver Assigned</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold ${
                        p.status === 'in-transit' || p.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}>3</div>
                      <span className="mt-1 text-slate-600 dark:text-slate-300">In-Transit</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold ${
                        p.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}>4</div>
                      <span className="mt-1 text-slate-600 dark:text-slate-300">Collected</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <strong>Assigned Sanitation Vehicle / Staff:</strong>{' '}
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {p.assigned_staff_name || 'Allocating municipal truck driver...'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">Reward: +40 EcoPoints Credited</span>
                  </div>
                </div>
              ))}

              {/* 2. COMPLAINTS STREAM */}
              {(historyType === 'all' || historyType === 'complaints') && myComplaints.map((c) => (
                <div key={`complaint-${c.id}`} className="p-5 rounded-2xl glass-panel bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/50">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-emerald-600">Complaint #{c.id}</span>
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 capitalize">
                        {c.type.replace('_', ' ')}
                      </h4>
                      <span className="text-xs text-slate-400">{c.address_text}</span>
                    </div>

                    <span className={`self-start px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      c.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  {/* Step-by-Step Progress Timeline Bar */}
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold pt-2">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-extrabold">1</div>
                      <span className="mt-1 text-slate-600 dark:text-slate-300">Reported</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold ${
                        c.status !== 'reported' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}>2</div>
                      <span className="mt-1 text-slate-600 dark:text-slate-300">Acknowledged</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold ${
                        c.status === 'in-progress' || c.status === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}>3</div>
                      <span className="mt-1 text-slate-600 dark:text-slate-300">In-Progress</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold ${
                        c.status === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}>4</div>
                      <span className="mt-1 text-slate-600 dark:text-slate-300">Resolved</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <strong>Assigned Sanitation Officer:</strong> {c.assigned_staff_name || 'Dispatching officer...'}
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>
      )}

    </div>
  );
}
