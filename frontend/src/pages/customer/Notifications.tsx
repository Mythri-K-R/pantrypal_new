import { useEffect, useState } from 'react';
import { customerApi } from '@/services/api';
import { Bell, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'alerts' | 'reminders'>('alerts');
  const { toast } = useToast();

  useEffect(() => {
    customerApi.getNotifications().then(setNotifications).catch(() => setNotifications([])).finally(() => setLoading(false));
  }, []);

  const markUsed = async (itemId: number) => {
    try {
      await customerApi.markUsed(itemId);
      toast({ title: 'Marked as used ✅' });
      setNotifications(notifications.filter(n => n.item_id !== itemId));
    } catch (e: any) {
      toast({ title: 'Failed', variant: 'destructive' });
    }
  };

  const filtered = notifications.filter(n =>
    tab === 'alerts' ? n.type === 'alert' || n.type === 'expiry' : n.type === 'reminder'
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold font-display text-foreground">Notifications</h1></div>
      <div className="flex gap-2">
        {(['alerts', 'reminders'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>
      {filtered.length === 0 && notifications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No notifications</p>
          <p className="text-sm">You're all caught up! 🎉</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border">
          <p>No {tab} right now</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n, i) => (
            <div key={i} className="bg-card rounded-2xl p-5 shadow-soft border animate-scale-in">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl ${n.type === 'reminder' ? 'bg-info/10' : 'bg-warning/10'}`}>
                  {n.type === 'reminder' ? <Bell className="h-5 w-5 text-info" /> : <AlertTriangle className="h-5 w-5 text-warning" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{n.product_name || n.message || 'Notification'}</p>
                  <p className="text-sm text-muted-foreground">
                    {n.type === 'expiry' || n.type === 'alert' ? '⏳ Use this soon!' : '🔔 Reminder for today'}
                  </p>
                </div>
                {n.item_id && (
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => markUsed(n.item_id)}>
                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Used
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
