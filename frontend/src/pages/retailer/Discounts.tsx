import { useEffect, useState } from 'react';
import { inventoryApi } from '@/services/api';
import { Tag, AlertTriangle, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Discounts() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryApi.getDiscountSuggestions().then(setItems).catch(() => {
      inventoryApi.getNearExpiry().then(setItems).catch(() => setItems([]));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold font-display text-foreground">Smart Discounts</h1><p className="text-muted-foreground">Reduce waste, boost sales</p></div>
      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border">
          <Tag className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No discount suggestions</p>
          <p className="text-sm">All products are selling well! 🎉</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item, i) => {
            const daysLeft = item.days_until_expiry ?? item.days_left;
            const urgency = daysLeft != null && daysLeft <= 3 ? 'critical' : daysLeft != null && daysLeft <= 7 ? 'warning' : 'normal';
            return (
              <div key={i} className={`bg-card rounded-2xl p-5 shadow-soft border transition-all hover:shadow-glow ${
                urgency === 'critical' ? 'border-destructive/30' : urgency === 'warning' ? 'border-warning/30' : ''
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{item.product_name}</h3>
                    <p className="text-sm text-muted-foreground">{item.brand} · {item.unit}</p>
                  </div>
                  {urgency === 'critical' ? (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-destructive/10 text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Urgent
                    </span>
                  ) : urgency === 'warning' ? (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-warning/10 text-warning">
                      ⏳ {daysLeft}d left
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      {daysLeft}d left
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div><span className="text-muted-foreground">Qty:</span> <span className="font-medium text-foreground">{item.quantity}</span></div>
                  <div><span className="text-muted-foreground">Price:</span> <span className="font-medium text-foreground">₹{item.selling_price}</span></div>
                </div>
                {item.suggested_discount && (
                  <div className="p-3 rounded-xl bg-success/5 border border-success/20 text-sm">
                    <TrendingDown className="h-4 w-4 text-success inline mr-1" />
                    <span className="text-foreground">Suggested: <strong>{item.suggested_discount}% off</strong></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
