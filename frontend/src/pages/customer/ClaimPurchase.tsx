import { useState } from 'react';
import { customerApi } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ClaimPurchase() {
  const [code, setCode] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleClaim = async () => {
    if (code.length !== 6) { toast({ title: 'Enter a valid 6-digit code', variant: 'destructive' }); return; }
    setClaiming(true);
    try {
      await customerApi.claim(code);
      setSuccess(true);
      toast({ title: 'Purchase claimed! ✅' });
    } catch (e: any) {
      toast({ title: 'Claim failed', description: e.message, variant: 'destructive' });
    } finally {
      setClaiming(false);
    }
  };

  if (success) return (
    <div className="max-w-md mx-auto mt-12 animate-scale-in">
      <div className="bg-card rounded-2xl p-8 shadow-soft border text-center">
        <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
        <h2 className="text-2xl font-bold font-display text-foreground mb-2">Claimed!</h2>
        <p className="text-muted-foreground mb-6">Your items have been added to My Items</p>
        <Button className="rounded-2xl gradient-primary text-primary-foreground" onClick={() => { setSuccess(false); setCode(''); }}>
          Claim Another
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto mt-12 animate-fade-in">
      <div className="bg-card rounded-2xl p-8 shadow-soft border">
        <div className="text-center mb-6">
          <KeyRound className="h-12 w-12 text-primary mx-auto mb-3" />
          <h2 className="text-2xl font-bold font-display text-foreground">Claim Purchase</h2>
          <p className="text-muted-foreground">Enter the 6-digit code from your receipt</p>
        </div>
        <Input placeholder="● ● ● ● ● ●" value={code} maxLength={6}
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          className="rounded-2xl text-center text-2xl tracking-[0.5em] font-mono h-14 mb-4" />
        <Button className="w-full h-12 rounded-2xl gradient-primary text-primary-foreground font-semibold"
          onClick={handleClaim} disabled={claiming || code.length !== 6}>
          {claiming ? 'Claiming...' : 'Claim Purchase'}
        </Button>
      </div>
    </div>
  );
}
