import { useSearch as useSearchContext } from '../context/SearchContext';

// Custom hook for easier search access
export const useSearch = () => {
  const context = useSearchContext();
  
  return {
    query: context.searchQuery,
    setQuery: context.setSearchQuery,
    results: context.searchResults,
    suggestions: context.suggestions,
    filters: context.filters,
    loading: context.loading,
    total: context.totalResults,
    currentPage: context.currentPage,
    search: context.searchProducts,
    autocomplete: context.getAutocomplete,
    handleSearch: context.handleSearch,
    updateFilters: context.updateFilters,
    clearFilters: context.clearFilters,
    clearSearch: context.clearSearch
  };
};

export default useSearch;
