import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Package, PlusCircle, History, ShoppingCart, Receipt,
  Tag, BarChart3, User, LogOut, Menu, X, ShoppingBag, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const navItems = [
  { to: '/retailer', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/retailer/products', icon: Package, label: 'Products' },
  { to: '/retailer/add-stock', icon: PlusCircle, label: 'Add Stock' },
  { to: '/retailer/stock-history', icon: History, label: 'Stock History' },
  { to: '/retailer/new-sale', icon: ShoppingCart, label: 'New Sale' },
  { to: '/retailer/sale-history', icon: Receipt, label: 'Sales' },
  { to: '/retailer/discounts', icon: Tag, label: 'Discounts' },
  { to: '/retailer/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/retailer/profile', icon: User, label: 'Profile' },
];

// Bottom bar: 4 primary tabs + "More" overflow
const bottomPrimary = [
  navItems[0], // Dashboard
  navItems[2], // Add Stock
  navItems[4], // New Sale
  navItems[7], // Analytics
];
const bottomOverflow = navItems.filter(n => !bottomPrimary.includes(n));

export default function RetailerLayout() {
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
        <header className="h-14 border-b flex items-center justify-between px-4 bg-card">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-xl hover:bg-muted" onClick={() => setSidebarOpen(true)}>
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

        <main className="flex-1 overflow-y-auto p-4 pb-20 lg:pb-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border flex items-center justify-around h-16 safe-area-bottom">
        {bottomPrimary.map(item => (
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

        {/* More dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[11px] font-medium text-muted-foreground min-w-[56px] outline-none">
            <div className="p-1.5 rounded-xl">
              <MoreHorizontal className="h-5 w-5" />
            </div>
            <span>More</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="mb-2 rounded-2xl min-w-[180px]">
            {bottomOverflow.map(item => (
              <DropdownMenuItem key={item.to} asChild className="rounded-xl gap-3 py-2.5">
                <NavLink to={item.to} end={item.end}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </div>
  );
}
