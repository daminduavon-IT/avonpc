import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import avonLogo from '@/assets/avon-logo.png';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Login functionality will be available soon.');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-muted py-12">
      <div className="w-full max-w-md mx-4">
        <div className="bg-card border rounded-xl p-8 shadow-sm">
          <div className="text-center mb-6">
            <img src={avonLogo} alt="Avon Pharmo Chem" className="h-10 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
