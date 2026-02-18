import { useEffect, useState } from 'react';
import { customerApi } from '@/services/api';
import { Package, CheckCircle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function MyItems() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'active' | 'used'>('all');
  const [reminderItem, setReminderItem] = useState<number | null>(null);
  const [reminderDate, setReminderDate] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    customerApi.getItems().then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  const markUsed = async (id: number) => {
    try {
      await customerApi.markUsed(id);
      setItems(items.map(i => (i.id === id ? { ...i, status: 'used' } : i)));
      toast({ title: 'Marked as used ✅' });
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' });
    }
  };

  const setReminder = async (id: number) => {
    if (!reminderDate) return;
    try {
      await customerApi.setReminder(id, reminderDate);
      toast({ title: 'Reminder set! 🔔' });
      setReminderItem(null);
      setReminderDate('');
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' });
    }
  };

  const filtered = items.filter(i =>
    tab === 'all' ? true : tab === 'active' ? (i.status !== 'used') : i.status === 'used'
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold font-display text-foreground">My Items</h1><p className="text-muted-foreground">Track your purchases</p></div>
      <div className="flex gap-2">
        {(['all', 'active', 'used'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-40" /><p className="font-medium">No items</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <div key={i} className="bg-card rounded-2xl p-5 shadow-soft border animate-scale-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{item.product_name}</h3>
                  <p className="text-sm text-muted-foreground">{item.shop_name && `${item.shop_name} · `}{item.unit}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  item.status === 'used' ? 'bg-muted text-muted-foreground' : 'bg-success/10 text-success'
                }`}>{item.status || 'Active'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                <div><span className="text-muted-foreground">Qty:</span> <span className="font-medium text-foreground">{item.quantity}</span></div>
                <div><span className="text-muted-foreground">Price:</span> <span className="font-medium text-foreground">₹{item.price}</span></div>
                <div><span className="text-muted-foreground">Exp:</span> <span className="font-medium text-foreground">{item.expiry_date || '—'}</span></div>
              </div>
              {item.status !== 'used' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => markUsed(item.id)}>
                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Mark Used
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setReminderItem(item.id === reminderItem ? null : item.id)}>
                    <Bell className="h-3.5 w-3.5 mr-1" /> Reminder
                  </Button>
                </div>
              )}
              {reminderItem === item.id && (
                <div className="mt-3 flex gap-2 animate-fade-in">
                  <Input type="date" value={reminderDate} onChange={e => setReminderDate(e.target.value)} className="rounded-xl" />
                  <Button size="sm" className="rounded-xl gradient-primary text-primary-foreground" onClick={() => setReminder(item.id)}>Set</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
