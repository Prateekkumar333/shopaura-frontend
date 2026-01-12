// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useState, useEffect } from 'react';
import {
  FiShoppingBag,
  FiHome,
  FiGrid,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiBell,
  FiSettings
} from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount, toggleCart } = useCart();
  const { getWishlistCount, navigateToWishlist } = useWishlist();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <FiHome /> },
    { name: 'Products', path: '/products', icon: <FiShoppingBag /> },
    { name: 'Dashboard', path: '/dashboard', icon: <FiGrid /> },
  ];

  return (
    <>
      {/* Main Navbar */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-lg shadow-2xl py-3' 
            : 'bg-white shadow-lg py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Logo with Animation */}
            <Link to="/" className="flex items-center gap-3 group relative">
              {/* Glow Effect */}
              <div className="absolute -inset-2 bg-linear-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              
              {/* Logo Container */}
              <div className="relative flex items-center gap-3">
                <div className="relative">
                  {/* Animated Shopping Cart Icon */}
                  <div className="text-4xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                    🛒
                  </div>
                  {/* Notification Badge */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                
                {/* Brand Name */}
                <div className="flex flex-col">
                  <span className="text-3xl font-black leading-none">
                    <span className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      shop
                    </span>
                    <span className="bg-linear-to-r from-pink-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
                      aura
                    </span>
                  </span>
                  <span className="text-[8px] font-semibold text-gray-500 tracking-widest uppercase">
                    Shop Smarter ✨
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="group relative px-5 py-2.5 text-gray-700 hover:text-indigo-600 transition-all duration-300 font-semibold text-base"
                >
                  <div className="flex items-center gap-2">
                    <span className="group-hover:scale-110 transition-transform">
                      {link.icon}
                    </span>
                    <span>{link.name}</span>
                  </div>
                  {/* Animated Underline */}
                  <div className="absolute bottom-0 left-0 w-0 h-1 bg-linear-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300 rounded-full"></div>
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  {/* Search Button */}
                  <button 
                    type="button"
                    onClick={() => navigate('/products')}
                    className="p-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300 transform hover:scale-110 relative group"
                  >
                    <FiSearch size={20} />
                    <div className="absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
                  </button>

                  {/* Wishlist Button */}
                  <button 
                    type="button"
                    onClick={navigateToWishlist}
                    className="relative p-3 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 transform hover:scale-110 group"
                  >
                    <FiHeart size={20} />
                    {getWishlistCount() > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-linear-to-r from-pink-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                        {getWishlistCount()}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-linear-to-r from-red-500 to-pink-500 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
                  </button>

                  {/* Cart Button */}
                  <button 
                    type="button"
                    onClick={toggleCart}
                    className="relative p-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300 transform hover:scale-110 group"
                  >
                    <FiShoppingCart size={20} />
                    {/* Cart Badge */}
                    {getCartCount() > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-linear-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                        {getCartCount()}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
                  </button>

                  {/* Notifications */}
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300 transform hover:scale-110 group"
                    >
                      <FiBell size={20} />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      <div className="absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <>
                        <div 
                          className="fixed inset-0 z-30" 
                          onClick={() => setShowNotifications(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-down z-40">
                          <div className="p-4 bg-linear-to-r from-indigo-500 to-purple-600 text-white">
                            <h3 className="font-bold text-lg">Notifications</h3>
                            <p className="text-sm text-indigo-100">You have 3 new notifications</p>
                          </div>
                          <div className="p-2 max-h-96 overflow-y-auto">
                            {[
                              { id: 1, text: 'New order placed', time: '2 minutes ago', emoji: '📦' },
                              { id: 2, text: 'Product back in stock', time: '1 hour ago', emoji: '✨' },
                              { id: 3, text: 'Special discount available', time: '3 hours ago', emoji: '🎉' }
                            ].map((notification) => (
                              <div key={notification.id} className="p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-linear-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-2xl">
                                    {notification.emoji}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">{notification.text}</p>
                                    <p className="text-xs text-gray-500">{notification.time}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="p-3 border-t border-gray-100 text-center">
                            <button type="button" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                              View All Notifications
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* User Profile Dropdown */}
                  <div className="flex items-center gap-3 pl-4 border-l-2 border-gray-200">
                    {/* User Avatar & Info */}
                    <div className="group relative">
                      <div className="flex items-center gap-3 px-4 py-2 bg-linear-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                        {/* Avatar */}
                        <div className="relative">
                          <div className="w-11 h-11 rounded-xl bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-lg shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                          {/* Online Status */}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        
                        {/* User Info */}
                        <div className="text-left">
                          <p className="text-xs text-gray-500 font-medium">Welcome back</p>
                          <p className="font-bold text-gray-900 leading-tight">{user?.name}</p>
                        </div>

                        {/* Dropdown Arrow */}
                        <svg className="w-4 h-4 text-gray-600 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50">
                        <div className="p-4 bg-linear-to-r from-indigo-500 to-purple-600 text-white">
                          <p className="font-bold">{user?.name}</p>
                          <p className="text-sm text-indigo-100 truncate">{user?.email}</p>
                        </div>
                        <div className="p-2">
                          <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all font-medium">
                            <FiUser />
                            <span>My Profile</span>
                          </Link>
                          <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all font-medium">
                            <FiSettings />
                            <span>Settings</span>
                          </Link>
                          <hr className="my-2 border-gray-100" />
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
                          >
                            <FiLogOut />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="px-6 py-3 text-gray-700 hover:text-indigo-600 rounded-xl font-semibold transition-all duration-300 hover:bg-indigo-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="group relative px-8 py-3 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center gap-2">
                      Register
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-110 relative group"
            >
              <div className="absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6 text-gray-700 relative z-10" />
              ) : (
                <FiMenu className="w-6 h-6 text-gray-700 relative z-10" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-40 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}

        {/* Mobile Menu Sidebar */}
        <div
          className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl lg:hidden z-50 transform transition-transform duration-500 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="p-6 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🛒</span>
                  <div>
                    <h2 className="text-2xl font-black">shopaura</h2>
                    <p className="text-xs text-indigo-100">Your Shopping Hub</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* User Profile in Mobile */}
              {isAuthenticated && user && (
                <div className="flex items-center gap-3 p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                  <div className="w-14 h-14 rounded-xl bg-linear-to-br from-white/30 to-white/10 flex items-center justify-center text-white font-black text-xl border-2 border-white/30">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg truncate">{user?.name}</p>
                    <p className="text-xs text-indigo-100 truncate">{user?.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Navigation Links */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {isAuthenticated ? (
                <>
                  {/* Quick Actions */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <button 
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        toggleCart();
                      }}
                      className="flex flex-col items-center gap-2 p-4 bg-linear-to-br from-indigo-50 to-purple-50 rounded-xl hover:shadow-lg transition-all relative"
                    >
                      <FiShoppingCart className="text-indigo-600" size={24} />
                      <span className="text-xs font-semibold text-gray-700">Cart</span>
                      {getCartCount() > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {getCartCount()}
                        </span>
                      )}
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigateToWishlist();
                      }}
                      className="flex flex-col items-center gap-2 p-4 bg-linear-to-br from-pink-50 to-red-50 rounded-xl hover:shadow-lg transition-all relative"
                    >
                      <FiHeart className="text-red-500" size={24} />
                      <span className="text-xs font-semibold text-gray-700">Wishlist</span>
                      {getWishlistCount() > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {getWishlistCount()}
                        </span>
                      )}
                    </button>
                    <button type="button" className="flex flex-col items-center gap-2 p-4 bg-linear-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-lg transition-all">
                      <FiBell className="text-green-600" size={24} />
                      <span className="text-xs font-semibold text-gray-700">Alerts</span>
                    </button>
                  </div>

                  {/* Navigation Links */}
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-4 text-gray-700 hover:bg-linear-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 rounded-xl font-semibold transition-all group"
                    >
                      <div className="text-2xl group-hover:scale-110 transition-transform">
                        {link.icon}
                      </div>
                      <span>{link.name}</span>
                      <svg className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}

                  <hr className="my-4 border-gray-200" />

                  {/* Profile Links */}
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl font-semibold transition-all"
                  >
                    <FiUser size={20} />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-4 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl font-semibold transition-all"
                  >
                    <FiSettings size={20} />
                    <span>Settings</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-6 py-4 text-center text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl font-semibold transition-all"
                  >
                    Login to Your Account
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-6 py-4 text-center bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    Create New Account
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Footer */}
            {isAuthenticated && (
              <div className="p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-linear-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-pink-700 transition-all shadow-lg transform hover:scale-105"
                >
                  <FiLogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className={`${scrolled ? 'h-20' : 'h-24'} transition-all duration-500`}></div>
    </>
  );
};

export default Navbar;
