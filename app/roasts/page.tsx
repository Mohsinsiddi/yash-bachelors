'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Loading from '@/components/Loading';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Eye, EyeOff, Flame, Skull, Star, ChevronDown, ChevronUp } from 'lucide-react';

interface RoastPlayer {
  id: number;
  name: string;
  emoji: string;
  roast: string | null;
  dirtySecret: string | null;
  prediction: string | null;
  isRevealed: boolean;
}

export default function RoastsPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<RoastPlayer[]>([]);
  const [globalReveal, setGlobalReveal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);
  const [revealingPlayer, setRevealingPlayer] = useState<number | null>(null);
  const [localReveals, setLocalReveals] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchRoasts();
  }, []);

  async function fetchRoasts() {
    try {
      const res = await fetch('/api/roasts');
      const data = await res.json();
      setPlayers(data.players || []);
      setGlobalReveal(data.globalReveal || false);
    } catch (error) {
      console.error('Failed to fetch roasts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevealPlayer(playerId: number) {
    setRevealingPlayer(playerId);
    
    // Fetch with reveal for this specific player
    try {
      const res = await fetch(`/api/roasts?reveal=true&playerId=${playerId}`);
      const data = await res.json();
      setPlayers(data.players || []);
      setLocalReveals(prev => new Set([...prev, playerId]));
    } catch (error) {
      console.error('Failed to reveal:', error);
    } finally {
      setRevealingPlayer(null);
      setExpandedPlayer(playerId);
    }
  }

  const toggleExpanded = (playerId: number) => {
    setExpandedPlayer(expandedPlayer === playerId ? null : playerId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen pt-16 sm:pt-20 pb-20 md:pb-8 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="text-4xl sm:text-5xl mb-3">🔥</div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl gradient-text mb-2">Roast Profiles</h1>
            <p className="text-zinc-400 text-sm sm:text-base">AI-generated roasts for each legend</p>
            
            {!globalReveal && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full">
                <Lock size={16} className="text-red-400" />
                <span className="text-red-300 text-sm">Tap each profile to reveal their roast!</span>
              </div>
            )}
            
            {globalReveal && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                <Unlock size={16} className="text-green-400" />
                <span className="text-green-300 text-sm">All roasts revealed!</span>
              </div>
            )}
          </div>
          
          {/* Player Cards */}
          <div className="space-y-3 sm:space-y-4">
            {players.map((player) => {
              const isRevealed = globalReveal || localReveals.has(player.id);
              const isExpanded = expandedPlayer === player.id;
              const isRevealing = revealingPlayer === player.id;
              
              return (
                <motion.div
                  key={player.id}
                  layout
                  className={`card overflow-hidden transition-all ${
                    isRevealed 
                      ? 'border-yellow-500/30' 
                      : 'border-white/10 hover:border-red-500/30'
                  }`}
                >
                  {/* Player Header */}
                  <button
                    onClick={() => isRevealed ? toggleExpanded(player.id) : handleRevealPlayer(player.id)}
                    disabled={isRevealing}
                    className="w-full p-4 sm:p-5 flex items-center gap-3 sm:gap-4 text-left"
                  >
                    {/* Avatar */}
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl ${
                      isRevealed 
                        ? 'bg-gradient-to-br from-yellow-500/20 to-red-500/20' 
                        : 'bg-dark-elevated'
                    }`}>
                      {player.emoji}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg">{player.name}</h3>
                      {!isRevealed ? (
                        <p className="text-zinc-500 text-xs sm:text-sm flex items-center gap-1.5">
                          <Lock size={12} />
                          Tap to reveal dirty secrets...
                        </p>
                      ) : (
                        <p className="text-yellow-400 text-xs sm:text-sm flex items-center gap-1.5">
                          <Flame size={12} />
                          Roast unlocked!
                        </p>
                      )}
                    </div>
                    
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {isRevealing ? (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                          <Flame size={18} className="text-red-400" />
                        </div>
                      ) : isRevealed ? (
                        <div className="text-zinc-500">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                          <Eye size={16} className="text-red-400" />
                        </div>
                      )}
                    </div>
                  </button>
                  
                  {/* Revealed Content */}
                  <AnimatePresence>
                    {isRevealed && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/5"
                      >
                        <div className="p-4 sm:p-5 space-y-4">
                          {/* Roast */}
                          {player.roast && (
                            <div className="p-3 sm:p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <Flame size={16} className="text-red-400" />
                                <span className="text-[10px] sm:text-xs text-red-400 uppercase tracking-widest font-semibold">The Roast</span>
                              </div>
                              <p className="text-sm sm:text-base text-zinc-200">{player.roast}</p>
                            </div>
                          )}
                          
                          {/* Dirty Secret */}
                          {player.dirtySecret && (
                            <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <Skull size={16} className="text-purple-400" />
                                <span className="text-[10px] sm:text-xs text-purple-400 uppercase tracking-widest font-semibold">Dirty Secret</span>
                              </div>
                              <p className="text-sm sm:text-base text-zinc-200">{player.dirtySecret}</p>
                            </div>
                          )}
                          
                          {/* Prediction */}
                          {player.prediction && (
                            <div className="p-3 sm:p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <Star size={16} className="text-cyan-400" />
                                <span className="text-[10px] sm:text-xs text-cyan-400 uppercase tracking-widest font-semibold">Future Prediction</span>
                              </div>
                              <p className="text-sm sm:text-base text-zinc-200">{player.prediction}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
          
          {/* Back Button */}
          <div className="flex justify-center mt-6 sm:mt-8">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 rounded-full bg-dark-card border border-white/10 hover:border-purple-500/50 transition-all text-sm sm:text-base"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </>
  );
}
