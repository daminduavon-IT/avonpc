import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Loader2, ImagePlus, FlaskConical, FileText, Settings, Sparkles, X } from 'lucide-react';
import { getProducts, getCategories, getBrands, getIndustries, deleteProduct, updateProduct, addProduct, FirestoreProduct, FirestoreCategory, FirestoreBrand, FirestoreIndustry, ProductVariant } from '@/lib/firestore-services';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { uploadToCloudinary } from '@/lib/cloudinary-services';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AdminProducts = () => {
  const [search, setSearch] = useState('');
  const [firebaseProducts, setFirebaseProducts] = useState<FirestoreProduct[]>([]);
  const [categories, setCategories] = useState<FirestoreCategory[]>([]);
  const [brands, setBrands] = useState<FirestoreBrand[]>([]);
  const [industries, setIndustries] = useState<FirestoreIndustry[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [specUploading, setSpecUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const [markdownTab, setMarkdownTab] = useState<'write' | 'preview'>('write');

  const initialForm: Omit<FirestoreProduct, 'id' | 'createdAt' | 'updatedAt'> = {
    name: '', slug: '', brand: '', category: '', model: '', sku: '',
    shortDescription: '', fullDescription: '', specifications: [],
    applications: [], features: [], image: '', images: [], gallery: [],
    featured: false, status: 'active', tags: [], industryIDs: [], specSheetUrl: '',
    isFlashSale: false, selectionType: '', variants: []
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodData, catData, brandData, indusData] = await Promise.all([
        getProducts(), getCategories(), getBrands(), getIndustries()
      ]);
      setFirebaseProducts(prodData);
      setCategories(catData);
      setBrands(brandData);
      setIndustries(indusData);
    } catch (err) {
      console.error('Data load error:', err);
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = firebaseProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id: string) => {
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
    setFormData({
      ...initialForm,
      ...rest,
      variants: rest.variants || [],
      gallery: rest.gallery || [],
    });
    setMarkdownTab('write');
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

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setGalleryUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadToCloudinary));
      setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), ...urls] }));
      toast.success('Gallery images uploaded');
    } catch {
      toast.error('Failed to upload gallery images');
    } finally {
      setGalleryUploading(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => {
      const newGallery = [...(prev.gallery || [])];
      newGallery.splice(index, 1);
      return { ...prev, gallery: newGallery };
    });
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

  // Variant Management
  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: crypto.randomUUID(),
      sku: '',
      selectionLabel: '',
      stockQty: 0,
      price: 0,
    };
    setFormData(prev => ({ ...prev, variants: [...(prev.variants || []), newVariant] }));
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    setFormData(prev => {
      const updated = [...(prev.variants || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  const removeVariant = (index: number) => {
    setFormData(prev => {
      const updated = [...(prev.variants || [])];
      updated.splice(index, 1);
      return { ...prev, variants: updated };
    });
  };

  // Calculate Product Stock Status for List view
  const getProductStockStatus = (p: FirestoreProduct) => {
    if (p.variants && p.variants.length > 0) {
      const totalStock = p.variants.reduce((acc, v) => acc + (v.stockQty || 0), 0);
      return totalStock;
    }
    // Fallback if no variants but has a legacy stock string (just return 10 to make it green for now, or parse it)
    return p.stockQty ? 10 : 0; 
  };

  const renderStockBadge = (stockCount: number) => {
    if (stockCount === 0) return <span className="bg-destructive/10 text-destructive text-xs font-bold px-2 py-1 rounded">Out of Stock</span>;
    if (stockCount < 10) return <span className="bg-orange-500/10 text-orange-600 text-xs font-bold px-2 py-1 rounded">Low ({stockCount})</span>;
    return <span className="bg-emerald-500/10 text-emerald-600 text-xs font-bold px-2 py-1 rounded">In Stock ({stockCount})</span>;
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-8 pt-4">
              
              {/* Basic Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') })} placeholder="Product Name" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <Label htmlFor="slug">Slug Identifier</Label>
                    <Input id="slug" required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="product-slug" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <Label htmlFor="category">Category</Label>
                    <select id="category" required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="" disabled>Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2 text-sm">
                    <Label htmlFor="brand">Brand</Label>
                    <select id="brand" required value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="" disabled>Select Brand</option>
                      {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2 col-span-2 text-sm">
                    <Label>Industries</Label>
                    <div className="flex flex-wrap gap-3 p-3 border rounded-md bg-muted/20">
                      {industries.map(ind => (
                        <label key={ind.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted p-1 rounded">
                          <input
                            type="checkbox"
                            checked={formData.industryIDs?.includes(ind.id!) || false}
                            onChange={(e) => {
                              const current = formData.industryIDs || [];
                              if (e.target.checked) setFormData({ ...formData, industryIDs: [...current, ind.id!] });
                              else setFormData({ ...formData, industryIDs: current.filter(id => id !== ind.id!) });
                            }}
                            className="rounded border-primary text-primary focus:ring-primary h-4 w-4"
                          />
                          {ind.name}
                        </label>
                      ))}
                      {industries.length === 0 && <span className="text-sm text-muted-foreground">No industries found. Create one first.</span>}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <Label htmlFor="model">Base Model Name</Label>
                    <Input id="model" required value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} placeholder="Model Number/Name" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <Label htmlFor="sku">Base SKU Code</Label>
                    <Input id="sku" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="SKU-XXXX" />
                  </div>
                </div>
              </div>

              {/* Marketing & Description */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b pb-2 flex items-center justify-between">
                  Marketing
                  <label className="flex items-center gap-2 cursor-pointer bg-destructive/10 text-destructive px-3 py-1 rounded-full text-xs font-black tracking-widest">
                    <Sparkles className="h-3 w-3" /> Flash Sale
                    <input type="checkbox" checked={formData.isFlashSale} onChange={e => setFormData({ ...formData, isFlashSale: e.target.checked })} className="hidden" />
                  </label>
                </h3>
                <div className="space-y-2 text-sm">
                  <Label htmlFor="shortDesc">Short Description</Label>
                  <Textarea id="shortDesc" required value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} placeholder="Brief summary for the listing page..." />
                </div>
              </div>

              {/* Media & Files */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">Media & files</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <Label>Main Product Image</Label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2 bg-background hover:bg-muted transition-colors">
                        {imageUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                        {imageUploading ? 'Uploading...' : 'Choose image'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={imageUploading} />
                      </label>
                      {formData.image && <img src={formData.image} alt="Preview" className="h-10 w-10 object-cover rounded border" />}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Label>Technical Specification (PDF/Doc)</Label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2 bg-background hover:bg-muted transition-colors">
                        {specUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                        {specUploading ? 'Uploading...' : 'Choose spec file'}
                        <input type="file" className="hidden" onChange={handleSpecUpload} disabled={specUploading} />
                      </label>
                      {formData.specSheetUrl && <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded border"><FileText className="h-5 w-5 text-primary" /></div>}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm col-span-2">
                    <Label>Additional Gallery Images</Label>
                    <label className="w-full flex items-center justify-center gap-2 cursor-pointer border border-dashed rounded-md px-3 py-4 bg-muted/20 hover:bg-muted transition-colors">
                      {galleryUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                      {galleryUploading ? 'Uploading to gallery...' : 'Select multiple images'}
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={galleryUploading} />
                    </label>
                    {(formData.gallery && formData.gallery.length > 0) && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.gallery.map((img, i) => (
                          <div key={i} className="relative group">
                            <img src={img} className="h-16 w-16 object-cover rounded border" />
                            <button type="button" onClick={() => removeGalleryImage(i)} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Advanced Variants Architecture */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Product Variants</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant} className="h-8">
                    <Plus className="h-4 w-4 mr-1" /> Add Option Row
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="w-1/2 space-y-2 text-sm">
                    <Label>Selection Type Label (e.g., Dimensions, Volume, Color)</Label>
                    <Input value={formData.selectionType || ''} onChange={(e) => setFormData({ ...formData, selectionType: e.target.value })} placeholder="E.g., Size" />
                  </div>

                  {(formData.variants && formData.variants.length > 0) ? (
                    <div className="border rounded-xl overflow-hidden bg-card">
                      <table className="w-full text-sm">
                        <thead className="bg-muted text-muted-foreground">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium">Variant SKU</th>
                            <th className="px-3 py-2 text-left font-medium">Option Label (e.g. 50ml)</th>
                            <th className="px-3 py-2 text-left font-medium w-32">Price ($)</th>
                            <th className="px-3 py-2 text-left font-medium w-32">Stock Qty</th>
                            <th className="px-3 py-2 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {formData.variants.map((v, i) => (
                            <tr key={v.id}>
                              <td className="p-2"><Input value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} placeholder="SKU-1A" className="h-8" /></td>
                              <td className="p-2"><Input value={v.selectionLabel} onChange={e => updateVariant(i, 'selectionLabel', e.target.value)} placeholder="50ml" className="h-8" /></td>
                              <td className="p-2"><Input type="number" step="0.01" value={v.price} onChange={e => updateVariant(i, 'price', parseFloat(e.target.value))} className="h-8" /></td>
                              <td className="p-2"><Input type="number" value={v.stockQty} onChange={e => updateVariant(i, 'stockQty', parseInt(e.target.value, 10))} className="h-8" /></td>
                              <td className="p-2 text-right">
                                <button type="button" onClick={() => removeVariant(i)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center p-6 border border-dashed rounded-xl bg-muted/20 text-muted-foreground text-sm">
                      No variants added. Product will use the base Model/SKU.
                    </div>
                  )}
                </div>
              </div>

              {/* Markdown Specifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Detailed Specifications</h3>
                  <div className="flex bg-muted p-1 rounded-lg">
                    <button type="button" onClick={() => setMarkdownTab('write')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${markdownTab === 'write' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                      Markdown Editor
                    </button>
                    <button type="button" onClick={() => setMarkdownTab('preview')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${markdownTab === 'preview' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                      Live Preview
                    </button>
                  </div>
                </div>

                <div className="border rounded-xl bg-card overflow-hidden min-h-[300px]">
                  {markdownTab === 'write' ? (
                    <Textarea 
                      value={formData.fullDescription || ''} 
                      onChange={e => setFormData({ ...formData, fullDescription: e.target.value })} 
                      placeholder="Use Markdown to create detailed specification tables... Example:&#10;| Feature | Value |&#10;|---------|-------|&#10;| Processor | i9 |" 
                      className="min-h-[300px] border-0 rounded-none focus-visible:ring-0 resize-y p-4 font-mono text-sm bg-muted/5 wrapper"
                    />
                  ) : (
                    <div className="p-6 prose prose-sm max-w-none dark:prose-invert">
                      {formData.fullDescription ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.fullDescription}</ReactMarkdown>
                      ) : (
                        <span className="text-muted-foreground italic">Nothing to preview.</span>
                      )}
                    </div>
                  )}
                </div>
              </div>


              <div className="flex items-center justify-between pt-6 border-t mt-8">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" variant="accent" size="lg" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} {editingId ? 'Save Changes' : 'Publish Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden mt-6">
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
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Base SKU</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Variants</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Inventory</th>
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
                        <p className="font-medium text-foreground">{p.name} {p.isFlashSale && <span className="text-xs text-destructive ml-1">⚡</span>}</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-relaxed mt-1 mb-1">{p.brand} • {p.category}</p>
                        {p.industryIDs && p.industryIDs.length > 0 && (
                           <div className="flex flex-wrap gap-1.5 mt-1">
                             {p.industryIDs.map(id => {
                               const ind = industries.find(i => i.id === id);
                               return ind ? (
                                 <span key={id} className="text-[9px] font-black bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                   {ind.name}
                                 </span>
                               ) : null;
                             })}
                           </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.sku || p.model || 'N/A'}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.variants && p.variants.length > 0 ? (
                        <span className="font-semibold text-primary">{p.variants.length} options</span>
                      ) : (
                        <span className="text-xs">Standard</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                       {renderStockBadge(getProductStockStatus(p))}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.status === 'active' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded hover:bg-muted" onClick={() => handleEdit(p)}><Edit className="h-4 w-4 text-muted-foreground" /></button>
                        <button className="p-1.5 rounded hover:bg-muted" onClick={() => handleToggleStatus(p.id!, p.status)}>
                          {p.status === 'active' ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="p-1.5 rounded hover:bg-muted">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this product?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete <strong>{p.name}</strong> and remove all associated variants from the database. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(p.id!)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete Permanently
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
