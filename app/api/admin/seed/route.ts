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
