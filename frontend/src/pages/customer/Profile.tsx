import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';

export default function CustomerProfile() {
  const { user } = useAuth();
  return (
    <div className="space-y-6 animate-fade-in max-w-lg">
      <div><h1 className="text-2xl font-bold font-display text-foreground">Profile</h1></div>
      <div className="bg-card rounded-2xl p-6 shadow-soft border">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-foreground">{user?.name}</h2>
            <span className="text-sm px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">{user?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
