import { Button } from '@/components/ui/button';
import { brands } from '@/data/catalog';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminBrands = () => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-foreground">Brand Management</h1>
      <Button variant="accent"><Plus className="h-4 w-4" /> Add Brand</Button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {brands.map(b => (
        <div key={b.id} className="bg-card border rounded-xl p-5">
          <div className="h-12 bg-muted rounded flex items-center justify-center mb-3">
            <span className="font-bold text-muted-foreground">{b.name}</span>
          </div>
          <h3 className="font-semibold text-foreground mb-1">{b.name}</h3>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{b.description}</p>
          <div className="flex gap-2">
            <button className="p-1.5 rounded hover:bg-muted"><Edit className="h-4 w-4 text-muted-foreground" /></button>
            <button className="p-1.5 rounded hover:bg-muted"><Trash2 className="h-4 w-4 text-destructive" /></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AdminBrands;
