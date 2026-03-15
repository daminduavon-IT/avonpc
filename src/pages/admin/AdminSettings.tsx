import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { updateSettings } from '@/lib/firestore-services';

const AdminSettings = () => {
  const [form, setForm] = useState({
    companyName: 'Avon Pharmo Chem Pvt Ltd',
    email: 'info@avonpc.com',
    phone: '+91 79 2583 1234',
    address: '123 Industrial Area, Ahmedabad, Gujarat 380015, India',
    mapLink: '',
    facebook: '', linkedin: '', twitter: '', instagram: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        companyName: form.companyName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        mapLink: form.mapLink,
        socialLinks: { facebook: form.facebook, linkedin: form.linkedin, twitter: form.twitter, instagram: form.instagram },
      });
      toast.success('Settings saved successfully!');
    } catch (err: any) {
      // If settings doc doesn't exist yet, this might fail
      toast.error('Failed to save. Make sure Firestore is connected and the "settings" collection exists.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Website Settings</h1>

      <div className="bg-card border rounded-xl p-6 max-w-2xl space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Company Name</label>
            <input type="text" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})}
              className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
            <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Map Link</label>
            <input type="text" value={form.mapLink} onChange={e => setForm({...form, mapLink: e.target.value})} placeholder="Google Maps embed URL"
              className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Address</label>
          <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={2}
            className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Social Links</label>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: 'facebook', label: 'Facebook URL' },
              { key: 'linkedin', label: 'LinkedIn URL' },
              { key: 'twitter', label: 'Twitter URL' },
              { key: 'instagram', label: 'Instagram URL' },
            ].map((s) => (
              <input key={s.key} type="text" placeholder={s.label}
                value={(form as any)[s.key]}
                onChange={e => setForm({ ...form, [s.key]: e.target.value })}
                className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            ))}
          </div>
        </div>
        <Button variant="accent" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
