import mongoose, { Document, Schema } from 'mongoose';

export interface TransactionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  date: Date;
  walletId: mongoose.Types.ObjectId;
  note?: string;
  tags?: string[];
  isRecurring: boolean;
  recurrenceInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  receiptUrl?: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
    note: { type: String, trim: true, maxlength: 500 },
    tags: [{ type: String, trim: true }],
    isRecurring: { type: Boolean, default: false },
    recurrenceInterval: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
    receiptUrl: { type: String },
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, walletId: 1, date: -1 });
TransactionSchema.index({ userId: 1, category: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1, date: -1 });
TransactionSchema.index({ title: 'text', note: 'text' });

export default mongoose.models.Transaction ||
  mongoose.model<TransactionDocument>('Transaction', TransactionSchema);
