import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import avonLogo from '@/assets/avon-logo.png';
import { toast } from 'sonner';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', company: '', password: '', confirm: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Registration functionality will be available soon.');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-muted py-12">
      <div className="w-full max-w-md mx-4">
        <div className="bg-card border rounded-xl p-8 shadow-sm">
          <div className="text-center mb-6">
            <img src={avonLogo} alt="Avon Pharmo Chem" className="h-10 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground">Create Account</h1>
            <p className="text-sm text-muted-foreground">Register for a new account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Full Name *" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <input type="email" placeholder="Email *" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <input type="text" placeholder="Company Name" value={form.company} onChange={e => setForm({...form, company: e.target.value})}
              className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <input type="password" placeholder="Password *" required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <input type="password" placeholder="Confirm Password *" required value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})}
              className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <Button type="submit" className="w-full">Create Account</Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
