'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Trophy, Timer, Check, X, RefreshCw, ChevronRight, Settings2, Loader2, Play } from 'lucide-react';

// --- TYPES ---
type GameState = 'SETUP' | 'LOADING' | 'PLAYING' | 'GAME_OVER' | 'ERROR';
type Difficulty = 'easy' | 'medium' | 'hard';

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
  const [questionCount, setQuestionCount] = useState(10);

  // Gameplay
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // Fetch Categories on Mount
  useEffect(() => {
    fetch('https://opentdb.com/api_category.php')
      .then(res => res.json())
      .then(data => {
        // Filter for fun categories to keep the list clean
        const unwanted = ['Entertainment: Musicals & Theatres', 'Art', 'Celebrities'];
        const filtered = data.trivia_categories.filter((c: Category) => !unwanted.includes(c.name));
        setCategories(filtered);
      })
      .catch(err => console.error("Failed to load categories", err));
  }, []);

  // Start Game
  const initializeGame = async () => {
    if (!selectedCategory) return;
    setGameState('LOADING');
    
    try {
      const url = `https://opentdb.com/api.php?amount=${questionCount}&category=${selectedCategory}&difficulty=${difficulty}&type=multiple`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.response_code !== 0 || !data.results.length) {
        throw new Error('Failed to fetch questions. Try a different configuration.');
      }

      const formattedQuestions = data.results.map((q: Question) => ({
        ...q,
        question: decodeHTML(q.question),
        correct_answer: decodeHTML(q.correct_answer),
        incorrect_answers: q.incorrect_answers.map(decodeHTML),
        all_answers: shuffleArray([q.correct_answer, ...q.incorrect_answers].map(decodeHTML))
      }));

      setQuestions(formattedQuestions);
      setCurrentIndex(0);
      setScore(0);
      setIsAnswerRevealed(false);
      setSelectedAnswer(null);
      setGameState('PLAYING');
    } catch (error) {
      setGameState('ERROR');
    }
  };

  // Handle Answer
  const handleAnswer = (answer: string) => {
    if (isAnswerRevealed) return;
    
    setSelectedAnswer(answer);
    setIsAnswerRevealed(true);

    if (answer === questions[currentIndex].correct_answer) {
      setScore(prev => prev + 1);
    }

    // Auto advance after short delay
    setTimeout(() => {
      handleNext();
    }, 1500);
  };

  // Next Question
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswerRevealed(false);
      setSelectedAnswer(null);
    } else {
      setGameState('GAME_OVER');
    }
  };

  const resetGame = () => {
    setGameState('SETUP');
    setScore(0);
    setCurrentIndex(0);
  };

  // --- RENDERERS ---

  if (gameState === 'LOADING') {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] border border-zinc-800 bg-zinc-900 rounded-3xl animate-pulse">
        <Loader2 size={48} className="text-[#DFFF00] animate-spin mb-4" />
        <span className="text-zinc-500 font-mono font-bold tracking-widest text-sm">GENERATING TRIVIA MATRIX...</span>
      </div>
    );
  }

  if (gameState === 'ERROR') {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] border border-red-900/50 bg-zinc-900 rounded-3xl p-8 text-center">
        <Brain size={48} className="text-red-500 mb-4" />
        <h3 className="text-xl font-black text-white uppercase mb-2">Generation Failed</h3>
        <p className="text-zinc-400 mb-6">Not enough data in the archives for this specific combination.</p>
        <button 
          onClick={() => setGameState('SETUP')}
          className="px-6 py-3 bg-white text-black font-bold font-mono rounded-lg hover:bg-[#DFFF00] transition-colors"
        >
          RETURN TO CONFIG
        </button>
      </div>
    );
  }

  if (gameState === 'GAME_OVER') {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] border border-zinc-800 bg-zinc-900 rounded-3xl p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/30 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex p-4 rounded-full bg-zinc-800 border border-zinc-700 mb-6 shadow-xl">
            <Trophy size={48} className={percentage > 60 ? "text-[#DFFF00]" : "text-zinc-500"} />
          </div>
          
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-2">
            Sequence Complete
          </h2>
          
          <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 mb-6 font-mono">
            {score}/{questions.length}
          </div>

          <p className="text-zinc-400 font-mono tracking-widest text-sm uppercase mb-8 border-t border-b border-zinc-800 py-4">
            Accuracy Rating: <span className="text-white">{percentage}%</span>
          </p>

          <button 
            onClick={resetGame}
            className="group relative px-8 py-4 bg-[#DFFF00] hover:bg-white text-black font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(223,255,0,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            <span className="flex items-center gap-2">
              <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500"/> 
              Re-Initialize
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'PLAYING') {
    const q = questions[currentIndex];
    return (
      <div className="max-w-3xl mx-auto">
        {/* HUD */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Question</span>
            <span className="text-xl font-black text-white font-mono">{currentIndex + 1}<span className="text-zinc-600 text-sm">/{questions.length}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Current Score</span>
            <span className="text-xl font-black text-[#DFFF00] font-mono">{score}</span>
          </div>
        </div>

        {/* QUESTION CARD */}
        <div className="border border-zinc-800 bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
                <div 
                    className="h-full bg-[#DFFF00] transition-all duration-500 ease-out" 
                    style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
                />
            </div>

            <span className="inline-block mb-6 px-3 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                {q.category}
            </span>

            <h3 className="text-2xl md:text-4xl font-black text-white leading-tight mb-10">
                {q.question}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.all_answers?.map((ans, idx) => {
                    const isSelected = selectedAnswer === ans;
                    const isCorrect = ans === q.correct_answer;
                    
                    let btnStyle = "border-zinc-700 bg-zinc-950/50 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300";
                    
                    if (isAnswerRevealed) {
                        if (isCorrect) btnStyle = "border-[#DFFF00] bg-[#DFFF00]/10 text-[#DFFF00] shadow-[0_0_15px_rgba(223,255,0,0.2)]";
                        else if (isSelected && !isCorrect) btnStyle = "border-red-500 bg-red-900/20 text-red-500";
                        else btnStyle = "border-zinc-800 bg-zinc-950/30 text-zinc-600 opacity-50";
                    } else if (isSelected) {
                        btnStyle = "border-white bg-zinc-800 text-white";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(ans)}
                            disabled={isAnswerRevealed}
                            className={`
                                relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group
                                flex items-center justify-between
                                ${btnStyle}
                            `}
                        >
                            <span className="font-bold text-sm md:text-base pr-4">{ans}</span>
                            {isAnswerRevealed && isCorrect && <Check size={20} />}
                            {isAnswerRevealed && isSelected && !isCorrect && <X size={20} />}
                            {!isAnswerRevealed && <div className="w-3 h-3 rounded-full border border-zinc-600 group-hover:border-[#DFFF00] group-hover:bg-[#DFFF00] transition-colors" />}
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* LEFT: VISUAL */}
      <div className="hidden lg:flex flex-col justify-center h-[500px] border border-zinc-800 bg-zinc-900 rounded-3xl p-12 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale transition-all duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-[#DFFF00] text-black flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(223,255,0,0.3)]">
            <Brain size={32} />
          </div>
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">
            Knowledge <br/> <span className="text-zinc-600">Protocol</span>
          </h2>
          <p className="text-zinc-400 font-mono text-sm max-w-md">
            Initialize the random data generator. Select your parameters to begin the assessment sequence.
          </p>
        </div>
      </div>

      {/* RIGHT: CONFIG FORM */}
      <div className="flex flex-col gap-6">
        
        {/* Category Select */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <Settings2 size={12} /> Target Sector
          </label>
          <div className="grid grid-cols-2 gap-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
            {categories.length > 0 ? categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  p-4 rounded-xl border text-left text-xs font-bold uppercase tracking-wider transition-all
                  ${selectedCategory === cat.id 
                    ? 'bg-white text-black border-white' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'}
                `}
              >
                {cat.name.replace('Entertainment: ', '').replace('Science: ', '')}
              </button>
            )) : (
              // Skeleton Loading
              [1,2,3,4,5,6].map(i => <div key={i} className="h-12 bg-zinc-900 rounded-xl animate-pulse" />)
            )}
          </div>
        </div>

        {/* Difficulty Select */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            Complexity Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`
                  py-3 rounded-xl border text-center text-xs font-black uppercase tracking-widest transition-all
                  ${difficulty === level 
                    ? 'bg-[#DFFF00] text-black border-[#DFFF00] shadow-[0_0_15px_rgba(223,255,0,0.2)]' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'}
                `}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={initializeGame}
          disabled={!selectedCategory}
          className={`
            mt-4 w-full py-5 rounded-2xl font-black uppercase tracking-widest text-lg flex items-center justify-center gap-3 transition-all
            ${selectedCategory 
              ? 'bg-white text-black hover:bg-[#DFFF00] hover:shadow-[0_0_30px_rgba(223,255,0,0.3)]' 
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
          `}
        >
          Initialize Generator <Play size={20} fill="currentColor" />
        </button>

      </div>
    </div>
  );
}