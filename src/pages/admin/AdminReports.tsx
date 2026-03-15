import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, FileText, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { getQuotes, QuoteRequest } from '@/lib/firestore-services';

const AdminReports = () => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuotes()
      .then(setQuotes)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  // Build monthly counts from actual data
  const monthlyCounts: Record<string, number> = {};
  quotes.forEach((q) => {
    let date: Date;
    if (q.createdAt?.toDate) {
      date = q.createdAt.toDate();
    } else if (q.createdAt) {
      date = new Date(q.createdAt);
    } else {
      return;
    }
    const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
  });

  const monthlyData = Object.entries(monthlyCounts)
    .slice(-6)
    .map(([month, count]) => ({ month, count }));

  const maxCount = Math.max(...monthlyData.map(d => d.count), 1);

  // Status breakdown
  const statusMap = quotes.reduce<Record<string, number>>((acc, q) => {
    acc[q.status] = (acc[q.status] || 0) + 1;
    return acc;
  }, {});

  const statusColors: Record<string, string> = {
    'New': 'bg-primary',
    'In Review': 'bg-blue-500',
    'Quotation Sent': 'bg-accent',
    'Follow Up': 'bg-yellow-500',
    'Closed': 'bg-muted-foreground',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    'New': <FileText className="h-4 w-4" />,
    'In Review': <Clock className="h-4 w-4" />,
    'Quotation Sent': <CheckCircle2 className="h-4 w-4" />,
    'Follow Up': <TrendingUp className="h-4 w-4" />,
    'Closed': <XCircle className="h-4 w-4" />,
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Reports & Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-primary">{quotes.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Quotes</p>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-accent">{statusMap['New'] || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">New Quotes</p>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-500">{statusMap['Quotation Sent'] || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Quotations Sent</p>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-muted-foreground">{statusMap['Closed'] || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Closed</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quote Requests by Month */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Quote Requests by Month
          </h3>
          {monthlyData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet — quotes will appear here once received.</p>
          ) : (
            <div className="space-y-3">
              {monthlyData.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-14 shrink-0">{d.month}</span>
                  <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-700" style={{ width: `${(d.count / maxCount) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium text-foreground w-6 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" /> Quote Status Breakdown
          </h3>
          {quotes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No quotes yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(statusMap).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`p-1 rounded text-white ${statusColors[status] || 'bg-muted'}`}>
                      {statusIcons[status] || <FileText className="h-3 w-3" />}
                    </span>
                    <span className="text-sm text-foreground">{status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${statusColors[status] || 'bg-muted-foreground'}`} style={{ width: `${(count / quotes.length) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium text-primary w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
