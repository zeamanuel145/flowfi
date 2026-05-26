import mongoose, { Document, Schema } from 'mongoose';

export interface BudgetDocument extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'yearly';
  month: number;
  year: number;
  currency: string;
  alerts: boolean;
  alertThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<BudgetDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true, min: 0 },
    spent: { type: Number, default: 0, min: 0 },
    period: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    month: { type: Number, min: 1, max: 12, required: true },
    year: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    alerts: { type: Boolean, default: true },
    alertThreshold: { type: Number, default: 80, min: 1, max: 100 },
  },
  { timestamps: true }
);

BudgetSchema.index({ userId: 1, month: 1, year: 1, category: 1 }, { unique: true });

export default mongoose.models.Budget ||
  mongoose.model<BudgetDocument>('Budget', BudgetSchema);
