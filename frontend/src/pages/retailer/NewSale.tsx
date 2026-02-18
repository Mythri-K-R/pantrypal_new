import { useState, useEffect } from 'react';
import { productsApi, salesApi, inventoryApi } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Trash2, ShoppingCart, Download, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  product_id: number;
  product_name: string;
  unit: string;
  price: number;
  quantity: number;
}

export default function NewSale() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [claimCode, setClaimCode] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await productsApi.search(q);
      setSuggestions(Array.isArray(res) ? res : []);
    } catch { setSuggestions([]); }
  };

  const addToCart = (p: any) => {
    const existing = cart.find(c => c.product_id === (p.id || p.product_id));
    if (existing) {
      setCart(cart.map(c => c.product_id === existing.product_id
        ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, {
        product_id: p.id || p.product_id,
        product_name: p.product_name || p.name,
        unit: p.unit || '',
        price: p.selling_price || p.price || 0,
        quantity: 1,
      }]);
    }
    setSuggestions([]);
    setSearchQuery('');
  };

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setCart(cart.map(c => c.product_id === id ? { ...c, quantity: qty } : c));
  };

  const removeFromCart = (id: number) => setCart(cart.filter(c => c.product_id !== id));

  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      const res = await salesApi.create(cart.map(c => ({
        product_id: c.product_id, quantity: c.quantity, price: c.price,
      })));
      setClaimCode(res.claim_code);
      setTotalAmount(res.total_amount);
      toast({ title: 'Sale completed! ✅' });
    } catch (e: any) {
      toast({ title: 'Checkout failed', description: e.message, variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(claimCode);
    toast({ title: 'Code copied!' });
  };

  const newSale = () => {
    setCart([]);
    setClaimCode('');
    setTotalAmount(0);
  };

  if (claimCode) {
    return (
      <div className="max-w-md mx-auto mt-12 animate-scale-in">
        <div className="bg-card rounded-2xl p-8 shadow-soft border text-center">
          <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-display text-foreground mb-2">Sale Complete!</h2>
          <p className="text-muted-foreground mb-6">Share this claim code with the customer</p>
          <div className="bg-muted rounded-2xl p-6 mb-4">
            <p className="text-sm text-muted-foreground mb-1">Claim Code</p>
            <p className="text-4xl font-bold font-display text-primary tracking-widest">{claimCode}</p>
          </div>
          <p className="text-2xl font-bold text-foreground mb-6">Total: ₹{totalAmount}</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-2xl" onClick={copyCode}>
              <Copy className="h-4 w-4 mr-2" /> Copy Code
            </Button>
            <Button className="flex-1 rounded-2xl gradient-primary text-primary-foreground" onClick={newSale}>
              New Sale
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">New Sale</h1>
        <p className="text-muted-foreground">Point of Sale</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search product to add..." value={searchQuery}
          onChange={e => handleSearch(e.target.value)} className="pl-10 rounded-2xl" />
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-card rounded-xl border shadow-lg overflow-hidden">
            {suggestions.map((p, i) => (
              <button key={i} onClick={() => addToCart(p)}
                className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0">
                <p className="font-medium text-foreground">{p.product_name || p.name}</p>
                <p className="text-xs text-muted-foreground">{p.unit} · ₹{p.selling_price || p.price}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cart */}
      {cart.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border">
          <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Cart is empty</p>
          <p className="text-sm">Search and add products above</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-soft border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-left text-muted-foreground">
                  <th className="p-4">Product</th><th className="p-4">Unit</th><th className="p-4">Price</th>
                  <th className="p-4">Qty</th><th className="p-4">Total</th><th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.product_id} className="border-t">
                    <td className="p-4 font-medium text-foreground">{item.product_name}</td>
                    <td className="p-4 text-muted-foreground">{item.unit}</td>
                    <td className="p-4">₹{item.price}</td>
                    <td className="p-4">
                      <Input type="number" value={item.quantity} min={1}
                        onChange={e => updateQty(item.product_id, Number(e.target.value))}
                        className="w-20 rounded-xl text-center" />
                    </td>
                    <td className="p-4 font-semibold">₹{item.price * item.quantity}</td>
                    <td className="p-4">
                      <button onClick={() => removeFromCart(item.product_id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t p-4 flex items-center justify-between">
            <p className="text-xl font-bold font-display text-foreground">Total: ₹{total}</p>
            <Button className="rounded-2xl gradient-primary text-primary-foreground h-12 px-8 font-semibold"
              onClick={handleCheckout} disabled={processing}>
              {processing ? 'Processing...' : 'Checkout'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
