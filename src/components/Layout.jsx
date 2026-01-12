// src/components/Layout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Cart from './Cart';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Main content area where child routes render */}
      <main className="grow">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Footer content */}
            <div className="space-y-4">
              <h3 className="text-4xl font-black">
                <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400">shop</span>
                <span className="bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-400">aura</span>
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Your trusted destination for quality products at unbeatable prices. Shop with confidence!
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-black text-xl mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/products" className="hover:text-white hover:translate-x-2 inline-block transition-all duration-300 font-medium">All Products</a></li>
                <li><a href="/products" className="hover:text-white hover:translate-x-2 inline-block transition-all duration-300 font-medium">Categories</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-2 inline-block transition-all duration-300 font-medium">About Us</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-2 inline-block transition-all duration-300 font-medium">Contact</a></li>
              </ul>
            </div>
            
            {/* Customer Service */}
            <div>
              <h4 className="font-black text-xl mb-6 text-white">Customer Service</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white hover:translate-x-2 inline-block transition-all duration-300 font-medium">Help Center</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-2 inline-block transition-all duration-300 font-medium">Track Order</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-2 inline-block transition-all duration-300 font-medium">Returns</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-2 inline-block transition-all duration-300 font-medium">Shipping Info</a></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h4 className="font-black text-xl mb-6 text-white">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white hover:translate-x-2 inline-block transition-all duration-300 font-medium">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-2 inline-block transition-all duration-300 font-medium">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-2 inline-block transition-all duration-300 font-medium">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-2 inline-block transition-all duration-300 font-medium">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 ShopAura. All rights reserved. Made with ❤️ in India</p>
          </div>
        </div>
      </footer>
      
      {/* Global Cart Sidebar */}
      <Cart />
    </div>
  );
}

export default Layout;
