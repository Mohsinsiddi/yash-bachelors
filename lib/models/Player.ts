import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  id: number;
  name: string;
  emoji: string;
  isActive: boolean;
  roast?: string;
  dirtySecret?: string;
  prediction?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema<IPlayer>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  emoji: { type: String, default: '😀' },
  isActive: { type: Boolean, default: true },
  roast: { type: String },
  dirtySecret: { type: String },
  prediction: { type: String },
}, { timestamps: true });

export const PlayerModel = mongoose.models.Player || mongoose.model<IPlayer>('Player', PlayerSchema);
