import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/context/QuoteContext';
import {
  Trash2, Plus, Minus, Send, ArrowRight, ShoppingCart,
  CheckCircle2, Package, User, Building2, Mail, Phone,
  MapPin, MessageSquare, Truck, CreditCard, ImagePlus, Loader2, Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { submitQuote } from '@/lib/firestore-services';
import { uploadToCloudinary } from '@/lib/cloudinary-services';

import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const STEPS = ['Review Cart', 'Your Details', 'Logistics & Payment'];

const RequestQuote = () => {
  const { items, removeItem, updateQuantity, clearCart, itemCount } = useQuote();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [slipUploading, setSlipUploading] = useState(false);

  const [form, setForm] = useState({
    name: profile?.displayName || '',
    company: profile?.company || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    country: '', state: '', city: '', message: '',
    logisticsType: 'Avon Delivery' as 'Pickup' | 'Courier' | 'Avon Delivery',
    bankSlipUrl: ''
  });

  // Calculate Subtotals
  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  };
  const cartTotal = calculateTotal();

  useState(() => {
    if (profile) {
      setForm(prev => ({
        ...prev,
        name: profile.displayName || prev.name,
        company: profile.company || prev.company,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone
      }));
    }
  });

  const handleBankSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlipUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm(prev => ({ ...prev, bankSlipUrl: url }));
      toast.success('Bank slip uploaded successfully');
    } catch {
      toast.error('Failed to upload bank slip');
    } finally {
      setSlipUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Please add at least one product to your order cart.');
      return;
    }
    
    // Strict COD Validation Rules
    if (form.logisticsType !== 'Courier' && !form.bankSlipUrl) {
      toast.error('Payment Slip required via Bank Deposit for this delivery method.');
      return;
    }

    // Required Contact Details
    if (!form.name || !form.email || !form.phone) {
      toast.error('Name, Email, and Phone number are required to submit an order.');
      return;
    }

    setLoading(true);
    try {
      await submitQuote({
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone,
        country: form.country,
        state: form.state,
        city: form.city,
        message: form.message,
        logisticsType: form.logisticsType,
        bankSlipUrl: form.bankSlipUrl,
        userId: user?.uid,
        products: items.map(item => ({
          id: item.productId,
          name: item.name,
          brand: item.brand,
          model: item.model,
          quantity: item.quantity,
          variantId: item.variantId,
          variantLabel: item.variantLabel,
          price: item.price
        })),
      });
      
      // Dispatch Branded Email Confirmations via local microservice
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/quote';
        await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            company: form.company,
            email: form.email,
            phone: form.phone,
            country: form.country,
            state: form.state,
            city: form.city,
            message: form.message,
            logisticsType: form.logisticsType,
            bankSlipUrl: form.bankSlipUrl,
            products: items
          })
        });
      } catch (err) {
        console.error('Email dispatch microservice offline or errored', err);
      }

      clearCart();
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Success Screen ───────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-3 tracking-tight">Order Request Placed!</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Thank you for choosing Avon Pharmo Chem. Our team will review your order requirements along with your bank slip and confirm the processing within <strong>24 hours</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/products">
              <Button variant="accent" className="h-12 px-8 font-bold">Continue Shopping</Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="h-12 px-8 font-bold text-muted-foreground border-border/60">Go to Homepage</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Page ────────────────────────────────────────────────────────
  return (
    <div className="bg-muted/10 min-h-screen pb-20">
      {/* Hero */}
      <section className="bg-primary/95 text-primary-foreground py-14 shadow-inner relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/20 to-transparent"></div>
        <div className="container-main text-center relative z-10">
          <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight">Checkout & Logistics</h1>
          <p className="text-primary-foreground/80 font-medium text-lg max-w-2xl mx-auto">Review your selected products, verify your details, select your preferred delivery method, and attach your bank slip.</p>
        </div>
      </section>

      {/* Step Indicator */}
      <div className="border-b bg-card sticky top-16 lg:top-20 z-30 shadow-sm">
        <div className="container-main py-4">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
               <div key={s} className="flex items-center gap-2">
                <button
                  onClick={() => step > i && setStep(i)}
                  className={`flex items-center gap-2 text-sm font-bold transition-colors ${i === step ? 'text-primary' : i < step ? 'text-primary/70 cursor-pointer' : 'text-muted-foreground cursor-default'}`}
                >
                  <span className={`h-7 w-7 rounded-full text-xs flex items-center justify-center font-black transition-all ${i === step ? 'bg-primary text-primary-foreground scale-110 shadow-md' : i < step ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {i < step ? '✓' : i + 1}
                  </span>
                  <span className="hidden sm:block">{s}</span>
                </button>
                {i < STEPS.length - 1 && <div className={`h-0.5 w-8 sm:w-16 rounded-full ${i < step ? 'bg-primary/40' : 'bg-muted/50'}`} />}
              </div>
            ))}
            <div className="ml-auto flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-bold text-foreground">{itemCount} items</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-main py-10">

        {/* ── STEP 0: Review Products ── */}
        {step === 0 && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-foreground mb-6">Review Your Cart</h2>

            {items.length === 0 ? (
              <div className="bg-card border rounded-3xl p-16 text-center shadow-sm">
                <div className="h-24 w-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Package className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No products selected</h3>
                <p className="text-muted-foreground mb-8">Browse our catalog and click "Add to Quote" on products you need pricing for.</p>
                <Link to="/products">
                  <Button variant="accent" size="lg" className="font-bold px-8">Browse Products <ArrowRight className="h-4 w-4 ml-2" /></Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="bg-card border rounded-3xl overflow-hidden mb-6 shadow-sm">
                  {/* Table header */}
                  <div className="hidden sm:grid grid-cols-[1fr_120px_140px_48px] gap-4 px-6 py-4 bg-muted/40 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b">
                    <span>Product Details</span>
                    <span className="text-right">Unit Price</span>
                    <span className="text-center">Quantity</span>
                    <span></span>
                  </div>

                  {/* Rows */}
                  <div className="divide-y relative">
                    {items.map((item, idx) => (
                      <div key={item.id} className="grid sm:grid-cols-[1fr_120px_140px_48px] gap-4 px-6 py-5 items-center hover:bg-muted/20 transition-colors">
                        {/* Product */}
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="text-muted-foreground text-sm font-black w-4 hidden sm:block">{idx + 1}</span>
                          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-muted to-muted/50 border flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover mix-blend-multiply" />
                            ) : (
                              <Package className="h-6 w-6 text-muted-foreground/20" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground text-sm sm:text-base leading-snug line-clamp-2">{item.name}</p>
                            <div className="flex flex-wrap gap-1.5 mt-1.5 items-center text-xs">
                               <span className="bg-muted px-2 py-0.5 rounded font-bold text-muted-foreground">{item.brand}</span>
                               <span className="bg-muted px-2 py-0.5 rounded font-bold text-muted-foreground">{item.model}</span>
                               {item.variantLabel && (
                                 <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-black tracking-wide">
                                   {item.variantLabel}
                                 </span>
                               )}
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="hidden sm:flex items-center justify-end font-black text-base text-foreground">
                           {item.price ? `Rs. ${item.price.toFixed(2)}` : 'TBD'}
                        </div>

                        {/* Qty */}
                        <div className="flex items-center sm:justify-center justify-between gap-1 w-full sm:w-auto mt-4 sm:mt-0">
                          <span className="sm:hidden text-xs font-bold text-muted-foreground uppercase tracking-widest">Qty</span>
                          <div className="flex items-center gap-1.5 bg-background border rounded-lg p-1 shadow-sm">
                            <button
                              onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                              className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={e => {
                                const v = parseInt(e.target.value);
                                if (v > 0) updateQuantity(item.id, v);
                              }}
                              className="w-10 text-center text-sm font-black bg-transparent border-0 focus:outline-none text-foreground"
                            />
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="h-9 w-9 bg-card rounded-md border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-colors absolute top-4 sm:static right-4 sm:right-auto sm:mx-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Summary row */}
                  <div className="px-6 py-6 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button onClick={clearCart} className="text-xs font-bold text-muted-foreground hover:text-destructive transition-colors">
                      Empty Cart
                    </button>
                    <div className="text-right flex items-center gap-6">
                      <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        Total Items: <span className="text-foreground ml-1">{itemCount}</span>
                      </div>
                      <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        Est. Subtotal: <span className="text-2xl font-black text-foreground ml-2 tracking-tight">Rs. {cartTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-8">
                  <Link to="/products">
                    <Button variant="outline" className="h-12 font-bold px-6 border-border/60 hover:bg-background"><ArrowRight className="h-4 w-4 rotate-180 mr-2" />Continue Shopping</Button>
                  </Link>
                  <Button variant="accent" onClick={() => setStep(1)} className="h-12 px-8 font-bold shadow-md">
                    Next: Your Details <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── STEP 1: Your Details ── */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
             <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: mini summary */}
              <div className="lg:col-span-1">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b pb-3 mb-4">Cart Summary</h3>
                <div className="bg-card border rounded-2xl p-2 shadow-sm space-y-1">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="h-10 w-10 rounded-lg bg-muted border flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <Package className="h-4 w-4 text-muted-foreground/30"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.brand} {item.variantLabel && <span className="text-primary font-bold">· {item.variantLabel}</span>}</p>
                      </div>
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded flex-shrink-0">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-muted/30 border rounded-2xl p-4 flex justify-between items-center shadow-sm">
                   <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Est. Total</span>
                   <span className="font-black text-lg text-foreground">Rs. {cartTotal.toFixed(2)}</span>
                </div>
                <button onClick={() => setStep(0)} className="text-[11px] font-bold text-muted-foreground hover:text-foreground mt-4 block uppercase tracking-widest transition-colors"><ArrowRight className="w-3 h-3 inline rotate-180 mr-1"/> Edit Selection</button>
              </div>

              {/* Right: form */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-black text-foreground mb-6">Contact & Shipping Details</h2>
                
                  <>
                    <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                           <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name *</label>
                           <div className="relative">
                             <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                             <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                               className="w-full pl-10 pr-4 py-3 bg-muted/30 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all" />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Company / Organization *</label>
                           <div className="relative">
                             <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                             <input type="text" required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                               className="w-full pl-10 pr-4 py-3 bg-muted/30 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all" />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address *</label>
                           <div className="relative">
                             <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                             <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                               className="w-full pl-10 pr-4 py-3 bg-muted/30 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all" />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone Number *</label>
                           <div className="relative">
                             <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                             <input type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                               className="w-full pl-10 pr-4 py-3 bg-muted/30 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all" />
                           </div>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-5 pt-2">
                        <div className="space-y-1.5">
                           <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Country</label>
                           <div className="relative">
                             <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                             <input type="text" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
                               className="w-full pl-10 pr-4 py-3 bg-muted/30 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all" />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">State / Province</label>
                           <input type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
                             className="w-full px-4 py-3 bg-muted/30 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">City</label>
                           <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                             className="w-full px-4 py-3 bg-muted/30 border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-8">
                      <Button variant="outline" onClick={() => setStep(0)} className="h-12 font-bold px-6">
                        <ArrowRight className="h-4 w-4 rotate-180 mr-2" /> Back
                      </Button>
                      <Button
                        onClick={() => {
                          if (!form.name || !form.company || !form.email || !form.phone) {
                            toast.error('Please fill in all required (*) fields (Name, Company, Email, Phone).');
                            return;
                          }
                          setStep(2);
                        }}
                        variant="accent"
                        className="h-12 px-8 text-base font-bold shadow-md"
                      >
                        Next: Logistics & Payment <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Logistics & Payment ── */}
        {step === 2 && (
           <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-2xl font-black text-foreground mb-6">Logistics & Finalization</h2>
              
              <div className="bg-card border rounded-3xl p-6 sm:p-8 shadow-sm space-y-10">
                 
                 {/* Logistics Tier Selection */}
                 <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
                       <Truck className="h-4 w-4"/> 3-Tier Logistics Selection
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                       {[
                         { id: 'Pickup', title: 'Store Pickup', desc: 'Collect directly from our main warehouse' },
                         { id: 'Courier', title: 'Local Courier', desc: 'Fast delivery via local dispatch services' },
                         { id: 'Avon Delivery', title: 'Avon Premium Delivery', desc: 'Secure transit with our dedicated fleet' }
                       ].map((tier) => (
                          <div 
                            key={tier.id}
                            onClick={() => setForm({...form, logisticsType: tier.id as any})}
                            className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                              form.logisticsType === tier.id 
                                ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20' 
                                : 'bg-background hover:border-border/80 hover:bg-muted/30'
                            }`}
                          >
                             <div className="flex items-center justify-between mb-2">
                                <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                                  form.logisticsType === tier.id ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                                }`}>
                                   {form.logisticsType === tier.id && <span className="h-1.5 w-1.5 bg-background rounded-full" />}
                                </span>
                             </div>
                             <h4 className={`font-bold text-sm mb-1 ${form.logisticsType === tier.id ? 'text-primary' : 'text-foreground'}`}>{tier.title}</h4>
                             <p className="text-xs text-muted-foreground leading-tight">{tier.desc}</p>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Bank Slip Upload */}
                 <div>
                     <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2">
                        <Receipt className="h-4 w-4"/> Payment Slip 
                        {form.logisticsType === 'Courier' ? (
                           <span className="text-emerald-500 font-black normal-case tracking-normal text-[10px] ml-1 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded">(Optional / COD Applicable)</span>
                        ) : (
                           <span className="text-destructive font-black normal-case tracking-normal text-[10px] ml-1 border border-destructive/20 bg-destructive/10 px-2 py-0.5 rounded">* Required</span>
                        )}
                     </h3>
                    <div className="bg-muted/20 border border-dashed rounded-2xl p-6 text-center">
                       {form.bankSlipUrl ? (
                          <div className="flex flex-col items-center justify-center space-y-3">
                             <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500"/>
                             </div>
                             <div>
                                <p className="text-sm font-bold text-foreground">Slip Attached successfully!</p>
                                <button type="button" onClick={() => setForm({...form, bankSlipUrl: ''})} className="text-xs text-destructive hover:underline mt-1">Remove file</button>
                             </div>
                          </div>
                       ) : (
                          <>
                             <div className="mx-auto w-12 h-12 bg-background rounded-full flex items-center justify-center border shadow-sm mb-3">
                                {slipUploading ? <Loader2 className="h-5 w-5 text-primary animate-spin" /> : <ImagePlus className="h-5 w-5 text-muted-foreground"/>}
                             </div>
                             <p className="text-sm font-medium text-foreground mb-1">Upload Receipt</p>
                             <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">Please attach proof of payment/bank slip to accelerate processing</p>
                             <label className={`inline-flex items-center justify-center bg-primary text-primary-foreground text-sm font-bold px-6 py-2.5 rounded-xl cursor-pointer hover:bg-primary/90 transition-colors shadow-sm ${slipUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {slipUploading ? 'Uploading...' : 'Browse File'}
                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleBankSlipUpload} disabled={slipUploading} />
                             </label>
                          </>
                       )}
                    </div>
                 </div>

                 {/* Order Notes */}
                 <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
                       <MessageSquare className="h-4 w-4"/> Additional Requirements
                    </h3>
                     <textarea
                        placeholder="Any special instructions or reference notes... (optional)"
                        rows={3}
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        className="w-full px-4 py-3 bg-muted/30 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-background transition-all resize-none"
                      />
                 </div>

                 {/* Final Totals & Submit */}
                 <div className="border-t pt-8 mt-8 flex flex-col items-center">
                    <div className="text-center mb-6">
                       <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Grand Total</p>
                       <p className="text-4xl font-black text-foreground tracking-tight">Rs. {cartTotal.toFixed(2)}</p>
                    </div>
                    <Button
                      onClick={handleSubmit}
                      variant="accent"
                      className="w-full h-14 text-lg font-black shadow-lg hover:-translate-y-0.5 transition-all"
                      disabled={loading || slipUploading}
                    >
                      {loading ? (
                        <><Loader2 className="animate-spin h-5 w-5 mr-3" />Processing...</>
                      ) : (
                        <><Send className="h-5 w-5 mr-3" />Place Order Now</>
                      )}
                    </Button>
                    <button onClick={() => setStep(1)} disabled={loading} className="text-xs font-bold text-muted-foreground hover:text-foreground mt-4 uppercase tracking-widest transition-colors"><ArrowRight className="w-3 h-3 inline rotate-180 mr-1"/> Back to Details</button>
                 </div>

              </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default RequestQuote;
