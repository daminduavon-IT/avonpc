import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/context/QuoteContext';
import { products } from '@/data/catalog';
import { ChevronRight, Download, FlaskConical, CheckCircle2 } from 'lucide-react';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addItem } = useQuote();
  const product = products.find(p => p.slug === slug);

  if (!product) {
    return (
      <div className="container-main py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
        <Link to="/products"><Button variant="outline">Back to Products</Button></Link>
      </div>
    );
  }

  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-muted border-b">
        <div className="container-main py-3 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-primary">Products</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </div>
      </div>

      <div className="container-main py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="bg-muted rounded-xl aspect-square flex items-center justify-center">
            <FlaskConical className="h-32 w-32 text-primary/20" />
          </div>

          {/* Info */}
          <div>
            <p className="text-sm text-accent font-semibold mb-1">{product.brand}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{product.name}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
              <span>Category: <strong className="text-foreground">{product.category}</strong></span>
              <span>Model: <strong className="text-foreground">{product.model}</strong></span>
              <span>SKU: <strong className="text-foreground">{product.sku}</strong></span>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">{product.shortDescription}</p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Button variant="accent" size="lg"
                onClick={() => addItem({ id: product.id, name: product.name, brand: product.brand, category: product.category, model: product.model, image: product.image })}
              >
                Add to Quote
              </Button>
              <Button variant="outline" size="lg">
                <Download className="h-4 w-4" /> Download Brochure
              </Button>
            </div>

            {/* Specifications */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-foreground mb-3">Specifications</h3>
              <div className="border rounded-lg overflow-hidden">
                {product.specifications.map((spec, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'bg-muted' : 'bg-card'}`}>
                    <div className="w-1/3 px-4 py-2.5 text-sm font-medium text-foreground">{spec.label}</div>
                    <div className="flex-1 px-4 py-2.5 text-sm text-muted-foreground">{spec.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Full description */}
        <div className="mt-12 grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{product.fullDescription}</p>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3">Applications</h3>
              <ul className="space-y-2">
                {product.applications.map((a, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" /> {a}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3">Features</h3>
              <ul className="space-y-2">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProducts.map(p => (
                <Link key={p.id} to={`/product/${p.slug}`} className="bg-card rounded-xl border overflow-hidden card-hover">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    <FlaskConical className="h-12 w-12 text-primary/20" />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-accent font-medium mb-1">{p.brand}</p>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2">{p.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
