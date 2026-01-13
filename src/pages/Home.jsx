// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import API from '../services/api';
import {
  FiShoppingBag,
  FiTrendingUp,
  FiStar,
  FiShield,
  FiZap,
  FiHeart,
  FiPackage,
  FiTruck,
  FiHeadphones,
  FiAward,
  FiUsers,
  FiArrowRight,
  FiShoppingCart,
  FiTag,
  FiGift,
  FiPercent
} from 'react-icons/fi';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
  setLoading(true);
  setError(null);
  try {
    const categoriesRes = await API.get('/categories');
    let allCategories = [];
    if (categoriesRes.data.data) {
      allCategories = categoriesRes.data.data;
    } else if (Array.isArray(categoriesRes.data)) {
      allCategories = categoriesRes.data;
    } else if (categoriesRes.data.categories) {
      allCategories = categoriesRes.data.categories;
    }
    
    // Filter parent categories that are active
    const parentCategories = allCategories.filter(cat => !cat.parent && cat.isActive !== false);
    
    // Get featured categories
    const featured = parentCategories.filter(cat => cat.isFeatured);
    
    // UPDATED: Always ensure we get exactly 8 categories
    let categoriesToShow = [];
    if (featured.length >= 8) {
      categoriesToShow = featured.slice(0, 8);
    } else if (featured.length > 0) {
      // If we have some featured but less than 8, fill with non-featured
      categoriesToShow = [
        ...featured,
        ...parentCategories.filter(cat => !cat.isFeatured).slice(0, 8 - featured.length)
      ];
    } else {
      // No featured categories, just take first 8
      categoriesToShow = parentCategories.slice(0, 8);
    }
    
    console.log('Total parent categories:', parentCategories.length);
    console.log('Featured categories:', featured.length);
    console.log('Categories to show:', categoriesToShow.length);
    
    setCategories(parentCategories);
    setFeaturedCategories(categoriesToShow);

    const productsRes = await API.get('/products?limit=8&sort=-createdAt');
    let fetchedProducts = [];
    if (productsRes.data.data?.products) {
      fetchedProducts = productsRes.data.data.products;
    } else if (productsRes.data.data && Array.isArray(productsRes.data.data)) {
      fetchedProducts = productsRes.data.data;
    } else if (Array.isArray(productsRes.data.products)) {
      fetchedProducts = productsRes.data.products;
    } else if (Array.isArray(productsRes.data)) {
      fetchedProducts = productsRes.data;
    }
    
    setProducts(fetchedProducts);
  } catch (error) {
    console.error('Error fetching data:', error);
    setError(error.response?.data?.message || 'Failed to load data. Please try again later.');
  } finally {
    setLoading(false);
  }
};


  const handleCategoryClick = (category) => {
    navigate(`/products?category=${category.slug}`);
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product.slug || product._id}`);
  };

  // Handle Add to Cart
  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
  };

  // Handle Wishlist Toggle
  const handleWishlistToggle = (e, product) => {
    e.stopPropagation();
    toggleWishlist(product);
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

  const stats = [
    { icon: <FiUsers />, value: '50K+', label: 'Happy Customers', color: 'from-blue-500 to-cyan-500' },
    { icon: <FiPackage />, value: '100K+', label: 'Products', color: 'from-purple-500 to-pink-500' },
    { icon: <FiAward />, value: '4.8/5', label: 'Average Rating', color: 'from-amber-500 to-orange-500' },
    { icon: <FiTruck />, value: '24/7', label: 'Fast Delivery', color: 'from-green-500 to-emerald-500' }
  ];

  const features = [
    {
      icon: <FiShield />,
      title: 'Secure Shopping',
      description: '100% secure payment with SSL encryption',
      color: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50'
    },
    {
      icon: <FiTruck />,
      title: 'Fast Delivery',
      description: 'Free shipping on orders above ₹500',
      color: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50'
    },
    {
      icon: <FiHeadphones />,
      title: '24/7 Support',
      description: 'Dedicated customer support team',
      color: 'from-purple-500 to-pink-600',
      bg: 'bg-purple-50'
    },
    {
      icon: <FiGift />,
      title: 'Easy Returns',
      description: '30-day hassle-free return policy',
      color: 'from-orange-500 to-red-600',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-brom-slate-50 to-white">

      {/* Hero Section with Advanced Animations */}
      <section className="relative bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
          
          {/* Floating Icons */}
          <div className="absolute top-20 left-10 animate-float">
            <FiShoppingBag className="w-12 h-12 opacity-20" />
          </div>
          <div className="absolute bottom-20 right-20 animate-float animation-delay-2000">
            <FiGift className="w-16 h-16 opacity-20" />
          </div>
          <div className="absolute top-40 right-40 animate-float animation-delay-1000">
            <FiStar className="w-10 h-10 opacity-20" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            {/* Welcome Badge */}
            {isAuthenticated && user && (
              <div className="mb-8 inline-block animate-slide-down">
                <div className="group relative bg-white/20 backdrop-blur-lg px-8 py-4 rounded-full border-2 border-white/30 shadow-2xl hover:scale-105 transition-all duration-300">
                  <div className="absolute inset-0 bg-linear-to-rrom-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <p className="relative text-lg font-semibold flex items-center gap-3">
                    <span className="text-3xl animate-wave">👋</span>
                    Welcome back, <span className="font-bold text-yellow-300">{user.name}</span>!
                    <FiZap className="text-yellow-300 animate-pulse" />
                  </p>
                </div>
              </div>
            )}

            {/* Main Heading with linear Animation */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight">
              <span className="block animate-fade-in-up">Discover Your</span>
              <span className="block bg-clip-text text-transparent bg-linear-to-r from-yellow-300 via-pink-300 to-purple-300 animate-linear-x animate-fade-in-up animation-delay-200">
                Perfect Shopping
              </span>
              <span className="block animate-fade-in-up animation-delay-400">Experience</span>
            </h1>

            <p className="text-xl md:text-2xl mb-12 text-purple-100 max-w-3xl mx-auto animate-fade-in-up animation-delay-600">
              Shop from thousands of products across {categories.length}+ categories with 
              <span className="font-bold text-yellow-300"> exclusive deals </span> 
              and <span className="font-bold text-pink-300">lightning-fast delivery</span> ⚡
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-in-up animation-delay-800">
              <button
                onClick={() => navigate('/products')}
                className="group relative px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-lg overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-indigo-500/50 w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-3 group-hover:text-white transition-colors">
                  <FiShoppingBag className="group-hover:rotate-12 transition-transform" size={24} />
                  Explore Products
                  <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
              
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/register')}
                  className="relative px-10 py-5 bg-transparent border-3 border-white/50 text-white rounded-2xl font-bold text-lg hover:bg-white/10 backdrop-blur-sm transition-all duration-300 shadow-xl hover:scale-105 w-full sm:w-auto hover:border-white"
                >
                  Join Now - It's Free
                </button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-16 flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-1000">
              {[
                { icon: <FiShield />, text: '100% Secure', color: 'from-green-400 to-emerald-500' },
                { icon: <FiTruck />, text: 'Free Shipping', color: 'from-blue-400 to-cyan-500' },
                { icon: <FiAward />, text: 'Top Rated', color: 'from-yellow-400 to-orange-500' },
                { icon: <FiPercent />, text: 'Best Deals', color: 'from-pink-400 to-red-500' }
              ].map((badge, index) => (
                <div 
                  key={index}
                  className="group flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-3 rounded-full border border-white/20 hover:bg-white/20 hover:scale-110 transition-all duration-300 cursor-pointer"
                >
                  <div className={`bg-linear-to-r ${badge.color} p-2 rounded-full group-hover:rotate-12 transition-transform`}>
                    {badge.icon}
                  </div>
                  <span className="font-semibold">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-16 fill-current text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39 56.44c58-10.79 114.16-30.13 172-41.86 82.39-16.72 168.19-17.73 250.45-.39C823.78 31 906.67 72 985.66 92.83c70.05 18.48 146.53 26.09 214.34 3V0H0v27.35a600.21 600.21 0 0 0 321.39 29.09z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-8 z-10 py-8 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 text-center overflow-hidden transform hover:-translate-y-3 hover:scale-105 cursor-pointer"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className={`relative mx-auto w-20 h-20 rounded-2xl bg-linear-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
                  <div className="text-white text-3xl">
                    {stat.icon}
                  </div>
                </div>
                
                <div className="relative text-4xl md:text-5xl font-black text-gray-900 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                
                <div className="relative text-gray-600 font-semibold">{stat.label}</div>

                
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-linear-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-8 text-center shadow-xl">
              <div className="text-6xl mb-4">😔</div>
              <p className="text-red-600 font-bold text-xl mb-6">{error}</p>
              <button
                onClick={fetchHomeData}
                className="px-8 py-4 bg-linear-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Try Again
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Featured Categories */}
      <section className="py-20 bg-linear-to-b from-white via-indigo-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                  <FiTag className="text-white" size={32} />
                </div>
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                    Featured <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">Categories</span>
                  </h2>
                  <p className="text-gray-600 text-lg mt-2">Discover what's trending now</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="hidden md:flex items-center gap-3 px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-2xl transform hover:scale-105"
            >
              View All
              <FiArrowRight />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-3xl h-64" />
              ))}
            </div>
          ) : featuredCategories.length === 0 ? (
            <div className="text-center py-20 bg-linear-to-br from-gray-50 to-gray-100 rounded-3xl">
              <div className="text-8xl mb-6">📦</div>
              <p className="text-gray-600 text-2xl font-semibold">No categories available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredCategories.map((category, index) => (
                <div
                  key={category._id}
                  onClick={() => handleCategoryClick(category)}
                  onMouseEnter={() => setHoveredCategory(category._id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="group cursor-pointer"
                >
                  <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:scale-105 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                    
                    <div className="relative bg-white rounded-3xl overflow-hidden m-1">
                      <div className="relative aspect-square overflow-hidden bg-linear-to-br from-indigo-100 via-purple-100 to-pink-100">
                        <img
                          src={category.image?.url || 'https://via.placeholder.com/400'}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-125 group-hover:rotate-3 transition-all duration-700"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400?text=' + encodeURIComponent(category.name);
                          }}
                        />
                        
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                          <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-2xl">
                            <p className="font-bold text-indigo-600 flex items-center gap-2">
                              Shop Now
                              <FiArrowRight />
                            </p>
                          </div>
                        </div>

                        
                      </div>

                      <div className="p-5 bg-linear-to-b from-white to-gray-50">
                        <h3 className="font-black text-lg text-gray-900 text-center group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
                          {category.name}
                        </h3>
                        {category.productCount > 0 && (
                          <div className="flex items-center justify-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-indigo-600 font-bold">{category.productCount} items</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-linear-to-b from-white via-purple-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-linear-to-br from-pink-500 to-red-600 rounded-2xl shadow-lg animate-pulse">
                  <FiTrendingUp className="text-white" size={32} />
                </div>
                <div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900">
                    Trending <span className="bg-clip-text text-transparent bg-linear-to-r from-pink-600 to-red-600">Products</span>
                  </h2>
                  <p className="text-gray-600 text-lg mt-2">Hot deals just for you 🔥</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="hidden md:flex items-center gap-3 px-8 py-4 bg-linear-to-r from-pink-600 to-red-600 text-white rounded-xl font-bold hover:from-pink-700 hover:to-red-700 transition-all shadow-lg hover:shadow-2xl transform hover:scale-105"
            >
              View All
              <FiArrowRight />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-3xl h-96 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-linear-to-br from-gray-50 to-gray-100 rounded-3xl">
              <div className="text-8xl mb-6">🛍️</div>
              <p className="text-gray-600 text-2xl font-semibold mb-4">No products available yet</p>
              <p className="text-gray-500">Products will appear here once added by sellers</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product)}
                    onMouseEnter={() => setHoveredProduct(product._id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                    className="group cursor-pointer"
                  >
                    <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:scale-105 hover:-translate-y-3">
                      <div className="absolute -inset-1 bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-75 blur-xl transition-opacity duration-500"></div>
                      
                      <div className="relative bg-white rounded-3xl overflow-hidden">
                        <div className="relative aspect-square overflow-hidden bg-linear-to-br from-gray-100 to-gray-200">
                          <img
                            src={product.thumbnail?.url || product.images?.[0]?.url || 'https://via.placeholder.com/400'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-700"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400?text=Product';
                            }}
                          />
                          
                          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                            {product.discount > 0 && (
                              <span className="inline-flex items-center gap-1 bg-linear-to-r from-red-500 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg animate-bounce">
                                <FiPercent size={12} />
                                {product.discount}% OFF
                              </span>
                            )}
                            {/* Wishlist Button */}
                            <button 
                              onClick={(e) => handleWishlistToggle(e, product)}
                              className={`ml-auto p-2.5 rounded-full shadow-lg transition-all transform ${
                                isInWishlist(product._id)
                                  ? 'bg-red-500 text-white scale-110'
                                  : 'bg-white hover:bg-red-50 hover:text-red-500'
                              } ${hoveredProduct === product._id ? 'scale-110 rotate-12' : 'scale-0'} duration-300`}
                            >
                              <FiHeart className={isInWishlist(product._id) ? 'fill-current' : ''} />
                            </button>
                          </div>

                          {product.stock === 0 && (
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                              <div className="bg-white px-6 py-3 rounded-2xl font-black text-gray-900 shadow-2xl transform rotate-3">
                                Out of Stock
                              </div>
                            </div>
                          )}

                          <div className={`absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center pb-6 transition-all duration-500 ${hoveredProduct === product._id ? 'opacity-100' : 'opacity-0'}`}>
                            <button className="bg-white text-indigo-600 px-6 py-3 rounded-full font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-2xl transform translate-y-4 group-hover:translate-y-0">
                              Quick View
                            </button>
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-[48px]">
                            {product.name}
                          </h3>
                          
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
                          
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-black text-indigo-600">
                                ₹{product.finalPrice || product.price}
                              </span>
                              {product.discount > 0 && (
                                <span className="text-sm text-gray-400 line-through">
                                  ₹{product.price}
                                </span>
                              )}
                            </div>
                            {product.stock > 0 && (
                              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                {/* Stock Info */}
{product.stock > 0 && product.stock <= 10 ? (
  <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold inline-block">
    ⚠️ Low Stock
  </div>
) : product.stock > 10 ? (
  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold inline-block">
    ✓ In Stock
  </div>
) : null}
                              </div>
                            )}
                          </div>

                          {/* Add to Cart Button */}
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={product.stock === 0}
                            className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 ${
                              isInCart(product._id)
                                ? 'bg-green-500 text-white'
                                : 'bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <FiShoppingCart />
                            {isInCart(product._id) ? '✓ In Cart' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button
                  onClick={() => navigate('/products')}
                  className="px-12 py-5 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-black text-xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all shadow-2xl hover:shadow-indigo-500/50 inline-flex items-center gap-4 group transform hover:scale-105"
                >
                  <span>Explore All Products</span>
                  <FiArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Why Shop With <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">Us?</span>
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto">
              Experience premium shopping with unbeatable features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className={`relative ${feature.bg} rounded-3xl p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 cursor-pointer overflow-hidden`}>
                  <div className={`absolute inset-0 bg-linear-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  <div className="relative">
                    <div className={`mx-auto w-24 h-24 rounded-3xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl`}>
                      <div className="text-white text-4xl">
                        {feature.icon}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="relative font-black text-2xl text-gray-900 mb-3 group-hover:scale-105 transition-transform">
                    {feature.title}
                  </h3>
                  <p className="relative text-gray-600 font-medium">{feature.description}</p>

                  
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <FiShoppingBag className="absolute top-20 left-[10%] w-12 h-12 opacity-10 animate-float" />
          <FiGift className="absolute bottom-20 right-[15%] w-16 h-16 opacity-10 animate-float animation-delay-1000" />
          <FiStar className="absolute top-40 right-[20%] w-10 h-10 opacity-10 animate-float animation-delay-2000" />
          <FiHeart className="absolute bottom-40 left-[20%] w-14 h-14 opacity-10 animate-float animation-delay-3000" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="inline-block animate-bounce">
              <div className="text-7xl mb-4"></div>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Ready to Start Your
              <br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-yellow-300 to-pink-300">
                Shopping Journey?
              </span>
            </h2>
            
            <p className="text-2xl md:text-3xl text-purple-100 max-w-3xl mx-auto font-semibold">
              Join <span className="text-yellow-300 font-black">50,000+</span> happy customers today!
            </p>
            
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <button
                  onClick={() => navigate('/register')}
                  className="group relative px-12 py-6 bg-white text-indigo-600 rounded-2xl font-black text-xl overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-2xl"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-yellow-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center justify-center gap-3 group-hover:text-white">
                    <FiShoppingCart size={28} />
                    Create Free Account
                    <FiArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                  </span>
                </button>
                
                <button
                  onClick={() => navigate('/products')}
                  className="px-12 py-6 bg-white/10 backdrop-blur-lg border-3 border-white/50 text-white rounded-2xl font-black text-xl hover:bg-white/20 transition-all duration-300 shadow-xl hover:scale-105 hover:border-white"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/products')}
                className="group px-12 py-6 bg-white text-indigo-600 rounded-2xl font-black text-xl hover:bg-yellow-300 transition-all duration-300 shadow-2xl hover:scale-105 inline-flex items-center gap-4"
              >
                <FiShoppingBag size={28} />
                Start Shopping Now
                <FiArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
              </button>
            )}

            <div className="pt-12 flex flex-wrap justify-center gap-6 text-lg">
              <div className="flex items-center gap-2">
                <FiShield className="text-green-300" size={24} />
                <span className="font-semibold">100% Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <FiTruck className="text-blue-300" size={24} />
                <span className="font-semibold">Free Shipping Over ₹500</span>
              </div>
              <div className="flex items-center gap-2">
                <FiAward className="text-yellow-300" size={24} />
                <span className="font-semibold">Top Rated Platform</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
