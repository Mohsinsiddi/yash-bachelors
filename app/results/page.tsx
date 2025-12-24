'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import WinnerCard from '@/components/WinnerCard';
import Confetti from '@/components/Confetti';
import Loading from '@/components/Loading';
import { Player, Question, GameSession } from '@/types';

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const questionIndexParam = searchParams.get('q');
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [session, setSession] = useState<GameSession & { remainingSeconds: number; canRevealTwist: boolean } | null>(null);
  const [voteCount, setVoteCount] = useState<Record<number, number>>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showTwist, setShowTwist] = useState(false);
  const [twistRevealed, setTwistRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [waitingForReveal, setWaitingForReveal] = useState(false);
  const [timeUntilReveal, setTimeUntilReveal] = useState(0);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/session');
      const data = await res.json();
      setSession(data);
      
      if (data.remainingSeconds > 0) {
        setTimeUntilReveal(data.remainingSeconds);
        setWaitingForReveal(true);
      } else {
        setWaitingForReveal(false);
      }
      
      if (data.status === 'results' && data.twistRevealedAt) {
        setTwistRevealed(true);
      }
      
      return data;
    } catch (error) {
      console.error('Failed to fetch session:', error);
      return null;
    }
  }, []);

  const fetchVotes = useCallback(async (qId: number) => {
    try {
      const votesRes = await fetch(`/api/votes?questionId=${qId}`);
      const votesData = await votesRes.json();
      setVoteCount(votesData.voteCount || {});
      setTotalVotes(votesData.votes?.length || 0);
    } catch (error) {
      console.error('Failed to fetch votes:', error);
    }
  }, []);

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
        
        const qIndex = questionIndexParam !== null 
          ? parseInt(questionIndexParam) 
          : sessionData?.currentQuestionIndex || 0;
          
        if (questionsData.length > qIndex) {
          await fetchVotes(questionsData[qIndex].id);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [questionIndexParam, fetchSession, fetchVotes]);

  useEffect(() => {
    const questionIndex = questionIndexParam !== null 
      ? parseInt(questionIndexParam) 
      : session?.currentQuestionIndex || 0;
      
    if (questions.length > questionIndex) {
      const interval = setInterval(() => {
        fetchVotes(questions[questionIndex].id);
        fetchSession();
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [questions, questionIndexParam, session?.currentQuestionIndex, fetchVotes, fetchSession]);

  useEffect(() => {
    if (timeUntilReveal > 0) {
      const timer = setInterval(() => {
        setTimeUntilReveal(prev => {
          if (prev <= 1) {
            setWaitingForReveal(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeUntilReveal]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const questionIndex = questionIndexParam !== null 
    ? parseInt(questionIndexParam) 
    : session?.currentQuestionIndex || 0;
  const question = questions[questionIndex];
  const needsTwist = question?.type === 'TWIST' || question?.type === 'BLIND' || question?.type === 'RANKING';
  
  const sortedPlayers = [...players]
    .map(p => ({ ...p, votes: voteCount[p.id] || 0 }))
    .sort((a, b) => b.votes - a.votes);
  
  const totalVotesSum = sortedPlayers.reduce((sum, p) => sum + p.votes, 0) || 1;
  const loser = sortedPlayers[0];
  const winner = sortedPlayers[sortedPlayers.length - 1];

  const handleRevealTwist = async () => {
    try {
      await fetch('/api/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reveal_twist' }),
      });
    } catch (error) {
      console.error('Failed to update session:', error);
    }
    
    setShowTwist(true);
  };

  const handleCloseTwist = () => {
    setShowTwist(false);
    setTwistRevealed(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleNext = async () => {
    try {
      await fetch('/api/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'next_question' }),
      });
    } catch (error) {
      console.error('Failed to update session:', error);
    }
    
    router.push('/game');
  };

  return (
    <>
      <Header />
      {showConfetti && <Confetti />}
      
      <div className="min-h-screen pt-16 sm:pt-20 pb-20 md:pb-8 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-8">
            <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest mb-1 sm:mb-2">Results</p>
            <h1 className="text-base sm:text-xl lg:text-2xl font-bold px-2">{question?.question}</h1>
            <p className="text-xs sm:text-sm text-purple-400 mt-1 sm:mt-2">
              {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
              <span className="text-zinc-500 ml-1 sm:ml-2">(live)</span>
            </p>
          </div>
          
          {/* Waiting Banner */}
          {waitingForReveal && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-center">
              <p className="text-yellow-300 font-semibold text-sm sm:text-base mb-1 sm:mb-2">⏱️ Voting in progress</p>
              <p className="text-yellow-400 font-display text-2xl sm:text-3xl">{formatTime(timeUntilReveal)}</p>
              <p className="text-yellow-300/60 text-[10px] sm:text-sm mt-1">until reveal</p>
            </div>
          )}
          
          {/* Vote Chart */}
          <div className="card p-3 sm:p-6 mb-4 sm:mb-8">
            {sortedPlayers.map((player, index) => {
              const pct = (player.votes / totalVotesSum) * 100;
              const isMost = index === 0 && player.votes > 0;
              const isLeast = index === sortedPlayers.length - 1;
              
              return (
                <div key={player.id} className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3 last:mb-0">
                  <div className="w-20 sm:w-28 flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <span className="text-base sm:text-xl">{player.emoji}</span>
                    <span className="text-xs sm:text-sm font-medium truncate">{player.name}</span>
                  </div>
                  <div className="flex-1 h-7 sm:h-10 bg-dark-elevated rounded-lg overflow-hidden">
                    <div
                      className={`h-full rounded-lg flex items-center justify-end px-2 sm:px-3 transition-all duration-500 ${
                        isMost ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                        isLeast ? 'bg-gradient-to-r from-green-500 to-cyan-500' :
                        'bg-gradient-to-r from-purple-500 to-purple-600'
                      }`}
                      style={{ width: `${Math.max(pct, player.votes > 0 ? 15 : 5)}%` }}
                    >
                      <span className="text-xs sm:text-sm font-bold">{player.votes}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Twist Button */}
          {needsTwist && !twistRevealed && !waitingForReveal && (
            <div className="text-center mb-6 sm:mb-8">
              <button
                onClick={handleRevealTwist}
                className="px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-semibold bg-gradient-to-r from-red-500 to-pink-500 animate-pulse-glow w-full sm:w-auto"
              >
                🔥 Reveal The Twist
              </button>
            </div>
          )}
          
          {/* Winners */}
          {(!needsTwist || twistRevealed) && !waitingForReveal && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <WinnerCard player={loser} question={question} votes={loser.votes} type="loser" />
              <WinnerCard player={winner} question={question} votes={winner.votes} type="winner" />
            </div>
          )}
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-center">
            <button
              onClick={() => router.push('/scoreboard')}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-dark-card border border-white/10 hover:border-purple-500/50 transition-all text-sm sm:text-base"
            >
              📊 Scoreboard
            </button>
            {(!waitingForReveal && (!needsTwist || twistRevealed)) && (
              <button
                onClick={handleNext}
                className="btn-gold px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-semibold"
              >
                {questionIndex < questions.length - 1 ? 'Next Question ➡️' : '🏆 Final Results'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Twist Overlay */}
      {showTwist && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <div className="text-center animate-fadeInUp max-w-lg">
            <div className="text-5xl sm:text-7xl mb-4 sm:mb-6 animate-shake">⚡</div>
            <p className="font-marker text-lg sm:text-2xl text-red-400 mb-3 sm:mb-4">
              {question.type === 'BLIND' ? '🎰 THE HIDDEN QUESTION WAS...' : '⚡ PLOT TWIST! ⚡'}
            </p>
            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl gradient-text-purple mb-6 sm:mb-8 px-4">
              {question.type === 'BLIND' ? question.hiddenQuestion : 'THE MEANING IS REVERSED!'}
            </h1>
            <button
              onClick={handleCloseTwist}
              className="btn-gold px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-semibold"
            >
              😈 Show Me The Damage
            </button>
          </div>
        </div>
      )}
      
      <BottomNav />
    </>
  );
}
