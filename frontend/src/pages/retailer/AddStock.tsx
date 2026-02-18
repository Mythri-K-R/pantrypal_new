import { useState, useRef } from 'react';
import { productsApi, inventoryApi } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Camera, ScanLine, Plus, Trash2, CheckCircle, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BatchEntry {
  product_id: number;
  product_name: string;
  mfd_date: string;
  expiry_date: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
}

export default function AddStock() {
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [mfdDate, setMfdDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [batches, setBatches] = useState<BatchEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [scanningOCR, setScanningOCR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await productsApi.search(q);
      setSuggestions(Array.isArray(res) ? res : []);
    } catch { setSuggestions([]); }
  };

  const handleBarcode = async () => {
    if (!barcodeInput) return;
    try {
      const res = await productsApi.searchByBarcode(barcodeInput);
      setSelectedProduct(res);
      setStep(2);
      toast({ title: 'Product found!' });
    } catch {
      toast({ title: 'Product not found', variant: 'destructive' });
    }
  };

  const selectProduct = (p: any) => {
    setSelectedProduct(p);
    setSuggestions([]);
    setSearchQuery(p.product_name || p.name || '');
    setStep(2);
  };

  const handleOCR = async (file: File) => {
    setScanningOCR(true);
    try {
      const Tesseract = await import('tesseract.js');
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      // Try to extract dates
      const datePatterns = [
        /(?:MFG|MFD|Mfg|Mfd|Manufacturing)[\s:.]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
        /(?:EXP|Exp|Expiry|Use By|Best Before)[\s:.]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
        /(?:Best Before|BB)[\s:.]*(\d+)\s*(months?|days?)/i,
      ];
      const mfdMatch = text.match(datePatterns[0]);
      const expMatch = text.match(datePatterns[1]);
      const bbMatch = text.match(datePatterns[2]);

      if (mfdMatch) {
        const d = parseDate(mfdMatch[1]);
        if (d) setMfdDate(d);
      }
      if (expMatch) {
        const d = parseDate(expMatch[1]);
        if (d) setExpiryDate(d);
      } else if (bbMatch && mfdDate) {
        const num = parseInt(bbMatch[1]);
        const unit = bbMatch[2].toLowerCase();
        const mfd = new Date(mfdDate);
        if (unit.startsWith('month')) mfd.setMonth(mfd.getMonth() + num);
        else mfd.setDate(mfd.getDate() + num);
        setExpiryDate(mfd.toISOString().split('T')[0]);
      }
      toast({ title: 'OCR scan complete', description: text.substring(0, 100) });
    } catch (e) {
      toast({ title: 'OCR failed', variant: 'destructive' });
    } finally {
      setScanningOCR(false);
    }
  };

  const parseDate = (str: string): string | null => {
    const parts = str.replace(/\//g, '-').split('-');
    if (parts.length !== 3) return null;
    let [d, m, y] = parts.map(Number);
    if (y < 100) y += 2000;
    if (m > 12) [d, m] = [m, d];
    const date = new Date(y, m - 1, d);
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  };

  const addBatch = () => {
    if (!selectedProduct || !mfdDate || !expiryDate || !quantity || !purchasePrice || !sellingPrice) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    setBatches(prev => [...prev, {
      product_id: selectedProduct.id || selectedProduct.product_id,
      product_name: selectedProduct.product_name || selectedProduct.name,
      mfd_date: mfdDate, expiry_date: expiryDate,
      quantity: Number(quantity), purchase_price: Number(purchasePrice), selling_price: Number(sellingPrice),
    }]);
    setMfdDate(''); setExpiryDate(''); setQuantity(''); setPurchasePrice(''); setSellingPrice('');
    toast({ title: 'Batch added to queue' });
  };

  const removeBatch = (i: number) => setBatches(prev => prev.filter((_, idx) => idx !== i));

  const submitAll = async () => {
    setSubmitting(true);
    try {
      for (const b of batches) {
        await inventoryApi.add({
          product_id: b.product_id, mfd_date: b.mfd_date, expiry_date: b.expiry_date,
          quantity: b.quantity, purchase_price: b.purchase_price, selling_price: b.selling_price,
        });
      }
      toast({ title: 'All batches saved! ✅' });
      setBatches([]);
      setStep(1); setSelectedProduct(null); setSearchQuery('');
    } catch (e: any) {
      toast({ title: 'Error saving', description: e.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Add Stock</h1>
        <p className="text-muted-foreground">Add products to your inventory</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              step >= s ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>{s}</div>
            {s < 3 && <div className={`h-0.5 w-8 sm:w-16 rounded-full ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        ))}
        <span className="text-sm text-muted-foreground ml-2">
          {step === 1 ? 'Identify Product' : step === 2 ? 'Scan Dates' : 'Batch Details'}
        </span>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="bg-card rounded-2xl p-6 shadow-soft border space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <ScanLine className="h-5 w-5 text-primary" /> Option A: Scan Barcode
            </h3>
            <div className="flex gap-2">
              <Input placeholder="Enter barcode number" value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)} className="rounded-2xl" />
              <Button onClick={handleBarcode} className="rounded-2xl gradient-primary text-primary-foreground">Scan</Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
            <div className="relative flex justify-center"><span className="bg-card px-3 text-sm text-muted-foreground">OR</span></div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" /> Option B: Manual Search
            </h3>
            <Input placeholder="Search for a product..." value={searchQuery}
              onChange={e => handleSearch(e.target.value)} className="rounded-2xl" />
            {suggestions.length > 0 && (
              <div className="mt-2 bg-card rounded-xl border shadow-soft overflow-hidden">
                {suggestions.map((p, i) => (
                  <button key={i} onClick={() => selectProduct(p)}
                    className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0">
                    <p className="font-medium text-foreground">{p.product_name || p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.brand} · {p.unit}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && selectedProduct && (
        <div className="bg-card rounded-2xl p-6 shadow-soft border space-y-6">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">Selected Product</p>
            <p className="font-semibold text-foreground">{selectedProduct.product_name || selectedProduct.name}</p>
            <p className="text-xs text-muted-foreground">{selectedProduct.brand} · {selectedProduct.unit} · {selectedProduct.category}</p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" /> Scan Dates (OCR)
            </h3>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={e => e.target.files?.[0] && handleOCR(e.target.files[0])} />
            <Button variant="outline" className="rounded-2xl" onClick={() => fileInputRef.current?.click()} disabled={scanningOCR}>
              <Camera className="h-4 w-4 mr-2" />
              {scanningOCR ? 'Scanning...' : 'Capture & Process'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Manufacturing Date (MFD)</Label>
              <Input type="date" value={mfdDate} onChange={e => setMfdDate(e.target.value)} className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date (EXP)</Label>
              <Input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="rounded-2xl" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="rounded-2xl" onClick={() => setStep(1)}>Back</Button>
            <Button className="rounded-2xl gradient-primary text-primary-foreground" onClick={() => setStep(3)}
              disabled={!mfdDate || !expiryDate}>Next</Button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="bg-card rounded-2xl p-6 shadow-soft border space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" placeholder="e.g. 24" value={quantity}
                onChange={e => setQuantity(e.target.value)} className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label>Purchase Price (₹)</Label>
              <Input type="number" placeholder="₹" value={purchasePrice}
                onChange={e => setPurchasePrice(e.target.value)} className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label>Selling Price (₹)</Label>
              <Input type="number" placeholder="₹" value={sellingPrice}
                onChange={e => setSellingPrice(e.target.value)} className="rounded-2xl" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-2xl" onClick={() => setStep(2)}>Back</Button>
            <Button className="rounded-2xl gradient-primary text-primary-foreground" onClick={addBatch}>
              <Plus className="h-4 w-4 mr-2" /> Add Batch
            </Button>
          </div>
        </div>
      )}

      {/* Batch queue */}
      {batches.length > 0 && (
        <div className="bg-card rounded-2xl p-6 shadow-soft border space-y-4">
          <h3 className="font-semibold font-display text-foreground">Batch Queue ({batches.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="pb-2">Product</th><th className="pb-2">MFD</th><th className="pb-2">EXP</th>
                  <th className="pb-2">Qty</th><th className="pb-2">Buy ₹</th><th className="pb-2">Sell ₹</th><th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="py-2 font-medium text-foreground">{b.product_name}</td>
                    <td className="py-2">{b.mfd_date}</td><td className="py-2">{b.expiry_date}</td>
                    <td className="py-2">{b.quantity}</td><td className="py-2">₹{b.purchase_price}</td>
                    <td className="py-2">₹{b.selling_price}</td>
                    <td className="py-2"><button onClick={() => removeBatch(i)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button className="w-full rounded-2xl gradient-primary text-primary-foreground h-12 font-semibold"
            onClick={submitAll} disabled={submitting}>
            <CheckCircle className="h-4 w-4 mr-2" />
            {submitting ? 'Saving...' : `Finish & Save ${batches.length} Batch(es)`}
          </Button>
        </div>
      )}
    </div>
  );
}
