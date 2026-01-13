// src/context/WishlistContext.jsx
import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import API from '../services/api';
import PropTypes from 'prop-types';

const WishlistContext = createContext();

// ✅ Export useWishlist hook
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Load wishlist from API when authenticated
  const syncWishlistFromAPI = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;

    try {
      setLoading(true);
      const res = await API.get('/wishlist');
      setWishlistItems(res.data.wishlistItems || []);
    } catch (error) {
      console.error('Error syncing wishlist:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  // Sync wishlist on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      syncWishlistFromAPI();
    } else if (!isAuthenticated && !authLoading) {
      setWishlistItems([]);
    }
  }, [isAuthenticated, authLoading, syncWishlistFromAPI]);

  // ⭐ UPDATED: Toggle wishlist with loading protection and 429 error handling
  const toggleWishlist = async (product) => {
    // ⭐ NEW: Prevent duplicate requests
    if (loading) {
      console.log('Request already in progress');
      return;
    }

    // Check authentication
    if (!isAuthenticated) {
      showNotification('Please login to manage wishlist', 'error');
      const currentPath = window.location.pathname;
      localStorage.setItem('redirectAfterLogin', currentPath);
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      const res = await API.post('/wishlist/toggle', {
        productId: product._id,
        userId: user._id
      });

      const isAdded = res.data.isAdded;
      const updatedWishlist = res.data.wishlistItems || [];

      setWishlistItems(updatedWishlist);
      
      showNotification(
        isAdded ? 'Added to wishlist!' : 'Removed from wishlist',
        'success'
      );
      
      return { success: true, isAdded };
      
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      
      // ⭐ NEW: Handle 429 specifically
      if (error.response?.status === 429) {
        showNotification('Too many requests. Please wait a moment.', 'error');
      } else {
        showNotification('Failed to update wishlist', 'error');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add to wishlist
  const addToWishlist = async (product) => {
    if (!isAuthenticated) {
      showNotification('Please login to add items to wishlist', 'error');
      const currentPath = window.location.pathname;
      localStorage.setItem('redirectAfterLogin', currentPath);
      navigate('/login');
      return;
    }

    const exists = wishlistItems.find(item => item._id === product._id);
    if (!exists) {
      await toggleWishlist(product);
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return;

    const product = wishlistItems.find(item => item._id === productId);
    if (product) {
      await toggleWishlist(product);
    }
  };

  // Clear wishlist
  const clearWishlist = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      await API.delete('/wishlist/clear');
      setWishlistItems([]);
      showNotification('Wishlist cleared', 'success');
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      showNotification('Failed to clear wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = useCallback(
    (productId) => wishlistItems.some((item) => item._id === productId),
    [wishlistItems]
  );

  // Get wishlist count
  const getWishlistCount = () => wishlistItems.length;

  // Navigate to wishlist page - REQUIRES LOGIN
  const navigateToWishlist = () => {
    if (!isAuthenticated) {
      showNotification('Please login to view your wishlist', 'error');
      localStorage.setItem('redirectAfterLogin', '/wishlist');
      navigate('/login');
      return;
    }
    navigate('/wishlist');
  };

  // Notification helper
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
    wishlistItems,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount,
    navigateToWishlist,
    loading,
    syncWishlistFromAPI,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

WishlistProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default WishlistContext;
