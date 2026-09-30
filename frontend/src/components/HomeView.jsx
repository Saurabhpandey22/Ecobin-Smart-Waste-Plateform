import React, { useState } from 'react';
import { 
  Recycle, PlusCircle, Package, MapPin, Sparkles, Phone, ArrowRight, 
  CheckCircle2, ShieldCheck, AlertCircle, FileText, Camera, RefreshCw, Trophy, Truck, 
  Flame, Bot, QrCode, LineChart, Shield, Zap, Award, Layers
} from 'lucide-react';
import { api } from '../services/api';
import ImageUploader from './ImageUploader';

export default function HomeView({ user, setActiveTab, onOpenReportModal }) {
  const [demoPhotoUrl, setDemoPhotoUrl] = useState('https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80');
  const [demoNotes, setDemoNotes] = useState('Overflowing municipal dustbin near market complex');
  const [aiResult, setAiResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleRunAI = async () => {
    try {
      setAnalyzing(true);
      const res = await api.classifyWaste({ photo_url: demoPhotoUrl, notes: demoNotes });
      if (res.success) {
        setAiResult(res.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSampleSelect = (notes, url) => {
    setDemoNotes(notes);
    if (url) setDemoPhotoUrl(url);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* HERO SECTION WITH GLASS & MODERN GRADIENTS */}
      <div className="relative p-8 sm:p-12 lg:p-14 rounded-[36px] bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-cyan-50/40 dark:from-slate-900 dark:via-emerald-950/30 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/40 shadow-xl shadow-emerald-500/5 overflow-hidden">
        
        {/* Ambient background blur circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/15 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-400/15 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold border border-emerald-300/50 dark:border-emerald-700/50 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>SWACHH BHARAT MISSION 2.0 • SMART SANITATION</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.12]">
              Smart Waste Management <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
                Powered by IoT & AI
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-normal">
              Empowering citizens and municipal staff with live IoT ultrasonic bin telemetry, automated route optimization, instant AI segregation guidance, and eco-rewards.
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => setActiveTab('citizen')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2.5 transform hover:-translate-y-0.5"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Report Waste Issue</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => setActiveTab('bins')}
                className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-extrabold text-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center space-x-2 transform hover:-translate-y-0.5"
              >
                <Recycle className="w-5 h-5 text-emerald-600" />
                <span>View Smart Bins Map</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs font-bold text-slate-600 dark:text-slate-400">
              <span className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Real-Time Ultrasonic Sensors</span>
              </span>
              <span className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Under 30-Min Rapid Dispatch</span>
              </span>
              <span className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Role-Based Secure Console</span>
              </span>
            </div>
          </div>

          {/* Right Hero Interactive AI Card */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-7 rounded-[30px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      EcoBin AI Classifier
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">Instant Waste Analysis</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
                  Online
                </span>
              </div>

              {/* Sample Preset Chips for 1-Click Test */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Test Samples:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSampleSelect('Overflowing dustbin with plastic bottles near gate', 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950 transition-colors"
                  >
                    🗑️ Plastic Bin
                  </button>
                  <button
                    onClick={() => handleSampleSelect('Vegetable peels and food waste heap', 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950 transition-colors"
                  >
                    🥬 Organic Compost
                  </button>
                  <button
                    onClick={() => handleSampleSelect('Discarded old laptop battery and wires')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950 transition-colors"
                  >
                    🔋 E-Waste
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <ImageUploader
                  value={demoPhotoUrl}
                  onChange={(url) => setDemoPhotoUrl(url)}
                  label="Waste Photo Evidence"
                />

                <input
                  type="text"
                  value={demoNotes}
                  onChange={(e) => setDemoNotes(e.target.value)}
                  placeholder="Describe waste (e.g. plastic cups, wet waste)..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-medium focus:outline-emerald-500"
                />

                <button
                  onClick={handleRunAI}
                  disabled={analyzing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 dark:from-emerald-600 dark:to-teal-600 hover:opacity-95 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>{analyzing ? 'Analyzing Composition...' : 'Classify Waste & Award Eco-Points'}</span>
                </button>
              </div>

              {aiResult && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-900 dark:text-emerald-200">
                      Category: {aiResult.typeName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                      {aiResult.confidenceScore} match
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Recommended Bin: <strong className="text-emerald-700 dark:text-emerald-300">{aiResult.binColor}</strong>
                  </p>
                  <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 block">
                    Citizen Reward: +{aiResult.recommendedEcoPoints} Eco-Points
                  </span>
                </div>
              )}

              {/* Emergency Helpline Strip */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Municipal Sanitation Hotline</span>
                  <span className="font-black text-xs text-slate-900 dark:text-slate-100">Toll-Free 1916 / 1800-11-0011</span>
                </div>
                <a 
                  href="tel:1916"
                  className="w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* METRIC PERFORMANCE TICKER STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-[28px] bg-white dark:bg-slate-800/90 shadow-sm border border-slate-200 dark:border-slate-700/80 text-center card-hover">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">99.2%</p>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 block">Resolution SLA Rate</span>
        </div>

        <div className="p-6 rounded-[28px] bg-white dark:bg-slate-800/90 shadow-sm border border-slate-200 dark:border-slate-700/80 text-center card-hover">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-2 font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-teal-600 dark:text-teal-400">18 Mins</p>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 block">Avg Response Time</span>
        </div>

        <div className="p-6 rounded-[28px] bg-white dark:bg-slate-800/90 shadow-sm border border-slate-200 dark:border-slate-700/80 text-center card-hover">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-2 font-bold">
            <Recycle className="w-5 h-5" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-sky-600 dark:text-sky-400">100+ Bins</p>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 block">Live IoT Sensors</span>
        </div>

        <div className="p-6 rounded-[28px] bg-white dark:bg-slate-800/90 shadow-sm border border-slate-200 dark:border-slate-700/80 text-center card-hover">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2 font-bold">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-3xl sm:text-4xl font-black text-amber-500">48,500 kg</p>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 block">Waste Segregated</span>
        </div>
      </div>

      {/* HOW ECOBIN WORKS: 3-STEP INTERACTIVE WORKFLOW */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Automated Lifecycle
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            How EcoBin Streamlines Waste Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            From the moment garbage is flagged to final certified disposal and reward distribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-750 space-y-3 relative">
            <span className="text-4xl font-black text-emerald-500/20 dark:text-emerald-400/20 absolute top-4 right-4">01</span>
            <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              1. Snap & Geo-Tag
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Citizens capture photos of open dumping spots or check real-time fill % of nearest ultrasonic smart bins.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-750 space-y-3 relative">
            <span className="text-4xl font-black text-teal-500/20 dark:text-teal-400/20 absolute top-4 right-4">02</span>
            <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              2. Optimized Route Dispatch
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Our TSP algorithm groups overflowing bins (&gt;80% capacity) and urgent complaints into an optimal staff pickup route.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-750 space-y-3 relative">
            <span className="text-4xl font-black text-amber-500/20 dark:text-amber-400/20 absolute top-4 right-4">03</span>
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
              3. Verification & Rewards
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Field officers upload completion photos. Citizens earn redeemable Eco-Points and track their ward rankings.
            </p>
          </div>

        </div>
      </div>

      {/* ECOBIN CORE PLATFORM MODULES GRID */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Integrated Ecosystem
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Explore Dedicated Platform Consoles
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tailored consoles for Citizens, Sanitation Field Staff, and City Municipal Administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Module 1: Citizen Grievance Portal */}
          <div className="p-6 rounded-[30px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm card-hover flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Citizen Portal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Lodge photo-tagged waste complaints, request door-to-door pickups, and track status with live timeline.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('citizen')}
              className="py-2.5 px-4 rounded-xl border border-emerald-600/80 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors flex items-center justify-between"
            >
              <span>Lodge Complaint</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Module 2: Smart Bins Live Map */}
          <div className="p-6 rounded-[30px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm card-hover flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                <Recycle className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Smart Bins Live Map
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Interactive Leaflet map showing ultrasonic fill %, battery levels, and automatic threshold alerts.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('bins')}
              className="py-2.5 px-4 rounded-xl border border-teal-600/80 text-teal-600 dark:text-teal-400 font-bold text-xs hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors flex items-center justify-between"
            >
              <span>Open Bin Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Module 3: Staff Task Console */}
          <div className="p-6 rounded-[30px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm card-hover flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Staff Route Console
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Turn-by-turn sanitation collection route combining high-priority bins and verified citizen issues.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('staff')}
              className="py-2.5 px-4 rounded-xl border border-sky-600/80 text-sky-600 dark:text-sky-400 font-bold text-xs hover:bg-sky-50 dark:hover:bg-sky-950 transition-colors flex items-center justify-between"
            >
              <span>View Route</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Module 4: Eco Gamification */}
          <div className="p-6 rounded-[30px] bg-white dark:bg-slate-800 border border-emerald-500/50 shadow-sm card-hover flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-emerald-700 dark:text-emerald-300">
                Eco Rewards & Quiz
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Interactive waste segregation quizzes, community leaderboards, and redeemable green points.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('awareness')}
              className="py-2.5 px-4 rounded-xl border border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors flex items-center justify-between"
            >
              <span>Play & Earn</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Module 5: AI Assistant */}
          <div className="p-6 rounded-[30px] bg-white dark:bg-slate-800 border border-cyan-500/50 shadow-sm card-hover flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-bold">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                AI Guidance Chat
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ask our AI assistant for instant waste disposal guidelines, composting instructions, and e-waste handling.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('ai_chat')}
              className="py-2.5 px-4 rounded-xl border border-cyan-600 text-cyan-600 dark:text-cyan-400 font-bold text-xs hover:bg-cyan-50 dark:hover:bg-cyan-950 transition-colors flex items-center justify-between"
            >
              <span>Open AI Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Module 6: Hotspot Heatmap */}
          <div className="p-6 rounded-[30px] bg-white dark:bg-slate-800 border border-rose-500/40 shadow-sm card-hover flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center font-bold">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Hotspot Heatmap
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Visualize complaint density across city municipal wards to allocate extra sweepers and dustbins.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('heatmap')}
              className="py-2.5 px-4 rounded-xl border border-rose-600 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors flex items-center justify-between"
            >
              <span>View Heatmap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Module 7: Sustainability Audit Report */}
          <div className="p-6 rounded-[30px] bg-white dark:bg-slate-800 border border-purple-500/40 shadow-sm card-hover flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Sustainability Audit
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Download verified ward-level environmental impact reports with carbon footprint & recycling metrics.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="py-2.5 px-4 rounded-xl border border-purple-600 text-purple-600 dark:text-purple-400 font-bold text-xs hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors flex items-center justify-between"
            >
              <span>Generate Audit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Module 8: Unified Admin Control */}
          <div className="p-6 rounded-[30px] bg-white dark:bg-slate-800 border border-teal-500/40 shadow-sm card-hover flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Admin Control Room
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Master sanitation grievance triage, staff assignment, SLA escalations, and ward-level oversight.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="py-2.5 px-4 rounded-xl border border-teal-600 text-teal-600 dark:text-teal-400 font-bold text-xs hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors flex items-center justify-between"
            >
              <span>Open Control Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
