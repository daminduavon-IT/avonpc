import { Globe, Edit } from 'lucide-react';

const sections = [
  'Homepage Banner', 'About Us Page', 'Industries Section', 'Certifications Page',
  'Footer Content', 'Contact Information', 'SEO Meta Tags'
];

const AdminContent = () => (
  <div>
    <h1 className="text-2xl font-bold text-foreground mb-6">Content Management</h1>
    <div className="space-y-3">
      {sections.map((s, i) => (
        <div key={i} className="bg-card border rounded-xl p-4 flex items-center justify-between card-hover">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">{s}</span>
          </div>
          <button className="p-2 rounded hover:bg-muted"><Edit className="h-4 w-4 text-muted-foreground" /></button>
        </div>
      ))}
    </div>
  </div>
);

export default AdminContent;
