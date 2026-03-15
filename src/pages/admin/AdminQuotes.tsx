import { useEffect, useState } from 'react';
import { Eye, MessageSquare } from 'lucide-react';
import { getQuotes, updateQuoteStatus, QuoteRequest } from '@/lib/firestore-services';
import { toast } from 'sonner';

const statusColor: Record<string, string> = {
  'New': 'bg-accent/10 text-accent',
  'In Review': 'bg-primary/10 text-primary',
  'Quotation Sent': 'bg-primary/10 text-primary',
  'Follow Up': 'bg-accent/10 text-accent',
  'Closed': 'bg-muted text-muted-foreground',
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
      setQuotes(data);
    } catch (err) {
      console.error('Error loading quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: QuoteRequest['status']) => {
    try {
      await updateQuoteStatus(id, status);
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, status } : q));
      toast.success(`Status updated to "${status}"`);
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Quote Request Management</h1>

      {loading ? (
        <p className="text-muted-foreground">Loading quotes...</p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Company</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Products</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">View</th>
                </tr>
              </thead>
              <tbody>
                {quotes.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No quote requests yet.</td></tr>
                ) : (
                  quotes.map(q => (
                    <tr key={q.id} className={`border-b last:border-0 hover:bg-muted/50 cursor-pointer ${selected === q.id ? 'bg-muted' : ''}`} onClick={() => setSelected(q.id!)}>
                      <td className="px-4 py-3 font-medium text-foreground">{q.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{q.company}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[q.status]}`}>{q.status}</span></td>
                      <td className="px-4 py-3 text-muted-foreground">{q.products?.length || 0}</td>
                      <td className="px-4 py-3"><Eye className="h-4 w-4 text-muted-foreground" /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          <div className="bg-card border rounded-xl p-5">
            {selectedQuote ? (
              <div>
                <h3 className="font-bold text-foreground mb-3">{selectedQuote.name}</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Company:</span> <span className="text-foreground">{selectedQuote.company}</span></p>
                  <p><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{selectedQuote.email}</span></p>
                  <p><span className="text-muted-foreground">Phone:</span> <span className="text-foreground">{selectedQuote.phone}</span></p>
                  <p><span className="text-muted-foreground">Location:</span> <span className="text-foreground">{[selectedQuote.city, selectedQuote.state, selectedQuote.country].filter(Boolean).join(', ') || '—'}</span></p>

                  {/* Status changer */}
                  <div className="pt-2">
                    <label className="text-muted-foreground text-xs block mb-1">Update Status</label>
                    <select
                      value={selectedQuote.status}
                      onChange={e => handleStatusChange(selectedQuote.id!, e.target.value as QuoteRequest['status'])}
                      className="w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Products */}
                  {selectedQuote.products && selectedQuote.products.length > 0 && (
                    <div className="pt-3 border-t mt-3">
                      <p className="text-muted-foreground text-xs mb-2">Requested Products</p>
                      {selectedQuote.products.map((p, i) => (
                        <div key={i} className="flex justify-between text-xs py-1 border-b last:border-0">
                          <span className="text-foreground">{p.name}</span>
                          <span className="text-muted-foreground">x{p.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedQuote.message && (
                    <div className="pt-3 border-t mt-3">
                      <p className="text-muted-foreground flex items-center gap-1 mb-1"><MessageSquare className="h-3 w-3" /> Message</p>
                      <p className="text-foreground">{selectedQuote.message}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">Select a quote request to view details</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuotes;
