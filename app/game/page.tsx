'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import QuestionCard from '@/components/QuestionCard';
import VoteCard from '@/components/VoteCard';
import Loading from '@/components/Loading';
import { Player, Question, GameSession } from '@/types';

export default function GamePage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [session, setSession] = useState<GameSession & { remainingSeconds: number; isVotingOpen: boolean } | null>(null);
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [voterId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('voterId');
      if (!id) {
        id = 'voter_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('voterId', id);
      }
      return id;
    }
    return 'voter_' + Math.random().toString(36).substr(2, 9);
  });

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

  useEffect(() => {
    async function fetchData() {
      try {
        const [playersRes, questionsRes] = await Promise.all([
          fetch('/api/players'),
          fetch('/api/questions'),
        ]);
        
        setPlayers(await playersRes.json());
        setQuestions(await questionsRes.json());
        await fetchSession();
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [fetchSession]);

  useEffect(() => {
    const interval = setInterval(fetchSession, 5000);
    return () => clearInterval(interval);
  }, [fetchSession]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (session && questions.length > 0) {
      const votedQuestions = JSON.parse(localStorage.getItem('votedQuestions') || '{}');
      const questionId = session.currentQuestionId;
      setHasVoted(!!votedQuestions[questionId]);
      setSelectedVote(votedQuestions[questionId] || null);
    }
  }, [session, questions]);

  useEffect(() => {
    if (session && timeLeft === 0 && session.status === 'voting') {
      const timeout = setTimeout(() => {
        router.push(`/results?q=${session.currentQuestionIndex}`);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [timeLeft, session, router]);

  const handleSubmit = async () => {
    if (!selectedVote || submitting || !session) return;
    
    setSubmitting(true);
    
    try {
      const questionId = session.currentQuestionId;
      const odcId = 'game_' + Date.now().toString(36);
      
      await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          odcId,
          questionId,
          voterId,
          votedForId: selectedVote,
        }),
      });
      
      const votedQuestions = JSON.parse(localStorage.getItem('votedQuestions') || '{}');
      votedQuestions[questionId] = selectedVote;
      localStorage.setItem('votedQuestions', JSON.stringify(votedQuestions));
      
      setHasVoted(true);
      router.push(`/results?q=${session.currentQuestionIndex}`);
    } catch (error) {
      console.error('Failed to submit vote:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setSubmitting(false);
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
              onClick={() => router.push('/scoreboard?final=true')} 
              className="btn-gold px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg"
            >
              View Final Scores
            </button>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  const currentQuestion = questions[session.currentQuestionIndex];
  const isVotingOpen = timeLeft > 0 && session.status === 'voting';

  return (
    <>
      <Header />
      
      <div className="min-h-screen pt-16 sm:pt-20 pb-20 md:pb-8 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress & Timer */}
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm text-zinc-500">Progress</span>
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Timer */}
                <div className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-4 sm:py-2 rounded-full text-sm ${
                  timeLeft > 60 ? 'bg-green-500/20 text-green-400' :
                  timeLeft > 30 ? 'bg-yellow-500/20 text-yellow-400' :
                  timeLeft > 0 ? 'bg-red-500/20 text-red-400 animate-pulse' :
                  'bg-zinc-500/20 text-zinc-400'
                }`}>
                  <span className="text-sm sm:text-base">⏱️</span>
                  <span className="font-display text-lg sm:text-xl">{formatTime(timeLeft)}</span>
                </div>
                
                {/* Counter */}
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
              <button
                onClick={handleViewResults}
                className="mt-2 px-4 py-2 bg-red-500/30 rounded-lg text-red-300 text-xs sm:text-sm"
              >
                View Results
              </button>
            </div>
          )}
          
          {hasVoted && (
            <div className="mb-4 p-3 sm:p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-green-300 text-sm sm:text-base">Vote submitted!</span>
              </div>
              <button
                onClick={handleViewResults}
                className="px-4 py-2 bg-green-500/30 rounded-lg text-green-300 text-xs sm:text-sm"
              >
                View Results
              </button>
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
            }`}>
              {players.map((player) => (
                <VoteCard
                  key={player.id}
                  player={player}
                  isSelected={selectedVote === player.id}
                  onSelect={() => isVotingOpen && !hasVoted && setSelectedVote(player.id)}
                  disabled={!isVotingOpen || hasVoted}
                />
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-between">
            {(hasVoted || !isVotingOpen) && (
              <button
                onClick={handleViewResults}
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-purple-500/20 text-purple-300 text-sm sm:text-base order-2 sm:order-1"
              >
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
            ) : (
              <button
                onClick={handleViewResults}
                className="btn-gold px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-semibold order-1 sm:order-2 w-full sm:w-auto"
              >
                View Results →
              </button>
            )}
          </div>
        </div>
      </div>
      
      <BottomNav />
    </>
  );
}
