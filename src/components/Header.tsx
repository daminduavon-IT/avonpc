import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/context/QuoteContext';
import avonLogo from '@/assets/avon-logo.png';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
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
  { label: 'Contact Us', path: '/contact' },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const { itemCount, setIsOpen } = useQuote();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <>
      {/* Top info bar */}
      <div className="bg-topbar text-topbar-foreground text-xs sm:text-sm">
        <div className="container-main flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <span>📞 +91 79 2583 1234</span>
            <span className="hidden sm:inline">✉️ info@avonpc.com</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hover:underline">Login</Link>
            <span>|</span>
            <Link to="/register" className="hover:underline">Register</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 bg-card shadow-sm border-b">
        <div className="container-main flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src={avonLogo} alt="Avon Pharmo Chem" className="h-10 lg:h-14 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.path}
                className="relative"
                onMouseEnter={() => item.children && setDropdownOpen(item.label)}
                onMouseLeave={() => setDropdownOpen(null)}
              >
                <Link
                  to={item.path}
                  className={`px-3 py-2 text-sm font-medium rounded-md btn-transition flex items-center gap-1 ${
                    isActive(item.path) ? 'text-primary bg-primary/5' : 'text-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {item.label}
                  {item.children && <ChevronDown className="h-3 w-3" />}
                </Link>
                {item.children && dropdownOpen === item.label && (
                  <div className="absolute top-full left-0 w-56 bg-card rounded-lg shadow-lg border py-2 animate-fade-in">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary btn-transition"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-md hover:bg-muted btn-transition"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-foreground" />
            </button>

            {/* Quote cart */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 rounded-md hover:bg-muted btn-transition"
              aria-label="Quote cart"
            >
              <FileText className="h-5 w-5 text-foreground" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Request Quote CTA */}
            <Link to="/request-quote" className="hidden sm:block">
              <Button variant="accent" size="sm">Request Quote</Button>
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-muted"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t bg-card animate-fade-in">
            <div className="container-main py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products, categories, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t bg-card animate-fade-in">
            <div className="container-main py-4 space-y-1">
              {navItems.map((item) => (
                <div key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2.5 text-sm font-medium rounded-md ${
                      isActive(item.path) ? 'text-primary bg-primary/5' : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="pl-6 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link to="/request-quote" onClick={() => setMobileOpen(false)}>
                <Button variant="accent" className="w-full mt-3">Request Quote</Button>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
