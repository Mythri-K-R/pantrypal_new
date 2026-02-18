import { useEffect, useState } from 'react';
import { analyticsApi } from '@/services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.get().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  const salesData = data?.sales_trend || [
    { date: 'Week 1', revenue: 4500 }, { date: 'Week 2', revenue: 6200 },
    { date: 'Week 3', revenue: 5100 }, { date: 'Week 4', revenue: 7800 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold font-display text-foreground">Analytics</h1><p className="text-muted-foreground">Business insights</p></div>
      <div className="bg-card rounded-2xl p-6 shadow-soft border">
        <h3 className="font-semibold font-display text-foreground mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 89%)" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => [`₹${v}`, 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="hsl(162, 63%, 41%)" strokeWidth={2.5} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {!data && (
        <div className="text-center py-8 text-muted-foreground bg-card rounded-2xl border">
          <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>Connect your backend to see live analytics</p>
        </div>
      )}
    </div>
  );
}
