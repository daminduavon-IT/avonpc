import { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/context/QuoteContext';
import { getProducts, getCategories, getBrands, getIndustries, FirestoreProduct, FirestoreCategory, FirestoreBrand, FirestoreIndustry } from '@/lib/supabase-services';
import { Search, ChevronRight, FlaskConical, Grid3X3, List, Loader2, CheckCircle2, Plus } from 'lucide-react';

const ProductListing = () => {
  const { category } = useParams();
  const location = useLocation();
  const isFlashSalePage = location.pathname === '/flash-sale';
  const { addItem, items } = useQuote();
  const urlSearch = new URLSearchParams(location.search).get('search') || '';
  const [search, setSearch] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(category || '');

  useEffect(() => {
    const s = new URLSearchParams(location.search).get('search') || '';
    setSearch(s);
    setPage(1);
  }, [location.search]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [categories, setCategories] = useState<FirestoreCategory[]>([]);
  const [brands, setBrands] = useState<FirestoreBrand[]>([]);
  const [industries, setIndustries] = useState<FirestoreIndustry[]>([]);
  const [loading, setLoading] = useState(true);
  const perPage = 8;

  const isInCart = (id?: string) => !!id && items.some(i => i.id === id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProducts, fetchedCategories, fetchedBrands, fetchedIndustries] = await Promise.all([
          getProducts({ status: 'active' }),
          getCategories(),
          getBrands(),
          getIndustries()
        ]);
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
        setBrands(fetchedBrands);
        setIndustries(fetchedIndustries);
      } catch {
        // data fetch silently fails; UI stays empty
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Build a lookup: category name → slug, for reliable filter matching
  const categoryNameToSlug = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(c => { map[c.name] = c.slug; });
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const productCategorySlug = categoryNameToSlug[p.category] ?? p.category.toLowerCase().replace(/\s+/g, '-');
      const matchCategory = !selectedCategory || productCategorySlug === selectedCategory;
      const matchBrand = !selectedBrand || p.brand === selectedBrand;
      const matchIndustry = !selectedIndustry || p.industryIDs?.includes(selectedIndustry);
      const matchFlashSale = !isFlashSalePage || p.isFlashSale === true;
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.shortDescription.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchBrand && matchIndustry && matchFlashSale && matchSearch;
    });
  }, [products, selectedCategory, selectedBrand, selectedIndustry, search, isFlashSalePage]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const categoryName = categories.find(c => c.slug === selectedCategory)?.name;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-muted border-b">
        <div className="container-main py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-primary">Products</Link>
          {categoryName && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{categoryName}</span>
            </>
          )}
        </div>
      </div>

      <div className="container-main py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 flex items-center gap-2">
          {isFlashSalePage ? <><span className="text-destructive">⚡ Flash Sale</span></> : (categoryName || 'All Products')}
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Category filter */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => { setSelectedCategory(''); setPage(1); }}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-md btn-transition ${!selectedCategory ? 'bg-primary/5 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  All Categories
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCategory(c.slug); setPage(1); }}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-md btn-transition ${selectedCategory === c.slug ? 'bg-primary/5 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand filter */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Brands</h3>
              <div className="space-y-1">
                <button
                  onClick={() => { setSelectedBrand(''); setPage(1); }}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-md btn-transition ${!selectedBrand ? 'bg-primary/5 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  All Brands
                </button>
                {brands.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { setSelectedBrand(b.name); setPage(1); }}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-md btn-transition ${selectedBrand === b.name ? 'bg-primary/5 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Industry filter */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Industries</h3>
              <div className="space-y-1">
                <button
                  onClick={() => { setSelectedIndustry(''); setPage(1); }}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-md btn-transition ${!selectedIndustry ? 'bg-primary/5 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  All Industries
                </button>
                {industries.map(i => (
                  <button
                    key={i.id}
                    onClick={() => { setSelectedIndustry(i.id!); setPage(1); }}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-md btn-transition ${selectedIndustry === i.id ? 'bg-primary/5 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    {i.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">{filtered.length} products found</p>
              <div className="flex gap-1">
                <button onClick={() => setView('grid')} className={`p-2 rounded ${view === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button onClick={() => setView('list')} className={`p-2 rounded ${view === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {paginated.length === 0 ? (
              <div className="text-center py-20 bg-card border rounded-2xl">
                <FlaskConical className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">No Products Found</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
                <Button variant="outline" className="mt-6" onClick={() => { setSelectedCategory(''); setSelectedBrand(''); setSelectedIndustry(''); setSearch(''); setPage(1); }}>Clear All Filters</Button>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginated.map(product => {
                  const inCart = isInCart(product.id);
                    return (
                      <div key={product.id} className={`rounded-2xl border overflow-hidden card-hover group flex flex-col h-full animate-fade-in-up transition-transform duration-300 hover:scale-[1.03] ${product.isFlashSale ? 'glass-panel glass-glow border-amber-500/30' : 'bg-card relative'}`}>
                        <Link to={`/product/${product.slug}`} className="aspect-square bg-muted/50 relative overflow-hidden flex items-center justify-center shrink-0">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <FlaskConical className="h-14 w-14 text-primary/20 transition-transform duration-500 group-hover:scale-110" />
                        )}
                        {product.featured && !product.isFlashSale && (
                          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Featured</span>
                        )}
                        {product.isFlashSale && (
                          <span className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md shadow-destructive/20 animate-pulse">⚡ Flash Sale</span>
                        )}
                      </Link>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="mb-auto">
                          <p className="text-xs text-accent font-bold mb-1 uppercase tracking-tight">{product.brand}</p>
                          <Link to={`/product/${product.slug}`}>
                            <h3 className="font-bold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
                          </Link>
                          {product.industryIDs && product.industryIDs.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {product.industryIDs.map(id => {
                                const ind = industries.find(i => i.id === id);
                                return ind ? (
                                  <span key={id} className="text-[9px] font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    {ind.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{product.shortDescription}</p>
                        </div>
                        {product.isFlashSale ? (
                          <div className="mb-4">
                            <div className="mb-2 space-y-1">
                              <div className="flex justify-between text-[10px] font-black text-amber-500 uppercase tracking-wide">
                                <span>{product.flashSaleStock !== undefined ? `${product.flashSaleStock} left` : '⚡ Flash Sale'}</span>
                                {product.flashSaleStock !== undefined && product.flashSaleInitialStock && (
                                  <span className="text-amber-400">{product.flashSaleInitialStock - product.flashSaleStock} sold</span>
                                )}
                              </div>
                              <div className="h-1.5 w-full bg-amber-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" style={{ width: (product.flashSaleStock !== undefined && product.flashSaleInitialStock) ? `${Math.min(100, Math.round((product.flashSaleStock / product.flashSaleInitialStock) * 100))}%` : '70%' }} />
                              </div>
                            </div>
                            <div className="mt-3">
                              {product.flashSalePrice && <span className="gold-gradient-text text-xl tracking-tighter">Rs {product.flashSalePrice.toLocaleString()}</span>}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4 relative overflow-hidden flex items-center rounded-lg border border-border/40 p-1">
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-5xl font-black text-muted/30 select-none pointer-events-none whitespace-nowrap tracking-tighter">QUOTE ONLY</span>
                            <Link to={`/product/${product.slug}`} className="w-full relative z-10">
                              <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all">
                                Request Spec & Quote
                              </Button>
                            </Link>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2 border-t border-border/50 relative z-10">
                          <Link to={`/product/${product.slug}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full text-xs font-semibold h-9 rounded-lg">Details</Button>
                          </Link>
                          <Button
                            variant={inCart ? 'outline' : 'accent'}
                            size="sm"
                            className={`flex-1 text-xs font-semibold h-9 rounded-lg flex items-center justify-center gap-1.5 transition-all ${inCart ? 'bg-primary/5 border-primary text-primary hover:bg-primary/10' : ''}`}
                            onClick={() => !inCart && addItem({ id: product.id!, name: product.name, brand: product.brand, category: product.category, model: product.model, image: product.image })}
                          >
                            {inCart ? <><CheckCircle2 className="h-3.5 w-3.5" /> In Cart</> : <><Plus className="h-3.5 w-3.5" /> Quote</>}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {paginated.map(product => {
                  const inCart = isInCart(product.id);
                  return (
                    <div key={product.id} className="bg-card rounded-2xl border p-4 flex flex-col sm:flex-row gap-5 card-hover group">
                      <Link to={`/product/${product.slug}`} className="w-full sm:w-32 h-32 bg-muted rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <FlaskConical className="h-10 w-10 text-primary/20 transition-transform duration-500 group-hover:scale-110" />
                        )}
                      </Link>
                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex flex-col h-full justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold text-accent uppercase tracking-wider">{product.brand}</span>
                              {product.featured && <span className="h-1 w-1 rounded-full bg-border" />}
                        {product.featured && !product.isFlashSale && <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Featured</span>}
                        {product.isFlashSale && <span className="text-[10px] font-bold text-destructive uppercase tracking-wider animate-pulse">⚡ Flash Sale</span>}
                      </div>
                      <Link to={`/product/${product.slug}`}>
                        <h3 className="font-bold text-foreground mb-1 hover:text-primary transition-colors">{product.name}</h3>
                      </Link>
                      {product.industryIDs && product.industryIDs.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {product.industryIDs.map(id => {
                            const ind = industries.find(i => i.id === id);
                            return ind ? (
                              <span key={id} className="text-[9px] font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded uppercase tracking-wider">
                                {ind.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 max-w-2xl">{product.shortDescription}</p>
                      {product.isFlashSale ? (
                        <div className="mb-4 max-w-xs">
                          <div className="mb-2 space-y-1">
                            <div className="flex justify-between text-[10px] font-black text-amber-500 uppercase tracking-wide">
                              <span>{product.flashSaleStock !== undefined ? `${product.flashSaleStock} left in stock` : 'Limited Stock'}</span>
                              <span className="animate-pulse flex items-center gap-1">⚡ Flash Sale</span>
                            </div>
                            <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" style={{ width: (product.flashSaleStock !== undefined && product.flashSaleInitialStock) ? `${Math.min(100, Math.round((product.flashSaleStock / product.flashSaleInitialStock) * 100))}%` : '85%' }} />
                            </div>
                          </div>
                          <div className="mt-3">
                            {product.flashSalePrice && <span className="gold-gradient-text text-xl tracking-tighter">Rs {product.flashSalePrice.toLocaleString()}</span>}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 relative overflow-hidden flex items-center rounded-lg border border-border/40 p-1 max-w-xs">
                          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-5xl font-black text-muted/30 select-none pointer-events-none whitespace-nowrap tracking-tighter">QUOTE ONLY</span>
                          <Link to={`/product/${product.slug}`} className="w-full relative z-10">
                            <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all">
                              Request Spec & Quote
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 relative z-10">
                            <Link to={`/product/${product.slug}`}>
                              <Button variant="outline" size="sm" className="text-xs font-semibold h-9 rounded-lg px-6">View Details</Button>
                            </Link>
                            <Button
                              variant={inCart ? 'outline' : 'accent'}
                              size="sm"
                              className={`text-xs font-semibold h-9 rounded-lg px-6 flex items-center gap-1.5 transition-all ${inCart ? 'bg-primary/5 border-primary text-primary hover:bg-primary/10' : ''}`}
                              onClick={() => !inCart && addItem({ id: product.id!, name: product.name, brand: product.brand, category: product.category, model: product.model, image: product.image })}
                            >
                              {inCart ? <><CheckCircle2 className="h-3.5 w-3.5" /> In Cart</> : <><Plus className="h-3.5 w-3.5" /> Add to Quote</>}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`h-9 w-9 rounded-md text-sm font-medium btn-transition ${page === i + 1 ? 'bg-primary text-primary-foreground' : 'bg-card border text-muted-foreground hover:bg-muted'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
