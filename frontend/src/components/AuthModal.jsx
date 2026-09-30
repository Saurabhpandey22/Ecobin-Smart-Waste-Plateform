import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, Shield, KeyRound, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { api, setAuthToken } from '../services/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('citizen');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupWard, setSignupWard] = useState('Ward 14 - Connaught Place');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.login({
        email: loginEmail,
        password: loginPassword
      });

      if (res.success && res.token) {
        setAuthToken(res.token);
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.signup({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        role: signupRole,
        phone: signupPhone,
        ward_area: signupWard
      });

      if (res.success && res.token) {
        setAuthToken(res.token);
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Signup failed. Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill demo credentials
  const fillDemoUser = (role) => {
    if (role === 'admin') {
      setLoginEmail('admin@ecobin.in');
      setLoginPassword('Password@123');
    } else if (role === 'staff') {
      setLoginEmail('staff@ecobin.in');
      setLoginPassword('Password@123');
    } else {
      setLoginEmail('citizen@ecobin.in');
      setLoginPassword('Password@123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 relative">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
          <X className="w-5 h-5" />
        </button>

        {/* Header Tabs */}
        <div className="text-center">
          <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
            SECURE JWT AUTHENTICATION
          </span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {mode === 'login' ? 'Welcome Back to Ecobin' : 'Create Ecobin Account'}
          </h3>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-xs font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold">
            ✅ {successMsg}
          </div>
        )}

        {/* MODE 1: LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@ecobin.in"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Quick Demo Credentials Buttons (Staff / Citizen only - Admin requires private credentials) */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Quick 1-Click Demo Login:</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button type="button" onClick={() => fillDemoUser('staff')} className="py-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-bold text-[10px] flex items-center justify-center space-x-1">
                  <span>🚛</span>
                  <span>Field Staff</span>
                </button>
                <button type="button" onClick={() => fillDemoUser('citizen')} className="py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px] flex items-center justify-center space-x-1">
                  <span>🏡</span>
                  <span>Citizen Resident</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-colors shadow-md"
            >
              {loading ? 'Logging in...' : 'Sign In to Account'}
            </button>

            <div className="text-center pt-2">
              <span className="text-slate-500">Don't have an account? </span>
              <button type="button" onClick={() => setMode('signup')} className="font-bold text-emerald-600 hover:underline">
                Create New Account
              </button>
            </div>
          </form>
        )}

        {/* MODE 2: SIGNUP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="e.g. Saurabh Pandey"
                className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="saurabh@gmail.com"
                className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Account Role</label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <option value="citizen">Citizen User</option>
                  <option value="staff">Collection Staff</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ward / Area</label>
              <select
                value={signupWard}
                onChange={(e) => setSignupWard(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800"
              >
                <option value="Ward 14 - Connaught Place">Ward 14 - Connaught Place</option>
                <option value="Ward 08 - South Extension">Ward 08 - South Extension</option>
                <option value="Ward 02 - Hauz Khas">Ward 02 - Hauz Khas</option>
                <option value="Ward 22 - Noida Sector 62">Ward 22 - Noida Sector 62</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-colors shadow-md"
            >
              {loading ? 'Creating Account...' : 'Register Account (+50 Welcome Pts)'}
            </button>

            <div className="text-center pt-2">
              <span className="text-slate-500">Already registered? </span>
              <button type="button" onClick={() => setMode('login')} className="font-bold text-emerald-600 hover:underline">
                Sign In
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
