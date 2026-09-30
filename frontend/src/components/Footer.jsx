import React from 'react';
import { Recycle, Phone, Mail, MapPin, Globe, Shield, Heart, ExternalLink } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Top 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
                <Recycle className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">Ecobin</span>
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SWACHH
                </span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  24X7 SMART WASTE PLATFORM
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Full-stack production IoT smart waste management platform connecting Citizens, Collection Staff, Administrators, and ESP32 ultrasonic dustbins under the "Swachh Bharat Swastha Bharat" initiative.
            </p>

            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Verified Government & Municipal Standard</span>
            </div>
          </div>

          {/* Column 2: Platform Core Modules */}
          <div className="space-y-3 text-xs">
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Platform Modules
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('home')} className="hover:text-emerald-400 transition-colors">
                  🏠 Home Landing Page
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('citizen')} className="hover:text-emerald-400 transition-colors">
                  🚨 Report Garbage & Overflow
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('bins')} className="hover:text-emerald-400 transition-colors">
                  🗑️ Smart Bins Live Map & Telemetry
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('staff')} className="hover:text-emerald-400 transition-colors">
                  🚛 Staff Smart Route Optimization
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('heatmap')} className="hover:text-emerald-400 transition-colors">
                  🗺️ Hotspot Heatmap Analytics
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-emerald-400 transition-colors">
                  📊 Unified Complaints Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Citizens & RWAs */}
          <div className="space-y-3 text-xs">
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Citizens & RWAs
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('citizen')} className="hover:text-emerald-400 transition-colors">
                  📦 Doorstep Waste Segregation Pickup
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('awareness')} className="hover:text-emerald-400 transition-colors">
                  🧠 Waste Segregation Quiz (+Points)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('awareness')} className="hover:text-emerald-400 transition-colors">
                  🏆 RWA Society & Campus Leaderboards
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('ai_chat')} className="hover:text-emerald-400 transition-colors">
                  🤖 Ecobin AI Assistant (API Key Active)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Helpline */}
          <div className="space-y-3 text-xs">
            <h4 className="font-extrabold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Swachh Helpline
            </h4>
            
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Municipal Helpline</span>
              <a href="tel:1916" className="text-base font-black text-rose-400 hover:underline block">
                📞 Call Helpline: 1916
              </a>
              <span className="text-[11px] text-slate-300 block">WhatsApp: +91 95691 41861</span>
            </div>

            <div className="space-y-1 text-slate-400 text-[11px]">
              <p>📍 Central Secretariat Ward 14, New Delhi</p>
              <p>✉️ help@ecobin.in | support@swachhbharat.gov.in</p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Footer Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <span>© 2026 <strong>Ecobin Platform</strong>. All Rights Reserved.</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Swachh Guidelines</span>
          </div>

          <span className="text-emerald-400 font-semibold flex items-center space-x-1">
            <span>Made with 💚 in India</span>
          </span>
        </div>

      </div>
    </footer>
  );
}
