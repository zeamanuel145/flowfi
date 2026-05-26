'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: { category: string; amount: number; percentage: number; color: string }[];
}

export function CategoryPieChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
        No data for this period
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
            paddingAngle={2} dataKey="amount">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => [formatCurrency(v), '']}
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 12,
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 mt-2">
        {data.slice(0, 5).map((item) => (
          <div key={item.category} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-muted-foreground truncate flex-1">{item.category}</span>
            <span className="text-xs font-semibold tabular-nums">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
