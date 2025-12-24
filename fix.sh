#!/bin/bash

# ================================================================
# 👤 PLAYER REGISTRATION - Select Name Before Voting
# Run this inside your brutal-awards folder
# ================================================================

echo "👤 Adding Player Registration..."
echo "================================="

# ================================================================
# 1. CREATE: Player Selection Component
# ================================================================
echo "1️⃣ Creating Player Selection component..."

cat > components/PlayerSelect.tsx << 'EOF'
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
EOF

echo "   ✅ PlayerSelect component created"

# ================================================================
# 2. UPDATE: Vote Model - Track voter as player ID
# ================================================================
echo "2️⃣ Updating Vote model..."

cat > lib/models/Vote.ts << 'EOF'
import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
  odcId: string;
  questionId: number;
  
  // Voter identification
  
  voterId: number;         // Player ID of the voter
  voterName: string;       // Player name (for easy queries)
  
  // Vote target
  votedForId: number;      // Player ID they voted for
  votedForName: string;    // Player name (for easy queries)
  
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema = new Schema<IVote>({
  odcId: { type: String, default: '' },
  questionId: { type: Number, required: true },
  
  voterId: { type: Number, required: true },
  voterName: { type: String, required: true },
  
  votedForId: { type: Number, required: true },
  votedForName: { type: String, default: '' },
}, { timestamps: true });

// Unique constraint: one vote per voter per question
VoteSchema.index({ voterId: 1, questionId: 1 }, { unique: true });

export const VoteModel = mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);
EOF

echo "   ✅ Vote model updated"

# ================================================================
# 3. UPDATE: Votes API
# ================================================================
echo "3️⃣ Updating Votes API..."

cat > app/api/votes/route.ts << 'EOF'
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { VoteModel, PlayerModel } from '@/lib/models';

// GET votes
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');
    const voterId = searchParams.get('voterId');
    const detailed = searchParams.get('detailed') === 'true';
    
    const query: any = {};
    if (questionId) query.questionId = parseInt(questionId);
    if (voterId) query.voterId = parseInt(voterId);
    
    const votes = await VoteModel.find(query).sort({ createdAt: -1 });
    
    // Calculate vote counts per player
    const voteCount: Record<number, number> = {};
    votes.forEach(vote => {
      voteCount[vote.votedForId] = (voteCount[vote.votedForId] || 0) + 1;
    });
    
    // If detailed, include who voted for whom
    let voteDetails: any[] = [];
    if (detailed) {
      voteDetails = votes.map(v => ({
        voter: { id: v.voterId, name: v.voterName },
        votedFor: { id: v.votedForId, name: v.votedForName },
        questionId: v.questionId,
        time: v.createdAt,
      }));
    }
    
    return NextResponse.json({ 
      votes: detailed ? voteDetails : votes,
      voteCount,
      total: votes.length 
    });
  } catch (error) {
    console.error('Failed to fetch votes:', error);
    return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
  }
}

// POST - Create or update vote
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { questionId, voterId, voterName, votedForId } = body;
    
    if (!questionId || !voterId || !voterName || !votedForId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get voted-for player name
    const votedForPlayer = await PlayerModel.findOne({ id: votedForId });
    const votedForName = votedForPlayer?.name || '';
    
    // Upsert - update if exists, create if not
    const vote = await VoteModel.findOneAndUpdate(
      { voterId, questionId },
      { 
        questionId, 
        voterId, 
        voterName,
        votedForId, 
        votedForName,
        odcId: `vote_${voterId}_${questionId}_${Date.now()}`
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ success: true, vote });
  } catch (error) {
    console.error('Failed to save vote:', error);
    return NextResponse.json({ error: 'Failed to save vote' }, { status: 500 });
  }
}

// DELETE - Remove vote(s)
export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    const questionId = searchParams.get('questionId');
    const voterId = searchParams.get('voterId');
    const all = searchParams.get('all');
    
    let result;
    
    // Delete specific vote by voter + question
    if (voterId && questionId) {
      result = await VoteModel.deleteOne({ 
        voterId: parseInt(voterId), 
        questionId: parseInt(questionId) 
      });
      return NextResponse.json({ 
        success: true, 
        deleted: result.deletedCount,
        message: 'Your vote has been removed'
      });
    }
    
    // Delete all votes for a question (admin)
    if (questionId && !voterId) {
      result = await VoteModel.deleteMany({ questionId: parseInt(questionId) });
      return NextResponse.json({ success: true, deleted: result.deletedCount });
    }
    
    // Delete all votes (admin)
    if (all === 'true') {
      result = await VoteModel.deleteMany({});
      return NextResponse.json({ success: true, deleted: result.deletedCount });
    }
    
    return NextResponse.json({ error: 'No delete criteria provided' }, { status: 400 });
  } catch (error) {
    console.error('Failed to delete vote:', error);
    return NextResponse.json({ error: 'Failed to delete vote' }, { status: 500 });
  }
}
EOF

echo "   ✅ Votes API updated"

# ================================================================
# 4. UPDATE: Vote Status API
# ================================================================
echo "4️⃣ Updating Vote Status API..."

mkdir -p app/api/votes/status

cat > app/api/votes/status/route.ts << 'EOF'
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { VoteModel } from '@/lib/models';

// GET - Check which questions a player has voted on
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const voterId = searchParams.get('voterId');
    
    if (!voterId) {
      return NextResponse.json({ error: 'voterId required' }, { status: 400 });
    }
    
    // Get all votes by this voter (player)
    const votes = await VoteModel.find({ voterId: parseInt(voterId) });
    
    // Build a map of questionId -> votedForId
    const votedQuestions: Record<number, number> = {};
    votes.forEach(vote => {
      votedQuestions[vote.questionId] = vote.votedForId;
    });
    
    return NextResponse.json({
      voterId: parseInt(voterId),
      votedQuestions,
      totalVotes: votes.length,
    });
  } catch (error) {
    console.error('Vote status error:', error);
    return NextResponse.json({ error: 'Failed to fetch vote status' }, { status: 500 });
  }
}
EOF

echo "   ✅ Vote Status API updated"

# ================================================================
# 5. UPDATE: Game Page - Use Player Registration
# ================================================================
echo "5️⃣ Updating Game page..."

cat > app/game/page.tsx << 'EOF'
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import QuestionCard from '@/components/QuestionCard';
import VoteCard from '@/components/VoteCard';
import PlayerSelect from '@/components/PlayerSelect';
import Loading from '@/components/Loading';
import { Player, Question, GameSession } from '@/types';
import { RotateCcw, User, LogOut } from 'lucide-react';

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
      setSession(data);
      setTimeLeft(data.remainingSeconds || 0);
      return data;
    } catch (error) {
      console.error('Failed to fetch session:', error);
      return null;
    }
  }, []);

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
        await fetchSession();
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [fetchSession]);

  // Fetch vote status when player is set
  useEffect(() => {
    if (currentPlayer) {
      fetchVoteStatus(currentPlayer.id);
    }
  }, [currentPlayer, fetchVoteStatus]);

  // Refresh session periodically
  useEffect(() => {
    const interval = setInterval(fetchSession, 5000);
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
    if (session && timeLeft === 0 && session.status === 'voting') {
      const timeout = setTimeout(() => {
        router.push(`/results?q=${session.currentQuestionIndex}`);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [timeLeft, session, router]);

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
EOF

echo "   ✅ Game page updated"

# ================================================================
# 6. CREATE: Vote Tracking API (Admin - Who voted for whom)
# ================================================================
echo "6️⃣ Creating Vote Tracking API..."

mkdir -p app/api/admin/vote-tracking

cat > app/api/admin/vote-tracking/route.ts << 'EOF'
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { VoteModel, QuestionModel, PlayerModel } from '@/lib/models';

// GET - Get detailed vote tracking (who voted for whom)
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');
    
    const query: any = {};
    if (questionId) query.questionId = parseInt(questionId);
    
    const [votes, questions, players] = await Promise.all([
      VoteModel.find(query).sort({ questionId: 1, createdAt: 1 }),
      QuestionModel.find({ isActive: true }).sort({ order: 1 }),
      PlayerModel.find({ isActive: true }).sort({ id: 1 }),
    ]);
    
    // Group votes by question
    const votesByQuestion: Record<number, any[]> = {};
    
    votes.forEach(vote => {
      if (!votesByQuestion[vote.questionId]) {
        votesByQuestion[vote.questionId] = [];
      }
      votesByQuestion[vote.questionId].push({
        voter: {
          id: vote.voterId,
          name: vote.voterName,
        },
        votedFor: {
          id: vote.votedForId,
          name: vote.votedForName,
        },
        time: vote.createdAt,
      });
    });
    
    // Build response with question details
    const result = questions.map(q => ({
      questionId: q.id,
      question: q.question,
      type: q.type,
      order: q.order,
      totalVotes: votesByQuestion[q.id]?.length || 0,
      votes: votesByQuestion[q.id] || [],
    }));
    
    return NextResponse.json({
      questions: result,
      players: players.map(p => ({ id: p.id, name: p.name, emoji: p.emoji })),
      totalVotes: votes.length,
    });
  } catch (error) {
    console.error('Vote tracking error:', error);
    return NextResponse.json({ error: 'Failed to fetch vote tracking' }, { status: 500 });
  }
}
EOF

echo "   ✅ Vote Tracking API created"

# ================================================================
# 7. UPDATE: Clear Page - Remove old localStorage cleanup
# ================================================================
echo "7️⃣ Updating Clear page..."

cat > app/clear/page.tsx << 'EOF'
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearPage() {
  const router = useRouter();
  const [cleared, setCleared] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [playerName, setPlayerName] = useState<string | null>(null);

  useEffect(() => {
    // Get current player name before clearing
    const name = localStorage.getItem('currentPlayerName');
    setPlayerName(name);
    
    // Clear player registration (this is the only localStorage we use now)
    localStorage.removeItem('currentPlayerId');
    localStorage.removeItem('currentPlayerName');
    localStorage.removeItem('currentPlayerEmoji');
    
    // Also clear any legacy data
    localStorage.removeItem('votedQuestions');
    localStorage.removeItem('voterId');
    localStorage.removeItem('odcId');
    localStorage.removeItem('currentQuestion');
    localStorage.removeItem('playerScores');
    
    setCleared(true);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/game');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0A0F]">
      <div className="text-center">
        {cleared ? (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-400 mb-2">Session Cleared!</h1>
            {playerName && (
              <p className="text-zinc-400 mb-2">Goodbye, {playerName}!</p>
            )}
            <p className="text-zinc-500 mb-4">You can now register as a different player.</p>
            <p className="text-zinc-600">Redirecting in {countdown}...</p>
            <button 
              onClick={() => router.push('/game')}
              className="mt-4 px-6 py-3 bg-yellow-500 text-black rounded-full font-semibold"
            >
              Register Now →
            </button>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4 animate-spin">🧹</div>
            <h1 className="text-2xl font-bold text-white">Clearing session...</h1>
          </>
        )}
      </div>
    </div>
  );
}
EOF

echo "   ✅ Clear page updated"

# ================================================================
# 8. CLEAR CACHE
# ================================================================
echo "8️⃣ Clearing cache..."

rm -rf .next

echo "   ✅ Cache cleared"

# ================================================================
# DONE
# ================================================================
echo ""
echo "================================="
echo "✅ Player Registration Added!"
echo "================================="
echo ""
echo "👤 New Flow:"
echo ""
echo "   1. User opens /game"
echo "   2. Popup: 'Who Are You?'"
echo "   3. User selects name from list"
echo "   4. Confirmation: 'You are Mohsin?'"
echo "   5. Double confirm: 'Yes, That's Me!'"
echo "   6. User can now vote"
echo ""
echo "📊 Vote Tracking:"
echo ""
echo "   • Each vote stores:"
echo "     - voterId (player ID)"
echo "     - voterName (player name)"
echo "     - votedForId (target player ID)"
echo "     - votedForName (target name)"
echo ""
echo "   • Admin can see who voted for whom:"
echo "     GET /api/admin/vote-tracking"
echo ""
echo "🔒 localStorage Now Only Stores:"
echo "   - currentPlayerId"
echo "   - currentPlayerName"
echo "   - currentPlayerEmoji"
echo "   - adminAuth (for admin login)"
echo ""
echo "⚠️  IMPORTANT: Run seed to update Vote model!"
echo "   /admin > DB > 🌱 Seed Default Data"
echo ""
echo "Now run: npm run dev"
echo ""