'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Brain, Trophy, Check, X, RefreshCw, Settings2, Loader2, Play, Users, UserPlus, Trash2, User, Shield, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

// --- TYPES ---
type GameState = 'SETUP' | 'LOADING' | 'PLAYING' | 'GAME_OVER' | 'ERROR';
type Difficulty = 'easy' | 'medium' | 'hard';
type ParticipantType = 'player' | 'team';
type TimerOption = '10s' | '20s' | 'off';

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
  all_answers?: string[]; // Shuffled
}

interface Category {
  id: number;
  name: string;
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

export default function TriviaGame() {
  const [gameState, setGameState] = useState<GameState>('SETUP');
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Settings
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [rounds, setRounds] = useState(5);
  const [timerSetting, setTimerSetting] = useState<TimerOption>('off');

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

  // Fetch Categories on Mount
  useEffect(() => {
    fetch('https://opentdb.com/api_category.php')
      .then(res => res.json())
      .then(data => {
        const unwanted = ['Entertainment: Musicals & Theatres', 'Art', 'Celebrities'];
        const filtered = data.trivia_categories.filter((c: Category) => !unwanted.includes(c.name));
        setCategories(filtered);
      })
      .catch(err => console.error("Failed to load categories", err));
  }, []);

  // --- ROSTER ACTIONS ---
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

  // --- TIMER LOGIC ---
  const handleTimeExpired = useCallback(() => {
    if (isAnswerRevealed) return;
    
    setIsTimerActive(false);
    setSelectedAnswer('TIME_EXPIRED'); 
    setIsAnswerRevealed(true);
    
    setTimeout(() => {
        handleNext();
    }, 2000);
  }, [isAnswerRevealed]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
        interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
        handleTimeExpired();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, handleTimeExpired]);

  // --- GAME LOGIC ---
  const initializeGame = async () => {
    if (!selectedCategory) return;
    
    let activeRoster = participants;
    if (activeRoster.length === 0) {
      activeRoster = [{ id: 'default', name: 'Player 1', type: 'player', score: 0 }];
      setParticipants(activeRoster);
    }

    setGameState('LOADING');
    
    try {
      const totalQuestions = rounds * activeRoster.length;
      const url = `https://opentdb.com/api.php?amount=${totalQuestions}&category=${selectedCategory}&difficulty=${difficulty}&type=multiple`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.response_code !== 0 || !data.results.length) {
        throw new Error('Failed to fetch questions.');
      }

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
      setParticipants(activeRoster.map(p => ({ ...p, score: 0 })));
      
      startTurn(0);
      setGameState('PLAYING');

    } catch (error) {
      setGameState('ERROR');
    }
  };

  const startTurn = (questionIdx: number) => {
      setIsAnswerRevealed(false);
      setSelectedAnswer(null);
      if (timerSetting !== 'off') {
          const seconds = parseInt(timerSetting.replace('s', ''));
          setTimeLeft(seconds);
          setIsTimerActive(true);
      } else {
          setIsTimerActive(false);
      }
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

    setTimeout(() => {
      handleNext();
    }, 1500);
  };

  const handleNext = () => {
    setIsTimerActive(false); 

    if (currentQuestionIndex < questions.length - 1) {
      const nextQIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextQIndex);
      const nextTurnIndex = (currentTurnIndex + 1) % participants.length;
      setCurrentTurnIndex(nextTurnIndex);
      startTurn(nextQIndex);
    } else {
      setGameState('GAME_OVER');
    }
  };

  const resetGame = () => {
    setGameState('SETUP');
    setCurrentQuestionIndex(0);
    setIsTimerActive(false);
  };

  // --- RENDERERS ---

  if (gameState === 'LOADING') {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] md:h-[400px] border border-zinc-800 bg-zinc-900 rounded-3xl animate-pulse">
        <Loader2 size={48} className="text-[#DFFF00] animate-spin mb-4" />
        <span className="text-zinc-500 font-mono font-bold tracking-widest text-xs md:text-sm">GENERATING TRIVIA MATRIX...</span>
      </div>
    );
  }

  if (gameState === 'ERROR') {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] md:h-[400px] border border-red-900/50 bg-zinc-900 rounded-3xl p-8 text-center">
        <Brain size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-black text-white uppercase mb-2">Generation Failed</h3>
        <p className="text-zinc-400 mb-6 text-sm">Reduce the number of rounds or try a broader category.</p>
        <button onClick={() => setGameState('SETUP')} className="px-6 py-3 bg-white text-black font-bold font-mono rounded-lg hover:bg-[#DFFF00] transition-colors text-sm">
          RETURN TO CONFIG
        </button>
      </div>
    );
  }

  if (gameState === 'GAME_OVER') {
    const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] border border-zinc-800 bg-zinc-900 rounded-3xl p-6 md:p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/30 to-transparent pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-md">
          <div className="inline-flex p-4 rounded-full bg-zinc-800 border border-zinc-700 mb-6 shadow-xl">
            <Trophy size={48} className="text-[#DFFF00]" />
          </div>
          
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
            Session Complete
          </h2>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-8">
            Final Standings
          </p>

          <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl overflow-hidden mb-8">
            {sortedParticipants.map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between p-4 border-b border-zinc-800/50 last:border-0">
                    <div className="flex items-center gap-3">
                        <span className={`font-mono font-bold text-lg w-6 ${idx === 0 ? 'text-[#DFFF00]' : 'text-zinc-600'}`}>#{idx + 1}</span>
                        <div className="flex flex-col items-start text-left">
                            <span className={`font-bold uppercase leading-none mb-1 ${idx === 0 ? 'text-white' : 'text-zinc-400'}`}>{p.name}</span>
                            <span className="text-[9px] text-zinc-600 font-mono uppercase flex items-center gap-1">
                                {p.type === 'team' ? <Shield size={10}/> : <User size={10}/>} {p.type}
                            </span>
                        </div>
                    </div>
                    <span className="text-2xl font-black text-white font-mono">{p.score}</span>
                </div>
            ))}
          </div>

          <button 
            onClick={resetGame}
            className="group relative w-full px-8 py-4 bg-[#DFFF00] hover:bg-white text-black font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(223,255,0,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            <span className="flex items-center justify-center gap-2">
              <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500"/> 
              Re-Initialize
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'PLAYING') {
    const q = questions[currentQuestionIndex];
    const currentParticipant = participants[currentTurnIndex];

    const totalTime = parseInt(timerSetting.replace('s', '')) || 10;
    const timePct = (timeLeft / totalTime) * 100;
    let timerColor = 'bg-[#DFFF00]';
    if (timePct < 50) timerColor = 'bg-orange-500';
    if (timePct < 20) timerColor = 'bg-red-500';

    return (
      <div className="max-w-3xl mx-auto flex flex-col h-full">
        
        {/* COMPACT HUD (Mobile Optimized) */}
        <div className="flex items-center justify-between mb-4 md:mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-3 md:p-4 shadow-lg">
             {/* LEFT: Active Player */}
             <div className="flex items-center gap-3 animate-in slide-in-from-left-4 fade-in duration-300" key={currentParticipant.id}>
                <div className={`
                    w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shadow-inner
                    ${currentParticipant.type === 'team' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' : 'bg-[#DFFF00]/10 text-[#DFFF00] border border-[#DFFF00]/30'}
                `}>
                    {currentParticipant.type === 'team' ? <Shield size={16} /> : <User size={16} />}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase leading-none mb-0.5">Active Turn</span>
                    <span className="text-sm md:text-xl font-black text-white uppercase leading-none truncate max-w-[120px] md:max-w-[200px]">
                        {currentParticipant.name}
                    </span>
                </div>
             </div>

             {/* RIGHT: Score/Progress */}
             <div className="flex items-center gap-3 md:gap-6 border-l border-zinc-800 pl-3 md:pl-6">
                 {timerSetting !== 'off' && (
                     <div className="flex flex-col items-end w-12 md:w-16">
                         <span className={`text-lg md:text-2xl font-black font-mono leading-none ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {timeLeft}
                         </span>
                         <span className="text-[8px] md:text-[10px] text-zinc-500 font-mono uppercase">SEC</span>
                     </div>
                 )}
                 <div className="flex flex-col items-end">
                    <span className="text-lg md:text-2xl font-black text-[#DFFF00] font-mono leading-none">
                        {String(currentQuestionIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[8px] md:text-[10px] text-zinc-500 font-mono uppercase">
                        OF {questions.length}
                    </span>
                 </div>
             </div>
        </div>

        {/* TIMER BAR (Thinner, Integrated) */}
        {timerSetting !== 'off' && (
             <div className="mb-4 h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                 <div 
                    className={`h-full ${timerColor} transition-all duration-1000 ease-linear`}
                    style={{ width: `${timePct}%` }}
                 />
             </div>
        )}

        {/* QUESTION CARD */}
        <div className="flex-1 border border-zinc-800 bg-zinc-900 rounded-2xl md:rounded-3xl p-5 md:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-center">
            
            {/* OVERLAY: TIME EXPIRED */}
            {selectedAnswer === 'TIME_EXPIRED' && (
                <div className="absolute inset-0 bg-red-950/90 z-50 flex flex-col items-center justify-center animate-in fade-in duration-200 backdrop-blur-sm">
                    <AlertTriangle size={64} className="text-red-500 mb-4 animate-bounce" />
                    <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">Time Expired</h3>
                    <p className="text-red-300 font-mono text-xs uppercase tracking-widest">Turn Forfeited</p>
                </div>
            )}

            <div className="mb-8">
                <span className="inline-block mb-4 px-3 py-1.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                    {q.category}
                </span>

                <h3 className="text-xl md:text-3xl lg:text-4xl font-black text-white leading-tight">
                    {decodeHTML(q.question)}
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.all_answers?.map((ans, idx) => {
                    const isSelected = selectedAnswer === ans;
                    const isCorrect = ans === q.correct_answer;
                    
                    let btnStyle = "border-zinc-800 bg-zinc-950 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-300";
                    let icon = null;

                    if (isAnswerRevealed) {
                        if (isCorrect) {
                            btnStyle = "border-[#DFFF00] bg-[#DFFF00]/10 text-[#DFFF00] shadow-[0_0_15px_rgba(223,255,0,0.1)]";
                            icon = <Check size={20} />;
                        } else if (isSelected && !isCorrect) {
                            btnStyle = "border-red-500/50 bg-red-900/20 text-red-500";
                            icon = <X size={20} />;
                        } else {
                            btnStyle = "border-zinc-800 bg-zinc-950 text-zinc-700 opacity-50";
                        }
                    } else if (isSelected) {
                        btnStyle = "border-white bg-zinc-800 text-white";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(ans)}
                            disabled={isAnswerRevealed}
                            className={`
                                relative p-4 md:p-6 rounded-xl border-2 text-left transition-all duration-200 group
                                flex items-center justify-between min-h-[64px]
                                ${btnStyle}
                            `}
                        >
                            <span className="font-bold text-sm md:text-base pr-4 leading-tight">{decodeHTML(ans)}</span>
                            {icon}
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEFT: ROSTER CONFIG */}
      <div className="lg:col-span-5 flex flex-col gap-6 order-2 lg:order-1">
         <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Users className="text-[#DFFF00]" size={20} />
                    <h3 className="text-lg font-black uppercase text-white">Roster</h3>
                </div>
                <span className="text-xs font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                    {participants.length} READY
                </span>
            </div>
            
            {/* Clean Add Form */}
            <form onSubmit={addParticipant} className="flex flex-col gap-3 mb-6 bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                <div className="flex gap-2">
                    <button 
                        type="button"
                        onClick={() => setNewParticipantType('player')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors border ${newParticipantType === 'player' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-transparent text-zinc-600 border-transparent hover:text-zinc-400'}`}
                    >
                        <User size={12} className="inline mr-1 mb-0.5"/> Player
                    </button>
                    <button 
                        type="button"
                        onClick={() => setNewParticipantType('team')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors border ${newParticipantType === 'team' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-transparent text-zinc-600 border-transparent hover:text-zinc-400'}`}
                    >
                        <Shield size={12} className="inline mr-1 mb-0.5"/> Team
                    </button>
                </div>
                <div className="flex gap-2">
                    <input 
                        ref={nameInputRef}
                        type="text" 
                        value={newParticipantName}
                        onChange={(e) => setNewParticipantName(e.target.value)}
                        placeholder={newParticipantType === 'player' ? "PLAYER NAME..." : "TEAM NAME..."}
                        className="flex-1 bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-[#DFFF00] placeholder:text-zinc-700 font-bold uppercase text-xs font-mono"
                    />
                    <button type="submit" className="bg-[#DFFF00] text-black w-10 flex items-center justify-center rounded-lg hover:bg-white transition-colors">
                        <ArrowRight size={16} />
                    </button>
                </div>
            </form>

            {/* Compact List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {participants.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/50">
                        <span className="text-zinc-700 text-[10px] font-mono uppercase tracking-widest">No Participants<br/>Auto-Assign: Player 1</span>
                    </div>
                ) : (
                    participants.map((p) => (
                        <div key={p.id} className="group flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-800">
                                    {p.type === 'team' ? <Shield size={14} /> : <User size={14} />}
                                </div>
                                <span className="font-bold text-white text-xs uppercase tracking-wide">{p.name}</span>
                            </div>
                            <button onClick={() => removeParticipant(p.id)} className="text-zinc-700 hover:text-red-500 transition-colors p-2">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
         </div>
      </div>

      {/* RIGHT: GAME CONFIG */}
      <div className="lg:col-span-7 flex flex-col gap-6 order-1 lg:order-2">
        
        {/* Category Select */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <Settings2 size={12} /> Database Sector
          </label>
          
          <div className="
             flex gap-3 overflow-x-auto pb-6 -mx-4 px-4 snap-x snap-mandatory 
             md:grid md:grid-cols-3 md:gap-3 md:max-h-[360px] md:overflow-y-auto md:pb-0 md:mx-0 md:px-0 md:snap-none custom-scrollbar
             [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']
          ">
            {categories.length > 0 ? categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  shrink-0 w-[140px] h-[100px] md:w-auto md:h-24 snap-center
                  p-4 rounded-xl border flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 text-center md:text-left transition-all
                  ${selectedCategory === cat.id 
                    ? 'bg-white text-black border-white shadow-xl scale-[1.02]' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'}
                `}
              >
                <div className={`
                    w-2 h-2 rounded-full mb-1 md:mb-0
                    ${selectedCategory === cat.id ? 'bg-black' : 'bg-[#DFFF00]'}
                `} />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider leading-tight">
                    {cat.name.replace('Entertainment: ', '').replace('Science: ', '')}
                </span>
              </button>
            )) : (
              [1,2,3,4,5,6].map(i => <div key={i} className="shrink-0 w-[140px] h-[100px] md:w-auto md:h-24 bg-zinc-900 rounded-xl animate-pulse snap-center" />)
            )}
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Complexity */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Complexity</label>
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                    {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`
                        flex-1 md:flex-none py-3 px-4 rounded-xl border text-center md:text-left text-[10px] font-black uppercase tracking-widest transition-all
                        ${difficulty === level 
                            ? 'bg-[#DFFF00] text-black border-[#DFFF00]' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'}
                        `}
                    >
                        {level}
                    </button>
                    ))}
                </div>
            </div>

            {/* Rounds */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Rounds / Player</label>
                <div className="flex md:flex-col gap-2">
                    {[3, 5, 10].map((num) => (
                    <button
                        key={num}
                        onClick={() => setRounds(num)}
                        className={`
                        flex-1 md:flex-none py-3 px-4 rounded-xl border text-center md:text-left text-[10px] font-black uppercase tracking-widest transition-all
                        ${rounds === num 
                            ? 'bg-white text-black border-white' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'}
                        `}
                    >
                        {num} Rounds
                    </button>
                    ))}
                </div>
            </div>

            {/* Timer */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Time Limit</label>
                <div className="flex md:flex-col gap-2">
                    {(['10s', '20s', 'off'] as const).map((opt) => (
                    <button
                        key={opt}
                        onClick={() => setTimerSetting(opt)}
                        className={`
                        flex-1 md:flex-none py-3 px-4 rounded-xl border text-center md:text-left text-[10px] font-black uppercase tracking-widest transition-all
                        ${timerSetting === opt 
                            ? 'bg-zinc-800 text-white border-zinc-600' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'}
                        `}
                    >
                        {opt === 'off' ? 'No Timer' : opt}
                    </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Start Button */}
        <button
          onClick={initializeGame}
          disabled={!selectedCategory}
          className={`
            w-full py-6 rounded-2xl font-black uppercase tracking-widest text-lg flex items-center justify-center gap-3 transition-all shadow-xl
            ${selectedCategory 
              ? 'bg-white text-black hover:bg-[#DFFF00] hover:scale-[1.01]' 
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
          `}
        >
          Initialize Generator <Play size={20} fill="currentColor" />
        </button>

      </div>
    </div>
  );
}