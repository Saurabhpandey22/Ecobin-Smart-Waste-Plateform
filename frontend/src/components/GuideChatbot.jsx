import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, Compass, HelpCircle, ArrowRight, RefreshCw } from 'lucide-react';
import translations from '../utils/i18n';

export default function GuideChatbot({ user, activeTab, setActiveTab, lang, onOpenReportModal, onOpenQuizModal }) {
  const t = translations[lang] || translations.en;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
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
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  function getRoleWelcomeText(role) {
    if (role === 'admin') {
      return `Welcome Admin! I can guide you through the Unified Complaints Dashboard, IoT Smart Dustbin Telemetry, Threshold Alerts, and Staff Route Optimization.`;
    } else if (role === 'staff') {
      return `Namaste Officer! I am here to help you view assigned waste pick-up tasks, execute smart optimized collection routes, and upload proof photos.`;
    }
    return `Namaste! I am your Ecobin Smart Guide. How can I help you keep our city clean today? You can ask me how to report overflowing waste, track complaints, or earn Eco Points!`;
  }

  function getRoleChips(role) {
    if (role === 'admin') {
      return [
        { label: '📊 View Admin Complaints Dashboard', action: 'goto_dashboard' },
        { label: '📡 Monitor IoT Smart Bins', action: 'goto_bins' },
        { label: '🚚 Check Staff Optimized Routes', action: 'goto_staff' },
        { label: '📄 Generate Sustainability Report', action: 'sustainability_report' }
      ];
    } else if (role === 'staff') {
      return [
        { label: '📋 View Assigned Tasks', action: 'goto_staff' },
        { label: '🗺️ Open Optimized Route', action: 'goto_staff' },
        { label: '🗑️ Check Bin Fill Telemetry', action: 'goto_bins' }
      ];
    }
    return [
      { label: '🚨 Report Overflowing Waste', action: 'report_issue' },
      { label: '📦 Schedule Doorstep Pickup', action: 'goto_citizen' },
      { label: '📍 Live Smart Dustbins Map', action: 'goto_bins' },
      { label: '🌱 Waste Segregation Quiz (+Points)', action: 'play_quiz' }
    ];
  }

  const handleSend = (textToSend = null) => {
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

    // Generate intelligent response & deep links
    setTimeout(() => {
      const botResponse = generateBotResponse(query, user ? user.role : 'citizen');
      setMessages(prev => [...prev, botResponse]);
    }, 400);
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

  function generateBotResponse(query, role) {
    const q = query.toLowerCase();
    let text = '';
    let chips = [];

    if (q.includes('report') || q.includes('overflow') || q.includes('garbage') || q.includes('dustbin')) {
      text = `To report an issue:\n1. Go to Citizen Services.\n2. Click "Report Waste Issue".\n3. Upload a photo or let our AI Waste Classifier automatically detect the waste type!\n4. Select location pin on the map and submit. You earn +30 Eco Points instantly!`;
      chips = [{ label: 'Open Report Form Now', action: 'report_issue' }];
    } else if (q.includes('track') || q.includes('status') || q.includes('my complaint')) {
      text = `You can track all your submitted complaints in real-time under the "Citizen Services -> My Complaints" timeline. Status updates from staff will show live!`;
      chips = [{ label: 'View My Complaints', action: 'goto_citizen' }];
    } else if (q.includes('smart bin') || q.includes('map') || q.includes('level') || q.includes('telemetry')) {
      text = `Our Smart Dustbins use ESP32 ultrasonic sensors to transmit fill percentages in real-time. Green marker (<50%), Yellow (50-80%), and Red (>80% overflow).`;
      chips = [{ label: 'Open Smart Bins Map', action: 'goto_bins' }];
    } else if (q.includes('segregate') || q.includes('recycle') || q.includes('green bin') || q.includes('blue bin')) {
      text = `Segregation Guidelines:\n• Green Bin = Wet/Organic Waste (food peels, garden waste)\n• Blue Bin = Dry Recyclables (plastic, paper, glass)\n• Red Bin = Household Hazardous (paints, batteries, syringes)\n• E-Waste = Schedule doorstep pickup!`;
      chips = [{ label: 'Play Waste Quiz (+Points)', action: 'play_quiz' }];
    } else {
      text = `I can navigate you anywhere on the platform! What would you like to do next?`;
      chips = getRoleChips(role);
    }

    return {
      id: Date.now() + 1,
      sender: 'bot',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chips
    };
  }

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
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[520px] glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center space-x-1">
                  <span>{t.chatTitle}</span>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                </h3>
                <span className="text-[11px] text-emerald-100 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
                  <span>Role: {user ? user.role.toUpperCase() : 'CITIZEN'}</span>
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs whitespace-pre-wrap leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{m.time}</span>

                {/* Suggestion Chips */}
                {m.chips && m.chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {m.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChipClick(chip)}
                        className="text-[11px] font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl px-2.5 py-1 text-left transition-colors flex items-center space-x-1"
                      >
                        <span>{chip.label}</span>
                        <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.chatPlaceholder}
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => handleSend()}
              className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </>
  );
}
