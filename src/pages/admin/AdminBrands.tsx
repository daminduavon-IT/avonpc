import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2, ImagePlus } from 'lucide-react';
import { getBrands, deleteBrand, addBrand, updateBrand, FirestoreBrand } from '@/lib/firestore-services';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { uploadToCloudinary } from '@/lib/cloudinary-services';
import { toast } from 'sonner';

const AdminBrands = () => {
  const [brands, setBrands] = useState<FirestoreBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const initialForm = { name: '', slug: '', description: '', logo: '' };
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);

  useEffect(() => { loadBrands(); }, []);

  const loadBrands = async () => {
    try { setBrands(await getBrands()); }
    catch { toast.error('Failed to load brands'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this brand?')) return;
    try { await deleteBrand(id); setBrands(p => p.filter(b => b.id !== id)); toast.success('Brand deleted'); }
    catch { toast.error('Failed to delete brand'); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData(p => ({ ...p, logo: url }));
      toast.success('Logo uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setImgUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateBrand(editingId, formData);
        setBrands(p => p.map(b => b.id === editingId ? { ...b, ...formData } : b));
        toast.success('Brand updated successfully');
      } else {
        const newId = await addBrand(formData);
        setBrands(p => [...p, { id: newId, ...formData }]);
        toast.success('Brand added successfully');
      }
      setOpen(false);
      setEditingId(null);
      setFormData(initialForm);
    } catch {
      toast.error(editingId ? 'Failed to update brand' : 'Failed to create brand');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (brand: FirestoreBrand) => {
    setEditingId(brand.id!);
    const { id, createdAt, ...rest } = brand;
    setFormData(rest as any);
    setOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Brand Management</h1>
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) {
            setEditingId(null);
            setFormData(initialForm);
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="accent"><Plus className="h-4 w-4 mr-2" /> Add Brand</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? 'Edit Brand' : 'Add New Brand'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="bname">Brand Name</Label>
                <Input id="bname" required value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="e.g. Thermo Fisher" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bslug">Slug (URL snippet)</Label>
                <Input id="bslug" required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="e.g. thermo-fisher" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bdesc">Description</Label>
                <Textarea id="bdesc" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brand description..." />
              </div>
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Brand Logo</Label>
                <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed rounded-xl p-4 hover:bg-muted transition-colors">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="h-12 w-20 object-contain rounded" />
                  ) : (
                    <div className="h-12 w-20 bg-muted rounded flex items-center justify-center">
                      {imgUploading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <ImagePlus className="h-5 w-5 text-muted-foreground" />}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{imgUploading ? 'Uploading...' : formData.logo ? 'Change logo' : 'Upload brand logo'}</p>
                    <p className="text-xs text-muted-foreground">PNG, SVG, JPG recommended</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={imgUploading} />
                </label>
              </div>
              <Button type="submit" variant="accent" className="w-full" disabled={saving || imgUploading}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} {editingId ? 'Update Brand' : 'Create Brand'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : brands.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No brands yet. Click "Add Brand" to create one.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map(b => (
            <div key={b.id} className="bg-card border rounded-xl overflow-hidden group">
              {/* Logo area */}
              <div className="h-28 bg-muted flex items-center justify-center p-4 border-b">
                {b.logo ? (
                  <img src={b.logo} alt={b.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-lg font-bold text-muted-foreground/50">{b.name[0]}</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground text-sm">{b.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{b.description}</p>
                <div className="flex gap-2 mt-3">
                  <button className="p-1.5 rounded hover:bg-muted" onClick={() => handleEdit(b)}><Edit className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button className="p-1.5 rounded hover:bg-muted" onClick={() => handleDelete(b.id!)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBrands;
