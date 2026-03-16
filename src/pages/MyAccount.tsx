import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { User, FileText, Clock, Settings, LogOut, ChevronRight, Package, Calendar, Loader2, MapPin, Building2, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useQuote } from '@/context/QuoteContext';
import { getUserQuotes, QuoteRequest } from '@/lib/firestore-services';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MyAccount = () => {
  const { user, profile, logout, updateProfile, loading: authLoading } = useAuth();
  const { items: cartItems } = useQuote();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'quotes' | 'saved' | 'settings'>('overview');
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    company: '',
    phone: ''
  });
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        displayName: profile.displayName || '',
        company: profile.company || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user && activeTab === 'quotes') {
      fetchQuotes();
    }
  }, [user, activeTab]);

  const fetchQuotes = async () => {
    if (!user) return;
    setLoadingQuotes(true);
    try {
      const data = await getUserQuotes(user.uid);
      setQuotes(data);
    } catch (err) {
      console.error('Error loading quotes:', err);
      toast.error('Failed to load quote history');
    } finally {
      setLoadingQuotes(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out.');
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please login to view your account.</p>
          <Link to="/login"><Button>Sign In</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <section className="bg-primary pt-16 pb-24">
        <div className="container-main">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary-foreground/10 flex items-center justify-center border border-primary-foreground/20">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary-foreground">Welcome back, {profile?.displayName || user.email}</h1>
                <p className="text-primary-foreground/70 text-sm mt-1">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </section>

      <section className="container-main -mt-12 pb-20">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Nav */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border p-2 sticky top-24">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'quotes', label: 'Quote History', icon: Clock },
                { id: 'saved', label: 'Saved Quotations', icon: FileText },
                { id: 'settings', label: 'Account Settings', icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground shadow-md font-medium' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                  {activeTab !== tab.id && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Requests</p>
                      <p className="text-xl font-bold">{quotes.length}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Saved Items</p>
                      <p className="text-xl font-bold">{cartItems.length}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Package className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Account Type</p>
                      <p className="text-xl font-bold capitalize">{profile?.role || 'Customer'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border p-8">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" /> Profile Details
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-y-6 gap-x-12">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</p>
                      <p className="font-medium text-lg">{profile?.displayName || 'Not provided'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</p>
                      <p className="font-medium text-lg">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Name</p>
                      <p className="font-medium text-lg">{profile?.company || 'Not provided'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</p>
                      <p className="font-medium text-lg">{profile?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'quotes' && (
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 border-b flex items-center justify-between">
                  <h3 className="text-lg font-bold">Quote Request History</h3>
                  <Button variant="ghost" size="sm" onClick={fetchQuotes} disabled={loadingQuotes}>
                    {loadingQuotes ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Clock className="h-4 w-4 mr-2" />} 
                    Refresh
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  {loadingQuotes ? (
                    <div className="p-20 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading your quotation history...</p>
                    </div>
                  ) : quotes.length === 0 ? (
                    <div className="p-20 text-center">
                      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h4 className="font-semibold text-lg mb-1">No quote requests yet</h4>
                      <p className="text-muted-foreground mb-6">Explore our products and request a quote to get started.</p>
                      <Link to="/products"><Button>Browse Products</Button></Link>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-muted-foreground font-medium">
                          <th className="text-left py-4 px-6">Request ID</th>
                          <th className="text-left py-4 px-6">Date</th>
                          <th className="text-left py-4 px-6">Items</th>
                          <th className="text-left py-4 px-6">Status</th>
                          <th className="text-right py-4 px-6">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotes.map((quote) => (
                          <tr key={quote.id} className="border-t hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-6 font-mono font-medium text-primary uppercase text-xs">
                              {quote.id?.substring(0, 8)}...
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {quote.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                              </div>
                            </td>
                            <td className="py-4 px-6 font-medium">
                              {quote.products.length} Products
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                                ${quote.status === 'New' ? 'bg-blue-100 text-blue-800' : ''}
                                ${quote.status === 'In Review' ? 'bg-amber-100 text-amber-800' : ''}
                                ${quote.status === 'Quotation Sent' ? 'bg-emerald-100 text-emerald-800' : ''}
                                ${quote.status === 'Closed' ? 'bg-slate-100 text-slate-800' : ''}
                                ${quote.status === 'Follow Up' ? 'bg-purple-100 text-purple-800' : ''}
                              `}>
                                {quote.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedQuote(quote);
                                  setIsDetailOpen(true);
                                }}
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="bg-white rounded-2xl shadow-sm border p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold">Saved Quotations</h3>
                    <p className="text-sm text-muted-foreground">Items currently in your quote cart</p>
                  </div>
                  <Link to="/products"><Button variant="outline" size="sm">Add More Items</Button></Link>
                </div>
                
                {cartItems.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h4 className="font-semibold text-lg mb-1">Your cart is empty</h4>
                    <p className="text-muted-foreground mb-6">Add products to your quote list to see them here.</p>
                    <Link to="/cart"><Button>Go to Quote Cart</Button></Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl border bg-slate-50/50">
                        <img src={item.image} alt={item.name} className="h-16 w-16 object-cover rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold truncate">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.brand} • {item.model}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <p className="font-bold text-lg">Ready to request a quote?</p>
                        <p className="text-sm text-muted-foreground">You have {cartItems.length} items ready for submission.</p>
                      </div>
                      <Link to="/cart"><Button className="w-full sm:w-auto">Submit Quote Request</Button></Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl shadow-sm border p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-bold mb-6">Profile Settings</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Full Name</Label>
                      <Input 
                        id="displayName" 
                        value={profileForm.displayName} 
                        onChange={e => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        value={user.email || ''} 
                        disabled 
                        className="bg-slate-50 opacity-70"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input 
                        id="company" 
                        value={profileForm.company} 
                        onChange={e => setProfileForm(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Organization Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={profileForm.phone} 
                        onChange={e => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+94 XX XXX XXXX"
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Member since: {profile?.createdAt?.toDate().toLocaleDateString()}</p>
                    <Button type="submit" disabled={savingProfile}>
                      {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quote Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">
              <span>Quote Request Details</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold
                ${selectedQuote?.status === 'New' ? 'bg-blue-100 text-blue-800' : ''}
                ${selectedQuote?.status === 'In Review' ? 'bg-amber-100 text-amber-800' : ''}
                ${selectedQuote?.status === 'Quotation Sent' ? 'bg-emerald-100 text-emerald-800' : ''}
                ${selectedQuote?.status === 'Closed' ? 'bg-slate-100 text-slate-800' : ''}
                ${selectedQuote?.status === 'Follow Up' ? 'bg-purple-100 text-purple-800' : ''}
              `}>
                {selectedQuote?.status}
              </span>
            </DialogTitle>
          </DialogHeader>

          {selectedQuote && (
            <div className="space-y-8 py-4">
              {/* Request Info */}
              <div className="grid sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Request ID</p>
                  <p className="font-mono text-sm font-semibold uppercase">{selectedQuote.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submitted On</p>
                  <p className="font-medium">{selectedQuote.createdAt?.toDate().toLocaleString()}</p>
                </div>
              </div>

              {/* Products List */}
              <div>
                <h4 className="font-bold flex items-center gap-2 mb-4">
                  <Package className="h-4 w-4 text-primary" />
                  Requested Products ({selectedQuote.products.length})
                </h4>
                <div className="space-y-3">
                  {selectedQuote.products.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.brand} • {item.model}</p>
                      </div>
                      <div className="pl-4 text-right">
                        <span className="text-sm font-bold text-primary bg-primary/5 px-3 py-1 rounded-lg">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="font-bold flex items-center gap-2 mb-4">
                  <User className="h-4 w-4 text-primary" />
                  Contact Information
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-50">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Full Name</p>
                      <p className="text-sm font-semibold">{selectedQuote.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-50">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Company</p>
                      <p className="text-sm font-semibold">{selectedQuote.company}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-50">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-semibold">{selectedQuote.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-50">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-semibold">{selectedQuote.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-50 sm:col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-semibold">
                        {[selectedQuote.city, selectedQuote.state, selectedQuote.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedQuote.message && (
                <div>
                  <h4 className="font-bold flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-primary" />
                    Additional Message
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-600 leading-relaxed italic">
                    "{selectedQuote.message}"
                  </div>
                </div>
              )}

              {/* Admin Note / Status Update */}
              {selectedQuote.internalNotes && (
                <div className="border-t pt-6">
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <h4 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-2">
                      <Settings className="h-4 w-4" /> Admin Notice
                    </h4>
                    <p className="text-sm text-amber-800">{selectedQuote.internalNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyAccount;
