// src/context/CartContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import API from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Fetch cart from database when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchCart();
    } else if (!isAuthenticated && !authLoading) {
      setCartItems([]);
    }
  }, [isAuthenticated, authLoading]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/cart');
      
      if (data.success) {
        setCartItems(data.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      showNotification('Failed to load cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    if (!isAuthenticated) {
      showNotification('Please login to add items to cart', 'error');
      const currentPath = window.location.pathname;
      localStorage.setItem('redirectAfterLogin', currentPath);
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post('/cart/add', {
        productId: product._id,
        quantity: 1
      });

      if (data.success) {
        setCartItems(data.data.items || []);
        showNotification('Added to cart successfully!', 'success');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      const message = error.response?.data?.message || 'Failed to add to cart';
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) {
      showNotification('Please login first', 'error');
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.delete(`/cart/remove/${productId}`);

      if (data.success) {
        setCartItems(data.data.items || []);
        showNotification('Removed from cart', 'success');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      showNotification('Failed to remove item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated) return;

    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.put('/cart/update', {
        productId,
        quantity
      });

      if (data.success) {
        setCartItems(data.data.items || []);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      const message = error.response?.data?.message || 'Failed to update quantity';
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const incrementQuantity = async (productId) => {
    const item = cartItems.find(item => item.product._id === productId);
    if (item) {
      await updateQuantity(productId, item.quantity + 1);
    }
  };

  const decrementQuantity = async (productId) => {
    const item = cartItems.find(item => item.product._id === productId);
    if (item && item.quantity > 1) {
      await updateQuantity(productId, item.quantity - 1);
    } else if (item && item.quantity === 1) {
      await removeFromCart(productId);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const { data } = await API.delete('/cart/clear');

      if (data.success) {
        setCartItems([]);
        showNotification('Cart cleared', 'success');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      showNotification('Failed to clear cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.finalPrice || item.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.product._id === productId || item.product === productId);
  };

  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.product._id === productId || item.product === productId);
    return item ? item.quantity : 0;
  };

  const toggleCart = () => {
    if (!isAuthenticated) {
      showNotification('Please login to view cart', 'error');
      navigate('/login');
      return;
    }
    setIsCartOpen(!isCartOpen);
  };

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-5 right-5 px-6 py-4 rounded-xl shadow-2xl text-white z-50 transition-all duration-300 transform translate-x-full ${
      type === 'success' 
        ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
        : type === 'error'
        ? 'bg-gradient-to-r from-red-500 to-rose-600'
        : 'bg-gradient-to-r from-blue-500 to-indigo-600'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.remove('translate-x-full'), 10);
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const value = {
    // ✅ ADD THESE TWO LINES
    cart: cartItems,              // Alias for Checkout page
    cartTotal: getCartTotal(),    // Pre-calculated total
    
    // Keep existing exports
    cartItems,
    isCartOpen,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    isInCart,
    getItemQuantity,
    toggleCart,
    setIsCartOpen,
    fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default CartContext;
