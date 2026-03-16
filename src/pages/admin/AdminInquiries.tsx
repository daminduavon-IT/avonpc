import { useState, useEffect } from 'react';
import { Mail, Loader2, MessageSquare, Calendar, User, Phone, Building2, Trash2 } from 'lucide-react';
import { getInquiries, ContactInquiry } from '@/lib/firestore-services';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getInquiries();
        setInquiries(data);
      } catch (err) {
        toast.error('Failed to load inquiries');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contact Inquiries</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage general messages submitted via the contact form</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Inquiry List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="p-4 border-b bg-muted/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Inquiries</h3>
            </div>
            <div className="divide-y max-h-[calc(100vh-250px)] overflow-y-auto">
              {loading ? (
                <div className="p-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : inquiries.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No inquiries found.</div>
              ) : (
                inquiries.map((iq) => (
                  <button
                    key={iq.id}
                    onClick={() => setSelectedInquiry(iq)}
                    className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${selectedInquiry?.id === iq.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-foreground truncate mr-2">{iq.name}</span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {iq.createdAt?.toDate ? format(iq.createdAt.toDate(), 'MMM d') : 'Recent'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{iq.company || 'Private Individual'}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 italic">"{iq.message}"</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Inquiry Detail */}
        <div className="lg:col-span-2">
          {selectedInquiry ? (
            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
              <div className="p-6 border-b flex justify-between items-center bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedInquiry.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedInquiry.company || 'General Inquiry'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.location.href = `mailto:${selectedInquiry.email}`}>
                    <Mail className="h-4 w-4 mr-2" /> Reply
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-8 flex-1">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Email Address</p>
                        <p className="text-sm font-medium">{selectedInquiry.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Phone Number</p>
                        <p className="text-sm font-medium">{selectedInquiry.phone || '—'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Company</p>
                        <p className="text-sm font-medium">{selectedInquiry.company || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Submitted On</p>
                        <p className="text-sm font-medium">
                          {selectedInquiry.createdAt?.toDate ? format(selectedInquiry.createdAt.toDate(), 'PPP p') : 'Recent'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-6 border">
                  <div className="flex items-center gap-2 mb-4 border-b pb-2 border-muted">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-sm">Inquiry Message</h3>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted/50 border-t flex justify-end">
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Inquiry (Archive)
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-dashed rounded-2xl h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <Mail className="h-10 w-10 opacity-20" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">No Inquiry Selected</h3>
              <p className="max-w-xs text-sm">Select an inquiry from the side list to view full details and contact information.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInquiries;
