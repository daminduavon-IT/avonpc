import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ChevronRight, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import avonLogo from '@/assets/avon-logo.png';

const Footer = () => {
  const { settings } = useSettings();
  const mainLocation = settings?.locations?.[0];

  return (
    <footer className="bg-[#0C4C04] text-slate-300 relative overflow-hidden pt-20 border-t-4 border-[#00D289]">
      {/* Decorative Grid SVG Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      <div className="container-main relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Column (Col Span 4) */}
          <div className="lg:col-span-4 lg:pr-8 flex flex-col items-start">
            <div className="bg-white/10 p-3 rounded-2xl mb-6 backdrop-blur-md border border-white/5 shadow-xl">
              <img src={avonLogo} alt="Avon Pharmo Chem" className="h-14 w-auto object-contain" />
            </div>
            <p className="text-sm leading-relaxed text-slate-400 mb-8 max-w-sm">
              Sri Lanka's premier destination for scientific instruments, laboratory equipment, and healthcare consumables since 1992. Enabling cutting-edge research through uncompromising quality.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#ea7000] hover:border-[#ea7000] hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links (Col Span 2) */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-black uppercase tracking-[0.15em] text-sm mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00D289]"></span> Discover
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', path: '/about' },
                { label: 'Our Products', path: '/products' },
                { label: 'Brand Partners', path: '/brands' },
                { label: 'Industries Served', path: '/industries' },
                { label: 'Request a Quote', path: '/request-quote' },
              ].map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="group flex items-center text-sm font-medium hover:text-[#00D289] transition-colors">
                    <ChevronRight className="h-3 w-3 mr-2 text-slate-600 group-hover:text-[#00D289] transition-colors" /> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories (Col Span 3) */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-black uppercase tracking-[0.15em] text-sm mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ea7000]"></span> Categories
            </h4>
            <ul className="space-y-3">
              {['Laboratory Glassware', 'Scientific Instruments', 'Healthcare Consumables', 'Molecular Biology', 'Industrial Safety', 'Cleanroom Supplies'].map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${encodeURIComponent(cat)}`} className="group flex items-center text-sm font-medium hover:text-[#ea7000] transition-colors">
                    <ChevronRight className="h-3 w-3 mr-2 text-slate-600 group-hover:text-[#ea7000] transition-colors" /> {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details (Col Span 3) */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-black uppercase tracking-[0.15em] text-sm mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Reach Us
            </h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors hover:shadow-lg">
                <MapPin className="h-5 w-5 text-[#00D289] shrink-0 mt-0.5" />
                <span className="text-sm font-medium leading-relaxed">{mainLocation?.address || 'Avon Pharmo Chem (Pvt) Ltd, Colombo, Sri Lanka'}</span>
              </li>
              <li className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors hover:shadow-lg">
                <Phone className="h-5 w-5 text-[#ea7000] shrink-0" />
                <span className="text-sm font-bold tracking-wide">{mainLocation?.phone || settings?.phone || '+94 11 234 5678'}</span>
              </li>
              <li className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors hover:shadow-lg">
                <Mail className="h-5 w-5 text-blue-400 shrink-0" />
                <span className="text-sm font-medium">{mainLocation?.email || settings?.email || 'sales@avonpc.com'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom Strip */}
      <div className="border-t border-white/10 bg-black/20 relative z-10">
        <div className="container-main py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500 tracking-wide">
          <p>
            &copy; {new Date().getFullYear()} <span className="text-white">{settings?.companyName || 'AVON PHARMO CHEM (PVT) LTD'}</span>. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">PRIVACY POLICY</Link>
            <Link to="/terms" className="hover:text-white transition-colors">TERMS OF SERVICE</Link>
            <Link to="/sitemap" className="hover:text-white transition-colors">SITEMAP</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
