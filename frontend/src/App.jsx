import { useState, useEffect } from 'react';
import { Lock, ShieldAlert } from 'lucide-react';
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

import { api, setAuthToken, getAuthToken } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); // Default landing page: 'home'
  const [lang, setLang] = useState('en'); // 'en' | 'hi'
  const [darkMode, setDarkMode] = useState(false);
  const [showSustainabilityModal, setShowSustainabilityModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Initialize Auth on App Load (Preserves JWT token across page refresh)
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
          return;
        }
      }
      // If no stored token or token invalid, clear state to guest mode
      setUser(null);
      setAuthToken(null);
    } catch (err) {
      console.warn('Auth token verification error:', err);
      setUser(null);
      setAuthToken(null);
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

    </div>
  );
}
