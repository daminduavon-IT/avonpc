import { Button } from '@/components/ui/button';
import { categories } from '@/data/catalog';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminCategories = () => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-foreground">Category Management</h1>
      <Button variant="accent"><Plus className="h-4 w-4" /> Add Category</Button>
    </div>

    <div className="bg-card border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Slug</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Products</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(c => (
            <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50">
              <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
              <td className="px-4 py-3 text-muted-foreground">{c.productCount}</td>
              <td className="px-4 py-3 flex gap-1">
                <button className="p-1.5 rounded hover:bg-muted"><Edit className="h-4 w-4 text-muted-foreground" /></button>
                <button className="p-1.5 rounded hover:bg-muted"><Trash2 className="h-4 w-4 text-destructive" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminCategories;
