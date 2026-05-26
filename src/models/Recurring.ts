import mongoose, { Document, Schema } from 'mongoose';

export interface RecurringDocument extends Document {
  title: string;
  amount: number;
  category: string;
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDue: Date;
  walletId: mongoose.Types.ObjectId;
  isActive: boolean;
  currency: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringSchema = new Schema<RecurringDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true, maxlength: 100 },
    interval: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], required: true },
    nextDue: { type: Date, required: true },
    walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
    isActive: { type: Boolean, default: true },
    currency: { type: String, default: 'USD' },
    description: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

RecurringSchema.index({ walletId: 1 });

export default mongoose.models.Recurring || mongoose.model<RecurringDocument>('Recurring', RecurringSchema);
