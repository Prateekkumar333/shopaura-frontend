// src/pages/Products.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import API from '../utils/api';
import {
  FiGrid,
  FiList,
  FiFilter,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiStar,
  FiHeart,
  FiSearch,
  FiShoppingCart,
  FiPercent,
  FiTag
} from 'react-icons/fi';

const Products = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Cart & Wishlist hooks
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [minRating, setMinRating] = useState(0);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, currentPage, searchQuery, minRating]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await API.get('/categories');
      let allCategories = [];
      if (res.data.data) {
        allCategories = res.data.data;
      } else if (Array.isArray(res.data)) {
        allCategories = res.data;
      } else if (res.data.categories) {
        allCategories = res.data.categories;
      }
      
      const activeCategories = allCategories.filter(cat => cat.isActive !== false);
      const categoryTree = buildCategoryTree(activeCategories);
      setCategories(categoryTree);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const buildCategoryTree = (categories) => {
    const parents = categories.filter(cat => !cat.parent);
    const children = categories.filter(cat => cat.parent);
    
    return parents.map(parent => {
      const parentChildren = children.filter(child => 
        child.parent === parent._id || 
        child.parent?._id === parent._id ||
        child.parent === parent.slug ||
        child.parent?.slug === parent.slug
      );
      
      return {
        ...parent,
        children: parentChildren
      };
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (selectedCategory) params.append('category', selectedCategory);
      
      if (sortBy) {
        switch(sortBy) {
          case 'price-low':
            params.append('sort', 'price');
            break;
          case 'price-high':
            params.append('sort', '-price');
            break;
          case 'rating':
            params.append('sort', '-averageRating');
            break;
          case 'newest':
            params.append('sort', '-createdAt');
            break;
          default:
            params.append('sort', '-createdAt');
        }
      }
      
      if (searchQuery) params.append('search', searchQuery);
      if (minRating > 0) params.append('minRating', minRating);
      
      params.append('page', currentPage);
      params.append('limit', 12);

      const res = await API.get(`/products?${params.toString()}`);
      
      let fetchedProducts = [];
      let total = 0;
      let pages = 1;
      
      if (res.data.data?.products) {
        fetchedProducts = res.data.data.products;
        total = res.data.data.total || res.data.data.totalProducts || 0;
        pages = res.data.data.totalPages || 1;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        fetchedProducts = res.data.data;
        total = res.data.total || fetchedProducts.length;
        pages = res.data.totalPages || 1;
      } else if (Array.isArray(res.data.products)) {
        fetchedProducts = res.data.products;
        total = res.data.total || fetchedProducts.length;
        pages = res.data.totalPages || 1;
      } else if (Array.isArray(res.data)) {
        fetchedProducts = res.data;
        total = fetchedProducts.length;
      }
      
      setProducts(fetchedProducts);
      setTotalPages(pages);
      setTotalProducts(total);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categorySlug) => {
    setSelectedCategory(categorySlug);
    setCurrentPage(1);
    
    const params = new URLSearchParams();
    if (categorySlug) params.set('category', categorySlug);
    if (sortBy) params.set('sort', sortBy);
    setSearchParams(params);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
    
    const params = new URLSearchParams(searchParams);
    if (value) params.set('sort', value);
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSortBy('newest');
    setSearchQuery('');
    setMinRating(0);
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product.slug || product._id}`);
  };

  const getBreadcrumb = () => {
    if (!selectedCategory) return null;
    
    const findCategory = (cats, slug) => {
      for (let cat of cats) {
        if (cat.slug === slug) return cat;
        if (cat.children && cat.children.length > 0) {
          const found = findCategory(cat.children, slug);
          if (found) return found;
        }
      }
      return null;
    };
    
    const category = findCategory(categories, selectedCategory);
    return category?.name || selectedCategory;
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

  // Handle Add to Cart with notification
  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    // You can add a toast notification here
  };

  // Handle Wishlist Toggle
  const handleWishlistToggle = (e, product) => {
    e.stopPropagation();
    toggleWishlist(product);
    // You can add a toast notification here
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">

      {/* Hero Header Section */}
      <section className="relative bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden py-16">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-purple-100 mb-6 animate-fade-in-up">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <FiChevronRight size={14} />
            <span className="text-white font-semibold">
              {getBreadcrumb() || 'All Products'}
            </span>
          </div>

          {/* Title & Search */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black mb-4 animate-fade-in-up animation-delay-200">
              {getBreadcrumb() || 'Discover Products'}
            </h1>
            <p className="text-xl text-purple-100 mb-6 animate-fade-in-up animation-delay-400">
              {loading ? 'Loading amazing products...' : `Explore ${totalProducts} premium products`}
            </p>

            {/* Search Bar - FIXED */}
            <form onSubmit={handleSearch} className="max-w-3xl animate-fade-in-up animation-delay-600">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-14 pr-32 rounded-2xl bg-white/95 backdrop-blur-md text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-yellow-300/50 shadow-2xl border-2 border-white/50 hover:bg-white transition-all"
                />
                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-4 animate-fade-in-up animation-delay-800">
            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl hover:bg-white/30 transition-all font-semibold"
            >
              <FiFilter size={20} />
              Filters
              {(selectedCategory || minRating > 0) && (
                <span className="bg-yellow-400 text-indigo-900 text-xs rounded-full w-6 h-6 flex items-center justify-center font-black animate-bounce">
                  {(selectedCategory ? 1 : 0) + (minRating > 0 ? 1 : 0)}
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-xl p-1.5 border-2 border-white/30">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-all font-semibold ${
                  viewMode === 'grid' 
                    ? 'bg-white text-indigo-600 shadow-lg' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <FiGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-all font-semibold ${
                  viewMode === 'list' 
                    ? 'bg-white text-indigo-600 shadow-lg' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <FiList size={20} />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none px-6 py-3 pr-12 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl text-white font-semibold focus:outline-none focus:ring-4 focus:ring-white/50 cursor-pointer"
              >
                <option value="newest" className="text-gray-900">Newest First</option>
                <option value="price-low" className="text-gray-900">Price: Low to High</option>
                <option value="price-high" className="text-gray-900">Price: High to Low</option>
                <option value="rating" className="text-gray-900">Top Rated</option>
              </select>
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" size={20} />
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 fill-current text-slate-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39 56.44c58-10.79 114.16-30.13 172-41.86 82.39-16.72 168.19-17.73 250.45-.39C823.78 31 906.67 72 985.66 92.83c70.05 18.48 146.53 26.09 214.34 3V0H0v27.35a600.21 600.21 0 0 0 321.39 29.09z"></path>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:block ${showFilters ? 'block' : 'hidden'} lg:w-80 shrink-0`}>
            <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-4 border-2 border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl">
                    <FiFilter className="text-white" size={20} />
                  </div>
                  <h2 className="text-xl font-black text-gray-900">Filters</h2>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Categories Filter */}
              <div className="mb-6 pb-6 border-b-2 border-gray-100">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                  <FiTag className="text-indigo-600" />
                  Categories
                </h3>
                {categoriesLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No categories available</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-indigo-50 p-3 rounded-xl transition-all group">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === ''}
                        onChange={() => handleCategoryChange('')}
                        className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span className="text-gray-700 font-semibold group-hover:text-indigo-600 transition-colors">All Categories</span>
                    </label>
                    
                    {categories.map((category) => (
                      <div key={category._id}>
                        <label className="flex items-center gap-3 cursor-pointer hover:bg-indigo-50 p-3 rounded-xl transition-all group">
                          <input
                            type="radio"
                            name="category"
                            checked={selectedCategory === category.slug}
                            onChange={() => handleCategoryChange(category.slug)}
                            className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          <div className="flex-1 flex items-center justify-between">
                            <span className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{category.name}</span>
                            {category.productCount > 0 && (
                              <span className="text-xs text-white bg-indigo-600 px-2 py-1 rounded-full font-bold">{category.productCount}</span>
                            )}
                          </div>
                        </label>
                        
                        {category.children && category.children.length > 0 && (
                          <div className="ml-8 mt-2 space-y-2 border-l-2 border-indigo-200 pl-4">
                            {category.children.map((subcat) => (
                              <label
                                key={subcat._id}
                                className="flex items-center gap-3 cursor-pointer hover:bg-purple-50 p-2 rounded-lg transition-all group"
                              >
                                <input
                                  type="radio"
                                  name="category"
                                  checked={selectedCategory === subcat.slug}
                                  onChange={() => handleCategoryChange(subcat.slug)}
                                  className="text-purple-600 focus:ring-purple-500 w-4 h-4"
                                />
                                <div className="flex-1 flex items-center justify-between">
                                  <span className="text-gray-700 text-sm font-medium group-hover:text-purple-600 transition-colors">{subcat.name}</span>
                                  {subcat.productCount > 0 && (
                                    <span className="text-xs text-white bg-purple-600 px-2 py-0.5 rounded-full font-bold">{subcat.productCount}</span>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                  <FiStar className="text-amber-500" />
                  Minimum Rating
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-amber-50 p-3 rounded-xl transition-all group">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === 0}
                      onChange={() => setMinRating(0)}
                      className="text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span className="text-gray-700 font-semibold group-hover:text-amber-600 transition-colors">All Ratings</span>
                  </label>
                  {[4, 3, 2, 1].map((rating) => (
                    <label
                      key={rating}
                      className="flex items-center gap-3 cursor-pointer hover:bg-amber-50 p-3 rounded-xl transition-all group"
                    >
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === rating}
                        onChange={() => setMinRating(rating)}
                        className="text-amber-600 focus:ring-amber-500 w-4 h-4"
                      />
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {renderStars(rating)}
                        </div>
                        <span className="text-gray-700 font-medium group-hover:text-amber-600 transition-colors">& up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory || minRating > 0) && (
                <div className="space-y-3 p-4 bg-linear-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-100">
                  <p className="text-sm font-black text-gray-900 mb-3">Active Filters</p>
                  {selectedCategory && (
                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm">
                      <span className="text-sm font-semibold text-indigo-700">{getBreadcrumb()}</span>
                      <button
                        onClick={() => handleCategoryChange('')}
                        className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 p-1 rounded-lg transition-all"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  )}
                  {minRating > 0 && (
                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm">
                      <span className="text-sm font-semibold text-amber-700">{minRating}+ Stars</span>
                      <button
                        onClick={() => setMinRating(0)}
                        className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 p-1 rounded-lg transition-all"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Close Button */}
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden w-full mt-6 px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg"
              >
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Products Grid/List */}
          <main className="flex-1">
            {loading ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl shadow-lg h-96 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
                <div className="text-8xl mb-6 animate-bounce">🔍</div>
                <h3 className="text-3xl font-black text-gray-900 mb-4">No Products Found</h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                  {searchQuery 
                    ? `No results for "${searchQuery}". Try different keywords or filters.`
                    : 'Try adjusting your filters to see more products'
                  }
                </p>
                <button
                  onClick={clearFilters}
                  className="px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                {/* Grid View */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                      <div
                        key={product._id}
                        onClick={() => handleProductClick(product)}
                        onMouseEnter={() => setHoveredProduct(product._id)}
                        onMouseLeave={() => setHoveredProduct(null)}
                        className="group cursor-pointer"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:scale-105 hover:-translate-y-2">
                          <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-75 blur-xl transition-opacity duration-500"></div>
                          
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
                                <button className="bg-white text-indigo-600 px-6 py-3 rounded-full font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-2xl">
                                  Quick View
                                </button>
                              </div>
                            </div>

                            <div className="p-5 space-y-3">
                              <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-12">
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
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <div className="space-y-6">
                    {products.map((product, index) => (
                      <div
                        key={product._id}
                        onClick={() => handleProductClick(product)}
                        onMouseEnter={() => setHoveredProduct(product._id)}
                        onMouseLeave={() => setHoveredProduct(null)}
                        className="group cursor-pointer"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden flex transform hover:scale-[1.02]">
                          <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500"></div>
                          
                          <div className="relative bg-white rounded-3xl overflow-hidden flex w-full">
                            <div className="w-64 h-64 overflow-hidden bg-linear-to-br from-gray-100 to-gray-200 relative shrink-0">
                              <img
                                src={product.thumbnail?.url || product.images?.[0]?.url || 'https://via.placeholder.com/400'}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/400?text=Product';
                                }}
                              />
                              {product.discount > 0 && (
                                <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-linear-to-r from-red-500 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg">
                                  <FiPercent size={12} />
                                  {product.discount}% OFF
                                </span>
                              )}
                              {/* Wishlist Button for List View */}
                              <button 
                                onClick={(e) => handleWishlistToggle(e, product)}
                                className={`absolute top-3 right-3 p-2.5 rounded-full shadow-lg transition-all ${
                                  isInWishlist(product._id)
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white hover:bg-red-50 hover:text-red-500'
                                }`}
                              >
                                <FiHeart className={isInWishlist(product._id) ? 'fill-current' : ''} />
                              </button>
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col justify-between">
                              <div>
                                <h3 className="font-black text-2xl text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                  {product.name}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                  {product.description}
                                </p>
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="flex items-center gap-1">
                                    {renderStars(product.averageRating || 0)}
                                    <span className="font-bold text-gray-900 ml-2">
                                      {product.averageRating?.toFixed(1) || '0.0'}
                                    </span>
                                  </div>
                                  <span className="text-gray-500">
                                    ({product.reviewCount || 0} reviews)
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-3xl font-black text-indigo-600">
                                    ₹{product.finalPrice || product.price}
                                  </span>
                                  {product.discount > 0 && (
                                    <span className="text-xl text-gray-400 line-through">
                                      ₹{product.price}
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => handleAddToCart(e, product)}
                                  disabled={product.stock === 0}
                                  className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 ${
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
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-3 flex-wrap">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-md"
                    >
                      Previous
                    </button>
                    
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-5 py-3 rounded-xl font-bold transition-all ${
                            currentPage === pageNum
                              ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-xl scale-110'
                              : 'bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-indigo-600 shadow-md'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-md"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Custom Scrollbar CSS */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-linear(to bottom, #6366f1, #a855f7);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-linear(to bottom, #4f46e5, #9333ea);
        }
      `}</style>
    </div>
  );
};

export default Products;
