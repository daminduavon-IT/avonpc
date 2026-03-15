import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Layers, Tag, FileText, TrendingUp, Clock } from 'lucide-react';
import { getDashboardStats, getQuotes, QuoteRequest } from '@/lib/firestore-services';

const statusColor: Record<string, string> = {
  'New': 'bg-accent/10 text-accent',
  'In Review': 'bg-primary/10 text-primary',
  'Quotation Sent': 'bg-primary/10 text-primary',
  'Follow Up': 'bg-accent/10 text-accent',
  'Closed': 'bg-muted text-muted-foreground',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalProducts: 0, totalCategories: 0, totalBrands: 0, totalQuotes: 0 });
  const [recentQuotes, setRecentQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, q] = await Promise.all([getDashboardStats(), getQuotes()]);
        setStats(s);
        setRecentQuotes(q.slice(0, 5));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-primary' },
    { label: 'Categories', value: stats.totalCategories, icon: Layers, color: 'text-accent' },
    { label: 'Brands', value: stats.totalBrands, icon: Tag, color: 'text-primary' },
    { label: 'Quote Requests', value: stats.totalQuotes, icon: FileText, color: 'text-accent' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

      {loading ? (
        <p className="text-muted-foreground">Loading dashboard...</p>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((s, i) => (
              <div key={i} className="bg-card border rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { label: 'Add Product', path: '/admin/products' },
              { label: 'View Quotes', path: '/admin/quotes' },
              { label: 'Manage Categories', path: '/admin/categories' },
            ].map((a, i) => (
              <Link key={i} to={a.path} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 btn-transition">
                {a.label}
              </Link>
            ))}
          </div>

          {/* Recent Inquiries */}
          <div className="bg-card border rounded-xl">
            <div className="p-4 border-b flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-foreground">Recent Quote Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Company</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Products</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentQuotes.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No quote requests yet.</td></tr>
                  ) : (
                    recentQuotes.map((q) => (
                      <tr key={q.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium text-foreground">{q.name}</td>
                        <td className="px-4 py-3 text-foreground">{q.company}</td>
                        <td className="px-4 py-3 text-muted-foreground">{q.products?.length || 0}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[q.status] || ''}`}>{q.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
