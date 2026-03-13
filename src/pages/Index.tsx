import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/context/QuoteContext';
import { categories, products, brands, industries } from '@/data/catalog';
import { Shield, Truck, Award, HeadphonesIcon, ArrowRight, FlaskConical, FileText } from 'lucide-react';
import heroImg from '@/assets/hero-lab.jpg';

const featuredProducts = products.filter(p => p.featured);

const features = [
  { icon: Shield, title: 'Certified Quality', description: 'All products meet international quality standards and certifications.' },
  { icon: Truck, title: 'Pan-India Delivery', description: 'Fast and reliable delivery to laboratories across India.' },
  { icon: Award, title: '30+ Years Experience', description: 'Trusted by thousands of labs since 1992.' },
  { icon: HeadphonesIcon, title: 'Expert Support', description: 'Dedicated technical support team for all your needs.' },
];

const Index = () => {
  const { addItem } = useQuote();

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[500px] sm:h-[560px] lg:h-[620px] flex items-center overflow-hidden">
        <img src={heroImg} alt="Laboratory" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/80" />
        <div className="relative container-main">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-4">
              Trusted Laboratory Equipment Supplier
            </h1>
            <p className="text-primary-foreground/80 text-base sm:text-lg mb-8 leading-relaxed">
              Glassware, Consumables, Instruments, Safety Equipment, Laboratory Furniture, and Scientific Solutions
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products">
                <Button variant="hero" size="lg">Browse Products <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link to="/request-quote">
                <Button variant="hero-outline" size="lg">Request Quote <FileText className="h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-background">
        <div className="container-main">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Product Categories</h2>
            <p className="text-muted-foreground">Explore our comprehensive range of laboratory supplies</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products/${cat.slug}`}
                className="group bg-card rounded-xl border p-5 text-center card-hover"
              >
                <div className="w-14 h-14 mx-auto mb-3 bg-primary/5 rounded-lg flex items-center justify-center group-hover:bg-primary/10 btn-transition">
                  <FlaskConical className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{cat.name}</h3>
                <p className="text-xs text-muted-foreground">{cat.productCount} products</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-muted">
        <div className="container-main">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Our most requested laboratory products</p>
            </div>
            <Link to="/products" className="hidden sm:block">
              <Button variant="outline">View All <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.slice(0, 4).map((product) => (
              <div key={product.id} className="bg-card rounded-xl border overflow-hidden card-hover group">
                <div className="aspect-square bg-muted flex items-center justify-center p-6">
                  <FlaskConical className="h-16 w-16 text-primary/30" />
                </div>
                <div className="p-4">
                  <p className="text-xs text-accent font-medium mb-1">{product.brand}</p>
                  <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.shortDescription}</p>
                  <div className="flex gap-2">
                    <Link to={`/product/${product.slug}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">View Details</Button>
                    </Link>
                    <Button
                      variant="accent"
                      size="sm"
                      className="text-xs"
                      onClick={() => addItem({
                        id: product.id, name: product.name, brand: product.brand,
                        category: product.category, model: product.model, image: product.image
                      })}
                    >
                      Add to Quote
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="section-padding bg-background">
        <div className="container-main">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Brands We Supply</h2>
            <p className="text-muted-foreground">Partnering with leading manufacturers worldwide</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {brands.map((brand) => (
              <div key={brand.id} className="bg-card border rounded-lg p-4 flex items-center justify-center h-20 card-hover">
                <span className="text-sm font-semibold text-muted-foreground">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-muted">
        <div className="container-main">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Why Choose Avon Pharmo Chem?</h2>
            <p className="text-muted-foreground">Committed to quality and excellence</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-card rounded-xl border p-6 text-center card-hover">
                <div className="w-12 h-12 mx-auto mb-4 bg-accent/10 rounded-lg flex items-center justify-center">
                  <f.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="section-padding bg-background">
        <div className="container-main">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Industries We Serve</h2>
            <p className="text-muted-foreground">Providing solutions across diverse sectors</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {industries.map((ind) => (
              <div key={ind.id} className="bg-card border rounded-xl p-5 text-center card-hover">
                <div className="text-3xl mb-2">{ind.icon}</div>
                <h3 className="text-sm font-semibold text-foreground">{ind.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary">
        <div className="container-main py-12 lg:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">
            Need a Custom Quotation?
          </h2>
          <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
            Send us your requirements and our team will provide you with competitive pricing within 24 hours.
          </p>
          <Link to="/request-quote">
            <Button variant="hero" size="lg">Request a Quote Today <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </section>

      {/* Contact Strip */}
      <section className="section-padding bg-muted">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Get In Touch</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>📍 123 Industrial Area, Ahmedabad, Gujarat 380015, India</p>
                <p>📞 +91 79 2583 1234</p>
                <p>✉️ info@avonpc.com</p>
              </div>
              <Link to="/contact" className="mt-4 inline-block">
                <Button variant="outline">Contact Us <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </div>
            <div className="bg-card rounded-xl border h-48 lg:h-auto flex items-center justify-center text-muted-foreground text-sm">
              Map Placeholder
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
