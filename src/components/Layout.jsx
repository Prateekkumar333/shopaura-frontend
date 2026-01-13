// src/components/Layout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Cart from './Cart';

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Cart />
      <main className="pt-16">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-black mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                ShopAura
              </h3>
              <p className="text-gray-400">
                Your one-stop destination for all your shopping needs.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="/products" className="hover:text-white transition-colors">Products</a></li>
                <li><a href="/categories" className="hover:text-white transition-colors">Categories</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/profile" className="hover:text-white transition-colors">My Account</a></li>
                <li><a href="/orders" className="hover:text-white transition-colors">Orders</a></li>
                <li><a href="/wishlist" className="hover:text-white transition-colors">Wishlist</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@shopaura.com</li>
                <li>Phone: +91 123 456 7890</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ShopAura. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
