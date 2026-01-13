import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { searchService } from '../services';
import { useNavigate } from 'react-router-dom';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    category: '',
    brand: '',
    rating: '',
    sort: 'relevance'
  });
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Search products
  const searchProducts = async (query, page = 1, customFilters = {}) => {
    try {
      setLoading(true);
      
      const searchFilters = {
        ...filters,
        ...customFilters,
        page,
        limit: 20
      };

      const response = await searchService.searchProducts(query, searchFilters);
      
      if (response.success) {
        setSearchResults(response.products);
        setTotalResults(response.total);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Autocomplete search
  const getAutocomplete = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await searchService.autocomplete(query);
      
      if (response.success) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error('Autocomplete failed:', error);
      setSuggestions([]);
    }
  }, []);

  // Handle search submission
  const handleSearch = (query) => {
    if (!query || !query.trim()) return;
    
    setSearchQuery(query);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    searchProducts(query);
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    
    // Re-search with new filters
    if (searchQuery) {
      searchProducts(searchQuery, 1, newFilters);
    }
  };

  // Clear filters
  const clearFilters = () => {
    const defaultFilters = {
      minPrice: '',
      maxPrice: '',
      category: '',
      brand: '',
      rating: '',
      sort: 'relevance'
    };
    
    setFilters(defaultFilters);
    
    if (searchQuery) {
      searchProducts(searchQuery, 1, defaultFilters);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSuggestions([]);
    setTotalResults(0);
    setCurrentPage(1);
  };

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    suggestions,
    filters,
    loading,
    totalResults,
    currentPage,
    searchProducts,
    getAutocomplete,
    handleSearch,
    updateFilters,
    clearFilters,
    clearSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

SearchProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default SearchContext;
