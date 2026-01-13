import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiTruck, FiTag, FiChevronRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { addressService, checkoutService } from '../services';
import toast from 'react-hot-toast';
import AddressCard from '../components/AddressCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal } = useCart();
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);

  const SHIPPING_CHARGE = 50;
  const FREE_SHIPPING_THRESHOLD = 500;

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    // Redirect if cart is empty
    if (!loading && cart.length === 0) {
      toast.error('Your cart is empty');
      navigate('/products');
    }
  }, [cart, loading, navigate]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressService.getAllAddresses();
      
      if (response.success) {
        setAddresses(response.addresses);
        
        // Auto-select default address
        const defaultAddress = response.addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setApplying(true);
    try {
      const response = await checkoutService.validateCoupon(couponCode, cartTotal);
      
      if (response.success) {
        setAppliedCoupon(response.coupon);
        setDiscount(response.discount);
        toast.success(`Coupon applied! You saved ₹${response.discount}`);
      }
    } catch (error) {
      console.error('Apply coupon error:', error);
      toast.error(error.response?.data?.message || 'Invalid coupon code');
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await checkoutService.removeCoupon();
      setAppliedCoupon(null);
      setDiscount(0);
      setCouponCode('');
      toast.success('Coupon removed');
    } catch (error) {
      console.error('Remove coupon error:', error);
    }
  };

  const calculateShipping = () => {
    return cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
  };

  const calculateTotal = () => {
    const shipping = calculateShipping();
    return cartTotal + shipping - discount;
  };

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    // Pass checkout data to payment page
    navigate('/payment', {
      state: {
        addressId: selectedAddress,
        cartTotal,
        discount,
        shipping: calculateShipping(),
        total: calculateTotal(),
        couponCode: appliedCoupon?.code
      }
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading checkout..." />;
  }

  if (cart.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Address & Coupon */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FiMapPin className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Delivery Address</h2>
                  <p className="text-sm text-gray-600">Select where you want your order delivered</p>
                </div>
              </div>

              {addresses.length === 0 ? (
                <EmptyState
                  icon="package"
                  title="No addresses found"
                  description="Add a delivery address to continue"
                  actionLabel="Add Address"
                  onAction={() => navigate('/addresses')}
                />
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <AddressCard
                      key={address._id}
                      address={address}
                      selectable
                      selected={selectedAddress === address._id}
                      onSelect={setSelectedAddress}
                    />
                  ))}
                  
                  <button
                    onClick={() => navigate('/addresses')}
                    className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl font-medium hover:border-indigo-400 hover:text-indigo-600 transition-all"
                  >
                    + Add New Address
                  </button>
                </div>
              )}
            </div>

            {/* Apply Coupon */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiTag className="text-green-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Apply Coupon</h2>
                  <p className="text-sm text-gray-600">Enter your coupon code</p>
                </div>
              </div>

              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-green-900">{appliedCoupon.code}</p>
                      <p className="text-sm text-green-700">You saved ₹{discount}</p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applying || !couponCode.trim()}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applying ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item._id || item.product?._id} className="flex items-center gap-3">
                    <img
                      src={item.product?.images?.[0]?.url || '/placeholder.png'}
                      alt={item.product?.name || 'Product'}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{((item.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{cartTotal.toLocaleString()}</span>
                </div>

                {/* Discount */}
                {discount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-₹{discount.toLocaleString()}</span>
                  </div>
                )}

                {/* Shipping */}
                <div className="flex items-center justify-between text-gray-700">
                  <div className="flex items-center gap-1">
                    <FiTruck size={16} />
                    <span>Shipping</span>
                  </div>
                  <span className="font-semibold">
                    {calculateShipping() === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${calculateShipping()}`
                    )}
                  </span>
                </div>

                {/* Free Shipping Progress */}
                {cartTotal < FREE_SHIPPING_THRESHOLD && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800 mb-2">
                      Add ₹{(FREE_SHIPPING_THRESHOLD - cartTotal).toLocaleString()} more for FREE shipping!
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(cartTotal / FREE_SHIPPING_THRESHOLD) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Proceed Button */}
              <button
                onClick={handleProceedToPayment}
                disabled={!selectedAddress}
                className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                Proceed to Payment
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
