'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Confetti from '@/components/Confetti';
import Loading from '@/components/Loading';
import { Player } from '@/types';

interface PlayerScore extends Player {
  bad: number;
  good: number;
}

export default function ScoreboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFinal = searchParams.get('final') === 'true';
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [scores, setScores] = useState<Record<number, { bad: number; good: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const playersRes = await fetch('/api/players');
        setPlayers(await playersRes.json());
        
        const saved = localStorage.getItem('playerScores');
        if (saved) {
          setScores(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const playerScores: PlayerScore[] = players.map(p => ({
    ...p,
    bad: scores[p.id]?.bad || 0,
    good: scores[p.id]?.good || 0,
  }));

  const sortedByBad = [...playerScores].sort((a, b) => b.bad - a.bad);
  const mostDestroyed = sortedByBad[0];
  const mostLoved = sortedByBad[sortedByBad.length - 1];

  return (
    <>
      <Header />
      {isFinal && <Confetti />}
      
      <div className="min-h-screen pt-16 sm:pt-20 pb-20 md:pb-8 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            {isFinal ? (
              <>
                <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 animate-float">🏆</div>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl gradient-text mb-1 sm:mb-2">GAME OVER!</h1>
                <p className="font-marker text-base sm:text-xl text-purple-400">The Truth Has Been Revealed!</p>
              </>
            ) : (
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl gradient-text">🏆 Scoreboard</h1>
            )}
          </div>
          
          {/* Top Winners */}
          {isFinal && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="card p-4 sm:p-6 border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent">
                <p className="text-[10px] sm:text-xs text-red-400 uppercase tracking-widest mb-2 sm:mb-3">💀 Most Destroyed</p>
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-3xl sm:text-4xl">{mostDestroyed?.emoji}</span>
                  <div>
                    <p className="text-lg sm:text-xl font-bold">{mostDestroyed?.name}</p>
                    <p className="text-zinc-500 text-xs sm:text-sm">{mostDestroyed?.bad} brutal awards</p>
                  </div>
                </div>
              </div>
              <div className="card p-4 sm:p-6 border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
                <p className="text-[10px] sm:text-xs text-green-400 uppercase tracking-widest mb-2 sm:mb-3">👑 Most Loved</p>
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-3xl sm:text-4xl">{mostLoved?.emoji}</span>
                  <div>
                    <p className="text-lg sm:text-xl font-bold">{mostLoved?.name}</p>
                    <p className="text-zinc-500 text-xs sm:text-sm">{mostLoved?.good} wins</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* All Scores */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {playerScores.map((player) => (
              <div key={player.id} className="card p-3 sm:p-4 text-center">
                <span className="text-2xl sm:text-3xl block mb-1 sm:mb-2">{player.emoji}</span>
                <p className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 truncate">{player.name}</p>
                <div className="flex justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
                  <span className="text-red-400">💀 {player.bad}</span>
                  <span className="text-green-400">👑 {player.good}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-center mt-6 sm:mt-8">
            <button
              onClick={() => router.push('/game')}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-dark-card border border-white/10 hover:border-purple-500/50 transition-all text-sm sm:text-base"
            >
              ← Back to Game
            </button>
            {isFinal && (
              <button
                onClick={() => {
                  localStorage.removeItem('currentQuestion');
                  localStorage.removeItem('playerScores');
                  localStorage.removeItem('odcId');
                  localStorage.removeItem('votedQuestions');
                  router.push('/');
                }}
                className="btn-gold px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-semibold"
              >
                🔄 Play Again
              </button>
            )}
          </div>
        </div>
      </div>
      
      <BottomNav />
    </>
  );
}
