import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';
import { submitInquiry } from '@/lib/firestore-services';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });
  const [loading, setLoading] = useState(false);

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
                  <input type="text" placeholder="Full Name *" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <input type="email" placeholder="Email *" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input type="tel" placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full px-4 py-2.5 bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <input type="text" placeholder="Company" value={form.company} onChange={e => setForm({...form, company: e.target.value})}
                    className="w-full px-4 py-2.5 bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <textarea placeholder="Your Message *" required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                  className="w-full px-4 py-2.5 bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                <Button type="submit" variant="accent" size="lg" disabled={loading}>
                  <Send className="h-4 w-4" /> {loading ? 'Sending...' : 'Send Inquiry'}
                </Button>
              </form>
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
              {[
                { icon: MapPin, label: 'Address', value: '123 Industrial Area, Ahmedabad, Gujarat 380015, India' },
                { icon: Phone, label: 'Phone', value: '+91 79 2583 1234' },
                { icon: Mail, label: 'Email', value: 'info@avonpc.com' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 bg-card border rounded-lg p-4">
                  <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{item.label}</h4>
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
              <div className="bg-card border rounded-xl h-64 flex items-center justify-center text-muted-foreground text-sm">
                Map Placeholder
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
