import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/context/QuoteContext';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import avonLogo from '@/assets/avon-logo.png';

const navItems = [
  { label: 'Home', path: '/' },
  {
    label: 'Products', path: '/products',
    children: [
      { label: 'Glassware', path: '/products/glassware' },
      { label: 'Consumables', path: '/products/consumables' },
      { label: 'Laboratory Instruments', path: '/products/laboratory-instruments' },
      { label: 'Safety Equipment', path: '/products/safety-equipment' },
      { label: 'Fume Hood', path: '/products/fume-hood' },
      { label: 'Laminar Flow', path: '/products/laminar-flow' },
      { label: 'Laboratory Furniture', path: '/products/laboratory-furniture' },
    ],
  },
  { label: 'Brands', path: '/brands' },
  { label: 'Industries', path: '/industries' },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const { itemCount, setIsOpen } = useQuote();
  const { user } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <>
      {/* Top info bar */}
      <div className="bg-topbar text-topbar-foreground text-xs sm:text-sm">
        <div className="container-main flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <span>📞 {settings?.phone || '+94 11 234 5678'}</span>
            <span className="hidden sm:inline">✉️ {settings?.email || 'sales@avonpc.com'}</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/my-account" className="hover:underline">{user.email?.split('@')[0]}</Link>
                <span>|</span>
                <Link to="/my-account" className="hover:underline">My Account</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:underline">Login</Link>
                <span>|</span>
                <Link to="/register" className="hover:underline">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 bg-card shadow-sm border-b">
        <div className="container-main flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex-shrink-0">
            <img src={avonLogo} alt="Avon Pharmo Chem" className="h-10 lg:h-14 w-auto" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1 bg-muted/40 backdrop-blur-md border border-border/50 rounded-full px-2 py-1.5 shadow-sm">
            {navItems.map((item) => (
              <div
                key={item.path}
                className="relative"
                onMouseEnter={() => item.children && setDropdownOpen(item.label)}
                onMouseLeave={() => setDropdownOpen(null)}
              >
                <Link
                  to={item.path}
                  className={`px-4 py-2 text-sm font-bold tracking-wide rounded-full btn-transition flex items-center gap-1 ${isActive(item.path) ? 'text-primary bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                >
                  {item.label}
                  {item.children && <ChevronDown className="h-3 w-3" />}
                </Link>
                {item.children && dropdownOpen === item.label && (
                  <div className="absolute top-full left-0 w-56 bg-card rounded-lg shadow-lg border py-2 animate-fade-in">
                    {item.children.map((child) => (
                      <Link key={child.path} to={child.path}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary btn-transition">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-md hover:bg-muted btn-transition" aria-label="Search">
              <Search className="h-5 w-5 text-foreground" />
            </button>
            <button onClick={() => setIsOpen(true)} className="relative p-2 rounded-md hover:bg-muted btn-transition" aria-label="Quote cart">
              <FileText className="h-5 w-5 text-foreground" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>
            <Link to="/flash-sale" className="hidden sm:block">
              <Button variant="destructive" size="sm" className="font-black tracking-wide flex items-center gap-1.5 shadow-lg shadow-destructive/30 active:scale-95 transition-all shimmer-bg rounded-lg px-4 border border-destructive/50">⚡ Flash Sale</Button>
            </Link>
            <Link to="/request-quote" className="hidden sm:block">
              <Button variant="accent" size="sm" className="active:scale-95 transition-all">Request Quote</Button>
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-md hover:bg-muted" aria-label="Menu">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t bg-card animate-fade-in">
            <div className="container-main py-3">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="text" placeholder="Search products, categories, brands..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-24 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" autoFocus />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {mobileOpen && (
          <div className="lg:hidden border-t bg-card animate-fade-in">
            <div className="container-main py-4 space-y-1">
              {navItems.map((item) => (
                <div key={item.path}>
                  <Link to={item.path} onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2.5 text-sm font-medium rounded-md ${isActive(item.path) ? 'text-primary bg-primary/5' : 'text-foreground hover:bg-muted'
                      }`}>
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="pl-6 space-y-1">
                      {item.children.map((child) => (
                        <Link key={child.path} to={child.path} onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary">
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link to="/flash-sale" onClick={() => setMobileOpen(false)}>
                <Button variant="destructive" className="w-full mt-3 font-black tracking-wide flex items-center justify-center gap-1.5 shadow-lg shadow-destructive/30 shimmer-bg border border-destructive/50 rounded-lg">⚡ Flash Sale</Button>
              </Link>
              <Link to="/request-quote" onClick={() => setMobileOpen(false)}>
                <Button variant="accent" className="w-full mt-2">Request Quote</Button>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
