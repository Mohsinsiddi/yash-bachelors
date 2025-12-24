import mongoose, { Schema, Model } from 'mongoose';
import { GameConfig } from '@/types';

const GameConfigSchema = new Schema<GameConfig>({
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

export const GameConfigModel: Model<GameConfig> = 
  mongoose.models.GameConfig || mongoose.model<GameConfig>('GameConfig', GameConfigSchema);
