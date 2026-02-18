import { useEffect, useState } from 'react';
import { inventoryApi } from '@/services/api';
import { Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryApi.getAll()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your inventory</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-10 rounded-2xl" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No products found</p>
          <p className="text-sm">Add stock to see products here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <div key={i} className="bg-card rounded-2xl p-5 shadow-soft border hover:shadow-glow transition-all animate-scale-in"
              style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{p.product_name}</h3>
                  <p className="text-sm text-muted-foreground">{p.brand}</p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  {p.unit}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Available</p>
                  <p className="font-semibold text-foreground">{p.available_quantity ?? p.quantity ?? 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Batches</p>
                  <p className="font-semibold text-foreground">{p.batch_count ?? 1}</p>
                </div>
                {p.expiry_date && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Nearest Expiry</p>
                    <p className="font-semibold text-foreground">{p.expiry_date}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
