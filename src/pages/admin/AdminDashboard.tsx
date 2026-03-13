import { Package, Layers, Tag, FileText, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { label: 'Total Products', value: '342', icon: Package, color: 'text-primary' },
  { label: 'Categories', value: '7', icon: Layers, color: 'text-accent' },
  { label: 'Brands', value: '8', icon: Tag, color: 'text-primary' },
  { label: 'Quote Requests', value: '56', icon: FileText, color: 'text-accent' },
];

const recentInquiries = [
  { id: 'QR-001', company: 'PharmaCorp Ltd', products: 3, status: 'New', date: '2026-03-12' },
  { id: 'QR-002', company: 'BioLab Research', products: 5, status: 'In Review', date: '2026-03-11' },
  { id: 'QR-003', company: 'MedTech Solutions', products: 2, status: 'Quotation Sent', date: '2026-03-10' },
  { id: 'QR-004', company: 'UniLab Sciences', products: 8, status: 'New', date: '2026-03-10' },
  { id: 'QR-005', company: 'ChemIndia Pvt Ltd', products: 1, status: 'Closed', date: '2026-03-09' },
];

const statusColor: Record<string, string> = {
  'New': 'bg-accent/10 text-accent',
  'In Review': 'bg-primary/10 text-primary',
  'Quotation Sent': 'bg-primary/10 text-primary',
  'Follow Up': 'bg-accent/10 text-accent',
  'Closed': 'bg-muted text-muted-foreground',
};

const AdminDashboard = () => (
  <div>
    <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s, i) => (
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
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Company</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Products</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentInquiries.map((inq) => (
              <tr key={inq.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="px-4 py-3 font-medium text-foreground">{inq.id}</td>
                <td className="px-4 py-3 text-foreground">{inq.company}</td>
                <td className="px-4 py-3 text-muted-foreground">{inq.products}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[inq.status] || ''}`}>{inq.status}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{inq.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
