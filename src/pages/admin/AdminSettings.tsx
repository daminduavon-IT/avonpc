import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Plus, Trash2, Loader2, Globe, Phone, Mail, MapPin, ImagePlus, Layout } from 'lucide-react';
import { toast } from 'sonner';
import { updateSettings, getSettings, WebsiteSettings, WebsiteLocation, HeroSlide } from '@/lib/firestore-services';
import { useSettings } from '@/context/SettingsContext';
import { uploadToCloudinary } from '@/lib/cloudinary-services';

const AdminSettings = () => {
  const { refreshSettings } = useSettings();
  const [form, setForm] = useState<WebsiteSettings>({
    companyName: '',
    email: '',
    phone: '',
    locations: [],
    socialLinks: { facebook: '', linkedin: '', twitter: '', instagram: '' },
    heroCarousel: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSlideIdx, setUploadingSlideIdx] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSettings();
        if (data) setForm(data);
      } catch (err) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(form);
      await refreshSettings();
      toast.success('Settings saved successfully!');
    } catch (err: any) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const addLocation = () => {
    const newLoc: WebsiteLocation = { name: 'New Location', address: '', phone: '', email: '', mapLink: '' };
    setForm({ ...form, locations: [...form.locations, newLoc] });
  };

  const removeLocation = (index: number) => {
    const newLocs = form.locations.filter((_, i) => i !== index);
    setForm({ ...form, locations: newLocs });
  };

  const updateLoc = (index: number, field: keyof WebsiteLocation, val: string) => {
    const newLocs = form.locations.map((loc, i) => i === index ? { ...loc, [field]: val } : loc);
    setForm({ ...form, locations: newLocs });
  };

  const addSlide = () => {
    if ((form.heroCarousel || []).length >= 6) {
      toast.error('Maximum 6 slides allowed');
      return;
    }
    const newSlide: HeroSlide = {
      image: '',
      titleLine1: 'Trusted',
      titleLine2: 'Equipment Supplier',
      highlightWord: 'Laboratory',
      subtitle: 'Glassware • Instruments • Safety Equipment • Lab Furniture'
    };
    setForm({ ...form, heroCarousel: [...(form.heroCarousel || []), newSlide] });
  };

  const removeSlide = (index: number) => {
    const newSlides = (form.heroCarousel || []).filter((_, i) => i !== index);
    setForm({ ...form, heroCarousel: newSlides });
  };

  const updateSlide = (index: number, field: keyof HeroSlide, val: string) => {
    const newSlides = (form.heroCarousel || []).map((slide, i) => i === index ? { ...slide, [field]: val } : slide);
    setForm({ ...form, heroCarousel: newSlides });
  };

  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSlideIdx(index);
    try {
      const url = await uploadToCloudinary(file);
      updateSlide(index, 'image', url);
      toast.success('Slide image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingSlideIdx(null);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Website Settings</h1>
        <Button variant="accent" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save All Changes
        </Button>
      </div>

      <div className="space-y-8">
        {/* Basic Info */}
        <section className="bg-card border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" /> General Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Company Name</label>
              <input type="text" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })}
                className="w-full px-4 py-2.5 bg-background border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Primary Contact Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-background border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Primary Contact Phone</label>
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-background border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </div>
        </section>

        {/* Locations */}
        <section className="bg-card border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Office Locations
            </h2>
            <Button variant="outline" size="sm" onClick={addLocation} className="rounded-xl">
              <Plus className="h-4 w-4 mr-1" /> Add Location
            </Button>
          </div>

          <div className="space-y-6">
            {(form.locations || []).map((loc, idx) => (
              <div key={idx} className="p-5 bg-muted/30 rounded-2xl border relative group">
                <button onClick={() => removeLocation(idx)} className="absolute top-4 right-4 p-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Branch Name</label>
                    <input type="text" value={loc.name} onChange={e => updateLoc(idx, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-lg text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Map Embed URL (optional)</label>
                    <input type="text" value={loc.mapLink || ''} onChange={e => updateLoc(idx, 'mapLink', e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-lg text-sm" />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Full Address</label>
                    <textarea value={loc.address || ''} onChange={e => updateLoc(idx, 'address', e.target.value)} rows={2}
                      className="w-full px-3 py-2 bg-background border rounded-lg text-sm resize-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Phone (Specific to this branch)</label>
                    <input type="text" value={loc.phone || ''} onChange={e => updateLoc(idx, 'phone', e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-lg text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Email (Specific to this branch)</label>
                    <input type="text" value={loc.email || ''} onChange={e => updateLoc(idx, 'email', e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-lg text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Social Links */}
        <section className="bg-card border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" /> Social Media Links
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {['facebook', 'linkedin', 'twitter', 'instagram'].map((platform) => (
              <div key={platform} className="space-y-2">
                <label className="text-sm font-medium capitalize text-muted-foreground">{platform} URL</label>
                <input type="text" value={(form.socialLinks || {})[platform as keyof typeof form.socialLinks] || ''}
                  onChange={e => setForm({
                    ...form,
                    socialLinks: { ...(form.socialLinks || {}), [platform]: e.target.value } as any
                  })}
                  className="w-full px-4 py-2.5 bg-background border rounded-xl text-sm" />
              </div>
            ))}
          </div>
        </section>

        {/* Hero Carousel */}
        <section className="bg-card border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Layout className="h-5 w-5 text-primary" /> Hero Carousel (min 4 - max 6)
            </h2>
            <Button variant="outline" size="sm" onClick={addSlide} className="rounded-xl">
              <Plus className="h-4 w-4 mr-1" /> Add Slide
            </Button>
          </div>

          <div className="space-y-6">
            {(form.heroCarousel || []).map((slide, idx) => (
              <div key={idx} className="p-5 bg-muted/30 rounded-2xl border relative group">
                <button onClick={() => removeSlide(idx)} className="absolute top-4 right-4 p-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Slide Image</label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 flex items-center gap-3 cursor-pointer border-2 border-dashed rounded-xl p-3 hover:bg-muted transition-colors">
                        {uploadingSlideIdx === idx ? (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        ) : (
                          <ImagePlus className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium">{uploadingSlideIdx === idx ? 'Uploading...' : slide.image ? 'Change Slide Image' : 'Upload Slide Image'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleSlideImageUpload(e, idx)} disabled={uploadingSlideIdx !== null} />
                      </label>
                      {slide.image && <img src={slide.image} alt="Preview" className="h-16 w-32 object-cover rounded-lg border shadow-sm" />}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Title Line 1</label>
                    <input type="text" value={slide.titleLine1 || ''} onChange={e => updateSlide(idx, 'titleLine1', e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-lg text-sm" placeholder="e.g. Trusted" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Title Line 2</label>
                    <input type="text" value={slide.titleLine2 || ''} onChange={e => updateSlide(idx, 'titleLine2', e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-lg text-sm" placeholder="e.g. Equipment Supplier" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Highlight Word</label>
                    <input type="text" value={slide.highlightWord || ''} onChange={e => updateSlide(idx, 'highlightWord', e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-lg text-sm" placeholder="e.g. Laboratory" />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Subtitle / Tags</label>
                    <input type="text" value={slide.subtitle || ''} onChange={e => updateSlide(idx, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 bg-background border rounded-lg text-sm" placeholder="e.g. Glassware • Instruments • Safety Equipment" />
                  </div>
                </div>
              </div>
            ))}
            {(form.heroCarousel || []).length === 0 && (
              <p className="text-center py-8 text-muted-foreground text-sm">No slides added. Please add 4-6 slides.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminSettings;
