import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, Camera, MapPin, Sparkles, Calendar, CheckCircle2, 
  Clock, AlertTriangle, Package, ShieldCheck, ArrowRight, Upload, 
  RefreshCw, ChevronRight, X, Phone, Truck, Trophy, Award, Gift, Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, socket } from '../services/api';
import ImageUploader from './ImageUploader';

export default function CitizenPortal({ user, lang, onOpenReportModalSignal }) {
  const [activeTab, setActiveTab] = useState('tracking'); // 'tracking' | 'pickups' | 'guide' | 'rewards'
  const [myComplaints, setMyComplaints] = useState([]);
  const [myPickups, setMyPickups] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);

  // Report Form state
  const [photoUrl, setPhotoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('overflowing_bin');
  const [priority, setPriority] = useState('high');
  const [addressText, setAddressText] = useState(user?.ward_area || 'Main Market Road, near Block B intersection');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pickup Request Form state
  const [wasteType, setWasteType] = useState('e-waste');
  const [preferredSlot, setPreferredSlot] = useState('Morning (09:00 AM - 12:00 PM)');
  const [pickupAddress, setPickupAddress] = useState(user?.ward_area || 'Flat 402, Greenview Apartments, Civil Lines');
  const [pickupNotes, setPickupNotes] = useState('');

  // Eco points state
  const [userEcoPoints, setUserEcoPoints] = useState(user?.eco_points || 420);
  const [redeemedVouchers, setRedeemedVouchers] = useState([]);

  useEffect(() => {
    loadUserData();

    if (user?.id) {
      socket.on(`notification_user_${user.id}`, () => {
        loadUserData();
      });
    }

    return () => {
      if (user?.id) socket.off(`notification_user_${user.id}`);
    };
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [compRes, pickRes] = await Promise.all([
        api.getComplaints(),
        api.getPickups()
      ]);

      let complaintsList = compRes.success ? (compRes.complaints || []) : [];
      let pickupsList = pickRes.success ? (pickRes.pickups || []) : [];

      // Default realistic tickets if freshly initialized
      if (complaintsList.length === 0) {
        complaintsList = [
          {
            id: 'SW-2026-8870',
            type: 'overflowing_bin',
            status: 'pending',
            priority: 'high',
            address_text: 'Main Market Road, near Block B intersection',
            ward_area: 'Ward 4 - Civil Lines',
            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            photo_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
            assigned_staff_name: 'Rameshwar Yadav (Truck DL-01-GA-1892)',
            assigned_time: '09:24 PM',
            sla_hours: 4
          },
          {
            id: 'SW-2026-2165',
            type: 'overflowing_bin',
            status: 'resolved',
            priority: 'medium',
            address_text: 'Civil Lines Road, Opp. Metro Pillar 42',
            ward_area: 'Ward 4 - Civil Lines',
            created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
            resolved_at: new Date(Date.now() - 3600000 * 22).toISOString(),
            photo_url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
            proof_photo_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
            assigned_staff_name: 'Suresh Kumar (Truck DL-01-GA-1102)',
            assigned_time: '08:15 AM',
            sla_hours: 4
          }
        ];
      }

      setMyComplaints(complaintsList);
      setMyPickups(pickupsList);
      if (!selectedTicket && complaintsList.length > 0) {
        setSelectedTicket(complaintsList[0]);
      }
    } catch (err) {
      console.error('Error loading citizen data:', err);
    } finally {
      setLoading(false);
    }
  };

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
        description: description || 'Overflowing waste heap reported by citizen',
        photo_url: photoUrl || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
        latitude: 28.6315,
        longitude: 77.2167,
        address_text: addressText,
        ward_area: user?.ward_area || 'Ward 4 - Civil Lines',
        priority
      });

      if (res.success) {
        // Trigger celebration
        try {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        } catch (err) {}

        setUserEcoPoints(prev => prev + 30);
        setShowReportModal(false);
        setDescription('');
        setPhotoUrl('');
        setAiAnalysis(null);
        await loadUserData();
      }
    } catch (err) {
      alert(err.message || 'Failed to submit report');
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
        try {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        } catch (err) {}

        setUserEcoPoints(prev => prev + 40);
        setShowPickupModal(false);
        setPickupNotes('');
        await loadUserData();
        setActiveTab('pickups');
      }
    } catch (err) {
      alert(err.message || 'Failed to schedule pickup');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedeemReward = (title, ptsRequired) => {
    if (userEcoPoints < ptsRequired) {
      alert(`Aapko ${ptsRequired} points chahiye. Aapka current balance: ${userEcoPoints} Pts`);
      return;
    }
    setUserEcoPoints(prev => prev - ptsRequired);
    setRedeemedVouchers(prev => [...prev, { title, pts: ptsRequired, date: new Date().toLocaleDateString() }]);
    try {
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
    } catch (err) {}
    alert(`🎉 Badhai ho! "${title}" safaltapoorvak redeem ho gaya hai. Aapke registered mobile par SMS voucher bhej diya gaya hai!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. CITIZEN HERO PROFILE BANNER (From Reference Screenshot) */}
      <div className="p-6 sm:p-7 rounded-[28px] bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Citizen Info */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-extrabold text-2xl shadow-xs shrink-0">
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Namaste, {user?.name || 'Aarav Sharma'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
                GREEN CITIZEN LV.3
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Ward: <span className="font-bold text-slate-700 dark:text-slate-200">{user?.ward_area || 'Ward 4 - Civil Lines'}</span> · Registered Mobile: <span className="font-mono text-slate-700 dark:text-slate-200">+91 98765 43210</span>
            </p>
          </div>
        </div>

        {/* Right Action Tools: Wallet & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* EcoPoints Wallet Card */}
          <div className="p-3.5 px-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center space-x-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                MY ECOPOINTS WALLET
              </span>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                {userEcoPoints} Pts
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                Redeem for Municipal Rebate
              </span>
            </div>
          </div>

          {/* Quick Action Button: Report Waste */}
          <button
            onClick={() => setShowReportModal(true)}
            className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md shadow-rose-600/25 transition-all flex items-center space-x-2 transform hover:-translate-y-0.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Waste</span>
          </button>

          {/* Quick Action Button: Schedule Pickup */}
          <button
            onClick={() => setShowPickupModal(true)}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center space-x-2 transform hover:-translate-y-0.5 shrink-0"
          >
            <Package className="w-4 h-4" />
            <span>Schedule Pickup</span>
          </button>

        </div>

      </div>

      {/* 2. CITIZEN DASHBOARD SUB-NAVIGATION TABS */}
      <div className="flex items-center space-x-6 border-b border-slate-200 dark:border-slate-800 text-sm font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('tracking')}
          className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'tracking'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          My Grievance Tracking ({myComplaints.length})
        </button>

        <button
          onClick={() => setActiveTab('pickups')}
          className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'pickups'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Scheduled Pickups ({myPickups.length})
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'guide'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          2D Segregation Guide & AI Scanner
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'rewards'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          EcoPoints Rewards Store
        </button>
      </div>

      {/* 3. TAB 1: GRIEVANCE TRACKING (2-COLUMN SPLIT LAYOUT AS IN SCREENSHOT) */}
      {activeTab === 'tracking' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Logged Tickets Card List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                LOGGED TICKETS
              </span>
              <span className="text-[11px] text-slate-400">
                Select to view live timeline
              </span>
            </div>

            <div className="space-y-3">
              {myComplaints.map((c) => {
                const isSelected = selectedTicket?.id === c.id;
                const isResolved = c.status === 'resolved';

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedTicket(c)}
                    className={`p-4 rounded-2xl bg-white dark:bg-slate-850 border transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-slate-200/90 dark:border-slate-750 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                        {c.id.toString().startsWith('SW') ? c.id : `SW-2026-${c.id}`}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isResolved
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {isResolved ? 'Resolved' : 'Pending'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 capitalize">
                      {c.type ? c.type.replace('_', ' ') : 'Overflowing Bin'}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                      {c.address_text}
                    </p>

                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                      <span>Reported: {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Today'}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                        Timeline <ChevronRight className="w-3 h-3 ml-0.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Transparent Municipal Resolution Stepper & Proof Photos */}
          <div className="lg:col-span-8 p-6 sm:p-7 rounded-[28px] bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-sm space-y-6">
            {selectedTicket ? (
              <>
                {/* Ticket Top Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-md text-xs font-mono font-black bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {selectedTicket.id.toString().startsWith('SW') ? selectedTicket.id : `SW-2026-${selectedTicket.id}`}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                        selectedTicket.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {selectedTicket.status === 'resolved' ? 'Resolved' : 'Pending'}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 capitalize">
                      {selectedTicket.type ? selectedTicket.type.replace('_', ' ') : 'Overflowing Bin'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedTicket.address_text} · <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedTicket.ward_area || 'Ward 4 - Civil Lines'}</span>
                    </p>
                  </div>

                  {/* SLA Badge */}
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                      SLA COMMITMENT
                    </span>
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                      4 Hours (Standard Municipal SLA)
                    </span>
                  </div>
                </div>

                {/* Stepper Title */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                    TRANSPARENT MUNICIPAL RESOLUTION STEPPER
                  </h4>

                  {/* 4-Step Stepper Component */}
                  <div className="space-y-5 relative pl-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                    
                    {/* Step 1: AI Triage */}
                    <div className="relative">
                      <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-850 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </span>
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-black text-xs text-slate-900 dark:text-slate-100">
                            Automated AI Triage & Verification
                          </h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Image analyzed and classified under high priority dispatch queue.
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            Actor: ECOBIN AI Gatekeeper (System)
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Just now</span>
                      </div>
                    </div>

                    {/* Step 2: Ward Dispatch */}
                    <div className="relative">
                      <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-850 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </span>
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-black text-xs text-slate-900 dark:text-slate-100">
                            Ward Dispatch Allocation
                          </h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Assigned to {selectedTicket.assigned_staff_name || 'Rameshwar Yadav (Truck DL-01-GA-1892)'}.
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            Actor: Ward Sanitation Desk (Ward Admin)
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">09:24 PM</span>
                      </div>
                    </div>

                    {/* Step 3: Field Team Clearance */}
                    <div className="relative">
                      <span className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full ring-4 ring-white dark:ring-slate-850 flex items-center justify-center ${
                        selectedTicket.status === 'resolved' ? 'bg-emerald-500' : 'bg-amber-400'
                      }`}>
                        {selectedTicket.status === 'resolved' ? <CheckCircle2 className="w-3 h-3 text-white" /> : <Clock className="w-2.5 h-2.5 text-slate-950" />}
                      </span>
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-black text-xs text-slate-900 dark:text-slate-100">
                            Field Team Clearance
                          </h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {selectedTicket.status === 'resolved'
                              ? 'Sanitation crew cleared site and loaded waste into truck.'
                              : 'Awaiting truck arrival and site clearing.'}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            Actor: Sanitation Crew (Staff)
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {selectedTicket.status === 'resolved' ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Step 4: Proof Verification & Closure */}
                    <div className="relative">
                      <span className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full ring-4 ring-white dark:ring-slate-850 flex items-center justify-center ${
                        selectedTicket.status === 'resolved' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}>
                        {selectedTicket.status === 'resolved' && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </span>
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-black text-xs text-slate-900 dark:text-slate-100">
                            Proof Verification & Closure
                          </h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Clean site photo validation by automated municipal inspector.
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            Actor: Sanitation Inspector (System)
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {selectedTicket.status === 'resolved' ? 'Cleaned' : 'Pending'}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Before vs After Photo Proof Comparison Cards (From Screenshot 2) */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    EVIDENCE & AUDIT PROOFS
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Before Photo */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
                        YOUR UPLOADED PHOTO (BEFORE)
                      </span>
                      <div className="h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-750 relative bg-slate-100 dark:bg-slate-900">
                        <img
                          src={selectedTicket.photo_url || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80'}
                          alt="Citizen Before Proof"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* After Photo Proof */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
                          STAFF RESOLUTION PROOF (AFTER)
                        </span>
                        {selectedTicket.status === 'resolved' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white">
                            Cleaned
                          </span>
                        )}
                      </div>
                      <div className="h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-750 relative bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                        {selectedTicket.status === 'resolved' ? (
                          <img
                            src={selectedTicket.proof_photo_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80'}
                            alt="Staff After Proof"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4 text-xs text-slate-400 space-y-1">
                            <Clock className="w-6 h-6 mx-auto text-amber-500 animate-pulse" />
                            <p className="font-bold text-slate-600 dark:text-slate-300">Staff In-Transit</p>
                            <span className="text-[10px]">Photo proof will appear here upon completion</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

              </>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Select a ticket from the left column to view its live resolution stepper.
              </div>
            )}
          </div>

        </div>
      )}

      {/* 4. TAB 2: SCHEDULED PICKUPS */}
      {activeTab === 'pickups' && (
        <div className="p-6 rounded-[28px] bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">
                Scheduled Doorstep Pickups
              </h3>
              <p className="text-xs text-slate-400">Track specialized e-waste, bulk garden, or hazardous collections.</p>
            </div>
            <button
              onClick={() => setShowPickupModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors shadow-xs"
            >
              + Schedule New
            </button>
          </div>

          {myPickups.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No scheduled pickups yet. Click "Schedule Pickup" to request specialized e-waste collection!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myPickups.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                      PICKUP #{p.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                      {p.status || 'Scheduled'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm capitalize text-slate-900 dark:text-slate-100">
                      {p.waste_type} Pickup
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{p.address_text}</p>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
                      Slot: {p.preferred_slot}
                    </span>
                  </div>

                  {p.notes && (
                    <p className="text-[11px] text-slate-400 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      Note: {p.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 3: 2D SEGREGATION GUIDE & AI SCANNER */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-[28px] bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white inline-block">
                🟢 GREEN BIN: WET ORGANIC
              </span>
              <h4 className="font-black text-base text-slate-900 dark:text-slate-100">Kitchen & Food Scraps</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Vegetable peels, food leftovers, tea leaves, fruit skins, and garden trimmings. Converted to rich bio-compost.
              </p>
            </div>

            <div className="p-6 rounded-[28px] bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-600 text-white inline-block">
                🔵 BLUE BIN: DRY RECYCLABLES
              </span>
              <h4 className="font-black text-base text-slate-900 dark:text-slate-100">Paper, Plastic & Glass</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Plastic water bottles, milk pouches, cardboard boxes, newspapers, aluminium cans. Must be rinsed clean.
              </p>
            </div>

            <div className="p-6 rounded-[28px] bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white inline-block">
                🔴 RED BIN: HAZARDOUS
              </span>
              <h4 className="font-black text-base text-slate-900 dark:text-slate-100">Chemicals & Medical</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Expired medicines, syringes, batteries, chemical cleaners, paint cans, insecticide sprays. Bio-hazard handling.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 4: ECOPOINTS REWARDS STORE */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <div className="p-6 rounded-[28px] bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Eco-Points Redeem Store</span>
              <h3 className="text-2xl font-black mt-0.5">Turn Cleanliness into Savings & Gifts</h3>
              <p className="text-xs text-emerald-100 mt-1">Official Municipal Rebates & Certified Green Rewards</p>
            </div>
            <div className="text-right bg-white/10 px-5 py-3 rounded-2xl border border-white/20">
              <span className="text-[10px] font-bold uppercase tracking-wider block">Your Wallet</span>
              <span className="text-2xl font-black">{userEcoPoints} Pts</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-2xl">🏛️</span>
                <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 mt-2">Municipal Property Tax Rebate</h4>
                <p className="text-xs text-slate-500 mt-1">5% discount on annual municipal water or property assessment bill.</p>
              </div>
              <div className="pt-2">
                <span className="font-black text-emerald-600 text-sm block mb-2">300 Pts</span>
                <button
                  onClick={() => handleRedeemReward('5% Municipal Tax Rebate', 300)}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                >
                  Redeem Rebate
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-2xl">🚇</span>
                <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 mt-2">Delhi Metro Travel Credit</h4>
                <p className="text-xs text-slate-500 mt-1">₹100 digital top-up voucher for Smart City Metro Cards.</p>
              </div>
              <div className="pt-2">
                <span className="font-black text-emerald-600 text-sm block mb-2">200 Pts</span>
                <button
                  onClick={() => handleRedeemReward('₹100 Metro Travel Voucher', 200)}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                >
                  Redeem Voucher
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-2xl">🌿</span>
                <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 mt-2">5kg Organic Compost Bag</h4>
                <p className="text-xs text-slate-500 mt-1">Free doorstep delivery of 100% certified municipal garden compost.</p>
              </div>
              <div className="pt-2">
                <span className="font-black text-emerald-600 text-sm block mb-2">150 Pts</span>
                <button
                  onClick={() => handleRedeemReward('5kg Organic Compost Bag', 150)}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                >
                  Order Free Bag
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-2xl">📜</span>
                <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 mt-2">Swachh Ambassador Certificate</h4>
                <p className="text-xs text-slate-500 mt-1">Official verified digital certificate signed by Municipal Commissioner.</p>
              </div>
              <div className="pt-2">
                <span className="font-black text-emerald-600 text-sm block mb-2">100 Pts</span>
                <button
                  onClick={() => handleRedeemReward('Swachh Ambassador Certificate', 100)}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                >
                  Download Certificate
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: REPORT WASTE ISSUE MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                  Report Waste Grievance (+30 Eco-Points)
                </h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <ImageUploader
                value={photoUrl}
                onChange={(url) => {
                  setPhotoUrl(url);
                  if (url) runAIAnalysis(url, description);
                }}
                label="Waste Spot Photo Evidence"
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Location / Address
                </label>
                <input
                  type="text"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description of Issue
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (e.target.value.length > 5) runAIAnalysis(photoUrl, e.target.value);
                  }}
                  placeholder="e.g. Overflowing garbage bin onto pedestrian road..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              {aiAnalysis && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <span className="font-black text-emerald-800 dark:text-emerald-300 block">
                    AI Auto-Triage: {aiAnalysis.typeName} ({aiAnalysis.confidenceScore})
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">
                    Recommended Bin: <strong>{aiAnalysis.binColor}</strong>
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>{isSubmitting ? 'Registering Grievance...' : 'Submit Grievance (+30 Eco-Points)'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SCHEDULE DOORSTEP PICKUP MODAL */}
      {showPickupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                  Schedule Doorstep Pickup (+40 Eco-Points)
                </h3>
              </div>
              <button onClick={() => setShowPickupModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePickupSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Waste Category
                  </label>
                  <select
                    value={wasteType}
                    onChange={(e) => setWasteType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="e-waste">💻 E-Waste (Old Phones, Wires, Batteries)</option>
                    <option value="bulk">🌿 Bulk / Garden Waste</option>
                    <option value="hazardous">☣️ Household Chemicals / Paints</option>
                    <option value="recyclable">📦 Dry Recyclables</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    value={preferredSlot}
                    onChange={(e) => setPreferredSlot(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
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
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Special Notes</label>
                <textarea
                  rows="2"
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                  placeholder="e.g. Old laptop battery and printer packed in bag..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>{isSubmitting ? 'Confirming...' : 'Confirm Pickup Request (+40 Eco-Points)'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
