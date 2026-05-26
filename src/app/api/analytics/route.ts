import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/connect';
import Transaction from '@/models/Transaction';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CATEGORY_COLORS = [
  '#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#06b6d4',
  '#10b981', '#22c55e', '#84cc16', '#14b8a6', '#f43f5e', '#6366f1', '#a855f7',
  '#78716c', '#0ea5e9', '#059669', '#6b7280', '#22c55e', '#f97316',
];

function getCategoryColor(index: number) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const url = new URL(request.url);
  const year = Number(url.searchParams.get('year') || new Date().getFullYear());
  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const requestedMonthIndex = year === now.getFullYear() ? currentMonthIndex : 0;
  const startOfYear = new Date(year, 0, 1);
  const startOfNextYear = new Date(year + 1, 0, 1);
  const startOfPrevYear = new Date(year - 1, 0, 1);

  const transactions = await Transaction.find({
    userId: session.user.id,
    date: { $gte: startOfYear, $lt: startOfNextYear },
    type: { $in: ['income', 'expense'] },
  }).lean();

  const previousYearTransactions = await Transaction.find({
    userId: session.user.id,
    date: { $gte: startOfPrevYear, $lt: startOfYear },
    type: { $in: ['income', 'expense'] },
  }).lean();

  const monthlyTrend = MONTH_NAMES.map((month) => ({
    month,
    income: 0,
    expenses: 0,
    savings: 0,
  }));

  for (const tx of transactions) {
    const date = new Date(tx.date);
    const monthIndex = date.getMonth();
    if (tx.type === 'income') monthlyTrend[monthIndex].income += tx.amount;
    if (tx.type === 'expense') monthlyTrend[monthIndex].expenses += tx.amount;
  }
  monthlyTrend.forEach((row) => {
    row.savings = row.income - row.expenses;
  });

  const monthlyCategoryTotals: Record<string, number> = {};
  for (const tx of transactions) {
    const date = new Date(tx.date);
    if (date.getMonth() !== requestedMonthIndex) continue;
    if (tx.type !== 'expense') continue;
    monthlyCategoryTotals[tx.category] = (monthlyCategoryTotals[tx.category] || 0) + tx.amount;
  }

  const categoryBreakdown = Object.entries(monthlyCategoryTotals)
    .map(([category, amount], index) => ({
      category,
      amount,
      percentage: 0,
      color: getCategoryColor(index),
    }))
    .sort((a, b) => b.amount - a.amount);

  const totalCategoryAmount = categoryBreakdown.reduce((sum, entry) => sum + entry.amount, 0);
  categoryBreakdown.forEach((entry) => {
    entry.percentage = totalCategoryAmount > 0 ? Math.round((entry.amount / totalCategoryAmount) * 100) : 0;
  });

  const dailySpendingMap = new Map<string, number>();
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(now.getDate() - offset);
    const key = date.toLocaleDateString('en-US', { weekday: 'short' });
    dailySpendingMap.set(key, 0);
  }

  const weekAgo = new Date();
  weekAgo.setDate(now.getDate() - 6);

  const weeklyTransactions = await Transaction.find({
    userId: session.user.id,
    date: { $gte: new Date(weekAgo.setHours(0, 0, 0, 0)), $lte: new Date(now.setHours(23, 59, 59, 999)) },
    type: 'expense',
  }).lean();

  for (const tx of weeklyTransactions) {
    const date = new Date(tx.date);
    const key = date.toLocaleDateString('en-US', { weekday: 'short' });
    dailySpendingMap.set(key, (dailySpendingMap.get(key) || 0) + tx.amount);
  }

  const weeklySpending = Array.from(dailySpendingMap.entries()).map(([day, amount]) => ({ day, amount }));

  const previousYearTotals = Array.from({ length: 12 }, (_, idx) => ({ month: MONTH_NAMES[idx], current: 0, previous: 0 }));
  for (const tx of transactions) {
    const monthIndex = new Date(tx.date).getMonth();
    if (tx.type === 'expense') previousYearTotals[monthIndex].current += tx.amount;
    if (tx.type === 'income') previousYearTotals[monthIndex].current += 0;
  }
  for (const tx of previousYearTransactions) {
    const monthIndex = new Date(tx.date).getMonth();
    if (tx.type === 'expense') previousYearTotals[monthIndex].previous += tx.amount;
  }

  return NextResponse.json({
    monthlyTrend,
    categoryBreakdown,
    weeklySpending,
    yearlyComparison: previousYearTotals,
  });
}
