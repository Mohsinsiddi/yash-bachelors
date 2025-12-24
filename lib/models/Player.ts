import mongoose, { Schema, Model } from 'mongoose';
import { Player } from '@/types';

const PlayerSchema = new Schema<Player>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  emoji: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const PlayerModel: Model<Player> = 
  mongoose.models.Player || mongoose.model<Player>('Player', PlayerSchema);
