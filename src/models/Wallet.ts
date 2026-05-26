import mongoose, { Document, Schema } from 'mongoose';

export interface WalletDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash';
  balance: number;
  currency: string;
  color: string;
  icon: string;
  isShared: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<WalletDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    type: {
      type: String,
      enum: ['checking', 'savings', 'credit', 'investment', 'cash'],
      required: true,
    },
    balance: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'USD' },
    color: { type: String, default: '#10b981' },
    icon: { type: String, default: '💳' },
    isShared: { type: Boolean, default: true },
    description: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

WalletSchema.index({ userId: 1 });

export default mongoose.models.Wallet ||
  mongoose.model<WalletDocument>('Wallet', WalletSchema);
