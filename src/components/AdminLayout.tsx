import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Layers, Tag, FileText, Users,
  Image, Settings, BarChart3, Globe, PanelLeft, LogOut, MessageSquare
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const sidebarItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Categories', path: '/admin/categories', icon: Layers },
  { label: 'Brands', path: '/admin/brands', icon: Tag },
  { label: 'Industries', path: '/admin/industries', icon: Layers },
  { label: 'Quote Requests', path: '/admin/quotes', icon: FileText },
  { label: 'Customers', path: '/admin/customers', icon: Users },
  { label: 'Media', path: '/admin/media', icon: Image },
  { label: 'Content', path: '/admin/content', icon: Globe },
  { label: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare },
  { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading, logout } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  // Protect admin route
  if (!loading && (!user || profile?.role !== 'admin')) {
    toast.error('Unauthorized access. Admin privileges required.');
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully.');
      navigate('/login');
    } catch (err) {
      toast.error('Failed to logout.');
    }
  };

  return (
    <div className="min-h-screen flex bg-muted">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-primary text-primary-foreground">
        <div className="p-4 border-b border-primary-foreground/10">
          <Link to="/admin" className="text-lg font-bold">Avon Admin</Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm btn-transition ${isActive(item.path) ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-primary-foreground/70 hover:bg-sidebar-accent/50 hover:text-primary-foreground'
                }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-primary-foreground/10 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary-foreground/70 hover:text-primary-foreground rounded-lg btn-transition">
            <Globe className="h-4 w-4" /> Back to Website
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-primary-foreground/70 hover:text-primary-foreground rounded-lg btn-transition">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-card border-b h-14 flex items-center px-4 lg:px-6 gap-4">
          <button className="lg:hidden p-2"><PanelLeft className="h-5 w-5" /></button>
          <h2 className="text-sm font-semibold text-foreground">Admin Panel</h2>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.email || 'admin@avonpc.com'}</span>
            {profile?.role && (
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">{profile.role}</span>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
