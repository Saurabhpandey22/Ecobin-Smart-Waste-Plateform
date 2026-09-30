import React, { useState, useEffect, useRef } from 'react';
import { 
  Recycle, Bell, Moon, Sun, Globe, User, Shield, 
  MapPin, CheckCircle, AlertTriangle, LogOut, ChevronDown, Sparkles, LogIn, 
  Home, FileText, Package, Truck, Trophy, Phone, Bot, Flame, Menu, X, Radio
} from 'lucide-react';
import translations from '../utils/i18n';
import { api, socket } from '../services/api';

export default function Navbar({ 
  user, 
  onLogout, 
  activeTab, 
  setActiveTab, 
  lang, 
  setLang, 
  darkMode, 
  setDarkMode,
  onSwitchRole,
  onOpenAuthModal 
}) {
  const t = translations[lang] || translations.en;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const roleRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifModal(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsSocketConnected(socket.connected);

    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadNotifications();

      const eventName = `notification_user_${user.id}`;
      const handleNotif = (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
      };

      socket.on(eventName, handleNotif);
      socket.on('threshold_alert', () => loadNotifications());

      return () => {
        socket.off(eventName, handleNotif);
      };
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.markNotificationRead('all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 transition-all">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => handleNavClick('home')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/20">
              <Recycle className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-800 dark:from-white dark:via-slate-100 dark:to-emerald-400">
                  EcoBin
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/40">
                  SWACHH AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide">
                Smart Waste Intelligence Platform
              </p>
            </div>
          </div>

          {/* IoT Real-Time Status Pill */}
          <div className="hidden xl:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSocketConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isSocketConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="font-mono text-[11px]">{isSocketConnected ? 'Telemetry Active' : 'Connecting...'}</span>
          </div>

          {/* Desktop Middle Navigation Pill Container */}
          <nav className="hidden lg:flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-x-1 shadow-inner">
            
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'home'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            {/* Admin Dashboard */}
            {user?.role === 'admin' && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            )}

            {/* Citizen Services */}
            {(!user || user.role === 'citizen' || user.role === 'admin') && (
              <button
                onClick={() => handleNavClick('citizen')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'citizen'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Citizen Services</span>
              </button>
            )}

            {/* Smart Bins Map */}
            {user && (
              <button
                onClick={() => handleNavClick('bins')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'bins'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <Recycle className="w-3.5 h-3.5" />
                <span>Smart Bins</span>
              </button>
            )}

            {/* Staff Routes */}
            {(user?.role === 'staff' || user?.role === 'admin') && (
              <button
                onClick={() => handleNavClick('staff')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'staff'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Staff Console</span>
              </button>
            )}

            {/* Heatmap */}
            {user?.role === 'admin' && (
              <button
                onClick={() => handleNavClick('heatmap')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'heatmap'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>Hotspots</span>
              </button>
            )}

            {/* Awareness & Rewards */}
            {(!user || user.role === 'citizen' || user.role === 'admin') && (
              <button
                onClick={() => handleNavClick('awareness')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'awareness'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Eco Rewards</span>
              </button>
            )}

            {/* AI Assistant */}
            <button
              onClick={() => handleNavClick('ai_chat')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'ai_chat'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/25'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-500" />
              <span>AI Assistant</span>
            </button>

          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2.5 shrink-0">

            {/* Helpline Pill Button */}
            <a
              href="tel:1916"
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center space-x-1.5"
              title="Swachh Emergency Helpline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">1916</span>
            </a>

            {/* Admin Demo Role Switcher */}
            {user?.role === 'admin' && (
              <div className="relative" ref={roleRef}>
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="px-3 py-2 rounded-xl border border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs transition-all flex items-center space-x-1 hover:border-emerald-500"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Admin Mode</span>
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Switch Test Role:</span>
                    <button
                      onClick={() => { onSwitchRole('admin'); setShowRoleDropdown(false); handleNavClick('dashboard'); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-semibold text-emerald-600 flex items-center space-x-2"
                    >
                      <span>🛡️</span>
                      <span>Admin View</span>
                    </button>
                    <button
                      onClick={() => { onSwitchRole('staff'); setShowRoleDropdown(false); handleNavClick('staff'); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-semibold text-sky-600 flex items-center space-x-2"
                    >
                      <span>🚛</span>
                      <span>Staff View</span>
                    </button>
                    <button
                      onClick={() => { onSwitchRole('citizen'); setShowRoleDropdown(false); handleNavClick('citizen'); }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-semibold text-amber-600 flex items-center space-x-2"
                    >
                      <span>🏡</span>
                      <span>Citizen View</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* User Logged In / Login State */}
            {user ? (
              <div className="flex items-center space-x-1.5 pl-1">
                <div className="px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5 shadow-xs">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="max-w-[85px] sm:max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-300 hover:text-rose-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span className="absolute -top-1 -right-1 px-1 bg-emerald-500 text-white font-bold text-[8px] rounded-full">
                {lang.toUpperCase()}
              </span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifModal(!showNotifModal)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifModal && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                      <Bell className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Live Alerts & Notifications</span>
                    </h4>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[10px] font-bold text-emerald-600 hover:underline">
                        Mark read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-5 text-center text-slate-400 text-xs">No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-colors">
                          <p className="font-medium text-xs leading-snug">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                            {n.created_at ? new Date(n.created_at).toLocaleTimeString() : 'Just now'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Slide-down Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 animate-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold ${activeTab === 'home' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Home className="w-4 h-4" />
              <span>Home Overview</span>
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <FileText className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </button>
            )}

            {(!user || user.role === 'citizen' || user.role === 'admin') && (
              <button
                onClick={() => handleNavClick('citizen')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold ${activeTab === 'citizen' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Package className="w-4 h-4" />
                <span>Citizen Reporting & Grievance</span>
              </button>
            )}

            {user && (
              <button
                onClick={() => handleNavClick('bins')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold ${activeTab === 'bins' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Recycle className="w-4 h-4" />
                <span>Smart Bins Live Map</span>
              </button>
            )}

            {(user?.role === 'staff' || user?.role === 'admin') && (
              <button
                onClick={() => handleNavClick('staff')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold ${activeTab === 'staff' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Truck className="w-4 h-4" />
                <span>Staff Pickup Console</span>
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => handleNavClick('heatmap')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold ${activeTab === 'heatmap' ? 'bg-rose-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Waste Heatmap</span>
              </button>
            )}

            {(!user || user.role === 'citizen' || user.role === 'admin') && (
              <button
                onClick={() => handleNavClick('awareness')}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold ${activeTab === 'awareness' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Eco Awareness & Quiz</span>
              </button>
            )}

            <button
              onClick={() => handleNavClick('ai_chat')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold ${activeTab === 'ai_chat' ? 'bg-cyan-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>AI Waste Segregation Assistant</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
}
