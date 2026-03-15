import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getBrands, getProducts, FirestoreBrand, FirestoreProduct } from '@/lib/firestore-services';
import { ArrowRight, Loader2, Package } from 'lucide-react';

const Brands = () => {
  const [brandsList, setBrandsList] = useState<FirestoreBrand[]>([]);
  const [allProducts, setAllProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBrands(), getProducts({ status: 'active' })])
      .then(([b, p]) => { setBrandsList(b); setAllProducts(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-16 lg:py-20">
        <div className="container-main text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">Our Brands</h1>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto">
            We partner with the world's leading manufacturers to bring you the finest laboratory products.
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-main">
          {brandsList.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No brands listed yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {brandsList.map(brand => {
                const brandProducts = allProducts.filter(p => p.brand === brand.name);
                return (
                  <div key={brand.id} className="bg-card rounded-2xl border overflow-hidden card-hover group">
                    {/* Logo banner */}
                    <div className="h-44 bg-gradient-to-br from-muted to-muted/40 flex items-center justify-center p-8 border-b relative overflow-hidden">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-4xl font-black text-muted-foreground/20 tracking-tight">{brand.name}</span>
                      )}
                      {/* Product count badge */}
                      {brandProducts.length > 0 && (
                        <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                          {brandProducts.length} products
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-foreground text-lg mb-2">{brand.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{brand.description}</p>
                      <Link to={`/products?brand=${brand.slug}`}>
                        <Button variant="outline" size="sm" className="w-full group-hover:border-primary group-hover:text-primary transition-colors">
                          View Products <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Brands;
