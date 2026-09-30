import React, { useState, useEffect } from 'react';
import { 
  Trophy, Award, BookOpen, Sparkles, CheckCircle2, HelpCircle, 
  ShoppingBag, ArrowRight, Share2, ShieldCheck, Flame, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import translations from '../utils/i18n';
import { api } from '../services/api';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'In which colored bin should vegetable peels and leftover food be discarded?',
    options: ['Blue Bin (Dry Waste)', 'Green Bin (Wet Organic)', 'Red Bin (Hazardous)', 'Black Bin (E-Waste)'],
    correct: 1
  },
  {
    id: 2,
    question: 'How should plastic milk pouches and cardboard boxes be prepped before recycling?',
    options: ['Throw directly dirty', 'Rinse clean & dry first', 'Burn in backyard', 'Mix with food waste'],
    correct: 1
  },
  {
    id: 3,
    question: 'Where should discarded AA batteries and fluorescent lightbulbs be placed?',
    options: ['Green Bin', 'Red Hazardous Bin / Drop-off', 'Blue Recyclable Bin', 'Compost Pit'],
    correct: 1
  },
  {
    id: 4,
    question: 'What is the primary benefit of home composting organic waste?',
    options: ['Reduces landfill methane & creates fertile soil', 'Requires electricity', 'Produces toxic gas', 'Makes plastic'],
    correct: 0
  },
  {
    id: 5,
    question: 'How many Eco Points do you earn by scheduling an E-Waste doorstep pickup on Ecobin?',
    options: ['+10 Points', '+40 Eco Points', '0 Points', '-20 Points'],
    correct: 1
  }
];

export default function WasteAwarenessGamification({ user, lang }) {
  const t = translations[lang] || translations.en;

  const [activeTab, setActiveTab] = useState('awareness'); // 'awareness' | 'quiz' | 'leaderboard' | 'store'
  const [ecoSummary, setEcoSummary] = useState(null);
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    loadEcoData();
  }, []);

  const loadEcoData = async () => {
    try {
      const res = await api.getEcoSummary();
      if (res.success) {
        setEcoSummary(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswerSelect = (questionId, optionIdx) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleQuizSubmit = async () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach(q => {
      if (quizAnswers[q.id] === q.correct) {
        score++;
      }
    });

    setQuizScore(score);
    setQuizSubmitted(true);

    // Trigger confetti celebration
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.log('Confetti effect triggered');
    }

    try {
      await api.submitQuiz({ score, totalQuestions: QUIZ_QUESTIONS.length });
      loadEcoData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-600/30">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
            SWACHH BHARAT AWARENESS & REWARDS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight">
            Waste Segregation & Eco-Rewards
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
            Learn proper waste segregation, attempt daily eco-quizzes, and top the ward leaderboards!
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
          <Trophy className="w-8 h-8 text-amber-300" />
          <div>
            <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider">Your Balance</span>
            <div className="text-2xl font-black text-white">{user?.eco_points || ecoSummary?.points || 340} pts</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('awareness')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'awareness' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          📚 Segregation Guide
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'quiz' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          🧠 Segregation Quiz (+50 pts)
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'leaderboard' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          🏆 Society Leaderboard
        </button>
      </div>

      {/* TAB 1: SEGREGATION GUIDE */}
      {activeTab === 'awareness' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white inline-block">
              GREEN BIN: WET ORGANIC
            </span>
            <h4 className="font-bold text-base text-emerald-900 dark:text-emerald-300">Kitchen & Food Waste</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Includes fruit peelings, vegetable scraps, teabags, leftover food, and garden leaves. Composted for organic soil nutrients.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-sky-500/10 border border-sky-500/30 space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-500 text-white inline-block">
              BLUE BIN: DRY RECYCLABLES
            </span>
            <h4 className="font-bold text-base text-sky-900 dark:text-sky-300">Plastics, Paper & Glass</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Includes cardboard, newspapers, plastic bottles, glass jars, and aluminum cans. Ensure items are dry and rinsed.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/30 space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white inline-block">
              RED BIN: HAZARDOUS
            </span>
            <h4 className="font-bold text-base text-rose-900 dark:text-rose-300">Chemicals & Medical Waste</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Includes paints, batteries, syringes, expired medicines, and cleaning chemicals. Requires bio-hazard handling.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE QUIZ */}
      {activeTab === 'quiz' && (
        <div className="p-6 rounded-3xl glass-panel bg-white/90 dark:bg-slate-800/90 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Waste Segregation Quiz</h3>
              <p className="text-xs text-slate-400">Answer 5 quick questions to earn +10 Eco Points per correct answer!</p>
            </div>
            {quizSubmitted && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                Score: {quizScore} / {QUIZ_QUESTIONS.length} (+{quizScore * 10} pts)
              </span>
            )}
          </div>

          <div className="space-y-6">
            {QUIZ_QUESTIONS.map((q, idx) => (
              <div key={q.id} className="space-y-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  {idx + 1}. {q.question}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = quizAnswers[q.id] === optIdx;
                    const isCorrectOption = q.correct === optIdx;

                    let btnStyle = 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700';
                    if (quizSubmitted) {
                      if (isCorrectOption) btnStyle = 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold';
                      else if (isSelected && !isCorrectOption) btnStyle = 'bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-800';
                    } else if (isSelected) {
                      btnStyle = 'bg-emerald-600 text-white font-bold border-emerald-600';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleAnswerSelect(q.id, optIdx)}
                        className={`p-3 rounded-2xl border text-left transition-all ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!quizSubmitted ? (
            <button
              onClick={handleQuizSubmit}
              disabled={Object.keys(quizAnswers).length < QUIZ_QUESTIONS.length}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm disabled:opacity-50"
            >
              Submit Quiz Answers
            </button>
          ) : (
            <button
              onClick={() => {
                setQuizAnswers({});
                setQuizSubmitted(false);
              }}
              className="w-full py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm"
            >
              Retake Quiz
            </button>
          )}
        </div>
      )}

      {/* TAB 3: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl glass-panel bg-white/90 dark:bg-slate-800/90 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Top Citizen Ambassadors</span>
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
              {(ecoSummary?.citizenLeaderboard || []).map((c) => (
                <div key={c.rank} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      c.rank === 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 dark:bg-slate-700'
                    }`}>
                      #{c.rank}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                  </div>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">{c.points} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-panel bg-white/90 dark:bg-slate-800/90 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Award className="w-5 h-5 text-emerald-500" />
              <span>Top Society & Campus RWAs</span>
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
              {(ecoSummary?.societyLeaderboard || []).map((s) => (
                <div key={s.rank} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">{s.society_name}</span>
                    <span className="text-[10px] text-slate-400">{s.ward_area}</span>
                  </div>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">{s.total_points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
