import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2, ImagePlus } from 'lucide-react';
import { getIndustries, deleteIndustry, addIndustry, updateIndustry, FirestoreIndustry } from '@/lib/firestore-services';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { uploadToCloudinary } from '@/lib/cloudinary-services';
import { toast } from 'sonner';

const AdminIndustries = () => {
  const [industries, setIndustries] = useState<FirestoreIndustry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const initialForm = { name: '', slug: '', description: '', image: '' };
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);

  useEffect(() => { loadIndustries(); }, []);

  const loadIndustries = async () => {
    try { setIndustries(await getIndustries()); }
    catch { toast.error('Failed to load industries'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this industry?')) return;
    try { await deleteIndustry(id); setIndustries(p => p.filter(c => c.id !== id)); toast.success('Industry deleted'); }
    catch { toast.error('Failed to delete industry'); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData(p => ({ ...p, image: url }));
      toast.success('Image uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setImgUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateIndustry(editingId, formData);
        setIndustries(p => p.map(c => c.id === editingId ? { ...c, ...formData } : c));
        toast.success('Industry updated successfully');
      } else {
        const newId = await addIndustry(formData);
        setIndustries(p => [...p, { id: newId, ...formData }]);
        toast.success('Industry added successfully');
      }
      setOpen(false);
      setEditingId(null);
      setFormData(initialForm);
    } catch (error) {
      console.error("Update failed with error:", error);
      toast.error(editingId ? 'Failed to update industry' : 'Failed to create industry');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (industry: FirestoreIndustry) => {
    setEditingId(industry.id!);
    const { id, createdAt, ...rest } = industry;
    setFormData(rest as any);
    setOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Industry Management</h1>
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) {
            setEditingId(null);
            setFormData(initialForm);
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="accent"><Plus className="h-4 w-4 mr-2" /> Add Industry</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? 'Edit Industry' : 'Add New Industry'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="iname">Industry Name</Label>
                <Input id="iname" required value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="e.g. Healthcare" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="islug">Slug (URL snippet)</Label>
                <Input id="islug" required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="e.g. healthcare" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idesc">Description</Label>
                <Textarea id="idesc" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Industry description..." />
              </div>
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Industry Image</Label>
                <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed rounded-xl p-4 hover:bg-muted transition-colors">
                  {formData.image ? (
                    <img src={formData.image} alt="Industry" className="h-16 w-16 object-cover rounded-lg" />
                  ) : (
                    <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center">
                      {imgUploading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <ImagePlus className="h-6 w-6 text-muted-foreground" />}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{imgUploading ? 'Uploading...' : formData.image ? 'Change image' : 'Upload industry image'}</p>
                    <p className="text-xs text-muted-foreground">Shown on website. PNG, JPG, WebP.</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={imgUploading} />
                </label>
              </div>
              <Button type="submit" variant="accent" className="w-full" disabled={saving || imgUploading}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} {editingId ? 'Update Industry' : 'Create Industry'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Image</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Industry</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {industries.map(c => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="h-12 w-16 rounded-lg bg-muted border overflow-hidden">
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground/40 text-xs">No img</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">{c.description}</td>
                  <td className="px-4 py-3 flex gap-1">
                    <button className="p-1.5 rounded hover:bg-muted" onClick={() => handleEdit(c)}><Edit className="h-4 w-4 text-muted-foreground" /></button>
                    <button className="p-1.5 rounded hover:bg-muted" onClick={() => handleDelete(c.id!)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminIndustries;
