import { useState, useEffect } from 'react';
import { Globe, Edit, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

const sections = [
  { key: 'hero_title', label: 'Homepage Hero Title', description: 'Main heading on the home page.' },
  { key: 'hero_subtitle', label: 'Homepage Hero Subtitle', description: 'Small text below the hero title.' },
  { key: 'about_preview', label: 'About Us Preview', description: 'Small about summary on home page.' },
  { key: 'about_full', label: 'About Us Full description', description: 'Main text on the About page.' },
  { key: 'quality_policy', label: 'Quality Policy', description: 'Text for the Quality Assurance page.' },
];

const AdminContent = () => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [contentMap, setContentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'content'));
        if (snap.exists()) setContentMap(snap.data());
      } catch (err) {
        toast.error('Failed to load content');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEdit = (key: string) => {
    setEditingKey(key);
    setEditText(contentMap[key] || '');
  };

  const handleSave = async () => {
    if (!editingKey) return;
    setSaving(true);
    try {
      const newMap = { ...contentMap, [editingKey]: editText };
      await setDoc(doc(db, 'settings', 'content'), newMap, { merge: true });
      setContentMap(newMap);
      toast.success('Content updated successfully');
      setEditingKey(null);
    } catch {
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const currentSection = sections.find(s => s.key === editingKey);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Content Management</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Manage the content that appears across different sections of your website.
      </p>

      {/* Edit Panel */}
      {editingKey && currentSection && (
        <div className="bg-card border rounded-xl p-6 mb-6 border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">{currentSection.label}</h3>
              <p className="text-xs text-muted-foreground">{currentSection.description}</p>
            </div>
            <button onClick={() => setEditingKey(null)} className="p-1 rounded hover:bg-muted">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            rows={5}
            placeholder={`Enter content for "${currentSection.label}"...`}
            className="w-full px-4 py-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="ghost" size="sm" onClick={() => setEditingKey(null)}>Cancel</Button>
            <Button variant="accent" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
              Save
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {sections.map((s) => (
            <div key={s.key} className="bg-card border rounded-xl p-4 flex items-center justify-between card-hover">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-medium text-foreground text-sm">{s.label}</span>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {contentMap[s.key] && (
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">Custom</span>
                )}
                <button
                  onClick={() => handleEdit(s.key)}
                  className="p-2 rounded hover:bg-muted transition-colors"
                >
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContent;
