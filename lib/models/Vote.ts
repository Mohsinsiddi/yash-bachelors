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
