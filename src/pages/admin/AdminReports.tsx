import { BarChart3, TrendingUp } from 'lucide-react';

const monthlyData = [
  { month: 'Oct', quotes: 12 }, { month: 'Nov', quotes: 18 }, { month: 'Dec', quotes: 15 },
  { month: 'Jan', quotes: 22 }, { month: 'Feb', quotes: 28 }, { month: 'Mar', quotes: 34 },
];

const topProducts = [
  { name: 'Borosilicate Glass Beaker Set', requests: 45 },
  { name: 'Digital Analytical Balance', requests: 38 },
  { name: 'Micropipette Set', requests: 32 },
  { name: 'Chemical Fume Hood', requests: 28 },
  { name: 'Vertical Laminar Flow', requests: 22 },
];

const AdminReports = () => (
  <div>
    <h1 className="text-2xl font-bold text-foreground mb-6">Reports & Analytics</h1>

    <div className="grid lg:grid-cols-2 gap-6">
      {/* Quote Requests by Month */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" /> Quote Requests by Month
        </h3>
        <div className="space-y-3">
          {monthlyData.map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-8">{d.month}</span>
              <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                <div className="bg-primary h-full rounded-full btn-transition" style={{ width: `${(d.quotes / 40) * 100}%` }} />
              </div>
              <span className="text-sm font-medium text-foreground w-8">{d.quotes}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Most Requested Products */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" /> Most Requested Products
        </h3>
        <div className="space-y-3">
          {topProducts.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                <span className="text-sm text-foreground">{p.name}</span>
              </div>
              <span className="text-sm font-medium text-primary">{p.requests}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AdminReports;
