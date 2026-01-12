// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* ✅ FIXED: CartProvider and WishlistProvider moved inside Router */}
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* Routes with shared layout */}
              <Route path="/" element={<Layout />}>
                {/* Public Routes */}
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="products" element={<Products />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route 
                  path="wishlist" 
                  element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Protected Routes */}
                <Route 
                  path="dashboard" 
                  element={
                    <ProtectedRoute>
                      <div className="min-h-screen flex items-center justify-center bg-linear-to-brrom-slate-50 to-white">
                        <div className="text-center p-12 bg-white rounded-3xl shadow-2xl">
                          <div className="text-8xl mb-6">🚀</div>
                          <h1 className="text-5xl font-black text-gray-900 mb-4">
                            Dashboard <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600">Coming Soon</span>
                          </h1>
                          <p className="text-gray-600 text-xl mb-8">
                            This feature is under development
                          </p>
                          <button
                            onClick={() => window.location.href = '/'}
                            className="px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            Back to Home
                          </button>
                        </div>
                      </div>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
