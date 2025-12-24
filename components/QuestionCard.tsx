'use client';

import { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
}

export default function QuestionCard({ question, currentIndex, totalQuestions }: QuestionCardProps) {
  const typeColors: Record<string, string> = {
    TWIST: 'bg-red-500/20 text-red-400 border-red-500/30',
    DIRECT: 'bg-green-500/20 text-green-400 border-green-500/30',
    BLIND: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    RANKING: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  return (
    <div className="card p-4 sm:p-6 relative overflow-hidden">
      {/* Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600" />
      
      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        <span className="font-display text-zinc-500 text-xs sm:text-sm">
          Q{currentIndex + 1}/{totalQuestions}
        </span>
        <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-purple-500/15 border border-purple-500/30 rounded-full text-[10px] sm:text-xs text-purple-300">
          {question.vibe}
        </span>
        <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border ${typeColors[question.type]}`}>
          {question.type}
        </span>
      </div>
      
      {/* Question */}
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold leading-snug mb-3 sm:mb-4">
        {question.question}
      </h2>
      
      {/* Hint */}
      <div className="flex gap-2 sm:gap-3 p-3 sm:p-4 bg-yellow-500/5 border-l-4 border-yellow-400 rounded-r-xl">
        <span className="text-base sm:text-lg flex-shrink-0">💡</span>
        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
          {question.hint}
        </p>
      </div>
    </div>
  );
}
