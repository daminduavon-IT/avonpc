import { Link } from 'react-router-dom';

const links = [
  { title: 'Main Pages', items: [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Products', path: '/products' },
    { label: 'Brands', path: '/brands' },
    { label: 'Industries', path: '/industries' },
    { label: 'Quality & Certifications', path: '/quality' },
    { label: 'Request Quote', path: '/request-quote' },
    { label: 'Contact Us', path: '/contact' },
  ]},
  { title: 'Product Categories', items: [
    { label: 'Glassware', path: '/products/glassware' },
    { label: 'Consumables', path: '/products/consumables' },
    { label: 'Laboratory Instruments', path: '/products/laboratory-instruments' },
    { label: 'Safety Equipment', path: '/products/safety-equipment' },
    { label: 'Fume Hood', path: '/products/fume-hood' },
    { label: 'Laminar Flow', path: '/products/laminar-flow' },
    { label: 'Laboratory Furniture', path: '/products/laboratory-furniture' },
  ]},
  { title: 'Account', items: [
    { label: 'Login', path: '/login' },
    { label: 'Register', path: '/register' },
    { label: 'My Account', path: '/my-account' },
  ]},
  { title: 'Legal', items: [
    { label: 'Privacy Policy', path: '/privacy-policy' },
    { label: 'Terms & Conditions', path: '/terms' },
  ]},
];

const Sitemap = () => (
  <div>
    <section className="bg-primary py-16">
      <div className="container-main text-center">
        <h1 className="text-3xl font-bold text-primary-foreground">Sitemap</h1>
      </div>
    </section>
    <section className="section-padding bg-background">
      <div className="container-main max-w-3xl">
        <div className="grid sm:grid-cols-2 gap-8">
          {links.map((group, i) => (
            <div key={i}>
              <h2 className="text-lg font-bold text-foreground mb-3">{group.title}</h2>
              <ul className="space-y-2">
                {group.items.map((item, j) => (
                  <li key={j}>
                    <Link to={item.path} className="text-sm text-muted-foreground hover:text-primary btn-transition">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default Sitemap;
