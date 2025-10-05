"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { marketplaceService } from '@/lib/api/services/marketplaceService';
import type { Coupon, BulkDiscount } from '@/lib/types/marketplace';
import { useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number; // Original price
  discountedPrice: number; // Price after product discount
  quantity: number;
  serverId?: string;
  categoryId?: string;
  hasProductDiscount: boolean;
  productDiscountType?: "percentage" | "fixed";
  productDiscountValue?: number;
}

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  couponCode: string;
  bulkDiscount: BulkDiscount | null;
  isLoading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_COUPON'; payload: Coupon }
  | { type: 'REMOVE_COUPON' }
  | { type: 'SET_COUPON_CODE'; payload: string }
  | { type: 'SET_BULK_DISCOUNT'; payload: BulkDiscount | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: CartState = {
  items: [],
  coupon: null,
  couponCode: '',
  bulkDiscount: null,
  isLoading: false,
  error: null,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        coupon: null,
        couponCode: '',
      };

    case 'SET_COUPON':
      return {
        ...state,
        coupon: action.payload,
        error: null,
      };

    case 'REMOVE_COUPON':
      return {
        ...state,
        coupon: null,
        couponCode: '',
      };

    case 'SET_BULK_DISCOUNT':
      return {
        ...state,
        bulkDiscount: action.payload,
      };

    case 'SET_COUPON_CODE':
      return {
        ...state,
        couponCode: action.payload,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  setBulkDiscount: (bulkDiscount: BulkDiscount | null) => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  getItemCount: (itemId?: string) => number;
  purchaseItems: (userBalance: number) => Promise<{ success: boolean; message: string; type: string }>;
  openCart: () => void;
  closeCart: () => void;
  isCartOpen: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Create marketplaceService instance for client-side usage
  const marketplaceServiceInstance = marketplaceService();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart.items) {
          parsedCart.items.forEach((item: CartItem) => {
            dispatch({ type: 'ADD_ITEM', payload: item });
          });
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }

    // Load bulk discount information
    const loadBulkDiscount = async () => {
      try {
        const marketplaceSettings = await marketplaceServiceInstance.getMarketplaceSettings();
        if (marketplaceSettings.bulkDiscount) {
          dispatch({ type: 'SET_BULK_DISCOUNT', payload: marketplaceSettings.bulkDiscount });
        }
      } catch (error) {
        console.error('Error loading bulk discount:', error);
      }
    };

    loadBulkDiscount();
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem('cart', JSON.stringify({ items: state.items }));
    } else {
      localStorage.removeItem('cart');
    }
  }, [state.items]);

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const applyCoupon = async (code: string) => {
    if (!code.trim()) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const coupon = await marketplaceServiceInstance.getCouponInfo(code);
      dispatch({ type: 'SET_COUPON', payload: coupon });
      dispatch({ type: 'SET_COUPON_CODE', payload: code });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Geçersiz kupon kodu' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
  };

  const setBulkDiscount = (bulkDiscount: BulkDiscount | null) => {
    dispatch({ type: 'SET_BULK_DISCOUNT', payload: bulkDiscount });
  };

  const getSubtotal = () => {
    return state.items.reduce((sum, item) => sum + (item.discountedPrice * item.quantity), 0);
  };

  const getDiscount = () => {
    let totalDiscount = 0;
    
    // Apply coupon discount
    if (state.coupon) {
      const subtotal = getSubtotal();
      if (state.coupon.discountType === 'percentage') {
        totalDiscount += (subtotal * state.coupon.discountValue) / 100;
      } else if (state.coupon.discountType === 'fixed') {
        totalDiscount += Math.min(state.coupon.discountValue, subtotal);
      }
    }

    // Apply bulk discount
    if (state.bulkDiscount) {
      const applicableItems = state.items.filter(item => 
        state.bulkDiscount!.products.length === 0 || 
        state.bulkDiscount!.products.includes(item.id)
      );
      
      if (applicableItems.length > 0) {
        if (state.bulkDiscount.type === 'percentage') {
          const applicableSubtotal = applicableItems.reduce((sum, item) => sum + (item.discountedPrice * item.quantity), 0);
          totalDiscount += (applicableSubtotal * state.bulkDiscount.amount) / 100;
        } else {
          totalDiscount += state.bulkDiscount.amount;
        }
      }
    }
    
    return totalDiscount;
  };

  const getTotal = () => {
    return Math.max(0, getSubtotal() - getDiscount());
  };

  const getItemCount = (itemId?: string) => {
    if (itemId) {
      return state.items.find(item => item.id === itemId)?.quantity || 0;
    }
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const purchaseItems = async (userBalance: number): Promise<{ success: boolean; message: string; type: string }> => {
    if (state.items.length === 0) {
      return { success: false, message: 'Sepetiniz boş', type: 'error' };
    }

    const total = getTotal();
    
    if (userBalance < total) {
      return { 
        success: false, 
        message: `Yetersiz bakiye. Gerekli: ${total}₺, Mevcut: ${userBalance}₺`, 
        type: 'insufficient_balance' 
      };
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const productIds = state.items.map(item => item.id);
      const couponCode = state.coupon?.code;
      
      const result = await marketplaceServiceInstance.purchaseProduct(productIds, couponCode);
      console.log(result);
      if (result.success === 'true') {
        clearCart();
        return { success: true, message: result.message, type: result.type };
      } else {
        return { success: false, message: result.message, type: result.type };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Satın alma işlemi başarısız';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, message: errorMessage, type: 'error' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    setBulkDiscount,
    getSubtotal,
    getDiscount,
    getTotal,
    getItemCount,
    purchaseItems,
    openCart,
    closeCart,
    isCartOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
