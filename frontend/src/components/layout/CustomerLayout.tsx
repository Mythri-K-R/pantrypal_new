import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Package, Bell, KeyRound, User, Settings, LogOut, Menu, X, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/customer', icon: Home, label: 'Home', end: true },
  { to: '/customer/items', icon: Package, label: 'My Items' },
  { to: '/customer/notifications', icon: Bell, label: 'Alerts' },
  { to: '/customer/claim', icon: KeyRound, label: 'Claim' },
  { to: '/customer/profile', icon: User, label: 'Profile' },
  { to: '/customer/settings', icon: Settings, label: 'Settings' },
];

// Bottom bar shows first 5 items on mobile
const bottomNavItems = navItems.slice(0, 5);

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <>
      <div className="p-5 flex items-center gap-3">
        <ShoppingBag className="h-7 w-7 text-sidebar-primary" />
        <span className="text-xl font-bold font-display text-sidebar-foreground">PantryPal</span>
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
              isActive
                ? 'bg-sidebar-accent text-sidebar-primary'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            )}>
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3">
        <button onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-all">
          <LogOut className="h-4.5 w-4.5" /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 flex flex-col bg-sidebar animate-slide-up">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-sidebar-foreground">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b flex items-center justify-between px-4 bg-card">
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Open menu" className="lg:hidden p-2 rounded-xl hover:bg-muted" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-base font-semibold font-display text-foreground">
              Hello, <span className="text-primary">{user?.name}</span>
            </h2>
          </div>
          <button onClick={handleLogout} className="lg:hidden p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </header>

        {/* Scrollable content — pb for bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 lg:pb-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border flex items-center justify-around h-16 safe-area-bottom">
        {bottomNavItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[11px] font-medium transition-colors min-w-[56px]',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}>
            {({ isActive }) => (
              <>
                <div className={cn(
                  'p-1.5 rounded-xl transition-colors',
                  isActive && 'bg-primary/10'
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
