#!/bin/bash

# ================================================================
# 🔥 ROAST PROFILES - Hidden Dirty Quotes
# Run this inside your brutal-awards folder
# ================================================================

echo "🔥 Creating Roast Profiles..."
echo "=============================="

# ================================================================
# 1. UPDATE: Player Model - Add roast fields
# ================================================================
echo "1️⃣ Updating Player Model..."

cat > lib/models/Player.ts << 'EOF'
import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  id: number;
  name: string;
  emoji: string;
  isActive: boolean;
  roast?: string;
  dirtySecret?: string;
  prediction?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema<IPlayer>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  emoji: { type: String, default: '😀' },
  isActive: { type: Boolean, default: true },
  roast: { type: String },
  dirtySecret: { type: String },
  prediction: { type: String },
}, { timestamps: true });

export const PlayerModel = mongoose.models.Player || mongoose.model<IPlayer>('Player', PlayerSchema);
EOF

echo "   ✅ Player model updated"

# ================================================================
# 2. UPDATE: Seed API - Add roasts
# ================================================================
echo "2️⃣ Updating Seed API with roasts..."

cat > app/api/admin/seed/route.ts << 'EOF'
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { 
  PlayerModel, 
  QuestionModel, 
  VoteModel, 
  GameConfigModel, 
  GameSessionModel 
} from '@/lib/models';

// ================================================================
// SEED DATA WITH ROASTS
// ================================================================

const players = [
  { 
    id: 1, 
    name: "Mohsin", 
    emoji: "😎", 
    isActive: true,
    roast: "Claims to be a blockchain developer, but the only chain he's mastered is the one attached to his wallet... which is always empty. 💸",
    dirtySecret: "Once googled 'how to mass produce money' for 3 hours straight. FBI is still watching. 🕵️",
    prediction: "Will become a crypto billionaire... in Monopoly money. 🎲"
  },
  { 
    id: 2, 
    name: "Ganesh", 
    emoji: "🔥", 
    isActive: true,
    roast: "The only thing hotter than his name is his browser history. Incognito mode? More like 'Ganesh Mode'. 🔥",
    dirtySecret: "Has a secret folder named 'Tax Documents 2019' that has never seen a tax document. 📁",
    prediction: "Will marry his laptop. The wedding will be in private browsing. 💒"
  },
  { 
    id: 3, 
    name: "Amit", 
    emoji: "💪", 
    isActive: true,
    roast: "Gym bro who thinks protein shake is a personality trait. His muscles are big but his texts are always 'K'. 💪",
    dirtySecret: "Flexes in every reflective surface including spoons. Has been caught kissing his biceps. 😘",
    prediction: "Will open a gym where the only exercise is taking selfies. 🤳"
  },
  { 
    id: 4, 
    name: "JP", 
    emoji: "🎯", 
    isActive: true,
    roast: "JP stands for 'Just Pretending' to know what's going on. Nods confidently at everything. 🎯",
    dirtySecret: "Once said 'I love that song' to a ringtone. Has been faking music taste for 10 years. 🎵",
    prediction: "Will become a professional nodder. Companies will pay him to agree in meetings. 👔"
  },
  { 
    id: 5, 
    name: "Akash", 
    emoji: "⚡", 
    isActive: true,
    roast: "Named after the sky but his standards are underground. Would swipe right on a potato if it had a filter. ⚡",
    dirtySecret: "Has a Tinder gold subscription and still gets no matches. Blames the algorithm. 📱",
    prediction: "Will finally get a match... with his alternate account. Self-love is important! 💕"
  },
  { 
    id: 6, 
    name: "Toran", 
    emoji: "🌟", 
    isActive: true,
    roast: "The 'intellectual' of the group who quotes philosophers but can't cook Maggi without burning it. 🌟",
    dirtySecret: "Reads book summaries on YouTube and says 'I read this amazing book'. Hasn't finished a book since 2015. 📚",
    prediction: "Will start a podcast that only his mom listens to. She'll leave 5-star reviews. ⭐"
  },
  { 
    id: 7, 
    name: "Anup", 
    emoji: "🎭", 
    isActive: true,
    roast: "The drama king who treats every minor inconvenience like a Netflix original series. 🎭",
    dirtySecret: "Cried during a phone ad. Not even the sad part, just when they showed the price. 😢",
    prediction: "Will win an Oscar for 'Best Performance of Being Fine When Not Fine'. 🏆"
  },
  { 
    id: 8, 
    name: "Sambit", 
    emoji: "🚀", 
    isActive: true,
    roast: "Always talking about his 'startup ideas' but the only thing he's started is arguments. 🚀",
    dirtySecret: "Has 47 domain names registered and 0 working websites. Calls himself a 'serial entrepreneur'. 💼",
    prediction: "Will pivot his startup 15 times and end up selling samosas. The samosas will be successful. 🥟"
  },
  { 
    id: 9, 
    name: "Yash", 
    emoji: "👑", 
    isActive: true,
    roast: "The groom who's about to lose his freedom faster than he loses his hair. Marriage is just multiplayer suffering. 👑",
    dirtySecret: "Has already practiced saying 'Yes dear' 10,000 times. His wife doesn't know he's this prepared. 💍",
    prediction: "Will become the world champion of 'I was just about to do that!' 🏅"
  },
  { 
    id: 10, 
    name: "Bhalu", 
    emoji: "🐻", 
    isActive: true,
    roast: "Named Bhalu because he hibernates through every group plan. Legendary for the phrase 'Next time pakka'. 🐻",
    dirtySecret: "Has cancelled plans so many times that his friends now make fake plans just to get a real rejection. 🗓️",
    prediction: "Will write a bestseller: '101 Excuses to Not Show Up'. Chapter 1: 'Mummy ne mana kiya'. 📖"
  },
  { 
    id: 11, 
    name: "Vishal", 
    emoji: "💎", 
    isActive: true,
    roast: "The 'premium' friend who judges everyone's taste while wearing the same 3 shirts on rotation. 💎",
    dirtySecret: "Gives relationship advice but his last relationship was with a body pillow. It ended badly. 🛏️",
    prediction: "Will become a fashion influencer with 12 followers. 11 of them are his relatives. 👗"
  },
];

const questions = [
  {
    id: 1,
    question: "Who is the MOST HANDSOME in this group?",
    hint: "Vote for the guy who deserves the handsome crown. The face that makes others jealous!",
    type: "TWIST",
    vibe: "😊 Easy Start",
    order: 1,
    isActive: true,
    mostVotes: {
      title: "UGLIEST IN THE GROUP 💀",
      subtitle: "Your friends betrayed you",
      award: "Ugly Crown 👹"
    },
    leastVotes: {
      title: "ACTUALLY HANDSOME 👑",
      subtitle: "Nobody needed to hype you",
      award: "Handsome King 👑"
    },
    collection: {
      loser: "Winner wears ugly paper mask for next round",
      winner: "Winner gets imaginary crown"
    }
  },
  {
    id: 2,
    question: "Who has the BIGGEST BALLS (courage) here?",
    hint: "The fearless one. Does crazy shit. Never backs down. Real daredevil!",
    type: "TWIST",
    vibe: "😊 Safe",
    order: 2,
    isActive: true,
    mostVotes: {
      title: "BIGGEST PUSSY 🐱",
      subtitle: "All show, no real courage",
      award: "Pussy Award 🐱"
    },
    leastVotes: {
      title: "ACTUALLY BRAVE 🦁",
      subtitle: "Quiet strength, real balls",
      award: "Lion Heart 🦁"
    },
    collection: {
      loser: "Must MEOW like a cat 🐱 to accept",
      winner: "Does a LION ROAR 🦁"
    }
  },
  {
    id: 3,
    question: "Who would NEVER sell this group for ₹1 Lakh?",
    hint: "The most LOYAL friend. Brotherhood over money. Would take a bullet for the boys!",
    type: "TWIST",
    vibe: "🙂 Medium",
    order: 3,
    isActive: true,
    mostVotes: {
      title: "BIGGEST SNAKE 🐍",
      subtitle: "Acts loyal, would sell you first",
      award: "Snake Award 🐍"
    },
    leastVotes: {
      title: "ACTUALLY LOYAL 🤝",
      subtitle: "Real one, doesn't need to prove it",
      award: "Loyalty Badge 🛡️"
    },
    collection: {
      loser: "Must HISS like a snake 🐍 to accept",
      winner: "Gets a GROUP HUG 🤗"
    }
  },
  {
    id: 4,
    question: "Who has the BIGGEST DICK ENERGY here?",
    hint: "Walks in like he owns the room. Confidence overload. Alpha vibes!",
    type: "TWIST",
    vibe: "😏 Getting Spicy",
    order: 4,
    isActive: true,
    mostVotes: {
      title: "SMALLEST DICK 🤏",
      subtitle: "Overcompensating, trying too hard",
      award: "Pinky Trophy 🤏"
    },
    leastVotes: {
      title: "ACTUAL BDE 👑",
      subtitle: "Real ones stay silent",
      award: "BDE King 👑"
    },
    collection: {
      loser: "Shows PINKY FINGER 🤏 as trophy",
      winner: "Does a PROUD WALK 🚶‍♂️"
    }
  },
  {
    id: 5,
    question: "Who has the BEST sex life here?",
    hint: "Who's actually getting some? Doesn't need to brag because he's busy 😏",
    type: "TWIST",
    vibe: "🔥 Spicy",
    order: 5,
    isActive: true,
    mostVotes: {
      title: "MOST DISAPPOINTING SEX LIFE 💀",
      subtitle: "All talk, no action",
      award: "Virgin Vibes 🚫"
    },
    leastVotes: {
      title: "ACTUALLY GETTING SOME 😏",
      subtitle: "Silent players win",
      award: "Player Award 😏"
    },
    collection: {
      loser: "Must say 'I'M A VIRGIN' loudly",
      winner: "Just SMIRKS 😏"
    }
  },
  {
    id: 6,
    question: "Who has JERKED OFF the MOST in their lifetime?",
    hint: "Single the longest... or just can't control themselves 🍆",
    type: "DIRECT",
    vibe: "🔥 Wild",
    order: 6,
    isActive: true,
    mostVotes: {
      title: "CHAMPION HILA 🏆",
      subtitle: "Group certified legend",
      award: "Hila Trophy 🏆"
    },
    leastVotes: {
      title: "CONTROL KING 👑",
      subtitle: "Discipline or getting real action",
      award: "Self Control 🧘"
    },
    collection: {
      loser: "Gets a trophy hand gesture 🤜",
      winner: "Gets respect nod 🫡"
    }
  },
  {
    id: 7,
    question: "Who would PAY for a PROSTITUTE?",
    hint: "No game, no options, only wallet can help him 💸",
    type: "DIRECT",
    vibe: "🌶️ Very Wild",
    order: 7,
    isActive: true,
    mostVotes: {
      title: "DOWN BAD AWARD 💸",
      subtitle: "Group thinks you have zero game",
      award: "Down Bad 💸"
    },
    leastVotes: {
      title: "HAS OPTIONS 💪",
      subtitle: "Doesn't need to pay",
      award: "Player King 👑"
    },
    collection: {
      loser: "Throws FAKE MONEY in the air 💸",
      winner: "FLEXES 💪"
    }
  },
  {
    id: 8,
    question: "Who would SUCK DICK for ₹1 CRORE?",
    hint: "Money talks. Who throws dignity out the window for 1 Crore? 🍆💰",
    type: "DIRECT",
    vibe: "🌶️🌶️ Brutal",
    order: 8,
    isActive: true,
    mostVotes: {
      title: "WOULD DO IT 🍆",
      subtitle: "Money over dignity",
      award: "Money Slave 💰"
    },
    leastVotes: {
      title: "HAS DIGNITY 🎖️",
      subtitle: "Some things can't be bought",
      award: "Dignity Award 🎖️"
    },
    collection: {
      loser: "Must LICK A BANANA seductively 🍌",
      winner: "REJECTS fake money thrown at him"
    }
  },
  {
    id: 9,
    question: "👽 ALIENS ATTACK! Rank who to SAVE 1st to 11th",
    hint: "#1 = Save first (most important). #11 = Save last. Choose wisely, aliens are coming! 👽",
    type: "RANKING",
    vibe: "🌶️🌶️ Chaos",
    order: 9,
    isActive: true,
    mostVotes: {
      title: "SACRIFICE FIRST 💀👽",
      subtitle: "Group would let you die first",
      award: "Alien Food 👽"
    },
    leastVotes: {
      title: "MOST VALUABLE 👑",
      subtitle: "Protected till the end",
      award: "Protected One 🛡️"
    },
    collection: {
      loser: "Must do DYING ALIEN SOUND 💀👽",
      winner: "Gets CARRIED/LIFTED by the group 🙌"
    }
  },
  {
    id: 10,
    question: "🎰 BLIND VOTE: Pick ONE person. No questions.",
    hint: "Trust your gut. Don't think. Just pick ONE name. Question revealed AFTER voting!",
    type: "BLIND",
    vibe: "🌶️🌶️🌶️ FINALE",
    order: 10,
    isActive: true,
    hiddenQuestion: "Who has the WEIRDEST MOANING sound? 😩",
    mostVotes: {
      title: "WEIRDEST MOANER 😩",
      subtitle: "Sounds like a dying animal",
      award: "Weird Moan 😩"
    },
    leastVotes: {
      title: "NORMAL SOUNDS 👌",
      subtitle: "Acceptable moaner",
      award: "Normal Moan 👌"
    },
    collection: {
      loser: "MUST demonstrate WEIRD MOAN loudly 🎤😩",
      winner: "MUST demonstrate 'NORMAL' MOAN 🎤"
    },
    bonus: "📹 RECORD BOTH ON VIDEO for memories!"
  }
];

const gameConfig = {
  title: "YASH'S BACHELOR",
  subtitle: "Brutal Awards 2025",
  tagline: "Where friendships are tested & legends are made",
  date: "25th - 28th December 2025",
  groomName: "Yash",
  welcomeMessage: "Welcome to the most brutal game of the bachelor party! Vote wisely, because every vote counts... and twists await! 🎉",
  isGameActive: true,
  currentQuestion: 0,
  roastsRevealed: false,
};

// ================================================================
// API HANDLERS
// ================================================================

export async function GET() {
  return NextResponse.json({
    preview: {
      players: players.length,
      questions: questions.length,
      config: gameConfig.title,
    },
    data: {
      players,
      questions,
      gameConfig,
    }
  });
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { password, clearFirst = true } = body;
    
    const adminPassword = process.env.ADMIN_PASSWORD || 'yash2025';
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
    }
    
    const result: any = {
      cleared: {},
      seeded: {},
    };
    
    if (clearFirst) {
      const [p, q, v, c, s] = await Promise.all([
        PlayerModel.deleteMany({}),
        QuestionModel.deleteMany({}),
        VoteModel.deleteMany({}),
        GameConfigModel.deleteMany({}),
        GameSessionModel.deleteMany({}),
      ]);
      
      result.cleared = {
        players: p.deletedCount,
        questions: q.deletedCount,
        votes: v.deletedCount,
        config: c.deletedCount,
        sessions: s.deletedCount,
      };
    }
    
    await PlayerModel.insertMany(players);
    result.seeded.players = players.length;
    
    await QuestionModel.insertMany(questions);
    result.seeded.questions = questions.length;
    
    await GameConfigModel.create(gameConfig);
    result.seeded.config = 1;
    
    await GameSessionModel.create({
      sessionId: 'main',
      currentQuestionId: 1,
      currentQuestionIndex: 0,
      questionStartedAt: new Date(),
      votingDurationSeconds: 180,
      status: 'voting',
    });
    result.seeded.session = 1;
    
    return NextResponse.json({
      success: true,
      message: '🌱 Database seeded successfully!',
      ...result,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
EOF

echo "   ✅ Seed API updated with roasts"

# ================================================================
# 3. CREATE: Roasts API
# ================================================================
echo "3️⃣ Creating Roasts API..."

mkdir -p app/api/roasts

cat > app/api/roasts/route.ts << 'EOF'
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { PlayerModel, GameConfigModel } from '@/lib/models';

// GET - Get roast status (without revealing content)
export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const reveal = searchParams.get('reveal') === 'true';
    const playerId = searchParams.get('playerId');
    
    const config = await GameConfigModel.findOne();
    const isGlobalReveal = config?.roastsRevealed || false;
    
    const players = await PlayerModel.find({ isActive: true }).sort({ id: 1 });
    
    const roastData = players.map(p => ({
      id: p.id,
      name: p.name,
      emoji: p.emoji,
      // Only reveal if global reveal OR specific player requested with reveal=true
      roast: (isGlobalReveal || (reveal && playerId === String(p.id))) ? p.roast : null,
      dirtySecret: (isGlobalReveal || (reveal && playerId === String(p.id))) ? p.dirtySecret : null,
      prediction: (isGlobalReveal || (reveal && playerId === String(p.id))) ? p.prediction : null,
      isRevealed: isGlobalReveal,
    }));
    
    return NextResponse.json({
      players: roastData,
      globalReveal: isGlobalReveal,
    });
  } catch (error) {
    console.error('Roasts fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch roasts' }, { status: 500 });
  }
}

// POST - Reveal roasts (admin only)
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { password, action, playerId } = body;
    
    const adminPassword = process.env.ADMIN_PASSWORD || 'yash2025';
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    
    if (action === 'reveal_all') {
      await GameConfigModel.updateOne({}, { $set: { roastsRevealed: true } });
      return NextResponse.json({ success: true, message: '🔥 All roasts revealed!' });
    }
    
    if (action === 'hide_all') {
      await GameConfigModel.updateOne({}, { $set: { roastsRevealed: false } });
      return NextResponse.json({ success: true, message: '🙈 All roasts hidden!' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Roasts action error:', error);
    return NextResponse.json({ error: 'Failed to update roasts' }, { status: 500 });
  }
}
EOF

echo "   ✅ Roasts API created"

# ================================================================
# 4. CREATE: Roasts Page
# ================================================================
echo "4️⃣ Creating Roasts page..."

mkdir -p app/roasts

cat > app/roasts/page.tsx << 'EOF'
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
EOF

echo "   ✅ Roasts page created"

# ================================================================
# 5. UPDATE: GameConfig Model
# ================================================================
echo "5️⃣ Updating GameConfig model..."

cat > lib/models/GameConfig.ts << 'EOF'
import mongoose, { Schema, Document } from 'mongoose';

export interface IGameConfig extends Document {
  title: string;
  subtitle: string;
  tagline: string;
  date: string;
  groomName: string;
  welcomeMessage: string;
  isGameActive: boolean;
  currentQuestion: number;
  roastsRevealed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GameConfigSchema = new Schema<IGameConfig>({
  title: { type: String, required: true },
  subtitle: { type: String },
  tagline: { type: String },
  date: { type: String },
  groomName: { type: String },
  welcomeMessage: { type: String },
  isGameActive: { type: Boolean, default: true },
  currentQuestion: { type: Number, default: 0 },
  roastsRevealed: { type: Boolean, default: false },
}, { timestamps: true });

export const GameConfigModel = mongoose.models.GameConfig || mongoose.model<IGameConfig>('GameConfig', GameConfigSchema);
EOF

echo "   ✅ GameConfig model updated"

# ================================================================
# 6. UPDATE: Admin - Add Roast Controls
# ================================================================
echo "6️⃣ Adding roast controls to admin..."

# We'll add a simple section to the database tab in admin
# The full admin update is complex, so we'll create a simple roast control component

cat > app/api/admin/roasts/route.ts << 'EOF'
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { GameConfigModel } from '@/lib/models';

// GET - Get roast status
export async function GET() {
  try {
    await dbConnect();
    const config = await GameConfigModel.findOne();
    return NextResponse.json({
      roastsRevealed: config?.roastsRevealed || false,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST - Toggle roast reveal
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { password, reveal } = body;
    
    if (password !== (process.env.ADMIN_PASSWORD || 'yash2025')) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    
    await GameConfigModel.updateOne({}, { $set: { roastsRevealed: reveal } });
    
    return NextResponse.json({
      success: true,
      roastsRevealed: reveal,
      message: reveal ? '🔥 All roasts revealed!' : '🙈 All roasts hidden!',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
EOF

echo "   ✅ Admin roasts API created"

# ================================================================
# 7. UPDATE: Header - Add Roasts link to menu
# ================================================================
echo "7️⃣ Updating Header with Roasts link..."

cat > components/Header.tsx << 'EOF'
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Gamepad2 } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ title = "YASH'S BACHELOR", subtitle = "Brutal Awards 2025" }: HeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const showPlayButton = pathname !== '/game';
  
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 safe-area-top">
        <div className="glass border-b border-white/5">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-lg shadow-lg flex-shrink-0">
                👑
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display text-base sm:text-lg gradient-text leading-none">{title}</h1>
                <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider">{subtitle}</p>
              </div>
            </Link>
            
            {/* Desktop Navigation - Centered */}
            <nav className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 -translate-x-1/2">
              {[
                { href: '/', label: 'Home' },
                { href: '/game', label: 'Play' },
                { href: '/leaderboard', label: 'Leaderboard' },
                { href: '/roasts', label: '🔥 Roasts' },
              ].map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`text-sm font-medium transition-colors py-2 ${
                    pathname === item.href 
                      ? 'text-yellow-400' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            {/* Right Side */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {showPlayButton && (
                <Link 
                  href="/game"
                  className="hidden md:flex btn-gold px-4 py-2 rounded-full text-sm font-semibold items-center gap-2"
                >
                  <Gamepad2 size={16} />
                  Play Now
                </Link>
              )}
              
              {showPlayButton && (
                <Link 
                  href="/game"
                  className="md:hidden w-9 h-9 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black"
                >
                  <Gamepad2 size={18} />
                </Link>
              )}
              
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <nav className="absolute top-16 right-3 left-3 bg-dark-card border border-white/10 rounded-2xl p-3 space-y-1 shadow-2xl">
            {[
              { href: '/', label: '🏠 Home', desc: 'Back to start' },
              { href: '/game', label: '🎮 Play Game', desc: 'Vote now' },
              { href: '/leaderboard', label: '📊 Leaderboard', desc: 'See all results' },
              { href: '/roasts', label: '🔥 Roasts', desc: 'Dirty secrets revealed' },
              { href: '/clear', label: '🧹 Reset My Votes', desc: 'Start fresh' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  pathname === item.href 
                    ? 'bg-yellow-500/20 text-yellow-400' 
                    : 'text-zinc-300 hover:bg-white/5 active:bg-white/10'
                }`}
              >
                <span className="text-xl">{item.label.split(' ')[0]}</span>
                <div>
                  <p className="font-medium text-sm">{item.label.split(' ').slice(1).join(' ')}</p>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
EOF

echo "   ✅ Header updated with Roasts link"

# ================================================================
# 8. UPDATE: Bottom Nav - Add Roasts
# ================================================================
echo "8️⃣ Updating Bottom Nav..."

cat > components/BottomNav.tsx << 'EOF'
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, BarChart3, Flame } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/game', icon: Gamepad2, label: 'Play' },
    { href: '/leaderboard', icon: BarChart3, label: 'Board' },
    { href: '/roasts', icon: Flame, label: 'Roasts' },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom">
      <div className="glass border-t border-white/5">
        <div className="flex items-center justify-around py-1.5 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[60px] ${
                  isActive 
                    ? item.href === '/roasts' ? 'text-red-400' : 'text-yellow-400'
                    : 'text-zinc-500 active:text-white'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
EOF

echo "   ✅ Bottom nav updated"

# ================================================================
# 9. CLEAR CACHE
# ================================================================
echo "9️⃣ Clearing cache..."

rm -rf .next

echo "   ✅ Cache cleared"

# ================================================================
# DONE
# ================================================================
echo ""
echo "=============================="
echo "✅ Roast Profiles Created!"
echo "=============================="
echo ""
echo "🔥 New Features:"
echo ""
echo "   📍 /roasts - Roast Profiles page"
echo "   📍 /api/roasts - Roasts API"
echo "   📍 /api/admin/roasts - Admin control"
echo ""
echo "   Each player has:"
echo "   • 🔥 The Roast - Brutal truth"
echo "   • 💀 Dirty Secret - Embarrassing fact"
echo "   • ⭐ Future Prediction - Where they'll end up"
echo ""
echo "   Hidden by default!"
echo "   • Users tap to reveal individual profiles"
echo "   • Admin can reveal ALL at once"
echo ""
echo "⚠️  IMPORTANT: Run seed again to add roasts!"
echo "   Go to /admin > DB tab > 🌱 Seed Default Data"
echo ""
echo "Now run: npm run dev"
echo ""