import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/context/QuoteContext';
import { FirestoreProduct } from '@/lib/firestore-services';
import { FlaskConical, CheckCircle2, Plus, PackageOpen, Tag } from 'lucide-react';

interface ProductCardProps {
  product: FirestoreProduct;
  view: 'grid' | 'list';
  industryNames?: string[];
}

const ProductCard = ({ product, view, industryNames = [] }: ProductCardProps) => {
  const { addItem, items } = useQuote();
  const inCart = !!product.id && items.some((i) => i.productId === product.id);
  const hasVariants = product.variants && product.variants.length > 0;

  const handleQuoteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart && product.id) {
      addItem({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        model: product.model,
        image: product.image,
        price: product.price,
      });
    }
  };

  const hasPrice = product.price !== undefined && product.price !== null;
  const hasMultipleBadges = product.featured || product.stockQty || hasPrice;

  if (view === 'list') {
    return (
      <div className="bg-card rounded-2xl border p-4 flex flex-col sm:flex-row gap-5 card-hover group shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20">
        <Link
          to={`/product/${product.slug}`}
          className="w-full sm:w-40 h-40 bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative"
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          ) : (
            <FlaskConical className="h-12 w-12 text-primary/20 transition-transform duration-700 ease-out group-hover:scale-110" />
          )}

          {/* Floating Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 items-start">
            {product.featured && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                Featured
              </span>
            )}
            {product.stockQty && (
              <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-sm">
                <PackageOpen className="h-3 w-3" />
                {product.stockQty}
              </span>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0 py-1 flex flex-col">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded-sm">
                {product.brand}
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {product.sku || product.model || 'N/A'}
              </span>
            </div>
            <Link to={`/product/${product.slug}`}>
              <h3 className="text-xl font-bold text-foreground mb-1 hover:text-primary transition-colors line-clamp-2 leading-tight">
                {product.name}
              </h3>
            </Link>
            
            {industryNames.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {industryNames.map((name, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-bold bg-muted text-foreground/70 px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider border border-border/50"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
            <p className="text-sm text-muted-foreground line-clamp-2 max-w-3xl leading-relaxed">
              {product.shortDescription}
            </p>
          </div>
          
          <div className="flex items-end justify-between gap-4 mt-6">
            <div className="flex flex-col">
              {hasPrice && (
                <>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Price</span>
                  <span className="text-xl font-black text-foreground">Rs. {product.price?.toFixed(2)}</span>
                </>
              )}
            </div>
            <div className="flex gap-2.5 flex-shrink-0">
              <Link to={`/product/${product.slug}`}>
                <Button variant="outline" size="sm" className="text-xs font-semibold h-10 rounded-lg px-6 hover:bg-secondary hover:text-secondary-foreground border-border/60">
                  View Details
                </Button>
              </Link>
              {hasVariants ? (
                 <Link to={`/product/${product.slug}`}>
                   <Button variant="accent" size="sm" className="text-xs font-bold h-10 rounded-lg px-6 flex items-center gap-2 transition-all shadow-sm hover:shadow-md">
                     Select Option
                   </Button>
                 </Link>
              ) : (
                <Button
                  variant={inCart ? 'outline' : 'accent'}
                  size="sm"
                  className={`text-xs font-bold h-10 rounded-lg px-6 flex items-center gap-2 transition-all shadow-sm ${
                    inCart ? 'bg-primary/5 border-primary text-primary hover:bg-primary/10' : 'hover:shadow-md'
                  }`}
                  onClick={handleQuoteClick}
                >
                  {inCart ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> In Quote Cart
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Add to Quote
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="bg-card rounded-2xl border border-border/60 overflow-hidden card-hover group flex flex-col h-full shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20">
      <Link
        to={`/product/${product.slug}`}
        className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden flex items-center justify-center shrink-0"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <FlaskConical className="h-16 w-16 text-primary/10 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:text-primary/20" />
        )}
        
        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
          {product.featured && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-md">
              Featured
            </span>
          )}
          {product.stockQty && (
            <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-md flex items-center gap-1 backdrop-blur-sm">
              <PackageOpen className="h-3 w-3" />
              {product.stockQty}
            </span>
          )}
        </div>
      </Link>
      
      <div className="p-5 flex flex-col flex-1 bg-gradient-to-b from-transparent to-muted/10">
        <div className="mb-auto">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[10px] text-accent font-black uppercase tracking-widest bg-accent/10 px-2 py-1 rounded-sm">
              {product.brand}
            </p>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium bg-card px-2 py-1 rounded-sm border">
               {product.sku || product.model || 'N/A'}
            </span>
          </div>
          
          <Link to={`/product/${product.slug}`}>
            <h3 className="text-lg font-bold text-foreground mb-2.5 line-clamp-2 leading-tight hover:text-primary transition-colors group-hover:underline">
              {product.name}
            </h3>
          </Link>
          
          {industryNames.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {industryNames.slice(0, 3).map((name, i) => (
                <span
                  key={i}
                  className="text-[9px] font-bold bg-muted text-foreground/70 px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider border border-border/50"
                >
                  {name}
                </span>
              ))}
              {industryNames.length > 3 && (
                <span className="text-[9px] font-bold bg-muted text-foreground/70 px-1.5 py-0.5 rounded flex items-center uppercase tracking-wider border border-border/50">
                  +{industryNames.length - 3}
                </span>
              )}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        <div className="pt-4 mt-2 border-t border-border/50">
          {hasPrice && (
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Price</span>
              <span className="text-lg font-black text-foreground">Rs. {product.price?.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex gap-2">
            <Link to={`/product/${product.slug}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-xs font-semibold h-9 rounded-lg border-border/60 hover:bg-secondary hover:text-secondary-foreground transition-all">
                Details
              </Button>
            </Link>
            {hasVariants ? (
               <Link to={`/product/${product.slug}`} className="flex-1">
                 <Button variant="accent" size="sm" className="w-full text-xs font-bold h-9 rounded-lg flex items-center justify-center transition-all shadow-sm hover:shadow-md">
                   Select
                 </Button>
               </Link>
            ) : (
              <Button
                variant={inCart ? 'outline' : 'accent'}
                size="sm"
                className={`flex-1 text-xs font-bold h-9 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                  inCart ? 'bg-primary/5 border-primary text-primary hover:bg-primary/10' : 'hover:shadow-md'
                }`}
                onClick={handleQuoteClick}
              >
                {inCart ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Carted
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" /> Quote
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
