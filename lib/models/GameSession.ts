import mongoose, { Schema, Model } from 'mongoose';
import { GameSession } from '@/types';

const GameSessionSchema = new Schema<GameSession>({
  sessionId: { type: String, required: true, unique: true, default: 'main' },
  currentQuestionId: { type: Number, required: true, default: 1 },
  currentQuestionIndex: { type: Number, required: true, default: 0 },
  questionStartedAt: { type: Date, required: true, default: Date.now },
  votingDurationSeconds: { type: Number, default: 180 }, // 3 minutes
  status: { 
    type: String, 
    enum: ['voting', 'revealing', 'results', 'completed'],
    default: 'voting'
  },
  twistRevealedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const GameSessionModel: Model<GameSession> = 
  mongoose.models.GameSession || mongoose.model<GameSession>('GameSession', GameSessionSchema);
