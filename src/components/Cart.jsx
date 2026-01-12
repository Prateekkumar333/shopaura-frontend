// src/components/Cart.jsx
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FiX, FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiArrowRight, FiLoader } from 'react-icons/fi';

const Cart = () => {
  const {
    cartItems,
    isCartOpen,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getCartTotal,
    setIsCartOpen,
    loading
  } = useCart();
  
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-100 bg-linear-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <FiShoppingCart size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black">Shopping Cart</h2>
              <p className="text-sm text-purple-100">{cartItems.length} items</p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-white/20 rounded-xl transition-all"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <FiLoader className="animate-spin text-indigo-600" size={32} />
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-8xl mb-4">🛒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Add some products to get started!</p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/products');
                }}
                className="px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                Browse Products
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              // Handle both populated and non-populated product references
              const product = item.product;
              const productId = product._id || product;
              const productName = product.name || 'Product';
              const productImage = product.thumbnail?.url || product.images?.[0]?.url;
              const productPrice = item.finalPrice || item.price || 0;

              return (
                <div
                  key={productId}
                  className="flex gap-4 bg-gray-50 rounded-2xl p-4 hover:shadow-lg transition-all"
                >
                  {/* Product Image */}
                  <img
                    src={productImage || 'https://via.placeholder.com/100'}
                    alt={productName}
                    className="w-20 h-20 object-cover rounded-xl"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100';
                    }}
                  />

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1">
                      {productName}
                    </h3>
                    <p className="text-indigo-600 font-black text-lg mb-2">
                      ₹{productPrice}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => decrementQuantity(productId)}
                        disabled={loading}
                        className="w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="font-bold text-gray-900 w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => incrementQuantity(productId)}
                        disabled={loading}
                        className="w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiPlus size={14} />
                      </button>
                      <button
                        onClick={() => removeFromCart(productId)}
                        disabled={loading}
                        className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t-2 border-gray-100 p-6 space-y-4 bg-gray-50">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold text-gray-700">Subtotal:</span>
              <span className="font-black text-2xl text-gray-900">
                ₹{getCartTotal().toFixed(2)}
              </span>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Proceed to Checkout
                <FiArrowRight />
              </button>
              <button
                onClick={clearCart}
                disabled={loading}
                className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Cart;
