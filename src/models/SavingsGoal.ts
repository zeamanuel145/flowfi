import mongoose, { Document, Schema } from 'mongoose';

export interface SavingsGoalDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  currency: string;
  color: string;
  icon: string;
  description?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SavingsGoalSchema = new Schema<SavingsGoalDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    targetAmount: { type: Number, required: true, min: 0 },
    currentAmount: { type: Number, default: 0, min: 0 },
    deadline: { type: Date },
    currency: { type: String, default: 'USD' },
    color: { type: String, default: '#10b981' },
    icon: { type: String, default: '🎯' },
    description: { type: String, trim: true, maxlength: 300 },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SavingsGoalSchema.index({ userId: 1 });

export default mongoose.models.SavingsGoal ||
  mongoose.model<SavingsGoalDocument>('SavingsGoal', SavingsGoalSchema);
