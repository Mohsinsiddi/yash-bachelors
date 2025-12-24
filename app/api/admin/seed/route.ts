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
// SEED DATA
// ================================================================

const players = [
  { id: 1, name: "Mohsin", emoji: "😎", isActive: true },
  { id: 2, name: "Ganesh", emoji: "🔥", isActive: true },
  { id: 3, name: "Amit", emoji: "💪", isActive: true },
  { id: 4, name: "JP", emoji: "🎯", isActive: true },
  { id: 5, name: "Akash", emoji: "⚡", isActive: true },
  { id: 6, name: "Toran", emoji: "🌟", isActive: true },
  { id: 7, name: "Anup", emoji: "🎭", isActive: true },
  { id: 8, name: "Sambit", emoji: "🚀", isActive: true },
  { id: 9, name: "Yash", emoji: "👑", isActive: true },
  { id: 10, name: "Bhalu", emoji: "🐻", isActive: true },
  { id: 11, name: "Vishal", emoji: "💎", isActive: true },
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
};

// ================================================================
// API HANDLERS
// ================================================================

// GET - Get seed data preview
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

// POST - Seed the database
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { password, clearFirst = true } = body;
    
    // Password protection
    const adminPassword = process.env.ADMIN_PASSWORD || 'yash2025';
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
    }
    
    const result: any = {
      cleared: {},
      seeded: {},
    };
    
    // Clear existing data if requested
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
    
    // Seed players
    await PlayerModel.insertMany(players);
    result.seeded.players = players.length;
    
    // Seed questions
    await QuestionModel.insertMany(questions);
    result.seeded.questions = questions.length;
    
    // Seed config
    await GameConfigModel.create(gameConfig);
    result.seeded.config = 1;
    
    // Seed session
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
