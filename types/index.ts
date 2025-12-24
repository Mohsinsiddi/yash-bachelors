export interface Player {
  _id?: string;
  id: number;
  name: string;
  emoji: string;
  isActive: boolean;
  createdAt?: Date;
}

export interface Question {
  _id?: string;
  id: number;
  question: string;
  hint: string;
  type: 'TWIST' | 'DIRECT' | 'BLIND' | 'RANKING';
  vibe: string;
  order: number;
  isActive: boolean;
  mostVotes: {
    title: string;
    subtitle: string;
    award: string;
  };
  leastVotes: {
    title: string;
    subtitle: string;
    award: string;
  };
  collection: {
    loser: string;
    winner: string;
  };
  hiddenQuestion?: string;
  bonus?: string;
  createdAt?: Date;
}

export interface Vote {
  _id?: string;
  odcId: string;
  questionId: number;
  voterId: string;
  votedForId: number;
  createdAt?: Date;
}

export interface GameConfig {
  _id?: string;
  title: string;
  subtitle: string;
  tagline: string;
  date: string;
  groomName: string;
  welcomeMessage: string;
  isGameActive: boolean;
  currentQuestion: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GameSession {
  _id?: string;
  sessionId: string;
  currentQuestionId: number;
  currentQuestionIndex: number;
  questionStartedAt: Date;
  votingDurationSeconds: number;
  status: 'voting' | 'revealing' | 'results' | 'completed';
  twistRevealedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlayerScore {
  playerId: number;
  name: string;
  emoji: string;
  bad: number;
  good: number;
  awards: string[];
}
