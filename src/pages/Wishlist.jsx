// src/pages/Wishlist.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  FiHeart,
  FiShoppingCart,
  FiTrash2,
  FiStar,
  FiArrowRight,
  FiShoppingBag,
  FiPackage,
  FiLoader,
} from 'react-icons/fi';

const Wishlist = () => {
  const {
    wishlistItems: wishlist,
    toggleWishlist,
    isInWishlist,
    loading,
    syncWishlistFromAPI,
  } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      syncWishlistFromAPI();
    }
  }, [isAuthenticated, syncWishlistFromAPI]);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleWishlistAction = async (product) => {
    try {
      await toggleWishlist(product);
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const handleClearAll = async () => {
    if (wishlist.length > 0 && confirm(`Remove all ${wishlist.length} items from wishlist?`)) {
      for (const product of wishlist) {
        try {
          await toggleWishlist(product);
        } catch (error) {
          console.error('Failed to remove item:', error);
        }
      }
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
        size={14}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mb-8 mx-auto">
            <FiLoader className="animate-spin" size={20} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Loading your wishlist...</h2>
          <p className="text-gray-600 text-lg">Syncing with your account</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-linear-to-br from-pink-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <FiHeart className="text-pink-600" size={48} />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Login Required
            </h2>
            <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto">
              Please login to view your saved wishlist items
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-3 px-10 py-5 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center py-20">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-linear-to-r from-pink-500 to-red-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-linear-to-br from-pink-100 to-red-100 w-40 h-40 rounded-full flex items-center justify-center mx-auto p-8">
                <FiHeart className="text-pink-600" size={64} />
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Your Wishlist is{' '}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-pink-600 to-red-600">
                Empty
              </span>
            </h2>

            <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto">
              Save your favorite items here so you can find them easily later!
            </p>

            <button
              type="button"
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-3 px-10 py-5 bg-linear-to-r from-pink-600 to-red-600 text-white rounded-2xl font-bold text-lg hover:from-pink-700 hover:to-red-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <FiShoppingBag size={24} />
              Start Shopping
              <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-linear-to-br from-pink-500 to-red-600 rounded-2xl shadow-xl">
                <FiHeart className="text-white" size={40} />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900">
                  My{' '}
                  <span className="bg-clip-text text-transparent bg-linear-to-r from-pink-600 to-red-600">
                    Wishlist
                  </span>
                </h1>
                <p className="text-gray-600 text-lg mt-2">
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleClearAll();
              }}
              disabled={loading}
              className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all border-2 border-red-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiTrash2 />
              Clear All ({wishlist.length})
            </button>
          </div>
        </div>


        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div
              key={product._id}
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:scale-105"
            >
              <div className="absolute -inset-1 bg-linear-to-r from-pink-500 via-red-500 to-orange-500 opacity-0 group-hover:opacity-75 blur-xl transition-opacity duration-500"></div>

              <div className="relative bg-white rounded-3xl overflow-hidden">
                {/* Product Image */}
                <div
                  className="relative aspect-square overflow-hidden bg-linear-to-br from-gray-100 to-gray-200 cursor-pointer"
                  onClick={() => navigate(`/product/${product.slug || product._id}`)}
                >
                  <img
                    src={
                      product.thumbnail?.url ||
                      product.images?.[0]?.url ||
                      'https://via.placeholder.com/400'
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400?text=Product';
                    }}
                  />

                  {product.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-linear-to-r from-red-500 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg">
                      {product.discount}% OFF
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleWishlistAction(product);
                    }}
                    disabled={loading}
                    className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 hover:rotate-12 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove from wishlist"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiTrash2 size={18} />
                    )}
                  </button>

                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-white px-6 py-3 rounded-2xl font-black text-gray-900 shadow-2xl">
                        Out of Stock
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-5 space-y-3">
                  <h3
                    className="font-bold text-gray-900 line-clamp-2 hover:text-pink-600 transition-colors cursor-pointer min-h-12"
                    onClick={() => navigate(`/product/${product.slug || product._id}`)}
                  >
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {renderStars(product.averageRating || 0)}
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {product.averageRating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({product.reviewCount || 0})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <span className="text-2xl font-black text-pink-600">
                      ₹{product.finalPrice || product.price}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{product.price}
                      </span>
                    )}
                  </div>

                  {/* Stock Info */}
                  {product.stock > 0 && product.stock <= 10 && (
                    <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold inline-block">
                      Only {product.stock} left!
                    </div>
                  )}

                  {/* Add to Cart */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    disabled={product.stock === 0}
                    className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 ${
                      isInCart(product._id)
                        ? 'bg-green-500 text-white'
                        : 'bg-linear-to-r from-pink-600 to-red-600 text-white hover:from-pink-700 hover:to-red-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                  >
                    <FiShoppingCart />
                    {isInCart(product._id) ? '✓ In Cart' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-3 px-10 py-5 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            <FiPackage size={24} />
            Continue Shopping
            <FiArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
