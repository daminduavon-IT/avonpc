import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { getProducts, deleteProduct, updateProduct, FirestoreProduct } from '@/lib/firestore-services';
import { products as localProducts } from '@/data/catalog';
import { toast } from 'sonner';

const AdminProducts = () => {
  const [search, setSearch] = useState('');
  const [firebaseProducts, setFirebaseProducts] = useState<FirestoreProduct[]>([]);
  const [useFirebase, setUseFirebase] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      if (data.length > 0) {
        setFirebaseProducts(data);
        setUseFirebase(true);
      }
    } catch (err) {
      console.error('Firebase products load error, using local data:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayProducts = useFirebase ? firebaseProducts : localProducts;
  const filtered = displayProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id: string) => {
    if (!useFirebase) { toast.info('Connect Firebase to enable this.'); return; }
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      setFirebaseProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted.');
    } catch (err) {
      toast.error('Failed to delete product.');
    }
  };

  const handleToggleStatus = async (id: string, current: string) => {
    if (!useFirebase) { toast.info('Connect Firebase to enable this.'); return; }
    const newStatus = current === 'active' ? 'inactive' : 'active';
    try {
      await updateProduct(id, { status: newStatus as any });
      setFirebaseProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus as any } : p));
      toast.success(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Product Management</h1>
        <div className="flex items-center gap-2">
          {!useFirebase && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Using local data</span>
          )}
          <Button variant="accent"><Plus className="h-4 w-4" /> Add Product</Button>
        </div>
      </div>

      <div className="bg-card border rounded-xl">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-8 text-center text-muted-foreground">Loading products...</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">SKU</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Brand</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.model}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.sku}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.brand}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded hover:bg-muted"><Edit className="h-4 w-4 text-muted-foreground" /></button>
                        <button className="p-1.5 rounded hover:bg-muted" onClick={() => handleToggleStatus(p.id!, p.status)}>
                          {p.status === 'active' ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                        </button>
                        <button className="p-1.5 rounded hover:bg-muted" onClick={() => handleDelete(p.id!)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
