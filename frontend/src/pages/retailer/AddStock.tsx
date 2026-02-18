import { useState } from 'react';
import { productsApi, inventoryApi } from '@/services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Search, Camera, ScanLine, Plus, Trash2, CheckCircle,
  ChevronLeft, ChevronRight, X, Loader2, Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { useDateScanner } from '@/hooks/useDateScanner';

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
  const [batches, setBatches] = useState<BatchEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showDateCamera, setShowDateCamera] = useState(false);
  const { toast } = useToast();

  const scanner = useBarcodeScanner({
    onDetected: async (code) => {
      setShowCamera(false);
      toast({ title: `Barcode: ${code}`, description: 'Looking up product...' });
      try {
        const res = await productsApi.searchByBarcode(code);
        setSelectedProduct(res);
        setStep(2);
        toast({ title: 'Product found!' });
      } catch {
        toast({ title: 'Product not found for this barcode', variant: 'destructive' });
      }
    },
  });

  const dateScanner = useDateScanner({
    onDetected: (dates) => {
      if (dates.mfd) setMfdDate(dates.mfd);
      if (dates.exp) setExpiryDate(dates.exp);
      setShowDateCamera(false);
      toast({ title: 'Dates detected!', description: `MFD: ${dates.mfd || '—'} | EXP: ${dates.exp || '—'}` });
    },
  });

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await productsApi.search(q);
      setSuggestions(Array.isArray(res) ? res : []);
    } catch { setSuggestions([]); }
  };

  const selectProduct = (p: any) => {
    setSelectedProduct(p);
    setSuggestions([]);
    setSearchQuery(p.product_name || p.name || '');
    setStep(2);
  };

  const openCamera = () => {
    setShowCamera(true);
    scanner.start();
  };

  const closeCamera = () => {
    scanner.stop();
    setShowCamera(false);
  };

  const openDateCamera = () => {
    setShowDateCamera(true);
    dateScanner.start();
  };

  const closeDateCamera = () => {
    dateScanner.stop();
    setShowDateCamera(false);
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
    toast({ title: 'Batch added ✓' });
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
    } finally { setSubmitting(false); }
  };

  const stepLabels = ['Find Product', 'Scan Dates', 'Add Details'];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Fullscreen camera overlay */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between p-4">
            <h3 className="text-white font-semibold text-lg">Scan Barcode</h3>
            <button onClick={closeCamera} className="p-2 rounded-full bg-white/20 text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 relative flex items-center justify-center">
            <video
              ref={scanner.videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            {/* Scan overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-40 border-2 border-white/60 rounded-2xl relative">
                <div className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                <div className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                <div className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
                {/* Scanning line animation */}
                <div className="absolute left-2 right-2 h-0.5 bg-primary/80 animate-pulse top-1/2" />
              </div>
            </div>
          </div>
          <div className="p-6 pb-8 text-center">
            <p className="text-white/70 text-sm">Point camera at barcode</p>
            {scanner.error && <p className="text-destructive text-sm mt-2">{scanner.error}</p>}
          </div>
        </div>
      )}

      {/* Fullscreen date camera overlay */}
      {showDateCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between p-4">
            <h3 className="text-white font-semibold text-lg">Scan Dates</h3>
            <button onClick={closeDateCamera} className="p-2 rounded-full bg-white/20 text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 relative flex items-center justify-center">
            <video
              ref={dateScanner.videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas ref={dateScanner.canvasRef} className="hidden" />
            {/* Scan overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-48 border-2 border-white/40 rounded-2xl relative">
                <div className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-2xl" />
                <div className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-2xl" />
                <div className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-2xl" />
                <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-2xl" />
              </div>
            </div>
            {dateScanner.loading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
                <p className="text-white text-sm">Loading OCR engine...</p>
              </div>
            )}
          </div>

          {/* Live results panel */}
          <div className="bg-zinc-900 p-4 pb-8 space-y-3">
            {dateScanner.liveText && (
              <div className="bg-zinc-800 rounded-xl p-3 max-h-20 overflow-y-auto">
                <p className="text-zinc-400 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Eye className="h-3 w-3" /> Live Text
                </p>
                <p className="text-white/80 text-xs font-mono leading-relaxed">{dateScanner.liveText.substring(0, 200)}</p>
              </div>
            )}
            <div className="flex gap-3">
              <div className="flex-1 bg-zinc-800 rounded-xl p-3 text-center">
                <p className="text-zinc-400 text-[10px] uppercase tracking-wider">MFD</p>
                <p className={`text-sm font-bold mt-1 ${dateScanner.detectedDates.mfd ? 'text-green-400' : 'text-zinc-500'}`}>
                  {dateScanner.detectedDates.mfd || '—'}
                </p>
              </div>
              <div className="flex-1 bg-zinc-800 rounded-xl p-3 text-center">
                <p className="text-zinc-400 text-[10px] uppercase tracking-wider">EXP</p>
                <p className={`text-sm font-bold mt-1 ${dateScanner.detectedDates.exp ? 'text-green-400' : 'text-zinc-500'}`}>
                  {dateScanner.detectedDates.exp || '—'}
                </p>
              </div>
            </div>
            {(dateScanner.detectedDates.mfd || dateScanner.detectedDates.exp) && (
              <Button
                onClick={dateScanner.confirm}
                className="w-full h-12 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold"
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Use These Dates
              </Button>
            )}
            {!dateScanner.detectedDates.mfd && !dateScanner.detectedDates.exp && dateScanner.scanning && (
              <p className="text-center text-zinc-400 text-xs">Point camera at MFD / EXP text on package...</p>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold font-display text-foreground">Add Stock</h1>
        <p className="text-sm text-muted-foreground">Add products to inventory</p>
      </div>

      {/* Step indicator - compact mobile */}
      <div className="flex items-center gap-1.5">
        {stepLabels.map((label, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step > i + 1 ? 'bg-primary text-primary-foreground' :
              step === i + 1 ? 'gradient-primary text-primary-foreground shadow-md' :
              'bg-muted text-muted-foreground'
            }`}>
              {step > i + 1 ? <CheckCircle className="h-4 w-4" /> : i + 1}
            </div>
            {i < 2 && <div className={`h-0.5 w-6 sm:w-10 rounded-full transition-all ${step > i + 1 ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        ))}
        <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">{stepLabels[step - 1]}</span>
      </div>

      {/* Step 1: Find Product */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Camera scan - hero action on mobile */}
          <button
            onClick={openCamera}
            className="w-full bg-card rounded-2xl border-2 border-dashed border-primary/30 p-8 flex flex-col items-center gap-3 hover:border-primary/60 hover:bg-primary/5 transition-all active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
              <ScanLine className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Scan Barcode</p>
              <p className="text-xs text-muted-foreground mt-0.5">Use camera to scan product barcode</p>
            </div>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground uppercase tracking-wider">or search</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search product name..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="pl-10 rounded-2xl h-12"
            />
          </div>

          {suggestions.length > 0 && (
            <div className="bg-card rounded-2xl border shadow-soft overflow-hidden divide-y">
              {suggestions.map((p, i) => (
                <button key={i} onClick={() => selectProduct(p)}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 active:bg-muted transition-colors">
                  <p className="font-medium text-sm text-foreground">{p.product_name || p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.brand} · {p.unit}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Dates */}
      {step === 2 && selectedProduct && (
        <div className="space-y-4">
          {/* Product chip */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/20">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ScanLine className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{selectedProduct.product_name || selectedProduct.name}</p>
              <p className="text-xs text-muted-foreground">{selectedProduct.brand} · {selectedProduct.unit}</p>
            </div>
          </div>

          {/* Live camera date scanner button */}
          <button
            onClick={openDateCamera}
            className="w-full bg-card rounded-2xl border p-4 flex items-center gap-3 hover:bg-muted/50 active:bg-muted transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm text-foreground">Scan Dates with Camera</p>
              <p className="text-xs text-muted-foreground">Live OCR — point at MFD/EXP on package</p>
            </div>
          </button>

          {/* Date inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">MFD Date</Label>
              <Input type="date" value={mfdDate} onChange={e => setMfdDate(e.target.value)} className="rounded-xl h-11 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Expiry Date</Label>
              <Input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="rounded-xl h-11 text-sm" />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl flex-1 h-11" onClick={() => setStep(1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button className="rounded-xl flex-1 h-11 gradient-primary text-primary-foreground" onClick={() => setStep(3)}
              disabled={!mfdDate || !expiryDate}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Quantity</Label>
              <Input type="number" placeholder="e.g. 24" value={quantity}
                onChange={e => setQuantity(e.target.value)} className="rounded-xl h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Purchase Price (₹)</Label>
                <Input type="number" placeholder="₹" value={purchasePrice}
                  onChange={e => setPurchasePrice(e.target.value)} className="rounded-xl h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Selling Price (₹)</Label>
                <Input type="number" placeholder="₹" value={sellingPrice}
                  onChange={e => setSellingPrice(e.target.value)} className="rounded-xl h-11" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl flex-1 h-11" onClick={() => setStep(2)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button className="rounded-xl flex-1 h-11 gradient-primary text-primary-foreground" onClick={addBatch}>
              <Plus className="h-4 w-4 mr-1" /> Add Batch
            </Button>
          </div>
        </div>
      )}

      {/* Batch queue */}
      {batches.length > 0 && (
        <div className="bg-card rounded-2xl p-4 shadow-soft border space-y-3">
          <h3 className="font-semibold text-sm text-foreground">Queue ({batches.length})</h3>
          <div className="space-y-2">
            {batches.map((b, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{b.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {b.quantity} · ₹{b.purchase_price} → ₹{b.selling_price}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {b.mfd_date} — {b.expiry_date}
                  </p>
                </div>
                <button onClick={() => removeBatch(i)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg shrink-0">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <Button
            className="w-full rounded-xl h-12 gradient-primary text-primary-foreground font-semibold"
            onClick={submitAll} disabled={submitting}
          >
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            {submitting ? 'Saving...' : `Save ${batches.length} Batch(es)`}
          </Button>
        </div>
      )}
    </div>
  );
}
