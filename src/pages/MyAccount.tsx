import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { User, FileText, Clock, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const MyAccount = () => {
  const { user, profile, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out.');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please login to view your account.</p>
          <Link to="/login"><Button>Sign In</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-primary py-16">
        <div className="container-main text-center">
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">My Account</h1>
          <p className="text-primary-foreground/70">Welcome back, {profile?.displayName || user.email}</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-main max-w-4xl">
          {/* Profile info */}
          <div className="bg-card border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-3">Profile Information</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="text-foreground font-medium">{profile?.displayName || '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="text-foreground font-medium">{user.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Company:</span>
                <p className="text-foreground font-medium">{profile?.company || '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Role:</span>
                <p className="text-foreground font-medium capitalize">{profile?.role || 'customer'}</p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: FileText, title: 'Saved Quotations', desc: 'View your saved product quotation lists.', action: 'View Saved' },
              { icon: Clock, title: 'Quote History', desc: 'Track the status of your submitted quotation requests.', action: 'View History' },
              { icon: Settings, title: 'Account Settings', desc: 'Update your password and notification preferences.', action: 'Settings' },
            ].map((item, i) => (
              <div key={i} className="bg-card border rounded-xl p-6 card-hover">
                <item.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
                <Button variant="outline" size="sm">{item.action}</Button>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MyAccount;
