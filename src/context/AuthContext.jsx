import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import API from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await API.get('/auth/check');
      
      if (response.data.success && response.data.authenticated) {
        const userData = response.data.user;
        
        // IMPORTANT: Block sellers and admins from buyer frontend
        if (userData.role !== 'buyer') {
          toast.error('Sellers and admins cannot access the buyer portal. Redirecting...');
          await logout();
          setTimeout(() => {
            window.location.href = import.meta.env.VITE_ADMIN_PANEL_URL || 'http://localhost:5174';
          }, 2000);
          return;
        }
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const userData = response.data.user;
        
        // Check if user is buyer
        if (userData.role !== 'buyer') {
          toast.error('Sellers and admins must use the admin panel');
          await logout();
          
          // Redirect to admin panel
          setTimeout(() => {
            window.location.href = response.data.redirectTo || 'http://localhost:5174';
          }, 2000);
          
          return { success: false, message: 'Access denied' };
        }
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success(`Welcome back, ${userData.name}!`);
        return { success: true, user: userData };
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await API.post('/auth/register', {
        name,
        email,
        password,
        role: 'buyer' // Always register as buyer on frontend
      });
      
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success('Account created successfully!');
        return { success: true, user: userData };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuthStatus,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
