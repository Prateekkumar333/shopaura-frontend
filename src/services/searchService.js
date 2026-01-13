import API from './api';

// Search Services
export const searchService = {
  // Search products
  searchProducts: async (query, filters = {}) => {
    const params = new URLSearchParams({
      q: query,
      ...filters
    });
    
    const response = await API.get(`/search?${params.toString()}`);
    return response.data;
  },

  // Autocomplete search
  autocomplete: async (query) => {
    const response = await API.get(`/search/autocomplete?q=${query}`);
    return response.data;
  },

  // Get filter options
  getFilterOptions: async () => {
    const response = await API.get('/search/filters');
    return response.data;
  },

  // Advanced search with filters
  advancedSearch: async (searchParams) => {
    const response = await API.post('/search/advanced', searchParams);
    return response.data;
  }
};

export default searchService;
