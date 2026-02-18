import { useEffect, useState } from 'react';
import { inventoryApi } from '@/services/api';
import { History } from 'lucide-react';

export default function StockHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryApi.getStockHistory().then(setHistory).catch(() => setHistory([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold font-display text-foreground">Stock History</h1><p className="text-muted-foreground">Track stock additions</p></div>
      {history.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border">
          <History className="h-12 w-12 mx-auto mb-3 opacity-40" /><p className="font-medium">No history yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((h, i) => (
            <div key={i} className="bg-card rounded-2xl p-5 shadow-soft border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{h.product_name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {h.quantity} · Exp: {h.expiry_date}</p>
                </div>
                <p className="text-sm text-muted-foreground">{h.created_at ? new Date(h.created_at).toLocaleDateString() : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
