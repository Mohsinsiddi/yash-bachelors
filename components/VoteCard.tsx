'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Player } from '@/types';

interface VoteCardProps {
  player: Player;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export default function VoteCard({ player, isSelected, onSelect, disabled = false }: VoteCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`relative p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center transition-all duration-200 min-h-[90px] sm:min-h-[110px] ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-95'
      } ${
        isSelected
          ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-2 border-yellow-400 shadow-lg shadow-yellow-500/20'
          : 'bg-dark-card border-2 border-white/5 hover:border-purple-500/50 active:border-purple-500'
      }`}
    >
      {/* Checkmark */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center"
        >
          <Check size={12} className="text-black sm:w-4 sm:h-4" strokeWidth={3} />
        </motion.div>
      )}
      
      {/* Emoji */}
      <span className="text-3xl sm:text-4xl block mb-1 sm:mb-2">{player.emoji}</span>
      
      {/* Name */}
      <span className="font-semibold text-sm sm:text-base block truncate">{player.name}</span>
    </motion.button>
  );
}
