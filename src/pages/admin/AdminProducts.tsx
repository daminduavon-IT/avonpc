import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Loader2, ImagePlus, FlaskConical, FileText } from 'lucide-react';
import { getProducts, getCategories, getBrands, deleteProduct, updateProduct, addProduct, FirestoreProduct, FirestoreCategory, FirestoreBrand } from '@/lib/firestore-services';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { uploadToCloudinary } from '@/lib/cloudinary-services';
import { toast } from 'sonner';

const AdminProducts = () => {
  const [search, setSearch] = useState('');
  const [firebaseProducts, setFirebaseProducts] = useState<FirestoreProduct[]>([]);
  const [categories, setCategories] = useState<FirestoreCategory[]>([]);
  const [brands, setBrands] = useState<FirestoreBrand[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [specUploading, setSpecUploading] = useState(false);

  const initialForm = {
    name: '', slug: '', brand: '', category: '', model: '', sku: '',
    shortDescription: '', fullDescription: '', specifications: [],
    applications: [], features: [], image: '', images: [],
    featured: false, status: 'active' as const, tags: [], specSheetUrl: ''
  };

  const [formData, setFormData] = useState<Omit<FirestoreProduct, 'id' | 'createdAt' | 'updatedAt'>>(initialForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodData, catData, brandData] = await Promise.all([
        getProducts(), getCategories(), getBrands()
      ]);
      setFirebaseProducts(prodData);
      setCategories(catData);
      setBrands(brandData);
    } catch (err) {
      console.error('Data load error:', err);
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = firebaseProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      setFirebaseProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted.');
    } catch (err) {
      toast.error('Failed to delete product.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateProduct(editingId, formData);
        setFirebaseProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...formData } : p));
        toast.success('Product updated successfully');
      } else {
        const newId = await addProduct(formData);
        setFirebaseProducts(prev => [{ id: newId, ...formData }, ...prev]);
        toast.success('Product added successfully');
      }
      setOpen(false);
      setEditingId(null);
      setFormData(initialForm);
    } catch (err) {
      toast.error(editingId ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: FirestoreProduct) => {
    setEditingId(product.id!);
    const { id, createdAt, updatedAt, ...rest } = product;
    setFormData(rest);
    setOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, image: url }));
      toast.success('Image uploaded successfully');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSpecUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSpecUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, specSheetUrl: url }));
      toast.success('Technical specification uploaded');
    } catch {
      toast.error('Failed to upload specification');
    } finally {
      setSpecUploading(false);
    }
  };

  const handleToggleStatus = async (id: string, current: string) => {
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
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) {
            setEditingId(null);
            setFormData(initialForm);
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="accent"><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') })} placeholder="Product Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug Identifier</Label>
                  <Input id="slug" required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="product-slug" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select id="category" required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <select id="brand" required value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="" disabled>Select Brand</option>
                    {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model Name</Label>
                  <Input id="model" required value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} placeholder="Model Number/Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU Code</Label>
                  <Input id="sku" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="SKU-XXXX" />
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Technical Specification (PDF/Doc)</Label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2 bg-background text-sm text-muted-foreground hover:bg-muted transition-colors">
                    {specUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    {specUploading ? 'Uploading...' : 'Choose spec file to upload'}
                    <input type="file" className="hidden" onChange={handleSpecUpload} disabled={specUploading} />
                  </label>
                  {formData.specSheetUrl && (
                    <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded border">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
                {formData.specSheetUrl && (
                  <p className="text-xs text-primary truncate">{formData.specSheetUrl}</p>
                )}
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Product Image</Label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2 bg-background text-sm text-muted-foreground hover:bg-muted transition-colors">
                    {imageUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="h-4 w-4" />
                    )}
                    {imageUploading ? 'Uploading...' : 'Choose image to upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={imageUploading} />
                  </label>
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="h-10 w-10 object-cover rounded border" />
                  )}
                </div>
                {formData.image && (
                  <p className="text-xs text-primary truncate">{formData.image}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDesc">Short Description</Label>
                <Textarea id="shortDesc" required value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} placeholder="Brief summary for the listing page..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullDesc">Full Description</Label>
                <Textarea id="fullDesc" required className="min-h-[120px]" value={formData.fullDescription} onChange={e => setFormData({ ...formData, fullDescription: e.target.value })} placeholder="Detailed product overview..." />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" variant="accent" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} {editingId ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-16">Image</th>
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
                      <div className="h-10 w-10 bg-muted rounded border overflow-hidden flex items-center justify-center">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <FlaskConical className="h-5 w-5 text-muted-foreground/30" />
                        )}
                      </div>
                    </td>
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
                        <button className="p-1.5 rounded hover:bg-muted" onClick={() => handleEdit(p)}><Edit className="h-4 w-4 text-muted-foreground" /></button>
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
    </div >
  );
};

export default AdminProducts;
