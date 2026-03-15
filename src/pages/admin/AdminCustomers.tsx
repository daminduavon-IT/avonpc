import { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { getCustomers } from '@/lib/firestore-services';
import { toast } from 'sonner';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (err) {
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Customer Management</h1>
      <div className="bg-card border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Company</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No customers found.</td></tr>
              ) : (
                customers.map((c, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium text-foreground">{c.fullName || c.name || 'Anonymous'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.company || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
