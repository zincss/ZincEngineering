'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Brain, Trophy, Check, X, RefreshCw, Settings2, Loader2, Play, Users, UserPlus, Trash2, User, Shield, Clock, AlertTriangle, ArrowRight, Dna, Zap, Globe, Cpu, Music, Film, Book, Crown, ListOrdered, Lock, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

// --- TYPES ---
type GameState = 'SETUP' | 'ROULETTE' | 'LOADING' | 'PLAYING' | 'GAME_OVER' | 'ERROR';
type Difficulty = 'easy' | 'medium' | 'hard';
type ParticipantType = 'player' | 'team';

interface Participant {
  id: string;
  name: string;
  type: ParticipantType;
  score: number;
}

interface Question {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  all_answers?: string[];
}

interface Category {
  id: number;
  name: string;
}

interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  game_date: string;
}

// --- UTILS ---
const decodeHTML = (html: string) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

const shuffleArray = (array: any[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const getCategoryIcon = (name: string) => {
    if (name.includes('Science')) return <Dna size={24} />;
    if (name.includes('Entertainment')) return <Film size={24} />;
    if (name.includes('Music')) return <Music size={24} />;
    if (name.includes('Computers') || name.includes('Video')) return <Cpu size={24} />;
    if (name.includes('History') || name.includes('Books')) return <Book size={24} />;
    if (name.includes('Geography')) return <Globe size={24} />;
    return <Brain size={24} />;
};

// --- ANIMATION STYLES ---
const animationStyles = `
  @keyframes scroll-horizontal {
    0% { transform: translateX(0); }
    100% { transform: translateX(calc(-100% + 250px)); }
  }
  .animate-scroll-x {
    animation: scroll-horizontal 4s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
  }
`;

export default function TriviaGame() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  
  const [gameState, setGameState] = useState<GameState>('SETUP');
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Settings
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [rounds, setRounds] = useState(5);

  // Roulette State
  const [reelCategories, setReelCategories] = useState<Category[]>([]);
  const [targetCategory, setTargetCategory] = useState<Category | null>(null);

  // Roster State
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantType, setNewParticipantType] = useState<ParticipantType>('player');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Gameplay State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Guest Prompt State
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    fetch('https://opentdb.com/api_category.php')
      .then(res => res.json())
      .then(data => {
        const unwanted = ['Entertainment: Musicals & Theatres', 'Art', 'Celebrities'];
        const filtered = data.trivia_categories.filter((c: Category) => !unwanted.includes(c.name));
        setCategories(filtered);
      })
      .catch(err => console.error("Failed to load categories", err));

    fetchLeaderboard();
  }, []);

  // Check for Guest Status once Auth loads
  useEffect(() => {
    if (!authLoading) {
        const hasSeenPrompt = localStorage.getItem('zinc_trivia_guest_seen');
        if (!user && !hasSeenPrompt) {
            // Small delay for effect
            setTimeout(() => setShowGuestPrompt(true), 1000);
        }
    }
  }, [authLoading, user]);

  // Auto-Fill Name
  useEffect(() => {
    if (profile?.username) {
        setNewParticipantName(profile.username);
    }
  }, [profile]);

  const fetchLeaderboard = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_trivia_scores')
        .select('*')
        .eq('game_date', today)
        .order('score', { ascending: false })
        .limit(10);
      
      if (!error && data) {
          setLeaderboard(data);
      }
  };

  const handleDismissGuest = () => {
      localStorage.setItem('zinc_trivia_guest_seen', 'true');
      setShowGuestPrompt(false);
  };

  // --- ACTIONS ---
  const addParticipant = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newParticipantName.trim()) return;
    const newId = Math.random().toString(36).substr(2, 9);
    setParticipants([...participants, {
      id: newId,
      name: newParticipantName.trim(),
      type: newParticipantType,
      score: 0
    }]);
    setNewParticipantName(''); 
    nameInputRef.current?.focus();
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  // --- TIMER ---
  const handleTimeExpired = useCallback(() => {
    if (isAnswerRevealed) return;
    setIsTimerActive(false);
    setSelectedAnswer('TIME_EXPIRED'); 
    setIsAnswerRevealed(true);
    setTimeout(() => handleNext(), 2000);
  }, [isAnswerRevealed]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
        interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerActive) {
        handleTimeExpired();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, handleTimeExpired]);

  // --- GAME FLOW ---
  const startRoulette = () => {
    if (participants.length === 0) {
        if (profile?.username) {
             setParticipants([{ id: 'user', name: profile.username, type: 'player', score: 0 }]);
        } else {
             setParticipants([{ id: 'default', name: 'Player 1', type: 'player', score: 0 }]);
        }
    }
    
    if (categories.length === 0) return;

    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    setTargetCategory(randomCat);

    const fillers = Array.from({ length: 20 }, () => categories[Math.floor(Math.random() * categories.length)]);
    setReelCategories([...fillers, randomCat]);

    setGameState('ROULETTE');

    setTimeout(() => {
        initializeGame(randomCat.id);
    }, 4500); 
  };

  const initializeGame = async (categoryId: number) => {
    setGameState('LOADING');
    
    try {
      const currentParticipants = participants.length > 0 
        ? participants 
        : [{ id: 'default', name: profile?.username || 'Player 1', type: 'player', score: 0 }];
      
      if (participants.length === 0) setParticipants(currentParticipants as Participant[]);

      const totalQuestions = rounds * currentParticipants.length;
      const url = `https://opentdb.com/api.php?amount=${totalQuestions}&category=${categoryId}&difficulty=${difficulty}&type=multiple`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.response_code !== 0 || !data.results.length) throw new Error('Failed to fetch questions.');

      const formattedQuestions = data.results.map((q: Question) => ({
        ...q,
        question: decodeHTML(q.question),
        correct_answer: decodeHTML(q.correct_answer),
        incorrect_answers: q.incorrect_answers.map(decodeHTML),
        all_answers: shuffleArray([q.correct_answer, ...q.incorrect_answers].map(decodeHTML))
      }));

      setQuestions(formattedQuestions);
      setCurrentQuestionIndex(0);
      setCurrentTurnIndex(0);
      setParticipants(prev => {
          const list = prev.length > 0 ? prev : currentParticipants as Participant[];
          return list.map(p => ({ ...p, score: 0 }));
      });
      
      startTurn();
      setGameState('PLAYING');

    } catch (error) {
      setGameState('ERROR');
    }
  };

  const startTurn = () => {
      setIsAnswerRevealed(false);
      setSelectedAnswer(null);
      setTimeLeft(15);
      setIsTimerActive(true);
  };

  const handleAnswer = (answer: string) => {
    if (isAnswerRevealed) return;
    
    setIsTimerActive(false);
    setSelectedAnswer(answer);
    setIsAnswerRevealed(true);

    const isCorrect = answer === questions[currentQuestionIndex].correct_answer;
    
    if (isCorrect) {
      const updatedRoster = [...participants];
      updatedRoster[currentTurnIndex].score += 1;
      setParticipants(updatedRoster);
    }

    setTimeout(() => handleNext(), 1500);
  };

  const handleNext = async () => {
    setIsTimerActive(false); 

    if (currentQuestionIndex < questions.length - 1) {
      const nextQIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextQIndex);
      const nextTurnIndex = (currentTurnIndex + 1) % participants.length;
      setCurrentTurnIndex(nextTurnIndex);
      startTurn();
    } else {
      setGameState('GAME_OVER');
      
      if (user) {
        const playerParticipant = participants.find(p => p.type === 'player');
        if (playerParticipant && playerParticipant.score > 0) {
            let roundValue = 1;
            if (rounds === 5) roundValue = 2;
            if (rounds === 10) roundValue = 4;

            let multiplier = 1;
            if (difficulty === 'medium') multiplier = 2;
            if (difficulty === 'hard') multiplier = 2.5;

            const earnings = Math.floor(playerParticipant.score * roundValue * multiplier);
            await supabase.rpc('add_credits', { amount: earnings });
            refreshProfile();

            await supabase.from('daily_trivia_scores').insert({
                user_id: user.id,
                username: profile?.username || 'Unknown',
                score: earnings,
                game_date: new Date().toISOString().split('T')[0]
            });
            fetchLeaderboard();
        }
      }
    }
  };

  const resetGame = () => {
    setGameState('SETUP');
    setCurrentQuestionIndex(0);
    setIsTimerActive(false);
  };

  // --- RENDERERS ---

  if (gameState === 'ROULETTE') {
      return (
          <div className="flex flex-col items-center justify-center min-h-[500px] w-full overflow-hidden relative">
              <style>{animationStyles}</style>
              <h2 className="text-xl font-black uppercase tracking-widest text-zinc-500 mb-8 animate-pulse">Selecting Database Sector...</h2>
              <div className="w-full max-w-2xl h-48 border-y-2 border-[#DFFF00] bg-zinc-950 relative flex items-center overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                  <div className="absolute top-0 bottom-0 left-1/2 flex items-center animate-scroll-x">
                      {reelCategories.map((cat, i) => (
                          <div key={i} className="w-[250px] shrink-0 flex flex-col items-center justify-center gap-4 px-4 opacity-50 last:opacity-100 last:scale-110 transition-all">
                              <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-2xl text-zinc-400">
                                  {getCategoryIcon(cat.name)}
                              </div>
                              <span className="text-xs font-black uppercase text-center text-zinc-300 w-full truncate">
                                  {cat.name.replace('Entertainment: ', '').replace('Science: ', '')}
                              </span>
                          </div>
                      ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-zinc-950 z-10 pointer-events-none" />
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[260px] border-x-2 border-[#DFFF00]/30 bg-[#DFFF00]/5 z-0" />
                  <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-0.5 bg-[#DFFF00] z-20 shadow-[0_0_10px_#DFFF00]" />
              </div>
          </div>
      );
  }

  if (gameState === 'LOADING') {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] border border-zinc-800 bg-zinc-900 rounded-3xl animate-pulse">
        <Loader2 size={48} className="text-[#DFFF00] animate-spin mb-4" />
        <span className="text-zinc-500 font-mono font-bold tracking-widest text-xs md:text-sm">DOWNLOADING {targetCategory?.name.toUpperCase()}...</span>
      </div>
    );
  }

  if (gameState === 'ERROR') return (
      <div className="flex flex-col items-center justify-center h-[400px] border border-red-900/50 bg-zinc-900 rounded-3xl p-8 text-center">
        <Brain size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-black text-white uppercase mb-2">Generation Failed</h3>
        <button onClick={() => setGameState('SETUP')} className="px-6 py-3 bg-white text-black font-bold font-mono rounded-lg hover:bg-[#DFFF00] transition-colors text-sm">RETURN TO CONFIG</button>
      </div>
  );

  if (gameState === 'GAME_OVER') {
    const userScore = participants.find(p => p.type === 'player')?.score || 0;
    let multiplier = difficulty === 'hard' ? 2.5 : difficulty === 'medium' ? 2 : 1;
    let rVal = rounds === 10 ? 4 : rounds === 5 ? 2 : 1;
    const earned = Math.floor(userScore * rVal * multiplier);

    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] border border-zinc-800 bg-zinc-900 rounded-3xl p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/30 to-transparent pointer-events-none" />
        <div className="relative z-10 w-full max-w-md">
          <Trophy size={64} className="text-[#DFFF00] mx-auto mb-6" />
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Session Complete</h2>
          {user && earned > 0 && (
             <div className="mb-8 inline-flex items-center gap-3 bg-[#DFFF00]/10 border border-[#DFFF00] px-6 py-3 rounded-xl">
                 <span className="text-[#DFFF00] font-mono text-sm font-bold uppercase tracking-widest">Payout:</span>
                 <span className="text-white font-black text-xl">+{earned} CREDITS</span>
             </div>
          )}
          <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl overflow-hidden mb-8 w-full">
            {participants.sort((a, b) => b.score - a.score).map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between p-4 border-b border-zinc-800/50 last:border-0">
                    <span className="font-bold text-white">{p.name}</span>
                    <span className="text-2xl font-black text-[#DFFF00] font-mono">{p.score}</span>
                </div>
            ))}
          </div>
          <button onClick={resetGame} className="w-full py-4 bg-white hover:bg-[#DFFF00] text-black font-black uppercase tracking-wider rounded-xl transition-colors">Re-Initialize</button>
        </div>
      </div>
    );
  }

  if (gameState === 'PLAYING') {
    const q = questions[currentQuestionIndex];
    const currentParticipant = participants[currentTurnIndex];
    const timePct = (timeLeft / 15) * 100;

    return (
      <div className="max-w-3xl mx-auto flex flex-col h-full">
        <div className="flex items-center justify-between mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#DFFF00]/10 text-[#DFFF00] border border-[#DFFF00]/30">
                    {currentParticipant.type === 'team' ? <Shield size={20} /> : <User size={20} />}
                </div>
                <div>
                    <div className="text-[10px] text-zinc-500 font-mono font-bold uppercase">Active Turn</div>
                    <div className="text-xl font-black text-white uppercase">{currentParticipant.name}</div>
                </div>
             </div>
             <div className="flex flex-col items-end">
                 <span className={`text-2xl font-black font-mono leading-none ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{timeLeft}</span>
                 <span className="text-[10px] text-zinc-500 font-mono uppercase">SECONDS</span>
             </div>
        </div>
        <div className="mb-4 h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
             <div className="h-full bg-[#DFFF00] transition-all duration-1000 ease-linear" style={{ width: `${timePct}%` }} />
        </div>
        <div className="flex-1 border border-zinc-800 bg-zinc-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-center">
            {selectedAnswer === 'TIME_EXPIRED' && (
                <div className="absolute inset-0 bg-red-950/90 z-50 flex flex-col items-center justify-center animate-in fade-in duration-200 backdrop-blur-sm">
                    <AlertTriangle size={64} className="text-red-500 mb-4 animate-bounce" />
                    <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Time Expired</h3>
                </div>
            )}
            <div className="mb-8">
                <span className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                    {getCategoryIcon(q.category)} {q.category}
                </span>
                <h3 className="text-3xl font-black text-white leading-tight">{decodeHTML(q.question)}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.all_answers?.map((ans, idx) => {
                    let btnStyle = "border-zinc-800 bg-zinc-950 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-300";
                    if (isAnswerRevealed) {
                        if (ans === q.correct_answer) btnStyle = "border-[#DFFF00] bg-[#DFFF00]/10 text-[#DFFF00]";
                        else if (selectedAnswer === ans) btnStyle = "border-red-500/50 bg-red-900/20 text-red-500";
                        else btnStyle = "opacity-50 border-zinc-800";
                    }
                    return (
                        <button key={idx} onClick={() => handleAnswer(ans)} disabled={isAnswerRevealed} className={`p-6 rounded-xl border-2 text-left transition-all font-bold text-sm ${btnStyle}`}>
                            {decodeHTML(ans)}
                        </button>
                    );
                })}
            </div>
        </div>
      </div>
    );
  }

  // --- SETUP VIEW ---
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: ROSTER & LEADERBOARD */}
        <div className="lg:col-span-5 flex flex-col gap-6 order-2 lg:order-1">
           <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                      <Users className="text-[#DFFF00]" size={20} />
                      <h3 className="text-lg font-black uppercase text-white">Roster</h3>
                  </div>
                  <span className="text-xs font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                      {participants.length} READY
                  </span>
              </div>
              <form onSubmit={addParticipant} className="flex flex-col gap-3 mb-6 bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                  <div className="flex gap-2">
                      <button type="button" onClick={() => setNewParticipantType('player')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg border ${newParticipantType === 'player' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-transparent text-zinc-600 border-transparent'}`}>Player</button>
                      <button type="button" onClick={() => setNewParticipantType('team')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg border ${newParticipantType === 'team' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-transparent text-zinc-600 border-transparent'}`}>Team</button>
                  </div>
                  <div className="flex gap-2">
                      <input 
                          ref={nameInputRef} 
                          type="text" 
                          value={newParticipantName} 
                          onChange={(e) => setNewParticipantName(e.target.value)} 
                          placeholder={profile?.username ? profile.username : "NAME..."} 
                          className="flex-1 bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-lg font-bold uppercase text-xs font-mono focus:border-[#DFFF00] outline-none"
                      />
                      <button type="submit" className="bg-[#DFFF00] text-black w-10 flex items-center justify-center rounded-lg hover:bg-white"><ArrowRight size={16} /></button>
                  </div>
              </form>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {participants.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                          <span className="font-bold text-white text-xs uppercase">{p.name}</span>
                          <button onClick={() => removeParticipant(p.id)} className="text-zinc-700 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                  ))}
                  {participants.length === 0 && <div className="text-center py-4 text-zinc-700 text-xs font-mono uppercase">List Empty</div>}
              </div>
           </div>

           <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
               <div className="flex items-center gap-3 mb-6 relative z-10">
                   <ListOrdered className="text-[#DFFF00]" size={20} />
                   <h3 className="text-lg font-black uppercase text-white">Daily Top 10</h3>
               </div>
               {leaderboard.length === 0 ? (
                   <div className="text-center py-8 text-zinc-700 font-mono text-xs uppercase">No Scores Yet Today</div>
               ) : (
                   <div className="space-y-1 relative z-10">
                       {leaderboard.map((entry, idx) => (
                           <div key={entry.id} className="flex justify-between items-center p-2 rounded hover:bg-zinc-800/50 transition-colors">
                               <div className="flex items-center gap-3">
                                   <span className={`font-mono font-bold text-xs w-4 ${idx === 0 ? 'text-[#DFFF00]' : 'text-zinc-600'}`}>{idx + 1}</span>
                                   <span className="font-bold text-zinc-300 text-xs uppercase">{entry.username}</span>
                               </div>
                               <span className="font-mono text-[#DFFF00] text-xs font-bold">{entry.score}</span>
                           </div>
                       ))}
                   </div>
               )}
           </div>
        </div>

        {/* RIGHT: CONFIG */}
        <div className="lg:col-span-7 flex flex-col gap-6 order-1 lg:order-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-[#DFFF00]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="relative z-10">
                  <h2 className="text-3xl font-black uppercase text-white mb-2">Protocol Config</h2>
                  <p className="text-zinc-500 font-mono text-xs mb-8 max-w-md">Database sector will be randomly assigned upon initialization.</p>
                  <div className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Complexity Level</label>
                          <div className="grid grid-cols-3 gap-2">
                              {(['easy', 'medium', 'hard'] as const).map((level) => (
                              <button key={level} onClick={() => setDifficulty(level)} className={`py-4 rounded-xl border text-center font-black uppercase tracking-widest transition-all ${difficulty === level ? 'bg-[#DFFF00] text-black border-[#DFFF00]' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>
                                  {level} {level === 'medium' ? '(2x)' : level === 'hard' ? '(2.5x)' : '(1x)'}
                              </button>
                              ))}
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Questions per Player</label>
                          <div className="grid grid-cols-3 gap-2">
                              {[3, 5, 10].map((num) => (
                              <button key={num} onClick={() => setRounds(num)} className={`py-4 rounded-xl border text-center font-black uppercase tracking-widest transition-all ${rounds === num ? 'bg-white text-black border-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>
                                  {num} {num === 3 ? '(1cr)' : num === 5 ? '(2cr)' : '(4cr)'}
                              </button>
                              ))}
                          </div>
                      </div>
                  </div>
                  <button onClick={startRoulette} className="w-full mt-8 py-6 rounded-2xl bg-[#DFFF00] hover:bg-white text-black font-black uppercase tracking-widest text-lg flex items-center justify-center gap-3 transition-all shadow-xl">
                    INITIALIZE GENERATOR <Play size={20} fill="currentColor" />
                  </button>
              </div>
          </div>
        </div>
      </div>

      {/* --- GUEST PROMPT MODAL --- */}
      {showGuestPrompt && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="w-full max-w-md bg-zinc-950 border-2 border-[#DFFF00] rounded-3xl p-8 relative overflow-hidden shadow-[0_0_50px_rgba(223,255,0,0.15)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#DFFF00]/10 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="relative z-10 text-center">
                      <div className="w-16 h-16 bg-[#DFFF00]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#DFFF00]">
                          <AlertTriangle size={32} className="text-[#DFFF00]" />
                      </div>
                      
                      <h2 className="text-2xl font-black uppercase text-white mb-2 tracking-tighter">Unregistered User Detected</h2>
                      <p className="text-zinc-400 font-mono text-xs mb-8 leading-relaxed">
                          Initialize account to enable: <br/>
                          <span className="text-[#DFFF00]">• Credit Earning (Market Access)</span><br/>
                          <span className="text-white">• Stat Tracking</span><br/>
                          <span className="text-white">• Leaderboard Entry</span>
                      </p>

                      <div className="flex flex-col gap-3">
                          <Link href="/login" className="w-full py-4 bg-[#DFFF00] hover:bg-white text-black font-black uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2">
                              <LogIn size={16} /> Initialize ID
                          </Link>
                          <button onClick={handleDismissGuest} className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-white font-mono font-bold uppercase tracking-widest rounded-xl transition-colors text-xs border border-zinc-800">
                              Proceed as Ghost
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </>
  );
}