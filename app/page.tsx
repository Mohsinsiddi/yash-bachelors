'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Loading from '@/components/Loading';
import { Player, GameConfig } from '@/types';

export default function HomePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [playersRes, configRes] = await Promise.all([
          fetch('/api/players'),
          fetch('/api/config'),
        ]);
        
        setPlayers(await playersRes.json());
        setConfig(await configRes.json());
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

  return (
    <>
      <Header title={config?.title} subtitle={config?.subtitle} />
      
      <div className="min-h-screen pt-16 sm:pt-20 pb-20 md:pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <section className="text-center py-6 sm:py-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-500/15 border border-purple-500/30 rounded-full mb-4 sm:mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs sm:text-sm text-purple-300">Bachelor Party Game</span>
            </div>
            
            {/* Date */}
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-5 sm:py-3 bg-dark-card border border-yellow-500/20 rounded-full mb-6 sm:mb-8">
              <span className="text-base sm:text-lg">📅</span>
              <span className="text-yellow-400 font-semibold text-sm sm:text-base">{config?.date}</span>
              <span className="text-base sm:text-lg">🎉</span>
            </div>
            
            {/* Title */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl mb-2">
              <span className="gradient-text">{config?.title}</span>
            </h1>
            <p className="font-marker text-xl sm:text-2xl lg:text-3xl text-purple-400 -rotate-2 mb-4 sm:mb-6">
              {config?.subtitle}
            </p>
            
            {/* Tagline */}
            <p className="text-sm sm:text-base lg:text-lg text-zinc-400 italic mb-8 sm:mb-10 px-4">
              "{config?.tagline}"
            </p>
            
            {/* Players */}
            <div className="mb-8 sm:mb-10">
              <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest mb-3 sm:mb-4">The Legends</p>
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 px-2">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full transition-all text-sm ${
                      player.name === config?.groomName
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold'
                        : 'bg-dark-card border border-white/5'
                    }`}
                  >
                    <span className="text-base sm:text-lg">{player.emoji}</span>
                    <span className="text-xs sm:text-sm">{player.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
              <Link
                href="/game"
                className="btn-gold px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-semibold w-full sm:w-auto animate-pulse-glow"
              >
                🎮 Start The Chaos
              </Link>
              <Link
                href="/name"
                className="px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-semibold bg-dark-card border border-white/10 hover:border-purple-500/50 transition-all w-full sm:w-auto"
              >
                📋 View Message
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex justify-center gap-6 sm:gap-12 lg:gap-16 mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-white/5">
              <div className="text-center">
                <p className="font-display text-3xl sm:text-4xl lg:text-5xl gradient-text-purple">10</p>
                <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest">Questions</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl sm:text-4xl lg:text-5xl gradient-text-purple">{players.length}</p>
                <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest">Legends</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl sm:text-4xl lg:text-5xl gradient-text-purple">∞</p>
                <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest">Chaos</p>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <BottomNav />
    </>
  );
}
