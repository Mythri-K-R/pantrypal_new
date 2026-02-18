import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingBag, Store, User, Sparkles, Phone, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (user) {
    navigate(user.role === 'retailer' ? '/retailer' : '/customer', { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(phone, password);
      toast({ title: 'Welcome back!' });
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async (role: 'retailer' | 'customer') => {
    setDemoLoading(role);
    try {
      const creds = role === 'retailer'
        ? { phone: '9000000001', password: 'ret123' }
        : { phone: '9000000003', password: 'cus345' };
      await login(creds.phone, creds.password);
      toast({ title: `Welcome, Demo ${role === 'retailer' ? 'Retailer' : 'Customer'}!` });
    } catch (err: any) {
      toast({ title: 'Demo login failed', description: err.message, variant: 'destructive' });
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-primary/20"
              style={{
                width: `${100 + i * 80}px`, height: `${100 + i * 80}px`,
                top: `${10 + i * 15}%`, left: `${5 + i * 18}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center max-w-md animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-6">
            <ShoppingBag className="h-12 w-12 text-primary-foreground" />
            <h1 className="text-5xl font-bold font-display text-primary-foreground">PantryPal</h1>
          </div>
          <p className="text-lg text-primary-foreground/80 leading-relaxed">
            Smart inventory tracking for Indian retailers. Reduce waste, increase profits, and delight customers.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-display text-foreground">PantryPal</h1>
          </div>

          <h2 className="text-2xl font-bold font-display text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to manage your pantry</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" type="tel" placeholder="Enter phone number" value={phone}
                  onChange={e => setPhone(e.target.value)} className="pl-10 rounded-2xl h-12" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="Enter password" value={password}
                  onChange={e => setPassword(e.target.value)} className="pl-10 rounded-2xl h-12" required />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 rounded-2xl gradient-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-sm text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Explore Demo Mode
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 rounded-2xl border-2 hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => handleDemo('retailer')} disabled={!!demoLoading}>
              <Store className="h-4 w-4 mr-2" />
              {demoLoading === 'retailer' ? 'Loading...' : 'Demo Retailer'}
            </Button>
            <Button variant="outline" className="h-12 rounded-2xl border-2 hover:border-accent hover:bg-accent/5 transition-all"
              onClick={() => handleDemo('customer')} disabled={!!demoLoading}>
              <User className="h-4 w-4 mr-2" />
              {demoLoading === 'customer' ? 'Loading...' : 'Demo Customer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
