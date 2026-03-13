import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuote } from '@/context/QuoteContext';
import { Link } from 'react-router-dom';

const QuoteDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, itemCount } = useQuote();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-foreground/40 z-50" onClick={() => setIsOpen(false)} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl z-50 flex flex-col animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-foreground">Quote Cart ({itemCount})</h2>
          <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Your quote cart is empty.</p>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Browse Products</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded bg-background" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">{item.brand}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded hover:bg-background"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded hover:bg-background"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 h-fit rounded hover:bg-background text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t space-y-3">
            <Link to="/request-quote" onClick={() => setIsOpen(false)}>
              <Button variant="accent" className="w-full">Proceed to Request Quote</Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default QuoteDrawer;
