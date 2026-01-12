// src/pages/ProductDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import API from "../utils/api";
import {
  FiStar,
  FiHeart,
  FiShoppingCart,
  FiChevronRight,
  FiTruck,
  FiShield,
  FiRotateCcw,
  FiCheck,
  FiAlertCircle,
  FiX,
  FiZap,
  FiPackage,
} from "react-icons/fi";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, isInCart, getItemQuantity, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isHeartedFromAPI, setIsHeartedFromAPI] = useState(false); // ✅ NEW
  const isCurrentlyHearted = isHeartedFromAPI || isInWishlist(product?._id);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id, isAuthenticated]);

  // Update quantity from cart if already in cart
  useEffect(() => {
    if (product && isInCart(product._id)) {
      const cartQty = getItemQuantity(product._id);
      setQuantity(cartQty);
    }
  }, [product, isInCart, getItemQuantity]);

  // REPLACE ENTIRE fetchProduct function (around line 47-62)
  const fetchProduct = async () => {
    try {
      setLoading(true);

      // ✅ NEW: Use correct API based on auth status
      const endpoint = isAuthenticated
        ? `/products/${id}`
        : `/products/${id}/public`;
      const res = await API.get(endpoint);

      const productData = res.data.product;
      setProduct(productData);

      // ✅ NEW: Handle ishearted from API response
      if (productData.ishearted !== undefined) {
        setIsHeartedFromAPI(productData.ishearted);
      } else {
        setIsHeartedFromAPI(false);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      // Fallback to public API
      try {
        const fallbackRes = await API.get(`/products/${id}/public`);
        setProduct(fallbackRes.data.product);
        setIsHeartedFromAPI(false);
      } catch (fallbackError) {
        console.error("Fallback failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/product/${id}`);
      setReviews(res.data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleQuantityChange = (type) => {
    if (type === "increment" && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (isInCart(product._id)) {
      // Update quantity if already in cart
      updateQuantity(product._id, quantity);
    } else {
      // Add new item to cart
      addToCart({ ...product, quantity });
    }
  };

  // REPLACE handleWishlistToggle function (around line 90)
  const handleWishlistToggle = async () => {
    try {
      await toggleWishlist(product);

      // ✅ NEW: Update API state immediately
      setIsHeartedFromAPI((prev) => !prev);

      // Refresh product data
      await fetchProduct();
    } catch (error) {
      console.error("Wishlist toggle error:", error);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }
        size={16}
      />
    ));
  };

  const renderClickableStars = (rating, onClick) => {
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onClick(i + 1)}
        className="focus:outline-none transition-transform hover:scale-110"
      >
        <FiStar
          className={
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }
          size={24}
        />
      </button>
    ));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!reviewForm.comment.trim()) {
      alert("Please write a review comment");
      return;
    }

    setSubmittingReview(true);

    try {
      await API.post("/reviews", {
        product: product._id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      });

      alert("Review submitted successfully!");

      // Reset form and close modal
      setReviewForm({
        rating: 5,
        title: "",
        comment: "",
      });
      setShowReviewModal(false);

      // Refresh reviews
      fetchReviews();
      fetchProduct(); // Refresh product to update rating
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(
        error.response?.data?.message ||
          "Failed to submit review. Please try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-200 h-96 rounded-3xl" />
              <div className="space-y-4">
                <div className="bg-gray-200 h-8 rounded-xl w-3/4" />
                <div className="bg-gray-200 h-6 rounded-xl w-1/2" />
                <div className="bg-gray-200 h-32 rounded-xl" />
                <div className="bg-gray-200 h-16 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="text-8xl mb-6">😕</div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            This product might have been removed or doesn't exist.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const images = [
    product.thumbnail?.url,
    ...(product.images?.map((img) => img.url) || []),
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-linear-to-brom-slate-50 to-white">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link
              to="/"
              className="hover:text-indigo-600 transition-colors font-medium"
            >
              Home
            </Link>
            <FiChevronRight size={14} />
            <Link
              to="/products"
              className="hover:text-indigo-600 transition-colors font-medium"
            >
              Products
            </Link>
            <FiChevronRight size={14} />
            {product.category && (
              <>
                <Link
                  to={`/products?category=${product.category.slug}`}
                  className="hover:text-indigo-600 transition-colors font-medium"
                >
                  {product.category.name}
                </Link>
                <FiChevronRight size={14} />
              </>
            )}
            <span className="text-gray-900 font-semibold line-clamp-1">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden group">
              <div className="aspect-square bg-linear-to-br from-gray-100 to-gray-200">
                <img
                  src={
                    images[selectedImage] ||
                    "https://placehold.co/600x600?text=Product"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/600x600?text=Product";
                  }}
                />
              </div>
              {/* Discount Badge */}
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-linear-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-full font-black shadow-lg animate-bounce">
                  {product.discount}% OFF
                </div>
              )}

              <button
  type="button"  // ✅ ADD THIS - Prevents form submission
  onClick={(e) => {
    e.preventDefault();     // ✅ Prevents default action
    e.stopPropagation();   // ✅ Stops event bubbling
    handleWishlistToggle();
  }}
  disabled={product.stock === 0}
  className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 ${
    isCurrentlyHearted
      ? "bg-red-500 text-white"
      : "bg-white hover:bg-red-50 hover:text-red-500"
  } disabled:opacity-50 disabled:cursor-not-allowed`}
  title={
    isCurrentlyHearted
      ? "Remove from wishlist"
      : "Add to wishlist"
  }
>
  <FiHeart
    className={isCurrentlyHearted ? "fill-current" : ""}
    size={24}
  />
</button>

            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedImage === index
                        ? "border-indigo-600 shadow-lg ring-2 ring-indigo-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              {/* Product Name */}
              <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Brand */}
              {product.brand && (
                <div className="mb-4">
                  <span className="inline-block bg-linear-to-r from-indigo-100 to-purple-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold">
                    Brand: {product.brand}
                  </span>
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-1">
                  {renderStars(Math.round(product.averageRating || 0))}
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {product.averageRating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-gray-500 font-medium">
                  ({product.reviewCount || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-4xl font-black bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">
                    ₹{product.finalPrice || product.price}
                  </span>
                  {product.discount > 0 && (
                    <>
                      <span className="text-2xl text-gray-400 line-through font-semibold">
                        ₹{product.price}
                      </span>
                      <span className="bg-linear-to-r from-green-500 to-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-black shadow-md">
                        Save ₹
                        {product.price - (product.finalPrice || product.price)}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Inclusive of all taxes • Free shipping over ₹500
                </p>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <div className="flex items-center gap-3 bg-linear-to-r from-green-50 to-emerald-50 border-2 border-green-200 px-6 py-4 rounded-xl">
                    <div className="bg-green-500 p-2 rounded-full">
                      <FiCheck className="text-white" size={20} />
                    </div>
                    <div>
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
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-linear-to-r from-red-50 to-pink-50 border-2 border-red-200 px-6 py-4 rounded-xl">
                    <FiAlertCircle className="text-red-600" size={24} />
                    <div>
                      <p className="font-bold text-red-700 text-lg">
                        Out of Stock
                      </p>
                      <p className="text-sm text-red-600 font-medium">
                        This item is currently unavailable
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-black text-gray-900 mb-3 uppercase tracking-wide">
                    Quantity:
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleQuantityChange("decrement")}
                      className="w-12 h-12 bg-linear-to-r from-gray-100 to-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 font-black text-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      -
                    </button>
                    <span className="w-20 text-center font-black text-2xl text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange("increment")}
                      disabled={quantity >= product.stock}
                      className="w-12 h-12 bg-linear-to-r from-gray-100 to-gray-200 rounded-xl hover:from-gray-200 hover:to-gray-300 font-black text-xl transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-600 font-medium ml-2">
                      Max: {product.stock}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`w-full py-5 rounded-xl font-black text-lg transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 transform hover:scale-105 ${
                    isInCart(product._id)
                      ? "bg-linear-to-r from-green-500 to-emerald-600 text-white"
                      : "bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  <FiShoppingCart size={24} />
                  {isInCart(product._id) ? "✓ Update Cart" : "Add to Cart"}
                </button>

                <button
                  onClick={handleWishlistToggle}
                  disabled={product.stock === 0}
                  className={`w-full py-5 rounded-xl font-black text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 transform hover:scale-105 ${
                    isCurrentlyHearted
                      ? "bg-linear-to-r from-red-500 to-pink-600 text-white"
                      : "bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  <FiHeart
                    className={isCurrentlyHearted ? "fill-current" : ""}
                    size={24}
                  />
                  {isCurrentlyHearted ? "✓ In Wishlist" : "Add to Wishlist"}
                </button>
              </div>

              {/* Features */}
              <div className="space-y-4 bg-linear-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-100">
                <div className="flex items-center gap-4 text-gray-700">
                  <div className="bg-linear-to-r from-indigo-500 to-purple-600 p-3 rounded-xl">
                    <FiTruck className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Free Delivery</p>
                    <p className="text-sm text-gray-600">
                      On orders above ₹500
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-700">
                  <div className="bg-linear-to-r from-green-500 to-emerald-600 p-3 rounded-xl">
                    <FiRotateCcw className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Easy Returns</p>
                    <p className="text-sm text-gray-600">
                      30-day return policy
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-700">
                  <div className="bg-linear-to-r from-yellow-500 to-orange-600 p-3 rounded-xl">
                    <FiShield className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Secure Payments</p>
                    <p className="text-sm text-gray-600">100% safe & secure</p>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              {product.seller && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <FiPackage className="text-indigo-600" size={24} />
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Sold by
                      </p>
                      <p className="font-bold text-gray-900 text-lg">
                        {product.seller.name || "ShopAura Seller"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
            <div className="flex">
              <button
                onClick={() => setActiveTab("description")}
                className={`px-8 py-5 font-bold text-lg transition-all ${
                  activeTab === "description"
                    ? "text-indigo-600 border-b-4 border-indigo-600 bg-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("specifications")}
                className={`px-8 py-5 font-bold text-lg transition-all ${
                  activeTab === "specifications"
                    ? "text-indigo-600 border-b-4 border-indigo-600 bg-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-8 py-5 font-bold text-lg transition-all ${
                  activeTab === "reviews"
                    ? "text-indigo-600 border-b-4 border-indigo-600 bg-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Reviews ({product.reviewCount || 0})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "description" && (
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <FiZap className="text-indigo-600" />
                  Product Description
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                  {product.description ||
                    "No description available for this product."}
                </p>
              </div>
            )}

            {activeTab === "specifications" && (
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-6">
                  Technical Specifications
                </h3>
                <div className="grid gap-4">
                  <div className="flex py-4 border-b border-gray-200 hover:bg-gray-50 rounded-lg px-4 transition-colors">
                    <span className="font-bold text-gray-700 w-1/3">
                      Brand:
                    </span>
                    <span className="text-gray-900 w-2/3 font-medium">
                      {product.brand || "N/A"}
                    </span>
                  </div>
                  <div className="flex py-4 border-b border-gray-200 hover:bg-gray-50 rounded-lg px-4 transition-colors">
                    <span className="font-bold text-gray-700 w-1/3">SKU:</span>
                    <span className="text-gray-900 w-2/3 font-medium">
                      {product.sku || "N/A"}
                    </span>
                  </div>
                  <div className="flex py-4 border-b border-gray-200 hover:bg-gray-50 rounded-lg px-4 transition-colors">
                    <span className="font-bold text-gray-700 w-1/3">
                      Category:
                    </span>
                    <span className="text-gray-900 w-2/3 font-medium">
                      {product.category?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex py-4 border-b border-gray-200 hover:bg-gray-50 rounded-lg px-4 transition-colors">
                    <span className="font-bold text-gray-700 w-1/3">
                      Stock:
                    </span>
                    <span className="text-gray-900 w-2/3 font-medium">
                      {product.stock} units
                    </span>
                  </div>
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex py-4 hover:bg-gray-50 rounded-lg px-4 transition-colors">
                      <span className="font-bold text-gray-700 w-1/3">
                        Tags:
                      </span>
                      <div className="w-2/3 flex flex-wrap gap-2">
                        {product.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-gray-900">
                    Customer Reviews
                  </h3>
                  {isAuthenticated && (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Write a Review
                    </button>
                  )}
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div
                        key={review._id}
                        className="border-2 border-gray-100 rounded-2xl p-6 hover:border-indigo-200 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-lg">
                                {review.user?.name?.[0]?.toUpperCase() || "A"}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-lg">
                                  {review.user?.name || "Anonymous"}
                                </p>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    {renderStars(review.rating)}
                                  </div>
                                  <span className="text-sm text-gray-600 font-medium">
                                    {new Date(
                                      review.createdAt
                                    ).toLocaleDateString("en-IN", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {review.title && (
                          <h4 className="font-bold text-gray-900 mb-2 text-lg">
                            {review.title}
                          </h4>
                        )}
                        <p className="text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-3 mt-4">
                            {review.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img.url}
                                alt={`Review ${idx + 1}`}
                                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-indigo-400 transition-all"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl">
                    <div className="text-7xl mb-4">⭐</div>
                    <p className="text-gray-600 text-lg mb-6">
                      No reviews yet. Be the first to review this product!
                    </p>
                    {isAuthenticated && (
                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                      >
                        Write First Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-200 bg-linear-to-r from-indigo-50 to-purple-50">
              <div>
                <h2 className="text-3xl font-black text-gray-900">
                  Write a Review
                </h2>
                <p className="text-gray-600 mt-1">
                  Share your experience with other shoppers
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-3 hover:bg-gray-200 rounded-full transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleReviewSubmit} className="p-8 space-y-6">
              {/* Product Info */}
              <div className="flex items-center gap-4 p-6 bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                <img
                  src={
                    product.thumbnail?.url ||
                    "https://placehold.co/100x100?text=Product"
                  }
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-xl shadow-md"
                />
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Share your honest feedback
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-black text-gray-900 mb-3 uppercase tracking-wide">
                  Your Rating *
                </label>
                <div className="flex items-center gap-3 bg-linear-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border-2 border-yellow-200">
                  {renderClickableStars(reviewForm.rating, (rating) =>
                    setReviewForm((prev) => ({ ...prev, rating }))
                  )}
                  <span className="ml-3 text-gray-700 font-bold text-lg">
                    {reviewForm.rating}{" "}
                    {reviewForm.rating === 1 ? "star" : "stars"}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-black text-gray-900 mb-3 uppercase tracking-wide">
                  Review Title (Optional)
                </label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Sum up your experience in one line"
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all font-medium text-lg"
                  maxLength={100}
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-black text-gray-900 mb-3 uppercase tracking-wide">
                  Your Review *
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  placeholder="Tell us what you think about this product..."
                  required
                  rows={6}
                  className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all font-medium text-lg"
                  maxLength={1000}
                />
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  {reviewForm.comment.length}/1000 characters
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all text-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || !reviewForm.comment.trim()}
                  className="flex-1 px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
