import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiGrid, FiChevronRight } from 'react-icons/fi';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await API.get('/categories');
      
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading categories..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shop by Category</h1>
          <p className="text-gray-600">Browse our wide range of product categories</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/category/${category.slug}`}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Category Image */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
                {category.image?.url || category.image ? (
                  <img
                    src={category.image?.url || category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiGrid className="text-indigo-300" size={64} />
                  </div>
                )}
                
                {/* Product Count Badge */}
                {category.productCount > 0 && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-gray-900">
                      {category.productCount} {category.productCount === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>
                )}
              </div>

              {/* Category Info */}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <FiChevronRight 
                    className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" 
                    size={20} 
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="text-center py-16">
            <FiGrid className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-600 text-lg">No categories available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
