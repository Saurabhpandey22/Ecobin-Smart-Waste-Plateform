import React, { useState } from 'react';
import { 
  Recycle, PlusCircle, Package, MapPin, Sparkles, Phone, ArrowRight, 
  CheckCircle2, ShieldCheck, AlertCircle, FileText, Camera, RefreshCw, Trophy, Truck, 
  Flame, Bot, QrCode, LineChart, Key
} from 'lucide-react';
import { api } from '../services/api';

import ImageUploader from './ImageUploader';

export default function HomeView({ user, setActiveTab, onOpenReportModal }) {
  const [demoPhotoUrl, setDemoPhotoUrl] = useState('https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80');
  const [demoNotes, setDemoNotes] = useState('Overflowing bin near market gate');
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

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* HERO BANNER SECTION - AYUCARE STYLE MINT GREEN CARD */}
      <div className="p-8 sm:p-12 rounded-[36px] bg-gradient-to-br from-emerald-50/90 via-teal-50/80 to-emerald-100/60 dark:from-slate-850 dark:via-emerald-950/40 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/40 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>24/7 SWACHH BHARAT SMART WASTE PLATFORM</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.15]">
              Waste Management Made <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400">
                Simple, Fast & Reliable
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-medium">
              Report overflowing garbage, track doorstep waste pickups, monitor IoT ultrasonic smart dustbins in real-time, and earn Eco Points with Ecobin AI guidance.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('citizen')}
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Report Waste Issue →</span>
              </button>

              <button
                onClick={() => setActiveTab('citizen')}
                className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center space-x-2"
              >
                <Package className="w-5 h-5 text-emerald-600" />
                <span>Schedule Doorstep Pickup</span>
              </button>
            </div>

            {/* Verification Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400 pt-2">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>100+ IoT Bins Tracked</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Under 30-Min Staff Dispatch</span>
              </span>
            </div>
          </div>

          {/* Right Hero Interactive AI Card */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-[28px] bg-white dark:bg-slate-800 shadow-xl border border-slate-200/80 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  ● Live Active AI
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
                  Instant AI Waste Classifier
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Upload garbage photo or description to auto-detect waste type, bin color, and disposal procedure.
                </p>
              </div>

              <div className="space-y-3">
                <ImageUploader
                  value={demoPhotoUrl}
                  onChange={(url) => setDemoPhotoUrl(url)}
                  label="Upload Waste Photo from Device"
                  presetSamples={[
                    { label: '🗑️ Overflowing Bin', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80' },
                    { label: '🥬 Organic Waste', url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80' }
                  ]}
                />

                <input
                  type="text"
                  value={demoNotes}
                  onChange={(e) => setDemoNotes(e.target.value)}
                  placeholder="Describe waste issue (e.g. plastic bottles, vegetable peels)..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-medium"
                />

                <button
                  onClick={handleRunAI}
                  disabled={analyzing}
                  className="w-full py-3 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>{analyzing ? 'Analyzing Image...' : 'Classify Waste & Calculate Points'}</span>
                </button>
              </div>

              {aiResult && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1 animate-in fade-in">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                    Result: {aiResult.typeName} ({aiResult.confidenceScore})
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 block">
                    Use: <strong>{aiResult.binColor}</strong>
                  </span>
                  <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 block">
                    Eco Points: +{aiResult.recommendedEcoPoints} pts
                  </span>
                </div>
              )}

              {/* Emergency Contact Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Swachh Municipal Helpline</span>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">WhatsApp & Call: 1916 / 1800-11-0011</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* STATS ROW - AYUCARE 4 CARD METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-[28px] bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">500+</p>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 block">Complaints Resolved</span>
        </div>

        <div className="p-6 rounded-[28px] bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-3xl sm:text-4xl font-black text-teal-600 dark:text-teal-400">12+</p>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 block">IoT Smart Bins Active</span>
        </div>

        <div className="p-6 rounded-[28px] bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-3xl sm:text-4xl font-black text-rose-500">10+</p>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 block">GPS Route Vehicles</span>
        </div>

        <div className="p-6 rounded-[28px] bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-3xl sm:text-4xl font-black text-cyan-600 dark:text-cyan-400">2000+</p>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 block">Clean Ambassadors</span>
        </div>
      </div>

      {/* REAL-WORLD ECOBIN MODULES GRID - EXPANDED 8 CARDS LAYOUT */}
      <div className="space-y-4">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Ecobin Real-World Modules & Features
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Explore integrated municipal grievance logging, smart dustbin maps, AI Chatbot guidance, route planning, and eco-rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
          
          {/* Card 1 */}
          <div className="p-6 rounded-[32px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Report Garbage & Overflow
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Upload waste photo with GPS pin. Our AI automatically classifies waste and alerts sanitation officers.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('citizen')}
              className="py-2.5 px-4 rounded-xl border border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors flex items-center justify-between"
            >
              <span>Open</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-[32px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Recycle className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Smart Bins Live Map
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Monitor ultrasonic fill levels, battery status, and threshold alerts for smart dustbins in real-time.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('bins')}
              className="py-2.5 px-4 rounded-xl border border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors flex items-center justify-between"
            >
              <span>Open</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-[32px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Staff Route Optimizer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                TSP algorithm combines high fill bins and citizen complaints into an ordered turn-by-turn route.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('staff')}
              className="py-2.5 px-4 rounded-xl border border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors flex items-center justify-between"
            >
              <span>Open</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-[32px] bg-white dark:bg-slate-800 border border-emerald-500 shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-emerald-700 dark:text-emerald-300">
                Segregation Quiz & Points
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Learn waste segregation rules, complete interactive quizzes, and earn rewards on society leaderboards.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('awareness')}
              className="py-2.5 px-4 rounded-xl border border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors flex items-center justify-between"
            >
              <span>Open</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 5: AI CHATBOT CARD */}
          <div className="p-6 rounded-[32px] bg-white dark:bg-slate-800 border border-cyan-500/50 shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                <Bot className="w-6 h-6 text-cyan-600" />
              </div>
              <div className="flex items-center space-x-1">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  Ecobin AI Assistant
                </h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-cyan-100 text-cyan-800">
                  API Key Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Chat with our AI Assistant powered by API key <code className="text-[10px] bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded">sk_uvpqaay4...</code> for instant guidance.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('ai_chat')}
              className="py-2.5 px-4 rounded-xl border border-cyan-600 text-cyan-600 dark:text-cyan-400 font-bold text-xs hover:bg-cyan-50 dark:hover:bg-cyan-950 transition-colors flex items-center justify-between"
            >
              <span>Launch AI Chat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 6: HOTSPOT HEATMAP ANALYTICS */}
          <div className="p-6 rounded-[32px] bg-white dark:bg-slate-800 border border-rose-500/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center font-bold">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Hotspot Heatmap Analytics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Visualize real-time complaint density and chronic garbage dumping hotspots across city wards.
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

          {/* Card 7: SUSTAINABILITY REPORTS */}
          <div className="p-6 rounded-[32px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Sustainability Audit Reports
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Auto-generate monthly PDF impact reports detailing carbon offset, recycling %, and landfill diversion.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="py-2.5 px-4 rounded-xl border border-purple-600 text-purple-600 dark:text-purple-400 font-bold text-xs hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors flex items-center justify-between"
            >
              <span>View Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 8: UNIFIED ADMIN COMPLAINTS DASHBOARD */}
          <div className="p-6 rounded-[32px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Unified Admin Dashboard
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Centralized grievance control center for monitoring complaints, inline staff dispatch, and SLA metrics.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="py-2.5 px-4 rounded-xl border border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors flex items-center justify-between"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
