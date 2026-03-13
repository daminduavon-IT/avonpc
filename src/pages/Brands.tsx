import { Link } from 'react-router-dom';
import { brands, products } from '@/data/catalog';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Brands = () => (
  <div>
    <section className="bg-primary py-16 lg:py-20">
      <div className="container-main text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">Our Brands</h1>
        <p className="text-primary-foreground/70 max-w-2xl mx-auto">We partner with the world's leading manufacturers to bring you the best laboratory products.</p>
      </div>
    </section>

    <section className="section-padding bg-background">
      <div className="container-main">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map(brand => {
            const brandProducts = products.filter(p => p.brand === brand.name);
            return (
              <div key={brand.id} className="bg-card rounded-xl border p-6 card-hover">
                <div className="h-16 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-muted-foreground">{brand.name}</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{brand.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{brand.description}</p>
                <p className="text-xs text-muted-foreground mb-4">{brandProducts.length} products available</p>
                <Link to={`/products`}>
                  <Button variant="outline" size="sm" className="text-xs">View Products <ArrowRight className="h-3 w-3" /></Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  </div>
);

export default Brands;
