import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => (
  <div>
    <h1 className="text-2xl font-bold text-foreground mb-6">Website Settings</h1>

    <div className="bg-card border rounded-xl p-6 max-w-2xl space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Company Name</label>
          <input type="text" defaultValue="Avon Pharmo Chem Pvt Ltd" className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
          <input type="email" defaultValue="info@avonpc.com" className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
          <input type="text" defaultValue="+91 79 2583 1234" className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Map Link</label>
          <input type="text" placeholder="Google Maps embed URL" className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Address</label>
        <textarea defaultValue="123 Industrial Area, Ahmedabad, Gujarat 380015, India" rows={2}
          className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Social Links</label>
        <div className="grid sm:grid-cols-2 gap-4">
          {['Facebook URL', 'LinkedIn URL', 'Twitter URL', 'Instagram URL'].map((label, i) => (
            <input key={i} type="text" placeholder={label} className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          ))}
        </div>
      </div>
      <Button variant="accent" onClick={() => toast.success('Settings saved successfully!')}>
        <Save className="h-4 w-4" /> Save Settings
      </Button>
    </div>
  </div>
);

export default AdminSettings;
