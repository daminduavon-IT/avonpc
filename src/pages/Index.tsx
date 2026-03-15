import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/context/QuoteContext';
import { industries } from '@/data/catalog';
import { getProducts, getCategories, FirestoreProduct, FirestoreCategory } from '@/lib/firestore-services';
import { useSettings } from '@/context/SettingsContext';
import { Shield, Truck, Award, HeadphonesIcon, ArrowRight, FlaskConical, FileText, Loader2, CheckCircle2, Plus, Phone, Mail, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import heroImgPlaceholder from '@/assets/hero-lab.jpg';

const features = [
  { icon: Shield, title: 'Certified Quality', description: 'All products meet international quality standards and certifications.' },
  { icon: Truck, title: 'Pan-India Delivery', description: 'Fast and reliable delivery to laboratories across India.' },
  { icon: Award, title: '30+ Years Experience', description: 'Trusted by thousands of labs since 1992.' },
  { icon: HeadphonesIcon, title: 'Expert Support', description: 'Dedicated technical support team for all your needs.' },
];

const Index = () => {
  const { addItem, items } = useQuote();
  const { settings } = useSettings();
  const [featuredProducts, setFeaturedProducts] = useState<FirestoreProduct[]>([]);
  const [categories, setCategories] = useState<FirestoreCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const isInCart = (id?: string) => !!id && items.some(i => i.id === id);

  const carouselSlides = settings?.heroCarousel && settings.heroCarousel.length >= 4
    ? settings.heroCarousel
    : [
      {
        image: heroImgPlaceholder,
        titleLine1: 'Trusted',
        titleLine2: 'Equipment Supplier',
        highlightWord: 'Laboratory',
        subtitle: 'Glassware • Instruments • Safety Equipment • Lab Furniture'
      }
    ];

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => setSelectedIndex(emblaApi.selectedScrollSnap()));

    const intervalId = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [emblaApi]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getProducts({ featured: true, status: 'active' }),
          getCategories()
        ]);
        setFeaturedProducts(fetchedProducts);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero Carousel */}
      <section className="relative h-[450px] sm:h-[550px] lg:h-[650px] overflow-hidden bg-gray-900">
        <div className="embla h-full" ref={emblaRef}>
          <div className="embla__container h-full">
            {carouselSlides.map((slide, idx) => (
              <div key={idx} className="embla__slide relative h-full min-w-full">
                <img src={slide.image || heroImgPlaceholder} alt={`Slide ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative h-full flex items-center justify-center text-center px-4">
                  <div className="max-w-4xl animate-fade-in">
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-4 tracking-tight">
                      {slide.titleLine1}{' '}
                      <span className="text-[#00ffcc]">{slide.highlightWord}</span><br />
                      {slide.titleLine2}
                    </h1>
                    <p className="text-white/90 text-lg sm:text-xl lg:text-2xl mb-10 font-medium tracking-wide">
                      {slide.subtitle}
                    </p>
                    <div className="flex justify-center">
                      <Link to="/products">
                        <Button className="bg-[#ea7000] hover:bg-[#d66600] text-white px-10 py-7 text-lg font-bold rounded-lg shadow-xl uppercase tracking-wider transition-all hover:scale-105 active:scale-95">
                          Browse Products
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {carouselSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2.5 transition-all rounded-full ${selectedIndex === i ? 'w-8 bg-[#ea7000]' : 'w-2.5 bg-white/50 hover:bg-white'}`}
            />
          ))}
        </div>

        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white/50 hover:bg-black/40 hover:text-white transition-all hidden sm:block"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white/50 hover:bg-black/40 hover:text-white transition-all hidden sm:block"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </section>

      {/* Categories */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container-main">
          <div className="text-center mb-16">
            <span className="text-primary font-bold uppercase tracking-widest text-xs mb-3 block">Premium Range</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Product Categories</h2>
            <div className="h-1 w-20 bg-[#ea7000] mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products/${cat.slug}`}
                className="group flex flex-col items-center"
              >
                <div className="w-full aspect-square bg-[#f8f9fa] rounded-3xl border border-gray-100 p-8 mb-6 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary/5 group-hover:-translate-y-2 group-hover:border-primary/20 relative overflow-hidden flex items-center justify-center">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <FlaskConical className="h-16 w-16 text-primary/20 transition-transform duration-500 group-hover:scale-110" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 text-center tracking-tight group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="text-sm text-gray-400 text-center mt-1 font-medium">{cat.description ? 'Explore Range' : 'View Products'}</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => {
              const inCart = isInCart(product.id);
              return (
                <div key={product.id} className="bg-card rounded-2xl border overflow-hidden card-hover group flex flex-col h-full">
                  <Link to={`/product/${product.slug}`} className="aspect-square bg-muted relative overflow-hidden flex items-center justify-center shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <FlaskConical className="h-14 w-14 text-primary/20 transition-transform duration-500 group-hover:scale-110" />
                    )}
                    <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Featured</span>
                  </Link>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-auto">
                      <p className="text-xs text-accent font-bold mb-1 uppercase tracking-tight">{product.brand}</p>
                      <Link to={`/product/${product.slug}`}>
                        <h3 className="font-bold text-foreground mb-1 line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
                      </Link>
                      <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{product.shortDescription}</p>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-border/50">
                      <Link to={`/product/${product.slug}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs font-semibold h-9 rounded-lg">Details</Button>
                      </Link>
                      <Button
                        variant={inCart ? 'outline' : 'accent'}
                        size="sm"
                        className={`flex-1 text-xs font-semibold h-9 rounded-lg flex items-center justify-center gap-1.5 transition-all ${inCart ? 'bg-primary/5 border-primary text-primary hover:bg-primary/10' : ''}`}
                        onClick={() => !inCart && addItem({
                          id: product.id!, name: product.name, brand: product.brand,
                          category: product.category, model: product.model, image: product.image
                        })}
                      >
                        {inCart ? <><CheckCircle2 className="h-3.5 w-3.5" /> In Cart</> : <><Plus className="h-3.5 w-3.5" /> Quote</>}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Brands (Hidden for now until we migrate to DB) */}
      {/* 
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
      */}

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
                <p>📍 {settings?.locations?.[0]?.address || '123 Industrial Area, Ahmedabad, Gujarat 380015, India'}</p>
                <p>📞 {settings?.phone || '+91 79 2583 1234'}</p>
                <p>✉️ {settings?.email || 'info@avonpc.com'}</p>
              </div>
              <Link to="/contact" className="mt-4 inline-block">
                <Button variant="outline">Contact Us <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </div>
            <div className="bg-card rounded-xl border h-48 lg:h-auto overflow-hidden">
              {settings?.locations?.[0]?.mapLink ? (
                <iframe
                  src={settings.locations[0].mapLink}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Map Placeholder
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
