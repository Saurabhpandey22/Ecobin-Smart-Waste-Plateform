import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function AIAssistantView({ user, setActiveTab }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello! I am your Ecobin Swachh AI Conversational Assistant. How can I guide your waste management today? Ask me about reporting grievances, recycling rules, smart dustbins, or route optimization!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chips: [
        { label: '🚨 How to report waste overflow?', action: 'report_issue' },
        { label: '🗑️ Explain Smart Bins ultrasonic sensors', action: 'goto_bins' },
        { label: '🧠 Explain Green vs Blue Bins rules', action: 'play_quiz' },
        { label: '🗺️ Show Hotspot Heatmap', action: 'goto_heatmap' }
      ]
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (queryText = null) => {
    const query = (queryText || input).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await api.sendAIChat({
        message: query,
        userRole: user ? user.role : 'citizen'
      });

      if (res.success) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            text: res.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            chips: res.chips || []
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chip) => {
    if (chip.action === 'goto_citizen' || chip.action === 'report_issue') setActiveTab('citizen');
    else if (chip.action === 'goto_bins') setActiveTab('bins');
    else if (chip.action === 'goto_staff') setActiveTab('staff');
    else if (chip.action === 'goto_heatmap') setActiveTab('heatmap');
    else if (chip.action === 'play_quiz') setActiveTab('awareness');

    handleSend(chip.label);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-800 via-emerald-900 to-slate-900 text-white shadow-xl flex items-center justify-between border border-emerald-700/40">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black">Ecobin AI Conversational Assistant</h1>
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
            <span className="text-xs text-emerald-200 flex items-center space-x-1 mt-0.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Swachh AI Engine · Powered by Ecobin</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Window Card */}
      <div className="p-6 rounded-3xl glass-panel bg-white/95 dark:bg-slate-800/95 shadow-xl border border-slate-200 dark:border-slate-700 h-[560px] flex flex-col justify-between">
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1">{m.time}</span>

              {m.chips && m.chips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                  {m.chips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChipClick(chip)}
                      className="text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-1.5 text-left transition-colors flex items-center space-x-1"
                    >
                      <span>{chip.label}</span>
                      <ArrowRight className="w-3 h-3 text-emerald-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
              <span>AI Engine processing query...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI about waste segregation, reporting overflow, smart bins, route planning..."
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
          />
          <button
            onClick={() => handleSend()}
            className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center justify-center shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
