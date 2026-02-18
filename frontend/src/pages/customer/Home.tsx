import { useState, useEffect } from 'react';
import { customerApi } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Package, KeyRound, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CustomerHome() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimCode, setClaimCode] = useState('');
  const [claiming, setClaiming] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    customerApi.getItems().then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  const handleClaim = async () => {
    if (claimCode.length !== 6) { toast({ title: 'Enter a 6-digit code', variant: 'destructive' }); return; }
    setClaiming(true);
    try {
      await customerApi.claim(claimCode);
      toast({ title: 'Purchase claimed! ✅' });
      setClaimCode('');
      customerApi.getItems().then(setItems).catch(() => {});
    } catch (e: any) {
      toast({ title: 'Claim failed', description: e.message, variant: 'destructive' });
    } finally {
      setClaiming(false);
    }
  };

  const activeItems = items.filter(i => i.status === 'active' || !i.status);
  const nearExpiry = items.filter(i => {
    if (!i.expiry_date) return false;
    const diff = (new Date(i.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff <= 7 && diff > 0;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold font-display text-foreground">Home</h1><p className="text-muted-foreground">Your pantry overview</p></div>

      {/* Claim */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border">
        <h3 className="font-semibold font-display text-foreground mb-3 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" /> Claim Purchase
        </h3>
        <div className="flex gap-2">
          <Input placeholder="Enter 6-digit passcode" value={claimCode} maxLength={6}
            onChange={e => setClaimCode(e.target.value.replace(/\D/g, ''))} className="rounded-2xl text-center text-lg tracking-widest font-mono" />
          <Button className="rounded-2xl gradient-primary text-primary-foreground px-6" onClick={handleClaim} disabled={claiming}>
            {claiming ? '...' : 'Claim'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-5 shadow-soft border">
          <Package className="h-6 w-6 text-primary mb-2" />
          <p className="text-2xl font-bold font-display text-foreground">{activeItems.length}</p>
          <p className="text-sm text-muted-foreground">Active Items</p>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-soft border">
          <AlertTriangle className="h-6 w-6 text-warning mb-2" />
          <p className="text-2xl font-bold font-display text-foreground">{nearExpiry.length}</p>
          <p className="text-sm text-muted-foreground">Near Expiry</p>
        </div>
      </div>

      {/* Near expiry */}
      {nearExpiry.length > 0 && (
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-warning/20">
          <h3 className="font-semibold font-display text-foreground mb-3">⚠️ Use Soon</h3>
          <div className="space-y-2">
            {nearExpiry.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-warning/5">
                <div>
                  <p className="font-medium text-foreground">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">Exp: {item.expiry_date}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-warning/10 text-warning">Expiring</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
