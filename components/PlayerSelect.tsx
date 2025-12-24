'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';
import { Player } from '@/types';

interface PlayerSelectProps {
  players: Player[];
  onSelect: (player: Player) => void;
  onCancel?: () => void;
}

export default function PlayerSelect({ players, onSelect, onCancel }: PlayerSelectProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (selectedPlayer) {
      onSelect(selectedPlayer);
    }
  };

  const handleBack = () => {
    setStep('select');
    setSelectedPlayer(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg bg-dark-card border border-white/10 rounded-2xl overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {step === 'select' ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">👋</div>
                <h2 className="font-display text-2xl gradient-text mb-2">Who Are You?</h2>
                <p className="text-zinc-400 text-sm">Select your name to start voting</p>
              </div>
              
              {/* Player Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto p-1">
                {players.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handlePlayerClick(player)}
                    className="p-4 rounded-xl bg-dark-elevated hover:bg-purple-500/20 border-2 border-transparent hover:border-purple-500/50 transition-all text-center"
                  >
                    <span className="text-3xl block mb-2">{player.emoji}</span>
                    <span className="font-medium text-sm">{player.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6"
            >
              {/* Confirmation */}
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-5xl">{selectedPlayer?.emoji}</span>
                </div>
                
                <h2 className="font-display text-2xl mb-2">You are</h2>
                <p className="font-display text-3xl gradient-text mb-6">{selectedPlayer?.name}?</p>
                
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-left">
                      <p className="text-yellow-400 font-medium text-sm mb-1">Important!</p>
                      <p className="text-yellow-300/70 text-xs">
                        Your votes will be tracked under this name. 
                        Make sure you select YOUR name, not someone else's!
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleBack}
                    className="flex-1 px-6 py-3 rounded-xl bg-dark-elevated hover:bg-white/10 transition-colors text-zinc-300"
                  >
                    ← Go Back
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    Yes, That's Me!
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
