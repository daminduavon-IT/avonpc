import { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/context/QuoteContext';
import { getProducts, getCategories, getBrands, getIndustries, FirestoreProduct, FirestoreCategory, FirestoreBrand, FirestoreIndustry } from '@/lib/firestore-services';
import { Search, ChevronRight, FlaskConical, Grid3X3, List, Loader2, CheckCircle2, Plus } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

const ProductListing = () => {
  const { category } = useParams();
  const { addItem, items } = useQuote();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || '');
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
      const matchIndustry = !selectedIndustry || p.industryIDs?.includes(selectedIndustry);
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.shortDescription.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchBrand && matchIndustry && matchSearch;
    });
  }, [products, selectedCategory, selectedBrand, selectedIndustry, search]);

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
                  const industryNames = (product.industryIDs || [])
                    .map(id => industries.find(i => i.id === id)?.name)
                    .filter(Boolean) as string[];
                  return (
                    <ProductCard key={product.id} product={product} view="grid" industryNames={industryNames} />
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {paginated.map(product => {
                  const industryNames = (product.industryIDs || [])
                    .map(id => industries.find(i => i.id === id)?.name)
                    .filter(Boolean) as string[];
                  return (
                    <ProductCard key={product.id} product={product} view="list" industryNames={industryNames} />
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
