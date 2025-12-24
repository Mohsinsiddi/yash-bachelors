import mongoose, { Schema, Document } from 'mongoose';

export interface IGameConfig extends Document {
  title: string;
  subtitle: string;
  tagline: string;
  date: string;
  groomName: string;
  welcomeMessage: string;
  isGameActive: boolean;
  currentQuestion: number;
  roastsRevealed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GameConfigSchema = new Schema<IGameConfig>({
  title: { type: String, required: true },
  subtitle: { type: String },
  tagline: { type: String },
  date: { type: String },
  groomName: { type: String },
  welcomeMessage: { type: String },
  isGameActive: { type: Boolean, default: true },
  currentQuestion: { type: Number, default: 0 },
  roastsRevealed: { type: Boolean, default: false },
}, { timestamps: true });

export const GameConfigModel = mongoose.models.GameConfig || mongoose.model<IGameConfig>('GameConfig', GameConfigSchema);
