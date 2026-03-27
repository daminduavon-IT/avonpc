import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface QuoteItem {
  id: string; // We'll use id-variantId as the unique cart ID now
  productId: string;
  name: string;
  brand: string;
  category: string;
  model: string;
  image: string;
  quantity: number;
  variantId?: string;
  variantLabel?: string;
  price?: number;
}

interface QuoteContextType {
  items: QuoteItem[];
  addItem: (item: Omit<QuoteItem, 'quantity' | 'id'> & { id?: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export const useQuote = () => {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error('useQuote must be used within QuoteProvider');
  return ctx;
};

export const QuoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<QuoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('avon-quote-cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('avon-quote-cart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: Omit<QuoteItem, 'quantity' | 'id'> & { id?: string }) => {
    setItems(prev => {
      // Generate a unique cart item ID based on productId and variantId
      const cartItemId = item.variantId ? `${item.productId}-${item.variantId}` : item.productId;
      const existing = prev.find(i => i.id === cartItemId);
      if (existing) return prev.map(i => i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, id: cartItemId, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  return (
    <QuoteContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      isOpen, setIsOpen
    }}>
      {children}
    </QuoteContext.Provider>
  );
};
