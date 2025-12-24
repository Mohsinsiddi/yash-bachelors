import mongoose, { Schema, Model } from 'mongoose';
import { Vote } from '@/types';

const VoteSchema = new Schema<Vote>({
  odcId: { type: String, required: true },
  questionId: { type: Number, required: true },
  voterId: { type: String, required: true },
  votedForId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Unique vote per voter per question (not per session!)
// This ensures each person can only vote once per question
VoteSchema.index({ questionId: 1, voterId: 1 }, { unique: true });

// Additional indexes for faster queries
VoteSchema.index({ questionId: 1 });
VoteSchema.index({ odcId: 1 });

export const VoteModel: Model<Vote> = 
  mongoose.models.Vote || mongoose.model<Vote>('Vote', VoteSchema);
