import { Users } from 'lucide-react';

const customers = [
  { name: 'Rajesh Patel', company: 'PharmaCorp Ltd', email: 'rajesh@pharmacorp.com', quotes: 5 },
  { name: 'Dr. Meena Singh', company: 'BioLab Research', email: 'meena@biolab.com', quotes: 3 },
  { name: 'Amit Kumar', company: 'MedTech Solutions', email: 'amit@medtech.in', quotes: 2 },
  { name: 'Prof. Sharma', company: 'UniLab Sciences', email: 'sharma@unilab.edu', quotes: 8 },
];

const AdminCustomers = () => (
  <div>
    <h1 className="text-2xl font-bold text-foreground mb-6">Customer Management</h1>
    <div className="bg-card border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Company</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Quotes</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
              <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{c.company}</td>
              <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
              <td className="px-4 py-3 text-muted-foreground">{c.quotes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminCustomers;
