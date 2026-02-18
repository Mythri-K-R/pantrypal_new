import { Settings as SettingsIcon } from 'lucide-react';

export default function CustomerSettings() {
  return (
    <div className="space-y-6 animate-fade-in max-w-lg">
      <div><h1 className="text-2xl font-bold font-display text-foreground">Settings</h1></div>
      <div className="bg-card rounded-2xl p-6 shadow-soft border text-center">
        <SettingsIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
        <p className="text-muted-foreground">Settings coming soon</p>
      </div>
    </div>
  );
}
