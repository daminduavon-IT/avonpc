import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/context/QuoteContext';
import { products, categories, brands } from '@/data/catalog';
import { Search, ChevronRight, FlaskConical, Grid3X3, List } from 'lucide-react';

const ProductListing = () => {
  const { category } = useParams();
  const { addItem } = useQuote();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCategory = !selectedCategory || p.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory;
      const matchBrand = !selectedBrand || p.brand === selectedBrand;
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.shortDescription.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchBrand && matchSearch;
    });
  }, [selectedCategory, selectedBrand, search]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const categoryName = categories.find(c => c.slug === selectedCategory)?.name;

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
                    {c.name} ({c.productCount})
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
              <div className="text-center py-16">
                <FlaskConical className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No products found matching your criteria.</p>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginated.map(product => (
                  <div key={product.id} className="bg-card rounded-xl border overflow-hidden card-hover">
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <FlaskConical className="h-14 w-14 text-primary/20" />
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-accent font-medium mb-1">{product.brand}</p>
                      <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-2">{product.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.shortDescription}</p>
                      <div className="flex gap-2">
                        <Link to={`/product/${product.slug}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs">View Details</Button>
                        </Link>
                        <Button variant="accent" size="sm" className="text-xs"
                          onClick={() => addItem({ id: product.id, name: product.name, brand: product.brand, category: product.category, model: product.model, image: product.image })}
                        >
                          Add to Quote
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {paginated.map(product => (
                  <div key={product.id} className="bg-card rounded-xl border p-4 flex gap-4 card-hover">
                    <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <FlaskConical className="h-10 w-10 text-primary/20" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-accent font-medium">{product.brand}</p>
                      <h3 className="text-sm font-semibold text-foreground mb-1">{product.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{product.shortDescription}</p>
                      <div className="flex gap-2">
                        <Link to={`/product/${product.slug}`}>
                          <Button variant="outline" size="sm" className="text-xs">View Details</Button>
                        </Link>
                        <Button variant="accent" size="sm" className="text-xs"
                          onClick={() => addItem({ id: product.id, name: product.name, brand: product.brand, category: product.category, model: product.model, image: product.image })}
                        >
                          Add to Quote
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
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
