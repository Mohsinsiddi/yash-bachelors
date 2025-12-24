import mongoose, { Schema, Model } from 'mongoose';
import { Question } from '@/types';

const QuestionSchema = new Schema<Question>({
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

export const QuestionModel: Model<Question> = 
  mongoose.models.Question || mongoose.model<Question>('Question', QuestionSchema);
