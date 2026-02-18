import { useEffect, useState } from 'react';
import { salesApi } from '@/services/api';
import { Receipt } from 'lucide-react';

export default function SaleHistory() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    salesApi.getHistory().then(setSales).catch(() => setSales([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold font-display text-foreground">Sale History</h1><p className="text-muted-foreground">Past transactions</p></div>
      {sales.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border">
          <Receipt className="h-12 w-12 mx-auto mb-3 opacity-40" /><p className="font-medium">No sales yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sales.map((s, i) => (
            <div key={i} className="bg-card rounded-2xl p-5 shadow-soft border hover:shadow-glow transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Claim: {s.claim_code}</p>
                  <p className="text-sm text-muted-foreground">{s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}</p>
                </div>
                <p className="text-lg font-bold text-primary">₹{s.total_amount}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
