import connectDB from '@/lib/db/connect';
import Transaction from '@/models/Transaction';
import Wallet from '@/models/Wallet';
import Budget from '@/models/Budget';
import SavingsGoal from '@/models/SavingsGoal';
import User from '@/models/User';

const EXPENSE_CATS = [
  'Food & Dining','Transport','Bills & Utilities','Shopping',
  'Entertainment','Health & Medical','Subscriptions','Personal Care',
  'Home & Garden','Sports & Fitness',
];

function randomBetween(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export async function seedDatabase(currentUserId?: string) {
  await connectDB();
  console.log('🌱 Seeding database...');

  let userId = currentUserId?.trim() || undefined;
  if (userId) {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      console.warn(`Authenticated user not found while seeding: ${userId}. Falling back to demo seed.`);
      userId = undefined;
    } else {
      await Promise.all([
        Transaction.deleteMany({ userId }),
        Wallet.deleteMany({ userId }),
        Budget.deleteMany({ userId }),
        SavingsGoal.deleteMany({ userId }),
      ]);
    }
  }

  if (!userId) {
    await Promise.all([
      Transaction.deleteMany({}),
      Wallet.deleteMany({}),
      Budget.deleteMany({}),
      SavingsGoal.deleteMany({}),
      User.deleteMany({}),
    ]);

    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@flowfi.com',
      password: 'demo123',
      profileColor: '#10b981',
      profileIcon: '👤',
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    });

    userId = demoUser._id;
  }

  const wallets = await Wallet.insertMany([
    { userId, name: 'Main Checking', type: 'checking', balance: 12450.0, currency: 'USD', color: '#10b981', icon: '💳', isShared: true, description: 'Primary shared account' },
    { userId, name: 'Savings Account', type: 'savings', balance: 34200.0, currency: 'USD', color: '#6366f1', icon: '🏦', isShared: true, description: 'Emergency fund & savings' },
    { userId, name: 'Investment Portfolio', type: 'investment', balance: 89300.0, currency: 'USD', color: '#f59e0b', icon: '📈', isShared: true, description: 'Stocks & ETFs' },
    { userId, name: 'Cash Wallet', type: 'cash', balance: 350.0, currency: 'USD', color: '#ec4899', icon: '💵', isShared: false, description: 'Daily cash' },
    { userId, name: 'Credit Card', type: 'credit', balance: -2100.0, currency: 'USD', color: '#ef4444', icon: '💳', isShared: false, description: 'Chase Sapphire' },
  ]);

  const mainWalletId = wallets[0]._id;
  const transactions = [];
  const now = new Date();
  for (let m = 5; m >= 0; m--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 0);

    transactions.push({
      userId,
      title: 'Monthly Salary',
      amount: randomBetween(5500, 7500),
      type: 'income',
      category: 'Salary',
      date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 1),
      walletId: mainWalletId,
      currency: 'USD',
      isRecurring: true,
      recurrenceInterval: 'monthly',
    });

    if (Math.random() > 0.4) {
      transactions.push({
        userId,
        title: 'Freelance Project',
        amount: randomBetween(800, 3000),
        type: 'income',
        category: 'Freelance',
        date: randomDate(monthStart, monthEnd),
        walletId: mainWalletId,
        currency: 'USD',
        isRecurring: false,
      });
    }

    const expenseCount = Math.floor(randomBetween(25, 35));
    for (let i = 0; i < expenseCount; i++) {
      const cat = EXPENSE_CATS[Math.floor(Math.random() * EXPENSE_CATS.length)];
      const expenseTitles: Record<string, string[]> = {
        'Food & Dining': ['Grocery Shopping', 'Restaurant Dinner', 'Coffee Shop', 'Lunch', 'Food Delivery', 'Bakery'],
        'Transport': ['Uber Ride', 'Gas Station', 'Bus Pass', 'Parking', 'Car Maintenance', 'Taxi'],
        'Bills & Utilities': ['Electric Bill', 'Internet Service', 'Water Bill', 'Phone Bill', 'Gas Bill', 'Phone Bill'],
        'Shopping': ['Amazon Purchase', 'Clothing Store', 'Electronics', 'Home Supplies', 'Online Shopping'],
        'Entertainment': ['Netflix', 'Movie Tickets', 'Concert', 'Gaming', 'Books', 'Streaming Service'],
        'Health & Medical': ['Pharmacy', 'Doctor Visit', 'Gym Membership', 'Health Insurance', 'Dentist'],
        'Subscriptions': ['Spotify', 'Adobe Creative', 'Notion Pro', 'GitHub Pro', 'Cloud Storage'],
        'Personal Care': ['Haircut', 'Cosmetics', 'Spa Treatment', 'Skincare Products'],
        'Home & Garden': ['Furniture', 'Home Repair', 'Garden Supplies', 'Cleaning Products'],
        'Sports & Fitness': ['Gym Equipment', 'Sports Gear', 'Fitness Class', 'Running Shoes'],
      };
      const titles = expenseTitles[cat] || ['Purchase'];
      transactions.push({
        userId,
        title: titles[Math.floor(Math.random() * titles.length)],
        amount: randomBetween(5, cat === 'Bills & Utilities' ? 300 : cat === 'Shopping' ? 200 : 150),
        type: 'expense',
        category: cat,
        date: randomDate(monthStart, monthEnd),
        walletId: mainWalletId,
        currency: 'USD',
        isRecurring: false,
      });
    }
  }

  await Transaction.insertMany(transactions);

  const currMonth = now.getMonth() + 1;
  const currYear = now.getFullYear();
  const budgetData = EXPENSE_CATS.map((cat) => ({
    userId,
    category: cat,
    limit: randomBetween(300, 1500),
    spent: 0,
    period: 'monthly',
    month: currMonth,
    year: currYear,
    currency: 'USD',
    alerts: true,
    alertThreshold: 80,
  }));
  await Budget.insertMany(budgetData);

  const goals = await SavingsGoal.insertMany([
    { userId, name: 'Emergency Fund', targetAmount: 25000, currentAmount: 18500, currency: 'USD', color: '#10b981', icon: '🛡️', description: '6 months of expenses', isCompleted: false, deadline: new Date(now.getFullYear(), now.getMonth() + 6, 1) },
    { userId, name: 'Europe Vacation', targetAmount: 8000, currentAmount: 4200, currency: 'USD', color: '#6366f1', icon: '✈️', description: 'Summer trip to Europe', isCompleted: false, deadline: new Date(now.getFullYear(), 7, 1) },
    { userId, name: 'New MacBook Pro', targetAmount: 3500, currentAmount: 3500, currency: 'USD', color: '#f59e0b', icon: '💻', description: 'M4 MacBook Pro 16"', isCompleted: true },
    { userId, name: 'Down Payment', targetAmount: 80000, currentAmount: 34000, currency: 'USD', color: '#ec4899', icon: '🏠', description: 'House down payment fund', isCompleted: false, deadline: new Date(now.getFullYear() + 2, 0, 1) },
    { userId, name: 'Investment Boost', targetAmount: 15000, currentAmount: 9800, currency: 'USD', color: '#14b8a6', icon: '📈', description: 'Add to investment portfolio', isCompleted: false },
  ]);

  const seededUser = currentUserId ? await User.findById(currentUserId) : await User.findOne({ email: 'demo@flowfi.com' });

  console.log('🌱 Seed complete!');
  return {
    user: seededUser,
    wallets,
    transactionsCreated: transactions.length,
    budgetsCreated: budgetData.length,
    goalsCreated: goals.length,
  };
}
