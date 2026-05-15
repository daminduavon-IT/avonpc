import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/context/QuoteContext';
import { getProductBySlug, getProducts, getIndustries, FirestoreProduct, FirestoreIndustry, ProductVariant } from '@/lib/supabase-services';
import { ChevronRight, Download, FlaskConical, CheckCircle2, Loader2, Plus, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/context/SettingsContext';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addItem, items, setIsOpen } = useQuote();
  const { settings } = useSettings();
  const [product, setProduct] = useState<FirestoreProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<FirestoreProduct[]>([]);
  const [dbIndustries, setDbIndustries] = useState<FirestoreIndustry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const isInCart = !!product?.id && items.some(i => i.id === product.id);

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
        setActiveImage(productData?.image || null);
        // Auto-select first variant if any
        if (productData?.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
        setDbIndustries(indData);

        if (productData) {
          // Fetch related products from the same category
          const related = await getProducts({ category: productData.category, status: 'active' });
          setRelatedProducts(related.filter(p => p.id !== productData.id).slice(0, 4));
        }
      } catch {
        // product not found or network error
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
          {/* Left: Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="relative group">
              <div className="bg-card border-2 border-muted rounded-3xl aspect-square flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <FlaskConical className="h-32 w-32 text-primary/10 transition-transform duration-700 group-hover:scale-110" />
                )}
              </div>
              {product.featured && !product.isFlashSale && (
                <span className="absolute top-6 left-6 bg-accent text-accent-foreground text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Featured</span>
              )}
              {product.isFlashSale && (
                <span className="absolute top-6 left-6 shimmer-bg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-full shadow-xl shadow-amber-500/40 flex items-center gap-2 border border-white/20">
                  ⚡ Flash Sale
                </span>
              )}
            </div>
            {/* Thumbnail strip — shown only when product has multiple images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {[product.image, ...product.images.filter(img => img !== product.image)].filter(Boolean).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`shrink-0 h-20 w-20 rounded-xl border-2 overflow-hidden transition-all ${activeImage === img ? 'border-primary shadow-md' : 'border-muted hover:border-primary/50'}`}
                  >
                    <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <span className="inline-block text-accent font-black text-xs uppercase tracking-[0.2em] mb-3">{product.brand}</span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4 leading-tight">{product.name}</h1>
              <div className="flex flex-wrap gap-4 text-xs font-bold mb-8">
                <span className="bg-muted px-4 py-2 rounded-xl text-muted-foreground flex items-center">Category: <span className="text-foreground ml-1">{product.category}</span></span>
                <span className="bg-muted px-4 py-2 rounded-xl text-muted-foreground flex items-center">Model: <span className="text-foreground ml-1">{product.model}</span></span>
                <span className="bg-muted px-4 py-2 rounded-xl text-muted-foreground flex items-center">SKU: <span className="text-foreground ml-1">{product.sku}</span></span>
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
              <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-xl">{product.shortDescription}</p>

              {/* Variant selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Select Variant</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${selectedVariant?.id === v.id ? 'border-primary bg-primary/5 text-primary' : 'border-muted text-muted-foreground hover:border-primary/50'}`}
                      >
                        {v.name}
                        {v.regularPrice && <span className="ml-2 text-xs font-normal">Rs {v.regularPrice.toLocaleString()}</span>}
                      </button>
                    ))}
                  </div>
                  {selectedVariant && (
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {selectedVariant.sku && <span className="bg-muted px-3 py-1 rounded-lg">SKU: <span className="text-foreground font-medium">{selectedVariant.sku}</span></span>}
                      {selectedVariant.model && <span className="bg-muted px-3 py-1 rounded-lg">Model: <span className="text-foreground font-medium">{selectedVariant.model}</span></span>}
                      {selectedVariant.stock !== undefined && <span className="bg-muted px-3 py-1 rounded-lg">Stock: <span className="text-foreground font-medium">{selectedVariant.stock}</span></span>}
                    </div>
                  )}
                </div>
              )}

              {/* Price block — reads from selected variant if present */}
              {(selectedVariant?.isFlashSale || (!selectedVariant && product.isFlashSale)) ? (
                <div className="mb-10 max-w-xl glass-panel glass-glow rounded-3xl p-8 border-amber-500/40">
                  <div className="mb-6 space-y-3">
                    <div className="flex justify-between text-sm font-black text-amber-500 uppercase tracking-widest">
                      <span className="flex items-center gap-2">Limited Stock</span>
                      <span className="animate-pulse flex items-center gap-1.5">⚡ Exclusive Offer</span>
                    </div>
                    <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full w-[85%]" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-4 mt-2">
                    {(selectedVariant?.flashSalePrice ?? product.flashSalePrice) && (
                      <span className="gold-gradient-text text-5xl tracking-tighter">
                        Rs {(selectedVariant?.flashSalePrice ?? product.flashSalePrice)!.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ) : (selectedVariant?.regularPrice ?? product.regularPrice) ? (
                <div className="mb-10 max-w-xl bg-muted/30 border border-border/50 rounded-2xl p-6">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Price</p>
                  <p className="text-4xl font-black text-foreground">
                    Rs {(selectedVariant?.regularPrice ?? product.regularPrice)!.toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className="mb-10 relative overflow-hidden flex items-center bg-muted/30 border border-border/50 rounded-2xl p-6 max-w-xl">
                  <span className="absolute -right-4 top-1/2 -translate-y-1/2 text-8xl font-black text-muted/30 select-none pointer-events-none whitespace-nowrap tracking-tighter">QUOTE</span>
                  <div className="relative z-10 space-y-2">
                    <p className="font-bold text-foreground text-lg">Interested in this product?</p>
                    <p className="text-sm text-muted-foreground mb-4">Request a personalized quote and technical specifications sheet.</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button
                  variant={isInCart ? 'outline' : 'accent'}
                  size="lg"
                  className={`flex-1 flex items-center justify-center gap-3 h-14 text-base font-bold rounded-2xl transition-all shadow-md active:scale-95 ${isInCart ? 'border-primary text-primary bg-primary/5 hover:bg-primary/10' : ''}`}
                  onClick={() => {
                    if (isInCart) {
                      setIsOpen(true);
                    } else if (product.id) {
                      const itemName = selectedVariant ? `${product.name} — ${selectedVariant.name}` : product.name;
                      const itemModel = selectedVariant?.model || product.model;
                      addItem({ id: product.id + (selectedVariant ? `-${selectedVariant.id}` : ''), name: itemName, brand: product.brand, category: product.category, model: itemModel, image: product.image });
                      toast.success('Added to quote cart!');
                    }
                  }}
                >
                  {isInCart ? <><CheckCircle2 className="h-5 w-5" /> View in Quote Cart</> : <><Plus className="h-5 w-5" /> Add to Quote</>}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14 text-base font-bold rounded-2xl gap-2 active:scale-95 shadow-sm disabled:opacity-50"
                  disabled={!(selectedVariant?.specSheetUrl || product.specSheetUrl)}
                  onClick={() => { const url = selectedVariant?.specSheetUrl || product.specSheetUrl; url && window.open(url, '_blank'); }}
                >
                  <Download className="h-5 w-5" /> Technical Spec
                </Button>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="bg-muted/40 rounded-3xl p-8 border">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-6">Product Specifications</h3>
              <div className="grid gap-4">
                {(product.specifications ?? []).slice(0, 6).map((spec, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm text-muted-foreground font-medium">{spec.label}</span>
                    <span className="text-sm text-foreground font-bold">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Details & Features Tabs */}
        <div className="mt-20 lg:mt-32 space-y-20 lg:space-y-32">
          {/* Main Content */}
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-20">
            <div className="lg:col-span-3">
              <h2 className="text-2xl lg:text-3xl font-black text-foreground mb-6 relative">
                Product Overview
                <span className="absolute -bottom-2 left-0 w-12 h-1.5 bg-primary rounded-full" />
              </h2>
              <div className="prose prose-sm lg:prose-base max-w-none text-muted-foreground leading-relaxed whitespace-pre-line bg-card border rounded-3xl p-8 lg:p-10 shadow-sm">
                {product.fullDescription}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-12">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <div className="h-8 w-1 bg-accent rounded-full" /> Key Features
                </h3>
                <ul className="grid gap-4">
                  {(product.features ?? []).map((f, i) => (
                    <li key={i} className="flex items-start gap-4 text-muted-foreground bg-card border rounded-2xl p-4 shadow-sm hover:border-accent/40 transition-colors">
                      <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-sm lg:text-base font-medium leading-normal">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <div className="h-8 w-1 bg-primary rounded-full" /> Ideal Applications
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {(product.applications ?? []).map((a, i) => (
                    <li key={i} className="bg-primary/5 text-primary text-sm font-bold px-4 py-2 rounded-xl border border-primary/10 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mb-20">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl lg:text-3xl font-black text-foreground">You May Also Like</h2>
                <Link to="/products" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                  View All Products <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map(rp => {
                  const inCartRel = items.some(i => i.id === rp.id);
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
                            className={`flex-1 text-[10px] font-bold h-9 rounded-xl flex items-center justify-center gap-2 ${inCartRel ? 'bg-primary/5 border-primary text-primary' : ''}`}
                            onClick={() => {
                              if (!inCartRel && rp.id) {
                                addItem({ id: rp.id, name: rp.name, brand: rp.brand, category: rp.category, model: rp.model, image: rp.image });
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

          {/* Speak to an Expert Block */}
          {!product.isFlashSale && (
            <div className="glass-panel glass-glow rounded-3xl p-8 lg:p-12 border-primary/20 bg-primary/5 mt-20 relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 py-4">
                <div className="max-w-xl text-center md:text-left">
                  <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">Need specialized guidance?</h3>
                  <p className="text-muted-foreground leading-relaxed">Our clinical product experts are available to discuss technical specifications, customized pricing, and large-scale deployment options directly with you.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0 justify-center">
                  <div className="flex flex-col gap-1 items-center md:items-end justify-center px-6 border-r border-border/50 pr-8">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Call Direct</span>
                    <a href={`tel:${settings?.phone || ''}`} className="text-xl font-black text-foreground hover:text-primary transition-colors">
                      {settings?.phone || '+94 112 345 678'}
                    </a>
                  </div>
                  {settings?.phone && (
                    <a
                      href={`https://wa.me/${settings.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in the ${product.name} (${product.model}). Can an expert assist me?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-2xl font-bold font-sans shadow-lg shadow-[#25D366]/20 transition-all hover:scale-105 active:scale-95"
                    >
                      Speak on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
