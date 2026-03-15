import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import avonLogo from '@/assets/avon-logo.png';

const Footer = () => {
  const { settings } = useSettings();
  const mainLocation = settings?.locations?.[0];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-main py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <img src={avonLogo} alt="Avon Pharmo Chem" className="h-10 mb-4 brightness-0 invert" />
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Your trusted partner for laboratory equipment, scientific instruments, and pharma supplies since 1992.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {[
                { label: 'About Us', path: '/about' },
                { label: 'Products', path: '/products' },
                { label: 'Brands', path: '/brands' },
                { label: 'Industries', path: '/industries' },
                { label: 'Quality', path: '/quality' },
                { label: 'Request Quote', path: '/request-quote' },
              ].map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="hover:text-primary-foreground btn-transition">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Products</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {['Glassware', 'Consumables', 'Lab Instruments', 'Safety Equipment', 'Fume Hoods', 'Laminar Flow', 'Lab Furniture'].map(cat => (
                <li key={cat}>
                  <Link to="/products" className="hover:text-primary-foreground btn-transition">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{mainLocation?.address || '123 Industrial Area, Ahmedabad, Gujarat 380015, India'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{mainLocation?.phone || settings?.phone || '+91 79 2583 1234'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>{mainLocation?.email || settings?.email || 'info@avonpc.com'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-main py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-primary-foreground/50">
          <p>© {new Date().getFullYear()} {settings?.companyName || 'Avon Pharmo Chem (Pvt) Ltd'}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-primary-foreground">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary-foreground">Terms & Conditions</Link>
            <Link to="/sitemap" className="hover:text-primary-foreground">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
