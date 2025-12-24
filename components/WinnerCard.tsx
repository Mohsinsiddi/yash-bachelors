'use client';

import { motion } from 'framer-motion';
import { Player, Question } from '@/types';

interface WinnerCardProps {
  player: Player;
  question: Question;
  votes: number;
  type: 'loser' | 'winner';
}

export default function WinnerCard({ player, question, votes, type }: WinnerCardProps) {
  const isLoser = type === 'loser';
  const data = isLoser ? question.mostVotes : question.leastVotes;
  const task = isLoser ? question.collection?.loser : question.collection?.winner;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card p-4 sm:p-6 text-center relative overflow-hidden ${
        isLoser 
          ? 'border-red-500/30' 
          : 'border-green-500/30'
      }`}
    >
      {/* Top Accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        isLoser ? 'bg-red-500' : 'bg-green-500'
      }`} />
      
      {/* Label */}
      <p className={`text-[10px] sm:text-xs uppercase tracking-widest mb-2 sm:mb-3 ${
        isLoser ? 'text-red-400' : 'text-green-400'
      }`}>
        {isLoser ? '💀 Most Votes' : '👑 Least Votes'}
      </p>
      
      {/* Emoji */}
      <span className="text-4xl sm:text-5xl block mb-2">{player.emoji}</span>
      
      {/* Name */}
      <h3 className={`font-display text-2xl sm:text-3xl mb-1 ${
        isLoser ? 'text-red-400' : 'text-green-400'
      }`}>
        {player.name}
      </h3>
      
      {/* Award Title */}
      <p className="text-sm sm:text-base font-semibold mb-0.5">{data?.title}</p>
      <p className="text-zinc-500 text-xs sm:text-sm mb-3">{data?.subtitle}</p>
      
      {/* Votes */}
      <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 bg-white/5 rounded-full text-xs sm:text-sm mb-3">
        {votes} vote{votes !== 1 ? 's' : ''}
      </span>
      
      {/* Task */}
      {task && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 sm:p-4 text-left">
          <h5 className="text-yellow-400 text-[10px] sm:text-xs uppercase tracking-widest mb-1 sm:mb-2">
            🎭 To Collect Award:
          </h5>
          <p className="text-xs sm:text-sm">{task}</p>
          {question.bonus && type === 'loser' && (
            <p className="text-xs sm:text-sm mt-2 font-semibold text-yellow-400">{question.bonus}</p>
          )}
        </div>
      )}
    </motion.div>
  );
}
