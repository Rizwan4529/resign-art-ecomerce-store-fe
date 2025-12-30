import React, { createContext, useContext, useMemo } from 'react';
import {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  CartItem as APICartItem,
} from '../services/api/cartApi';
import { Product } from '../services/api/productApi';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';

// Cart item type for backward compatibility
export interface CartItem {
  id: number | string;
  productId: number;
  product: Product | APICartItem['product'];
  quantity: number;
  customizations?: Record<string, any>;
  priceAtTime?: number | string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product | any, quantity?: number, customizations?: Record<string, any>) => void;
  removeFromCart: (itemId: number | string) => void;
  updateQuantity: (itemId: number | string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // RTK Query hooks - only fetch if authenticated
  const { data: cartData, isLoading } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 60000, // Refresh cart every minute
  });

  const [addToCartMutation] = useAddToCartMutation();
  const [updateCartItemMutation] = useUpdateCartItemMutation();
  const [removeFromCartMutation] = useRemoveFromCartMutation();
  const [clearCartMutation] = useClearCartMutation();

  // Convert API cart items to backward-compatible format
  const items: CartItem[] = useMemo(() => {
    if (!cartData?.data?.items) return [];

    return cartData.data.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      product: item.product,
      quantity: item.quantity,
      customizations: item.customization || undefined,
      priceAtTime: item.priceAtTime,
    }));
  }, [cartData]);

  // Add to cart function
  const addToCart = async (
    product: Product | any,
    quantity = 1,
    customizations?: Record<string, any>
  ) => {
    if (!isAuthenticated) {
      console.warn('User must be authenticated to add items to cart');
      // You could show a toast or redirect to login here
      return;
    }

    try {
      await addToCartMutation({
        productId: product.id,
        quantity,
        customization: customizations,
      }).unwrap();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      // You could show an error toast here
    }
  };

  // Remove from cart function
  const removeFromCart = async (itemId: number | string) => {
    if (!isAuthenticated) return;

    try {
      await removeFromCartMutation({ itemId: Number(itemId) }).unwrap();
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
    }
  };

  // Update quantity function
  const updateQuantity = async (itemId: number | string, quantity: number) => {
    if (!isAuthenticated) return;

    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    try {
      await updateCartItemMutation({
        itemId: Number(itemId),
        data: { quantity },
      }).unwrap();
    } catch (error) {
      console.error('Failed to update cart item quantity:', error);
    }
  };

  // Clear cart function
  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      await clearCartMutation().unwrap();
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  // Calculate total from cart data
  const total = useMemo(() => {
    if (!cartData?.data?.summary?.subtotal) return 0;
    return parseFloat(cartData.data.summary.subtotal);
  }, [cartData]);

  // Get item count from cart data
  const itemCount = useMemo(() => {
    return cartData?.data?.summary?.totalItems || 0;
  }, [cartData]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
