import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/context/QuoteContext';
import {
  Trash2, Plus, Minus, Send, ArrowRight, ShoppingCart,
  CheckCircle2, Package, User, Building2, Mail, Phone,
  MapPin, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { submitQuote } from '@/lib/firestore-services';

const STEPS = ['Review Products', 'Your Details', 'Confirm'];

const RequestQuote = () => {
  const { items, removeItem, updateQuantity, clearCart, itemCount } = useQuote();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '',
    country: '', state: '', city: '', message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Please add at least one product to your quote cart.');
      return;
    }
    setLoading(true);
    try {
      await submitQuote({
        ...form,
        products: items.map(item => ({
          id: item.id,
          name: item.name,
          brand: item.brand,
          model: item.model,
          quantity: item.quantity,
        })),
      });
      clearCart();
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Success Screen ───────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Quote Request Submitted!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you! Our team will review your request and get back to you with a competitive quotation within <strong>24 business hours</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/products">
              <Button variant="accent">Continue Shopping</Button>
            </Link>
            <Link to="/">
              <Button variant="outline">Go to Homepage</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Page ────────────────────────────────────────────────────────
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-12">
        <div className="container-main text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-2">Request a Quotation</h1>
          <p className="text-primary-foreground/70 text-sm">Review your selected products, then fill in your details to get competitive pricing.</p>
        </div>
      </section>

      {/* Step Indicator */}
      <div className="border-b bg-card sticky top-16 lg:top-20 z-30">
        <div className="container-main py-3">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <button
                  onClick={() => step > i && setStep(i)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${i === step ? 'text-primary' : i < step ? 'text-primary/70 cursor-pointer' : 'text-muted-foreground cursor-default'}`}
                >
                  <span className={`h-6 w-6 rounded-full text-xs flex items-center justify-center font-bold ${i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {i < step ? '✓' : i + 1}
                  </span>
                  <span className="hidden sm:block">{s}</span>
                </button>
                {i < STEPS.length - 1 && <div className={`h-px w-8 sm:w-16 ${i < step ? 'bg-primary/40' : 'bg-border'}`} />}
              </div>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">{itemCount} items</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-main py-8">

        {/* ── STEP 0: Review Products ── */}
        {step === 0 && (
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Review Your Products</h2>

            {items.length === 0 ? (
              <div className="bg-card border rounded-2xl p-16 text-center">
                <Package className="h-14 w-14 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No products selected</h3>
                <p className="text-muted-foreground text-sm mb-6">Browse our catalog and click "Add to Quote" on products you need pricing for.</p>
                <Link to="/products">
                  <Button variant="accent">Browse Products <ArrowRight className="h-4 w-4 ml-2" /></Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Product table */}
                <div className="bg-card border rounded-2xl overflow-hidden mb-6">
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_140px_48px] gap-4 px-6 py-3 bg-muted text-xs font-semibold text-muted-foreground border-b">
                    <span>Product Details</span>
                    <span className="text-center">Quantity</span>
                    <span></span>
                  </div>

                  {/* Rows */}
                  <div className="divide-y">
                    {items.map((item, idx) => (
                      <div key={item.id} className="grid grid-cols-[1fr_140px_48px] gap-4 px-6 py-4 items-center hover:bg-muted/30 transition-colors">
                        {/* Product */}
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="text-muted-foreground text-sm font-medium w-5 flex-shrink-0">{idx + 1}</span>
                          <div className="h-14 w-14 rounded-xl bg-muted border overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-2xl">📦</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2">{item.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.brand}</p>
                            <p className="text-xs text-muted-foreground">Model: {item.model}</p>
                          </div>
                        </div>

                        {/* Qty */}
                        <div className="flex items-center justify-center gap-1">
                          <div className="flex items-center gap-2 bg-background border rounded-xl px-2 py-2">
                            <button
                              onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                              className="h-6 w-6 rounded-md flex items-center justify-center bg-muted hover:bg-muted/70 transition-colors"
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
                              className="w-10 text-center text-sm font-bold bg-transparent border-0 focus:outline-none text-foreground"
                            />
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-6 w-6 rounded-md flex items-center justify-center bg-muted hover:bg-muted/70 transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors mx-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Summary row */}
                  <div className="px-6 py-4 border-t bg-muted/40 flex items-center justify-between">
                    <button onClick={clearCart} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                      Clear all items
                    </button>
                    <div className="text-sm font-semibold text-foreground">
                      Total items: <span className="text-primary">{itemCount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Link to="/products">
                    <Button variant="outline"><ArrowRight className="h-4 w-4 rotate-180 mr-2" />Continue Shopping</Button>
                  </Link>
                  <Button variant="accent" onClick={() => setStep(1)} className="h-12 px-8">
                    Next: Your Details <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── STEP 1: Your Details ── */}
        {step === 1 && (
          <div>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: mini product summary */}
              <div className="lg:col-span-1">
                <h3 className="text-base font-bold text-foreground mb-3">Your Selection ({items.length})</h3>
                <div className="bg-card border rounded-2xl divide-y">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="h-10 w-10 rounded-lg bg-muted border flex-shrink-0 overflow-hidden">
                        {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-lg">📦</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.brand}</p>
                      </div>
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex-shrink-0">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep(0)} className="text-xs text-primary hover:underline mt-3 block">← Edit products</button>
              </div>

              {/* Right: form */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-foreground mb-4">Your Contact Details</h2>
                <form id="quote-form" onSubmit={handleSubmit} className="bg-card border rounded-2xl p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" placeholder="Full Name *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    </div>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" placeholder="Company / Organisation *" required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="email" placeholder="Email Address *" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="tel" placeholder="Phone Number *" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input type="text" placeholder="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    </div>
                    <input type="text" placeholder="State / Province" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
                      className="w-full px-4 py-3 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    <input type="text" placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                      className="w-full px-4 py-3 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  </div>

                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <textarea
                      placeholder="Additional requirements, specifications, or questions... (optional)"
                      rows={4}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-background border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    />
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-muted-foreground">
                    <p>🔒 Your information is kept confidential and will only be used to prepare your quotation. We typically respond within <strong className="text-foreground">24 business hours</strong>.</p>
                  </div>
                </form>

                <div className="flex items-center justify-between mt-4">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    <ArrowRight className="h-4 w-4 rotate-180 mr-2" /> Back
                  </Button>
                  <Button
                    type="submit"
                    form="quote-form"
                    variant="accent"
                    className="h-12 px-8 text-base"
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className="animate-spin mr-2">⏳</span>Submitting...</>
                    ) : (
                      <><Send className="h-4 w-4 mr-2" />Submit Quotation Request</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestQuote;
