import { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/context/QuoteContext';
import { getProducts, getCategories, getBrands, FirestoreProduct, FirestoreCategory, FirestoreBrand } from '@/lib/firestore-services';
import { Search, ChevronRight, FlaskConical, Grid3X3, List, Loader2, CheckCircle2, Plus } from 'lucide-react';

const ProductListing = () => {
  const { category } = useParams();
  const { addItem, items } = useQuote();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [categories, setCategories] = useState<FirestoreCategory[]>([]);
  const [brands, setBrands] = useState<FirestoreBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const perPage = 8;

  const isInCart = (id?: string) => !!id && items.some(i => i.id === id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProducts, fetchedCategories, fetchedBrands] = await Promise.all([
          getProducts({ status: 'active' }),
          getCategories(),
          getBrands()
        ]);
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
        setBrands(fetchedBrands);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCategory = !selectedCategory || p.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory;
      const matchBrand = !selectedBrand || p.brand === selectedBrand;
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.shortDescription.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchBrand && matchSearch;
    });
  }, [products, selectedCategory, selectedBrand, search]);

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
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
          {categoryName || 'All Products'}
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
                <Button variant="outline" className="mt-6" onClick={() => { setSelectedCategory(''); setSelectedBrand(''); setSearch(''); setPage(1); }}>Clear All Filters</Button>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginated.map(product => {
                  const inCart = isInCart(product.id);
                  return (
                    <div key={product.id} className="bg-card rounded-2xl border overflow-hidden card-hover group flex flex-col h-full">
                      <Link to={`/product/${product.slug}`} className="aspect-square bg-muted relative overflow-hidden flex items-center justify-center shrink-0">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <FlaskConical className="h-14 w-14 text-primary/20 transition-transform duration-500 group-hover:scale-110" />
                        )}
                        {product.featured && (
                          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Featured</span>
                        )}
                      </Link>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="mb-auto">
                          <p className="text-xs text-accent font-bold mb-1 uppercase tracking-tight">{product.brand}</p>
                          <Link to={`/product/${product.slug}`}>
                            <h3 className="font-bold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
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
                              {product.featured && <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Featured</span>}
                            </div>
                            <Link to={`/product/${product.slug}`}>
                              <h3 className="font-bold text-foreground mb-1 hover:text-primary transition-colors">{product.name}</h3>
                            </Link>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 max-w-2xl">{product.shortDescription}</p>
                          </div>
                          <div className="flex gap-2">
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
