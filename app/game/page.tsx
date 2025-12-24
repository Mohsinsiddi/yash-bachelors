'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import QuestionCard from '@/components/QuestionCard';
import VoteCard from '@/components/VoteCard';
import PlayerSelect from '@/components/PlayerSelect';
import Loading from '@/components/Loading';
import { Player, Question, GameSession } from '@/types';
import { RotateCcw, LogOut } from 'lucide-react';

export default function GamePage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [session, setSession] = useState<GameSession & { remainingSeconds: number } | null>(null);
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [changingVote, setChangingVote] = useState(false);
  const [votedQuestions, setVotedQuestions] = useState<Record<number, number>>({});
  
  // Track current question to detect changes
  const lastQuestionIndex = useRef<number>(-1);
  
  // Current user (player)
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);

  // Load saved player from localStorage on mount
  useEffect(() => {
    const savedPlayerId = localStorage.getItem('currentPlayerId');
    const savedPlayerName = localStorage.getItem('currentPlayerName');
    const savedPlayerEmoji = localStorage.getItem('currentPlayerEmoji');
    
    if (savedPlayerId && savedPlayerName) {
      setCurrentPlayer({
        id: parseInt(savedPlayerId),
        name: savedPlayerName,
        emoji: savedPlayerEmoji || '😀',
        isActive: true,
      });
    }
  }, []);

  // Fetch session
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/session');
      const data = await res.json();
      
      // Detect question change - reset timer from server
      if (lastQuestionIndex.current !== -1 && lastQuestionIndex.current !== data.currentQuestionIndex) {
        // Question changed! Use server's remaining time
        setTimeLeft(data.remainingSeconds || 0);
        setHasVoted(false);
        setSelectedVote(null);
      }
      
      lastQuestionIndex.current = data.currentQuestionIndex;
      setSession(data);
      
      // Only set timeLeft if it's significantly different (avoid drift)
      // Or if this is initial load
      if (Math.abs((data.remainingSeconds || 0) - timeLeft) > 3 || timeLeft === 0) {
        setTimeLeft(data.remainingSeconds || 0);
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch session:', error);
      return null;
    }
  }, [timeLeft]);

  // Fetch vote status from database
  const fetchVoteStatus = useCallback(async (playerId: number) => {
    try {
      const res = await fetch(`/api/votes/status?voterId=${playerId}`);
      const data = await res.json();
      setVotedQuestions(data.votedQuestions || {});
      return data.votedQuestions || {};
    } catch (error) {
      console.error('Failed to fetch vote status:', error);
      return {};
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    async function fetchData() {
      try {
        const [playersRes, questionsRes] = await Promise.all([
          fetch('/api/players'),
          fetch('/api/questions'),
        ]);
        
        setPlayers(await playersRes.json());
        setQuestions(await questionsRes.json());
        
        // Fetch session and set initial timer
        const sessionData = await fetchSession();
        if (sessionData) {
          setTimeLeft(sessionData.remainingSeconds || 0);
          lastQuestionIndex.current = sessionData.currentQuestionIndex;
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Fetch vote status when player is set
  useEffect(() => {
    if (currentPlayer) {
      fetchVoteStatus(currentPlayer.id);
    }
  }, [currentPlayer, fetchVoteStatus]);

  // Refresh session periodically - and sync timer
  useEffect(() => {
    const interval = setInterval(fetchSession, 3000);
    return () => clearInterval(interval);
  }, [fetchSession]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  // Check if voted for current question
  useEffect(() => {
    if (session && currentPlayer) {
      const questionId = session.currentQuestionId;
      const votedFor = votedQuestions[questionId];
      setHasVoted(!!votedFor);
      setSelectedVote(votedFor || null);
    }
  }, [session, currentPlayer, votedQuestions]);

  // Auto-redirect when timer ends
  useEffect(() => {
    if (session && timeLeft === 0 && session.status === 'voting' && hasVoted) {
      const timeout = setTimeout(() => {
        router.push(`/results?q=${session.currentQuestionIndex}`);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [timeLeft, session, router, hasVoted]);

  // Handle player selection
  const handlePlayerSelect = (player: Player) => {
    setCurrentPlayer(player);
    localStorage.setItem('currentPlayerId', player.id.toString());
    localStorage.setItem('currentPlayerName', player.name);
    localStorage.setItem('currentPlayerEmoji', player.emoji);
    setShowPlayerSelect(false);
    fetchVoteStatus(player.id);
  };

  // Handle logout (switch player)
  const handleLogout = () => {
    localStorage.removeItem('currentPlayerId');
    localStorage.removeItem('currentPlayerName');
    localStorage.removeItem('currentPlayerEmoji');
    setCurrentPlayer(null);
    setVotedQuestions({});
    setHasVoted(false);
    setSelectedVote(null);
  };

  // Submit vote
  const handleSubmit = async () => {
    if (!selectedVote || submitting || !session || !currentPlayer) return;
    
    setSubmitting(true);
    
    try {
      const questionId = session.currentQuestionId;
      
      await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          voterId: currentPlayer.id,
          voterName: currentPlayer.name,
          votedForId: selectedVote,
        }),
      });
      
      // Update local state
      setVotedQuestions(prev => ({ ...prev, [questionId]: selectedVote }));
      setHasVoted(true);
    } catch (error) {
      console.error('Failed to submit vote:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Change vote
  const handleChangeVote = async () => {
    if (!session || changingVote || !currentPlayer) return;
    
    setChangingVote(true);
    
    try {
      const questionId = session.currentQuestionId;
      
      await fetch(`/api/votes?voterId=${currentPlayer.id}&questionId=${questionId}`, {
        method: 'DELETE',
      });
      
      // Update local state
      setVotedQuestions(prev => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
      setHasVoted(false);
      setSelectedVote(null);
    } catch (error) {
      console.error('Failed to change vote:', error);
      alert('Failed to change vote. Please try again.');
    } finally {
      setChangingVote(false);
    }
  };

  const handleViewResults = () => {
    if (session) {
      router.push(`/results?q=${session.currentQuestionIndex}`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Show player selection if not registered
  if (!currentPlayer || showPlayerSelect) {
    return (
      <>
        <Header />
        <PlayerSelect 
          players={players} 
          onSelect={handlePlayerSelect}
        />
      </>
    );
  }

  if (!session || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg sm:text-xl mb-4">No active game session</p>
          <button onClick={() => router.push('/')} className="btn-gold px-6 py-3 rounded-full">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (session.status === 'completed') {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-16 pb-20 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-5xl sm:text-6xl mb-4">🏆</div>
            <h1 className="font-display text-2xl sm:text-3xl gradient-text mb-4">Game Complete!</h1>
            <p className="text-zinc-400 mb-6 text-sm sm:text-base">All questions have been answered</p>
            <button 
              onClick={() => router.push('/leaderboard')} 
              className="btn-gold px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg"
            >
              View Final Results
            </button>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  const currentQuestion = questions[session.currentQuestionIndex];
  const isVotingOpen = timeLeft > 0 && session.status === 'voting';
  const votedPlayer = selectedVote ? players.find(p => p.id === selectedVote) : null;

  return (
    <>
      <Header />
      
      <div className="min-h-screen pt-16 sm:pt-20 pb-20 md:pb-8 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Current Player Banner */}
          <div className="mb-4 p-3 bg-dark-card border border-white/10 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-xl">
                {currentPlayer.emoji}
              </div>
              <div>
                <p className="text-xs text-zinc-500">Playing as</p>
                <p className="font-semibold text-sm">{currentPlayer.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <LogOut size={14} />
              Switch
            </button>
          </div>
          
          {/* Progress & Timer */}
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm text-zinc-500">Progress</span>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full text-sm ${
                  timeLeft > 60 ? 'bg-green-500/20 text-green-400' :
                  timeLeft > 30 ? 'bg-yellow-500/20 text-yellow-400' :
                  timeLeft > 0 ? 'bg-red-500/20 text-red-400 animate-pulse' :
                  'bg-zinc-500/20 text-zinc-400'
                }`}>
                  <span className="text-sm sm:text-base">⏱️</span>
                  <span className="font-display text-lg sm:text-xl">{formatTime(timeLeft)}</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="font-display text-xl sm:text-2xl text-yellow-400">{session.currentQuestionIndex + 1}</span>
                  <span className="text-zinc-500 text-sm">/{questions.length}</span>
                </div>
              </div>
            </div>
            <div className="h-1 sm:h-1.5 bg-dark-card rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all duration-500"
                style={{ width: `${((session.currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Status Banners */}
          {!isVotingOpen && !hasVoted && (
            <div className="mb-4 p-3 sm:p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-center">
              <p className="text-red-300 font-semibold text-sm sm:text-base">⏱️ Voting time ended!</p>
              <button onClick={handleViewResults} className="mt-2 px-4 py-2 bg-red-500/30 rounded-lg text-red-300 text-xs sm:text-sm">
                View Results
              </button>
            </div>
          )}
          
          {hasVoted && (
            <div className="mb-4 p-3 sm:p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-center sm:text-left">
                  <span className="text-green-400 text-lg">✓</span>
                  <div>
                    <span className="text-green-300 text-sm sm:text-base font-medium">Vote submitted!</span>
                    {votedPlayer && (
                      <span className="text-green-400/70 text-sm ml-2">
                        You voted for {votedPlayer.emoji} {votedPlayer.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {isVotingOpen && (
                    <button
                      onClick={handleChangeVote}
                      disabled={changingVote}
                      className="flex items-center gap-1.5 px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg text-orange-300 text-xs sm:text-sm transition-colors disabled:opacity-50"
                    >
                      <RotateCcw size={14} className={changingVote ? 'animate-spin' : ''} />
                      {changingVote ? 'Removing...' : 'Change Vote'}
                    </button>
                  )}
                  <button onClick={handleViewResults} className="px-3 py-2 bg-green-500/30 hover:bg-green-500/40 rounded-lg text-green-300 text-xs sm:text-sm transition-colors">
                    View Results
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Question */}
          {currentQuestion && (
            <QuestionCard 
              question={currentQuestion} 
              currentIndex={session.currentQuestionIndex} 
              totalQuestions={questions.length} 
            />
          )}
          
          {/* Voting Grid */}
          <div className="mt-4 sm:mt-6 mb-4 sm:mb-6">
            <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest mb-3 sm:mb-4">
              {hasVoted ? 'Your Vote' : isVotingOpen ? 'Select Your Vote' : 'Voting Closed'}
            </p>
            <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 ${
              !isVotingOpen && !hasVoted ? 'opacity-50 pointer-events-none' : ''
            } ${hasVoted ? 'opacity-70' : ''}`}>
              {players.filter(p => p.id !== currentPlayer.id).map((player) => (
                <VoteCard
                  key={player.id}
                  player={player}
                  isSelected={selectedVote === player.id}
                  onSelect={() => isVotingOpen && !hasVoted && setSelectedVote(player.id)}
                  disabled={!isVotingOpen || hasVoted}
                />
              ))}
            </div>
            <p className="text-[10px] text-zinc-600 text-center mt-2">
              You can't vote for yourself 😉
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-between">
            {(hasVoted || !isVotingOpen) && (
              <button onClick={handleViewResults} className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-purple-500/20 text-purple-300 text-sm sm:text-base order-2 sm:order-1">
                📊 View Results
              </button>
            )}
            
            {isVotingOpen && !hasVoted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedVote || submitting}
                className="btn-gold px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 w-full sm:w-auto"
              >
                {submitting ? 'Submitting...' : '✓ Submit Vote'}
              </button>
            ) : !hasVoted ? (
              <button onClick={handleViewResults} className="btn-gold px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-semibold order-1 sm:order-2 w-full sm:w-auto">
                View Results →
              </button>
            ) : null}
          </div>
        </div>
      </div>
      
      <BottomNav />
    </>
  );
}
