'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Loading from '@/components/Loading';
import { Player, Question, GameSession } from '@/types';
import { ChevronDown, ChevronUp, Lock, Clock, Trophy, Skull, Crown } from 'lucide-react';

interface QuestionResult {
  question: Question;
  votes: Record<number, number>;
  totalVotes: number;
  status: 'completed' | 'current' | 'upcoming';
  loser?: Player & { votes: number };
  winner?: Player & { votes: number };
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [session, setSession] = useState<GameSession & { remainingSeconds: number } | null>(null);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  // Fetch session
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/session');
      const data = await res.json();
      setSession(data);
      setTimeLeft(data.remainingSeconds || 0);
      return data;
    } catch (error) {
      console.error('Failed to fetch session:', error);
      return null;
    }
  }, []);

  // Fetch all votes
  const fetchAllVotes = useCallback(async (qs: Question[], ps: Player[], currentIndex: number) => {
    const results: QuestionResult[] = [];
    
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      let status: 'completed' | 'current' | 'upcoming';
      
      if (i < currentIndex) {
        status = 'completed';
      } else if (i === currentIndex) {
        status = 'current';
      } else {
        status = 'upcoming';
      }
      
      // Only fetch votes for completed and current questions
      let votes: Record<number, number> = {};
      let totalVotes = 0;
      
      if (status !== 'upcoming') {
        try {
          const res = await fetch(`/api/votes?questionId=${q.id}`);
          const data = await res.json();
          votes = data.voteCount || {};
          totalVotes = data.votes?.length || 0;
        } catch (error) {
          console.error(`Failed to fetch votes for Q${q.id}:`, error);
        }
      }
      
      // Calculate winner/loser for completed questions
      let loser, winner;
      if (status === 'completed' && totalVotes > 0) {
        const sorted = ps
          .map(p => ({ ...p, votes: votes[p.id] || 0 }))
          .sort((a, b) => b.votes - a.votes);
        loser = sorted[0];
        winner = sorted[sorted.length - 1];
      }
      
      results.push({
        question: q,
        votes,
        totalVotes,
        status,
        loser,
        winner,
      });
    }
    
    setQuestionResults(results);
  }, []);

  // Initial fetch
  useEffect(() => {
    async function fetchData() {
      try {
        const [playersRes, questionsRes, sessionData] = await Promise.all([
          fetch('/api/players'),
          fetch('/api/questions'),
          fetchSession(),
        ]);
        
        const playersData = await playersRes.json();
        const questionsData = await questionsRes.json();
        
        setPlayers(playersData);
        setQuestions(questionsData);
        
        // Fetch all votes
        await fetchAllVotes(questionsData, playersData, sessionData?.currentQuestionIndex || 0);
        
        // Auto-expand current question
        if (sessionData?.currentQuestionIndex !== undefined) {
          setExpandedQuestions(new Set([sessionData.currentQuestionIndex]));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [fetchSession, fetchAllVotes]);

  // Refresh data every 5 seconds
  useEffect(() => {
    if (questions.length > 0 && players.length > 0) {
      const interval = setInterval(async () => {
        const sessionData = await fetchSession();
        if (sessionData) {
          await fetchAllVotes(questions, players, sessionData.currentQuestionIndex || 0);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [questions, players, fetchSession, fetchAllVotes]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TWIST': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'DIRECT': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'BLIND': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'RANKING': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Calculate overall scores
  const playerScores = players.map(p => {
    let bad = 0, good = 0;
    questionResults.forEach(qr => {
      if (qr.status === 'completed') {
        if (qr.loser?.id === p.id) bad++;
        if (qr.winner?.id === p.id) good++;
      }
    });
    return { ...p, bad, good };
  }).sort((a, b) => b.bad - a.bad);

  const completedCount = questionResults.filter(qr => qr.status === 'completed').length;

  return (
    <>
      <Header />
      
      <div className="min-h-screen pt-16 sm:pt-20 pb-20 md:pb-8 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl gradient-text mb-2">🏆 Leaderboard</h1>
            <p className="text-zinc-400 text-sm sm:text-base">
              {completedCount} of {questions.length} questions completed
            </p>
          </div>
          
          {/* Overall Scores */}
          <div className="card p-4 sm:p-6 mb-6">
            <h2 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-yellow-400" />
              Overall Standings
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {playerScores.map((player, index) => (
                <div 
                  key={player.id} 
                  className={`p-2 sm:p-3 rounded-xl text-center ${
                    index === 0 ? 'bg-red-500/10 border border-red-500/30' :
                    index === playerScores.length - 1 ? 'bg-green-500/10 border border-green-500/30' :
                    'bg-dark-elevated'
                  }`}
                >
                  <span className="text-xl sm:text-2xl block">{player.emoji}</span>
                  <p className="font-medium text-xs sm:text-sm truncate mt-1">{player.name}</p>
                  <div className="flex justify-center gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs">
                    <span className="text-red-400">💀{player.bad}</span>
                    <span className="text-green-400">👑{player.good}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Question Results */}
          <div className="space-y-3">
            {questionResults.map((qr, index) => {
              const isExpanded = expandedQuestions.has(index);
              const isCurrent = qr.status === 'current';
              const isCompleted = qr.status === 'completed';
              const isUpcoming = qr.status === 'upcoming';
              
              return (
                <div 
                  key={qr.question.id}
                  className={`card overflow-hidden transition-all ${
                    isCurrent ? 'border-yellow-500/50 ring-2 ring-yellow-500/20' :
                    isCompleted ? 'border-green-500/20' :
                    'border-zinc-700/50 opacity-60'
                  }`}
                >
                  {/* Question Header */}
                  <button
                    onClick={() => !isUpcoming && toggleExpanded(index)}
                    disabled={isUpcoming}
                    className={`w-full p-3 sm:p-4 flex items-center gap-3 text-left ${
                      isUpcoming ? 'cursor-not-allowed' : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Status Icon */}
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCurrent ? 'bg-yellow-500/20' :
                      isCompleted ? 'bg-green-500/20' :
                      'bg-zinc-700/50'
                    }`}>
                      {isCurrent && <Clock size={18} className="text-yellow-400" />}
                      {isCompleted && <span className="text-green-400">✓</span>}
                      {isUpcoming && <Lock size={16} className="text-zinc-500" />}
                    </div>
                    
                    {/* Question Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display text-zinc-500 text-xs sm:text-sm">Q{index + 1}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs border ${getTypeColor(qr.question.type)}`}>
                          {qr.question.type}
                        </span>
                        {isCurrent && (
                          <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold ${
                            timeLeft > 60 ? 'bg-green-500/20 text-green-400' :
                            timeLeft > 30 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400 animate-pulse'
                          }`}>
                            ⏱️ {formatTime(timeLeft)}
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] sm:text-xs text-zinc-500">
                            {qr.totalVotes} votes
                          </span>
                        )}
                      </div>
                      <p className={`text-sm sm:text-base font-medium truncate ${isUpcoming ? 'blur-sm select-none' : ''}`}>
                        {isUpcoming ? 'Hidden question...' : qr.question.question}
                      </p>
                    </div>
                    
                    {/* Winners Preview (Completed) */}
                    {isCompleted && qr.loser && qr.winner && !isExpanded && (
                      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 rounded-lg">
                          <span className="text-base">{qr.loser.emoji}</span>
                          <Skull size={14} className="text-red-400" />
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-lg">
                          <span className="text-base">{qr.winner.emoji}</span>
                          <Crown size={14} className="text-green-400" />
                        </div>
                      </div>
                    )}
                    
                    {/* Expand Icon */}
                    {!isUpcoming && (
                      <div className="flex-shrink-0 text-zinc-500">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    )}
                  </button>
                  
                  {/* Expanded Content */}
                  {isExpanded && !isUpcoming && (
                    <div className="px-3 sm:px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                      {/* Hint */}
                      <div className="p-3 bg-yellow-500/5 border-l-4 border-yellow-400 rounded-r-xl">
                        <p className="text-xs sm:text-sm text-zinc-400">💡 {qr.question.hint}</p>
                      </div>
                      
                      {/* Vote Chart */}
                      {qr.totalVotes > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider">Vote Distribution</p>
                          {players
                            .map(p => ({ ...p, votes: qr.votes[p.id] || 0 }))
                            .sort((a, b) => b.votes - a.votes)
                            .map((player, idx) => {
                              const pct = (player.votes / (qr.totalVotes || 1)) * 100;
                              const isLoser = idx === 0 && player.votes > 0;
                              const isWinner = idx === players.length - 1;
                              
                              return (
                                <div key={player.id} className="flex items-center gap-2">
                                  <div className="w-16 sm:w-20 flex items-center gap-1.5 flex-shrink-0">
                                    <span className="text-sm sm:text-base">{player.emoji}</span>
                                    <span className="text-[10px] sm:text-xs truncate">{player.name}</span>
                                  </div>
                                  <div className="flex-1 h-6 sm:h-7 bg-dark-elevated rounded overflow-hidden">
                                    <div
                                      className={`h-full rounded flex items-center justify-end px-2 transition-all ${
                                        isLoser ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                                        isWinner ? 'bg-gradient-to-r from-green-500 to-cyan-500' :
                                        'bg-purple-500/50'
                                      }`}
                                      style={{ width: `${Math.max(pct, player.votes > 0 ? 12 : 3)}%` }}
                                    >
                                      <span className="text-[10px] sm:text-xs font-bold">{player.votes}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <p className="text-center text-zinc-500 text-sm py-4">
                          {isCurrent ? '⏳ Waiting for votes...' : 'No votes recorded'}
                        </p>
                      )}
                      
                      {/* Winners (Completed) */}
                      {isCompleted && qr.loser && qr.winner && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                            <p className="text-[10px] sm:text-xs text-red-400 uppercase tracking-wider mb-1">💀 Loser</p>
                            <span className="text-2xl sm:text-3xl block">{qr.loser.emoji}</span>
                            <p className="font-semibold text-sm sm:text-base">{qr.loser.name}</p>
                            <p className="text-[10px] sm:text-xs text-zinc-500">{qr.loser.votes} votes</p>
                            <p className="text-[10px] sm:text-xs text-red-400 mt-1">{qr.question.mostVotes?.title}</p>
                          </div>
                          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                            <p className="text-[10px] sm:text-xs text-green-400 uppercase tracking-wider mb-1">👑 Winner</p>
                            <span className="text-2xl sm:text-3xl block">{qr.winner.emoji}</span>
                            <p className="font-semibold text-sm sm:text-base">{qr.winner.name}</p>
                            <p className="text-[10px] sm:text-xs text-zinc-500">{qr.winner.votes} votes</p>
                            <p className="text-[10px] sm:text-xs text-green-400 mt-1">{qr.question.leastVotes?.title}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Current Question Actions */}
                      {isCurrent && (
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <button
                            onClick={() => router.push('/game')}
                            className="btn-gold px-4 py-2.5 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base font-semibold flex-1"
                          >
                            🎮 Vote Now
                          </button>
                          <button
                            onClick={() => router.push(`/results?q=${index}`)}
                            className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-full bg-purple-500/20 text-purple-300 text-sm sm:text-base flex-1"
                          >
                            📊 View Results
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Back Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => router.push('/game')}
              className="px-6 py-3 rounded-full bg-dark-card border border-white/10 hover:border-purple-500/50 transition-all text-sm sm:text-base"
            >
              ← Back to Game
            </button>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </>
  );
}
