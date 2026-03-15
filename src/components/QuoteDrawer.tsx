import { X, Plus, Minus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/context/QuoteContext';
import { Link } from 'react-router-dom';

const QuoteDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, itemCount, clearCart } = useQuote();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-card shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-primary text-primary-foreground">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5" />
            <h2 className="text-base font-bold">Quote Cart</h2>
            <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <ShoppingCart className="h-9 w-9 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Your quote cart is empty</p>
                <p className="text-sm text-muted-foreground">Browse our products and add items you need a quote for.</p>
              </div>
              <Button variant="accent" onClick={() => setIsOpen(false)} asChild>
                <Link to="/products">Browse Products <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-5 py-2.5 bg-muted text-xs font-semibold text-muted-foreground border-b">
                <span>Product</span>
                <span className="text-center w-24">Qty</span>
                <span className="w-8"></span>
              </div>

              {/* Items */}
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-[1fr_auto_auto] gap-2 px-5 py-3.5 items-center hover:bg-muted/40 transition-colors">
                    {/* Product info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden border">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground/30 text-lg">📦</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground leading-tight line-clamp-2">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.brand} · {item.model}</p>
                      </div>
                    </div>

                    {/* Qty stepper */}
                    <div className="flex items-center gap-1 bg-background border rounded-lg px-1 py-0.5 w-24 justify-between">
                      <button
                        onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                        className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center text-foreground">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors w-8 flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer CTA */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3 bg-card">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total items selected:</span>
              <span className="font-bold text-foreground">{itemCount}</span>
            </div>
            <Link to="/request-quote" onClick={() => setIsOpen(false)} className="block">
              <Button variant="accent" className="w-full h-12 text-base font-semibold">
                Proceed to Request Quote
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <button
              onClick={clearCart}
              className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors text-center py-1"
            >
              Clear all items
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default QuoteDrawer;
