import { seedDatabase } from '@/lib/seed';

seedDatabase().catch((e) => {
  console.error(e);
  process.exit(1);
});
