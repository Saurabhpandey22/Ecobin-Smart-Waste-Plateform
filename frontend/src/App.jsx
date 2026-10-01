import { useState, useEffect } from 'react';
import { Lock, ShieldAlert, AlertTriangle, X, Bell, Radio } from 'lucide-react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import GuideChatbot from './components/GuideChatbot';
import AdminComplaintsDashboard from './components/AdminComplaintsDashboard';
import CitizenPortal from './components/CitizenPortal';
import SmartBinsView from './components/SmartBinsView';
import StaffTaskView from './components/StaffTaskView';
import WasteAwarenessGamification from './components/WasteAwarenessGamification';
import SustainabilityReportModal from './components/SustainabilityReportModal';
import AuthModal from './components/AuthModal';
import HeatmapView from './components/HeatmapView';
import AIAssistantView from './components/AIAssistantView';
import Footer from './components/Footer';

import { api, setAuthToken, getAuthToken, socket } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); // Default landing page: 'home' for guests
  const [lang, setLang] = useState('en'); // 'en' | 'hi'
  const [darkMode, setDarkMode] = useState(false);
  const [showSustainabilityModal, setShowSustainabilityModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [activeAlert, setActiveAlert] = useState(null);

  // Play audio synthesizer alert sound & voice announcement on threshold breach
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playBeep = (freq, startTime, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      playBeep(880, now, 0.2);
      playBeep(1174, now + 0.25, 0.2);
      playBeep(1567, now + 0.5, 0.35);
    } catch (e) {}

    // Text-to-speech announcement
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("Alert! Dustbin full. Capacity exceeded 80 percent.");
        utterance.rate = 1.05;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {}
  };

  // Socket listener for dustbin full (>= 80%) threshold alert
  useEffect(() => {
    const handleThresholdAlert = (alertData) => {
      setActiveAlert(alertData);
      playAlertSound();

      // Native desktop notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`🚨 DUSTBIN FULL ALERT (${alertData.fillPercentage}%)`, {
          body: `Smart Dustbin ${alertData.binCode || 'BIN001'} reached ${alertData.fillPercentage}% capacity! Immediate clearance required.`,
          icon: '/favicon.ico'
        });
      }
    };

    // Request notification permission once
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    socket.on('threshold_alert', handleThresholdAlert);

    return () => {
      socket.off('threshold_alert', handleThresholdAlert);
    };
  }, []);

  // Initialize Auth on App Load (Preserves user JWT token across page refresh)
  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const existingToken = getAuthToken();
      if (existingToken) {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          if (res.user.role === 'admin') {
            setActiveTab('dashboard');
          } else if (res.user.role === 'staff') {
            setActiveTab('staff');
          } else {
            setActiveTab('citizen');
          }
          return;
        }
      }
      // If no stored token or token invalid, clean state to guest mode
      setUser(null);
      setAuthToken(null);
      setActiveTab('home');
    } catch (err) {
      console.warn('Auth token verification error:', err);
      setUser(null);
      setAuthToken(null);
      setActiveTab('home');
    } finally {
      setInitializing(false);
    }
  };

  // Apply dark mode class to html document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle switching demo roles (Admin, Staff, Citizen) seamlessly via real backend token
  const handleSwitchRole = async (roleKey) => {
    try {
      const res = await api.demoSwitchRole(roleKey);
      if (res.success) {
        setAuthToken(res.token);
        setUser(res.user);
      }
    } catch (err) {
      console.error('Demo role switch error:', err);
    }
  };

  const handleLoginSuccess = (userObj) => {
    setUser(userObj);
    if (userObj.role === 'admin') setActiveTab('dashboard');
    else if (userObj.role === 'staff') setActiveTab('staff');
    else setActiveTab('citizen');
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setActiveTab('home');
  };

  // Role-based view protection helper
  const renderActiveView = () => {
    // Unauthenticated user trying to access role-protected tabs
    if (!user && (activeTab === 'dashboard' || activeTab === 'staff' || activeTab === 'citizen' || activeTab === 'bins')) {
      return (
        <div className="p-8 text-center glass-panel max-w-md mx-auto rounded-3xl my-12 space-y-4 border border-amber-200 dark:border-amber-900 bg-white/90 dark:bg-slate-800/90 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-black text-xl text-slate-900 dark:text-slate-100">Sign In Required</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Please sign in to your Ecobin account to access Citizen Services, Smart Bins, Staff Console, or Admin Control.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            Sign In / Create Account
          </button>
        </div>
      );
    }

    // Role-specific view protection
    if (user) {
      if (user.role === 'citizen' && (activeTab === 'dashboard' || activeTab === 'staff' || activeTab === 'heatmap')) {
        return (
          <div className="p-8 text-center glass-panel max-w-md mx-auto rounded-3xl my-12 space-y-4 border border-rose-200 dark:border-rose-900 bg-white/90 dark:bg-slate-800/90 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-black text-xl text-slate-900 dark:text-slate-100">Access Restricted</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This area is reserved for Municipal Sanitation Staff & System Administrators.
            </p>
            <button
              onClick={() => setActiveTab('citizen')}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Return to Citizen Portal
            </button>
          </div>
        );
      }

      if (user.role === 'staff' && (activeTab === 'dashboard' || activeTab === 'citizen')) {
        return (
          <div className="p-8 text-center glass-panel max-w-md mx-auto rounded-3xl my-12 space-y-4 border border-rose-200 dark:border-rose-900 bg-white/90 dark:bg-slate-800/90 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-black text-xl text-slate-900 dark:text-slate-100">Access Restricted</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This area is reserved for Citizen reporting or Municipal Admin management.
            </p>
            <button
              onClick={() => setActiveTab('staff')}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Return to Staff Tasks
            </button>
          </div>
        );
      }
    }

    switch (activeTab) {
      case 'home':
        return <HomeView user={user} setActiveTab={setActiveTab} />;
      case 'dashboard':
        return <AdminComplaintsDashboard user={user} lang={lang} onOpenSustainabilityReport={() => setShowSustainabilityModal(true)} />;
      case 'citizen':
        return <CitizenPortal user={user} lang={lang} />;
      case 'bins':
        return <SmartBinsView user={user} lang={lang} />;
      case 'staff':
        return <StaffTaskView user={user} lang={lang} />;
      case 'awareness':
        return <WasteAwarenessGamification user={user} lang={lang} />;
      case 'heatmap':
        return <HeatmapView />;
      case 'ai_chat':
        return <AIAssistantView user={user} setActiveTab={setActiveTab} />;
      default:
        return <HomeView user={user} setActiveTab={setActiveTab} />;
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
        🌱 Initializing Ecobin Smart Platform...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 bg-mesh-light dark:bg-mesh-dark text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      
      {/* Top Navigation Bar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onSwitchRole={handleSwitchRole}
        onOpenAuthModal={() => setShowAuthModal(true)}
      />

      {/* Main Body Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6">
        {renderActiveView()}
      </main>

      {/* Rich Ayucare-Style Footer */}
      <Footer setActiveTab={setActiveTab} />

      {/* Onboarding Guide Chatbot Floating Widget */}
      <GuideChatbot
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
      />

      {/* Sustainability Impact Report Modal */}
      <SustainabilityReportModal
        isOpen={showSustainabilityModal}
        onClose={() => setShowSustainabilityModal(false)}
      />

      {/* Login & Signup Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Floating Real-Time DUSTBIN FULL (>=80%) Alert Toast Banner */}
      {activeAlert && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 max-w-md w-[calc(100%-2rem)] p-4 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white border-2 border-rose-500 shadow-2xl shadow-rose-500/40 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-bounce">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full tracking-wider uppercase">
                    DUSTBIN FULL ({activeAlert.fillPercentage}%)
                  </span>
                  <span className="text-[10px] text-rose-300 font-mono">
                    {activeAlert.binCode}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-white mt-1">
                  Waste Capacity Exceeded 80%!
                </h4>
                <p className="text-xs text-rose-200/80 mt-0.5">
                  {activeAlert.message || `Dustbin reached ${activeAlert.fillPercentage}%. Immediate clearance required.`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveAlert(null)}
              className="p-1 rounded-full text-rose-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-end space-x-2 pt-2 border-t border-rose-800/40">
            <button
              onClick={() => {
                setActiveTab('bins');
                setActiveAlert(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              View Dustbin
            </button>
            <button
              onClick={() => setActiveAlert(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
