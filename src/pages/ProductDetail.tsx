import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/context/QuoteContext';
import { getProductBySlug, getProducts, getIndustries, FirestoreProduct, FirestoreIndustry, ProductVariant } from '@/lib/firestore-services';
import { ChevronRight, Download, FlaskConical, CheckCircle2, Loader2, Plus, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addItem, items, setIsOpen } = useQuote();
  const [product, setProduct] = useState<FirestoreProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<FirestoreProduct[]>([]);
  const [dbIndustries, setDbIndustries] = useState<FirestoreIndustry[]>([]);
  const [loading, setLoading] = useState(true);

  // Variant & Media State
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [mainImage, setMainImage] = useState<string>('');

  const currentCartId = selectedVariant ? `${product?.id}-${selectedVariant.id}` : product?.id;
  const isInCart = !!currentCartId && items.some(i => i.id === currentCartId);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!slug) return;
      setLoading(true);
      setProduct(null); // Reset product while fetching
      try {
        const [productData, indData] = await Promise.all([
          getProductBySlug(slug),
          getIndustries()
        ]);
        setProduct(productData);
        setDbIndustries(indData);

        if (productData) {
          setMainImage(productData.image || '');
          if (productData.variants && productData.variants.length > 0) {
            setSelectedVariant(productData.variants[0]);
          } else {
            setSelectedVariant(null);
          }

          // Fetch related products from the same category
          const related = await getProducts({ category: productData.category, status: 'active' });
          setRelatedProducts(related.filter(p => p.id !== productData.id).slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching product details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-main py-20 text-center">
        <FlaskConical className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">The product you're looking for might have been moved or removed.</p>
        <Link to="/products"><Button variant="accent">Back to All Products</Button></Link>
      </div>
    );
  }

  return (
    <div className="bg-background pb-20">
      {/* Breadcrumb */}
      <div className="bg-muted border-b">
        <div className="container-main py-3.5 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link to={`/products/${product.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-primary transition-colors">{product.category}</Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-semibold truncate">{product.name}</span>
        </div>
      </div>

      <div className="container-main pt-8 lg:pt-14">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20">
          {/* Left: Image Container & Gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative group">
              <div className="bg-card border-2 border-muted rounded-3xl aspect-[4/3] flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <FlaskConical className="h-32 w-32 text-primary/10 transition-transform duration-700 group-hover:scale-110" />
                )}
              </div>
              {product.featured && (
                <span className="absolute top-6 left-6 bg-accent text-accent-foreground text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Featured</span>
              )}
            </div>
            
            {/* Gallery Thumbnails */}
            {(product.gallery && product.gallery.length > 0) && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {product.image && (
                  <button 
                    onClick={() => setMainImage(product.image!)}
                    className={`shrink-0 w-24 h-24 rounded-xl border-2 overflow-hidden transition-all ${mainImage === product.image ? 'border-primary ring-2 ring-primary/20 ring-offset-1' : 'border-muted hover:border-primary/50'}`}
                  >
                    <img src={product.image} className="w-full h-full object-cover" alt="Main" />
                  </button>
                )}
                {product.gallery.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`shrink-0 w-24 h-24 rounded-xl border-2 overflow-hidden transition-all ${mainImage === img ? 'border-primary ring-2 ring-primary/20 ring-offset-1' : 'border-muted hover:border-primary/50'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-3 flex-wrap">
                <span className="inline-block text-accent font-black text-xs uppercase tracking-[0.2em]">{product.brand}</span>
                {product.isFlashSale && (
                  <span className="bg-destructive text-destructive-foreground flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm animate-pulse">
                     <Sparkles className="w-3.5 h-3.5"/> Flash Sale
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4 leading-tight">{product.name}</h1>
              
              {/* Dynamic Price */}
              {(selectedVariant?.price !== undefined || product.price !== undefined) && (
                 <div className="mb-6">
                   <span className="text-3xl lg:text-4xl font-black text-foreground">
                     Rs. {(selectedVariant?.price || product.price || 0).toFixed(2)}
                   </span>
                 </div>
              )}

              <div className="flex flex-wrap gap-4 text-xs font-bold mb-8">
                <span className="bg-muted px-4 py-2 rounded-xl text-muted-foreground flex items-center">Category: <span className="text-foreground ml-1">{product.category}</span></span>
                <span className="bg-muted px-4 py-2 rounded-xl text-muted-foreground flex items-center">Model: <span className="text-foreground ml-1">{selectedVariant?.sku || product.model}</span></span>
                <span className="bg-muted px-4 py-2 rounded-xl text-muted-foreground flex items-center">SKU: <span className="text-foreground ml-1">{selectedVariant?.sku || product.sku}</span></span>
                {product.industryIDs && product.industryIDs.length > 0 && (
                  <span className="bg-muted px-4 py-2 rounded-xl text-muted-foreground flex items-center gap-1.5">
                    Industries: 
                    <span className="flex gap-1 flex-wrap">
                      {product.industryIDs.map(id => {
                        const ind = dbIndustries.find(i => i.id === id);
                        return ind ? <span key={id} className="text-foreground bg-background/50 border border-border/50 px-2 py-0.5 rounded-md">{ind.name}</span> : null;
                      })}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-xl">
                {selectedVariant?.description || product.shortDescription}
              </p>

              {/* Advanced Variants UI */}
              {product.variants && product.variants.length > 0 && (
                 <div className="mb-10 space-y-4 bg-muted/30 p-6 border rounded-3xl">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-widest">
                       {product.selectionType || 'Select Option'}: 
                       <span className="text-primary">{selectedVariant?.selectionLabel}</span>
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                       {product.variants.map((v) => {
                          const isSelected = selectedVariant?.id === v.id;
                          return (
                             <button
                               key={v.id}
                               onClick={() => setSelectedVariant(v)}
                               className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm ${
                                 isSelected 
                                   ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/20 ring-offset-2 scale-105'
                                   : 'bg-card text-foreground border-border hover:border-primary/50 hover:bg-muted active:scale-95'
                               }`}
                             >
                               {v.selectionLabel}
                             </button>
                          )
                       })}
                    </div>
                    {/* Urgency Stock UI */}
                    {selectedVariant?.stockQty !== undefined && selectedVariant.stockQty <= 10 && selectedVariant.stockQty > 0 && (
                       <div className="mt-4 flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-xl border border-destructive/20 w-max">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span className="text-sm font-bold">Only {selectedVariant.stockQty} unit{selectedVariant.stockQty > 1 ? 's' : ''} left in stock!</span>
                       </div>
                    )}
                    {selectedVariant?.stockQty === 0 && (
                       <div className="mt-4 flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-xl border border-destructive/20 w-max">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span className="text-sm font-bold">Out of Stock</span>
                       </div>
                    )}
                 </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button
                  variant={isInCart ? 'outline' : 'accent'}
                  size="lg"
                  disabled={selectedVariant?.stockQty === 0}
                  className={`flex-1 flex items-center justify-center gap-3 h-14 text-base font-bold rounded-2xl transition-all shadow-md active:scale-95 ${isInCart ? 'border-primary text-primary bg-primary/5 hover:bg-primary/10' : ''}`}
                  onClick={() => {
                    if (isInCart) {
                      setIsOpen(true);
                    } else if (product.id) {
                      addItem({ 
                        productId: product.id, 
                        name: product.name, 
                        brand: product.brand, 
                        category: product.category, 
                        model: selectedVariant?.sku || product.model, 
                        image: mainImage || product.image || '',
                        price: selectedVariant?.price || product.price,
                        variantId: selectedVariant?.id,
                        variantLabel: selectedVariant?.selectionLabel
                      });
                      toast.success('Added to order cart!');
                    }
                  }}
                >
                  {isInCart ? <><CheckCircle2 className="h-5 w-5" /> View in Quote Cart</> : <><Plus className="h-5 w-5" /> Add to Quote</>}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14 text-base font-bold rounded-2xl gap-2 active:scale-95 shadow-sm disabled:opacity-50 border-border/60 hover:bg-secondary hover:text-secondary-foreground"
                  disabled={!product.specSheetUrl}
                  onClick={() => product.specSheetUrl && window.open(product.specSheetUrl, '_blank')}
                >
                  <Download className="h-5 w-5" /> View Manufacturer Datasheet
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 lg:mt-32 space-y-20 lg:space-y-32">
          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl lg:text-3xl font-black text-foreground">You May Also Like</h2>
                <Link to="/products" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                  View All Products <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map(rp => {
                  const inCartRel = items.some(i => i.productId === rp.id);
                  return (
                    <div key={rp.id} className="bg-card rounded-2xl border overflow-hidden card-hover group flex flex-col h-full shadow-sm hover:shadow-xl transition-all">
                      <Link to={`/product/${rp.slug}`} className="aspect-square bg-muted relative overflow-hidden flex items-center justify-center shrink-0">
                        {rp.image ? (
                          <img src={rp.image} alt={rp.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <FlaskConical className="h-14 w-14 text-primary/20 transition-transform duration-500 group-hover:scale-110" />
                        )}
                      </Link>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="mb-auto">
                          <p className="text-xs text-accent font-bold mb-1 uppercase tracking-tight">{rp.brand}</p>
                          <Link to={`/product/${rp.slug}`}>
                            <h4 className="font-bold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors text-sm">{rp.name}</h4>
                          </Link>
                        </div>
                        <div className="flex gap-2 pt-4 border-t border-border/50">
                          <Button
                            variant={inCartRel ? 'outline' : 'accent'}
                            size="sm"
                            className={`flex-1 text-[10px] font-bold h-9 rounded-xl flex items-center justify-center gap-2 transition-all ${inCartRel ? 'bg-primary/5 border-primary text-primary' : ''}`}
                            onClick={() => {
                              if (!inCartRel && rp.id) {
                                addItem({ 
                                  productId: rp.id, 
                                  name: rp.name, 
                                  brand: rp.brand, 
                                  category: rp.category, 
                                  model: rp.model, 
                                  image: rp.image || '',
                                  price: rp.price
                                });
                                toast.success('Added to quote cart!');
                              }
                            }}
                          >
                            {inCartRel ? <><CheckCircle2 className="h-3 w-3" /> In Cart</> : <><Plus className="h-3 w-3" /> Add Quote</>}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
