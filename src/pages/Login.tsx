import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import avonLogo from '@/assets/avon-logo.png';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      if (email === 'admin@avonpc.com') {
        navigate('/admin');
      } else {
        navigate('/my-account');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) { toast.error('Please enter your email first.'); return; }
    try {
      await resetPassword(email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset email.');
    }
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          <button onClick={handleForgotPassword} className="text-sm text-primary hover:underline mt-3 block text-center w-full">
            Forgot password?
          </button>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
