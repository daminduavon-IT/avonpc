import { useState } from 'react';
import { Eye, MessageSquare } from 'lucide-react';

const quotes = [
  { id: 'QR-001', name: 'Rajesh Patel', company: 'PharmaCorp Ltd', email: 'rajesh@pharmacorp.com', products: 3, status: 'New', date: '2026-03-12', message: 'Need pricing for bulk order of glassware.' },
  { id: 'QR-002', name: 'Dr. Meena Singh', company: 'BioLab Research', email: 'meena@biolab.com', products: 5, status: 'In Review', date: '2026-03-11', message: 'Setting up new lab, need complete equipment list.' },
  { id: 'QR-003', name: 'Amit Kumar', company: 'MedTech Solutions', email: 'amit@medtech.in', products: 2, status: 'Quotation Sent', date: '2026-03-10', message: 'Interested in fume hoods.' },
  { id: 'QR-004', name: 'Prof. Sharma', company: 'UniLab Sciences', email: 'sharma@unilab.edu', products: 8, status: 'New', date: '2026-03-10', message: 'University lab setup requirement.' },
  { id: 'QR-005', name: 'Sunil Mehta', company: 'ChemIndia Pvt Ltd', email: 'sunil@chemindia.com', products: 1, status: 'Closed', date: '2026-03-09', message: 'Need one laminar flow unit.' },
];

const statusColor: Record<string, string> = {
  'New': 'bg-accent/10 text-accent',
  'In Review': 'bg-primary/10 text-primary',
  'Quotation Sent': 'bg-primary/10 text-primary',
  'Follow Up': 'bg-accent/10 text-accent',
  'Closed': 'bg-muted text-muted-foreground',
};

const AdminQuotes = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedQuote = quotes.find(q => q.id === selected);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Quote Request Management</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">View</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(q => (
                <tr key={q.id} className={`border-b last:border-0 hover:bg-muted/50 cursor-pointer ${selected === q.id ? 'bg-muted' : ''}`} onClick={() => setSelected(q.id)}>
                  <td className="px-4 py-3 font-medium text-foreground">{q.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-foreground">{q.name}</p>
                    <p className="text-xs text-muted-foreground">{q.company}</p>
                  </td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[q.status]}`}>{q.status}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{q.date}</td>
                  <td className="px-4 py-3"><Eye className="h-4 w-4 text-muted-foreground" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        <div className="bg-card border rounded-xl p-5">
          {selectedQuote ? (
            <div>
              <h3 className="font-bold text-foreground mb-3">{selectedQuote.id}</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Name:</span> <span className="text-foreground">{selectedQuote.name}</span></p>
                <p><span className="text-muted-foreground">Company:</span> <span className="text-foreground">{selectedQuote.company}</span></p>
                <p><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{selectedQuote.email}</span></p>
                <p><span className="text-muted-foreground">Products:</span> <span className="text-foreground">{selectedQuote.products} items</span></p>
                <p><span className="text-muted-foreground">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[selectedQuote.status]}`}>{selectedQuote.status}</span></p>
                <div className="pt-3 border-t mt-3">
                  <p className="text-muted-foreground flex items-center gap-1 mb-1"><MessageSquare className="h-3 w-3" /> Message</p>
                  <p className="text-foreground">{selectedQuote.message}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">Select a quote request to view details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminQuotes;
