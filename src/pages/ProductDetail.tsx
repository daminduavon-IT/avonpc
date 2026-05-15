import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/context/QuoteContext';
import { getProductBySlug, getProducts, getIndustries, FirestoreProduct, FirestoreIndustry, ProductVariant } from '@/lib/supabase-services';
import { ChevronRight, Download, FlaskConical, CheckCircle2, Loader2, Plus, ArrowRight, Phone, MessageCircle, ShieldCheck, Truck, Award } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'applications'>('overview');

  const cartId = product?.id ? (selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id) : null;
  const isInCart = !!cartId && items.some(i => i.id === cartId);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!slug) return;
      setLoading(true);
      setProduct(null);
      setSelectedVariant(null);
      try {
        const [productData, indData] = await Promise.all([getProductBySlug(slug), getIndustries()]);
        setProduct(productData);
        setActiveImage(productData?.image || null);
        if (productData?.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
        setDbIndustries(indData);
        if (productData) {
          const related = await getProducts({ category: productData.category, status: 'active' });
          setRelatedProducts(related.filter(p => p.id !== productData.id).slice(0, 4));
        }
      } catch {
        // not found
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

  const displayPrice = selectedVariant?.regularPrice ?? product.regularPrice;
  const displayFlashPrice = selectedVariant?.flashSalePrice ?? product.flashSalePrice;
  const isFlashActive = selectedVariant ? selectedVariant.isFlashSale : product.isFlashSale;
  const allImages = [product.image, ...(product.images || []).filter(img => img !== product.image)].filter(Boolean) as string[];

  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/60 border-b">
        <div className="container-main py-3 flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
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
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="container-main py-10 lg:py-16">
        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mb-16">

          {/* LEFT: Image Gallery */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden bg-white border aspect-square shadow-sm">
              {activeImage ? (
                <img src={activeImage} alt={product.name} className="w-full h-full object-contain p-6" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FlaskConical className="h-28 w-28 text-primary/10" />
                </div>
              )}
              {/* Badges */}
              {product.isFlashSale && (
                <div className="absolute top-4 left-4">
                  <span className="bg-amber-500 text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                    ⚡ Flash Sale
                  </span>
                </div>
              )}
              {product.featured && !product.isFlashSale && (
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
                    Featured
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`shrink-0 h-16 w-16 rounded-xl border-2 overflow-hidden bg-white transition-all ${activeImage === img ? 'border-primary shadow-md scale-105' : 'border-muted hover:border-primary/40'}`}
                  >
                    <img src={img} alt={`view ${i + 1}`} className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { icon: ShieldCheck, label: 'Quality Certified' },
                { icon: Truck, label: 'Fast Delivery' },
                { icon: Award, label: '30+ Yrs Exp.' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 bg-muted/50 rounded-xl py-3 px-2 border">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="flex flex-col gap-6">
            {/* Brand + Title */}
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-accent">{product.brand}</span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mt-1 mb-3 leading-tight">{product.name}</h1>
              <p className="text-muted-foreground leading-relaxed">{product.shortDescription}</p>
            </div>

            {/* Meta tags */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Category', value: product.category },
                { label: 'Model', value: product.model },
                { label: 'SKU', value: product.sku },
              ].filter(m => m.value).map(m => (
                <span key={m.label} className="text-xs bg-muted border rounded-lg px-3 py-1.5 text-muted-foreground">
                  {m.label}: <span className="text-foreground font-semibold">{m.value}</span>
                </span>
              ))}
              {(product.industryIDs || []).map(id => {
                const ind = dbIndustries.find(i => i.id === id);
                return ind ? (
                  <span key={id} className="text-xs bg-primary/5 border border-primary/20 text-primary rounded-lg px-3 py-1.5 font-semibold">
                    {ind.name}
                  </span>
                ) : null;
              })}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Select Pack / Variant</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                        selectedVariant?.id === v.id
                          ? 'border-primary bg-primary text-white shadow-md'
                          : 'border-muted bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {v.name}
                      {v.regularPrice && (
                        <span className={`ml-2 text-xs font-normal ${selectedVariant?.id === v.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                          Rs {v.regularPrice.toLocaleString()}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {selectedVariant && (selectedVariant.sku || selectedVariant.model || selectedVariant.stock !== undefined) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedVariant.sku && <span className="text-xs bg-muted px-2.5 py-1 rounded-lg text-muted-foreground">SKU: <span className="text-foreground font-medium">{selectedVariant.sku}</span></span>}
                    {selectedVariant.model && <span className="text-xs bg-muted px-2.5 py-1 rounded-lg text-muted-foreground">Model: <span className="text-foreground font-medium">{selectedVariant.model}</span></span>}
                    {selectedVariant.stock !== undefined && <span className="text-xs bg-muted px-2.5 py-1 rounded-lg text-muted-foreground">Stock: <span className="text-foreground font-medium">{selectedVariant.stock}</span></span>}
                  </div>
                )}
              </div>
            )}

            {/* Price Block */}
            {isFlashActive ? (
              <div className="bg-amber-50 border-2 border-amber-400/50 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-amber-600">⚡ Flash Sale Price</span>
                  {product.flashSaleStock !== undefined && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg">
                      {product.flashSaleStock} left in stock
                    </span>
                  )}
                </div>
                {product.flashSaleStock !== undefined && (
                  <div className="h-1.5 w-full bg-amber-100 rounded-full mb-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (product.flashSaleStock / 100) * 100)}%` }}
                    />
                  </div>
                )}
                <p className="text-4xl font-black text-amber-600">
                  Rs {displayFlashPrice?.toLocaleString()}
                </p>
              </div>
            ) : displayPrice ? (
              <div className="bg-muted/40 border rounded-2xl p-5">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Price</p>
                <p className="text-4xl font-black text-foreground">Rs {displayPrice.toLocaleString()}</p>
              </div>
            ) : (
              <div className="bg-muted/40 border rounded-2xl p-5">
                <p className="text-sm font-bold text-foreground mb-0.5">Price on Request</p>
                <p className="text-xs text-muted-foreground">Add to cart and submit a quote request for pricing.</p>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant={isInCart ? 'outline' : 'accent'}
                size="lg"
                className={`flex-1 h-12 text-sm font-bold rounded-xl gap-2 transition-all ${isInCart ? 'border-primary text-primary bg-primary/5 hover:bg-primary/10' : ''}`}
                onClick={() => {
                  if (isInCart) {
                    setIsOpen(true);
                  } else if (product.id) {
                    addItem({
                      id: product.id + (selectedVariant ? `-${selectedVariant.id}` : ''),
                      name: selectedVariant ? `${product.name} — ${selectedVariant.name}` : product.name,
                      brand: product.brand,
                      category: product.category,
                      model: selectedVariant?.model || product.model,
                      image: product.image,
                    });
                    toast.success('Added to quote cart!');
                  }
                }}
              >
                {isInCart ? <><CheckCircle2 className="h-4 w-4" /> View in Cart</> : <><Plus className="h-4 w-4" /> Add to Quote</>}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 h-12 text-sm font-bold rounded-xl gap-2 disabled:opacity-40"
                disabled={!(selectedVariant?.specSheetUrl || product.specSheetUrl)}
                onClick={() => {
                  const url = selectedVariant?.specSheetUrl || product.specSheetUrl;
                  if (url) window.open(url, '_blank');
                }}
              >
                <Download className="h-4 w-4" /> Download Spec Sheet
              </Button>
            </div>

            {/* Contact strip */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t">
              <a
                href={`tel:${settings?.phone || ''}`}
                className="flex-1 flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 border rounded-xl px-4 py-3 text-sm font-bold text-foreground transition-colors"
              >
                <Phone className="h-4 w-4 text-primary" />
                {settings?.phone || 'Call for Pricing'}
              </a>
              {settings?.phone && (
                <a
                  href={`https://wa.me/${settings.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} (${product.model}). Please assist.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b558] text-white rounded-xl px-4 py-3 text-sm font-bold transition-colors"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp Us
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tab Section */}
        <div className="mb-16">
          <div className="flex gap-1 border-b mb-8">
            {(['overview', 'specs', 'applications'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-bold capitalize transition-all border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'overview' ? 'Overview' : tab === 'specs' ? 'Specifications' : 'Applications'}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-5 gap-10">
              <div className="lg:col-span-3">
                <div className="prose prose-sm lg:prose-base max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.fullDescription || <span className="italic text-muted-foreground/60">No description provided.</span>}
                </div>
              </div>
              <div className="lg:col-span-2">
                {(product.features ?? []).length > 0 && (
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-4 flex items-center gap-2">
                      <span className="h-4 w-1 bg-accent rounded-full inline-block" /> Key Features
                    </h3>
                    <ul className="space-y-2">
                      {product.features!.map((f, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-2xl">
              {(product.specifications ?? []).length > 0 ? (
                <div className="rounded-2xl border overflow-hidden">
                  {product.specifications!.map((spec, i) => (
                    <div key={i} className={`flex items-center justify-between px-5 py-3.5 text-sm ${i % 2 === 0 ? 'bg-muted/30' : 'bg-background'}`}>
                      <span className="text-muted-foreground font-medium">{spec.label}</span>
                      <span className="text-foreground font-bold text-right max-w-[55%]">{spec.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic text-sm">No specifications listed for this product.</p>
              )}
            </div>
          )}

          {activeTab === 'applications' && (
            <div>
              {(product.applications ?? []).length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {product.applications!.map((a, i) => (
                    <span key={i} className="bg-primary/5 text-primary border border-primary/15 text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" /> {a}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic text-sm">No applications listed for this product.</p>
              )}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t pt-12 pb-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-foreground">Related Products</h2>
              <Link to="/products" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map(rp => {
                const rpInCart = items.some(i => i.id === rp.id);
                return (
                  <div key={rp.id} className="bg-card rounded-2xl border overflow-hidden group flex flex-col hover:shadow-lg transition-all">
                    <Link to={`/product/${rp.slug}`} className="aspect-square bg-white flex items-center justify-center overflow-hidden p-3">
                      {rp.image ? (
                        <img src={rp.image} alt={rp.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <FlaskConical className="h-12 w-12 text-primary/20" />
                      )}
                    </Link>
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-[10px] text-accent font-bold uppercase tracking-wider mb-1">{rp.brand}</p>
                      <Link to={`/product/${rp.slug}`}>
                        <h4 className="text-sm font-bold text-foreground line-clamp-2 hover:text-primary transition-colors mb-3">{rp.name}</h4>
                      </Link>
                      <div className="mt-auto">
                        <Button
                          variant={rpInCart ? 'outline' : 'accent'}
                          size="sm"
                          className="w-full text-xs h-8 rounded-lg"
                          onClick={() => {
                            if (!rpInCart && rp.id) {
                              addItem({ id: rp.id, name: rp.name, brand: rp.brand, category: rp.category, model: rp.model, image: rp.image });
                              toast.success('Added to quote cart!');
                            }
                          }}
                        >
                          {rpInCart ? <><CheckCircle2 className="h-3 w-3 mr-1" /> In Cart</> : <><Plus className="h-3 w-3 mr-1" /> Add Quote</>}
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
  );
};

export default ProductDetail;
