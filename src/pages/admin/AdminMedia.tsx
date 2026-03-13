import { Image, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminMedia = () => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-foreground">Media Manager</h1>
      <Button variant="accent"><Upload className="h-4 w-4" /> Upload</Button>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="bg-card border rounded-xl aspect-square flex items-center justify-center card-hover cursor-pointer">
          <Image className="h-8 w-8 text-muted-foreground/30" />
        </div>
      ))}
    </div>
  </div>
);

export default AdminMedia;
