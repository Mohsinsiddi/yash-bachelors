import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/brutal-awards';

// ================================================================
// SCHEMAS
// ================================================================

const PlayerSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  emoji: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const QuestionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  question: { type: String, required: true },
  hint: { type: String, required: true },
  type: { type: String, enum: ['TWIST', 'DIRECT', 'BLIND', 'RANKING'], required: true },
  vibe: { type: String, required: true },
  order: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  mostVotes: {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    award: { type: String, required: true },
  },
  leastVotes: {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    award: { type: String, required: true },
  },
  collection: {
    loser: { type: String, required: true },
    winner: { type: String, required: true },
  },
  hiddenQuestion: { type: String },
  bonus: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const GameConfigSchema = new mongoose.Schema({
  title: { type: String, default: "YASH'S BACHELOR" },
  subtitle: { type: String, default: "Brutal Awards 2025" },
  tagline: { type: String, default: "Where friendships are tested & legends are made" },
  date: { type: String, default: "25th - 28th December 2025" },
  groomName: { type: String, default: "Yash" },
  welcomeMessage: { type: String, default: "Welcome to the most brutal game of the bachelor party! 🎉" },
  isGameActive: { type: Boolean, default: true },
  currentQuestion: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const GameSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, default: 'main' },
  currentQuestionId: { type: Number, required: true, default: 1 },
  currentQuestionIndex: { type: Number, required: true, default: 0 },
  questionStartedAt: { type: Date, required: true, default: Date.now },
  votingDurationSeconds: { type: Number, default: 180 },
  status: { 
    type: String, 
    enum: ['voting', 'revealing', 'results', 'completed'],
    default: 'voting'
  },
  twistRevealedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const VoteSchema = new mongoose.Schema({
  odcId: { type: String, required: true },
  questionId: { type: Number, required: true },
  voterId: { type: String, required: true },
  votedForId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

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

const gameSession = {
  sessionId: 'main',
  currentQuestionId: 1,
  currentQuestionIndex: 0,
  questionStartedAt: new Date(),
  votingDurationSeconds: 180, // 3 minutes
  status: 'voting',
};

// ================================================================
// SEED FUNCTION
// ================================================================

async function seed() {
  try {
    console.log('');
    console.log('🌱 BRUTAL AWARDS - DATABASE SEEDER');
    console.log('===================================');
    console.log('');
    
    console.log('🔌 Connecting to MongoDB...');
    console.log(`   URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('');

    // Get or create models
    const Player = mongoose.models.Player || mongoose.model('Player', PlayerSchema);
    const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
    const GameConfig = mongoose.models.GameConfig || mongoose.model('GameConfig', GameConfigSchema);
    const GameSession = mongoose.models.GameSession || mongoose.model('GameSession', GameSessionSchema);
    const Vote = mongoose.models.Vote || mongoose.model('Vote', VoteSchema);

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    const deletedPlayers = await Player.deleteMany({});
    const deletedQuestions = await Question.deleteMany({});
    const deletedConfig = await GameConfig.deleteMany({});
    const deletedSession = await GameSession.deleteMany({});
    const deletedVotes = await Vote.deleteMany({});
    
    console.log(`   - Players: ${deletedPlayers.deletedCount} deleted`);
    console.log(`   - Questions: ${deletedQuestions.deletedCount} deleted`);
    console.log(`   - Config: ${deletedConfig.deletedCount} deleted`);
    console.log(`   - Sessions: ${deletedSession.deletedCount} deleted`);
    console.log(`   - Votes: ${deletedVotes.deletedCount} deleted`);
    console.log('');

    // Insert players
    console.log('👥 Inserting players...');
    await Player.insertMany(players);
    console.log(`   ✅ ${players.length} players inserted`);
    players.forEach(p => console.log(`      - ${p.emoji} ${p.name}`));
    console.log('');

    // Insert questions
    console.log('❓ Inserting questions...');
    await Question.insertMany(questions);
    console.log(`   ✅ ${questions.length} questions inserted`);
    questions.forEach(q => console.log(`      - Q${q.order} [${q.type}] ${q.question.substring(0, 40)}...`));
    console.log('');

    // Insert game config
    console.log('⚙️  Inserting game config...');
    await GameConfig.create(gameConfig);
    console.log(`   ✅ Config created`);
    console.log(`      - Title: ${gameConfig.title}`);
    console.log(`      - Subtitle: ${gameConfig.subtitle}`);
    console.log(`      - Groom: ${gameConfig.groomName}`);
    console.log('');

    // Insert game session
    console.log('🎮 Inserting game session...');
    await GameSession.create(gameSession);
    console.log(`   ✅ Session created`);
    console.log(`      - Duration: ${gameSession.votingDurationSeconds} seconds`);
    console.log(`      - Status: ${gameSession.status}`);
    console.log('');

    console.log('===================================');
    console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
    console.log('===================================');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - Players: ${players.length}`);
    console.log(`   - Questions: ${questions.length}`);
    console.log(`   - Config: 1`);
    console.log(`   - Session: 1`);
    console.log(`   - Votes: 0 (fresh start)`);
    console.log('');
    console.log('🚀 Ready to play! Run: npm run dev');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ SEED FAILED!');
    console.error('================');
    console.error(error);
    console.error('');
    console.error('💡 Tips:');
    console.error('   - Check your MONGODB_URI in .env');
    console.error('   - Make sure MongoDB is running');
    console.error('   - Check network/firewall settings');
    console.error('');
    process.exit(1);
  }
}

seed();
