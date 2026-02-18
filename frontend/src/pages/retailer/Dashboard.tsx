import { useEffect, useState } from 'react';
import { inventoryApi, salesApi } from '@/services/api';
import { Package, AlertTriangle, ShoppingCart, TrendingUp, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

interface DashboardData {
  total_products?: number;
  near_expiry_count?: number;
  sales_today?: number;
  items_sold_today?: number;
  fefo_suggestions?: any[];
  needs_attention?: any[];
  inventory_health?: any[];
  sales_overview?: any[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryApi.getDashboard()
      .then(setData)
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Products', value: data.total_products ?? 0, icon: Package, color: 'primary' },
    { label: 'Near Expiry', value: data.near_expiry_count ?? 0, icon: AlertTriangle, color: 'warning' },
    { label: 'Sales Today', value: `₹${data.sales_today ?? 0}`, icon: ShoppingCart, color: 'success' },
    { label: 'Items Sold', value: data.items_sold_today ?? 0, icon: TrendingUp, color: 'info' },
  ];

  const pieColors = ['hsl(152, 60%, 45%)', 'hsl(36, 90%, 55%)', 'hsl(0, 72%, 55%)', 'hsl(200, 70%, 50%)'];
  const healthData = data.inventory_health?.length ? data.inventory_health : [
    { name: 'Fresh', value: 65 }, { name: 'Nearing Expiry', value: 20 },
    { name: 'Expired', value: 5 }, { name: 'Low Stock', value: 10 },
  ];
  const salesData = data.sales_overview?.length ? data.sales_overview : [
    { day: 'Mon', sales: 1200 }, { day: 'Tue', sales: 1800 }, { day: 'Wed', sales: 900 },
    { day: 'Thu', sales: 2100 }, { day: 'Fri', sales: 1600 }, { day: 'Sat', sales: 2400 }, { day: 'Sun', sales: 1900 },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Your store at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card rounded-2xl p-5 shadow-soft border animate-scale-in hover:shadow-glow transition-shadow"
            style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${
                stat.color === 'primary' ? 'bg-primary/10' :
                stat.color === 'warning' ? 'bg-warning/10' :
                stat.color === 'success' ? 'bg-success/10' : 'bg-info/10'
              }`}>
                <stat.icon className={`h-5 w-5 ${
                  stat.color === 'primary' ? 'text-primary' :
                  stat.color === 'warning' ? 'text-warning' :
                  stat.color === 'success' ? 'text-success' : 'text-info'
                }`} />
              </div>
            </div>
            <p className="text-2xl font-bold font-display text-foreground animate-count-up">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 shadow-soft border">
          <h3 className="font-semibold font-display text-foreground mb-4">Inventory Health</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={healthData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                {healthData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {healthData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: pieColors[i % pieColors.length] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-soft border">
          <h3 className="font-semibold font-display text-foreground mb-4">Sales Overview</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 89%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`₹${v}`, 'Sales']} />
              <Bar dataKey="sales" fill="hsl(162, 63%, 41%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sell First Suggestions */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold font-display text-foreground">🔥 Sell First (FEFO)</h3>
          <Link to="/retailer/discounts" className="text-sm text-primary hover:underline flex items-center gap-1">
            View discounts <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {data.fefo_suggestions?.length ? (
          <div className="space-y-3">
            {data.fefo_suggestions.slice(0, 5).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">Expires: {item.expiry_date}</p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-warning/10 text-warning">
                  {item.days_left}d left
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p>No urgent items right now. Great job! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}
