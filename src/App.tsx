/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Star, 
  Heart, 
  RefreshCw, 
  Trophy, 
  ChevronRight,
  Shapes,
  Lightbulb,
  Target,
  Gamepad2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameType, GameStats } from './types';
import { soundService } from './services/soundService';

// --- Constants & Defaults ---

const INITIAL_STATS: GameStats = {
  totalPlayed: 0,
  correctAnswers: 0,
  highestLevel: 1,
  categoryStats: {
    [GameType.PATTERNS]: { played: 0, correct: 0 },
    [GameType.LOGIC]: { played: 0, correct: 0 },
    [GameType.SHADOWS]: { played: 0, correct: 0 },
    [GameType.COUNTING]: { played: 0, correct: 0 },
    [GameType.MEMORY]: { played: 0, correct: 0 },
  }
};

const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- Game Data Generators ---

const generateShadowLevel = (difficulty: number) => {
  const objects = ['🍎', '🚗', '🐱', '🏠', '🚀', '🐘', '🍦', '🎈', '🚲', '🦒', '🧸', '🦖', '🦋', '🌻', '🍕'];
  const selected = shuffle(objects).slice(0, 4);
  const answer = selected[0];
  
  return {
    answer,
    options: shuffle(selected),
    prompt: "Welches Bild passt zum Schatten?"
  };
};

const generateMemoryLevel = (difficulty: number) => {
  const pairsCount = difficulty < 3 ? 2 : (difficulty < 6 ? 3 : 4);
  const emojis = ['🐶', '🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🐵'].sort(() => Math.random() - 0.5).slice(0, pairsCount);
  const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5).map((emoji, index) => ({
    id: index,
    emoji,
    isFlipped: false,
    isMatched: false
  }));

  return {
    cards,
    pairsCount,
    answer: 'all_matched', // Special case for memory
    prompt: "Finde alle Paare!"
  };
};

const generatePatternLevel = (difficulty: number) => {
// ... (rest of generators stay similar but I'll include them for completeness in the replacement)
  const shapes = ['square', 'circle', 'triangle', 'star', 'heart'];
  const colors = ['text-red-500', 'text-blue-500', 'text-green-500', 'text-yellow-500', 'text-purple-500'];
  
  const patternLength = 2 + Math.floor(difficulty / 3);
  const sequence: { shape: string; color: string }[] = [];
  
  for (let i = 0; i < patternLength; i++) {
    sequence.push({
      shape: shapes[i % shapes.length],
      color: colors[i % colors.length]
    });
  }

  const fullSequence = [...sequence, ...sequence, ...sequence].slice(0, 4 + Math.min(difficulty, 4));
  const missingIndex = fullSequence.length - 1;
  const correctAnswer = fullSequence[missingIndex];
  
  const options = [correctAnswer];
  while (options.length < 4) {
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    if (!options.find(o => o.shape === randomShape && o.color === randomColor)) {
      options.push({ shape: randomShape, color: randomColor });
    }
  }

  return {
    question: fullSequence.slice(0, -1),
    options: options.sort(() => Math.random() - 0.5),
    answer: correctAnswer
  };
};

const generateLogicLevel = (difficulty: number) => {
  const categories = [
    { items: ['🍎', '🍌', '🍇', '🍓'], odd: '🚗' },
    { items: ['🐶', '🐱', '🐭', '🐹'], odd: '🥦' },
    { items: ['✈️', '🚀', '🚁', '🛰️'], odd: '🐟' },
    { items: ['🎸', '🎹', '🎻', '🎺'], odd: '👟' },
    { items: ['☀️', '☁️', '🌧️', '❄️'], odd: '🍔' }
  ];

  const cat = categories[Math.floor(Math.random() * categories.length)];
  const items = [...cat.items.slice(0, 3), cat.odd].sort(() => Math.random() - 0.5);

  return {
    items,
    answer: cat.odd,
    prompt: "Was passt nicht dazu?"
  };
};

const generateCountingLevel = (difficulty: number) => {
  const count = 3 + Math.floor(Math.random() * (2 + difficulty));
  const emoji = ['🍎', '⭐', '🎈', '🐱', '🚗'][Math.floor(Math.random() * 5)];
  
  const options = [count];
  while (options.length < 4) {
    const rand = Math.max(1, count + Math.floor(Math.random() * 5) - 2);
    if (!options.includes(rand)) options.push(rand);
  }

  return {
    count,
    emoji,
    options: options.sort(() => Math.random() - 0.5),
    answer: count
  };
};

// --- Components ---

const ShapeIcon = ({ name, className }: any) => {
  switch (name) {
    case 'square': return <div className={`w-12 h-12 bg-current rounded-lg ${className}`} />;
    case 'circle': return <div className={`w-12 h-12 bg-current rounded-full ${className}`} />;
    case 'triangle': return <div className={`w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-bottom-[48px] border-bottom-current ${className}`} />;
    case 'star': return <Star className={`w-12 h-12 fill-current ${className}`} />;
    case 'heart': return <Heart className={`w-12 h-12 fill-current ${className}`} />;
    default: return null;
  }
};

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'success' | 'parent'>('menu');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [gameType, setGameType] = useState<GameType>(GameType.PATTERNS);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  // Memory specific state
  const [memoryFlipped, setMemoryFlipped] = useState<number[]>([]);
  const [memoryMatched, setMemoryMatched] = useState<string[]>([]);

  // Stats & Persistence
  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('game_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  useEffect(() => {
    localStorage.setItem('game_stats', JSON.stringify(stats));
  }, [stats]);

  const updateStats = (type: GameType, correct: boolean) => {
    setStats(prev => {
      const newStats = { ...prev };
      newStats.totalPlayed += 1;
      if (correct) newStats.correctAnswers += 1;
      newStats.highestLevel = Math.max(newStats.highestLevel, level);
      
      const cat = newStats.categoryStats[type];
      newStats.categoryStats[type] = {
        played: cat.played + 1,
        correct: cat.correct + (correct ? 1 : 0)
      };
      
      return newStats;
    });
  };

  const resetStats = () => {
    setStats(INITIAL_STATS);
    localStorage.removeItem('game_stats');
    setLevel(1);
  };

  const nextTask = useCallback(() => {
    setFeedback(null);
    setMemoryFlipped([]);
    setMemoryMatched([]);
    
    const types = [GameType.PATTERNS, GameType.LOGIC, GameType.COUNTING, GameType.SHADOWS, GameType.MEMORY];
    const nextType = types[Math.floor(Math.random() * types.length)];
    setGameType(nextType);

    const difficulty = Math.min(10, Math.floor(level / 2) + 1);

    if (nextType === GameType.PATTERNS) {
      setCurrentTask(generatePatternLevel(difficulty));
    } else if (nextType === GameType.LOGIC) {
      setCurrentTask(generateLogicLevel(difficulty));
    } else if (nextType === GameType.SHADOWS) {
      setCurrentTask(generateShadowLevel(difficulty));
    } else if (nextType === GameType.MEMORY) {
      setCurrentTask(generateMemoryLevel(difficulty));
    } else {
      setCurrentTask(generateCountingLevel(difficulty));
    }
  }, [level]);

  const startGame = () => {
    setGameState('playing');
    setLevel(1);
    setScore(0);
    nextTask();
  };

  const handleAnswer = (answer: any) => {
    if (feedback) return;

    if (gameType === GameType.MEMORY) {
      // Memory logic is handled separately in handleMemoryClick
      return;
    }

    const isCorrect = answer === currentTask.answer;
    updateStats(gameType, isCorrect);

    if (isCorrect) {
      setFeedback('correct');
      setScore(s => s + 10);
      soundService.playCorrect();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5A5A40', '#A3A375', '#D1D1B2']
      });
      
      setTimeout(() => {
        if (level >= 15) {
          setGameState('success');
          soundService.playLevelUp();
        } else {
          setLevel(l => l + 1);
          soundService.playLevelUp();
          nextTask();
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      soundService.playWrong();
      setTimeout(() => {
        setFeedback(null);
      }, 1500);
    }
  };

  const handleMemoryClick = (card: any) => {
    if (memoryFlipped.length === 2 || memoryFlipped.includes(card.id) || memoryMatched.includes(card.emoji)) return;

    const newFlipped = [...memoryFlipped, card.id];
    setMemoryFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const card1 = currentTask.cards.find((c: any) => c.id === newFlipped[0]);
      const card2 = currentTask.cards.find((c: any) => c.id === newFlipped[1]);

      if (card1.emoji === card2.emoji) {
        const newMatched = [...memoryMatched, card1.emoji];
        setMemoryMatched(newMatched);
        setMemoryFlipped([]);
        soundService.playCorrect();

        if (newMatched.length === currentTask.pairsCount) {
          updateStats(GameType.MEMORY, true);
          setFeedback('correct');
          setScore(s => s + 20);
          setTimeout(() => {
            setLevel(l => l + 1);
            soundService.playLevelUp();
            nextTask();
          }, 1500);
        }
      } else {
        soundService.playWrong();
        setTimeout(() => setMemoryFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-inset">
      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center max-w-md w-full"
          >
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-[#5A5A40]">
                <Brain className="w-12 h-12 text-[#5A5A40]" />
              </div>
            </div>
            <h1 className="text-5xl serif font-bold mb-4 text-[#5A5A40]">Schlaue Köpfe</h1>
            <p className="text-lg text-gray-600 mb-12 italic">Das kognitive Abenteuer für kleine Entdecker.</p>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={startGame}
                className="olive-button text-xl px-12 py-4 flex items-center gap-3 mx-auto shadow-xl"
              >
                <Gamepad2 className="w-6 h-6" />
                Jetzt Spielen
              </button>

              <button 
                onClick={() => setGameState('parent')}
                className="text-[#5A5A40] font-semibold flex items-center gap-2 mx-auto mt-4 opacity-70 hover:opacity-100 transition-opacity"
              >
                <Target className="w-5 h-5" />
                Elternbereich
              </button>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-4 opacity-60">
              <div className="flex flex-col items-center gap-2">
                <Shapes className="w-6 h-6" />
                <span className="text-xs uppercase tracking-widest">Muster</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Lightbulb className="w-6 h-6" />
                <span className="text-xs uppercase tracking-widest">Logik</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Brain className="w-6 h-6" />
                <span className="text-xs uppercase tracking-widest">Gedächtnis</span>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'parent' && (
          <motion.div 
            key="parent"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-md"
          >
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-8">
                <Brain className="w-8 h-8 text-[#5A5A40]" />
                <h2 className="text-3xl serif font-bold">Elternbereich</h2>
              </div>

              <div className="space-y-6 mb-12">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Höchstes Level</p>
                    <p className="text-2xl font-bold text-[#5A5A40]">{stats.highestLevel}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Genauigkeit</p>
                    <p className="text-2xl font-bold text-[#5A5A40]">
                      {stats.totalPlayed > 0 ? Math.round((stats.correctAnswers / stats.totalPlayed) * 100) : 0}%
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Kategorien</p>
                  {(Object.entries(stats.categoryStats) as [GameType, { played: number; correct: number }][]).map(([type, s]) => (
                    <div key={type} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{type}</span>
                      <span className="font-bold">
                        {s.played > 0 ? Math.round((s.correct / s.played) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={resetStats}
                  className="bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Fortschritt zurücksetzen
                </button>
                <button 
                  onClick={() => setGameState('menu')}
                  className="olive-button py-4 flex items-center justify-center gap-2"
                >
                  Zurück zum Menü
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && currentTask && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8 px-2">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-lg">{score}</span>
              </div>
              <div className="text-[#5A5A40] font-bold serif text-xl">
                Level {level}
              </div>
              <div className="w-24" /> {/* Spacer for symmetry */}
            </div>

            {/* Game Area */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="card w-full p-8 mb-8 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${gameType}-${level}`}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    {gameType === GameType.PATTERNS && (
                      <div className="flex flex-wrap justify-center gap-4 items-center min-h-[120px]">
                        {currentTask.question.map((item: { shape: string; color: string }, i: number) => (
                          <ShapeIcon key={i} name={item.shape} className={item.color} />
                        ))}
                        <div className="w-12 h-12 border-4 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <span className="text-2xl text-gray-300">?</span>
                        </div>
                      </div>
                    )}

                    {gameType === GameType.LOGIC && (
                      <div className="text-center">
                        <h2 className="text-2xl serif mb-8">{currentTask.prompt}</h2>
                        <div className="flex flex-wrap justify-center gap-6">
                          {currentTask.items.map((item: string, i: number) => (
                            <div key={i} className="text-6xl p-4 bg-gray-50 rounded-2xl shadow-inner">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {gameType === GameType.SHADOWS && (
                      <div className="text-center">
                        <h2 className="text-2xl serif mb-8">{currentTask.prompt}</h2>
                        <div className="text-9xl p-8 bg-gray-100 rounded-3xl shadow-inner mb-4 flex items-center justify-center">
                          <span style={{ filter: 'brightness(0)', opacity: 0.8 }}>
                            {currentTask.answer}
                          </span>
                        </div>
                      </div>
                    )}

                    {gameType === GameType.COUNTING && (
                      <div className="text-center">
                        <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-sm mx-auto">
                          {[...Array(currentTask.count)].map((_, i) => (
                            <span key={i} className="text-5xl">{currentTask.emoji}</span>
                          ))}
                        </div>
                        <h2 className="text-2xl serif">Wie viele sind es?</h2>
                      </div>
                    )}

                    {gameType === GameType.MEMORY && (
                      <div className="text-center w-full">
                        <h2 className="text-2xl serif mb-6">{currentTask.prompt}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-sm mx-auto">
                          {currentTask.cards.map((card: any) => (
                            <motion.button
                              key={card.id}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleMemoryClick(card)}
                              className={`h-24 rounded-2xl flex items-center justify-center text-4xl shadow-sm transition-all duration-300 ${
                                memoryFlipped.includes(card.id) || memoryMatched.includes(card.emoji)
                                  ? 'bg-white rotate-0'
                                  : 'bg-[#5A5A40] rotate-180'
                              }`}
                            >
                              {(memoryFlipped.includes(card.id) || memoryMatched.includes(card.emoji)) ? card.emoji : '?'}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Feedback Overlay */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className={`absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10`}
                    >
                      {feedback === 'correct' ? (
                        <div className="text-center">
                          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="w-12 h-12 text-white fill-white" />
                          </div>
                          <p className="text-2xl font-bold text-green-600 serif">Super gemacht!</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <RefreshCw className="w-12 h-12 text-white" />
                          </div>
                          <p className="text-2xl font-bold text-red-600 serif">Versuch's nochmal!</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Options (Not for Memory) */}
              {gameType !== GameType.MEMORY && (
                <div className="grid grid-cols-2 gap-4 w-full">
                  {(gameType === GameType.LOGIC ? currentTask.items : currentTask.options).map((option: any, i: number) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(option)}
                      className="card p-6 flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-transparent active:border-[#5A5A40]"
                    >
                      {gameType === GameType.PATTERNS ? (
                        <ShapeIcon name={(option as { shape: string; color: string }).shape} className={(option as { shape: string; color: string }).color} />
                      ) : (gameType === GameType.LOGIC || gameType === GameType.SHADOWS) ? (
                        <span className="text-5xl">{option}</span>
                      ) : (
                        <span className="text-4xl font-bold serif">{option}</span>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {gameState === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center card p-12 max-w-md w-full"
          >
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-yellow-600" />
            </div>
            <h2 className="text-4xl serif font-bold mb-2">Genial!</h2>
            <p className="text-gray-600 mb-8">Du bist ein echter Meister-Denker! Du hast alle Level geschafft.</p>
            <div className="bg-yellow-50 rounded-2xl p-4 mb-8">
              <p className="text-sm uppercase tracking-widest text-yellow-600 mb-1">Endstand</p>
              <p className="text-4xl font-bold text-[#5A5A40]">{score}</p>
            </div>
            <button 
              onClick={() => setGameState('menu')}
              className="olive-button w-full text-lg flex items-center justify-center gap-2"
            >
              Zum Hauptmenü
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 border-8 border-[#5A5A40] rounded-full" />
        <div className="absolute bottom-20 right-10 w-48 h-48 border-8 border-[#5A5A40] rotate-12" />
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-[#5A5A40] rounded-sm -rotate-45" />
      </div>
    </div>
  );
}
