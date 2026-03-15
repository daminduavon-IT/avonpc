import { useState, useRef } from 'react';
import { Image, Upload, Trash2, Copy, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadToCloudinary } from '@/lib/cloudinary-services';
import { toast } from 'sonner';

interface UploadedImage {
  url: string;
  name: string;
  uploadedAt: Date;
}

const AdminMedia = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    const uploadPromises = files.map(async (file) => {
      try {
        const url = await uploadToCloudinary(file);
        return { url, name: file.name, uploadedAt: new Date() };
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
        return null;
      }
    });

    const results = (await Promise.all(uploadPromises)).filter(Boolean) as UploadedImage[];
    if (results.length > 0) {
      setImages(prev => [...results, ...prev]);
      toast.success(`${results.length} image(s) uploaded successfully`);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success('URL copied to clipboard');
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  const handleRemove = (url: string) => {
    setImages(prev => prev.filter(img => img.url !== url));
    toast.success('Removed from gallery (not deleted from Cloudinary)');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Media Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload images to Cloudinary and copy URLs for use in products</p>
        </div>
        <Button
          variant="accent"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {uploading ? 'Uploading...' : 'Upload Images'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-border rounded-xl p-12 text-center mb-6 bg-card cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => {
          e.preventDefault();
          const dt = new DataTransfer();
          Array.from(e.dataTransfer.files).forEach(f => dt.items.add(f));
          const syntheticEvent = { target: { files: dt.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
          await handleFileSelect(syntheticEvent);
        }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-muted-foreground">Uploading to Cloudinary...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Click to upload or drag & drop</p>
              <p className="text-sm text-muted-foreground">PNG, JPG, WebP, SVG accepted</p>
            </div>
          </div>
        )}
      </div>

      {/* Gallery */}
      {images.length === 0 ? (
        <div className="text-center py-16">
          <Image className="h-14 w-14 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">No images uploaded yet. Start by clicking "Upload Images" above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <div key={img.url} className="group relative bg-card border rounded-xl overflow-hidden aspect-square">
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <button
                  onClick={() => handleCopyUrl(img.url)}
                  className="flex items-center gap-1 px-2 py-1 bg-white/20 text-white rounded text-xs hover:bg-white/30 transition-colors"
                >
                  {copiedUrl === img.url ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copiedUrl === img.url ? 'Copied!' : 'Copy URL'}
                </button>
                <button
                  onClick={() => handleRemove(img.url)}
                  className="flex items-center gap-1 px-2 py-1 bg-destructive/80 text-white rounded text-xs hover:bg-destructive transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
              <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">
                {img.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMedia;
