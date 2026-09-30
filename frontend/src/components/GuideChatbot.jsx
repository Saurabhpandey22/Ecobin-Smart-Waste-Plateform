import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, Compass, HelpCircle, ArrowRight, RefreshCw, Loader2 } from 'lucide-react';
import translations from '../utils/i18n';
import { api } from '../services/api';

export default function GuideChatbot({ user, activeTab, setActiveTab, lang, onOpenReportModal, onOpenQuizModal }) {
  const t = translations[lang] || translations.en;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initial welcome message based on role
    const welcomeText = getRoleWelcomeText(user ? user.role : 'citizen');
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: welcomeText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chips: getRoleChips(user ? user.role : 'citizen')
      }
    ]);
  }, [user, lang]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  function getRoleWelcomeText(role) {
    if (role === 'admin') {
      return `Welcome Admin! 🙏 Main hoon EcoBin AI Assistant. Main aapko Unified Complaints Dashboard, IoT Smart Dustbin Telemetry, Threshold Alerts, aur Staff Route Optimization mein guide kar sakta hoon.`;
    } else if (role === 'staff') {
      return `Namaste Officer! 🙏 Main aapko assigned waste pick-up tasks dekhne, optimized collection routes run karne, aur completion photos upload karne mein madad karunga.`;
    }
    return `Namaste! 🙏 Main hoon EcoBin Smart AI Assistant. Aap mujhse kisi bhi tarah ke kachre ko segregate karne ka tarika, complaint lodge karna, ya Smart Bins live map ke baare mein kuch bhi pooch sakte hain!`;
  }

  function getRoleChips(role) {
    if (role === 'admin') {
      return [
        { label: '📊 Complaints Dashboard', action: 'goto_dashboard' },
        { label: '📡 Monitor IoT Smart Bins', action: 'goto_bins' },
        { label: '🚚 Staff Optimized Routes', action: 'goto_staff' }
      ];
    } else if (role === 'staff') {
      return [
        { label: '📋 View Assigned Tasks', action: 'goto_staff' },
        { label: '🗺️ Open Optimized Route', action: 'goto_staff' },
        { label: '🗑️ Check Bin Fill Level', action: 'goto_bins' }
      ];
    }
    return [
      { label: '🚨 Kachra Report Kaise Karein?', action: 'report_issue' },
      { label: '♻️ Plastic & Dry Waste Guide', action: 'dry_waste' },
      { label: '🥬 Geela Kachra / Compost Tips', action: 'wet_waste' },
      { label: '📍 Live Smart Dustbins Map', action: 'goto_bins' }
    ];
  }

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.sendAIChat({
        message: query,
        userRole: user ? user.role : 'citizen'
      });

      if (res && res.success) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: res.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            chips: res.chips || []
          }
        ]);
      } else {
        throw new Error('Invalid reply');
      }
    } catch (err) {
      console.warn('AI Chat API fallback:', err);
      // Smooth fallback if server had any connection issue
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: `Swachh Bharat & EcoBin Guidance:\n• Grievance report karne ke liye "Citizen Services" mein jayein.\n• Bins monitor karne ke liye "Smart Bins Map" kholein.\n• 🟢 Green = Geela khana, 🔵 Blue = Sukha plastic/paper, 🔴 Red = Chemicals/medicine.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          chips: [
            { label: '🚨 Report Waste Issue', action: 'report_issue' },
            { label: '🗑️ Open Smart Bins Map', action: 'goto_bins' }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chip) => {
    if (chip.action === 'goto_dashboard') {
      setActiveTab('dashboard');
    } else if (chip.action === 'goto_citizen') {
      setActiveTab('citizen');
    } else if (chip.action === 'goto_bins') {
      setActiveTab('bins');
    } else if (chip.action === 'goto_staff') {
      setActiveTab('staff');
    } else if (chip.action === 'report_issue') {
      setActiveTab('citizen');
      if (onOpenReportModal) onOpenReportModal();
    } else if (chip.action === 'play_quiz') {
      setActiveTab('awareness');
      if (onOpenQuizModal) onOpenQuizModal();
    }

    handleSend(chip.label);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group border border-white/20"
        title="Ecobin Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-white animate-ping" />
          </div>
        )}
      </button>

      {/* Expandable Chat Widget Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[540px] glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center space-x-1">
                  <span>EcoBin AI Assistant</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                </h3>
                <span className="text-[11px] text-emerald-100 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
                  <span>24x7 Swachh AI · Online</span>
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-xs whitespace-pre-wrap leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60 font-normal'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{m.time}</span>

                {/* Suggestion Chips */}
                {m.chips && m.chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[92%]">
                    {m.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChipClick(chip)}
                        className="text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl px-2.5 py-1 text-left transition-colors flex items-center space-x-1"
                      >
                        <span>{chip.label}</span>
                        <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Loader Indicator */}
            {loading && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                <span>EcoBin AI soch raha hai...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
              placeholder="Kuch bhi poochiye (e.g. plastic bottle kahan dalein?)..."
              disabled={loading}
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 transition-colors flex items-center justify-center shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </>
  );
}
