import React, { useState, useEffect, useRef } from 'react';
import { 
  Recycle, Bell, Moon, Sun, Globe, User, Shield, 
  MapPin, CheckCircle, AlertTriangle, LogOut, ChevronDown, Sparkles, LogIn, 
  Home, FileText, Package, Truck, Trophy, Phone, Bot, Flame
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Tagline (Ayucare Style) */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('home')}>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Recycle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-100">
                  Ecobin
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  SWACHH
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                24X7 SMART WASTE PLATFORM
              </p>
            </div>
          </div>

          {/* Middle Navigation Pill Container - ROLE-BASED NAVIGATION BAR */}
          <nav className="hidden lg:flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700 space-x-1">
            
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'home'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            {/* Admin Dashboard - visible to Admin */}
            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            )}

            {/* Citizen Services - visible to Citizen, Admin, or Guest */}
            {(!user || user.role === 'citizen' || user.role === 'admin') && (
              <button
                onClick={() => setActiveTab('citizen')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'citizen'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Citizen Services</span>
              </button>
            )}

            {/* Smart Bins Map - visible to Citizen, Staff, Admin */}
            {user && (
              <button
                onClick={() => setActiveTab('bins')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'bins'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <Recycle className="w-3.5 h-3.5" />
                <span>Smart Bins Map</span>
              </button>
            )}

            {/* Staff Routes - visible to Staff or Admin */}
            {(user?.role === 'staff' || user?.role === 'admin') && (
              <button
                onClick={() => setActiveTab('staff')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'staff'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Staff Routes</span>
              </button>
            )}

            {/* Heatmap - visible to Admin */}
            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('heatmap')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'heatmap'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>Heatmap</span>
              </button>
            )}

            {/* Awareness & Quiz - visible to Citizen, Admin, Guest */}
            {(!user || user.role === 'citizen' || user.role === 'admin') && (
              <button
                onClick={() => setActiveTab('awareness')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'awareness'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Awareness & Quiz</span>
              </button>
            )}

            {/* AI Assistant - visible to All */}
            <button
              onClick={() => setActiveTab('ai_chat')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'ai_chat'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Assistant</span>
            </button>

          </nav>

          {/* Right Action Tools - USER ROLE BADGE & AUTH CONTROLS */}
          <div className="flex items-center space-x-2 shrink-0">

            {/* Emergency Helpline Red Pill Button */}
            <a
              href="tel:1916"
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-1.5"
              title="Swachh Emergency Helpline"
            >
              <Phone className="w-4 h-4" />
              <span>1916</span>
            </a>

            {/* Admin Demo Role Switcher (Admin view only) */}
            {user?.role === 'admin' && (
              <div className="relative" ref={roleRef}>
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="px-3 py-2 rounded-xl border border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs transition-all flex items-center space-x-1"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Admin Mode</span>
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 text-xs">
                    <span className="px-3 text-[10px] font-bold text-slate-400 uppercase block mb-1">Switch Test Role:</span>
                    <button
                      onClick={() => { onSwitchRole('admin'); setShowRoleDropdown(false); setActiveTab('dashboard'); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-emerald-600 block"
                    >
                      🛡️ Switch to Admin
                    </button>
                    <button
                      onClick={() => { onSwitchRole('staff'); setShowRoleDropdown(false); setActiveTab('staff'); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-sky-600 block"
                    >
                      🚛 Switch to Staff
                    </button>
                    <button
                      onClick={() => { onSwitchRole('citizen'); setShowRoleDropdown(false); setActiveTab('citizen'); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-amber-600 block"
                    >
                      🏡 Switch to Citizen
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* User Logged In / Login State */}
            {user ? (
              <div className="flex items-center space-x-1.5 pl-1">
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-200 hover:text-rose-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center space-x-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
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
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifModal(!showNotifModal)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifModal && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 py-3 z-50">
                  <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center space-x-1">
                      <Bell className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Notifications</span>
                    </h4>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[10px] font-bold text-emerald-600">
                        Mark read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-[11px]">No new alerts</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-2.5 text-slate-700 dark:text-slate-200">{n.message}</div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
