import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Send, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { submitInquiry } from '@/lib/firestore-services';
import { useSettings } from '@/context/SettingsContext';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });
  const [loading, setLoading] = useState(false);
  const { settings } = useSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitInquiry(form);
      toast.success('Your inquiry has been submitted. We will get back to you shortly!');
      setForm({ name: '', email: '', phone: '', company: '', message: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="bg-primary py-16 lg:py-20">
        <div className="container-main text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">Contact Us</h1>
          <p className="text-primary-foreground/70">We'd love to hear from you. Get in touch with our team.</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Full Name *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <input type="email" placeholder="Email *" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input type="tel" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <input type="text" placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                    className="w-full px-4 py-2.5 bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <textarea placeholder="Your Message *" required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                <Button type="submit" variant="accent" size="lg" disabled={loading}>
                  <Send className="h-4 w-4" /> {loading ? 'Sending...' : 'Send Inquiry'}
                </Button>
              </form>
            </div>
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
                <div className="grid gap-4">
                  <div className="flex items-start gap-4 bg-card border rounded-lg p-4">
                    <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Phone</h4>
                      <p className="text-sm text-muted-foreground">{settings?.phone || '+91 79 2583 1234'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-card border rounded-lg p-4">
                    <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Email</h4>
                      <p className="text-sm text-muted-foreground">{settings?.email || 'info@avonpc.com'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {settings?.locations && settings.locations.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Our Locations</h2>
                  <div className="grid gap-6">
                    {settings.locations.map((loc, i) => (
                      <div key={i} className="flex flex-col gap-4 bg-card border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-accent" />
                          </div>
                          <h4 className="font-bold text-foreground">{loc.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed pl-11">{loc.address}</p>
                        <div className="pl-11 space-y-2">
                          {loc.phone && <p className="text-xs text-muted-foreground flex items-center gap-2">📞 {loc.phone}</p>}
                          {loc.email && <p className="text-xs text-muted-foreground flex items-center gap-2">✉️ {loc.email}</p>}
                        </div>
                        {loc.mapLink && (
                          <div className="mt-2 rounded-xl overflow-hidden h-48 border">
                            <iframe
                              src={loc.mapLink}
                              title={`Map for ${loc.name}`}
                              className="w-full h-full border-0"
                              allowFullScreen
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
