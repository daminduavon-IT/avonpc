import { useEffect, useState } from 'react';
import { Eye, MessageSquare, ExternalLink, Receipt, Truck, FileText } from 'lucide-react';
import { getQuotes, updateQuoteStatus, QuoteRequest } from '@/lib/firestore-services';
import { toast } from 'sonner';

const statusColor: Record<string, string> = {
  'New': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'In Review': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Quotation Sent': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Follow Up': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'Closed': 'bg-muted text-muted-foreground border-border',
};

const statusOptions: QuoteRequest['status'][] = ['New', 'In Review', 'Quotation Sent', 'Follow Up', 'Closed'];

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedQuote = quotes.find(q => q.id === selected);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const data = await getQuotes();
      // Sort by newest first
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
      setQuotes(data);
    } catch (err) {
      console.error('Error loading quotes:', err);
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: QuoteRequest['status']) => {
    try {
      await updateQuoteStatus(id, status);
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
      toast.success(`Order status updated to "${status}"`);
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const calculateTotal = (products: QuoteRequest['products']) => {
    if (!products) return 0;
    return products.reduce((acc, p) => acc + (p.price || 0) * p.quantity, 0);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6 tracking-tight">Orders & Quote Requests</h1>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <span className="animate-spin text-primary">⏳</span> Loading orders...
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 uppercase tracking-widest text-[10px] text-muted-foreground">
                  <th className="text-left px-5 py-4 font-black">Date</th>
                  <th className="text-left px-5 py-4 font-black">Customer</th>
                  <th className="text-left px-5 py-4 font-black">Total</th>
                  <th className="text-left px-5 py-4 font-black">Status</th>
                  <th className="text-left px-5 py-4 font-black">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y relative">
                {quotes.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground italic">No orders or quote requests yet.</td></tr>
                ) : (
                  quotes.map(q => {
                     const total = calculateTotal(q.products);
                     const dateStr = q.createdAt ? q.createdAt.toDate().toLocaleDateString() : 'N/A';
                     const hasSlip = !!q.bankSlipUrl;
                     
                     return (
                        <tr 
                          key={q.id} 
                          className={`hover:bg-muted/30 cursor-pointer transition-colors ${selected === q.id ? 'bg-primary/5' : ''}`} 
                          onClick={() => setSelected(q.id!)}
                        >
                          <td className="px-5 py-4 font-medium text-muted-foreground text-xs">{dateStr}</td>
                          <td className="px-5 py-4">
                            <p className="font-bold text-foreground">{q.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{q.company}</p>
                          </td>
                          <td className="px-5 py-4 font-black text-foreground">
                            {total > 0 ? `Rs. ${total.toFixed(2)}` : 'TBD'}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded border text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${statusColor[q.status]}`}>
                              {q.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {hasSlip ? (
                                <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-emerald-500/20">
                                  <Receipt className="w-3 h-3"/> Paid
                                </span>
                              ) : (
                                <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[10px] font-bold border border-border">Quote</span>
                              )}
                            </div>
                          </td>
                        </tr>
                     )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-1 border rounded-2xl bg-card shadow-sm sticky top-24 h-[calc(100vh-120px)] overflow-y-auto">
            {selectedQuote ? (
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                   <div>
                     <h3 className="font-black text-xl text-foreground leading-tight">{selectedQuote.name}</h3>
                     <p className="text-xs font-bold text-accent uppercase tracking-widest mt-1">{selectedQuote.company}</p>
                   </div>
                </div>

                {/* Contact Info */}
                <div className="bg-muted/30 border rounded-xl p-4 space-y-2 text-sm mb-6">
                  <div className="flex justify-between items-center">
                     <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Email</span> 
                     <span className="text-foreground font-medium">{selectedQuote.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Phone</span> 
                     <span className="text-foreground font-medium">{selectedQuote.phone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Location</span> 
                     <span className="text-foreground font-medium text-right max-w-[150px] truncate">{[selectedQuote.city, selectedQuote.state, selectedQuote.country].filter(Boolean).join(', ') || '—'}</span>
                  </div>
                </div>

                {/* Status Changer */}
                <div className="mb-6">
                  <label className="text-muted-foreground text-[10px] uppercase font-black tracking-widest block mb-2">Order Lifecycle Pipeline</label>
                  <select
                    value={selectedQuote.status}
                    onChange={e => handleStatusChange(selectedQuote.id!, e.target.value as QuoteRequest['status'])}
                    className="w-full px-4 py-3 bg-muted/20 border-2 rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                  >
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Logistics & Payment Verification */}
                <div className="mb-6 space-y-3">
                   <h4 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground border-b pb-2">Fulfillment Details</h4>
                   
                   <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><Truck className="w-4 h-4"/> Logistics Tier</span>
                      <span className="text-sm font-black text-foreground">{selectedQuote.logisticsType || 'Standard/TBD'}</span>
                   </div>

                   {selectedQuote.bankSlipUrl ? (
                      <div className="flex items-center justify-between pt-2">
                         <span className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><Receipt className="w-4 h-4"/> Payment Slip</span>
                         <a 
                           href={selectedQuote.bankSlipUrl} 
                           target="_blank" 
                           rel="noreferrer"
                           className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-md text-xs font-black flex items-center gap-1.5 hover:bg-primary/20 transition-colors"
                         >
                            <ExternalLink className="w-3 h-3"/> View Receipt
                         </a>
                      </div>
                   ) : (
                      <div className="flex items-center justify-between pt-2">
                         <span className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><Receipt className="w-4 h-4"/> Payment Slip</span>
                         <span className="text-xs font-bold text-muted-foreground italic">No slip attached</span>
                      </div>
                   )}
                </div>

                {/* Products */}
                {selectedQuote.products && selectedQuote.products.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground border-b pb-2 mb-3">Line Items</h4>
                    <div className="space-y-3">
                      {selectedQuote.products.map((p, i) => (
                        <div key={i} className="flex justify-between items-start text-sm bg-muted/20 p-3 rounded-lg border">
                          <div className="pr-2">
                             <span className="text-foreground font-bold line-clamp-1">{p.name}</span>
                             <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                               <span className="text-[10px] text-muted-foreground font-bold uppercase">{p.model || 'N/A'}</span>
                               {p.variantLabel && (
                                 <span className="bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">
                                   {p.variantLabel}
                                 </span>
                               )}
                             </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                             <div className="font-black text-foreground">{p.price ? `Rs. ${(p.price * p.quantity).toFixed(2)}` : 'TBD'}</div>
                             <div className="text-xs text-muted-foreground font-bold">{p.quantity} x {p.price ? `Rs. ${p.price.toFixed(2)}` : 'TBD'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grand Total */}
                <div className="bg-foreground text-background rounded-xl p-4 flex items-center justify-between mb-6 shadow-md">
                   <span className="text-xs font-bold uppercase tracking-widest text-background/70">Grand Total</span>
                   <span className="text-2xl font-black">Rs. {calculateTotal(selectedQuote.products).toFixed(2)}</span>
                </div>

                {/* Messages */}
                {selectedQuote.message && (
                  <div>
                    <h4 className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1.5 border-b pb-2 mb-3">
                      <MessageSquare className="h-3.5 w-3.5" /> Customer Notes
                    </h4>
                    <p className="text-sm text-foreground bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl leading-relaxed">
                      {selectedQuote.message}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                 <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground/30" />
                 </div>
                 <h3 className="text-lg font-bold text-foreground">Select an Order</h3>
                 <p className="text-sm text-muted-foreground">Click on an order request from the list to view its complete fulfillment details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuotes;
