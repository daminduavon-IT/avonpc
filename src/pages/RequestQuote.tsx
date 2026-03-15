import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/context/QuoteContext';
import { Trash2, Plus, Minus, Send, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { submitQuote } from '@/lib/firestore-services';

const RequestQuote = () => {
  const { items, removeItem, updateQuantity, clearCart } = useQuote();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '', country: '', state: '', city: '', message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      toast.success('Your quotation request has been submitted successfully! Our team will contact you within 24 hours.');
      clearCart();
      setForm({ name: '', company: '', email: '', phone: '', country: '', state: '', city: '', message: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="bg-primary py-16 lg:py-20">
        <div className="container-main text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">Request a Quotation</h1>
          <p className="text-primary-foreground/70">Fill in the form below and our team will provide you with competitive pricing.</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-main">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Product Summary */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-bold text-foreground mb-4">Selected Products ({items.length})</h2>
              {items.length === 0 ? (
                <div className="bg-card border rounded-xl p-6 text-center">
                  <p className="text-muted-foreground text-sm mb-4">No products selected yet.</p>
                  <Link to="/products"><Button variant="outline" size="sm">Browse Products <ArrowRight className="h-3 w-3" /></Button></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="bg-card border rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.brand} • {item.model}</p>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-destructive p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Qty:</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-0.5 rounded hover:bg-muted">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-0.5 rounded hover:bg-muted">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quote Form */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-bold text-foreground mb-4">Your Details</h2>
              <form onSubmit={handleSubmit} className="bg-card border rounded-xl p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Full Name *" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <input type="text" placeholder="Company Name *" required value={form.company} onChange={e => setForm({...form, company: e.target.value})}
                    className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input type="email" placeholder="Email *" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <input type="tel" placeholder="Phone *" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <input type="text" placeholder="Country" value={form.country} onChange={e => setForm({...form, country: e.target.value})}
                    className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <input type="text" placeholder="State" value={form.state} onChange={e => setForm({...form, state: e.target.value})}
                    className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <input type="text" placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                    className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <textarea placeholder="Additional requirements or message" rows={4} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                  className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">📎 Attachment (optional)</p>
                  <p>Upload a document with your detailed requirements. (Feature coming soon)</p>
                </div>
                <Button type="submit" variant="accent" size="lg" className="w-full sm:w-auto" disabled={loading}>
                  <Send className="h-4 w-4" /> {loading ? 'Submitting...' : 'Submit Quotation Request'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  By submitting this form, you agree to our terms. We typically respond within 24 business hours.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RequestQuote;
